package com.surajupadhye.interviewquestbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private boolean emailVerified;
    private boolean isBlocked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
