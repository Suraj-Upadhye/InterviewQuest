package com.surajupadhye.interviewquestbackend.controller;

import com.surajupadhye.interviewquestbackend.entity.ExperienceStatus;
import com.surajupadhye.interviewquestbackend.entity.InterviewExperience;
import com.surajupadhye.interviewquestbackend.entity.User;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.UserRepository;
import com.surajupadhye.interviewquestbackend.security.UserDetailsImpl;
import com.surajupadhye.interviewquestbackend.service.InterviewExperienceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class InterviewExperienceController {

    @Autowired
    private InterviewExperienceService experienceService;

    @Autowired
    private UserRepository userRepository;

    // Public API - Browsing approved placement experiences
    @GetMapping("/api/public/experiences")
    public ResponseEntity<Page<InterviewExperience>> getApprovedExperiences(
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isSelected,
            Pageable pageable) {
        Page<InterviewExperience> experiences = experienceService.getApprovedExperiences(companyId, year, role, isSelected, pageable);
        return ResponseEntity.ok(experiences);
    }

    @GetMapping("/api/public/experiences/{id}")
    public ResponseEntity<InterviewExperience> getExperienceById(@PathVariable Long id) {
        InterviewExperience experience = experienceService.getExperienceById(id);
        // Ensure guests can only view approved experiences
        if (experience.getStatus() != ExperienceStatus.APPROVED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(experience);
    }

    // Secure User API - Submit and Upvote experiences
    @PostMapping("/api/experiences")
    public ResponseEntity<InterviewExperience> submitExperience(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody InterviewExperience experience) {
        User author = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Logged in User not found"));

        InterviewExperience submitted = experienceService.submitExperience(experience, author);
        return new ResponseEntity<>(submitted, HttpStatus.CREATED);
    }

    @PostMapping("/api/experiences/{id}/upvote")
    public ResponseEntity<InterviewExperience> toggleUpvote(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        InterviewExperience updated = experienceService.toggleUpvote(id, userDetails.getId());
        return ResponseEntity.ok(updated);
    }

    // Admin API - Moderating experiences
    @GetMapping("/api/admin/experiences")
    public ResponseEntity<Page<InterviewExperience>> getAllExperiencesForAdmin(
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isSelected,
            @RequestParam(required = false) ExperienceStatus status,
            Pageable pageable) {
        Page<InterviewExperience> experiences = experienceService.getAllExperiencesForAdmin(companyId, year, role, isSelected, status, pageable);
        return ResponseEntity.ok(experiences);
    }

    @PutMapping("/api/admin/experiences/{id}/status")
    public ResponseEntity<InterviewExperience> updateStatus(
            @PathVariable Long id,
            @RequestParam ExperienceStatus status) {
        InterviewExperience updated = experienceService.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/admin/experiences/{id}")
    public ResponseEntity<Void> deleteExperience(@PathVariable Long id) {
        experienceService.deleteExperience(id);
        return ResponseEntity.noContent().build();
    }
}
