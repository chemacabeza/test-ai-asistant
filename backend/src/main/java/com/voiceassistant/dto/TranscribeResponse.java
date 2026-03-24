package com.voiceassistant.dto;

public class TranscribeResponse {

    private String text;
    private String language;
    private boolean wakeWordDetected;
    private String cleanedText;

    public TranscribeResponse() {
    }

    public TranscribeResponse(String text, String language, boolean wakeWordDetected, String cleanedText) {
        this.text = text;
        this.language = language;
        this.wakeWordDetected = wakeWordDetected;
        this.cleanedText = cleanedText;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public boolean isWakeWordDetected() {
        return wakeWordDetected;
    }

    public void setWakeWordDetected(boolean wakeWordDetected) {
        this.wakeWordDetected = wakeWordDetected;
    }

    public String getCleanedText() {
        return cleanedText;
    }

    public void setCleanedText(String cleanedText) {
        this.cleanedText = cleanedText;
    }
}
