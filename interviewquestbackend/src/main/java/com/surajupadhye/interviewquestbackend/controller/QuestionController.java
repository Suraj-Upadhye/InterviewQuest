package com.surajupadhye.interviewquestbackend.controller;

import com.surajupadhye.interviewquestbackend.entity.Difficulty;
import com.surajupadhye.interviewquestbackend.entity.Question;
import com.surajupadhye.interviewquestbackend.entity.Topic;
import com.surajupadhye.interviewquestbackend.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    // Public / Authenticated Practice Mode API
    @GetMapping("/api/questions/practice")
    public ResponseEntity<List<Question>> getRandomPracticeQuestions(
            @RequestParam Topic topic,
            @RequestParam(defaultValue = "10") int limit) {
        List<Question> questions = questionService.getRandomPracticeQuestions(topic, limit);
        return ResponseEntity.ok(questions);
    }

    // Admin MCQ Bank Management APIs
    @GetMapping("/api/admin/questions")
    public ResponseEntity<Page<Question>> getAllQuestions(
            @RequestParam(required = false) Topic topic,
            @RequestParam(required = false) Difficulty difficulty,
            Pageable pageable) {
        Page<Question> questions;
        if (topic != null && difficulty != null) {
            questions = questionService.getQuestionsByTopicAndDifficulty(topic, difficulty, pageable);
        } else if (topic != null) {
            questions = questionService.getQuestionsByTopic(topic, pageable);
        } else {
            questions = questionService.getAllQuestions(pageable);
        }
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/api/admin/questions/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @PostMapping("/api/admin/questions")
    public ResponseEntity<Question> createQuestion(@Valid @RequestBody Question question) {
        Question created = questionService.createQuestion(question);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/api/admin/questions/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @Valid @RequestBody Question question) {
        Question updated = questionService.updateQuestion(id, question);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/admin/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}
