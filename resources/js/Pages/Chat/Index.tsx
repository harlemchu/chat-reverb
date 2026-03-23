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
import { useOnlineUsers } from '@/hooks/useOnlineUsers';

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
    const onlineUsers = useOnlineUsers();

    const { props } = usePage();
    const currentUserId = props.auth.user.id;

    // Set window.userId globally for use in helpers (once)
    useEffect(() => {
        window.userId = currentUserId;
    }, [currentUserId]);

    // Helper to load conversations
    const loadConversations = useCallback(async () => {
        try {
            const res = await axios.get('/chat/conversations');
            setConversations(res.data);
        } catch (error) {
            console.error('Failed to load conversations', error);
        }
    }, []);

    // Helper to load users
    const loadUsers = useCallback(async () => {
        try {
            const res = await axios.get('/chat/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to load users', error);
        }
    }, []);

    // Helper to update a conversation's last message
    const updateConversationLastMessage = useCallback((conversationId: number, message: Message) => {
        setConversations(prev =>
            prev.map(c =>
                c.id === conversationId
                    ? { ...c, last_message: message }
                    : c
            )
        );
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

        // Mark conversation as read (resets unread_count)
        axios.post(`/chat/conversations/${activeConversation.id}/read`)
            .then(() => {
                setConversations(prev =>
                    prev.map(c =>
                        c.id === activeConversation.id
                            ? { ...c, unread_count: 0 }
                            : c
                    )
                );
            })
            .catch(err => console.error('Failed to mark as read', err));

        // Subscribe to real‑time messages for this conversation
        const channel = window.Echo.private(`conversation.${activeConversation.id}`)
            .listen('.message.sent', (e: any) => {
                console.log('📩 message.sent event received:', e);
                const newMessage: Message = {
                    id: e.id,
                    content: e.content,
                    created_at: e.created_at,
                    user_id: e.user.id,
                    user: e.user,
                };
                setMessages(prev => [...prev, newMessage]);

                // ✅ Update last message preview in the sidebar
                updateConversationLastMessage(activeConversation.id, newMessage);

                // ✅ For active conversation, we don't increment unread count
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
    }, [activeConversation, updateConversationLastMessage]);

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

        // Optimistic update of last message
        updateConversationLastMessage(activeConversation.id, tempMessage);

        try {
            const response = await axios.post(
                `/chat/conversations/${activeConversation.id}/messages`,
                { content }
            );
            setMessages(prev =>
                prev.map(m => (m.id === tempId ? response.data : m))
            );
            // Replace optimistic last message with real one
            updateConversationLastMessage(activeConversation.id, response.data);
        } catch (error) {
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert('Failed to send message');
        }
    }, [activeConversation, updateConversationLastMessage]);

    // Listen for user‑specific events (new messages in other conversations)
    useEffect(() => {
        if (!window.userId) return;

        const userChannel = window.Echo.private(`user.${window.userId}`)
            // ✅ Correct event name: must match backend's broadcastAs('new-message')
            .listen('.new-message', (e: any) => {
                console.log('📩 new-message event received:', e);
                if (activeConversation?.id === e.conversation_id) return;

                const newMessage: Message = {
                    id: e.id,
                    content: e.content,
                    created_at: e.created_at,
                    user_id: e.user.id,
                    user: e.user,
                };
                setConversations(prev =>
                    prev.map(conv =>
                        conv.id === e.conversation_id && conv.id !== activeConversation?.id
                            ? { ...conv, last_message: newMessage, unread_count: (conv.unread_count || 0) + 1 }
                            : conv
                    )
                );
                // setConversations(prev =>
                //     prev.map(c =>
                //         c.id === e.conversation_id
                //             ? {
                //                 ...c,
                //                 last_message: newMessage,
                //                 unread_count: (c.unread_count || 0) + 1,
                //             }
                //             : c
                //     )
                // );
            })
            .listen('.user.added.to.group', (e: any) => {
                setConversations(prev => {
                    if (prev.some(c => c.id === e.conversation?.id)) return prev;
                    return [...prev, e.conversation];
                });
            });

        return () => {
            userChannel.stopListening('.new-message');
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

// import React, { useState, useEffect, useCallback } from 'react';
// import { Head, usePage } from '@inertiajs/react';
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import MessageList from '@/Components/Chat/MessageList';
// import MessageInput from '@/Components/Chat/MessageInput';
// import ContactHeader from '@/Components/Chat/ContactHeader';
// import axios from 'axios';
// import ConversationList from '@/Components/Chat/ConversationList';
// import CreateChatModal from '@/Components/Chat/CreateChatModal';
// import { Conversation, Message, User } from '@/types';
// import { useOnlineUsers } from '@/hooks/useOnlineUsers';

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
//     const [showModal, setShowModal] = useState(false);
//     const [users, setUsers] = useState<User[]>([]);
//     const onlineUsers = useOnlineUsers();

//     const { props } = usePage();
//     const currentUserId = props.auth.user.id;

//     // Function to load conversations (includes unread_count from backend)
//     const loadConversations = useCallback(async () => {
//         try {
//             const res = await axios.get('/chat/conversations');
//             setConversations(res.data);
//         } catch (error) {
//             console.error('Failed to load conversations', error);
//         }
//     }, []);
//     const getLastMessage = (conv: Conversation) => {
//         if (!conv.last_message) return 'No messages yet';
//         // console.log(conv.last_message);
//         const senderName = conv.last_message.user_id === window.userId
//             ? 'You'
//             : conv.last_message.user.name.split(' ')[0];
//         return `${senderName}: ${conv.last_message.content}`;
//     };
//     const loadUsers = useCallback(async () => {
//         try {
//             const res = await axios.get('/chat/users');
//             setUsers(res.data);
//         } catch (error) {
//             console.error('Failed to load users', error);
//         }
//     }, []);
//     // Helper to update a conversation's last message
//     const updateConversationLastMessage = useCallback((conversationId: number, message: Message) => {
//         setConversations(prev =>
//             prev.map(c =>
//                 c.id === conversationId
//                     ? { ...c, last_message: message }
//                     : c
//             )
//         );
//     }, []);
//     useEffect(() => {
//         loadConversations();
//         loadUsers();
//     }, [loadConversations, loadUsers]);

//     // Load messages and subscribe when active conversation changes
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

//         // Mark conversation as read (resets unread_count in backend and frontend)
//         axios.post(`/chat/conversations/${activeConversation.id}/read`)
//             .then(() => {
//                 setConversations(prev =>
//                     prev.map(c =>
//                         c.id === activeConversation.id
//                             ? { ...c, unread_count: 0 }   // ✅ reset unread count
//                             : c
//                     )
//                 );
//             })
//             .catch(err => console.error('Failed to mark as read', err));

//         // Real‑time subscription for this conversation's messages
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

//                 // Optimistic update of last message
//                 // updateConversationLastMessage(activeConversation.id, newMessage);
//                 // ✅ Increment unread count for this conversation ONLY if it's NOT active
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
//             // window.Echo.leave(`conversation.${activeConversation.id}`);
//         };
//     }, [activeConversation, updateConversationLastMessage]);

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

//         // Optimistic update of last message
//         updateConversationLastMessage(activeConversation.id, tempMessage);
//         try {
//             const response = await axios.post(
//                 `/chat/conversations/${activeConversation.id}/messages`,
//                 { content }
//             );
//             setMessages(prev =>
//                 prev.map(m => (m.id === tempId ? response.data : m))
//             );
//             // Replace optimistic last message with real one
//             updateConversationLastMessage(activeConversation.id, response.data);
//         } catch (error) {
//             setMessages(prev => prev.filter(m => m.id !== tempId));
//             alert('Failed to send message');
//         }
//     }, [activeConversation, updateConversationLastMessage]);

//     // Listen for user‑specific events (used for unread count updates in other conversations)
//     useEffect(() => {
//         if (!window.userId) return;

//         const userChannel = window.Echo.private(`user.${window.userId}`)
//             .listen('.new.message', (e: any) => {
//                 console.log('new-message event received:', e);
//                 // ✅ Increase unread count for the conversation that received the message,
//                 //    but only if it's not the currently active one
//                 if (activeConversation?.id === e.conversation_id) return;
//                 // setConversations(prev =>
//                 //     prev.map(c =>
//                 //         c.id === e.conversation_id
//                 //             ? { ...c, unread_count: (c.unread_count || 0) + 1 }
//                 //             : c
//                 //     )
//                 // );
//                 const newMessage: Message = {
//                     id: e.id,
//                     content: e.content,
//                     created_at: e.created_at,
//                     user_id: e.user.id,
//                     user: e.user,
//                 };
//                 setConversations(prev =>
//                     prev.map(c =>
//                         c.id === e.conversation_id
//                             ? {
//                                 ...c,
//                                 last_message: newMessage,
//                                 unread_count: (c.unread_count || 0) + 1,
//                             }
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
//             userChannel.stopListening('.new.message');
//             window.Echo.leave(`user.${window.userId}`);
//         };
//     }, [activeConversation]);

//     const handleConversationCreated = (conversation: Conversation) => {
//         loadConversations();
//         loadUsers();
//         setActiveConversation(conversation);
//     };
//     // console.log("Logged users: ", onlineUsers)
//     return (
//         <AuthenticatedLayout>
//             <Head title="Chat" />
//             <div className="flex h-[calc(100vh-64px)] bg-gray-100 mx-20">
//                 <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
//                     <ConversationList
//                         conversations={conversations}
//                         users={users}
//                         activeId={activeConversation?.id}
//                         onSelect={setActiveConversation}
//                         onOpenGroupModal={() => setShowModal(true)}
//                     />
//                 </div>

//                 <div className="flex-1 flex flex-col bg-white">
//                     {activeConversation ? (
//                         <>
//                             <ContactHeader
//                                 conversation={activeConversation}
//                             // activeId={activeConversation?.id}
//                             // onSelect={setActiveConversation}
//                             />
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

//             <CreateChatModal
//                 isOpen={showModal}
//                 onClose={() => setShowModal(false)}
//                 onConversationCreated={handleConversationCreated}
//             />
//         </AuthenticatedLayout>
//     );
// }