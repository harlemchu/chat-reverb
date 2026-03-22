import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import EmojiPicker from 'emoji-picker-react';

interface Props {
    onSend: (message: string) => void;
}

export default function MessageInput({ onSend }: Props) {
    const [body, setBody] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setShowPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim()) return;
        onSend(body);
        setBody('');
    };

    const onEmojiClick = (emojiObject: any) => {
        setBody(prev => prev + emojiObject.emoji);
        setShowPicker(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 relative">
            {/* Emoji Picker Button */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
                <FaceSmileIcon className="h-6 w-6" />
            </button>

            {/* Input field */}
            <input
                type="text"
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Send button */}
            <button
                type="submit"
                disabled={!body.trim()}
                className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <PaperAirplaneIcon className="h-5 w-5" />
            </button>

            {/* Emoji Picker Popup */}
            {showPicker && (
                <div
                    ref={pickerRef}
                    className="absolute bottom-full left-0 mb-2 z-50"
                >
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
            )}
        </form>
    );
}
// // resources/js/Components/Chat/MessageInput.tsx

// import React, { useState } from 'react';
// import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

// interface Props {
//     onSend: (message: string) => void;
// }

// export default function MessageInput({ onSend }: Props) {
//     const [body, setBody] = useState('');

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!body.trim()) return;
//         onSend(body);
//         setBody('');
//     };

//     return (
//         <form onSubmit={handleSubmit} className="flex items-center space-x-2">
//             <input
//                 type="text"
//                 id="message-input"
//                 name="message"
//                 value={body}
//                 onChange={e => setBody(e.target.value)}
//                 placeholder="Type your message here..."
//                 className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//                 type="submit"
//                 disabled={!body.trim()}
//                 className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//                 <PaperAirplaneIcon className="h-5 w-5" />
//             </button>
//         </form>
//     );
// }