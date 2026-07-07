package com.surajupadhye.interviewquestbackend.controller;

import com.surajupadhye.interviewquestbackend.dto.*;
import com.surajupadhye.interviewquestbackend.entity.*;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.AssessmentAttemptRepository;
import com.surajupadhye.interviewquestbackend.repository.UserRepository;
import com.surajupadhye.interviewquestbackend.security.UserDetailsImpl;
import com.surajupadhye.interviewquestbackend.service.QuizService;
import jakarta.validation.Valid;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssessmentAttemptRepository attemptRepository;

    // Get quizzes of a subject with user attempt history mapped
    @GetMapping("/public/subjects/{subjectSlug}/quizzes")
    public ResponseEntity<List<QuizListResponse>> getQuizzesBySubject(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String subjectSlug) {

        List<Quiz> quizzes = quizService.getQuizzesBySubject(subjectSlug);
        List<AssessmentAttempt> attempts = new ArrayList<>();

        if (userDetails != null) {
            attempts = attemptRepository.findByUserIdAndQuizSubjectSlugOrderByStartedAtDesc(
                    userDetails.getId(), subjectSlug
            );
        }

        // Map attempts by quiz ID (latest attempt first since ordered by startedAt Desc)
        Map<Long, AssessmentAttempt> latestAttemptMap = new HashMap<>();
        for (AssessmentAttempt attempt : attempts) {
            if (attempt.getQuiz() != null && !latestAttemptMap.containsKey(attempt.getQuiz().getId())) {
                latestAttemptMap.put(attempt.getQuiz().getId(), attempt);
            }
        }

        List<QuizListResponse> response = quizzes.stream().map(q -> {
            AssessmentAttempt latestAttempt = latestAttemptMap.get(q.getId());
            boolean attempted = latestAttempt != null;

            return QuizListResponse.builder()
                    .id(q.getId())
                    .title(q.getTitle())
                    .syllabusTopicId(q.getSyllabusTopic() != null ? q.getSyllabusTopic().getId() : null)
                    .syllabusTopicSlug(q.getSyllabusTopic() != null ? q.getSyllabusTopic().getSlug() : null)
                    .syllabusTopicTitle(q.getSyllabusTopic() != null ? q.getSyllabusTopic().getTitle() : "General")
                    .totalQuestions(q.getQuestions().size())
                    .attempted(attempted)
                    .latestScore(attempted ? latestAttempt.getScore() : null)
                    .latestTotalQuestions(attempted ? latestAttempt.getTotalQuestions() : null)
                    .latestPercentage(attempted ? (double) latestAttempt.getScore() / latestAttempt.getTotalQuestions() * 100.0 : null)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Get a quiz questions (for test taking)
    @GetMapping("/public/quizzes/{id}")
    public ResponseEntity<List<QuizQuestionDTO>> startQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.startQuiz(id));
    }

    // Submit a quiz
    @PostMapping("/public/quizzes/{id}/submit")
    public ResponseEntity<QuizResultResponse> submitQuiz(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @RequestBody QuizSubmitRequest submitRequest) {

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));

        return ResponseEntity.ok(quizService.submitQuiz(user, id, submitRequest));
    }


    // Start a mixed subjects quiz
    @GetMapping("/public/quizzes/mix/{subjectSlugs}")
    public ResponseEntity<List<QuizQuestionDTO>> startMixQuiz(
            @PathVariable String subjectSlugs,
            @RequestParam(defaultValue = "15") int limit) {

        List<String> slugs = Arrays.asList(subjectSlugs.split("~"));
        return ResponseEntity.ok(quizService.startMixQuiz(slugs, limit));
    }

    // Submit a mixed subjects quiz
    @PostMapping("/public/quizzes/mix/{subjectSlugs}/submit")
    public ResponseEntity<QuizResultResponse> submitMixQuiz(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String subjectSlugs,
            @RequestBody QuizSubmitRequest submitRequest) {

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));

        return ResponseEntity.ok(quizService.submitMixQuiz(user, subjectSlugs, submitRequest));
    }

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    @PostMapping("/admin/quizzes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Quiz> createQuiz(@Valid @RequestBody QuizCreateRequest request) {
        return new ResponseEntity<>(quizService.createQuiz(request), HttpStatus.CREATED);
    }

    @PostMapping("/admin/quizzes/generate-ai")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Quiz> generateQuizWithAI(@Valid @RequestBody QuizCreateRequest request) {
        return new ResponseEntity<>(quizService.generateQuizWithAI(request), HttpStatus.CREATED);
    }

    @PutMapping("/admin/quizzes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Quiz> renameQuiz(
            @PathVariable Long id,
            @RequestParam String title) {
        return ResponseEntity.ok(quizService.renameQuiz(id, title));
    }

    @DeleteMapping("/admin/quizzes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/quizzes/{quizId}/questions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Question> addQuestionToQuiz(
            @PathVariable Long quizId,
            @Valid @RequestBody Question question) {
        return new ResponseEntity<>(quizService.addQuestionToQuiz(quizId, question), HttpStatus.CREATED);
    }

    @PutMapping("/admin/questions/{questionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Question> updateQuestionInQuiz(
            @PathVariable Long questionId,
            @Valid @RequestBody Question question) {
        return ResponseEntity.ok(quizService.updateQuestionInQuiz(questionId, question));
    }

    @DeleteMapping("/admin/questions/{questionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteQuestionFromQuiz(@PathVariable Long questionId) {
        quizService.deleteQuestionFromQuiz(questionId);
        return ResponseEntity.noContent().build();
    }

    // Quiz detail response wrapper DTO
    @Getter
    @Setter
    @Builder
    public static class QuizListResponse {
        private Long id;
        private String title;
        private Long syllabusTopicId;
        private String syllabusTopicSlug;
        private String syllabusTopicTitle;
        private int totalQuestions;
        private boolean attempted;
        private Integer latestScore;
        private Integer latestTotalQuestions;
        private Double latestPercentage;
    }
}
