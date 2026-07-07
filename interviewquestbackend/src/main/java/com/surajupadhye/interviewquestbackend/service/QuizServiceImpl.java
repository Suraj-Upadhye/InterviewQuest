package com.surajupadhye.interviewquestbackend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.surajupadhye.interviewquestbackend.dto.*;
import com.surajupadhye.interviewquestbackend.entity.*;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuizServiceImpl implements QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private SyllabusTopicRepository syllabusTopicRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AssessmentAttemptRepository attemptRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AIService aiService;

    @Override
    public Quiz createQuiz(QuizCreateRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + request.getSubjectId()));

        SyllabusTopic syllabusTopic = null;
        if (request.getSyllabusTopicId() != null) {
            syllabusTopic = syllabusTopicRepository.findById(request.getSyllabusTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("SyllabusTopic not found with ID: " + request.getSyllabusTopicId()));
        }

        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .subject(subject)
                .syllabusTopic(syllabusTopic)
                .build();

        return quizRepository.save(quiz);
    }

    @Override
    public void deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with ID: " + id));
        quizRepository.delete(quiz);
    }

    @Override
    public Quiz renameQuiz(Long id, String newTitle) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with ID: " + id));
        quiz.setTitle(newTitle);
        return quizRepository.save(quiz);
    }

    @Override
    public Question addQuestionToQuiz(Long quizId, Question question) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with ID: " + quizId));
        question.setQuiz(quiz);
        if (question.getDifficulty() == null) {
            question.setDifficulty(Difficulty.MEDIUM);
        }
        return questionRepository.save(question);
    }

    @Override
    public Question updateQuestionInQuiz(Long questionId, Question questionDetails) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + questionId));
        question.setQuestionText(questionDetails.getQuestionText());
        question.setOptions(questionDetails.getOptions());
        question.setCorrectAnswer(questionDetails.getCorrectAnswer());
        question.setExplanation(questionDetails.getExplanation());
        if (questionDetails.getDifficulty() != null) {
            question.setDifficulty(questionDetails.getDifficulty());
        }
        return questionRepository.save(question);
    }

    @Override
    public void deleteQuestionFromQuiz(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + questionId));
        questionRepository.delete(question);
    }

    @Override
    public Quiz generateQuizWithAI(QuizCreateRequest request, String userApiKey) {
        // First create the Quiz shell
        Quiz quiz = createQuiz(request);

        Subject subject = subjectRepository.findById(request.getSubjectId()).orElse(null);
        SyllabusTopic syllabusTopic = request.getSyllabusTopicId() != null ? 
                syllabusTopicRepository.findById(request.getSyllabusTopicId()).orElse(null) : null;

        String topicTitle = syllabusTopic != null ? syllabusTopic.getTitle() : "General Concepts";
        String subjectTitle = subject != null ? subject.getTitle() : "Computer Science";

        String prompt = String.format(
                "Generate exactly %d multiple choice questions (MCQs) for the topic \"%s\" under the subject \"%s\". " +
                "Difficulty level: %s.\n\n" +
                "You MUST return the output ONLY as a valid JSON array of objects. Do not wrap the JSON in markdown code blocks, do not include any explanatory text, only return raw JSON.\n" +
                "Each JSON object in the array must have the exact structure:\n" +
                "{\n" +
                "  \"questionText\": \"The text of the question\",\n" +
                "  \"options\": [\n" +
                "    \"Option A description\",\n" +
                "    \"Option B description\",\n" +
                "    \"Option C description\",\n" +
                "    \"Option D description\"\n" +
                "  ],\n" +
                "  \"correctAnswer\": \"The exact option string that is correct (must match one of the options array exactly)\",\n" +
                "  \"explanation\": \"Detailed explanation of why this answer is correct\"\n" +
                "}",
                request.getNumQuestions(), topicTitle, subjectTitle, request.getDifficulty()
        );

        try {
            String rawJsonContent = aiService.generateJson(prompt, userApiKey);

            // Sometime AI wraps response inside a root key or returns a list directly. Let's parse it safely:
            JsonNode quizNode = objectMapper.readTree(rawJsonContent);
            JsonNode questionsArray = quizNode.isArray() ? quizNode : quizNode.path("questions");

            if (!questionsArray.isArray()) {
                throw new RuntimeException("AI did not return a JSON array for questions. Content: " + rawJsonContent);
            }

            List<Question> questions = new ArrayList<>();
            for (JsonNode qNode : questionsArray) {
                String questionText = qNode.path("questionText").asText();
                List<String> options = new ArrayList<>();
                for (JsonNode optNode : qNode.path("options")) {
                    options.add(optNode.asText());
                }
                String correctAnswer = qNode.path("correctAnswer").asText();
                String explanation = qNode.path("explanation").asText();

                // Validation to make sure correctAnswer is within options
                if (!options.contains(correctAnswer) && !options.isEmpty()) {
                    correctAnswer = options.get(0); // Fallback
                }

                Question question = Question.builder()
                        .questionText(questionText)
                        .options(options)
                        .correctAnswer(correctAnswer)
                        .explanation(explanation)
                        .difficulty(request.getDifficulty() != null ? Difficulty.valueOf(request.getDifficulty().toUpperCase()) : Difficulty.MEDIUM)
                        .isAiGenerated(true)
                        .quiz(quiz)
                        .build();

                questions.add(questionRepository.save(question));
            }

            quiz.setQuestions(questions);
            return quiz;

        } catch (Exception e) {
            // Delete created quiz shell if generation completely fails
            quizRepository.delete(quiz);
            throw new RuntimeException("AI MCQ generation failed: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Quiz> getQuizzesBySubject(String subjectSlug) {
        return quizRepository.findBySubjectSlug(subjectSlug);
    }

    @Override
    public List<QuizQuestionDTO> startQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with ID: " + quizId));

        return quiz.getQuestions().stream()
                .map(QuizQuestionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuizResultResponse submitQuiz(User user, Long quizId, QuizSubmitRequest submitRequest) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with ID: " + quizId));

        List<Question> questions = quiz.getQuestions();
        Map<Long, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        int score = 0;
        List<QuizResultResponse.QuestionGradingResult> details = new ArrayList<>();

        for (QuizSubmitRequest.UserAnswer answer : submitRequest.getAnswers()) {
            Question question = questionMap.get(answer.getQuestionId());
            if (question == null) {
                continue; // Skip or handle missing
            }

            boolean isCorrect = question.getCorrectAnswer().trim().equalsIgnoreCase(
                    answer.getSubmittedAnswer() != null ? answer.getSubmittedAnswer().trim() : ""
            );

            if (isCorrect) {
                score++;
            }

            details.add(QuizResultResponse.QuestionGradingResult.builder()
                    .questionId(question.getId())
                    .questionText(question.getQuestionText())
                    .options(question.getOptions())
                    .submittedAnswer(answer.getSubmittedAnswer())
                    .correctAnswer(question.getCorrectAnswer())
                    .explanation(question.getExplanation())
                    .isCorrect(isCorrect)
                    .build());
        }

        // Add any unanswered questions
        for (Question q : questions) {
            boolean answered = submitRequest.getAnswers().stream()
                    .anyMatch(a -> a.getQuestionId().equals(q.getId()));
            if (!answered) {
                details.add(QuizResultResponse.QuestionGradingResult.builder()
                        .questionId(q.getId())
                        .questionText(q.getQuestionText())
                        .options(q.getOptions())
                        .submittedAnswer("")
                        .correctAnswer(q.getCorrectAnswer())
                        .explanation(q.getExplanation())
                        .isCorrect(false)
                        .build());
            }
        }

        int totalQuestions = questions.size();
        if (totalQuestions == 0) totalQuestions = 1; // Avoid divide by zero

        // Save Attempt in DB
        AssessmentAttempt attempt = AssessmentAttempt.builder()
                .user(user)
                .quiz(quiz)
                .topic(null) // Dynamic topic is stored in the Quiz entity
                .score(score)
                .totalQuestions(totalQuestions)
                .build();

        AssessmentAttempt savedAttempt = attemptRepository.save(attempt);

        double percentage = (double) score / totalQuestions * 100.0;

        return QuizResultResponse.builder()
                .attemptId(savedAttempt.getId())
                .quizTitle(quiz.getTitle())
                .subjectTitle(quiz.getSubject().getTitle())
                .score(score)
                .totalQuestions(totalQuestions)
                .percentage(Math.round(percentage * 100.0) / 100.0)
                .details(details)
                .build();
    }

    @Override
    public List<QuizQuestionDTO> startMixQuiz(List<String> subjectSlugs, int limit) {
        List<Question> allSubjectQuestions = new ArrayList<>();

        for (String slug : subjectSlugs) {
            List<Quiz> quizzes = quizRepository.findBySubjectSlug(slug);
            for (Quiz q : quizzes) {
                allSubjectQuestions.addAll(q.getQuestions());
            }
        }

        Collections.shuffle(allSubjectQuestions);
        int size = Math.min(allSubjectQuestions.size(), limit);
        return allSubjectQuestions.subList(0, size).stream()
                .map(QuizQuestionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuizResultResponse submitMixQuiz(User user, String subjectSlugsCombined, QuizSubmitRequest submitRequest) {
        List<Long> questionIds = submitRequest.getAnswers().stream()
                .map(QuizSubmitRequest.UserAnswer::getQuestionId)
                .collect(Collectors.toList());

        List<Question> questions = questionRepository.findAllById(questionIds);
        Map<Long, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        int score = 0;
        List<QuizResultResponse.QuestionGradingResult> details = new ArrayList<>();

        for (QuizSubmitRequest.UserAnswer answer : submitRequest.getAnswers()) {
            Question question = questionMap.get(answer.getQuestionId());
            if (question == null) {
                continue;
            }

            boolean isCorrect = question.getCorrectAnswer().trim().equalsIgnoreCase(
                    answer.getSubmittedAnswer() != null ? answer.getSubmittedAnswer().trim() : ""
            );

            if (isCorrect) {
                score++;
            }

            details.add(QuizResultResponse.QuestionGradingResult.builder()
                    .questionId(question.getId())
                    .questionText(question.getQuestionText())
                    .options(question.getOptions())
                    .submittedAnswer(answer.getSubmittedAnswer())
                    .correctAnswer(question.getCorrectAnswer())
                    .explanation(question.getExplanation())
                    .isCorrect(isCorrect)
                    .build());
        }

        int totalQuestions = submitRequest.getAnswers().size();
        if (totalQuestions == 0) totalQuestions = 1;

        // Save Attempt in DB
        AssessmentAttempt attempt = AssessmentAttempt.builder()
                .user(user)
                .quiz(null) // Mixed quiz is dynamic, not saved in quizzes table
                .topic(null)
                .score(score)
                .totalQuestions(totalQuestions)
                .build();

        AssessmentAttempt savedAttempt = attemptRepository.save(attempt);

        double percentage = (double) score / totalQuestions * 100.0;

        String subjectTitle = "Mixed Quiz";
        List<String> slugs = Arrays.asList(subjectSlugsCombined.split("~"));
        if (slugs.size() == 1) {
            Optional<Subject> subjectOpt = subjectRepository.findBySlug(slugs.get(0));
            if (subjectOpt.isPresent()) {
                subjectTitle = subjectOpt.get().getTitle() + " Practice Quiz";
            } else {
                subjectTitle = subjectSlugsCombined.toUpperCase().replace("-", " ") + " Practice Quiz";
            }
        } else {
            subjectTitle = slugs.stream()
                .map(slug -> {
                    Optional<Subject> s = subjectRepository.findBySlug(slug);
                    return s.map(Subject::getTitle).orElse(slug.toUpperCase().replace("-", " "));
                })
                .collect(Collectors.joining(" & "));
        }

        return QuizResultResponse.builder()
                .attemptId(savedAttempt.getId())
                .quizTitle(slugs.size() == 1 ? "Subject Quiz" : "Mixed Subjects Quiz")
                .subjectTitle(subjectTitle)
                .score(score)
                .totalQuestions(totalQuestions)
                .percentage(Math.round(percentage * 100.0) / 100.0)
                .details(details)
                .build();
    }
}
