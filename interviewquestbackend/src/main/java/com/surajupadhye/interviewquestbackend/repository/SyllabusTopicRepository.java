package com.surajupadhye.interviewquestbackend.repository;

import com.surajupadhye.interviewquestbackend.entity.SyllabusTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SyllabusTopicRepository extends JpaRepository<SyllabusTopic, Long> {
    List<SyllabusTopic> findBySubjectIdOrderBySortOrderAsc(Long subjectId);
    Optional<SyllabusTopic> findBySubjectSlugAndSlug(String subjectSlug, String slug);
}
