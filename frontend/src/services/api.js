const API_BASE = '/api';

/**
 * Transcribes audio using the backend Whisper endpoint.
 * @param {Blob} audioBlob - The recorded audio blob
 * @param {string} language - User-selected language
 * @param {string} aiName - The AI assistant name (for wake word detection)
 * @returns {Promise<{text: string, language: string, wakeWordDetected: boolean, cleanedText: string}>}
 */
export async function transcribeAudio(audioBlob, language, aiName) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('language', language);
    formData.append('aiName', aiName);

    const response = await fetch(`${API_BASE}/audio/transcribe`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Transcription failed' }));
        throw new Error(error.message || 'Transcription failed');
    }

    return response.json();
}

/**
 * Gets a chat response from the AI.
 * @param {string} message - The user message
 * @param {string} language - Language for the response
 * @param {string} aiName - AI assistant name
 * @param {Array<{role: string, content: string}>} conversationHistory - Previous messages
 * @returns {Promise<{response: string, language: string, aiName: string}>}
 */
export async function getChatResponse(message, language, aiName, conversationHistory = []) {
    const response = await fetch(`${API_BASE}/chat/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, language, aiName, conversationHistory }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Chat request failed' }));
        throw new Error(error.message || 'Chat request failed');
    }

    return response.json();
}

/**
 * Converts text to speech and returns an audio Blob.
 * @param {string} text - Text to speak
 * @param {string} voice - Voice to use
 * @returns {Promise<Blob>}
 */
export async function speakText(text, voice) {
    const response = await fetch(`${API_BASE}/audio/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Speech synthesis failed' }));
        throw new Error(error.message || 'Speech synthesis failed');
    }

    return response.blob();
}
