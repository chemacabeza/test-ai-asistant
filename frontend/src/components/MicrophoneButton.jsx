import React from 'react';

export default function MicrophoneButton({ isRecording, onClick, disabled }) {
    return (
        <div className="controls__mic-container">
            <button
                className={`controls__mic-btn ${isRecording ? 'controls__mic-btn--recording' : ''}`}
                onClick={onClick}
                disabled={disabled}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                title={isRecording ? 'Stop recording' : 'Start recording'}
            >
                {isRecording ? '⏹' : '🎤'}
            </button>
            {isRecording && (
                <>
                    <div className="controls__mic-ripple"></div>
                    <div className="controls__mic-ripple"></div>
                    <div className="controls__mic-ripple"></div>
                </>
            )}
        </div>
    );
}
