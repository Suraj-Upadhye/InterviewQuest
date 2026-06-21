package com.surajupadhye.interviewquestbackend.service;

import com.surajupadhye.interviewquestbackend.dto.*;
import com.surajupadhye.interviewquestbackend.entity.Quiz;
import com.surajupadhye.interviewquestbackend.entity.User;
import com.surajupadhye.interviewquestbackend.entity.Question;
import java.util.List;

public interface QuizService {
    // Admin operations
    Quiz createQuiz(QuizCreateRequest request);
    void deleteQuiz(Long id);
    Quiz renameQuiz(Long id, String newTitle);
    Question addQuestionToQuiz(Long quizId, Question question);
    Question updateQuestionInQuiz(Long questionId, Question questionDetails);
    void deleteQuestionFromQuiz(Long questionId);
    Quiz generateQuizWithAI(QuizCreateRequest request);

    // User operations
    List<Quiz> getQuizzesBySubject(String subjectSlug);
    List<QuizQuestionDTO> startQuiz(Long quizId);
    QuizResultResponse submitQuiz(User user, Long quizId, QuizSubmitRequest submitRequest);
    List<QuizQuestionDTO> startMixQuiz(List<String> subjectSlugs, int limit);
    QuizResultResponse submitMixQuiz(User user, String subjectSlugsCombined, QuizSubmitRequest submitRequest);
}
