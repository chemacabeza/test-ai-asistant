/**
 * Offline Chat Service — Pattern-matching response generator
 *
 * Handles basic intents (greeting, time, date, joke, math, help)
 * in multiple languages without any network dependency.
 */

// ---- Language responses ----
const RESPONSES = {
    English: {
        greeting: [
            "Hello! I'm {name}, your offline assistant. How can I help?",
            "Hey there! {name} here, running locally. What do you need?",
            "Hi! I'm {name}. I'm working offline but ready to help!",
        ],
        time: [
            "The current time is {time}.",
            "It's {time} right now.",
            "Right now it's {time}.",
        ],
        date: [
            "Today is {date}.",
            "The date today is {date}.",
            "It's {date} today.",
        ],
        joke: [
            "Why do programmers prefer dark mode? Because light attracts bugs!",
            "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
            "There are only 10 types of people in the world: those who understand binary and those who don't.",
            "A SQL query walks into a bar, sees two tables and asks... 'Can I JOIN you?'",
            "Why do Java developers wear glasses? Because they can't C#.",
            "What's a programmer's favorite hangout place? Foo Bar!",
            "Why did the developer go broke? Because he used up all his cache.",
        ],
        weather: [
            "I'm running offline, so I can't check the weather right now. Try switching to online mode for real-time data!",
            "Weather data requires an internet connection. Switch to online mode to get current weather.",
        ],
        math: [
            "The result of {expression} is {result}.",
            "{expression} equals {result}.",
        ],
        capabilities: [
            "I'm running offline! Here's what I can do:\n• Tell you the time and date\n• Tell jokes\n• Do basic math\n• Answer simple questions\n• Have a friendly chat\n\nFor full AI capabilities, switch to online mode.",
        ],
        whoami: [
            "I'm {name}, your AI assistant! I'm currently running in offline mode, which means I work without internet using local processing.",
            "My name is {name}. I'm an AI assistant running locally on your machine — no cloud needed!",
        ],
        thanks: [
            "You're welcome! Happy to help.",
            "No problem at all! Let me know if you need anything else.",
            "Glad I could help! 😊",
        ],
        goodbye: [
            "Goodbye! Have a great day! 👋",
            "See you later! Take care!",
            "Bye! Feel free to come back anytime.",
        ],
        fallback: [
            "I'm in offline mode, so my capabilities are limited. I can tell you the time, date, jokes, or do basic math. For full AI responses, switch to online mode!",
            "Hmm, I'm not sure about that in offline mode. Try asking for the time, a joke, or some math!",
            "That's a great question! Unfortunately, I'd need online mode to give you a proper answer. Try 'what can you do' to see my offline capabilities.",
        ],
    },
    Spanish: {
        greeting: ["¡Hola! Soy {name}, tu asistente sin conexión. ¿En qué puedo ayudarte?"],
        time: ["La hora actual es {time}.", "Son las {time}."],
        date: ["Hoy es {date}.", "La fecha de hoy es {date}."],
        joke: [
            "¿Por qué los programadores prefieren el modo oscuro? ¡Porque la luz atrae a los bugs!",
            "¿Qué le dijo el cero al ocho? ¡Bonito cinturón!",
            "¿Por qué los programadores confunden Halloween con Navidad? Porque Oct 31 = Dec 25.",
        ],
        weather: ["Estoy sin conexión, no puedo consultar el clima. ¡Cambia al modo en línea!"],
        math: ["El resultado de {expression} es {result}."],
        capabilities: ["¡Estoy sin conexión! Puedo decirte la hora, fecha, chistes, y hacer matemáticas básicas."],
        whoami: ["Soy {name}, tu asistente IA funcionando localmente sin internet."],
        thanks: ["¡De nada! Encantado de ayudar."],
        goodbye: ["¡Adiós! ¡Que tengas un buen día! 👋"],
        fallback: ["Estoy en modo sin conexión. Prueba a preguntar la hora, un chiste o cálculos matemáticos."],
    },
    German: {
        greeting: ["Hallo! Ich bin {name}, dein Offline-Assistent. Wie kann ich helfen?"],
        time: ["Die aktuelle Uhrzeit ist {time}.", "Es ist {time}."],
        date: ["Heute ist der {date}.", "Das heutige Datum ist {date}."],
        joke: [
            "Warum bevorzugen Programmierer den Dunkelmodus? Weil Licht Bugs anzieht!",
            "Was ist der Unterschied zwischen einem Informatiker und einem Philosophen? Der Informatiker hat einen Job.",
        ],
        weather: ["Ich bin offline und kann das Wetter nicht abrufen. Wechsle in den Online-Modus!"],
        math: ["Das Ergebnis von {expression} ist {result}."],
        capabilities: ["Ich bin offline! Ich kann dir die Uhrzeit, das Datum, Witze und einfache Mathematik sagen."],
        whoami: ["Ich bin {name}, dein KI-Assistent im Offline-Modus."],
        thanks: ["Gerne geschehen!"],
        goodbye: ["Tschüss! Hab einen schönen Tag! 👋"],
        fallback: ["Ich bin im Offline-Modus. Frag mich nach der Uhrzeit, einem Witz oder Mathematik."],
    },
    French: {
        greeting: ["Bonjour! Je suis {name}, votre assistant hors ligne. Comment puis-je vous aider?"],
        time: ["L'heure actuelle est {time}.", "Il est {time}."],
        date: ["Aujourd'hui c'est le {date}."],
        joke: ["Pourquoi les programmeurs préfèrent-ils le mode sombre? Parce que la lumière attire les bugs!"],
        weather: ["Je suis hors ligne, je ne peux pas vérifier la météo. Passez en mode en ligne!"],
        math: ["Le résultat de {expression} est {result}."],
        capabilities: ["Je suis hors ligne! Je peux vous dire l'heure, la date, des blagues et faire des calculs simples."],
        whoami: ["Je suis {name}, votre assistant IA fonctionnant localement."],
        thanks: ["De rien! Ravi de vous aider."],
        goodbye: ["Au revoir! Bonne journée! 👋"],
        fallback: ["Je suis en mode hors ligne. Essayez de demander l'heure, une blague ou un calcul."],
    },
    Italian: {
        greeting: ["Ciao! Sono {name}, il tuo assistente offline. Come posso aiutarti?"],
        time: ["L'ora attuale è {time}."],
        date: ["Oggi è {date}."],
        joke: ["Perché i programmatori preferiscono la modalità scura? Perché la luce attira i bug!"],
        math: ["Il risultato di {expression} è {result}."],
        capabilities: ["Sono offline! Posso dirti l'ora, la data, barzellette e fare matematica semplice."],
        whoami: ["Sono {name}, il tuo assistente IA in modalità offline."],
        thanks: ["Prego!"],
        goodbye: ["Arrivederci! Buona giornata! 👋"],
        fallback: ["Sono in modalità offline. Prova a chiedere l'ora, una barzelletta o dei calcoli."],
    },
    Portuguese: {
        greeting: ["Olá! Sou {name}, seu assistente offline. Como posso ajudar?"],
        time: ["A hora atual é {time}."],
        date: ["Hoje é {date}."],
        joke: ["Por que os programadores preferem o modo escuro? Porque a luz atrai bugs!"],
        math: ["O resultado de {expression} é {result}."],
        capabilities: ["Estou offline! Posso dizer a hora, data, piadas e fazer matemática básica."],
        whoami: ["Sou {name}, seu assistente IA funcionando localmente."],
        thanks: ["De nada!"],
        goodbye: ["Tchau! Tenha um bom dia! 👋"],
        fallback: ["Estou no modo offline. Tente perguntar a hora, uma piada ou cálculos."],
    },
    Japanese: {
        greeting: ["こんにちは！{name}です。オフラインアシスタントとしてお手伝いします。"],
        time: ["現在の時刻は{time}です。"],
        date: ["今日は{date}です。"],
        joke: ["プログラマーがダークモードを好むのはなぜ？光がバグを引き寄せるからです！"],
        math: ["{expression}の結果は{result}です。"],
        capabilities: ["オフラインモードです！時間、日付、ジョーク、基本的な計算ができます。"],
        whoami: ["私は{name}、オフラインで動作するAIアシスタントです。"],
        thanks: ["どういたしまして！"],
        goodbye: ["さようなら！良い一日を！👋"],
        fallback: ["オフラインモードです。時間、ジョーク、計算を試してみてください。"],
    },
    Chinese: {
        greeting: ["你好！我是{name}，你的离线助手。有什么可以帮你的？"],
        time: ["现在的时间是{time}。"],
        date: ["今天是{date}。"],
        joke: ["为什么程序员喜欢暗色模式？因为光线会吸引bug！"],
        math: ["{expression}的结果是{result}。"],
        capabilities: ["我在离线模式！可以告诉你时间、日期、笑话和做简单数学。"],
        whoami: ["我是{name}，在本地运行的AI助手。"],
        thanks: ["不客气！"],
        goodbye: ["再见！祝你有美好的一天！👋"],
        fallback: ["我在离线模式。试试问时间、笑话或数学计算。"],
    },
    Korean: {
        greeting: ["안녕하세요! 저는 {name}입니다. 오프라인 어시스턴트로 도와드리겠습니다."],
        time: ["현재 시간은 {time}입니다."],
        date: ["오늘은 {date}입니다."],
        joke: ["프로그래머가 다크 모드를 좋아하는 이유는? 빛이 버그를 끌어들이기 때문입니다!"],
        math: ["{expression}의 결과는 {result}입니다."],
        capabilities: ["오프라인 모드입니다! 시간, 날짜, 농담, 기본 수학을 할 수 있습니다."],
        whoami: ["저는 {name}, 로컬에서 실행되는 AI 어시스턴트입니다."],
        thanks: ["천만에요!"],
        goodbye: ["안녕히 가세요! 좋은 하루 되세요! 👋"],
        fallback: ["오프라인 모드입니다. 시간, 농담 또는 수학 계산을 시도해 보세요."],
    },
};

// ---- Intent detection ----
const INTENT_PATTERNS = {
    greeting: /\b(hello|hi|hey|good morning|good afternoon|good evening|hola|bonjour|hallo|ciao|salut|olá|こんにちは|你好|안녕)\b/i,
    time: /\b(time|what time|hora|uhrzeit|heure|ora|tempo|時間|时间|시간)\b/i,
    date: /\b(date|today|what day|fecha|datum|jour|data|日付|日期|날짜)\b/i,
    joke: /\b(joke|funny|laugh|humor|chiste|witz|blague|barzelletta|piada|冗談|笑话|농담)\b/i,
    weather: /\b(weather|forecast|temperature|clima|wetter|météo|meteo|天気|天气|날씨)\b/i,
    math: /(\d+)\s*([+\-*/×÷])\s*(\d+)/,
    capabilities: /\b(what can you|help|capabilities|can you do|能做什么|できること)\b/i,
    whoami: /\b(who are you|your name|what are you|quién eres|wer bist du|qui es-tu|chi sei|quem é você|あなたは誰|你是谁|누구)\b/i,
    thanks: /\b(thanks|thank you|gracias|danke|merci|grazie|obrigado|ありがとう|谢谢|감사)\b/i,
    goodbye: /\b(bye|goodbye|see you|adiós|tschüss|au revoir|arrivederci|tchau|さようなら|再见|안녕히)\b/i,
};

function detectIntent(text) {
    // Check math first (regex with captures)
    const mathMatch = text.match(INTENT_PATTERNS.math);
    if (mathMatch) {
        return { intent: 'math', match: mathMatch };
    }

    for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
        if (intent === 'math') continue;
        if (pattern.test(text)) return { intent };
    }
    return { intent: 'fallback' };
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function solveMath(a, op, b) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    switch (op) {
        case '+': return numA + numB;
        case '-': return numA - numB;
        case '*': case '×': return numA * numB;
        case '/': case '÷': return numB !== 0 ? numA / numB : 'undefined (division by zero)';
        default: return 'unknown';
    }
}

function formatTemplate(template, aiName, extras = {}) {
    const now = new Date();
    let result = template
        .replace(/\{name\}/g, aiName)
        .replace(/\{time\}/g, now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        .replace(/\{date\}/g, now.toLocaleDateString([], {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        }));

    if (extras.expression) result = result.replace(/\{expression\}/g, extras.expression);
    if (extras.result !== undefined) result = result.replace(/\{result\}/g, String(extras.result));

    return result;
}

/**
 * Generate a response based on the user's message.
 */
function generateResponse(message, language, aiName, conversationHistory = []) {
    const { intent, match } = detectIntent(message);
    const langResponses = RESPONSES[language] || RESPONSES.English;

    if (intent === 'math' && match) {
        const [, a, op, b] = match;
        const result = solveMath(a, op, b);
        const templates = langResponses.math || RESPONSES.English.math;
        return formatTemplate(pickRandom(templates), aiName, {
            expression: `${a} ${op} ${b}`,
            result,
        });
    }

    const templates = langResponses[intent] || langResponses.fallback || RESPONSES.English.fallback;
    return formatTemplate(pickRandom(templates), aiName);
}

module.exports = { generateResponse };
