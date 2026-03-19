
// export interface Message {
//     id: number;
//     content: string;
//     user: User;
//     created_at: string;
// }

export interface ChatRoom {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

// export interface Message {
//     id: number;
//     user_id: number;
//     room_id: number;
//     content: string;
//     created_at: string;
//     updated_at: string;
//     user: User;
// }
export interface User {
    id: number;
    name: string;
    avatar?: string | null;
    email: string;
    email_verified_at?: string;
    online?: boolean; // we'll manage via presence channels
    last_seen?: string; // optional
}


// For the left sidebar grouping
export interface GroupedConversations {
    groups: Conversation[];
    people: Conversation[];
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

export interface Message {
    id: number;
    content: string;
    created_at: string; // ISO string
    user_id: number;
    user: User;
}
export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
