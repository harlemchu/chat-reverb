import React from 'react';
import { usePage } from '@inertiajs/react';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

interface Props {
    conversation: any;
}

export default function ContactHeader({ conversation }: Props) {
    const onlineUsers = useOnlineUsers();
    const { auth } = usePage().props; // gets the authenticated user from Inertia
    const currentUserId = auth.user?.id;

    const isGroup = conversation.type === 'group';
    let displayName = '';
    let statusText = '';

    if (isGroup) {
        displayName = conversation.name || 'Group';
        const memberIds = conversation.users.map((u: any) => u.id);
        const onlineCount = memberIds.filter((id: number) => onlineUsers.includes(id)).length;
        statusText = onlineCount > 0 ? `${onlineCount} online` : 'No one online';
    } else {
        const otherUser = conversation.users.find((u: any) => u.id !== currentUserId);
        displayName = otherUser?.name || 'Unknown';
        const isOnline = otherUser ? onlineUsers.includes(otherUser.id) : false;
        statusText = isOnline ? 'Online' : 'Last seen recently';
    }
    console.log('ContactHeader conversation:', conversation);
    console.log('onlineUsers from hook:', onlineUsers);
    console.log('currentUserId:', currentUserId);
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