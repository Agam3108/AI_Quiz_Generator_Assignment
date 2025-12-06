import type { QuizResult } from '../utils/quizTypes';

interface ResultScreenProps {
    result: QuizResult;
    topic: string;
    onRetry: () => void;
    onNewTopic: () => void;
    isLoadingFeedback?: boolean;
}

export default function ResultScreen({
    result,
    topic,
    onRetry,
    onNewTopic,
    isLoadingFeedback = false,
}: ResultScreenProps) {
    const { score, total, percentage, feedback, answers, timeTaken } = result;

    const getScoreEmoji = () => {
        if (percentage >= 80) return '🏆';
        if (percentage >= 60) return '🎉';
        if (percentage >= 40) return '📚';
        return '💪';
    };

    const getScoreColor = () => {
        if (percentage >= 80) return 'from-green-500 to-emerald-400';
        if (percentage >= 60) return 'from-blue-500 to-cyan-400';
        if (percentage >= 40) return 'from-yellow-500 to-orange-400';
        return 'from-red-500 to-pink-400';
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-6 py-12 animate-fade-in">
            {/* Score Card */}
            <div className="glass-card rounded-3xl p-8 max-w-lg w-full text-center mb-8">
                {/* Emoji */}
                <div className="text-6xl mb-4 animate-bounce-slow">{getScoreEmoji()}</div>

                {/* Score */}
                <div className={`text-6xl font-bold bg-gradient-to-r ${getScoreColor()} bg-clip-text text-transparent mb-2`}>
                    {score}/{total}
                </div>
                <div className="text-2xl text-gray-400 mb-4">{percentage}% Correct</div>

                {/* Topic & Time */}
                <div className="flex justify-center gap-6 text-sm text-gray-500">
                    <span>📝 {topic}</span>
                    <span>⏱️ {formatTime(timeTaken)}</span>
                </div>
            </div>

            {/* AI Feedback */}
            <div className="glass-card rounded-2xl p-6 max-w-lg w-full mb-8">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <span>🤖</span>
                    <span>AI Feedback</span>
                </h3>
                {isLoadingFeedback ? (
                    <div className="flex items-center gap-3 text-gray-400">
                        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        <span>Generating personalized feedback...</span>
                    </div>
                ) : (
                    <p className="text-gray-300 leading-relaxed">{feedback}</p>
                )}
            </div>

            {/* Answer Review */}
            <div className="max-w-lg w-full mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Answer Review</h3>
                <div className="space-y-3">
                    {answers.map((answer, index) => (
                        <div
                            key={answer.questionId}
                            className={`
                glass rounded-xl p-4
                border-l-4 ${answer.isCorrect ? 'border-green-500' : 'border-red-500'}
              `}
                        >
                            <div className="flex items-start gap-3">
                                {/* Status icon */}
                                <span className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0
                  ${answer.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}
                `}>
                                    {answer.isCorrect ? '✓' : '✗'}
                                </span>

                                {/* Question details */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium mb-2 line-clamp-2">
                                        {index + 1}. {answer.question}
                                    </p>
                                    {!answer.isCorrect && answer.selectedIndex !== null && (
                                        <p className="text-red-400 text-sm mb-1">
                                            Your answer: Option {['A', 'B', 'C', 'D'][answer.selectedIndex]}
                                        </p>
                                    )}
                                    {!answer.isCorrect && (
                                        <p className="text-green-400 text-sm">
                                            Correct: Option {['A', 'B', 'C', 'D'][answer.correctIndex]}
                                        </p>
                                    )}
                                    {answer.explanation && (
                                        <p className="text-gray-500 text-sm mt-2 italic">
                                            💡 {answer.explanation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={onRetry}
                    className="
            flex items-center gap-2 px-6 py-3 rounded-xl
            bg-white/5 border border-white/10 text-white
            hover:bg-white/10 transition-all duration-200
          "
                >
                    <span>🔄</span>
                    <span>Try Again</span>
                </button>
                <button
                    onClick={onNewTopic}
                    className="
            flex items-center gap-2 px-6 py-3 rounded-xl
            bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium
            hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200
          "
                >
                    <span>📚</span>
                    <span>New Topic</span>
                </button>
            </div>
        </div>
    );
}
