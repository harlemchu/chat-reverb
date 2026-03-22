import { useEffect, useRef } from 'react';

export default function OnlineStatus() {
    const channelRef = useRef<any>(null);

    useEffect(() => {
        // Only if Echo is defined and user is authenticated (we assume component only mounts when authenticated)
        if (!window.Echo) return;

        // Leave any existing channel before joining (just in case)
        if (channelRef.current) {
            window.Echo.leave('online');
        }

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

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                window.Echo.leave('online');
                channelRef.current = null;
            }
        };
    }, []);

    return null;
}