package com.surajupadhye.interviewquestbackend.controller;

import com.surajupadhye.interviewquestbackend.entity.Subject;
import com.surajupadhye.interviewquestbackend.entity.SyllabusTopic;
import com.surajupadhye.interviewquestbackend.service.SubjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    // ==========================================
    // PUBLIC ENDPOINTS
    // ==========================================

    @GetMapping("/api/public/subjects")
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @GetMapping("/api/public/subjects/landing")
    public ResponseEntity<List<Subject>> getSubjectsForLandingPage() {
        return ResponseEntity.ok(subjectService.getSubjectsForLandingPage());
    }

    @GetMapping("/api/public/subjects/{slug}")
    public ResponseEntity<Subject> getSubjectBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(subjectService.getSubjectBySlug(slug));
    }

    @GetMapping("/api/public/subjects/{subjectSlug}/topics/{topicSlug}")
    public ResponseEntity<SyllabusTopic> getTopicBySlug(
            @PathVariable String subjectSlug,
            @PathVariable String topicSlug) {
        return ResponseEntity.ok(subjectService.getTopicBySubjectAndTopicSlug(subjectSlug, topicSlug));
    }

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    @PostMapping("/api/admin/subjects")
    public ResponseEntity<Subject> createSubject(@Valid @RequestBody Subject subject) {
        Subject created = subjectService.createSubject(subject);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/api/admin/subjects/{id}")
    public ResponseEntity<Subject> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody Subject subject) {
        Subject updated = subjectService.updateSubject(id, subject);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/admin/subjects/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/admin/subjects/{subjectId}/topics")
    public ResponseEntity<SyllabusTopic> createTopic(
            @PathVariable Long subjectId,
            @Valid @RequestBody SyllabusTopic topic) {
        SyllabusTopic created = subjectService.createTopic(subjectId, topic);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/api/admin/subjects/topics/{id}")
    public ResponseEntity<SyllabusTopic> updateTopic(
            @PathVariable Long id,
            @Valid @RequestBody SyllabusTopic topic) {
        SyllabusTopic updated = subjectService.updateTopic(id, topic);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/admin/subjects/topics/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        subjectService.deleteTopic(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/api/admin/subjects/{subjectId}/chapters/rename")
    public ResponseEntity<Void> renameChapter(
            @PathVariable Long subjectId,
            @RequestParam String oldName,
            @RequestParam String newName) {
        subjectService.renameChapter(subjectId, oldName, newName);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/api/admin/subjects/{subjectId}/chapters")
    public ResponseEntity<Void> deleteChapter(
            @PathVariable Long subjectId,
            @RequestParam String chapterName) {
        subjectService.deleteChapter(subjectId, chapterName);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/admin/subjects/topics/generate-ai")
    public ResponseEntity<java.util.Map<String, String>> generateTopicContent(
            @RequestBody java.util.Map<String, String> request) {
        String prompt = request.get("prompt");
        if (prompt == null || prompt.isBlank()) {
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Prompt is required");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        String generatedContent = subjectService.generateTopicContent(prompt);
        java.util.Map<String, String> successResponse = new java.util.HashMap<>();
        successResponse.put("content", generatedContent);
        return ResponseEntity.ok(successResponse);
    }
}
