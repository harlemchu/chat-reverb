// resources/js/Components/Chat/ContactHeader.tsx

import React from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { Conversation } from './types';

interface Props {
    conversation: Conversation;
}

export default function ContactHeader({ conversation }: Props) {
    // For private chats, display the other user; for groups, display group name
    const isGroup = conversation.type === 'group';
    const displayName = isGroup
        ? conversation.name
        : conversation.users.find(u => u.id !== window.userId)?.name;

    // Mock online status – you can extend with presence channels
    const online = true; // replace with real presence data
    const lastSeen = '2.02pm'; // you can compute from user's last_seen

    return (
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
                    <p className="text-sm text-gray-500">
                        {online ? 'Online' : `Last seen, ${lastSeen}`}
                    </p>
                </div>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
                <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
            </button>
        </div>
    );
}