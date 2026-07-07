package com.surajupadhye.interviewquestbackend.controller;

import com.surajupadhye.interviewquestbackend.security.UserDetailsImpl;
import com.surajupadhye.interviewquestbackend.service.UserApiKeyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users/profile/api-key")
public class UserApiKeyController {

    @Autowired
    private UserApiKeyService apiKeyService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> getStatus(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        boolean hasKey = apiKeyService.hasApiKey(userDetails.getId());
        return ResponseEntity.ok(Map.of("hasKey", hasKey));
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> saveKey(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> request) {

        String key = request.get("apiKey");
        if (key == null || key.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "API Key is required"));
        }

        try {
            apiKeyService.saveUserKey(userDetails.getId(), key);
            return ResponseEntity.ok(Map.of("message", "Gemini API Key saved and validated successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to save and validate key: " + e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteKey(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        apiKeyService.deleteUserKey(userDetails.getId());
        return ResponseEntity.noContent().build();
    }
}
