package com.surajupadhye.interviewquestbackend.repository;

import com.surajupadhye.interviewquestbackend.entity.Difficulty;
import com.surajupadhye.interviewquestbackend.entity.Question;
import com.surajupadhye.interviewquestbackend.entity.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query(value = "SELECT * FROM questions q WHERE q.topic = :topic ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestionsByTopic(@Param("topic") String topic, @Param("limit") int limit);

    Page<Question> findByTopic(Topic topic, Pageable pageable);
    Page<Question> findByTopicAndDifficulty(Topic topic, Difficulty difficulty, Pageable pageable);
}
