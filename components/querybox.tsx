import React, { useState } from 'react';
import { updateSessionData } from '../services/gemini'; // Ensure this import path is correct
import { ChatMessage } from '../types/chat-message'; // Import ChatMessage type

interface QueryBoxProps {
    onNewQuery: (query: string) => void;
}

export const QueryBox: React.FC<QueryBoxProps> = ({ onNewQuery }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            const newMessage: ChatMessage = {
                role: 'user',
                content: query,
                timestamp: Date.now(),
            };
            updateSessionData(newMessage);
            onNewQuery(query);
            setQuery('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto mb-6">
            <div className="bg-slate-900 rounded-lg p-4 shadow-lg">
                <div className="flex items-center">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-grow p-3 rounded-lg bg-slate-800 text-slate-100"
                        placeholder="Type your query here..."
                    />
                    <button
                        type="submit"
                        className="ml-4 px-6 py-2 rounded-lg bg-blue-500 text-white"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </form>
    );
};
