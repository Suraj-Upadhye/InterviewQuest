package com.surajupadhye.interviewquestbackend.service;

import com.surajupadhye.interviewquestbackend.entity.Profile;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    public Profile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user ID: " + userId));
    }

    @Transactional
    public Profile updateProfile(Long userId, Profile updatedProfileData) {
        Profile existingProfile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user ID: " + userId));

        existingProfile.setEducation(updatedProfileData.getEducation());
        existingProfile.setSkills(updatedProfileData.getSkills());
        existingProfile.setProjects(updatedProfileData.getProjects());
        existingProfile.setAchievements(updatedProfileData.getAchievements());
        existingProfile.setCertifications(updatedProfileData.getCertifications());
        existingProfile.setCodingProfiles(updatedProfileData.getCodingProfiles());

        return profileRepository.save(existingProfile);
    }
}
