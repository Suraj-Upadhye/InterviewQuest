package com.surajupadhye.interviewquestbackend.controller;

import com.surajupadhye.interviewquestbackend.dto.UserSummaryDTO;
import com.surajupadhye.interviewquestbackend.dto.MessageResponse;
import com.surajupadhye.interviewquestbackend.entity.User;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserSummaryDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> usersPage;
        if (search == null || search.trim().isEmpty()) {
            usersPage = userRepository.findAll(pageable);
        } else {
            String query = search.trim();
            usersPage = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    query, query, pageable);
        }

        Page<UserSummaryDTO> summaryPage = usersPage.map(u -> UserSummaryDTO.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole() != null ? u.getRole().name() : "ROLE_USER")
                .emailVerified(u.isEmailVerified())
                .isBlocked(u.isBlocked())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build());

        return ResponseEntity.ok(summaryPage);
    }

    @PutMapping("/{id}/toggle-block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleBlockUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Prevent admin from blocking themselves
        user.setBlocked(!user.isBlocked());
        userRepository.save(user);

        String status = user.isBlocked() ? "blocked" : "unblocked";
        return ResponseEntity.ok(new MessageResponse("User has been successfully " + status + "."));
    }
}
