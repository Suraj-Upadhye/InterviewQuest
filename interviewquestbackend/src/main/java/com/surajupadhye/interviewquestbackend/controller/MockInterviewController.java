package com.surajupadhye.interviewquestbackend.controller;

import com.surajupadhye.interviewquestbackend.entity.MockInterview;
import com.surajupadhye.interviewquestbackend.entity.User;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.UserRepository;
import com.surajupadhye.interviewquestbackend.security.UserDetailsImpl;
import com.surajupadhye.interviewquestbackend.service.MockInterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/mock-interviews")
public class MockInterviewController {

    @Autowired
    private MockInterviewService interviewService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<MockInterview>> getMyInterviews(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(interviewService.getInterviewsByUser(userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MockInterview> getInterviewById(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        MockInterview interview = interviewService.getInterviewById(id);
        // Verify owner
        if (!interview.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(interview);
    }

    @PostMapping("/start")
    public ResponseEntity<MockInterview> startInterview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> requestParams,
            @RequestHeader(name = "X-Groq-Api-Key", required = false) String userApiKey) {
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Logged in user not found"));

        String companyName = requestParams.get("companyName");
        String topicOrSkills = requestParams.get("topicOrSkills");
        String interviewType = requestParams.get("interviewType");

        if (interviewType == null || interviewType.isBlank()) {
            interviewType = "TECHNICAL";
        }

        MockInterview interview = interviewService.startInterview(user, companyName, topicOrSkills, interviewType, userApiKey);
        return new ResponseEntity<>(interview, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/chat")
    public ResponseEntity<MockInterview> respondToQuestion(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @RequestBody Map<String, String> requestBody,
            @RequestHeader(name = "X-Groq-Api-Key", required = false) String userApiKey) {
        
        MockInterview interview = interviewService.getInterviewById(id);
        // Verify owner
        if (!interview.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String candidateResponse = requestBody.get("response");
        if (candidateResponse == null || candidateResponse.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        MockInterview updated = interviewService.respondToQuestion(id, candidateResponse, userApiKey);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/evaluate")
    public ResponseEntity<MockInterview> evaluateInterview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @RequestHeader(name = "X-Groq-Api-Key", required = false) String userApiKey) {
        
        MockInterview interview = interviewService.getInterviewById(id);
        // Verify owner
        if (!interview.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        MockInterview updated = interviewService.evaluateInterview(id, userApiKey);
        return ResponseEntity.ok(updated);
    }
}
