import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
    QuizQuestion,
    GenerateQuizRequest,
    GenerateFeedbackRequest,
} from '../utils/quizTypes';
import {
    QuizResponseSchema,
    FeedbackResponseSchema,
    QUIZ_CONFIG,
} from '../utils/quizTypes';

// ============== Gemini Client ==============

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.warn('⚠️ Gemini API key not configured. Please add your key to .env file.');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// ============== Error Types ==============

export class APIError extends Error {
    status?: number;
    retryable: boolean;

    constructor(
        message: string,
        status?: number,
        retryable: boolean = true
    ) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.retryable = retryable;
    }
}

// ============== Retry Logic ==============

async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = QUIZ_CONFIG.maxRetries,
    delay: number = QUIZ_CONFIG.retryDelay
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // Don't retry non-retryable errors
            if (error instanceof APIError && !error.retryable) {
                throw error;
            }

            // Wait before retrying (exponential backoff)
            if (attempt < maxRetries - 1) {
                await new Promise(resolve =>
                    setTimeout(resolve, delay * Math.pow(2, attempt))
                );
            }
        }
    }

    throw lastError || new APIError('Max retries exceeded');
}

// ============== Prompt Templates ==============

const QUIZ_PROMPT = (topic: string, count: number, difficulty: string) => `
Generate exactly ${count} multiple choice questions about "${topic}" at ${difficulty} difficulty level.

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "questions": [
    {
      "id": "q1",
      "question": "Your question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this answer is correct"
    }
  ]
}

Requirements:
- Each question must have exactly 4 options
- correctIndex is 0-based (0, 1, 2, or 3)
- Questions should be educational and accurate
- Explanations should be concise but helpful
- Make questions progressively challenging
- Ensure only one correct answer per question
`;

const FEEDBACK_PROMPT = (
    topic: string,
    score: number,
    total: number,
    percentage: number,
    wrongAnswers: { question: string; userAnswer: string; correctAnswer: string }[]
) => `
Generate personalized feedback for a quiz result.

Topic: ${topic}
Score: ${score}/${total} (${percentage}%)

${wrongAnswers.length > 0 ? `
Questions answered incorrectly:
${wrongAnswers.map((w, i) => `${i + 1}. "${w.question}"
   - User answered: "${w.userAnswer}"
   - Correct answer: "${w.correctAnswer}"`).join('\n')}
` : 'All questions were answered correctly!'}

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "feedback": "Your personalized feedback message here"
}

Requirements:
- Be encouraging and constructive
- If score is high (≥80%), celebrate the achievement
- If score is medium (50-79%), acknowledge effort and suggest areas to review
- If score is low (<50%), be motivating and offer specific study tips
- Reference the topic and specific concepts if possible
- Keep feedback to 2-3 sentences, friendly tone
- Use 1-2 relevant emojis
`;

// ============== JSON Parsing Helper ==============

function extractJSON(text: string): string {
    // Try to find JSON in the response (handles markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return jsonMatch[0];
    }
    return text;
}

// ============== API Functions ==============

/**
 * Generates quiz questions for a given topic using Gemini AI.
 */
export async function generateQuiz(
    request: GenerateQuizRequest
): Promise<QuizQuestion[]> {
    // Check if API key is configured
    if (!API_KEY || API_KEY === 'your_api_key_here') {
        throw new APIError(
            'Gemini API key not configured. Please add your key to .env file.',
            401,
            false
        );
    }

    return withRetry(async () => {
        try {
            const prompt = QUIZ_PROMPT(request.topic, request.count, request.difficulty);
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Parse JSON from response
            const jsonText = extractJSON(text);
            const data = JSON.parse(jsonText);

            // Validate with Zod schema
            const validated = QuizResponseSchema.parse(data);
            return validated.questions;
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new APIError('Failed to parse AI response as JSON', 500, true);
            }
            if (error instanceof Error && error.message.includes('API key')) {
                throw new APIError('Invalid Gemini API key', 401, false);
            }
            throw new APIError(
                `Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500,
                true
            );
        }
    });
}

/**
 * Generates personalized feedback based on quiz results using Gemini AI.
 */
export async function generateFeedback(
    request: GenerateFeedbackRequest
): Promise<string> {
    // Check if API key is configured
    if (!API_KEY || API_KEY === 'your_api_key_here') {
        throw new APIError(
            'Gemini API key not configured. Please add your key to .env file.',
            401,
            false
        );
    }

    return withRetry(async () => {
        try {
            const prompt = FEEDBACK_PROMPT(
                request.topic,
                request.score,
                request.total,
                request.percentage,
                request.wrongAnswers
            );
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Parse JSON from response
            const jsonText = extractJSON(text);
            const data = JSON.parse(jsonText);

            // Validate with Zod schema
            const validated = FeedbackResponseSchema.parse(data);
            return validated.feedback;
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new APIError('Failed to parse AI response as JSON', 500, true);
            }
            throw new APIError(
                `Failed to generate feedback: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500,
                true
            );
        }
    });
}
