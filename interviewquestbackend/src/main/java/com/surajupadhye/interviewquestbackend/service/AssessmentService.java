package com.surajupadhye.interviewquestbackend.service;

import com.surajupadhye.interviewquestbackend.dto.AssessmentQuestionResponse;
import com.surajupadhye.interviewquestbackend.dto.AssessmentResultResponse;
import com.surajupadhye.interviewquestbackend.dto.AssessmentSubmitRequest;
import com.surajupadhye.interviewquestbackend.entity.AssessmentAttempt;
import com.surajupadhye.interviewquestbackend.entity.Question;
import com.surajupadhye.interviewquestbackend.entity.Topic;
import com.surajupadhye.interviewquestbackend.entity.User;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.AssessmentAttemptRepository;
import com.surajupadhye.interviewquestbackend.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AssessmentService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AssessmentAttemptRepository attemptRepository;

    public List<AssessmentQuestionResponse> startAssessment(Topic topic, int limit) {
        List<Question> questions = questionRepository.findRandomQuestionsByTopic(topic.name(), limit);
        return questions.stream()
                .map(AssessmentQuestionResponse::build)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssessmentResultResponse submitAssessment(User user, AssessmentSubmitRequest submitRequest) {
        List<Long> questionIds = submitRequest.getAnswers().stream()
                .map(AssessmentSubmitRequest.UserAnswer::getQuestionId)
                .collect(Collectors.toList());

        List<Question> questions = questionRepository.findAllById(questionIds);
        Map<Long, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        int score = 0;
        List<AssessmentResultResponse.QuestionGradingResult> details = new ArrayList<>();

        for (AssessmentSubmitRequest.UserAnswer answer : submitRequest.getAnswers()) {
            Question question = questionMap.get(answer.getQuestionId());
            if (question == null) {
                throw new ResourceNotFoundException("Question not found with ID: " + answer.getQuestionId());
            }

            boolean isCorrect = question.getCorrectAnswer().trim().equalsIgnoreCase(
                    answer.getSubmittedAnswer() != null ? answer.getSubmittedAnswer().trim() : ""
            );

            if (isCorrect) {
                score++;
            }

            details.add(AssessmentResultResponse.QuestionGradingResult.builder()
                    .questionId(question.getId())
                    .questionText(question.getQuestionText())
                    .options(question.getOptions())
                    .submittedAnswer(answer.getSubmittedAnswer())
                    .correctAnswer(question.getCorrectAnswer())
                    .explanation(question.getExplanation())
                    .isCorrect(isCorrect)
                    .build());
        }

        // Save Attempt in DB
        AssessmentAttempt attempt = AssessmentAttempt.builder()
                .user(user)
                .topic(submitRequest.getTopic())
                .score(score)
                .totalQuestions(submitRequest.getAnswers().size())
                .startedAt(LocalDateTime.now())
                .completedAt(LocalDateTime.now())
                .build();

        AssessmentAttempt savedAttempt = attemptRepository.save(attempt);

        double percentage = (double) score / submitRequest.getAnswers().size() * 100.0;

        return AssessmentResultResponse.builder()
                .attemptId(savedAttempt.getId())
                .topic(submitRequest.getTopic())
                .score(score)
                .totalQuestions(submitRequest.getAnswers().size())
                .percentage(Math.round(percentage * 100.0) / 100.0)
                .details(details)
                .build();
    }

    public List<AssessmentAttempt> getAttemptsByUser(Long userId) {
        return attemptRepository.findByUserIdOrderByStartedAtDesc(userId);
    }

    public List<AssessmentAttempt> getAttemptsByUserAndTopic(Long userId, Topic topic) {
        return attemptRepository.findByUserIdAndTopicOrderByStartedAtDesc(userId, topic);
    }
}
