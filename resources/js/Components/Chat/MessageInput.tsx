// resources/js/Components/Chat/MessageInput.tsx

import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface Props {
    onSend: (message: string) => void;
}

export default function MessageInput({ onSend }: Props) {
    const [body, setBody] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim()) return;
        onSend(body);
        setBody('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
                type="text"
                id="message-input"
                name="message"
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                disabled={!body.trim()}
                className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <PaperAirplaneIcon className="h-5 w-5" />
            </button>
        </form>
    );
}