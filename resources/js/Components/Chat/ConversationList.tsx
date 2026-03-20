// resources/js/Components/Chat/ConversationList.tsx

import React, { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Conversation } from '@/types';

interface Props {
    conversations: Conversation[];
    activeId?: number;
    onSelect: (conversation: Conversation) => void;
    onOpenGroupModal: () => void; // if you have group creation
}

export default function ConversationList({ conversations, activeId, onSelect, onOpenGroupModal }: Props) {
    const [search, setSearch] = useState('');

    const { groups, people } = useMemo(() => {
        const filtered = conversations.filter(conv => {
            if (!search) return true;
            // Determine searchable name
            let name = '';
            if (conv.type === 'group') {
                name = conv.name || '';
            } else {
                const other = conv.users.find(u => u.id !== window.userId);
                name = other?.name || '';
            }
            return name.toLowerCase().includes(search.toLowerCase());
        });

        return {
            groups: filtered.filter(c => c.type === 'group'),
            people: filtered.filter(c => c.type === 'private'),
        };
    }, [conversations, search]);

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
        const senderName = conv.last_message.user_id === window.userId
            ? 'You'
            : conv.last_message.user.name.split(' ')[0];
        return `${senderName}: ${conv.last_message.content}`;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Search and Create Group */}
            <div className="p-4 border-b border-gray-200">
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

            {/* Groups Section */}
            {groups.length > 0 && (
                <div className="px-4 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Groups
                    </h3>
                    <ul>
                        {groups.map(conv => (
                            <ConversationItem
                                key={conv.id}
                                displayName={getDisplayName(conv)}
                                lastMessage={getLastMessage(conv)}
                                unreadCount={conv.unread_count}
                                isActive={conv.id === activeId}
                                onClick={() => onSelect(conv)}
                            />
                        ))}
                    </ul>
                </div>
            )}

            {/* People Section */}
            {people.length > 0 && (
                <div className="px-4 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        People
                    </h3>
                    <ul>
                        {people.map(conv => (
                            <ConversationItem
                                key={conv.id}
                                displayName={getDisplayName(conv)}
                                lastMessage={getLastMessage(conv)}
                                unreadCount={conv.unread_count}
                                isActive={conv.id === activeId}
                                onClick={() => onSelect(conv)}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ConversationItem remains the same (from previous implementation)
function ConversationItem({
    displayName,
    lastMessage,
    unreadCount,
    isActive,
    onClick,
}: {
    displayName: string;
    lastMessage: string;
    unreadCount: number;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <li
            onClick={onClick}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                isActive ? 'bg-blue-50' : 'hover:bg-gray-100'
            }`}
        >
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                    <h4 className="font-medium text-gray-900 truncate">{displayName}</h4>
                    {unreadCount > 0 && (
                        <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-2 py-0.5">
                            {unreadCount >= 1000 ? `${(unreadCount / 1000).toFixed(1)}k` : unreadCount}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
            </div>
        </li>
    );
}


// // resources/js/Components/Chat/ConversationList.tsx

// import React, { useState, useMemo } from 'react';
// import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'; // optional icon
// import { Conversation } from './types';
// import GroupCreationModal from './GroupCreationModal';

// interface Props {
//     conversations: Conversation[];
//     activeId?: number;
//     // onSelect: (conversation: Conversation) => void;
// }

// export default function ConversationList({ conversations, activeId, onSelect }: Props) {
//     const [search, setSearch] = useState('');
//     const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

//     // Group conversations by type and filter by search
//     const { groups, people } = useMemo(() => {
//         const filtered = conversations.filter(conv => {
//             if (!search) return true;
//             const targetName = conv.type === 'group'
//                 ? conv.name
//                 : conv.users.find(u => u.id !== window.userId)?.name;
//             return targetName?.toLowerCase().includes(search.toLowerCase());
//         });

//         return {
//             groups: filtered.filter(c => c.type === 'group'),
//             people: filtered.filter(c => c.type === 'private'),
//         };
//     }, [conversations, search]);

//     // Helper to get display name for private conversation
//     const getOtherUserName = (conv: Conversation) => {
//         const other = conv.users.find(u => u.id !== window.userId);
//         return other?.name || 'Unknown';
//     };

//     // Helper to get last message preview
//     const getLastMessage = (conv: Conversation) => {
//         if (!conv.last_message) return 'No messages yet';
//         const senderName = conv.last_message.user_id === window.userId
//             ? 'You'
//             : conv.last_message.user.name.split(' ')[0]; // first name only
//         return `${senderName}: ${conv.last_message.body}`;
//     };

//     function refreshConversations(): void {
//         throw new Error('Function not implemented.');
//     }

//     return (
//         <div className="flex flex-col h-full">
//             {/* Search Bar */}
//             <div className="p-4 border-b border-gray-200">
//                 <div className="relative">
//                     <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                     <input
//                         type="text"
//                         placeholder="Search"
//                         value={search}
//                         onChange={e => setSearch(e.target.value)}
//                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>
//             </div>
//             {/* // Inside ConversationList component, after search bar but before sections */}
//             <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//                 <h2 className="font-semibold text-gray-700">Chats</h2>
//                 <button
//                     onClick={() => setIsGroupModalOpen(true)}
//                     className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
//                 >
//                     <PlusIcon className="h-5 w-5" />
//                 </button>
//             </div>
//             {/* Groups Section */}
//             {groups.length > 0 && (
//                 <div className="px-4 py-2">
//                     <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
//                         Groups
//                     </h3>
//                     <ul>
//                         {groups.map(conv => (
//                             <ConversationItem
//                                 key={conv.id}
//                                 // conversation={conv}
//                                 displayName={conv.name!}
//                                 lastMessage={getLastMessage(conv)}
//                                 unreadCount={conv.unread_count}
//                                 isActive={conv.id === activeId}
//                                 onClick={() => onSelect(conv)}
//                             />
//                         ))}
//                     </ul>
//                 </div>
//             )}

//             {/* People Section */}
//             {people.length > 0 && (
//                 <div className="px-4 py-2">
//                     <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
//                         People
//                     </h3>
//                     <ul>
//                         {people.map(conv => (
//                             <ConversationItem
//                                 key={conv.id}
//                                 // conversation={conv}
//                                 displayName={getOtherUserName(conv)}
//                                 lastMessage={getLastMessage(conv)}
//                                 unreadCount={conv.unread_count}
//                                 isActive={conv.id === activeId}
//                                 onClick={() => onSelect(conv)}
//                             />
//                         ))}
//                     </ul>
//                 </div>
//             )}
//             <GroupCreationModal
//     isOpen={isGroupModalOpen}
//     onClose={() => setIsGroupModalOpen(false)}
//     onGroupCreated={refreshConversations}
// />
//         </div>
        
//     );
// }

// // Individual conversation list item component
// function ConversationItem({
//     displayName,
//     lastMessage,
//     unreadCount,
//     isActive,
//     onClick,
// }: {
//     displayName: string;
//     lastMessage: string;
//     unreadCount: number;
//     isActive: boolean;
//     onClick: () => void;
// }) {
//     return (
//         <li
//             onClick={onClick}
//             className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${isActive
//                 ? 'bg-blue-50'
//                 : 'hover:bg-gray-100'
//                 }`}
//         >
//             <div className="flex-1 min-w-0">
//                 <div className="flex justify-between items-baseline">
//                     <h4 className="font-medium text-gray-900 truncate">{displayName}</h4>
//                     {unreadCount > 0 && (
//                         <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-2 py-0.5">
//                             {unreadCount >= 1000 ? `${(unreadCount / 1000).toFixed(1)}k` : unreadCount}
//                         </span>
//                     )}
//                 </div>
//                 <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
//             </div>
//         </li>
//     );
// }