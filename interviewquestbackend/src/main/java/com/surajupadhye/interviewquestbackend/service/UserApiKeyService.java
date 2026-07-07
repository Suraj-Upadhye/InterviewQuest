package com.surajupadhye.interviewquestbackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.surajupadhye.interviewquestbackend.entity.User;
import com.surajupadhye.interviewquestbackend.entity.UserApiKey;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.UserApiKeyRepository;
import com.surajupadhye.interviewquestbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
public class UserApiKeyService {

    @Autowired
    private UserApiKeyRepository apiKeyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EncryptionService encryptionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public void saveUserKey(Long userId, String plainTextKey) {
        // Validate key against Google's endpoint
        validateKey(plainTextKey);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        EncryptionService.EncryptionResult result = encryptionService.encrypt(plainTextKey);

        UserApiKey userApiKey = apiKeyRepository.findByUserId(userId)
                .orElseGet(() -> UserApiKey.builder().user(user).build());

        userApiKey.setEncryptedApiKey(result.getCipherText());
        userApiKey.setInitializationVector(result.getIv());

        apiKeyRepository.save(userApiKey);
    }

    public boolean hasApiKey(Long userId) {
        return apiKeyRepository.findByUserId(userId).isPresent();
    }

    public String getDecryptedKey(Long userId) {
        UserApiKey keyEntity = apiKeyRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("No API Key registered. Please add your Gemini API Key in your profile settings."));
        return encryptionService.decrypt(keyEntity.getEncryptedApiKey(), keyEntity.getInitializationVector());
    }

    @Transactional
    public void deleteUserKey(Long userId) {
        apiKeyRepository.deleteByUserId(userId);
    }

    private void validateKey(String apiKey) {
        try {
            HttpClient client = HttpClient.newHttpClient();

            Map<String, Object> part = Map.of("text", "hello");
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> payload = Map.of("contents", List.of(content));

            String body = objectMapper.writeValueAsString(payload);
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new IllegalArgumentException("Invalid API key or quota exceeded. Status: " + response.statusCode() + ", Response: " + response.body());
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("API Key validation failed to connect to server: " + e.getMessage(), e);
        }
    }
}
