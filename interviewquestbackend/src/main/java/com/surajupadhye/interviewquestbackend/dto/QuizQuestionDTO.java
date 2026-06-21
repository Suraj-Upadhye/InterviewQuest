package com.surajupadhye.interviewquestbackend.dto;

import com.surajupadhye.interviewquestbackend.entity.Question;
import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionDTO {
    private Long id;
    private String questionText;
    private List<String> options;
    private String difficulty;

    public static QuizQuestionDTO fromEntity(Question question) {
        return QuizQuestionDTO.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .options(question.getOptions())
                .difficulty(question.getDifficulty() != null ? question.getDifficulty().name() : "MEDIUM")
                .build();
    }
}
