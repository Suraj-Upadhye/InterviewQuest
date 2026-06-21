package com.surajupadhye.interviewquestbackend.dto;

import lombok.Data;

@Data
public class QuizCreateRequest {
    private String title;
    private Long subjectId;
    private Long syllabusTopicId;
    private boolean isAiGenerated;
    private String difficulty; // EASY, MEDIUM, HARD
    private int numQuestions = 5;
}
