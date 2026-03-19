// resources/js/Pages/Chat/Index.tsx

import { useState, useEffect, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MessageList from '@/Components/Chat/MessageList';
import MessageInput from '@/Components/Chat/MessageInput';
import ContactHeader from '@/Components/Chat/ContactHeader';
import axios from 'axios';
import ConversationList from '@/Components/Chat/ConversationList';
import GroupCreationModal from '@/Components/Chat/GroupCreationModal';
import { Conversation, Message } from '@/Components/Chat/types';

// Extend Window to include our global Echo instance and userId
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
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false); const { props } = usePage();

    const currentUser = props.auth.user.id; // { id, name, email }

    // Add a function to refresh conversations after group creation
    const refreshConversations = useCallback(() => {
        axios.get('/chat/conversations').then(res => setConversations(res.data));
    }, []);
    // Fetch all conversations on mount
    useEffect(() => {
        axios.get('/chat/conversations')
            .then(res => setConversations(res.data))
            .catch(err => console.error(err));
    }, []);

    // Load messages when active conversation changes
    useEffect(() => {
        if (!activeConversation) {
            setMessages([]);
            return;
        }

        console.log('Fetching messages for conversation:', activeConversation.id);
        setLoading(true);
        axios.get(`/chat/conversations/${activeConversation.id}/messages`)
            .then(res => {
                console.log('Messages received:', res.data); setMessages(res.data)
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));

        // Mark conversation as read (optional)
        axios.post(`/chat/conversations/${activeConversation.id}/read`);

        // Subscribe to real‑time new messages
        const channel = window.Echo.private(`conversation.${activeConversation.id}`)
            .listen('.message.sent', (e: any) => {
                // e contains the message data from broadcastWith()
                const newMessage: Message = {
                    id: e.id,
                    content: e.content,
                    created_at: e.created_at,
                    user_id: e.user.id,
                    user: e.user,
                };
                setMessages(prev => [...prev, newMessage]);

                // Also update the last message in the conversation list
                setConversations(prev =>
                    prev.map(c =>
                        c.id === activeConversation.id
                            ? { ...c, last_message: newMessage, unread_count: 0 }
                            : c
                    )
                );
            });

        return () => {
            channel.stopListening('.message.sent');
            window.Echo.leave(`conversation.${activeConversation.id}`);
        };
    }, [activeConversation]);

    // Send a new message
    const sendMessage = useCallback(async (content: string) => {
        if (!activeConversation) return;

        // Optimistic update
        const tempId = Date.now();
        const tempMessage: Message = {
            id: tempId,
            content: content,
            created_at: new Date().toISOString(),
            user_id: window.userId,
            user: { id: window.userId, name: 'You', email: '' }, // minimal
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            const response = await axios.post(
                `/chat/conversations/${activeConversation.id}/messages`,
                { content }
            );
            // Replace optimistic message with real one
            setMessages(prev =>
                prev.map(m => (m.id === tempId ? response.data : m))
            );
        } catch (error) {
            // Remove optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert('Failed to send message');
        }
    }, [activeConversation]);

    // Update unread count when receiving a message while another conversation is active
    // useEffect(() => {
    //     // This is handled inside the Echo listener for the active conversation,
    //     // but we also need to listen for messages in *other* conversations
    //     const globalChannel = window.Echo.private('user.' + window.userId)
    //         .notification((notification: any) => {
    //             // If using broadcast notifications for new message alerts
    //             // Alternatively, we can listen on a user channel for new conversation events
    //         });

    //     return () => {
    //         window.Echo.leave('user.' + window.userId);
    //     };
    // }, []);
    useEffect(() => {
        if (!window.userId) return;

        const channel = window.Echo.private(`user.${window.userId}`)
            .listen('.conversation.updated', (e: any) => {
                // e contains: conversation_id, last_message, unread_count
                setConversations(prevConversations =>
                    prevConversations.map(conv =>
                        conv.id === e.conversation_id
                            ? {
                                ...conv,
                                last_message: e.last_message,
                                unread_count: e.unread_count,
                            }
                            : conv
                    )
                );
            })

            .subscribed(() => {
                console.log('✅ Successfully subscribed to user channel');
            })
            .error((error: any) => {
                console.error('❌ Subscription error:', error);
            })
            .listen('.user.added.to.group', (e: any) => {
                console.log('📩 User added to group event received:', e);
                setConversations(prev => {
                    if (prev.some(c => c.id === e.conversation?.id)) {
                        console.log('Conversation already exists, skipping');
                        return prev;
                    }
                    console.log('Adding new conversation:', e.conversation);
                    return [...prev, e.conversation];
                });
            });

        return () => {
            window.Echo.leave(`user.${window.userId}`);
        };
    }, []);
    return (
        <AuthenticatedLayout>
            <Head title="Chat" />
            <div className="flex h-[calc(100vh-64px)] bg-gray-100"> {/* adjust height based on your layout */}
                {/* Left Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    <ConversationList
                        conversations={conversations}
                        activeId={activeConversation?.id}
                        onSelect={setActiveConversation}
                        onOpenGroupModal={() => setIsGroupModalOpen(true)} // new prop
                    />
                </div>

                {/* Right Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {activeConversation ? (
                        <>
                            <ContactHeader conversation={activeConversation} />
                            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                                <MessageList messages={messages} loading={loading} currentUserId={currentUser} />
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
            <GroupCreationModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                onGroupCreated={refreshConversations}
            />
        </AuthenticatedLayout>
    );
}
