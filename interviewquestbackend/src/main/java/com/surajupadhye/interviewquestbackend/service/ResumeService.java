package com.surajupadhye.interviewquestbackend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.surajupadhye.interviewquestbackend.entity.Resume;
import com.surajupadhye.interviewquestbackend.entity.User;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.ResumeRepository;
import com.surajupadhye.interviewquestbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private Cloudinary cloudinary;

    private static final long MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

    public Resume getResumeByUserId(Long userId) {
        return resumeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found for user ID: " + userId));
    }

    @Transactional
    public Resume uploadResume(Long userId, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty.");
        }

        // Validate content type is PDF
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            throw new IllegalArgumentException("Only PDF resumes are allowed.");
        }

        // Validate file size limit
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Resume file size must not exceed 2MB.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Delete existing resume from Cloudinary and DB if present
        Optional<Resume> existingResumeOpt = resumeRepository.findByUserId(userId);
        if (existingResumeOpt.isPresent()) {
            Resume existing = existingResumeOpt.get();
            try {
                String existingPublicId = existing.getCloudinaryPublicId();
                Map<?, ?> destroyResult = cloudinary.uploader().destroy(existingPublicId, ObjectUtils.asMap(
                        "resource_type", "image",
                        "invalidate", true
                ));
                if (destroyResult != null && "not_found".equals(destroyResult.get("result"))) {
                    cloudinary.uploader().destroy(existingPublicId, ObjectUtils.asMap(
                            "resource_type", "raw",
                            "invalidate", true
                    ));
                }
            } catch (Exception e) {
                // Log and proceed to overwrite database coordinates regardless
                System.err.println("Failed to delete old file from Cloudinary: " + e.getMessage());
            }
            resumeRepository.delete(existing);
        }

        // Upload new file to Cloudinary as a document/image resource (which serves inline headers for preview)
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", "image",
                "folder", "resumes",
                "public_id", "user_" + userId + "_resume_" + System.currentTimeMillis()
        ));

        String url = (String) uploadResult.get("secure_url");
        if (url != null && !url.toLowerCase().endsWith(".pdf")) {
            url = url + ".pdf";
        }
        String publicId = (String) uploadResult.get("public_id");

        Resume resume = Resume.builder()
                .user(user)
                .cloudinaryUrl(url)
                .cloudinaryPublicId(publicId)
                .build();

        return resumeRepository.save(resume);
    }

    @Transactional
    public void deleteResume(Long userId) {
        Resume resume = resumeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found for user ID: " + userId));

        // Delete from Cloudinary
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

        // Delete from DB
        resumeRepository.delete(resume);
    }
}
