package com.surajupadhye.interviewquestbackend.repository;

import com.surajupadhye.interviewquestbackend.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findBySubjectId(Long subjectId);
    List<Quiz> findBySyllabusTopicId(Long syllabusTopicId);
    List<Quiz> findBySubjectSlug(String subjectSlug);
}
