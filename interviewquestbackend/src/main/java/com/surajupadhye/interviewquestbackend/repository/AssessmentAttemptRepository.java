package com.surajupadhye.interviewquestbackend.repository;

import com.surajupadhye.interviewquestbackend.entity.AssessmentAttempt;
import com.surajupadhye.interviewquestbackend.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, Long> {
    List<AssessmentAttempt> findByUserIdOrderByStartedAtDesc(Long userId);
    List<AssessmentAttempt> findByUserIdAndTopicOrderByStartedAtDesc(Long userId, Topic topic);
    List<AssessmentAttempt> findByUserIdAndQuizIdOrderByStartedAtDesc(Long userId, Long quizId);
    List<AssessmentAttempt> findByUserIdAndQuizSubjectSlugOrderByStartedAtDesc(Long userId, String subjectSlug);
}
