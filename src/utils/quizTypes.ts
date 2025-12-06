import { z } from 'zod';

// ============== Core Types ==============

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

export interface AnswerDetail {
    questionId: string;
    question: string;
    selectedIndex: number | null;
    correctIndex: number;
    isCorrect: boolean;
    explanation?: string;
}

export interface QuizResult {
    score: number;
    total: number;
    percentage: number;
    feedback: string;
    answers: AnswerDetail[];
    timeTaken: number; // seconds
}

export type AppScreen = 'topic' | 'loading' | 'quiz' | 'result';

export interface QuizState {
    screen: AppScreen;
    topic: string;
    questions: QuizQuestion[];
    currentIndex: number;
    answers: (number | null)[];
    startTime: number;
    result: QuizResult | null;
    error: string | null;
    timerEnabled: boolean;
}

// ============== Zod Schemas for API Validation ==============

export const QuizQuestionSchema = z.object({
    id: z.string(),
    question: z.string().min(10),
    options: z.array(z.string()).length(4),
    correctIndex: z.number().int().min(0).max(3),
    explanation: z.string().optional(),
});

export const QuizResponseSchema = z.object({
    questions: z.array(QuizQuestionSchema).min(1).max(10),
});

export const FeedbackResponseSchema = z.object({
    feedback: z.string().min(10),
});

// ============== API Request Types ==============

export interface GenerateQuizRequest {
    topic: string;
    count: number;
    difficulty: 'easy' | 'medium' | 'hard';
    seed?: number;
}

export interface GenerateFeedbackRequest {
    topic: string;
    score: number;
    total: number;
    percentage: number;
    wrongAnswers: {
        question: string;
        userAnswer: string;
        correctAnswer: string;
    }[];
}

// ============== Predefined Topics ==============

export const PREDEFINED_TOPICS = [
    { id: 'javascript', name: 'JavaScript', icon: '🟨', color: 'from-yellow-500 to-yellow-600' },
    { id: 'react', name: 'React', icon: '⚛️', color: 'from-cyan-500 to-cyan-600' },
    { id: 'python', name: 'Python', icon: '🐍', color: 'from-green-500 to-green-600' },
    { id: 'typescript', name: 'TypeScript', icon: '🔷', color: 'from-blue-500 to-blue-600' },
    { id: 'css', name: 'CSS', icon: '🎨', color: 'from-pink-500 to-pink-600' },
    { id: 'data-structures', name: 'Data Structures', icon: '🌳', color: 'from-purple-500 to-purple-600' },
] as const;

// ============== Constants ==============

export const QUIZ_CONFIG = {
    questionsPerQuiz: 5,
    defaultTimePerQuestion: 30, // seconds
    maxRetries: 3,
    retryDelay: 1000, // ms
    apiTimeout: 30000, // ms
} as const;
