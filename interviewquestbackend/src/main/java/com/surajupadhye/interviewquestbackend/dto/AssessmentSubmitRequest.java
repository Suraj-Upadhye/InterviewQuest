package com.surajupadhye.interviewquestbackend.dto;

import com.surajupadhye.interviewquestbackend.entity.Topic;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AssessmentSubmitRequest {
    @NotNull
    private Topic topic;

    @NotEmpty
    private List<UserAnswer> answers;

    @Getter
    @Setter
    public static class UserAnswer {
        @NotNull
        private Long questionId;
        private String submittedAnswer;
    }
}
