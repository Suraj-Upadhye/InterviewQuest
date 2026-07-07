package com.surajupadhye.interviewquestbackend.service;

import com.surajupadhye.interviewquestbackend.entity.MockInterview;
import java.util.List;

public interface AIService {
    String generateContent(String prompt);
    String generateJson(String prompt);
    String chat(List<MockInterview.ChatMessage> messages, String customApiKey);
}
