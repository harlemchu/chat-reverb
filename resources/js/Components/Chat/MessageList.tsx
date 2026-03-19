import { Message } from '@/types';
import React, { useEffect, useRef } from 'react';

interface Props {
    messages: Message[];
    loading?: boolean;
    currentUserId: any;
}

export default function MessageList({ messages, loading, currentUserId }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (loading) {
        return <div className="flex justify-center p-4">Loading...</div>;
    }

    if (messages.length === 0) {
        return (
            <div className="flex justify-center items-center h-full text-gray-500">
                No messages yet. Start the conversation!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {messages.map((msg) => {
                const isMine = msg.user.id === currentUserId;
                return (
                    <div
                        key={msg.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${isMine
                                ? 'bg-blue-500 text-white rounded-br-none'
                                : 'bg-grey border border-gray-200 rounded-bl-none'
                                }`}
                        >
                            {!isMine && msg.user.name && (
                                <p className="text-xs font-semibold text-blue-600 mb-1">
                                    {msg.user.name}
                                </p>
                            )}
                            <p className="text-sm break-words">{msg.content}</p>
                            <p
                                className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500'
                                    } text-right`}
                            >
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
}