// resources/js/Pages/Chat/Index.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { Link, router } from '@inertiajs/react';
import { ChatRoom } from '@/types';
import axios from 'axios';

interface Props {
    rooms: ChatRoom[];
}

export default function Chat({ rooms: initialRooms }: Props) {
    const [rooms, setRooms] = useState<ChatRoom[]>(initialRooms);
    const [newRoomName, setNewRoomName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Listen for new rooms created by other users
    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.channel('rooms');
        channel.listen('.room.created', (e: any) => {
            // Add the new room to the list if not already present
            setRooms(prev => {
                if (prev.some(r => r.id === e.room.id)) return prev;
                return [...prev, e.room];
            });
        });

        return () => {
            channel.stopListening('.room.created');
            window.Echo.leave('rooms');
        };
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!newRoomName.trim()) return;

        setIsCreating(true);
        try {
            // Use Inertia post to benefit from redirect and flash messages
            router.post('chatrooms', { name: newRoomName }, {
                onSuccess: () => {
                    setNewRoomName('');
                },
                onFinish: () => setIsCreating(false),
            });
        } catch (error) {
            console.error('Failed to create room', error);
            setIsCreating(false);
        }
    };

    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <h2 className="text-2xl font-bold mb-6">Chat Rooms</h2>

                        {/* Create Room Form */}
                        <form onSubmit={handleSubmit} className="mb-6 flex space-x-2">
                            <input
                                type="text"
                                value={newRoomName}
                                onChange={e => setNewRoomName(e.target.value)}
                                placeholder="New room name..."
                                className="flex-1 border rounded px-3 py-2"
                                disabled={isCreating}
                            />
                            <button
                                type="submit"
                                disabled={isCreating || !newRoomName.trim()}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                            >
                                Create Room
                            </button>
                        </form>

                        {/* Room List */}
                        {rooms.length === 0 ? (
                            <p>No rooms available. Create one!</p>
                        ) : (
                            <ul className="space-y-2">
                                {rooms.map(room => (
                                    <li key={room.id}>
                                        <a
                                            href={`/chatroom/${room.id}`}
                                            onClick={() => console.log(room.id)}
                                            className="block p-4 border rounded hover:bg-gray-50 transition"
                                        >
                                            <span className="text-lg font-medium">{room.name}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}