import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import ChatBox from '@/Components/ChatBox';

interface ChatProps {
    messages: any[]; // your message type
}

export default function Chat({ messages }: ChatProps) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Chat</h2>}
        >
            <Head title="Chat" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <ChatBox messages={messages} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}