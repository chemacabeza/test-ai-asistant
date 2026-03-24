package com.voiceassistant.dto;

import jakarta.validation.constraints.NotBlank;

public class SpeakRequest {

    @NotBlank(message = "Text is required")
    private String text;

    private String voice;

    public SpeakRequest() {
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getVoice() {
        return voice;
    }

    public void setVoice(String voice) {
        this.voice = voice;
    }
}
