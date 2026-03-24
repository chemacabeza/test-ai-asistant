import React from 'react';

export default function Header({ aiName }) {
    return (
        <header className="header">
            <div className="header__icon">🎙️</div>
            <h1 className="header__title">AI Voice Assistant</h1>
            <p className="header__subtitle">
                Speak naturally — your AI listens and responds
            </p>
            {aiName && (
                <div className="header__ai-badge">
                    <span className="dot"></span>
                    {aiName} is ready
                </div>
            )}
        </header>
    );
}
