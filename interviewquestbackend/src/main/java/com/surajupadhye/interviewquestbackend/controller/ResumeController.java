package com.surajupadhye.interviewquestbackend.controller;

import com.surajupadhye.interviewquestbackend.entity.Resume;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.security.UserDetailsImpl;
import com.surajupadhye.interviewquestbackend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users/profile/resume")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @GetMapping
    public ResponseEntity<?> getResume(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Resume resume = resumeService.getResumeByUserId(userDetails.getId());
            return ResponseEntity.ok(resume);
        } catch (ResourceNotFoundException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No resume uploaded yet.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> uploadResume(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("file") MultipartFile file) {
        try {
            Resume saved = resumeService.uploadResume(userDetails.getId(), file);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (IOException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error uploading file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteResume(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            resumeService.deleteResume(userDetails.getId());
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No resume found to delete.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}
