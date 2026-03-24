import React from 'react';

const LANGUAGES = [
    { value: 'English', label: '🇬🇧 English' },
    { value: 'Spanish', label: '🇪🇸 Spanish' },
    { value: 'German', label: '🇩🇪 German' },
    { value: 'French', label: '🇫🇷 French' },
    { value: 'Italian', label: '🇮🇹 Italian' },
    { value: 'Portuguese', label: '🇵🇹 Portuguese' },
    { value: 'Japanese', label: '🇯🇵 Japanese' },
    { value: 'Chinese', label: '🇨🇳 Chinese' },
    { value: 'Korean', label: '🇰🇷 Korean' },
];

const VOICES = [
    { value: 'alloy', label: 'Alloy (Neutral)' },
    { value: 'echo', label: 'Echo (Male)' },
    { value: 'fable', label: 'Fable (Expressive)' },
    { value: 'onyx', label: 'Onyx (Deep Male)' },
    { value: 'nova', label: 'Nova (Female)' },
    { value: 'shimmer', label: 'Shimmer (Soft Female)' },
];

export default function SettingsPanel({
    language,
    setLanguage,
    aiName,
    setAiName,
    voice,
    setVoice,
    mode,
    setMode,
    isOnline,
    setIsOnline,
}) {
    return (
        <div className="settings">
            <div className="settings__group">
                <label className="settings__label" htmlFor="language-select">
                    Language
                </label>
                <select
                    id="language-select"
                    className="settings__select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    {LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                            {lang.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="settings__group">
                <label className="settings__label" htmlFor="ai-name-input">
                    AI Name
                </label>
                <input
                    id="ai-name-input"
                    className="settings__input"
                    type="text"
                    value={aiName}
                    onChange={(e) => setAiName(e.target.value)}
                    placeholder="e.g. Nova, Helga, Jarvis"
                    maxLength={30}
                />
            </div>

            <div className="settings__group">
                <label className="settings__label" htmlFor="voice-select">
                    Voice
                </label>
                <select
                    id="voice-select"
                    className="settings__select"
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                >
                    {VOICES.map((v) => (
                        <option key={v.value} value={v.value}>
                            {v.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="settings__group">
                <label className="settings__label">Mode</label>
                <div className="controls__mode-toggle">
                    <button
                        className={`controls__mode-btn ${mode === 'push' ? 'controls__mode-btn--active' : ''}`}
                        onClick={() => setMode('push')}
                    >
                        Push to Talk
                    </button>
                    <button
                        className={`controls__mode-btn ${mode === 'continuous' ? 'controls__mode-btn--active' : ''}`}
                        onClick={() => setMode('continuous')}
                    >
                        Continuous
                    </button>
                </div>
            </div>

            <div className="settings__group">
                <label className="settings__label">Connection</label>
                <div className="controls__mode-toggle">
                    <button
                        className={`controls__mode-btn ${isOnline ? 'controls__mode-btn--active' : ''}`}
                        onClick={() => setIsOnline(true)}
                    >
                        ☁️ Online
                    </button>
                    <button
                        className={`controls__mode-btn ${!isOnline ? 'controls__mode-btn--active controls__mode-btn--offline' : ''}`}
                        onClick={() => setIsOnline(false)}
                    >
                        📴 Offline
                    </button>
                </div>
            </div>
        </div>
    );
}
