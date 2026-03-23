// resources/js/hooks/useOnlineUsers.ts
import { useState, useEffect } from 'react';

export function useOnlineUsers(): number[] {
    const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

    useEffect(() => {
        const handler = (e: CustomEvent) => setOnlineUsers(e.detail.onlineUsers);
        window.addEventListener('online-users-updated', handler as EventListener);
        return () => window.removeEventListener('online-users-updated', handler as EventListener);
    }, []);

    return onlineUsers;
}