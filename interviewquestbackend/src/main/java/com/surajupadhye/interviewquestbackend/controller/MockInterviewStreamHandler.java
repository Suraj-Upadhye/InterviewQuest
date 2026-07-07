package com.surajupadhye.interviewquestbackend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.surajupadhye.interviewquestbackend.entity.InterviewSession;
import com.surajupadhye.interviewquestbackend.entity.Subject;
import com.surajupadhye.interviewquestbackend.entity.User;
import com.surajupadhye.interviewquestbackend.entity.Resume;
import com.surajupadhye.interviewquestbackend.repository.InterviewSessionRepository;
import com.surajupadhye.interviewquestbackend.repository.SubjectRepository;
import com.surajupadhye.interviewquestbackend.repository.UserRepository;
import com.surajupadhye.interviewquestbackend.repository.ResumeRepository;
import com.surajupadhye.interviewquestbackend.security.JwtUtils;
import com.surajupadhye.interviewquestbackend.service.PdfExtractionService;
import com.surajupadhye.interviewquestbackend.service.UserApiKeyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class MockInterviewStreamHandler extends AbstractWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(MockInterviewStreamHandler.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private UserApiKeyService apiKeyService;

    @Autowired
    private PdfExtractionService pdfExtractionService;

    @Autowired
    private InterviewSessionRepository sessionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${interviewquest.gemini.live.model:models/gemini-2.5-flash-native-audio-latest}")
    private String geminiLiveModel;

    // Map to link client WebSocket session to Gemini WebSocket session & session
    // state metadata
    private final Map<String, SessionContext> sessionMap = new ConcurrentHashMap<>();

    private static class SessionContext {
        private final WebSocketSession clientSession;
        private WebSocketSession geminiSession;
        private final Long userId;
        private final String interviewType;
        private final Long subjectId;
        private int turnCount = 0;
        private boolean isEvaluated = false;
        private final StringBuilder textAccumulator = new StringBuilder();

        public SessionContext(WebSocketSession clientSession, Long userId, String interviewType, Long subjectId) {
            this.clientSession = clientSession;
            this.userId = userId;
            this.interviewType = interviewType;
            this.subjectId = subjectId;
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession clientSession) throws Exception {
        Map<String, String> queryParams = parseQueryParams(clientSession.getUri().getQuery());
        String token = queryParams.get("token");
        String interviewType = queryParams.get("interviewType");
        String subjectIdStr = queryParams.get("subjectId");

        if (token == null || !jwtUtils.validateJwtToken(token)) {
            clientSession.close(CloseStatus.BAD_DATA.withReason("Authentication required"));
            return;
        }

        String username = jwtUtils.getUserNameFromJwtToken(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        Long userId = user.getId();
        Long subjectId = (subjectIdStr != null && !subjectIdStr.isBlank()) ? Long.parseLong(subjectIdStr) : null;

        // Fetch user API key securely (will throw error if key doesn't exist)
        String userApiKey;
        try {
            userApiKey = apiKeyService.getDecryptedKey(userId);
        } catch (Exception e) {
            clientSession.close(CloseStatus.BAD_DATA
                    .withReason("Custom Gemini API key missing. Register key in your Profile first."));
            return;
        }

        SessionContext context = new SessionContext(clientSession, userId, interviewType, subjectId);
        sessionMap.put(clientSession.getId(), context);

        // Build the system prompt
        String systemPrompt = buildSystemPrompt(user, interviewType, subjectId);

        // Connect to Gemini Live WebSocket API
        String geminiUri = String.format(
                "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=%s",
                userApiKey);

        // Clear userApiKey from scope instantly
        userApiKey = null;

        StandardWebSocketClient geminiClient = new StandardWebSocketClient();
        try {
            logger.info("Connecting to Gemini Live API with model: {}", geminiLiveModel);
            WebSocketSession geminiSession = geminiClient.execute(new WebSocketHandler() {
                @Override
                public void afterConnectionEstablished(WebSocketSession session) throws Exception {
                    logger.info("Gemini WebSocket connection established. Session ID: {}", session.getId());
                    // Tomcat's default WS buffer (8,192 bytes) is far smaller than Gemini's
                    // audio response chunks (~60KB+), causing an immediate 1009 close.
                    // Raise both limits before anything is sent/received.
                    session.setTextMessageSizeLimit(1024 * 1024); // 1MB
                    session.setBinaryMessageSizeLimit(1024 * 1024); // 1MB
                    context.geminiSession = session;
                    // Send the setup block config as the first message
                    sendSetupMessage(session, systemPrompt);
                    logger.info("Setup message sent to Gemini with model: {}", geminiLiveModel);

                    // Kickoff the interview: Gemini will introduce itself and ask the first question
                    sendTextMessageToGemini(session, "Hello! I am ready to start the mock interview. Please introduce yourself and ask the first question.");
                    logger.info("Kickoff message sent to Gemini.");
                }

                @Override
                public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
                    if (message instanceof TextMessage) {
                        String payload = ((TextMessage) message).getPayload();
                        logger.debug("Gemini message received: {}",
                                payload.length() > 200 ? payload.substring(0, 200) + "..." : payload);
                        // Forward JSON directly to client
                        if (clientSession.isOpen()) {
                            synchronized (clientSession) {
                                clientSession.sendMessage(new TextMessage(payload));
                            }
                        }
                        handleGeminiResponse(context, payload);
                    }
                }

                @Override
                public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
                    logger.error("Gemini transport error: {}", exception.getMessage(), exception);
                    // Notify client about the error
                    if (clientSession.isOpen()) {
                        try {
                            synchronized (clientSession) {
                                clientSession.sendMessage(new TextMessage(
                                        "{\"error\": \"Gemini transport error: " + exception.getMessage() + "\"}"));
                            }
                        } catch (Exception ignored) {
                        }
                    }
                }

                @Override
                public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
                    logger.warn("Gemini WebSocket connection closed. Code: {}, Reason: {}", closeStatus.getCode(),
                            closeStatus.getReason());
                    // Send close reason to client before cleanup
                    if (clientSession.isOpen()) {
                        try {
                            synchronized (clientSession) {
                                clientSession.sendMessage(new TextMessage("{\"error\": \"Gemini connection closed: "
                                        + closeStatus.getReason() + " (code: " + closeStatus.getCode() + ")\"}"));
                            }
                        } catch (Exception ignored) {
                        }
                    }
                    cleanupSession(clientSession.getId());
                }

                @Override
                public boolean supportsPartialMessages() {
                    return false;
                }
            }, geminiUri).get();

        } catch (Exception e) {
            logger.error("Failed to establish Gemini Live connection: {}", e.getMessage(), e);
            if (clientSession.isOpen()) {
                clientSession.close(CloseStatus.SERVER_ERROR.withReason("Failed to connect to AI server."));
            }
        }
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession clientSession, BinaryMessage message) throws Exception {
        SessionContext context = sessionMap.get(clientSession.getId());
        if (context != null && context.geminiSession != null && context.geminiSession.isOpen()) {
            // Safely extract binary audio (rate=16000 pcm) from ByteBuffer without using direct array()
            java.nio.ByteBuffer payloadBuffer = message.getPayload();
            byte[] audioData = new byte[payloadBuffer.remaining()];
            payloadBuffer.get(audioData);
            String base64Audio = Base64.getEncoder().encodeToString(audioData);

            // Construct Gemini realtime media input frame
            Map<String, Object> mediaChunk = Map.of(
                    "mimeType", "audio/pcm;rate=16000",
                    "data", base64Audio);
            Map<String, Object> realtimeInput = Map.of(
                    "mediaChunks", List.of(mediaChunk));
            Map<String, Object> payload = Map.of(
                    "realtimeInput", realtimeInput);

            synchronized (context.geminiSession) {
                if (context.geminiSession.isOpen()) {
                    try {
                        context.geminiSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
                    } catch (IllegalStateException e) {
                        // Session closed concurrently (e.g. Gemini rejected/ended the turn) — safe to
                        // ignore
                        logger.debug("Skipped audio chunk, Gemini session no longer writable: {}", e.getMessage());
                    }
                }
            }
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession clientSession, TextMessage message) throws Exception {
        SessionContext context = sessionMap.get(clientSession.getId());
        if (context != null && context.geminiSession != null && context.geminiSession.isOpen()) {
            String payload = message.getPayload();
            JsonNode requestNode = objectMapper.readTree(payload);

            // Client sending custom code/design textbox text
            if (requestNode.has("codeAnswer")) {
                String textAnswer = requestNode.get("codeAnswer").asText();
                sendTextMessageToGemini(context.geminiSession,
                        "I have written my Coding/Design solution in the editor:\n\n" + textAnswer);
            }
        }
    }

    private void handleGeminiResponse(SessionContext context, String payload) {
        try {
            JsonNode root = objectMapper.readTree(payload);

            // 1. Check for root level outputTranscription
            if (root.has("outputTranscription")) {
                JsonNode textNode = root.path("outputTranscription").path("text");
                if (!textNode.isMissingNode() && textNode.isTextual()) {
                    context.textAccumulator.append(textNode.asText());
                }
            }
            // 2. Check for nested serverContent.outputTranscription
            else if (root.has("serverContent") && root.path("serverContent").has("outputTranscription")) {
                JsonNode textNode = root.path("serverContent").path("outputTranscription").path("text");
                if (!textNode.isMissingNode() && textNode.isTextual()) {
                    context.textAccumulator.append(textNode.asText());
                }
            }

            // 3. Fallback/Legacy text extraction from serverContent modelTurn parts
            JsonNode parts = root.path("serverContent").path("modelTurn").path("parts");
            if (!parts.isMissingNode() && parts.isArray()) {
                for (JsonNode part : parts) {
                    if (part.has("text")) {
                        context.textAccumulator.append(part.get("text").asText());
                    }
                }
            }

            // Check if turn completes
            if (root.path("serverContent").path("turnComplete").asBoolean()) {
                context.turnCount++;

                // Trigger evaluation after 4 turn cycles
                if (context.turnCount >= 4 && !context.isEvaluated) {
                    context.isEvaluated = true;
                    // Prompt evaluation scorecard response wrapped in hidden tags
                    String evalPrompt = "The interview is now complete. Please compile a summary scorecard and constructive technical review for the candidate. "
                            +
                            "You MUST wrap your scorecard in <evaluation>...</evaluation> tags. Inside the tags, provide a valid JSON object matching the exact structure: "
                            +
                            "{\"technicalScore\": [1-10], \"communicationScore\": [1-10], \"keyStrengths\": \"[Bullet points of strengths]\", \"criticalGaps\": \"[Areas of improvement]\"}. "
                            +
                            "Do not include any text outside the <evaluation> tags in your final response.";
                    sendTextMessageToGemini(context.geminiSession, evalPrompt);
                }

                // Intercept and parse final evaluation text response
                if (context.isEvaluated) {
                    String fullText = context.textAccumulator.toString();
                    Pattern pattern = Pattern.compile("<evaluation>(.*?)</evaluation>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
                    Matcher matcher = pattern.matcher(fullText);
                    String jsonString = null;
                    if (matcher.find()) {
                        jsonString = matcher.group(1).trim();
                    } else {
                        // Fallback: try parsing JSON directly if turn is complete and we couldn't match the tags
                        int start = fullText.indexOf('{');
                        int end = fullText.lastIndexOf('}');
                        if (start != -1 && end > start) {
                            jsonString = fullText.substring(start, end + 1).trim();
                        }
                    }

                    if (jsonString != null) {
                        saveScorecardToDatabase(context, jsonString);
                        // Notify client the session has finished
                        synchronized (context.clientSession) {
                            context.clientSession.sendMessage(new TextMessage("{\"sessionState\": \"COMPLETED\"}"));
                        }
                        cleanupSession(context.clientSession.getId());
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error handling Gemini response turn details: {}", e.getMessage());
        }
    }

    private void saveScorecardToDatabase(SessionContext context, String jsonString) {
        try {
            JsonNode scoreNode = objectMapper.readTree(jsonString);
            int techScore = scoreNode.path("technicalScore").asInt();
            int commScore = scoreNode.path("communicationScore").asInt();
            String strengths = scoreNode.path("keyStrengths").asText();
            String gaps = scoreNode.path("criticalGaps").asText();

            User user = userRepository.findById(context.userId).orElse(null);
            Subject subject = context.subjectId != null ? subjectRepository.findById(context.subjectId).orElse(null)
                    : null;

            if (user != null) {
                InterviewSession session = InterviewSession.builder()
                        .user(user)
                        .subject(subject)
                        .interviewType(context.interviewType)
                        .technicalScore(techScore)
                        .communicationScore(commScore)
                        .keyStrengths(strengths)
                        .criticalGaps(gaps)
                        .build();

                sessionRepository.save(session);
                logger.info("Saved interview scorecard session successfully for user ID {}", context.userId);
            }
        } catch (Exception e) {
            logger.error("Failed to parse scorecard details: {}. Raw JSON: {}", e.getMessage(), jsonString);
        }
    }

    private String buildSystemPrompt(User user, String interviewType, Long subjectId) {
        StringBuilder prompt = new StringBuilder(
                "You are an elite, empathetic, and professional mock interviewer. Conduct a realistic verbal tech/behavioral interview.");

        // Fetch resume text if resume-based
        if (interviewType.contains("RESUME")) {
            Optional<Resume> resumeOpt = resumeRepository.findByUserId(user.getId());
            if (resumeOpt.isPresent()) {
                String resumeText = pdfExtractionService.extractTextFromPdfUrl(resumeOpt.get().getCloudinaryUrl());
                prompt.append("\nHere is the candidate's resume content to focus on during your questions:\n")
                        .append(resumeText)
                        .append("\nAsk questions directly testing their skills, projects, and experiences listed in this resume.");
            }
        }

        // Fetch subject details if subject-based
        if (subjectId != null) {
            Optional<Subject> subjectOpt = subjectRepository.findById(subjectId);
            if (subjectOpt.isPresent()) {
                prompt.append("\nThe target subject for this interview is: ").append(subjectOpt.get().getTitle())
                        .append("\nFocus on assessing technical concepts, schemas, architecture, and coding logic related to this subject.");
            }
        }

        switch (interviewType) {
            case "HR":
                prompt.append(
                        "\nRole: HR Recruiter. Ask behavioral and career interest questions. Focus heavily on communication, leadership, conflict resolution, and soft skills.");
                break;
            case "RESUME":
                prompt.append(
                        "\nRole: General hiring manager. Focus strictly on their resume projects, achievements, and technology experiences.");
                break;
            case "HR_RESUME":
                prompt.append(
                        "\nRole: Hiring manager conducting HR round. Mix resume project questions with behavioral assessment scenarios.");
                break;
            case "SUBJECT":
                prompt.append(
                        "\nRole: Lead Engineer. Assess deep core concepts of the selected subject. Challenge their theoretical knowledge and practical setups.");
                break;
            case "HR_TECHNICAL":
                prompt.append(
                        "\nRole: Technical Manager. Mix soft-skills behavioral scenarios with technical concepts and systems scaling logic.");
                break;
        }

        prompt.append("\n\nSTRICT RULES:\n")
                .append("1. Ask exactly ONE question at a time. Keep your answers brief and conversational.\n")
                .append("2. Avoid repeating statements. Listen to the candidate, offer brief constructive validation, and progress directly to the next question.\n")
                .append("3. Speak clearly. Introduce yourself and ask the first question immediately.");

        return prompt.toString();
    }

    private void sendSetupMessage(WebSocketSession session, String systemPrompt) throws IOException {
        Map<String, Object> systemInstruction = Map.of(
                "parts", List.of(Map.of("text", systemPrompt)));
        List<String> responseModalities = List.of("AUDIO");
        Map<String, Object> voiceConfig = Map.of(
                "prebuiltVoiceConfig", Map.of("voiceName", "Aoede"));
        Map<String, Object> speechConfig = Map.of("voiceConfig", voiceConfig);
        Map<String, Object> generationConfig = Map.of(
                "responseModalities", responseModalities,
                "speechConfig", speechConfig);
        Map<String, Object> setup = Map.of(
                "model", geminiLiveModel,
                "generationConfig", generationConfig,
                "systemInstruction", systemInstruction,
                // Audio-only output means Gemini never fills modelTurn.parts[].text.
                // This asks Gemini to also emit a spoken-word transcript as
                // serverContent.outputTranscription.text, which we need for both
                // the frontend chat log and the backend scorecard evaluation.
                "outputAudioTranscription", Map.of());
        Map<String, Object> payload = Map.of("setup", setup);

        synchronized (session) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
        }
    }

    private void sendTextMessageToGemini(WebSocketSession session, String text) throws IOException {
        Map<String, Object> textPart = Map.of("text", text);
        Map<String, Object> turn = Map.of(
                "role", "user",
                "parts", List.of(textPart));
        Map<String, Object> clientContent = Map.of(
                "turns", List.of(turn),
                "turnComplete", true);
        Map<String, Object> payload = Map.of("clientContent", clientContent);

        synchronized (session) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession clientSession, CloseStatus status) throws Exception {
        cleanupSession(clientSession.getId());
    }

    private void cleanupSession(String sessionId) {
        SessionContext context = sessionMap.remove(sessionId);
        if (context != null) {
            try {
                if (context.geminiSession != null && context.geminiSession.isOpen()) {
                    context.geminiSession.close();
                }
            } catch (Exception e) {
                // Ignore
            }
            try {
                if (context.clientSession != null && context.clientSession.isOpen()) {
                    context.clientSession.close();
                }
            } catch (Exception e) {
                // Ignore
            }
        }
    }

    private Map<String, String> parseQueryParams(String query) {
        Map<String, String> params = new HashMap<>();
        if (query != null && !query.isBlank()) {
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                String[] kv = pair.split("=", 2);
                try {
                    String key = java.net.URLDecoder.decode(kv[0], java.nio.charset.StandardCharsets.UTF_8);
                    String value = kv.length == 2 ? java.net.URLDecoder.decode(kv[1], java.nio.charset.StandardCharsets.UTF_8) : "";
                    params.put(key, value);
                } catch (Exception e) {
                    logger.warn("Failed to URL decode query param: {}", pair, e);
                }
            }
        }
        return params;
    }
}