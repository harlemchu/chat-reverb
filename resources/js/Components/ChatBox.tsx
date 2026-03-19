import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { usePage, router } from '@inertiajs/react';
import axios from 'axios';
import { PageProps, Message, ChatRoom, User } from '@/types';

interface Props {
    rooms: ChatRoom[];               // all available rooms
    currentRoom: ChatRoom;            // the room being viewed
    messages: Message[];              // messages for current room
}

export default function ChatBox({ rooms, currentRoom, messages: initialMessages }: Props) {
    const { auth } = usePage<PageProps>().props;
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Presence channel for online users in the current room
    useEffect(() => {
        if (!window.Echo) return;

        // Join presence channel for the current room
        const channel = window.Echo.join(`chat.room.${currentRoom.id}`);

        // Get initial list of users already in the channel
        channel.here((users: any[]) => {
            setOnlineUsers(users);
        });

        // When a user joins
        channel.joining((user: User) => {
            setOnlineUsers(prev => [...prev, user]);
        });

        // When a user leaves
        channel.leaving((user: User) => {
            setOnlineUsers(prev => prev.filter(u => u.id !== user.id));
        });

        // Listen for new messages on the private channel (or use presence channel's `listen` for whisper?)
        // Actually we can use the private channel inside the same presence channel, or use a separate private channel.
        // Let's use the private channel inside the presence channel:
        channel.listen('.new.message', (e: any) => {
            setMessages(prev => [...prev, e.message]);
        });

        return () => {
            window.Echo.leave(`chat.room.${currentRoom.id}`);
        };
    }, [currentRoom.id]);

    // If you prefer a separate private channel, you can also listen like this:
    // useEffect(() => {
    //     const channel = window.Echo.private(`chat.room.${currentRoom.id}`);
    //     channel.listen('.new.message', (e: any) => {
    //         setMessages(prev => [...prev, e.message]);
    //     });
    //     return () => { window.Echo.leave(`chat.room.${currentRoom.id}`); };
    // }, [currentRoom.id]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await axios.post(`/chat/${currentRoom.id}`, { content: newMessage });
            // Optimistically add message (the broadcast will also add it)
            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const switchRoom = (roomId: number) => {
        router.get(`/chat/${roomId}`);
    };

    return (
        <div className="flex h-screen">
            {/* Left sidebar: Room list */}
            <div className="w-64 bg-gray-100 border-r p-4 overflow-y-auto">
                <h2 className="font-bold text-lg mb-4">Rooms</h2>
                <ul>
                    {rooms.map(room => (
                        <li key={room.id}>
                            <button
                                onClick={() => switchRoom(room.id)}
                                className={`w-full text-left p-2 rounded ${room.id === currentRoom.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
                            >
                                {room.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col">
                <div className="bg-white border-b p-4">
                    <h1 className="text-xl font-bold">{currentRoom.name}</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4" ref={messagesEndRef}>
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`mb-4 flex ${msg.user.id === auth.user.id ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.user.id !== auth.user.id && (
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm mr-2">
                                    {msg.user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div
                                className={`max-w-xs px-4 py-2 rounded-lg ${msg.user.id === auth.user.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200'
                                    }`}
                            >
                                <div className="font-bold text-xs">{msg.user.name}</div>
                                <div>{msg.content}</div>
                                <div className="text-xs opacity-75 mt-1">
                                    {new Date(msg.created_at).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="border-t p-4">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            className="flex-1 border rounded px-3 py-2"
                            placeholder="Type your message..."
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>

            {/* Right sidebar: Online users */}
            <div className="w-64 bg-gray-100 border-l p-4 overflow-y-auto">
                <h2 className="font-bold text-lg mb-4">Online ({onlineUsers.length})</h2>
                <ul>
                    {onlineUsers.map(user => (
                        <li key={user.id} className="flex items-center mb-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            {user.name} {user.id === auth.user.id && '(you)'}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}