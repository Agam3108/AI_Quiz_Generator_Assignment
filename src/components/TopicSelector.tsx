import { useState } from 'react';
import { PREDEFINED_TOPICS } from '../utils/quizTypes';

interface TopicSelectorProps {
    onSelectTopic: (topic: string, timerEnabled: boolean) => void;
    isLoading?: boolean;
}

export default function TopicSelector({ onSelectTopic, isLoading }: TopicSelectorProps) {
    const [customTopic, setCustomTopic] = useState('');
    const [timerEnabled, setTimerEnabled] = useState(true);

    const handleSelectTopic = (topic: string) => {
        if (!isLoading) {
            onSelectTopic(topic, timerEnabled);
        }
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customTopic.trim() && !isLoading) {
            onSelectTopic(customTopic.trim(), timerEnabled);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                    <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                        Quiz
                    </span>
                    <span className="text-white ml-2">Generator</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-md mx-auto">
                    Test your knowledge with AI-powered quizzes. Choose a topic to begin!
                </p>
            </div>

            {/* Topic Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl w-full mb-8">
                {PREDEFINED_TOPICS.map((topic) => (
                    <button
                        key={topic.id}
                        onClick={() => handleSelectTopic(topic.name)}
                        disabled={isLoading}
                        className={`
              group relative overflow-hidden rounded-2xl p-6
              bg-gradient-to-br ${topic.color}
              transform transition-all duration-300
              hover:scale-105 hover:shadow-lg hover:shadow-primary-500/25
              active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            `}
                    >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                        {/* Content */}
                        <div className="relative flex flex-col items-center gap-2">
                            <span className="text-4xl">{topic.icon}</span>
                            <span className="font-semibold text-white text-lg">{topic.name}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Divider */}
            <div className="flex items-center w-full max-w-md mb-6">
                <div className="flex-1 h-px bg-gray-700" />
                <span className="px-4 text-gray-500 text-sm">or enter your own</span>
                <div className="flex-1 h-px bg-gray-700" />
            </div>

            {/* Custom Topic Input */}
            <form onSubmit={handleCustomSubmit} className="w-full max-w-md">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Enter a custom topic..."
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        disabled={isLoading}
                        className="
              w-full px-5 py-4 rounded-xl
              bg-white/5 border border-white/10
              text-white placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              transition-all duration-200
              disabled:opacity-50
            "
                    />
                    <button
                        type="submit"
                        disabled={!customTopic.trim() || isLoading}
                        className="
              absolute right-2 top-1/2 -translate-y-1/2
              px-4 py-2 rounded-lg
              bg-primary-600 text-white font-medium
              hover:bg-primary-500 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                    >
                        Start
                    </button>
                </div>
            </form>

            {/* Timer Toggle */}
            <div className="mt-6 flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={timerEnabled}
                        onChange={(e) => setTimerEnabled(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="
            w-11 h-6 rounded-full
            bg-gray-700 peer-checked:bg-primary-600
            peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500
            after:content-[''] after:absolute after:top-[2px] after:left-[2px]
            after:bg-white after:rounded-full after:h-5 after:w-5
            after:transition-all peer-checked:after:translate-x-5
          " />
                </label>
                <span className="text-gray-400 text-sm">
                    {timerEnabled ? '⏱️ Timer enabled (30s per question)' : '⏱️ Timer disabled'}
                </span>
            </div>
        </div>
    );
}
