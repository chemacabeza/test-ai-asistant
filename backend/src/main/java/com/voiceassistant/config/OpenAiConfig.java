package com.voiceassistant.config;

import okhttp3.OkHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class OpenAiConfig {

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    @Value("${openai.tts-model}")
    private String ttsModel;

    @Value("${openai.tts-voice}")
    private String ttsVoice;

    @Value("${openai.whisper-model}")
    private String whisperModel;

    @Value("${openai.base-url}")
    private String baseUrl;

    @Bean
    public OkHttpClient okHttpClient() {
        return new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(60, TimeUnit.SECONDS)
                .build();
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getModel() {
        return model;
    }

    public String getTtsModel() {
        return ttsModel;
    }

    public String getTtsVoice() {
        return ttsVoice;
    }

    public String getWhisperModel() {
        return whisperModel;
    }

    public String getBaseUrl() {
        return baseUrl;
    }
}
