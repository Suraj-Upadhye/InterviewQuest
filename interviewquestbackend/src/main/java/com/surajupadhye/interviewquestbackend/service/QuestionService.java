package com.surajupadhye.interviewquestbackend.service;

import com.surajupadhye.interviewquestbackend.entity.Difficulty;
import com.surajupadhye.interviewquestbackend.entity.Question;
import com.surajupadhye.interviewquestbackend.entity.Topic;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    public Page<Question> getAllQuestions(Pageable pageable) {
        return questionRepository.findAll(pageable);
    }

    public Page<Question> getQuestionsByTopic(Topic topic, Pageable pageable) {
        return questionRepository.findByTopic(topic, pageable);
    }

    public Page<Question> getQuestionsByTopicAndDifficulty(Topic topic, Difficulty difficulty, Pageable pageable) {
        return questionRepository.findByTopicAndDifficulty(topic, difficulty, pageable);
    }

    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
    }

    public List<Question> getRandomPracticeQuestions(Topic topic, int limit) {
        return questionRepository.findRandomQuestionsByTopic(topic.name(), limit);
    }

    @Transactional
    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }

    @Transactional
    public Question updateQuestion(Long id, Question updatedQuestion) {
        Question existingQuestion = getQuestionById(id);

        existingQuestion.setTopic(updatedQuestion.getTopic());
        existingQuestion.setDifficulty(updatedQuestion.getDifficulty());
        existingQuestion.setQuestionText(updatedQuestion.getQuestionText());
        existingQuestion.setOptions(updatedQuestion.getOptions());
        existingQuestion.setCorrectAnswer(updatedQuestion.getCorrectAnswer());
        existingQuestion.setExplanation(updatedQuestion.getExplanation());
        existingQuestion.setAiGenerated(updatedQuestion.isAiGenerated());

        return questionRepository.save(existingQuestion);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        Question question = getQuestionById(id);
        questionRepository.delete(question);
    }
}
