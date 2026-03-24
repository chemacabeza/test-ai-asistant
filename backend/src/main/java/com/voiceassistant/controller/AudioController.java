package com.voiceassistant.controller;

import com.voiceassistant.dto.SpeakRequest;
import com.voiceassistant.dto.TranscribeResponse;
import com.voiceassistant.service.OpenAiService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/audio")
public class AudioController {

    private static final Logger log = LoggerFactory.getLogger(AudioController.class);

    private final OpenAiService openAiService;

    public AudioController(OpenAiService openAiService) {
        this.openAiService = openAiService;
    }

    /**
     * Transcribes audio to text using OpenAI Whisper.
     * Accepts multipart audio file and optional language/aiName parameters.
     */
    @PostMapping("/transcribe")
    public ResponseEntity<TranscribeResponse> transcribe(
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam(value = "language", defaultValue = "English") String language,
            @RequestParam(value = "aiName", defaultValue = "Nova") String aiName) throws IOException {

        log.info("Transcribe request: language={}, aiName={}, fileSize={} bytes",
                language, aiName, audioFile.getSize());

        String transcription = openAiService.transcribe(audioFile.getBytes(), language);
        log.info("Transcription result: {}", transcription);

        // Wake word detection
        boolean wakeWordDetected = detectWakeWord(transcription, aiName);
        String cleanedText = wakeWordDetected ? removeWakeWord(transcription, aiName) : transcription;

        TranscribeResponse response = new TranscribeResponse(
                transcription, language, wakeWordDetected, cleanedText);

        return ResponseEntity.ok(response);
    }

    /**
     * Converts text to speech using OpenAI TTS.
     * Returns audio/mpeg binary data.
     */
    @PostMapping("/speak")
    public ResponseEntity<byte[]> speak(@Valid @RequestBody SpeakRequest request) throws IOException {
        log.info("Speak request: text length={}, voice={}", request.getText().length(), request.getVoice());

        byte[] audioBytes = openAiService.speak(request.getText(), request.getVoice());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("audio/mpeg"));
        headers.setContentLength(audioBytes.length);

        return ResponseEntity.ok().headers(headers).body(audioBytes);
    }

    private boolean detectWakeWord(String text, String aiName) {
        if (text == null || aiName == null)
            return false;
        String lowerText = text.toLowerCase().trim();
        String lowerName = aiName.toLowerCase().trim();

        // Check for "hey <name>", "<name>," or just "<name>" at the start
        return lowerText.startsWith("hey " + lowerName)
                || lowerText.startsWith(lowerName + ",")
                || lowerText.startsWith(lowerName + " ")
                || lowerText.equals(lowerName);
    }

    private String removeWakeWord(String text, String aiName) {
        if (text == null || aiName == null)
            return text;
        String lowerText = text.toLowerCase().trim();
        String lowerName = aiName.toLowerCase().trim();

        String result = text.trim();

        if (lowerText.startsWith("hey " + lowerName)) {
            result = result.substring(("hey " + aiName).length());
        } else if (lowerText.startsWith(lowerName)) {
            result = result.substring(aiName.length());
        }

        // Remove leading punctuation and whitespace
        result = result.replaceFirst("^[,;.!?\\s]+", "");
        return result.isEmpty() ? text.trim() : result;
    }
}
