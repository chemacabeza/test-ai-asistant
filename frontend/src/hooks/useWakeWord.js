/**
 * Checks if the transcribed text contains the wake word (AI name).
 * Returns an object with detection status and the cleaned text.
 *
 * @param {string} text - The transcribed text
 * @param {string} aiName - The AI assistant name (wake word)
 * @returns {{ detected: boolean, cleanedText: string }}
 */
export function detectWakeWord(text, aiName) {
    if (!text || !aiName) {
        return { detected: false, cleanedText: text || '' };
    }

    const lowerText = text.toLowerCase().trim();
    const lowerName = aiName.toLowerCase().trim();

    let detected = false;
    let cleanedText = text.trim();

    // Check patterns: "hey <name>", "<name>," , "<name> ..."
    if (lowerText.startsWith('hey ' + lowerName)) {
        detected = true;
        cleanedText = cleanedText.substring(('hey ' + aiName).length);
    } else if (lowerText.startsWith(lowerName + ',') ||
        lowerText.startsWith(lowerName + ' ') ||
        lowerText === lowerName) {
        detected = true;
        cleanedText = cleanedText.substring(aiName.length);
    }

    // Remove leading punctuation and whitespace
    cleanedText = cleanedText.replace(/^[,;.!?\s]+/, '');

    return {
        detected,
        cleanedText: cleanedText || text.trim(),
    };
}
