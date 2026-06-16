package com.surajupadhye.interviewquestbackend.dto;

import com.surajupadhye.interviewquestbackend.entity.Difficulty;
import com.surajupadhye.interviewquestbackend.entity.Question;
import com.surajupadhye.interviewquestbackend.entity.Topic;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentQuestionResponse {
    private Long id;
    private Topic topic;
    private Difficulty difficulty;
    private String questionText;
    private List<String> options;

    public static AssessmentQuestionResponse build(Question question) {
        return AssessmentQuestionResponse.builder()
                .id(question.getId())
                .topic(question.getTopic())
                .difficulty(question.getDifficulty())
                .questionText(question.getQuestionText())
                .options(question.getOptions())
                .build();
    }
}
