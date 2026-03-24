/**
 * Offline AI Service
 *
 * Uses browser-native Web Speech API for STT and TTS,
 * and a local pattern-matching response generator.
 * No backend or internet connection required.
 */

// ---- Language mapping for Web Speech API ----
const LANGUAGE_CODES = {
    English: 'en-US',
    Spanish: 'es-ES',
    German: 'de-DE',
    French: 'fr-FR',
    Italian: 'it-IT',
    Portuguese: 'pt-PT',
    Japanese: 'ja-JP',
    Chinese: 'zh-CN',
    Korean: 'ko-KR',
};

// ---- Offline responses by language ----
const RESPONSES = {
    English: {
        greeting: ["Hello! I'm {name}, your offline assistant.", "Hey there! {name} here. I'm running in offline mode."],
        time: ["The current time is {time}.", "It's {time} right now."],
        date: ["Today is {date}.", "The date today is {date}."],
        joke: [
            "Why do programmers prefer dark mode? Because light attracts bugs!",
            "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
            "There are only 10 types of people in the world: those who understand binary and those who don't.",
        ],
        help: ["I'm running offline so my capabilities are limited. I can tell you the time, date, or a joke! Try asking me."],
        fallback: [
            "I'm in offline mode right now, so I can only handle basic commands like time, date, and jokes.",
            "Sorry, I'm running offline. Try asking for the time, date, or a joke!",
            "I'm {name} running locally. I can tell you the time, date, or share a joke. For full AI responses, switch to online mode.",
        ],
    },
    Spanish: {
        greeting: ["¡Hola! Soy {name}, tu asistente sin conexión.", "¡Hey! Aquí {name}. Estoy en modo sin conexión."],
        time: ["La hora actual es {time}.", "Son las {time}."],
        date: ["Hoy es {date}.", "La fecha de hoy es {date}."],
        joke: [
            "¿Por qué los programadores prefieren el modo oscuro? ¡Porque la luz atrae a los bugs!",
            "¿Qué le dijo el cero al ocho? ¡Bonito cinturón!",
        ],
        help: ["Estoy sin conexión, así que mis capacidades son limitadas. ¡Puedo decirte la hora, la fecha o un chiste!"],
        fallback: [
            "Estoy en modo sin conexión. Intenta preguntar por la hora, la fecha o un chiste.",
            "Soy {name} funcionando localmente. Para respuestas completas, activa el modo en línea.",
        ],
    },
    German: {
        greeting: ["Hallo! Ich bin {name}, dein Offline-Assistent.", "Hey! Hier ist {name}. Ich bin im Offline-Modus."],
        time: ["Die aktuelle Uhrzeit ist {time}.", "Es ist {time}."],
        date: ["Heute ist der {date}.", "Das heutige Datum ist {date}."],
        joke: [
            "Warum bevorzugen Programmierer den Dunkelmodus? Weil Licht Bugs anzieht!",
            "Was ist der Unterschied zwischen einem Informatiker und einem Philosophen? Der Informatiker hat einen Job.",
        ],
        help: ["Ich bin offline, daher sind meine Fähigkeiten begrenzt. Ich kann dir die Uhrzeit, das Datum oder einen Witz sagen!"],
        fallback: [
            "Ich bin im Offline-Modus. Frag mich nach der Uhrzeit, dem Datum oder einem Witz.",
            "Ich bin {name} im lokalen Modus. Für vollständige KI-Antworten wechsle in den Online-Modus.",
        ],
    },
    French: {
        greeting: ["Bonjour ! Je suis {name}, votre assistant hors ligne.", "Salut ! {name} ici. Je suis en mode hors ligne."],
        time: ["L'heure actuelle est {time}.", "Il est {time}."],
        date: ["Aujourd'hui c'est le {date}.", "La date d'aujourd'hui est le {date}."],
        joke: [
            "Pourquoi les programmeurs préfèrent-ils le mode sombre ? Parce que la lumière attire les bugs !",
        ],
        help: ["Je suis hors ligne, mes capacités sont donc limitées. Je peux vous dire l'heure, la date ou une blague !"],
        fallback: [
            "Je suis en mode hors ligne. Essayez de demander l'heure, la date ou une blague.",
            "Je suis {name} en mode local. Pour des réponses IA complètes, passez en mode en ligne.",
        ],
    },
};

// ---- Intent detection ----
const INTENT_PATTERNS = {
    greeting: /\b(hello|hi|hey|good morning|good afternoon|hola|bonjour|hallo|ciao|salut|grüß)\b/i,
    time: /\b(time|hora|uhrzeit|heure|ora|時間|시간)\b/i,
    date: /\b(date|today|fecha|datum|jour|data|日付|날짜)\b/i,
    joke: /\b(joke|funny|laugh|chiste|witz|blague|barzelletta|冗談|농담)\b/i,
    help: /\b(help|can you|what can|ayuda|hilfe|aide|aiuto)\b/i,
};

function detectIntent(text) {
    for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
        if (pattern.test(text)) return intent;
    }
    return 'fallback';
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function formatResponse(template, aiName) {
    const now = new Date();
    return template
        .replace(/\{name\}/g, aiName)
        .replace(/\{time\}/g, now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        .replace(/\{date\}/g, now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
}

/**
 * Generate an offline response based on the user's message.
 */
export function generateOfflineResponse(message, language, aiName) {
    const intent = detectIntent(message);
    const langResponses = RESPONSES[language] || RESPONSES.English;
    const templates = langResponses[intent] || langResponses.fallback;
    return formatResponse(pickRandom(templates), aiName);
}

/**
 * Offline speech-to-text using Web Speech API (SpeechRecognition).
 * Returns a promise that resolves with the transcript.
 */
export function offlineTranscribe(language) {
    return new Promise((resolve, reject) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            reject(new Error('Speech recognition is not supported in this browser. Try Chrome or Edge.'));
            return;
        }

        let resolved = false;

        const recognition = new SpeechRecognition();
        recognition.lang = LANGUAGE_CODES[language] || 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onresult = (event) => {
            if (!resolved) {
                resolved = true;
                const transcript = event.results[0][0].transcript;
                resolve(transcript);
            }
        };

        recognition.onerror = (event) => {
            if (!resolved) {
                resolved = true;
                if (event.error === 'no-speech') {
                    resolve('');
                } else {
                    reject(new Error(`Speech recognition error: ${event.error}`));
                }
            }
        };

        recognition.onend = () => {
            // If no result or error was fired, resolve with empty string
            if (!resolved) {
                resolved = true;
                resolve('');
            }
        };

        recognition.start();

        // Auto-stop after 10 seconds
        setTimeout(() => {
            try { recognition.stop(); } catch (e) { /* ignore */ }
        }, 10000);
    });
}

/**
 * Offline text-to-speech using Web Speech API (SpeechSynthesis).
 * Returns a promise that resolves when speaking is done.
 */
export function offlineSpeak(text, language) {
    return new Promise((resolve, reject) => {
        if (!window.speechSynthesis) {
            reject(new Error('Speech synthesis is not supported in this browser.'));
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = LANGUAGE_CODES[language] || 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to find a matching voice
        const voices = window.speechSynthesis.getVoices();
        const langCode = LANGUAGE_CODES[language] || 'en-US';
        const matchingVoice = voices.find((v) => v.lang.startsWith(langCode.split('-')[0]));
        if (matchingVoice) {
            utterance.voice = matchingVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = (e) => reject(new Error(`Speech synthesis error: ${e.error}`));

        window.speechSynthesis.speak(utterance);
    });
}

/**
 * Check if offline speech features are available in this browser.
 */
export function isOfflineSupported() {
    const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const hasSpeechSynthesis = !!window.speechSynthesis;
    return { hasSpeechRecognition, hasSpeechSynthesis, fullySupported: hasSpeechRecognition && hasSpeechSynthesis };
}
