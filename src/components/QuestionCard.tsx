import { useState, useEffect, useCallback } from 'react';
import type { QuizQuestion } from '../utils/quizTypes';
import ProgressBar from './ProgressBar';

interface QuestionCardProps {
    question: QuizQuestion;
    questionNumber: number;
    totalQuestions: number;
    selectedAnswer: number | null;
    answeredCount: number;
    onSelectAnswer: (index: number) => void;
    onNext: () => void;
    onPrev: () => void;
    onSubmit: () => void;
    timerEnabled?: boolean;
    timePerQuestion?: number;
    onTimeUp?: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export default function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    selectedAnswer,
    answeredCount,
    onSelectAnswer,
    onNext,
    onPrev,
    onSubmit,
    timerEnabled = false,
    timePerQuestion = 30,
    onTimeUp,
    isFirst,
    isLast,
}: QuestionCardProps) {
    const [timeLeft, setTimeLeft] = useState(timePerQuestion);
    const [isAnimating, setIsAnimating] = useState(false);

    // Reset timer when question changes
    useEffect(() => {
        if (timerEnabled) {
            setTimeLeft(timePerQuestion);
        }
    }, [questionNumber, timerEnabled, timePerQuestion]);

    // Timer countdown
    useEffect(() => {
        if (!timerEnabled || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onTimeUp?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timerEnabled, timeLeft, onTimeUp]);

    const handleSelectAnswer = useCallback((index: number) => {
        setIsAnimating(true);
        onSelectAnswer(index);
        setTimeout(() => setIsAnimating(false), 200);
    }, [onSelectAnswer]);

    const getTimerColor = () => {
        if (timeLeft > 20) return 'text-green-400';
        if (timeLeft > 10) return 'text-yellow-400';
        return 'text-red-400 animate-pulse';
    };

    const optionLabels = ['A', 'B', 'C', 'D'];

    return (
        <div className="min-h-screen flex flex-col p-6 animate-fade-in">
            {/* Header with timer */}
            <div className="max-w-2xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-semibold text-white/80">Quiz in Progress</h1>
                    {timerEnabled && (
                        <div className={`flex items-center gap-2 font-mono text-2xl font-bold ${getTimerColor()}`}>
                            <span>⏱️</span>
                            <span>{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</span>
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <ProgressBar
                    current={questionNumber}
                    total={totalQuestions}
                    answeredCount={answeredCount}
                />
            </div>

            {/* Question card */}
            <div className="flex-1 flex items-center justify-center py-8">
                <div className={`
          w-full max-w-2xl glass-card rounded-3xl p-8
          transition-transform duration-200
          ${isAnimating ? 'scale-[0.98]' : ''}
        `}>
                    {/* Question */}
                    <div className="mb-8">
                        <span className="text-primary-400 text-sm font-medium mb-2 block">
                            Question {questionNumber + 1}
                        </span>
                        <h2 className="text-2xl font-bold text-white leading-relaxed">
                            {question.question}
                        </h2>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelectAnswer(index)}
                                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl
                  text-left transition-all duration-200
                  ${selectedAnswer === index
                                        ? 'bg-primary-600 border-2 border-primary-400 text-white shadow-lg shadow-primary-500/25'
                                        : 'bg-white/5 border-2 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                                    }
                `}
                            >
                                {/* Option label */}
                                <span className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  font-bold text-lg shrink-0
                  ${selectedAnswer === index
                                        ? 'bg-white/20 text-white'
                                        : 'bg-white/10 text-gray-400'
                                    }
                `}>
                                    {optionLabels[index]}
                                </span>
                                {/* Option text */}
                                <span className="text-lg">{option}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="max-w-2xl mx-auto w-full flex justify-between items-center">
                <button
                    onClick={onPrev}
                    disabled={isFirst}
                    className={`
            flex items-center gap-2 px-6 py-3 rounded-xl
            font-medium transition-all duration-200
            ${isFirst
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
          `}
                >
                    <span>←</span>
                    <span>Previous</span>
                </button>

                {isLast ? (
                    <button
                        onClick={onSubmit}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-200 bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-lg hover:shadow-green-500/25"
                    >
                        <span>Submit Quiz</span>
                        <span>✓</span>
                    </button>
                ) : (
                    <button
                        onClick={onNext}
                        className="
              flex items-center gap-2 px-6 py-3 rounded-xl
              bg-primary-600 text-white font-medium
              hover:bg-primary-500 transition-all duration-200
              hover:shadow-lg hover:shadow-primary-500/25
            "
                    >
                        <span>Next</span>
                        <span>→</span>
                    </button>
                )}
            </div>
        </div>
    );
}
