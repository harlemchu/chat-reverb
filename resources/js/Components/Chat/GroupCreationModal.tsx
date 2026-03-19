import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import { Dialog } from '@headlessui/react'; // or use your own modal
// Instead of: import axios from 'axios';
const axios = window.axios;
interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onGroupCreated: () => void; // refresh conversation list
}

export default function GroupCreationModal({ isOpen, onClose, onGroupCreated }: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/chat/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to load users', error);
        }
    };

    const toggleUser = (userId: number) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const createGroup = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) return;
        setLoading(true);
        try {
            await axios.post('/chat/groups', {
                name: groupName,
                user_ids: selectedUsers,
            });
            onGroupCreated();
            onClose();
            setGroupName('');
            setSelectedUsers([]);
        } catch (error) {
            console.error('Failed to create group', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-xl p-6">
                    <Dialog.Title className="text-lg font-medium mb-4">Create New Group</Dialog.Title>

                    <input
                        type="text"
                        placeholder="Group Name"
                        value={groupName}
                        onChange={e => setGroupName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
                    />

                    <div className="mb-4">
                        <h3 className="font-medium mb-2">Select Members</h3>
                        <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                            {users.map(user => (
                                <label key={user.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => toggleUser(user.id)}
                                        className="rounded"
                                    />
                                    <span>{user.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Cancel
                        </button>
                        <button
                            onClick={createGroup}
                            disabled={loading || !groupName.trim() || selectedUsers.length === 0}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}