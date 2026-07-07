package com.surajupadhye.interviewquestbackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.surajupadhye.interviewquestbackend.entity.MockInterview;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "interviewquest.ai.provider", havingValue = "groq")
public class GroqAIServiceImpl implements AIService {

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${interviewquest.groq.apiKey:}")
    private String systemGroqApiKey;

    @Value("${interviewquest.groq.model:llama-3.3-70b-versatile}")
    private String systemGroqModel;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    @Override
    public String generateContent(String prompt, String customApiKey) {
        return callGroqApi(List.of(createChatMessage("user", prompt)), customApiKey, false);
    }

    @Override
    public String generateJson(String prompt, String customApiKey) {
        return callGroqApi(List.of(createChatMessage("user", prompt)), customApiKey, true);
    }

    @Override
    public String chat(List<MockInterview.ChatMessage> messages, String customApiKey) {
        return callGroqApi(messages, customApiKey, false);
    }

    private MockInterview.ChatMessage createChatMessage(String role, String content) {
        return MockInterview.ChatMessage.builder()
                .role(role)
                .content(content)
                .build();
    }

    private String callGroqApi(List<MockInterview.ChatMessage> messages, String customApiKey, boolean forceJson) {
        String apiKey = (customApiKey != null && !customApiKey.isBlank()) ? customApiKey : systemGroqApiKey;
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("Error: Groq API Key is missing. Please set it in application properties or provide your own key.");
        }

        try {
            HttpClient client = HttpClient.newHttpClient();

            List<Map<String, String>> messagePayloads = new ArrayList<>();
            for (MockInterview.ChatMessage msg : messages) {
                Map<String, String> payload = new HashMap<>();
                payload.put("role", msg.getRole());
                payload.put("content", msg.getContent());
                messagePayloads.add(payload);
            }

            Map<String, Object> requestBodyMap = new HashMap<>();
            requestBodyMap.put("model", systemGroqModel);
            requestBodyMap.put("messages", messagePayloads);
            requestBodyMap.put("temperature", 0.7);

            if (forceJson) {
                Map<String, String> responseFormat = new HashMap<>();
                responseFormat.put("type", "json_object");
                requestBodyMap.put("response_format", responseFormat);
            }

            String requestBodyJson = objectMapper.writeValueAsString(requestBodyMap);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GROQ_API_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Error from Groq API: Status " + response.statusCode() + " - " + response.body());
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            String content = rootNode.path("choices").path(0).path("message").path("content").asText();

            if (content != null) {
                // Clean up common AI Mermaid syntax errors: replacement of '-->|label|>' with '-->|label|'
                content = content.replaceAll("(-->|-\\.->|==>|->)\\s*\\|\\s*([^|]+)\\s*\\|\\s*>", "$1|$2|");
            }
            return content;

        } catch (Exception e) {
            throw new RuntimeException("AI Groq request failed: " + e.getMessage(), e);
        }
    }
}
