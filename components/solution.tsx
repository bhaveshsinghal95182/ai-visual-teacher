import React, { useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { speak, stopSpeaking } from '../services/speech';

interface SolutionProps {
    solution: string;
    onToggleSpeech: (speaking: boolean) => void;
    isSpeaking: boolean;
}

export function Solution({
    solution,
    onToggleSpeech,
    isSpeaking,
}: SolutionProps) {
    useEffect(() => {
        return () => stopSpeaking();
    }, []);

    const handleToggleSpeech = () => {
        if (isSpeaking) {
            stopSpeaking();
            onToggleSpeech(false);
        } else {
            speak(solution, () => onToggleSpeech(false));
            onToggleSpeech(true);
        }
    };

    return (
        
        <div className="w-full bg-zinc-750 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-200">Solution:</h2>
                    <button
                        onClick={handleToggleSpeech}
                        className="p-2 px-6 hover:bg-zinc-500 rounded-full transition-colors"
                        aria-label={isSpeaking ? "Stop speaking" : "Start speaking"}
                    >
                        {isSpeaking ? (
                            <VolumeX className="w-5 h-5 text-white" />
                        ) : (
                            <Volume2 className="w-5 h-5 text-white" />
                        )}
                    </button>
                </div>
                <div className="prose max-w-none text-white">
                    <ReactMarkdown>{solution}</ReactMarkdown>
                </div>
        </div>
    );
}
