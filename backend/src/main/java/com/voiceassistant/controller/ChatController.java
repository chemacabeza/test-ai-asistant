package com.voiceassistant.controller;

import com.voiceassistant.dto.ChatRequest;
import com.voiceassistant.dto.ChatResponse;
import com.voiceassistant.service.OpenAiService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final OpenAiService openAiService;

    public ChatController(OpenAiService openAiService) {
        this.openAiService = openAiService;
    }

    /**
     * Generates an AI chat response using OpenAI Chat Completions.
     */
    @PostMapping("/respond")
    public ResponseEntity<ChatResponse> respond(@Valid @RequestBody ChatRequest request) throws IOException {
        log.info("Chat request: message='{}', language={}, aiName={}",
                request.getMessage(), request.getLanguage(), request.getAiName());

        String response = openAiService.chat(
                request.getMessage(),
                request.getLanguage(),
                request.getAiName(),
                request.getConversationHistory());

        log.info("Chat response: {}", response);

        return ResponseEntity.ok(new ChatResponse(response, request.getLanguage(), request.getAiName()));
    }
}
