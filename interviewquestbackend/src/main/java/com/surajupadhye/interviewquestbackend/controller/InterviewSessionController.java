package com.surajupadhye.interviewquestbackend.controller;

import com.surajupadhye.interviewquestbackend.entity.InterviewSession;
import com.surajupadhye.interviewquestbackend.repository.InterviewSessionRepository;
import com.surajupadhye.interviewquestbackend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/interview-sessions")
public class InterviewSessionController {

    @Autowired
    private InterviewSessionRepository sessionRepository;

    @GetMapping
    public ResponseEntity<List<InterviewSession>> getMySessionScores(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<InterviewSession> sessions = sessionRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId());
        return ResponseEntity.ok(sessions);
    }
}
