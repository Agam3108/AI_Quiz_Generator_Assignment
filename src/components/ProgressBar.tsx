interface ProgressBarProps {
    current: number;
    total: number;
    answeredCount: number;
}

export default function ProgressBar({ current, total, answeredCount }: ProgressBarProps) {
    const progressPercent = ((current + 1) / total) * 100;

    return (
        <div className="w-full">
            {/* Question counter */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-400">
                    Question <span className="text-white font-semibold">{current + 1}</span> of {total}
                </span>
                <span className="text-sm text-gray-400">
                    <span className="text-primary-400 font-semibold">{answeredCount}</span> answered
                </span>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="absolute h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${progressPercent}%` }}
                />
                {/* Shimmer effect */}
                <div
                    className="absolute h-full w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{
                        left: `${progressPercent - 10}%`,
                        opacity: progressPercent > 0 ? 1 : 0,
                    }}
                />
            </div>

            {/* Question dots */}
            <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: total }).map((_, i) => (
                    <button
                        key={i}
                        className={`
              w-3 h-3 rounded-full transition-all duration-200
              ${i === current
                                ? 'bg-primary-500 scale-125 ring-2 ring-primary-500/50'
                                : i < current
                                    ? 'bg-primary-700'
                                    : 'bg-gray-700'
                            }
            `}
                        aria-label={`Question ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
