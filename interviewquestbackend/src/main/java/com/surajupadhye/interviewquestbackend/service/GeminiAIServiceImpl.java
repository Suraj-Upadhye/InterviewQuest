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
@ConditionalOnProperty(name = "interviewquest.ai.provider", havingValue = "gemini", matchIfMissing = true)
public class GeminiAIServiceImpl implements AIService {

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${interviewquest.gemini.apiKey:}")
    private String systemGeminiApiKey;

    @Value("${interviewquest.gemini.model:gemini-2.5-flash}")
    private String systemGeminiModel;

    @Override
    public String generateContent(String prompt) {
        return callGeminiApi(List.of(createChatMessage("user", prompt)), null, false);
    }

    @Override
    public String generateJson(String prompt) {
        return callGeminiApi(List.of(createChatMessage("user", prompt)), null, true);
    }

    @Override
    public String chat(List<MockInterview.ChatMessage> messages, String customApiKey) {
        return callGeminiApi(messages, customApiKey, false);
    }

    private MockInterview.ChatMessage createChatMessage(String role, String content) {
        return MockInterview.ChatMessage.builder()
                .role(role)
                .content(content)
                .build();
    }

    private String callGeminiApi(List<MockInterview.ChatMessage> messages, String customApiKey, boolean forceJson) {
        String apiKey = (customApiKey != null && !customApiKey.isBlank()) ? customApiKey : systemGeminiApiKey;
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("Error: Gemini API Key is missing. Please set it in application properties or provide your own key.");
        }

        try {
            HttpClient client = HttpClient.newHttpClient();

            StringBuilder systemInstructionBuilder = new StringBuilder();
            List<Map<String, Object>> contents = new ArrayList<>();

            for (MockInterview.ChatMessage msg : messages) {
                if ("system".equalsIgnoreCase(msg.getRole())) {
                    if (systemInstructionBuilder.length() > 0) {
                        systemInstructionBuilder.append("\n");
                    }
                    systemInstructionBuilder.append(msg.getContent());
                } else {
                    Map<String, Object> contentMap = new HashMap<>();
                    String geminiRole = "assistant".equalsIgnoreCase(msg.getRole()) ? "model" : "user";
                    contentMap.put("role", geminiRole);
                    
                    Map<String, String> partText = new HashMap<>();
                    partText.put("text", msg.getContent());
                    contentMap.put("parts", List.of(partText));
                    
                    contents.add(contentMap);
                }
            }

            Map<String, Object> requestBodyMap = new HashMap<>();
            requestBodyMap.put("contents", contents);

            if (systemInstructionBuilder.length() > 0) {
                Map<String, Object> systemInstructionMap = new HashMap<>();
                Map<String, String> partText = new HashMap<>();
                partText.put("text", systemInstructionBuilder.toString());
                systemInstructionMap.put("parts", List.of(partText));
                requestBodyMap.put("systemInstruction", systemInstructionMap);
            }

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.7);
            if (forceJson) {
                generationConfig.put("responseMimeType", "application/json");
            }
            requestBodyMap.put("generationConfig", generationConfig);

            String requestBodyJson = objectMapper.writeValueAsString(requestBodyMap);

            String url = String.format(
                    "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    systemGeminiModel, apiKey
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Error from Gemini API: Status " + response.statusCode() + " - " + response.body());
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            String content = rootNode.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();

            if (content != null) {
                // Clean up common AI Mermaid syntax errors: replacement of '-->|label|>' with '-->|label|'
                content = content.replaceAll("(-->|-\\.->|==>|->)\\s*\\|\\s*([^|]+)\\s*\\|\\s*>", "$1|$2|");
            }
            return content;

        } catch (Exception e) {
            throw new RuntimeException("AI Gemini request failed: " + e.getMessage(), e);
        }
    }
}
