import React, { useState, useRef, useEffect } from 'react';

export default function TextInput({ onSubmit, disabled, isOnline }) {
    const [text, setText] = useState('');
    const inputRef = useRef(null);

    // Auto-focus when switching to offline
    useEffect(() => {
        if (!isOnline && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOnline]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || disabled) return;
        onSubmit(trimmed);
        setText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSubmit(e);
        }
    };

    return (
        <form className="text-input" onSubmit={handleSubmit}>
            <input
                ref={inputRef}
                className="text-input__field"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isOnline ? 'Or type your message...' : 'Type your message (offline mode)...'}
                disabled={disabled}
                maxLength={500}
                autoComplete="off"
            />
            <button
                className="text-input__send"
                type="submit"
                disabled={disabled || !text.trim()}
                title="Send message"
            >
                ➤
            </button>
        </form>
    );
}
