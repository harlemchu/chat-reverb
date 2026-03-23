import React from 'react';
import { usePage } from '@inertiajs/react';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { Conversation } from '@/types'; // adjust the import path to your types file

interface Props {
    conversation: Conversation;
}

export default function ContactHeader({ conversation }: Props) {
    // Get the current user's ID from Inertia's shared data
    const { props } = usePage();
    const currentUserId = props.auth.user.id;

    // Get the real‑time list of online user IDs
    const onlineUsers = useOnlineUsers();

    const isGroup = conversation.type === 'group';

    // Determine the display name and status text
    let displayName = '';
    let statusText = '';

    if (isGroup) {
        // For groups: show the group name and how many members are online
        displayName = conversation.name || 'Group';
        const memberIds = conversation.users.map(u => u.id);
        const onlineCount = memberIds.filter(id => onlineUsers.includes(id)).length;
        statusText = onlineCount > 0 ? `${onlineCount} online` : 'No one online';
    } else {
        // For private conversations: show the other user's name and online status
        const otherUser = conversation.users.find(u => u.id !== currentUserId);
        displayName = otherUser?.name || 'Unknown';
        const isOnline = otherUser ? onlineUsers.includes(otherUser.id) : false;
        statusText = isOnline ? 'Online' : 'Last seen recently';
    }

    return (
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
                <p className="text-sm text-gray-500">{statusText}</p>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
                <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
            </button>
        </div>
    );
}