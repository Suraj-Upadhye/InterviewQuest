package com.surajupadhye.interviewquestbackend.repository;

import com.surajupadhye.interviewquestbackend.entity.ExperienceStatus;
import com.surajupadhye.interviewquestbackend.entity.InterviewExperience;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewExperienceRepository extends JpaRepository<InterviewExperience, Long> {

    @Query("SELECT e FROM InterviewExperience e WHERE " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:companyId IS NULL OR e.company.id = :companyId) AND " +
           "(:year IS NULL OR e.yearOfInterview = :year) AND " +
           "(:role IS NULL OR LOWER(e.role) LIKE LOWER(CONCAT('%', :role, '%'))) AND " +
           "(:isSelected IS NULL OR e.isSelected = :isSelected)")
    Page<InterviewExperience> filterExperiences(
            @Param("status") ExperienceStatus status,
            @Param("companyId") Long companyId,
            @Param("year") Integer year,
            @Param("role") String role,
            @Param("isSelected") Boolean isSelected,
            Pageable pageable);

    List<InterviewExperience> findByUserId(Long userId);
}
