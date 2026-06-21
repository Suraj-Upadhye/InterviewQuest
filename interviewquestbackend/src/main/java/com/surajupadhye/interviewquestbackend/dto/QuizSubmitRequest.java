package com.surajupadhye.interviewquestbackend.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuizSubmitRequest {
    private List<UserAnswer> answers;

    @Data
    public static class UserAnswer {
        private Long questionId;
        private String submittedAnswer;
    }
}
