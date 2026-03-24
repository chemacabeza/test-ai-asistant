package com.voiceassistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.voiceassistant.config.OpenAiConfig;
import com.voiceassistant.dto.ChatRequest;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class OpenAiService {

    private static final Logger log = LoggerFactory.getLogger(OpenAiService.class);

    private final OkHttpClient httpClient;
    private final OpenAiConfig config;
    private final ObjectMapper objectMapper;

    public OpenAiService(OkHttpClient httpClient, OpenAiConfig config) {
        this.httpClient = httpClient;
        this.config = config;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Transcribes audio using OpenAI Whisper API.
     */
    public String transcribe(byte[] audioBytes, String language) throws IOException {
        String whisperLanguageCode = mapToWhisperLanguageCode(language);

        RequestBody fileBody = RequestBody.create(audioBytes, MediaType.parse("audio/webm"));

        MultipartBody.Builder bodyBuilder = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("file", "audio.webm", fileBody)
                .addFormDataPart("model", config.getWhisperModel());

        if (whisperLanguageCode != null && !whisperLanguageCode.isEmpty()) {
            bodyBuilder.addFormDataPart("language", whisperLanguageCode);
        }

        Request request = new Request.Builder()
                .url(config.getBaseUrl() + "/audio/transcriptions")
                .header("Authorization", "Bearer " + config.getApiKey())
                .post(bodyBuilder.build())
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";

            if (!response.isSuccessful()) {
                log.error("Whisper API error: {} - {}", response.code(), responseBody);
                throw new IOException("Whisper API error: " + response.code() + " - " + responseBody);
            }

            JsonNode jsonNode = objectMapper.readTree(responseBody);
            return jsonNode.get("text").asText();
        }
    }

    /**
     * Generates a chat completion using OpenAI Chat API.
     */
    public String chat(String message, String language, String aiName,
            List<ChatRequest.ChatMessage> history) throws IOException {

        String systemPrompt = buildSystemPrompt(aiName, language);

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", config.getModel());
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 1024);

        ArrayNode messages = requestBody.putArray("messages");

        // System prompt
        ObjectNode systemMessage = messages.addObject();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);

        // Conversation history
        if (history != null) {
            for (ChatRequest.ChatMessage msg : history) {
                ObjectNode historyMessage = messages.addObject();
                historyMessage.put("role", msg.getRole());
                historyMessage.put("content", msg.getContent());
            }
        }

        // Current user message
        ObjectNode userMessage = messages.addObject();
        userMessage.put("role", "user");
        userMessage.put("content", message);

        Request request = new Request.Builder()
                .url(config.getBaseUrl() + "/chat/completions")
                .header("Authorization", "Bearer " + config.getApiKey())
                .header("Content-Type", "application/json")
                .post(RequestBody.create(
                        objectMapper.writeValueAsString(requestBody),
                        MediaType.parse("application/json")))
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";

            if (!response.isSuccessful()) {
                log.error("Chat API error: {} - {}", response.code(), responseBody);
                throw new IOException("Chat API error: " + response.code() + " - " + responseBody);
            }

            JsonNode jsonNode = objectMapper.readTree(responseBody);
            return jsonNode.get("choices").get(0).get("message").get("content").asText();
        }
    }

    /**
     * Converts text to speech using OpenAI TTS API.
     */
    public byte[] speak(String text, String voice) throws IOException {
        String selectedVoice = (voice != null && !voice.isEmpty()) ? voice : config.getTtsVoice();

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", config.getTtsModel());
        requestBody.put("input", text);
        requestBody.put("voice", selectedVoice);
        requestBody.put("response_format", "mp3");

        Request request = new Request.Builder()
                .url(config.getBaseUrl() + "/audio/speech")
                .header("Authorization", "Bearer " + config.getApiKey())
                .header("Content-Type", "application/json")
                .post(RequestBody.create(
                        objectMapper.writeValueAsString(requestBody),
                        MediaType.parse("application/json")))
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "";
                log.error("TTS API error: {} - {}", response.code(), errorBody);
                throw new IOException("TTS API error: " + response.code() + " - " + errorBody);
            }

            if (response.body() == null) {
                throw new IOException("TTS API returned empty body");
            }

            return response.body().bytes();
        }
    }

    private String buildSystemPrompt(String aiName, String language) {
        return String.format(
                "You are an AI assistant named %s. " +
                        "You always respond in %s. " +
                        "You are helpful, concise, and natural. " +
                        "If the user speaks to you, respond as if in a real conversation. " +
                        "Always refer to yourself as %s. " +
                        "Keep your responses conversational and relatively brief, suitable for voice interaction.",
                aiName, language, aiName);
    }

    private String mapToWhisperLanguageCode(String language) {
        if (language == null)
            return null;
        return switch (language.toLowerCase()) {
            case "english" -> "en";
            case "spanish", "español" -> "es";
            case "german", "deutsch" -> "de";
            case "french", "français" -> "fr";
            case "italian", "italiano" -> "it";
            case "portuguese", "português" -> "pt";
            case "japanese", "日本語" -> "ja";
            case "chinese", "中文" -> "zh";
            case "korean", "한국어" -> "ko";
            default -> null;
        };
    }
}
