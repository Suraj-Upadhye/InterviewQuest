package com.surajupadhye.interviewquestbackend.service;

import com.surajupadhye.interviewquestbackend.entity.MockInterview;
import java.util.List;

public interface AIService {
    String generateContent(String prompt, String customApiKey);
    String generateJson(String prompt, String customApiKey);
    String chat(List<MockInterview.ChatMessage> messages, String customApiKey);
}
