import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import ChatHistory from './components/ChatHistory';
import MicrophoneButton from './components/MicrophoneButton';
import StatusIndicator from './components/StatusIndicator';
import TextInput from './components/TextInput';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { detectWakeWord } from './hooks/useWakeWord';
import { transcribeAudio, getChatResponse, speakText } from './services/api';
import {
    offlineTranscribe,
    offlineSpeak,
    generateOfflineResponse,
    isOfflineSupported,
} from './services/offline';

export default function App() {
    // Settings state
    const [language, setLanguage] = useState('English');
    const [aiName, setAiName] = useState('Nova');
    const [voice, setVoice] = useState('nova');
    const [mode, setMode] = useState('push'); // 'push' or 'continuous'
    const [isOnline, setIsOnline] = useState(true);

    // Conversation state
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    // Audio
    const { isRecording, startRecording, stopRecording } = useAudioRecorder();
    const audioRef = useRef(null);
    const continuousRef = useRef(false);
    const autoStopTimerRef = useRef(null);
    const CONTINUOUS_RECORD_DURATION = 5000; // Auto-stop recording after 5 seconds

    // Build conversation history for the API (last 20 messages)
    const getConversationHistory = useCallback(() => {
        return messages.slice(-20).map((m) => ({
            role: m.role,
            content: m.content,
        }));
    }, [messages]);

    // ---- Shared: process a text message through the offline pipeline ----
    const processTextOffline = useCallback(
        async (userText) => {
            try {
                // Wake word check
                const wakeResult = detectWakeWord(userText, aiName);

                // Add user message
                setMessages((prev) => [
                    ...prev,
                    { role: 'user', content: userText, timestamp: Date.now() },
                ]);

                if (!wakeResult.detected) {
                    setStatus('wake-word-missing');
                    setTimeout(() => setStatus('idle'), 3000);
                    return;
                }

                const queryText = wakeResult.cleanedText || userText;

                // Local response
                setStatus('thinking');
                const aiText = generateOfflineResponse(queryText, language, aiName);

                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: aiText, timestamp: Date.now() },
                ]);

                // Browser TTS
                setStatus('speaking');
                try {
                    await offlineSpeak(aiText, language);
                } catch (ttsErr) {
                    console.warn('Offline TTS failed, skipping:', ttsErr.message);
                }
                // After offline TTS completes, set idle (the continuous useEffect will restart)
                setStatus('idle');
            } catch (err) {
                console.error('Offline processing error:', err);
                setError(err.message);
                setStatus('error');
                setTimeout(() => {
                    setStatus('idle');
                    setError(null);
                }, 4000);
            }
        },
        [language, aiName]
    );

    // ---- Shared: process a text message through the online pipeline ----
    const processTextOnline = useCallback(
        async (userText) => {
            try {
                // Wake word check
                const wakeResult = detectWakeWord(userText, aiName);

                setMessages((prev) => [
                    ...prev,
                    { role: 'user', content: userText, timestamp: Date.now() },
                ]);

                if (!wakeResult.detected) {
                    setStatus('wake-word-missing');
                    setTimeout(() => setStatus('idle'), 3000);
                    return;
                }

                const queryText = wakeResult.cleanedText || userText;

                // Chat completion
                setStatus('thinking');
                const chatResult = await getChatResponse(
                    queryText,
                    language,
                    aiName,
                    getConversationHistory()
                );

                const aiText = chatResult.response;

                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: aiText, timestamp: Date.now() },
                ]);

                // Text-to-speech
                setStatus('speaking');
                const audioResponseBlob = await speakText(aiText, voice);
                const audioUrl = URL.createObjectURL(audioResponseBlob);

                if (audioRef.current) {
                    audioRef.current.src = audioUrl;
                    audioRef.current.onended = () => {
                        URL.revokeObjectURL(audioUrl);
                        setStatus('idle');
                    };
                    audioRef.current.play().catch((err) => {
                        console.error('Audio playback failed:', err);
                        setStatus('idle');
                    });
                }
            } catch (err) {
                console.error('Online processing error:', err);
                setError(err.message);
                setStatus('error');
                setTimeout(() => {
                    setStatus('idle');
                    setError(null);
                }, 4000);
            }
        },
        [language, aiName, voice, getConversationHistory]
    );

    // ---- ONLINE pipeline: audio blob → transcribe → chat → TTS → playback ----
    const processAudioOnline = useCallback(
        async (audioBlob) => {
            if (!audioBlob) return;

            try {
                setStatus('transcribing');
                const transcription = await transcribeAudio(audioBlob, language, aiName);
                const userText = transcription.text;

                if (!userText || userText.trim() === '') {
                    setStatus('idle');
                    return;
                }

                // Wake word check
                const wakeResult = transcription.wakeWordDetected
                    ? { detected: true, cleanedText: transcription.cleanedText }
                    : detectWakeWord(userText, aiName);

                setMessages((prev) => [
                    ...prev,
                    { role: 'user', content: userText, timestamp: Date.now() },
                ]);

                if (!wakeResult.detected) {
                    setStatus('wake-word-missing');
                    setTimeout(() => setStatus('idle'), 3000);
                    return;
                }

                const queryText = wakeResult.cleanedText || userText;

                setStatus('thinking');
                const chatResult = await getChatResponse(
                    queryText,
                    language,
                    aiName,
                    getConversationHistory()
                );

                const aiText = chatResult.response;

                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: aiText, timestamp: Date.now() },
                ]);

                setStatus('speaking');
                const audioResponseBlob = await speakText(aiText, voice);
                const audioUrl = URL.createObjectURL(audioResponseBlob);

                if (audioRef.current) {
                    audioRef.current.src = audioUrl;
                    audioRef.current.onended = () => {
                        URL.revokeObjectURL(audioUrl);
                        setStatus('idle');

                        if (continuousRef.current) {
                            startRecording().catch(console.error);
                        }
                    };
                    audioRef.current.play().catch((err) => {
                        console.error('Audio playback failed:', err);
                        setStatus('idle');
                    });
                }
            } catch (err) {
                console.error('Processing error:', err);
                setError(err.message);
                setStatus('error');
                setTimeout(() => {
                    setStatus('idle');
                    setError(null);
                }, 4000);
            }
        },
        [language, aiName, voice, getConversationHistory, startRecording]
    );

    // ---- OFFLINE voice pipeline: browser STT → local response → browser TTS ----
    const processOfflineVoice = useCallback(async () => {
        try {
            setStatus('transcribing');
            const userText = await offlineTranscribe(language);

            if (!userText || userText.trim() === '') {
                setStatus('idle');
                return;
            }

            await processTextOffline(userText);
        } catch (err) {
            // If SpeechRecognition fails (e.g. no internet in Chrome), show helpful message
            console.error('Offline voice error:', err);
            setError('Voice recognition unavailable offline. Type your message below instead.');
            setStatus('idle');
            setTimeout(() => setError(null), 6000);
        }
    }, [language, processTextOffline]);

    // Handle text input submission (works in both modes)
    const handleTextSubmit = useCallback(
        (text) => {
            if (isOnline) {
                processTextOnline(text);
            } else {
                processTextOffline(text);
            }
        },
        [isOnline, processTextOnline, processTextOffline]
    );

    // Handle mic button click
    const handleMicClick = useCallback(async () => {
        if (isOnline) {
            // Online: use MediaRecorder
            if (isRecording) {
                const blob = await stopRecording();
                if (blob) {
                    processAudioOnline(blob);
                }
            } else {
                setError(null);
                try {
                    await startRecording();
                    setStatus('recording');
                } catch (err) {
                    setError(err.message);
                    setStatus('error');
                }
            }
        } else {
            // Offline: try browser SpeechRecognition
            if (status !== 'idle') return;
            setError(null);

            const support = isOfflineSupported();
            if (!support.hasSpeechRecognition) {
                setError('Voice not available offline in this browser. Use the text input below.');
                return;
            }

            setStatus('recording');
            processOfflineVoice();
        }
    }, [isOnline, isRecording, startRecording, stopRecording, processAudioOnline, processOfflineVoice, status]);

    // Auto-start recording when in continuous mode and idle
    useEffect(() => {
        continuousRef.current = mode === 'continuous';

        // When leaving continuous mode, clean up auto-stop timer
        if (mode !== 'continuous') {
            if (autoStopTimerRef.current) {
                clearTimeout(autoStopTimerRef.current);
                autoStopTimerRef.current = null;
            }
            return;
        }

        if (status === 'idle') {
            // Small delay to avoid re-triggering too fast
            const restartTimer = setTimeout(() => {
                if (isOnline) {
                    startRecording()
                        .then(() => {
                            setStatus('recording');
                            // Auto-stop after CONTINUOUS_RECORD_DURATION
                            autoStopTimerRef.current = setTimeout(async () => {
                                const blob = await stopRecording();
                                if (blob) {
                                    processAudioOnline(blob);
                                }
                            }, CONTINUOUS_RECORD_DURATION);
                        })
                        .catch((err) => {
                            setError(err.message);
                            setStatus('error');
                        });
                } else {
                    setStatus('recording');
                    processOfflineVoice();
                }
            }, 500);

            // Only clear the restart delay — NOT the auto-stop timer
            return () => clearTimeout(restartTimer);
        }
    }, [mode, status]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current && audioRef.current.src) {
                URL.revokeObjectURL(audioRef.current.src);
            }
        };
    }, []);

    const isProcessing = ['transcribing', 'thinking', 'speaking'].includes(status);

    return (
        <div className="app">
            <Header aiName={aiName} />

            <SettingsPanel
                language={language}
                setLanguage={setLanguage}
                aiName={aiName}
                setAiName={setAiName}
                voice={voice}
                setVoice={setVoice}
                mode={mode}
                setMode={setMode}
                isOnline={isOnline}
                setIsOnline={setIsOnline}
            />

            <ChatHistory
                messages={messages}
                isProcessing={isProcessing}
                aiName={aiName}
            />

            <div className="controls">
                <MicrophoneButton
                    isRecording={isRecording || status === 'recording'}
                    onClick={handleMicClick}
                    disabled={isProcessing && status !== 'recording'}
                />
                <StatusIndicator
                    status={isRecording || (!isOnline && status === 'recording') ? 'recording' : status}
                    isOnline={isOnline}
                />
                {error && (
                    <div style={{ color: 'var(--color-accent-danger)', fontSize: 'var(--font-size-xs)' }}>
                        {error}
                    </div>
                )}
            </div>

            {/* Text input — always visible, essential for offline mode */}
            <TextInput
                onSubmit={handleTextSubmit}
                disabled={isProcessing}
                isOnline={isOnline}
            />

            {/* Hidden audio element for online TTS playback */}
            <audio ref={audioRef} style={{ display: 'none' }} />
        </div>
    );
}
