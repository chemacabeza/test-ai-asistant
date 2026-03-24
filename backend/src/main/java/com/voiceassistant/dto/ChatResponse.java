package com.voiceassistant.dto;

public class ChatResponse {

    private String response;
    private String language;
    private String aiName;

    public ChatResponse() {
    }

    public ChatResponse(String response, String language, String aiName) {
        this.response = response;
        this.language = language;
        this.aiName = aiName;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getAiName() {
        return aiName;
    }

    public void setAiName(String aiName) {
        this.aiName = aiName;
    }
}
