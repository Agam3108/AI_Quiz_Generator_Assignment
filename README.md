# 🧠 AI Quiz Generator

An interactive, AI-powered quiz application that generates customized multiple-choice questions on any topic using Google's Gemini AI. Built with React, TypeScript, and Tailwind CSS.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.0-4285F4?logo=google&logoColor=white)

---

## 📋 Table of Contents

- [Problem Understanding](#-problem-understanding)
- [Features](#-features)
- [Project Setup & Demo](#-project-setup--demo)
- [Architecture & Code Structure](#-architecture--code-structure)
- [AI Prompts & Iterations](#-ai-prompts--iterations)
- [Screenshots](#-screenshots)
- [Known Issues & Improvements](#-known-issues--improvements)
- [Bonus Features](#-bonus-features)

---

## 🎯 Problem Understanding

### Objective
Build a small interactive quiz application with the following screens:
1. **Topic Selection** - User selects or enters a quiz topic
2. **Loading Screen** - AI generates questions with visual feedback
3. **Question Viewer** - One-by-one question display with navigation and optional timer
4. **Results Screen** - Score display with AI-generated personalized feedback

### Assumptions Made
- Users have stable internet connection for AI API calls
- Quiz consists of 5 multiple-choice questions with exactly 4 options each
- Timer is optional (30 seconds per question when enabled)
- Gemini AI API key is provided by the user via `.env` file
- Modern browser with ES6+ support

---

## ✨ Features

- 🎨 **6 Pre-defined Topics**: JavaScript, React, Python, TypeScript, CSS, Data Structures
- ✏️ **Custom Topics**: Enter any topic for quiz generation
- ⏱️ **Optional Timer**: 30-second countdown per question (toggleable)
- 🔄 **Smart Navigation**: Previous/Next buttons with progress tracking
- 📊 **Progress Bar**: Visual indicator of quiz completion
- 🤖 **AI Feedback**: Personalized performance analysis based on score
- 📝 **Answer Review**: Detailed breakdown with explanations
- 🎭 **Dark Mode**: Premium dark theme with glassmorphism effects
- ⚡ **Retry Logic**: Automatic retries with exponential backoff

---

## 🚀 Project Setup & Demo

### Prerequisites
- Node.js 18+ installed
- A Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/AI_Quiz_Generator.git
cd AI_Quiz_Generator

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# OR create .env manually with:
# VITE_GEMINI_API_KEY=your_api_key_here

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

### Demo
<!-- Add your demo link or screen recording here -->
> 🎬[Screen Recording](https://drive.google.com/file/d/1WTDuVqf7pRoCASek3yqNM4govHwA_4p2/view?usp=sharing)

---

## 🏗️ Architecture & Code Structure

```
src/
├── App.tsx                    # Root component
├── main.tsx                   # Entry point
├── index.css                  # Global styles & Tailwind config
├── pages/
│   └── index.tsx              # Main QuizApp component (State Management Hub)
├── components/
│   ├── TopicSelector.tsx      # Topic selection screen
│   ├── LoadingScreen.tsx      # AI generation loading state
│   ├── QuestionCard.tsx       # Question display with timer
│   ├── ProgressBar.tsx        # Quiz progress indicator
│   └── ResultScreen.tsx       # Score & feedback display
├── services/
│   └── api.ts                 # Gemini AI integration & API calls
└── utils/
    └── quizTypes.ts           # TypeScript types & Zod schemas
```

### State Management

The application uses **React's built-in `useState` hook** for state management, centralized in `pages/index.tsx`. This approach was chosen because:

1. **Simplicity**: Single component manages all quiz state
2. **No External Dependencies**: No need for Redux, Zustand, or other state libraries
3. **Type Safety**: Full TypeScript integration with defined interfaces
4. **Predictable Flow**: Unidirectional data flow from parent to children

```typescript
interface QuizState {
    screen: AppScreen;          // Current screen: 'topic' | 'loading' | 'quiz' | 'result'
    topic: string;              // Selected quiz topic
    questions: QuizQuestion[];  // AI-generated questions
    currentIndex: number;       // Current question index
    answers: (number | null)[]; // User's selected answers
    startTime: number;          // Quiz start timestamp
    result: QuizResult | null;  // Final quiz results
    error: string | null;       // Error messages
    timerEnabled: boolean;      // Timer toggle state
    isLoadingFeedback: boolean; // Feedback generation state
}
```

### Component Architecture

```
App.tsx
└── QuizApp (pages/index.tsx) ──────────────────┐
    ├── TopicSelector    [screen: 'topic']      │ State flows down
    ├── LoadingScreen    [screen: 'loading']    │ as props
    ├── QuestionCard     [screen: 'quiz']       │
    │   └── ProgressBar                         │
    └── ResultScreen     [screen: 'result']     │
                                                │
    ▲ Callbacks flow up via props ──────────────┘
```

### API Service Layer

`services/api.ts` handles all AI interactions:

- **`generateQuiz()`**: Creates quiz questions using Gemini AI
- **`generateFeedback()`**: Generates personalized feedback
- **`withRetry()`**: Implements retry logic with exponential backoff
- **`APIError`**: Custom error class for error handling

### Data Validation

Uses **Zod schemas** for runtime validation of AI responses:

```typescript
const QuizQuestionSchema = z.object({
    id: z.string(),
    question: z.string().min(10),
    options: z.array(z.string()).length(4),
    correctIndex: z.number().int().min(0).max(3),
    explanation: z.string().optional(),
});
```

---

## 🤖 AI Prompts & Iterations

### Quiz Generation Prompt

#### Initial Prompt
```
Generate 5 multiple choice questions about {topic}.
```

**Issues Faced:**
- Inconsistent response format
- Variable number of options
- Missing explanations
- Markdown code blocks wrapping JSON

#### Refined Prompt (Final)
```
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
```

**Improvements:**
- ✅ Explicit JSON structure with example
- ✅ Exact option count specification
- ✅ 0-based index clarification
- ✅ "No markdown" instruction
- ✅ Quality requirements included

---

### Feedback Generation Prompt

#### Initial Prompt
```
Give feedback for a quiz score of {score}/{total}.
```

**Issues Faced:**
- Generic, non-personalized responses
- Inconsistent tone
- No topic context

#### Refined Prompt (Final)
```
Generate personalized feedback for a quiz result.

Topic: ${topic}
Score: ${score}/${total} (${percentage}%)

Questions answered incorrectly:
${wrongAnswers.map((w, i) => `${i + 1}. "${w.question}"
   - User answered: "${w.userAnswer}"
   - Correct answer: "${w.correctAnswer}"`).join('\n')}

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
```

**Improvements:**
- ✅ Context-aware with wrong answer details
- ✅ Score-tiered response guidelines
- ✅ Topic-specific feedback
- ✅ Tone and length specifications
- ✅ Emoji guidance for engagement

---

### JSON Extraction Helper

To handle edge cases where AI wraps responses in markdown:

```typescript
function extractJSON(text: string): string {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return jsonMatch[0];
    }
    return text;
}
```

---

## 📸 Screenshots


### 1. Loading Screen
 ![Loading Screen](./public/Screenshots/Loading) 
> *Animated loading state while AI generates quiz questions.*

### 2. Question Screen
![Question Screen](./public/Screenshots/Question) 
> *One question at a time with A/B/C/D options, progress bar, and optional timer.*

### 3. Results Screen
 ![Results Screen](./public/Screenshots/Result) 
> *Score display with AI-generated feedback and detailed answer review.*

### 3. Feedback Screen
 ![Results Screen](./public/Screenshots/Feedback) 

---

## ⚠️ Known Issues & Improvements

### Known Issues

| Issue | Description | Status |
|-------|-------------|--------|
| 🔴 API Key Exposure | API key is exposed in client-side code | Mitigated via env vars |
| 🟡 Timer State | Timer doesn't persist if navigating away | By design |
| 🟡 Mobile Keyboard | Custom topic input may push content on mobile | Minor UI issue |
| 🟢 Response Parsing | Occasional JSON parsing failures from AI | Handled with retry |

### Potential Improvements

With more time, the following enhancements could be made:

1. **Backend Proxy**: Move API calls to a backend to secure the API key
2. **Question Caching**: Store previously generated questions for offline use
3. **Difficulty Selection**: Let users choose easy/medium/hard difficulty
4. **Quiz History**: Save past quiz attempts with localStorage
5. **Leaderboard**: Compare scores with other users
6. **Accessibility**: Add ARIA labels and keyboard navigation
7. **Internationalization**: Support multiple languages
8. **Share Results**: Social media sharing of quiz results
9. **Sound Effects**: Audio feedback for correct/incorrect answers
10. **Animations**: Page transitions using Framer Motion

---

## 🎁 Bonus Features

The following extra polish was added beyond the basic requirements:

### ✅ Visual Enhancements
- **Glassmorphism Design**: Modern glass-card effects with backdrop blur
- **Gradient Accents**: Topic cards with unique gradient colors
- **Micro-animations**: Hover effects, button scaling, and loading animations
- **Responsive Layout**: Works seamlessly on mobile, tablet, and desktop

### ✅ UX Improvements
- **Timer Color Coding**: Green → Yellow → Red as time decreases
- **Answer Review**: Detailed breakdown of each question with explanations
- **Progress Tracking**: Visual progress bar with answered count indicator
- **Error Toast**: User-friendly error messages with dismiss option

### ✅ Technical Extras
- **Zod Validation**: Runtime schema validation for AI responses
- **Exponential Backoff**: Smart retry logic for API failures
- **Type Safety**: Comprehensive TypeScript types throughout
- **Config Constants**: Centralized configuration for easy tweaking

```typescript
export const QUIZ_CONFIG = {
    questionsPerQuiz: 5,
    defaultTimePerQuestion: 30,
    maxRetries: 3,
    retryDelay: 1000,
    apiTimeout: 30000,
};
```

---

## 📄 License

MIT License - feel free to use this project for learning or building upon!

---

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powering quiz generation
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Vite](https://vitejs.dev/) for lightning-fast development
- [Zod](https://zod.dev/) for schema validation
