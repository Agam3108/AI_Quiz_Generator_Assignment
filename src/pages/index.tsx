import { useState, useCallback } from 'react';
import TopicSelector from '../components/TopicSelector';
import LoadingScreen from '../components/LoadingScreen';
import QuestionCard from '../components/QuestionCard';
import ResultScreen from '../components/ResultScreen';
import { generateQuiz, generateFeedback, APIError } from '../services/api';
import type {
    QuizQuestion,
    QuizResult,
    AppScreen,
    AnswerDetail,
} from '../utils/quizTypes';
import { QUIZ_CONFIG } from '../utils/quizTypes';

interface QuizState {
    screen: AppScreen;
    topic: string;
    questions: QuizQuestion[];
    currentIndex: number;
    answers: (number | null)[];
    startTime: number;
    result: QuizResult | null;
    error: string | null;
    timerEnabled: boolean;
    isLoadingFeedback: boolean;
}

const initialState: QuizState = {
    screen: 'topic',
    topic: '',
    questions: [],
    currentIndex: 0,
    answers: [],
    startTime: 0,
    result: null,
    error: null,
    timerEnabled: true,
    isLoadingFeedback: false,
};

export default function QuizApp() {
    const [state, setState] = useState<QuizState>(initialState);

    // Start quiz with a topic
    const handleSelectTopic = useCallback(async (topic: string, timerEnabled: boolean) => {
        setState((prev) => ({
            ...prev,
            screen: 'loading',
            topic,
            timerEnabled,
            error: null,
        }));

        try {
            const questions = await generateQuiz({
                topic,
                count: QUIZ_CONFIG.questionsPerQuiz,
                difficulty: 'medium',
                seed: Date.now(),
            });

            setState((prev) => ({
                ...prev,
                screen: 'quiz',
                questions,
                answers: new Array(questions.length).fill(null),
                startTime: Date.now(),
                currentIndex: 0,
            }));
        } catch (error) {
            const message = error instanceof APIError
                ? error.message
                : 'Failed to generate quiz. Please try again.';

            setState((prev) => ({
                ...prev,
                screen: 'topic',
                error: message,
            }));
        }
    }, []);

    // Select an answer
    const handleSelectAnswer = useCallback((index: number) => {
        setState((prev) => {
            const newAnswers = [...prev.answers];
            newAnswers[prev.currentIndex] = index;
            return { ...prev, answers: newAnswers };
        });
    }, []);

    // Navigate to next question
    const handleNext = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentIndex: Math.min(prev.currentIndex + 1, prev.questions.length - 1),
        }));
    }, []);

    // Navigate to previous question
    const handlePrev = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentIndex: Math.max(prev.currentIndex - 1, 0),
        }));
    }, []);

    // Handle time up for current question
    const handleTimeUp = useCallback(() => {
        setState((prev) => {
            // If not answered, move to next question (or submit if last)
            if (prev.currentIndex < prev.questions.length - 1) {
                return { ...prev, currentIndex: prev.currentIndex + 1 };
            }
            return prev;
        });
    }, []);

    // Submit quiz and calculate results
    const handleSubmit = useCallback(async () => {
        const endTime = Date.now();
        const { questions, answers, startTime, topic } = state;

        // Calculate score
        let score = 0;
        const answerDetails: AnswerDetail[] = questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctIndex;
            if (isCorrect) score++;

            return {
                questionId: q.id,
                question: q.question,
                selectedIndex: answers[i],
                correctIndex: q.correctIndex,
                isCorrect,
                explanation: q.explanation,
            };
        });

        const percentage = Math.round((score / questions.length) * 100);
        const timeTaken = Math.round((endTime - startTime) / 1000);

        // Show result screen with loading feedback
        setState((prev) => ({
            ...prev,
            screen: 'result',
            isLoadingFeedback: true,
            result: {
                score,
                total: questions.length,
                percentage,
                feedback: '',
                answers: answerDetails,
                timeTaken,
            },
        }));

        // Generate AI feedback
        try {
            const wrongAnswers = answerDetails
                .filter((a) => !a.isCorrect)
                .map((a) => ({
                    question: a.question,
                    userAnswer: a.selectedIndex !== null
                        ? questions.find(q => q.id === a.questionId)?.options[a.selectedIndex] || 'Not answered'
                        : 'Not answered',
                    correctAnswer: questions.find(q => q.id === a.questionId)?.options[a.correctIndex] || '',
                }));

            const feedback = await generateFeedback({
                topic,
                score,
                total: questions.length,
                percentage,
                wrongAnswers,
            });

            setState((prev) => ({
                ...prev,
                isLoadingFeedback: false,
                result: prev.result ? { ...prev.result, feedback } : null,
            }));
        } catch {
            setState((prev) => ({
                ...prev,
                isLoadingFeedback: false,
                result: prev.result
                    ? { ...prev.result, feedback: 'Unable to generate feedback. Great effort completing the quiz!' }
                    : null,
            }));
        }
    }, [state]);

    // Retry same topic
    const handleRetry = useCallback(() => {
        handleSelectTopic(state.topic, state.timerEnabled);
    }, [handleSelectTopic, state.topic, state.timerEnabled]);

    // Go back to topic selection
    const handleNewTopic = useCallback(() => {
        setState(initialState);
    }, []);

    // Count answered questions
    const answeredCount = state.answers.filter((a) => a !== null).length;

    // Render current screen
    switch (state.screen) {
        case 'loading':
            return <LoadingScreen topic={state.topic} />;

        case 'quiz':
            return (
                <QuestionCard
                    question={state.questions[state.currentIndex]}
                    questionNumber={state.currentIndex}
                    totalQuestions={state.questions.length}
                    selectedAnswer={state.answers[state.currentIndex]}
                    answeredCount={answeredCount}
                    onSelectAnswer={handleSelectAnswer}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    onSubmit={handleSubmit}
                    timerEnabled={state.timerEnabled}
                    timePerQuestion={QUIZ_CONFIG.defaultTimePerQuestion}
                    onTimeUp={handleTimeUp}
                    isFirst={state.currentIndex === 0}
                    isLast={state.currentIndex === state.questions.length - 1}
                />
            );

        case 'result':
            return state.result ? (
                <ResultScreen
                    result={state.result}
                    topic={state.topic}
                    onRetry={handleRetry}
                    onNewTopic={handleNewTopic}
                    isLoadingFeedback={state.isLoadingFeedback}
                />
            ) : null;

        default:
            return (
                <div className="relative">
                    {state.error && (
                        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-6 py-3 rounded-xl flex items-center gap-3">
                                <span>⚠️</span>
                                <span>{state.error}</span>
                                <button
                                    onClick={() => setState((prev) => ({ ...prev, error: null }))}
                                    className="ml-2 text-red-400 hover:text-red-300"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}
                    <TopicSelector onSelectTopic={handleSelectTopic} />
                </div>
            );
    }
}
