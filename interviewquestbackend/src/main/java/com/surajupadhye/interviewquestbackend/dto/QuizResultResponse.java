package com.surajupadhye.interviewquestbackend.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResultResponse {
    private Long attemptId;
    private String quizTitle;
    private String subjectTitle;
    private Integer score;
    private Integer totalQuestions;
    private Double percentage;
    private List<QuestionGradingResult> details;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionGradingResult {
        private Long questionId;
        private String questionText;
        private List<String> options;
        private String submittedAnswer;
        private String correctAnswer;
        private String explanation;
        private boolean isCorrect;
    }
}
