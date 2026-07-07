package com.surajupadhye.interviewquestbackend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class AIConfigController {

    @Value("${interviewquest.ai.provider:gemini}")
    private String aiProvider;

    @GetMapping("/api/ai-config")
    public ResponseEntity<Map<String, String>> getAIConfig() {
        return ResponseEntity.ok(Map.of(
                "provider", aiProvider
        ));
    }
}
