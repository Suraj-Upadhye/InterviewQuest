package com.surajupadhye.interviewquestbackend.service;

import com.surajupadhye.interviewquestbackend.entity.Subject;
import com.surajupadhye.interviewquestbackend.entity.SyllabusTopic;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.SubjectRepository;
import com.surajupadhye.interviewquestbackend.repository.SyllabusTopicRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class SubjectServiceImpl implements SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private SyllabusTopicRepository syllabusTopicRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${interviewquest.groq.apiKey:}")
    private String systemGroqApiKey;

    @Value("${interviewquest.groq.model:llama-3.3-70b-versatile}")
    private String systemGroqModel;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    @Override
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @Override
    public List<Subject> getSubjectsForLandingPage() {
        return subjectRepository.findByShowOnLandingPageTrue();
    }

    @Override
    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id " + id));
    }

    @Override
    public Subject getSubjectBySlug(String slug) {
        return subjectRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with slug " + slug));
    }

    @Override
    public Subject createSubject(Subject subject) {
        return subjectRepository.save(subject);
    }

    @Override
    public Subject updateSubject(Long id, Subject subjectDetails) {
        Subject subject = getSubjectById(id);
        subject.setTitle(subjectDetails.getTitle());
        subject.setCode(subjectDetails.getCode());
        subject.setSlug(subjectDetails.getSlug());
        subject.setDescription(subjectDetails.getDescription());
        subject.setIconName(subjectDetails.getIconName());
        subject.setShowOnLandingPage(subjectDetails.isShowOnLandingPage());
        return subjectRepository.save(subject);
    }

    @Override
    public void deleteSubject(Long id) {
        Subject subject = getSubjectById(id);
        subjectRepository.delete(subject);
    }

    @Override
    public List<SyllabusTopic> getTopicsBySubjectId(Long subjectId) {
        return syllabusTopicRepository.findBySubjectIdOrderBySortOrderAsc(subjectId);
    }

    @Override
    public SyllabusTopic getTopicBySubjectAndTopicSlug(String subjectSlug, String topicSlug) {
        return syllabusTopicRepository.findBySubjectSlugAndSlug(subjectSlug, topicSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus topic not found: " + subjectSlug + "/" + topicSlug));
    }

    @Override
    public SyllabusTopic createTopic(Long subjectId, SyllabusTopic topic) {
        Subject subject = getSubjectById(subjectId);
        topic.setSubject(subject);
        return syllabusTopicRepository.save(topic);
    }

    @Override
    public SyllabusTopic updateTopic(Long id, SyllabusTopic topicDetails) {
        SyllabusTopic topic = syllabusTopicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus topic not found with id " + id));
        topic.setTitle(topicDetails.getTitle());
        topic.setSlug(topicDetails.getSlug());
        topic.setChapter(topicDetails.getChapter());
        topic.setContent(topicDetails.getContent());
        topic.setDescription(topicDetails.getDescription());
        topic.setSortOrder(topicDetails.getSortOrder());
        return syllabusTopicRepository.save(topic);
    }

    @Override
    public void deleteTopic(Long id) {
        SyllabusTopic topic = syllabusTopicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Syllabus topic not found with id " + id));
        syllabusTopicRepository.delete(topic);
    }

    @Override
    public void renameChapter(Long subjectId, String oldName, String newName) {
        List<SyllabusTopic> topics = syllabusTopicRepository.findBySubjectIdOrderBySortOrderAsc(subjectId);
        for (SyllabusTopic t : topics) {
            if ((oldName == null && t.getChapter() == null) || (oldName != null && oldName.equals(t.getChapter()))) {
                t.setChapter(newName);
                syllabusTopicRepository.save(t);
            }
        }
    }

    @Override
    public void deleteChapter(Long subjectId, String chapterName) {
        List<SyllabusTopic> topics = syllabusTopicRepository.findBySubjectIdOrderBySortOrderAsc(subjectId);
        for (SyllabusTopic t : topics) {
            if ((chapterName == null && t.getChapter() == null) || (chapterName != null && chapterName.equals(t.getChapter()))) {
                syllabusTopicRepository.delete(t);
            }
        }
    }

    @Override
    public String generateTopicContent(String prompt) {
        if (systemGroqApiKey == null || systemGroqApiKey.isBlank()) {
            throw new IllegalArgumentException("Error: Groq API Key is missing in application configuration.");
        }

        try {
            HttpClient client = HttpClient.newHttpClient();

            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", prompt);
            messages.add(userMessage);

            Map<String, Object> requestBodyMap = new HashMap<>();
            requestBodyMap.put("model", systemGroqModel);
            requestBodyMap.put("messages", messages);
            requestBodyMap.put("temperature", 0.7);

            String requestBodyJson = objectMapper.writeValueAsString(requestBodyMap);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GROQ_API_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + systemGroqApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Error from Groq API: Status " + response.statusCode() + " - " + response.body());
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            return rootNode.path("choices").path(0).path("message").path("content").asText();

        } catch (Exception e) {
            throw new RuntimeException("AI Content Generation failed: " + e.getMessage(), e);
        }
    }
}
