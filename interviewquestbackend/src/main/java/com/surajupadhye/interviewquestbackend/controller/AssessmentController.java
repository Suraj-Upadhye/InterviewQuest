package com.surajupadhye.interviewquestbackend.controller;

import com.surajupadhye.interviewquestbackend.dto.AssessmentQuestionResponse;
import com.surajupadhye.interviewquestbackend.dto.AssessmentResultResponse;
import com.surajupadhye.interviewquestbackend.dto.AssessmentSubmitRequest;
import com.surajupadhye.interviewquestbackend.entity.AssessmentAttempt;
import com.surajupadhye.interviewquestbackend.entity.Topic;
import com.surajupadhye.interviewquestbackend.entity.User;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.UserRepository;
import com.surajupadhye.interviewquestbackend.security.UserDetailsImpl;
import com.surajupadhye.interviewquestbackend.service.AssessmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @Autowired
    private UserRepository userRepository;

    // Start a secure, answer-hidden assessment
    @GetMapping("/start")
    public ResponseEntity<List<AssessmentQuestionResponse>> startAssessment(
            @RequestParam Topic topic,
            @RequestParam(defaultValue = "10") int limit) {
        List<AssessmentQuestionResponse> questions = assessmentService.startAssessment(topic, limit);
        return ResponseEntity.ok(questions);
    }

    // Submit user answers for marking and recording
    @PostMapping("/submit")
    public ResponseEntity<AssessmentResultResponse> submitAssessment(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody AssessmentSubmitRequest submitRequest) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));

        AssessmentResultResponse result = assessmentService.submitAssessment(user, submitRequest);
        return ResponseEntity.ok(result);
    }

    // Get currently logged in user's assessment history
    @GetMapping("/attempts")
    public ResponseEntity<List<AssessmentAttempt>> getAttemptsHistory(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) Topic topic) {
        List<AssessmentAttempt> attempts;
        if (topic != null) {
            attempts = assessmentService.getAttemptsByUserAndTopic(userDetails.getId(), topic);
        } else {
            attempts = assessmentService.getAttemptsByUser(userDetails.getId());
        }
        return ResponseEntity.ok(attempts);
    }
}
