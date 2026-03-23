// resources/js/Components/OnlineStatus.tsx
import { useEffect } from 'react';

export default function OnlineStatus() {
    useEffect(() => {
        let currentOnline: number[] = [];

        const channel = window.Echo.join('online')
            .here((users: any[]) => {
                currentOnline = users.map(u => u.id);
                window.dispatchEvent(new CustomEvent('online-users-updated', { detail: { onlineUsers: currentOnline } }));
            })
            .joining((user: any) => {
                if (!currentOnline.includes(user.id)) {
                    currentOnline.push(user.id);
                    window.dispatchEvent(new CustomEvent('online-users-updated', { detail: { onlineUsers: [...currentOnline] } }));
                }
            })
            .leaving((user: any) => {
                currentOnline = currentOnline.filter(id => id !== user.id);
                window.dispatchEvent(new CustomEvent('online-users-updated', { detail: { onlineUsers: [...currentOnline] } }));
            });

        return () => {
            window.Echo.leave('online');
        };
    }, []);

    return null;
}