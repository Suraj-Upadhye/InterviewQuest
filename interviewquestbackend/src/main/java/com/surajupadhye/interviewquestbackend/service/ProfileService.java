package com.surajupadhye.interviewquestbackend.service;

import com.surajupadhye.interviewquestbackend.entity.User;
import com.surajupadhye.interviewquestbackend.entity.OtpVerification;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.UserRepository;
import com.surajupadhye.interviewquestbackend.repository.OtpVerificationRepository;
import com.surajupadhye.interviewquestbackend.repository.RefreshTokenRepository;
import com.surajupadhye.interviewquestbackend.repository.PasswordResetTokenRepository;
import com.surajupadhye.interviewquestbackend.repository.ResumeRepository;
import com.surajupadhye.interviewquestbackend.entity.Role;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Map<String, Object> getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole().name());
        profile.put("createdAt", user.getCreatedAt());
        return profile;
    }

    @Transactional
    public Map<String, Object> updateUsername(Long userId, String newUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if username is already taken by another user
        if (userRepository.existsByUsername(newUsername) &&
                !user.getUsername().equals(newUsername)) {
            throw new IllegalArgumentException("Username is already taken by another account.");
        }

        user.setUsername(newUsername);
        User savedUser = userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("id", savedUser.getId());
        result.put("username", savedUser.getUsername());
        result.put("email", savedUser.getEmail());
        result.put("role", savedUser.getRole().name());
        return result;
    }

    public void sendPasswordChangeOtp(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String email = user.getEmail();

        // Generate 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        
        // Save or update in database
        OtpVerification otpVerification = OtpVerification.builder()
                .email(email)
                .otpCode(otp)
                .expiryTime(java.time.LocalDateTime.now().plusMinutes(5)) // 5 minutes expiry
                .build();
        
        otpVerificationRepository.save(otpVerification);

        // Send Email
        emailService.sendPasswordChangeOtpEmail(email, otp);
    }

    @Transactional
    public void changePassword(Long userId, String otp, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify OTP
        OtpVerification otpVerification = otpVerificationRepository.findById(user.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No verification code found for this email. Please request a new code."));

        if (!otpVerification.getOtpCode().equals(otp)) {
            throw new IllegalArgumentException("Invalid verification code.");
        }

        if (otpVerification.getExpiryTime().isBefore(java.time.LocalDateTime.now())) {
            otpVerificationRepository.delete(otpVerification);
            throw new IllegalArgumentException("Verification code has expired. Please request a new one.");
        }

        // Delete the OTP after successful verification
        otpVerificationRepository.delete(otpVerification);

        // Encode and set new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void deleteUserAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Only ROLE_USER accounts can be deleted. Enforce that ROLE_ADMIN cannot be self-deleted.
        if (user.getRole() == Role.ROLE_ADMIN) {
            throw new IllegalArgumentException("Administrator accounts cannot be deleted.");
        }

        // 1. Delete RefreshToken
        try {
            refreshTokenRepository.deleteByUser(user);
        } catch (Exception e) {
            System.err.println("Error deleting refresh token: " + e.getMessage());
        }

        // 2. Delete PasswordResetToken
        try {
            passwordResetTokenRepository.deleteByUser(user);
        } catch (Exception e) {
            System.err.println("Error deleting password reset token: " + e.getMessage());
        }

        // 3. Delete OtpVerification (associated with user's email)
        try {
            otpVerificationRepository.deleteById(user.getEmail());
        } catch (Exception e) {
            System.err.println("Error deleting otp verification: " + e.getMessage());
        }

        // 4. Delete Resume from Cloudinary & DB (if exists)
        try {
            resumeRepository.findByUserId(userId).ifPresent(resume -> {
                try {
                    String publicId = resume.getCloudinaryPublicId();
                    Map<?, ?> destroyResult = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                            "resource_type", "image",
                            "invalidate", true
                    ));
                    if (destroyResult != null && "not_found".equals(destroyResult.get("result"))) {
                        cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                                "resource_type", "raw",
                                "invalidate", true
                        ));
                    }
                } catch (Exception e) {
                    System.err.println("Failed to delete file from Cloudinary: " + e.getMessage());
                }
                resumeRepository.delete(resume);
            });
        } catch (Exception e) {
            System.err.println("Error deleting resume: " + e.getMessage());
        }

        // 5. Delete the User. Database cascade will delete assessment attempts, notifications, mock interviews.
        userRepository.delete(user);
    }
}
