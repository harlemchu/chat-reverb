import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import toast from 'react-hot-toast';
const axios = window.axios;

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConversationCreated: (conversation: any) => void; // refresh the conversation list
}

export default function CreateChatModal({ isOpen, onClose, onConversationCreated }: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingUsers, setFetchingUsers] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setFetchingUsers(true);
        try {
            const res = await axios.get('/chat/users');
            if (Array.isArray(res.data)) {
                setUsers(res.data);
            } else {
                console.error('Unexpected response format:', res.data);
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to load users', error);
            setUsers([]);
        } finally {
            setFetchingUsers(false);
        }
    };

    const toggleUser = (userId: number) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const createConversation = async () => {
        if (selectedUsers.length === 0) return;

        setLoading(true);
        try {
            let response;
            if (selectedUsers.length === 1) {
                // Private chat
                const userId = selectedUsers[0];
                // await axios.post('/chat/start-private', { user_id: userId });
                response = await axios.post('/chat/start-private', { user_id: selectedUsers[0] });
            } else {
                // Group chat
                if (!groupName.trim()) {
                    alert('Please enter a group name');
                    setLoading(false);
                    return;
                }
                response = await axios.post('/chat/groups', {
                    name: groupName,
                    user_ids: selectedUsers,
                });
            }
            // The backend may return an existing conversation (if it already exists)
            const newConversation = response.data;
            // Notify parent component that a conversation was created (or opened)
            onConversationCreated(newConversation); // pass the conversation object
            // 🟢 Show a toast when the conversation already existed
            if (response.data.id) {
                toast.success('Chat opened', { icon: '💬' });
            }
            onClose();
            setGroupName('');
            setSelectedUsers([]);
        } catch (error) {
            console.error('Failed to create conversation', error);
            // Optionally show an error toast
            toast.error('Could not start chat');
        } finally {
            setLoading(false);
        }
    };

    const isPrivate = selectedUsers.length === 1;
    const isGroup = selectedUsers.length > 1;
    const canCreate = (isPrivate || (isGroup && groupName.trim())) && !loading;

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-xl p-6">
                    <Dialog.Title className="text-lg font-medium mb-4">
                        {selectedUsers.length === 1 ? 'Start Private Chat' : 'Create New Group'}
                    </Dialog.Title>

                    {selectedUsers.length > 1 && (
                        <input
                            type="text"
                            placeholder="Group Name"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
                        />
                    )}

                    <div className="mb-4">
                        <h3 className="font-medium mb-2">
                            {selectedUsers.length === 1 ? 'Select a user' : 'Select Members'}
                        </h3>
                        <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                            {fetchingUsers ? (
                                <div className="text-center text-gray-500 p-2">Loading users...</div>
                            ) : (
                                // Ensure users is an array before mapping
                                (Array.isArray(users) ? users : []).map(user => (
                                    <label key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => toggleUser(user.id)}
                                            className="rounded"
                                        />
                                        <span>{user.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button
                            onClick={createConversation}
                            disabled={!canCreate}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading
                                ? 'Creating...'
                                : selectedUsers.length === 1
                                    ? 'Start Chat'
                                    : 'Create Group'}
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}