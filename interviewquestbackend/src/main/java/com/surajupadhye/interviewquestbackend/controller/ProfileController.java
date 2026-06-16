package com.surajupadhye.interviewquestbackend.controller;

import com.surajupadhye.interviewquestbackend.entity.Profile;
import com.surajupadhye.interviewquestbackend.security.UserDetailsImpl;
import com.surajupadhye.interviewquestbackend.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/profile")
    public ResponseEntity<Profile> getMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Profile profile = profileService.getProfileByUserId(userDetails.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<Profile> updateMyProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Profile updatedProfile) {
        Profile profile = profileService.updateProfile(userDetails.getId(), updatedProfile);
        return ResponseEntity.ok(profile);
    }
}
