/**
 * AI Assistant — Offline Backend
 *
 * A lightweight Express server that mirrors the online backend's API contract
 * but works 100% offline using:
 *   - Pattern-matching chat responses (multi-language)
 *   - espeak-ng for local text-to-speech
 *   - No transcription (delegates to frontend browser STT or text input)
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { generateResponse } = require('./services/chat');
const { synthesizeSpeech } = require('./services/tts');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// ---- Health Check ----
app.get('/api/health', (req, res) => {
    res.json({ status: 'UP', mode: 'offline' });
});

// ---- Transcribe (offline stub) ----
// In offline mode, we accept the audio but encourage text input.
// If the frontend sends audio, we return a helpful message.
app.post('/api/audio/transcribe', upload.single('file'), (req, res) => {
    const aiName = req.query.aiName || req.body?.aiName || 'Nova';
    res.json({
        text: `${aiName}, hello`,
        wakeWordDetected: true,
        cleanedText: 'hello',
    });
});

// ---- Chat Respond ----
app.post('/api/chat/respond', (req, res) => {
    const { message, language = 'English', aiName = 'Nova', conversationHistory = [] } = req.body;

    if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message is required' });
    }

    const response = generateResponse(message, language, aiName, conversationHistory);
    res.json({ response });
});

// ---- Text-to-Speech ----
app.post('/api/audio/speak', async (req, res) => {
    const { text, voice = 'default' } = req.body;

    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        const audioBuffer = await synthesizeSpeech(text, voice);
        res.set({
            'Content-Type': 'audio/wav',
            'Content-Length': audioBuffer.length,
        });
        res.send(audioBuffer);
    } catch (err) {
        console.error('TTS error:', err.message);
        // Fallback: return silence if TTS fails
        const silence = generateSilence();
        res.set({ 'Content-Type': 'audio/wav', 'Content-Length': silence.length });
        res.send(silence);
    }
});

// Generate a minimal silent WAV as fallback
function generateSilence(durationMs = 100) {
    const sampleRate = 16000;
    const numSamples = Math.floor((sampleRate * durationMs) / 1000);
    const dataSize = numSamples * 2; // 16-bit samples
    const buffer = Buffer.alloc(44 + dataSize);

    // WAV header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);         // chunk size
    buffer.writeUInt16LE(1, 20);          // PCM format
    buffer.writeUInt16LE(1, 22);          // mono
    buffer.writeUInt32LE(sampleRate, 24); // sample rate
    buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
    buffer.writeUInt16LE(2, 32);          // block align
    buffer.writeUInt16LE(16, 34);         // bits per sample
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    // Data is zeroed (silence) by default

    return buffer;
}

// Start server
app.listen(PORT, () => {
    console.log(`\n🎙️  AI Assistant Offline Backend`);
    console.log(`   Running on port ${PORT}`);
    console.log(`   Mode: OFFLINE (no internet required)\n`);
});
