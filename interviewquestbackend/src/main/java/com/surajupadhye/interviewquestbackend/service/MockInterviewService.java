package com.surajupadhye.interviewquestbackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.surajupadhye.interviewquestbackend.entity.MockInterview;
import com.surajupadhye.interviewquestbackend.entity.User;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.MockInterviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MockInterviewService {

    @Autowired
    private MockInterviewRepository interviewRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${interviewquest.groq.apiKey:}")
    private String systemGroqApiKey;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    @Value("${interviewquest.groq.model:llama-3.3-70b-versatile}")
    private String systemGroqModel;

    public List<MockInterview> getInterviewsByUser(Long userId) {
        return interviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public MockInterview getInterviewById(Long id) {
        return interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mock Interview session not found with id: " + id));
    }

    @Transactional
    public MockInterview startInterview(User user, String companyName, String topicOrSkills, String interviewType, String userApiKey) {
        // Initialize interview session
        MockInterview interview = MockInterview.builder()
                .user(user)
                .companyName(companyName)
                .topicOrSkills(topicOrSkills)
                .interviewType(interviewType)
                .conversation(new ArrayList<>())
                .build();

        // System prompt setup
        String systemInstruction = String.format(
                "You are an expert interviewer. Act as a professional interviewer conducting a mock interview.\n" +
                "Company: %s\n" +
                "Topic/Skills: %s\n" +
                "Interview Type: %s\n\n" +
                "Instructions:\n" +
                "1. Conduct the interview strictly one question at a time. Never ask multiple questions in a single response.\n" +
                "2. Ask realistic, challenging questions suitable for the company, topic, and type.\n" +
                "3. Be conversational and professional. Keep your questions and responses concise.\n" +
                "4. Start the interview now by introducing yourself as the interviewer and asking the first question directly. Do not output anything else.",
                companyName != null ? companyName : "General",
                topicOrSkills != null ? topicOrSkills : "Core Software Engineering",
                interviewType
        );

        MockInterview.ChatMessage systemMessage = MockInterview.ChatMessage.builder()
                .role("system")
                .content(systemInstruction)
                .timestamp(LocalDateTime.now())
                .build();

        interview.getConversation().add(systemMessage);

        // Fetch first question from Groq
        String firstQuestion = callGroqApi(interview.getConversation(), userApiKey);

        MockInterview.ChatMessage assistantMessage = MockInterview.ChatMessage.builder()
                .role("assistant")
                .content(firstQuestion)
                .timestamp(LocalDateTime.now())
                .build();

        interview.getConversation().add(assistantMessage);

        return interviewRepository.save(interview);
    }

    @Transactional
    public MockInterview respondToQuestion(Long interviewId, String candidateResponse, String userApiKey) {
        MockInterview interview = getInterviewById(interviewId);

        // Add candidate answer
        MockInterview.ChatMessage userMessage = MockInterview.ChatMessage.builder()
                .role("user")
                .content(candidateResponse)
                .timestamp(LocalDateTime.now())
                .build();
        interview.getConversation().add(userMessage);

        // Get next question/response from AI
        String aiResponse = callGroqApi(interview.getConversation(), userApiKey);

        MockInterview.ChatMessage assistantMessage = MockInterview.ChatMessage.builder()
                .role("assistant")
                .content(aiResponse)
                .timestamp(LocalDateTime.now())
                .build();
        interview.getConversation().add(assistantMessage);

        return interviewRepository.save(interview);
    }

    @Transactional
    public MockInterview evaluateInterview(Long interviewId, String userApiKey) {
        MockInterview interview = getInterviewById(interviewId);

        // Add system feedback instruction
        String evaluationPrompt = String.format(
                "The mock interview is complete. As an expert technical recruiter, review the conversation transcript above and generate a detailed scorecard. " +
                "Assess the candidate's answers for company '%s', topics '%s', and role '%s'.\n\n" +
                "Format your response exactly as follows:\n" +
                "### Mock Interview Scorecard\n" +
                "- **Overall Score**: [Score]/10\n" +
                "- **Technical/Conceptual Accuracy**: [Detailed feedback on their answers' correctness]\n" +
                "- **Communication & Professionalism**: [Feedback on clarity, brevity, and tone]\n" +
                "- **Key Strengths**: [Bullet points of what they did well]\n" +
                "- **Areas of Improvement**: [Actionable bullet points for future preparation]\n\n" +
                "Be constructive, detailed, and realistic in your feedback. Start writing the scorecard now.",
                interview.getCompanyName(), interview.getTopicOrSkills(), interview.getInterviewType()
        );

        List<MockInterview.ChatMessage> evalConversation = new ArrayList<>(interview.getConversation());
        evalConversation.add(MockInterview.ChatMessage.builder()
                .role("system")
                .content(evaluationPrompt)
                .timestamp(LocalDateTime.now())
                .build());

        String evaluationResult = callGroqApi(evalConversation, userApiKey);

        MockInterview.ChatMessage feedbackMessage = MockInterview.ChatMessage.builder()
                .role("assistant")
                .content(evaluationResult)
                .timestamp(LocalDateTime.now())
                .build();
        interview.getConversation().add(feedbackMessage);

        return interviewRepository.save(interview);
    }

    private String callGroqApi(List<MockInterview.ChatMessage> messages, String userApiKey) {
        String apiKey = (userApiKey != null && !userApiKey.isBlank()) ? userApiKey : systemGroqApiKey;
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("Error: Groq API Key is missing. Please set it in application properties or provide your own key.");
        }

        try {
            HttpClient client = HttpClient.newHttpClient();

            // Construct payload manually with ObjectMapper to avoid complex libraries
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
            return rootNode.path("choices").path(0).path("message").path("content").asText();

        } catch (Exception e) {
            throw new RuntimeException("AI Mock Interview request failed: " + e.getMessage(), e);
        }
    }
}
