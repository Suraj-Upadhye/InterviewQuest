package com.surajupadhye.interviewquestbackend.dto;

import com.surajupadhye.interviewquestbackend.entity.Topic;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentResultResponse {
    private Long attemptId;
    private Topic topic;
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
