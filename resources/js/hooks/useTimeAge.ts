import { timeAgo } from '@/utils/timeAge';
import { useState, useEffect } from 'react';

/**
 * Returns a time‑ago string that updates automatically.
 * @param date - The date to format.
 * @param intervalMs - How often to refresh (default: 60,000 ms = 1 minute).
 */
export function useTimeAgo(date: Date | string | number, intervalMs = 60000) {
    const [formatted, setFormatted] = useState(() => timeAgo(date));

    useEffect(() => {
        // Update immediately when the date changes
        setFormatted(timeAgo(date));

        // Set up interval to refresh the string
        const interval = setInterval(() => {
            setFormatted(timeAgo(date));
        }, intervalMs);

        // Cleanup interval on unmount or when date/interval changes
        return () => clearInterval(interval);
    }, [date, intervalMs]);

    return formatted;
}