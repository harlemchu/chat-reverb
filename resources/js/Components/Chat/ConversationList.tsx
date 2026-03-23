// resources/js/Components/Chat/ConversationList.tsx

import React, { useState, useMemo, ReactNode } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Conversation, User } from '@/types';
import { UserGroupIcon } from '@heroicons/react/24/solid';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import ConfirmPassword from '@/Pages/Auth/ConfirmPassword';
import { timeAgo } from '@/utils/timeAge';

interface Props {
    conversations: Conversation[];
    users: User[];
    activeId?: number;
    onSelect: (conversation: Conversation) => void;
    onOpenGroupModal: () => void; // if you have group creation
}

export default function ConversationList({ conversations, users, activeId, onSelect, onOpenGroupModal }: Props) {
    const [search, setSearch] = useState('');
    const onlineUsers = useOnlineUsers();
    const isUserOnline = (userId: number) => onlineUsers.includes(userId);
    // Filter groups and people

    const { groups } = useMemo(() => {
        const filtered = conversations.filter(conv => {
            if (!search) return true;
            const targetName = conv.type === 'group'
                ? conv.name
                : conv.users.find(u => u.id !== window.userId)?.name;
            return targetName?.toLowerCase().includes(search.toLowerCase());
        });

        return {
            groups: filtered,
        };
    }, [conversations, search]);

    const { People } = useMemo(() => {
        const filtered = users.filter(conv => {
            if (!search) return true;
            const targetName = conv.name;
            return targetName?.toLowerCase().includes(search.toLowerCase());
        });

        return {
            People: filtered,
        };
    }, [users, search]);

    // Helper to get display name for a conversation
    const getDisplayName = (conv: Conversation): string => {
        if (conv.type === 'group') {
            return conv.name || 'Unnamed Group';
        }
        const other = conv.users.find(u => u.id !== window.userId);
        return other?.name || 'Unknown';
    };

    // Helper to get last message preview
    const getLastMessage = (conv: Conversation) => {
        if (!conv.last_message) return 'No messages yet';
        const limitText = (text: string, maxLength: number = 100) => {
            if (text.length <= maxLength) return text;
            return text.slice(0, maxLength) + '…';
        };
        const senderName = conv.last_message.user_id === window.userId
            ? 'You'
            : conv.last_message.user.name.split(' ')[0];
        // return `${conv.last_message.content}`;// ${timeAgo(conv.last_message?.created_at, 'en')}`;
        return (<> <span className="font-block text-black-500">{senderName}</span> : <span className="inline-block text-blue-600 font-bold">{limitText(conv.last_message.content, 10)}</span><span className="text-gray-500 text-xs ml-2 italic">{timeAgo(conv.last_message.created_at)}</span> </>)
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            {/* Search and Create Group */}
            <div className="p-4 border-gray-200 rounded-md">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        id="search-conversations"
                        name="search"
                        placeholder="Search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={onOpenGroupModal}
                    className="mt-2 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Create Group</span>
                </button>
            </div>
            {/* Group Section */}
            {groups.map(conv => {
                // Get all user IDs in this group (must be loaded from backend)
                const memberIds = conv.users.map(u => u.id);
                // Count how many are online
                const onlineCount = memberIds.filter(id => onlineUsers.includes(id)).length;
                // Optionally show the count in the display name
                const displayWithCount = onlineCount > 0 ? `${conv.name} (${onlineCount} online)` : conv.name;

                return (
                    <ConversationItem
                        key={conv.id}
                        type={conv.type}
                        displayName={getDisplayName(conv)}
                        lastMessage={getLastMessage(conv)}
                        convo={(conv)}
                        unreadCount={conv.unread_count}
                        isActive={conv.id === activeId}
                        isOnline={isUserOnline(conv.id)}   // not used for groups
                        onClick={() => onSelect(conv)}
                    />
                );
            })}

            {/* People Section */}
            {People.length > 0 && (
                <div className="px-4 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        People
                    </h3>
                    <ul>
                        {People.map((user) => {
                            const isOnline = onlineUsers.includes(user.id);
                            return (
                                <li
                                    key={user.id}
                                    className="flex items-center border mx-1 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    {/* Avatar Placeholder */}
                                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold mr-3">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="font-medium text-gray-900 truncate">{user.name}</h4>
                                            {/* Optional timestamp */}
                                            <span className="text-xs text-gray-400">2:30 PM</span>
                                        </div>
                                        {/* Optional last message preview */}
                                        {user.last_seen && (
                                            <p className="text-sm text-gray-500 truncate">{user.last_seen}</p>
                                        )}
                                    </div>

                                    {/* Online indicator */}
                                    {isOnline && (
                                        <span className="w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ConversationItem remains the same (from previous implementation)
function ConversationItem({
    type,
    displayName,
    lastMessage,
    convo,
    unreadCount,
    isActive,
    isOnline, // new prop
    onClick,
}: {
    type: string;
    displayName: string;
    lastMessage: string | ReactNode;
    convo: Conversation;
    unreadCount: number;
    isActive: boolean;
    isOnline: boolean;
    onClick: () => void;
}) {
    return (
        <li
            onClick={onClick}
            className={`flex items-center border mx-1 p-23 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-blue-50' : 'hover:bg-gray-100'
                }`}
        >
            <div className="flex-1 min-w-0 p-2">
                <div className="flex justify-between items-baseline">
                    <div className="flex items-center gap-2">
                        {isOnline && (
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                        {type === 'group' ? (
                            <UserGroupIcon className="inline-block h-10 w-10 mr-3" />
                        ) : (
                            <div className="inline-block w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold mr-3">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <h4 className="font-medium text-gray-900 truncate">{displayName}</h4>
                    </div>
                    {unreadCount > 0 && (
                        <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-2 py-0.5">
                            {unreadCount >= 1000 ? `${(unreadCount / 1000).toFixed(1)}k` : unreadCount}
                        </span>
                    )}
                </div>
                <p className="text-sm ml-10 pl-5">{lastMessage}</p>
                {/* <p className="text-sm text-gray-500 truncate ml-10 pl-5">{lastMessage}</p> */}
            </div>
        </li>
    );
}