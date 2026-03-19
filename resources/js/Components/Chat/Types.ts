// resources/js/Components/Chat/types.ts

export interface User {
    id: number;
    name: string;
    avatar?: string | null;
    email: string;
    online?: boolean; // we'll manage via presence channels
    last_seen?: string; // optional
}

export interface Message {
    id: number;
    content: string;
    created_at: string; // ISO string
    user_id: number;
    user: User;
}

export interface Conversation {
    id: number;
    type: 'private' | 'group';          // to differentiate UI sections
    name?: string;                       // for groups, otherwise derived from other user
    users: User[];
    last_message?: Message | null;       // for preview
    unread_count: number;                 // shown as badge
    updated_at: string;                   // for sorting
    pivot?: {
        last_read_at: string | null;
    };
}

// For the left sidebar grouping
export interface GroupedConversations {
    groups: Conversation[];
    people: Conversation[];
}