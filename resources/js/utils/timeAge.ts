/**
 * Formats a date as a human-readable relative time (e.g., "5 minutes ago").
 * @param date - A Date object, timestamp (milliseconds), or ISO string.
 * @param locale - Optional locale (default: 'en').
 * @returns The formatted time ago string, or "just now" for very recent dates.
 */
export function timeAgo(date: Date | string | number, locale: string = 'en'): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffSeconds = Math.round(diffMs / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);
    const diffWeeks = Math.round(diffDays / 7);
    const diffMonths = Math.round(diffDays / 30);
    const diffYears = Math.round(diffDays / 365);

    // Special case: very recent (less than 10 seconds) → "just now"
    if (diffSeconds < 10) {
        return 'just now';
    }

    // If Intl.RelativeTimeFormat is available, use it for best locale support.
    if (typeof Intl !== 'undefined' && Intl.RelativeTimeFormat) {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

        if (Math.abs(diffSeconds) < 60) {
            return rtf.format(-diffSeconds, 'second');
        } else if (Math.abs(diffMinutes) < 60) {
            return rtf.format(-diffMinutes, 'minute');
        } else if (Math.abs(diffHours) < 24) {
            return rtf.format(-diffHours, 'hour');
        } else if (Math.abs(diffDays) < 7) {
            return rtf.format(-diffDays, 'day');
        } else if (Math.abs(diffWeeks) < 4) {
            return rtf.format(-diffWeeks, 'week');
        } else if (Math.abs(diffMonths) < 12) {
            return rtf.format(-diffMonths, 'month');
        } else {
            return rtf.format(-diffYears, 'year');
        }
    }

    // Fallback for environments without Intl.RelativeTimeFormat
    if (diffSeconds < 60) {
        return diffSeconds === 1 ? '1 second ago' : `${diffSeconds} seconds ago`;
    } else if (diffMinutes < 60) {
        return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
        return diffDays === 1 ? 'yesterday' : `${diffDays} days ago`;
    } else if (diffWeeks < 4) {
        return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
    } else if (diffMonths < 12) {
        return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
    } else {
        return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
    }
}


// console.log(timeAgo('2026-03-20T04:39:08.000Z'));
// // e.g., "2 days ago" (depending on current date)

// console.log(timeAgo(new Date(Date.now() - 5 * 60 * 1000)));
// // "5 minutes ago"

// console.log(timeAgo(Date.now() - 1000));
// // "just now" (if less than 10 seconds)

// console.log(timeAgo('2025-01-01T00:00:00Z', 'fr'));
// // Using French locale (if Intl.RelativeTimeFormat supported): "il y a 1 an"