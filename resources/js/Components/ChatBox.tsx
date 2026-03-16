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

        // <div className="flex flex-col h-screen max-w-2xl mx-auto border rounded shadow">
        <div>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            {/* <h2 className="text-2xl font-bold mb-4">{room.name}</h2> */}

                            <div className="messages-container h-96 overflow-y-auto border p-4 mb-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`mb-2 flex ${msg.user?.id === auth.user.id
                                            ? 'justify-end'
                                            : 'justify-start'
                                            }`}
                                    >{msg.user?.id !== auth.user.id && (
                                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                            {msg.user.name?.trim()?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                        <div
                                            className={`rounded-lg px-4 py-2 max-w-xs ${msg.user?.id === auth.user.id
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200'
                                                }`}
                                        >
                                            <div className="font-bold text-sm">
                                                {msg.user.name}
                                            </div>
                                            <div>{msg.content}</div>
                                            <div className="text-xs opacity-75">
                                                {new Date(msg.created_at).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)} //{(e) => setData('message', e.target.value)}
                                        className="flex-1 border rounded px-3 py-2"
                                        placeholder="Type your message..."
                                    // disabled={processing}
                                    />
                                    <button
                                        type="submit"
                                        // disabled={processing}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}