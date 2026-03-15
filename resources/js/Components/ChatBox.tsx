import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { PageProps, Message } from '@/types';

export default function ChatBox({ messages: initialMessages }: { messages: Message[] }) {
    const { auth } = usePage<PageProps>().props;
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Listen for incoming messages via Echo
    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.private('chat');
        channel.listen('.new.message', (e: any) => {
            // e contains the broadcast data (message, user, etc.)
            setMessages((prev) => [...prev, e]);
        });

        return () => {
            channel.stopListening('.new.message');
            window.Echo.leave('chat');
        };
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await axios.post('/chat', { content: newMessage });
            // Optimistically add the message to the list
            // (the broadcast will also add it, but we can add it now for instant feedback)
            setMessages((prev) => [...prev, response.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-2xl mx-auto border rounded shadow">
            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`p-2 rounded max-w-xs ${msg.user.id === auth.user.id
                            ? 'ml-auto bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                            }`}
                    >
                        <div className="text-xs font-bold mb-1">{msg.user.name}</div>
                        <div>{msg.content}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border rounded px-3 py-2"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Send
                </button>
            </form>
        </div>
    );
}