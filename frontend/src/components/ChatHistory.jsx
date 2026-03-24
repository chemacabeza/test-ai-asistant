import React, { useEffect, useRef } from 'react';

export default function ChatHistory({ messages, isProcessing, aiName }) {
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isProcessing]);

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (messages.length === 0 && !isProcessing) {
        return (
            <div className="chat">
                <div className="chat__empty">
                    <div className="chat__empty-icon">💬</div>
                    <p className="chat__empty-text">
                        Say <strong>"{aiName}"</strong> followed by your question to start a conversation.
                        <br />
                        For example: <em>"{aiName}, tell me a joke"</em>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat">
            {messages.map((msg, index) => (
                <div
                    key={index}
                    className={`chat__message chat__message--${msg.role}`}
                >
                    <div className="chat__bubble">{msg.content}</div>
                    <span className="chat__message-meta">
                        {msg.role === 'user' ? 'You' : aiName} · {formatTime(msg.timestamp)}
                    </span>
                </div>
            ))}

            {isProcessing && (
                <div className="chat__typing">
                    <div className="chat__typing-dot"></div>
                    <div className="chat__typing-dot"></div>
                    <div className="chat__typing-dot"></div>
                </div>
            )}

            <div ref={chatEndRef} />
        </div>
    );
}
