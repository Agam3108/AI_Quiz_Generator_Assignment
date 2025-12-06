interface LoadingScreenProps {
    topic: string;
    message?: string;
}

export default function LoadingScreen({ topic, message = 'Generating your quiz...' }: LoadingScreenProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in">
            {/* Animated loader */}
            <div className="relative mb-8">
                {/* Outer ring */}
                <div className="w-24 h-24 rounded-full border-4 border-primary-900 animate-pulse" />

                {/* Spinning ring */}
                <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />

                {/* Inner glow */}
                <div className="absolute inset-4 w-16 h-16 rounded-full bg-primary-500/20 blur-md animate-pulse" />

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl">🧠</span>
                </div>
            </div>

            {/* Topic */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                    {topic}
                </h2>
                <p className="text-gray-400">{message}</p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2 mt-8">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-3 h-3 rounded-full bg-primary-500"
                        style={{
                            animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                        }}
                    />
                ))}
            </div>

            {/* Fun facts */}
            <div className="mt-12 glass-card rounded-xl p-4 max-w-sm text-center">
                <p className="text-gray-400 text-sm">
                    💡 <span className="text-gray-300">Did you know?</span> AI can generate
                    thousands of unique quiz questions in seconds!
                </p>
            </div>
        </div>
    );
}
