/**
 * Offline TTS Service — Local text-to-speech using espeak-ng
 *
 * Generates WAV audio from text entirely offline.
 * Falls back to a minimal silent WAV if espeak-ng is not available.
 */

const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const os = require('os');

const execFileAsync = promisify(execFile);

// Language mapping for espeak-ng
const LANG_CODES = {
    English: 'en',
    Spanish: 'es',
    German: 'de',
    French: 'fr',
    Italian: 'it',
    Portuguese: 'pt',
    Japanese: 'ja',
    Chinese: 'cmn',
    Korean: 'ko',
};

// Voice speed (words per minute)
const SPEED = 160;

/**
 * Synthesize speech from text using espeak-ng.
 * Returns a Buffer containing WAV audio data.
 */
async function synthesizeSpeech(text, voice = 'default') {
    const lang = LANG_CODES[voice] || LANG_CODES.English || 'en';
    const tmpFile = path.join(os.tmpdir(), `tts-${Date.now()}.wav`);

    try {
        // Try espeak-ng first
        await execFileAsync('espeak-ng', [
            '-v', lang,
            '-s', String(SPEED),
            '-w', tmpFile,
            '--', text,
        ], { timeout: 10000 });

        const audioData = fs.readFileSync(tmpFile);
        fs.unlinkSync(tmpFile);
        return audioData;
    } catch (espeakNgErr) {
        // Try espeak as fallback (some systems have espeak but not espeak-ng)
        try {
            await execFileAsync('espeak', [
                '-v', lang,
                '-s', String(SPEED),
                '-w', tmpFile,
                '--', text,
            ], { timeout: 10000 });

            const audioData = fs.readFileSync(tmpFile);
            fs.unlinkSync(tmpFile);
            return audioData;
        } catch (espeakErr) {
            // Try macOS 'say' command
            try {
                await execFileAsync('say', [
                    '-o', tmpFile,
                    '--data-format=LEI16@16000',
                    text,
                ], { timeout: 10000 });

                const audioData = fs.readFileSync(tmpFile);
                fs.unlinkSync(tmpFile);
                return audioData;
            } catch (sayErr) {
                console.warn('No TTS engine available (espeak-ng, espeak, or say). Returning silence.');
                throw new Error('No local TTS engine found');
            }
        }
    } finally {
        // Cleanup temp file if it still exists
        try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore */ }
    }
}

module.exports = { synthesizeSpeech };
