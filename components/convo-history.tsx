import React from 'react';
import { Trash2 } from 'lucide-react';
import { getSessionHistory, clearSession } from '../services/gemini';

export const History = () => {
    const [history, setHistory] = React.useState(getSessionHistory());

    const handleClearHistory = () => {
        clearSession();
        setHistory([]);
    };

    // Update history when new messages are added
    React.useEffect(() => {
        const intervalId = setInterval(() => {
            const currentHistory = getSessionHistory();
            if (JSON.stringify(currentHistory) !== JSON.stringify(history)) {
                setHistory(currentHistory);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [history]);

    if (history.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-4xl mx-auto mb-6">
            <div className="bg-zinc-900 rounded-lg p-4 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white">Conversation History</h2>
                    <button
                        onClick={handleClearHistory}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/40"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear History
                    </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {history.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-lg ${msg.role === 'user'
                                    ? 'bg-green-900 text-white'
                                    : 'bg-zinc-800 text-white'
                                }`}
                        >
                            <div className="text-sm font-medium mb-1 text-slate-300">
                                {msg.role === 'user' ? 'You' : 'Assistant'}
                            </div>
                            <div className="text-sm">
                                {msg.imageData ? (
                                    <span className="italic">Uploaded an image</span>
                                ) : (
                                    msg.content
                                )}
                            </div>
                            <div className="text-xs text-slate-300 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};