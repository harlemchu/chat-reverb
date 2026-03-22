// import { useState, useEffect } from 'react';

// export function useOnlineUsers() {
//     const [onlineIds, setOnlineIds] = useState<number[]>([]);

//     useEffect(() => {
//         const handleUpdate = (e: CustomEvent) => {
//             console.log('event received:', e.detail);
//             setOnlineIds(e.detail.onlineUsers);
//         };
//         window.addEventListener('online-users-updated', handleUpdate as EventListener);
//         return () => window.removeEventListener('online-users-updated', handleUpdate as EventListener);
//     }, []);

//     return onlineIds;
// }
import { useState, useEffect } from 'react';

export function useOnlineUsers(): number[] {
    const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

    useEffect(() => {
        const handler = (e: CustomEvent) => {
            setOnlineUsers(e.detail.onlineUsers);
        };
        window.addEventListener('online-users-updated', handler as EventListener);
        return () => window.removeEventListener('online-users-updated', handler as EventListener);
    }, []);

    return onlineUsers;
}