export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

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

export interface Message {
    id: number;
    user_id: number;
    room_id: number;
    content: string;
    created_at: string;
    updated_at: string;
    user: User;
}
export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
