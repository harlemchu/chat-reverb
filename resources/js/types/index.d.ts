export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export interface Message {
    id: number;
    content: string;
    user: User;
    created_at: string;
}


export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    messages: Message[];
};
