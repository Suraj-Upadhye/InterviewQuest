package com.surajupadhye.interviewquestbackend.service;

import com.surajupadhye.interviewquestbackend.entity.ExperienceStatus;
import com.surajupadhye.interviewquestbackend.entity.InterviewExperience;
import com.surajupadhye.interviewquestbackend.entity.User;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.InterviewExperienceRepository;
import com.surajupadhye.interviewquestbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InterviewExperienceService {

    @Autowired
    private InterviewExperienceRepository experienceRepository;

    @Autowired
    private UserRepository userRepository;

    public Page<InterviewExperience> getApprovedExperiences(Long companyId, Integer year, String role, Boolean isSelected, Pageable pageable) {
        return experienceRepository.filterExperiences(ExperienceStatus.APPROVED, companyId, year, role, isSelected, pageable);
    }

    public Page<InterviewExperience> getAllExperiencesForAdmin(Long companyId, Integer year, String role, Boolean isSelected, ExperienceStatus status, Pageable pageable) {
        return experienceRepository.filterExperiences(status, companyId, year, role, isSelected, pageable);
    }

    public InterviewExperience getExperienceById(Long id) {
        return experienceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview Experience not found with id: " + id));
    }

    @Transactional
    public InterviewExperience submitExperience(InterviewExperience experience, User author) {
        experience.setUser(author);
        experience.setStatus(ExperienceStatus.PENDING);
        experience.setUpvoteCount(0);

        // Bind stages back-reference to experience
        if (experience.getStages() != null) {
            experience.getStages().forEach(stage -> stage.setInterviewExperience(experience));
        }

        return experienceRepository.save(experience);
    }

    @Transactional
    public InterviewExperience updateStatus(Long id, ExperienceStatus status) {
        InterviewExperience experience = getExperienceById(id);
        experience.setStatus(status);
        return experienceRepository.save(experience);
    }

    @Transactional
    public InterviewExperience toggleUpvote(Long id, Long userId) {
        InterviewExperience experience = getExperienceById(id);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (experience.getUpvotingUsers().contains(user)) {
            // Already upvoted, remove upvote
            experience.getUpvotingUsers().remove(user);
        } else {
            // Not upvoted, add upvote
            experience.getUpvotingUsers().add(user);
        }

        // Keep upvote count denormalized in the column for quick sorting/filtering
        experience.setUpvoteCount(experience.getUpvotingUsers().size());

        return experienceRepository.save(experience);
    }

    @Transactional
    public void deleteExperience(Long id) {
        InterviewExperience experience = getExperienceById(id);
        experienceRepository.delete(experience);
    }
}
