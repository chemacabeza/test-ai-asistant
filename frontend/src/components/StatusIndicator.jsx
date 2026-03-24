import React from 'react';

export default function StatusIndicator({ status, isOnline }) {
    const getStatusConfig = () => {
        switch (status) {
            case 'recording':
                return { text: 'Listening...', dotClass: 'status-dot--recording' };
            case 'transcribing':
                return { text: 'Transcribing speech...', dotClass: 'status-dot--processing' };
            case 'thinking':
                return { text: isOnline ? 'Thinking...' : 'Processing locally...', dotClass: 'status-dot--processing' };
            case 'speaking':
                return { text: 'Speaking...', dotClass: 'status-dot--speaking' };
            case 'wake-word-missing':
                return { text: 'Wake word not detected. Say the AI name first.', dotClass: '' };
            case 'error':
                return { text: 'An error occurred. Try again.', dotClass: '' };
            default:
                return { text: 'Ready — tap the mic to speak', dotClass: '' };
        }
    };

    const { text, dotClass } = getStatusConfig();

    return (
        <div className="controls__status">
            {dotClass && <span className={`status-dot ${dotClass}`}></span>}
            <span>{text}</span>
            <span className={`controls__connection-badge ${isOnline ? '' : 'controls__connection-badge--offline'}`}>
                {isOnline ? '☁️' : '📴'}
            </span>
        </div>
    );
}
