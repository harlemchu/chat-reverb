// // // resources/js/Pages/Chat/Index.tsx

// // import React, { useState, useEffect, useCallback } from 'react';
// // import { Head, router, usePage } from '@inertiajs/react';
// // import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// // import MessageList from '@/Components/Chat/MessageList';
// // import MessageInput from '@/Components/Chat/MessageInput';
// // import ContactHeader from '@/Components/Chat/ContactHeader';
// // import axios from 'axios';
// // import ConversationList from '@/Components/Chat/ConversationList';
// // import GroupCreationModal from '@/Components/Chat/GroupCreationModal';
// // import { Conversation, Message, User } from '@/types';

// // // Extend Window to include our global Echo instance and userId
// // declare global {
// //     interface Window {
// //         Echo: any;
// //         userId: number;
// //     }
// // }

// // export default function Index() {
// //     const [conversations, setConversations] = useState<Conversation[]>([]);
// //     const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
// //     const [messages, setMessages] = useState<Message[]>([]);
// //     const [loading, setLoading] = useState(false);
// //     // const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
// //     const { props } = usePage();
// // // Inside component
// // const [showModal, setShowModal] = useState(false);

// //     const currentUser = props.auth.user.id; // { id, name, email }
// //     const [users, setUsers] = useState<User[]>([]);

// //     // Add a function to refresh conversations after group creation
// //     const refreshConversations = useCallback(() => {
// //         axios.get('/chat/conversations').then(res => setConversations(res.data));
// //     }, []);
// //     // Fetch all conversations on mount
// //     useEffect(() => {
// //         axios.get('/chat/conversations')
// //             .then(res => setConversations(res.data))
// //             .catch(err => console.error(err));

// //         axios.get('/chat/users')
// //             .then(res => setUsers(res.data))
// //             .catch(err => console.error(err));
// //     }, []);

// //     // Load messages when active conversation changes
// //     useEffect(() => {
// //         if (!activeConversation) {
// //             setMessages([]);
// //             return;
// //         }
// //         console.log('Fetching messages for conversation:', activeConversation.id);
// //         setLoading(true);
// //         axios.get(`/chat/conversations/${activeConversation.id}/messages`)
// //             .then(res => {
// //                 console.log('Messages received:', res.data);

// //                 setMessages(res.data)
// //             })
// //             .catch(err => console.error(err))
// //             .finally(() => setLoading(false));

// //         // Mark conversation as read (optional)
// //         axios.post(`/chat/conversations/${activeConversation.id}/read`)
// //             .then(() => {
// //                 // Immediately reset unread count in the conversation list
// //                 setConversations(prev =>
// //                     prev.map(c =>
// //                         c.id === activeConversation.id
// //                             ? { ...c, unread_count: 0 }
// //                             : c
// //                     )
// //                 );
// //             })
// //             .catch(err => console.error('Failed to mark as read', err));


// //         // Subscribe to real‑time new messages
// //         const channel = window.Echo.private(`conversation.${activeConversation.id}`)
// //             .listen('.message.sent', (e: any) => {
// //                 // e contains the message data from broadcastWith()
// //                 const newMessage: Message = {
// //                     id: e.id,
// //                     content: e.content,
// //                     created_at: e.created_at,
// //                     user_id: e.user.id,
// //                     user: e.user,
// //                 };
// //                 setMessages(prev => [...prev, newMessage]);

// //                 // Also update the last message in the conversation list

// //                 setConversations(prev =>
// //                     prev.map(conv =>
// //                         conv.id === e.conversation_id && conv.id !== activeConversation?.id
// //                             ? { ...conv, unread_count: (conv.unread_count || 0) + 1 }
// //                             : conv
// //                     )
// //                 );
// //                 // Update users list: set conversation_id for this user
// //                 setUsers(prev =>
// //                     prev.map(u =>
// //                         u.id === window.userId
// //                             ? { ...u, conversation_id: newMessage.id, last_message: null, unread_count: 0 }
// //                             : u
// //                     )
// //                 );
// //             });
// //         return () => {
// //             channel.stopListening('.message.sent');
// //             window.Echo.leave(`conversation.${activeConversation.id}`);
// //         };
// //     }, [activeConversation]);

// //     // Send a new message
// //     const sendMessage = useCallback(async (content: string) => {
// //         if (!activeConversation) return;

// //         // Optimistic update
// //         const tempId = Date.now();
// //         const tempMessage: Message = {
// //             id: tempId,
// //             content: content,
// //             created_at: new Date().toISOString(),
// //             user_id: window.userId,
// //             user: { id: window.userId, name: 'You', email: '' }, // minimal
// //         };
// //         setMessages(prev => [...prev, tempMessage]);

// //         try {
// //             const response = await axios.post(
// //                 `/chat/conversations/${activeConversation.id}/messages`,
// //                 { content }
// //             );
// //             // Replace optimistic message with real one
// //             setMessages(prev =>
// //                 prev.map(m => (m.id === tempId ? response.data : m))
// //             );
// //         } catch (error) {
// //             // Remove optimistic message on failure
// //             setMessages(prev => prev.filter(m => m.id !== tempId));
// //             alert('Failed to send message');
// //         }
// //     }, [activeConversation]);

// //     // Update unread count when receiving a message while another conversation is active
// //     // useEffect(() => {
// //     //     // This is handled inside the Echo listener for the active conversation,
// //     //     // but we also need to listen for messages in *other* conversations
// //     //     const globalChannel = window.Echo.private('user.' + window.userId)
// //     //         .notification((notification: any) => {
// //     //             // If using broadcast notifications for new message alerts
// //     //             // Alternatively, we can listen on a user channel for new conversation events
// //     //         });

// //     //     return () => {
// //     //         window.Echo.leave('user.' + window.userId);
// //     //     };
// //     // }, []);
// //     useEffect(() => {
// //         if (!window.userId) return;

// //         const userchannel = window.Echo.private(`user.${window.userId}`)
// //             .listen('.conversation.updated', (e: any) => {
// //                 // e contains: conversation_id, last_message, unread_count
// //                 setConversations(prevConversations =>
// //                     prevConversations.map(conv =>
// //                         conv.id === e.conversation_id
// //                             ? {
// //                                 ...conv,
// //                                 last_message: e.last_message,
// //                                 unread_count: e.unread_count,
// //                             }
// //                             : conv
// //                     )
// //                 );
// //             })

// //             .subscribed(() => {
// //                 console.log('✅ Successfully subscribed to user channel "user.' + userchannel.name + '"');
// //             })
// //             .error((error: any) => {
// //                 console.error('❌ Subscription error:', error);
// //             })
// //             .listen('.user.added.to.group', (e: any) => {
// //                 console.log('📩 User added to group event received:', e);
// //                 setConversations(prev => {
// //                     if (prev.some(c => c.id === e.conversation?.id)) {
// //                         console.log('Conversation already exists, skipping');
// //                         return prev;
// //                     }
// //                     console.log('Adding new conversation:', e.conversation);
// //                     return [...prev, e.conversation];
// //                 });
// //             })
// //             .listen('.new-message', (e: any) => {
// //                 // e contains conversation_id and message data
// //                 if (activeConversation?.id === e.conversation_id) {
// //                     // Already listening on the conversation channel, so we'll get it there.
// //                     // You can choose to ignore here, or add the message if needed.
// //                     return;
// //                 }

// //                 // Otherwise, increment unread count for that conversation
// //                 setConversations(prev =>
// //                     prev.map(c =>
// //                         c.id === e.conversation_id
// //                             ? { ...c, unread_count: (c.unread_count || 0) + 1 }
// //                             : c
// //                     )
// //                 );
// //             });
// //         return () => {
// //             window.Echo.leave(`user.${window.userId}`);
// //         };
// //     }, [activeConversation]);
// //     return (
// //         <AuthenticatedLayout>
// //             <Head title="Chat" />
// //             <div className="flex h-[calc(100vh-64px)] bg-gray-100 mx-20"> {/* adjust height based on your layout */}
// //                 {/* Left Sidebar */}
// //                 <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
// //                     <ConversationList
// //                         conversations={conversations}
// //                         users={users}
// //                         activeId={activeConversation?.id}
// //                         onSelect={setActiveConversation}
// //                         onOpenGroupModal={() => setShowModal(true)} // new prop
// //                     />
// //                 </div>

// //                 {/* Right Chat Area */}
// //                 <div className="flex-1 flex flex-col bg-white">
// //                     {activeConversation ? (
// //                         <>
// //                             <ContactHeader conversation={activeConversation} />
// //                             <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
// //                                 <MessageList messages={messages} loading={loading} currentUserId={currentUser} />
// //                             </div>
// //                             <div className="border-t border-gray-200 p-4">
// //                                 <MessageInput onSend={sendMessage} />
// //                             </div>
// //                         </>
// //                     ) : (
// //                         <div className="flex items-center justify-center h-full text-gray-500">
// //                             Select a conversation to start chatting
// //                         </div>
// //                     )}
// //                 </div>
// //             </div>

// // // In the render (e.g., a "New Chat" button)
// // <button onClick={() => setShowModal(true)}>New Chat</button>
// //             <GroupCreationModal
// //                 isOpen={isGroupModalOpen}
// //                 onClose={() => setIsGroupModalOpen(false)}
// //                 onGroupCreated={refreshConversations}
// //             />
// //         </AuthenticatedLayout>
// //     );
// // }
// import React, { useState, useEffect, useCallback } from 'react';
// import { Head, usePage } from '@inertiajs/react';
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import MessageList from '@/Components/Chat/MessageList';
// import MessageInput from '@/Components/Chat/MessageInput';
// import ContactHeader from '@/Components/Chat/ContactHeader';
// import axios from 'axios';
// import ConversationList from '@/Components/Chat/ConversationList';
// import CreateChatModal from '@/Components/Chat/CreateChatModal'; // import the new modal
// import { Conversation, Message, User } from '@/types';

// declare global {
//     interface Window {
//         Echo: any;
//         userId: number;
//     }
// }

// export default function Index() {
//     const [conversations, setConversations] = useState<Conversation[]>([]);
//     const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
//     const [messages, setMessages] = useState<Message[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [showModal, setShowModal] = useState(false); // for the new modal
//     const [users, setUsers] = useState<User[]>([]);

//     const { props } = usePage();
//     const currentUserId = props.auth.user.id; // current user ID

//     // Function to load conversations
//     const loadConversations = useCallback(async () => {
//         try {
//             const res = await axios.get('/chat/conversations');
//             setConversations(res.data);
//         } catch (error) {
//             console.error('Failed to load conversations', error);
//         }
//     }, []);

//     // Function to load users
//     const loadUsers = useCallback(async () => {
//         try {
//             const res = await axios.get('/chat/users');
//             setUsers(res.data);
//         } catch (error) {
//             console.error('Failed to load users', error);
//         }
//     }, []);

//     // Fetch initial data on mount
//     useEffect(() => {
//         loadConversations();
//         loadUsers();
//     }, [loadConversations, loadUsers]);

//     // Load messages when active conversation changes
//     useEffect(() => {
//         if (!activeConversation) {
//             setMessages([]);
//             return;
//         }

//         setLoading(true);
//         axios.get(`/chat/conversations/${activeConversation.id}/messages`)
//             .then(res => setMessages(res.data))
//             .catch(err => console.error(err))
//             .finally(() => setLoading(false));

//         // Mark conversation as read
//         axios.post(`/chat/conversations/${activeConversation.id}/read`)
//             .then(() => {
//                 setConversations(prev =>
//                     prev.map(c =>
//                         c.id === activeConversation.id
//                             ? { ...c, unread_count: 0 }
//                             : c
//                     )
//                 );
//             })
//             .catch(err => console.error('Failed to mark as read', err));

//         // Subscribe to real‑time messages for this conversation
//         const channel = window.Echo.private(`conversation.${activeConversation.id}`)
//             .listen('.message.sent', (e: any) => {
//                 const newMessage: Message = {
//                     id: e.id,
//                     content: e.content,
//                     created_at: e.created_at,
//                     user_id: e.user.id,
//                     user: e.user,
//                 };
//                 setMessages(prev => [...prev, newMessage]);

//                 // Update last message and unread count for this conversation if not active
//                 setConversations(prev =>
//                     prev.map(conv =>
//                         conv.id === e.conversation_id && conv.id !== activeConversation?.id
//                             ? { ...conv, unread_count: (conv.unread_count || 0) + 1 }
//                             : conv
//                     )
//                 );
//             });

//         return () => {
//             channel.stopListening('.message.sent');
//             window.Echo.leave(`conversation.${activeConversation.id}`);
//         };
//     }, [activeConversation]);

//     // Send a new message
//     const sendMessage = useCallback(async (content: string) => {
//         if (!activeConversation) return;

//         const tempId = Date.now();
//         const tempMessage: Message = {
//             id: tempId,
//             content,
//             created_at: new Date().toISOString(),
//             user_id: window.userId,
//             user: { id: window.userId, name: 'You', email: '' },
//         };
//         setMessages(prev => [...prev, tempMessage]);

//         try {
//             const response = await axios.post(
//                 `/chat/conversations/${activeConversation.id}/messages`,
//                 { content }
//             );
//             setMessages(prev =>
//                 prev.map(m => (m.id === tempId ? response.data : m))
//             );
//         } catch (error) {
//             setMessages(prev => prev.filter(m => m.id !== tempId));
//             alert('Failed to send message');
//         }
//     }, [activeConversation]);

//     // Listen for user‑specific events (new messages in other conversations, new groups, etc.)
//     useEffect(() => {
//         if (!window.userId) return;

//         const userChannel = window.Echo.private(`user.${window.userId}`)
//             .listen('.new-message', (e: any) => {
//                 if (activeConversation?.id === e.conversation_id) return;
//                 setConversations(prev =>
//                     prev.map(c =>
//                         c.id === e.conversation_id
//                             ? { ...c, unread_count: (c.unread_count || 0) + 1 }
//                             : c
//                     )
//                 );
//             })
//             .listen('.user.added.to.group', (e: any) => {
//                 setConversations(prev => {
//                     if (prev.some(c => c.id === e.conversation?.id)) return prev;
//                     return [...prev, e.conversation];
//                 });
//             });

//         return () => {
//             window.Echo.leave(`user.${window.userId}`);
//         };
//     }, [activeConversation]);

//     // Handle modal close and refresh
//     const handleConversationCreated = (conversation: Conversation) => {
//         loadConversations();
//         loadUsers();
//         // Optionally open the conversation immediately
//         setActiveConversation(conversation);
//     };

//     return (
//         <AuthenticatedLayout>
//             <Head title="Chat" />
//             <div className="flex h-[calc(100vh-64px)] bg-gray-100 mx-20">
//                 {/* Left Sidebar */}
//                 <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
//                     <ConversationList
//                         conversations={conversations}
//                         users={users}
//                         activeId={activeConversation?.id}
//                         onSelect={setActiveConversation}
//                         onOpenGroupModal={() => setShowModal(true)} // opens the new modal
//                     />
//                 </div>

//                 {/* Right Chat Area */}
//                 <div className="flex-1 flex flex-col bg-white">
//                     {activeConversation ? (
//                         <>
//                             <ContactHeader conversation={activeConversation} />
//                             <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
//                                 <MessageList messages={messages} loading={loading} currentUserId={currentUserId} />
//                             </div>
//                             <div className="border-t border-gray-200 p-4">
//                                 <MessageInput onSend={sendMessage} />
//                             </div>
//                         </>
//                     ) : (
//                         <div className="flex items-center justify-center h-full text-gray-500">
//                             Select a conversation to start chatting
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* New Chat Modal (handles both private and group creation) */}
//             <CreateChatModal
//                 isOpen={showModal}
//                 onClose={() => setShowModal(false)}
//                 onConversationCreated={handleConversationCreated}
//             />
//         </AuthenticatedLayout>
//     );
// }

import React, { useState, useEffect, useCallback } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MessageList from '@/Components/Chat/MessageList';
import MessageInput from '@/Components/Chat/MessageInput';
import ContactHeader from '@/Components/Chat/ContactHeader';
import axios from 'axios';
import ConversationList from '@/Components/Chat/ConversationList';
import CreateChatModal from '@/Components/Chat/CreateChatModal';
import { Conversation, Message, User } from '@/types';

declare global {
    interface Window {
        Echo: any;
        userId: number;
    }
}

export default function Index() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState<User[]>([]);

    const { props } = usePage();
    const currentUserId = props.auth.user.id;

    // Function to load conversations (includes unread_count from backend)
    const loadConversations = useCallback(async () => {
        try {
            const res = await axios.get('/chat/conversations');
            setConversations(res.data);
        } catch (error) {
            console.error('Failed to load conversations', error);
        }
    }, []);

    const loadUsers = useCallback(async () => {
        try {
            const res = await axios.get('/chat/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to load users', error);
        }
    }, []);

    useEffect(() => {
        loadConversations();
        loadUsers();
    }, [loadConversations, loadUsers]);

    // Load messages and subscribe when active conversation changes
    useEffect(() => {
        if (!activeConversation) {
            setMessages([]);
            return;
        }

        setLoading(true);
        axios.get(`/chat/conversations/${activeConversation.id}/messages`)
            .then(res => setMessages(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));

        // Mark conversation as read (resets unread_count in backend and frontend)
        axios.post(`/chat/conversations/${activeConversation.id}/read`)
            .then(() => {
                setConversations(prev =>
                    prev.map(c =>
                        c.id === activeConversation.id
                            ? { ...c, unread_count: 0 }   // ✅ reset unread count
                            : c
                    )
                );
            })
            .catch(err => console.error('Failed to mark as read', err));

        // Real‑time subscription for this conversation's messages
        const channel = window.Echo.private(`conversation.${activeConversation.id}`)
            .listen('.message.sent', (e: any) => {
                const newMessage: Message = {
                    id: e.id,
                    content: e.content,
                    created_at: e.created_at,
                    user_id: e.user.id,
                    user: e.user,
                };
                setMessages(prev => [...prev, newMessage]);

                // ✅ Increment unread count for this conversation ONLY if it's NOT active
                setConversations(prev =>
                    prev.map(conv =>
                        conv.id === e.conversation_id && conv.id !== activeConversation?.id
                            ? { ...conv, unread_count: (conv.unread_count || 0) + 1 }
                            : conv
                    )
                );
            });

        return () => {
            channel.stopListening('.message.sent');
            window.Echo.leave(`conversation.${activeConversation.id}`);
        };
    }, [activeConversation]);

    const sendMessage = useCallback(async (content: string) => {
        if (!activeConversation) return;

        const tempId = Date.now();
        const tempMessage: Message = {
            id: tempId,
            content,
            created_at: new Date().toISOString(),
            user_id: window.userId,
            user: { id: window.userId, name: 'You', email: '' },
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            const response = await axios.post(
                `/chat/conversations/${activeConversation.id}/messages`,
                { content }
            );
            setMessages(prev =>
                prev.map(m => (m.id === tempId ? response.data : m))
            );
        } catch (error) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert('Failed to send message');
        }
    }, [activeConversation]);

    // Listen for user‑specific events (used for unread count updates in other conversations)
    useEffect(() => {
        if (!window.userId) return;

        const userChannel = window.Echo.private(`user.${window.userId}`)
            .listen('.new.message', (e: any) => {
                // ✅ Increase unread count for the conversation that received the message,
                //    but only if it's not the currently active one
                if (activeConversation?.id === e.conversation_id) return;
                setConversations(prev =>
                    prev.map(c =>
                        c.id === e.conversation_id
                            ? { ...c, unread_count: (c.unread_count || 0) + 1 }
                            : c
                    )
                );
            })
            .listen('.user.added.to.group', (e: any) => {
                setConversations(prev => {
                    if (prev.some(c => c.id === e.conversation?.id)) return prev;
                    return [...prev, e.conversation];
                });
            });

        return () => {
            window.Echo.leave(`user.${window.userId}`);
        };
    }, [activeConversation]);

    const handleConversationCreated = (conversation: Conversation) => {
        loadConversations();
        loadUsers();
        setActiveConversation(conversation);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Chat" />
            <div className="flex h-[calc(100vh-64px)] bg-gray-100 mx-20">
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    <ConversationList
                        conversations={conversations}
                        users={users}
                        activeId={activeConversation?.id}
                        onSelect={setActiveConversation}
                        onOpenGroupModal={() => setShowModal(true)}
                    />
                </div>

                <div className="flex-1 flex flex-col bg-white">
                    {activeConversation ? (
                        <>
                            <ContactHeader conversation={activeConversation} />
                            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                                <MessageList messages={messages} loading={loading} currentUserId={currentUserId} />
                            </div>
                            <div className="border-t border-gray-200 p-4">
                                <MessageInput onSend={sendMessage} />
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select a conversation to start chatting
                        </div>
                    )}
                </div>
            </div>

            <CreateChatModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConversationCreated={handleConversationCreated}
            />
        </AuthenticatedLayout>
    );
}