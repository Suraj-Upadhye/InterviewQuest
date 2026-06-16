package com.surajupadhye.interviewquestbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mock_interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockInterview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "company_name", length = 100)
    private String companyName;

    @Column(name = "topic_or_skills", length = 255)
    private String topicOrSkills;

    @Column(name = "interview_type", nullable = false, length = 50)
    private String interviewType; // TECHNICAL, HR, SKILL_SPECIFIC

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private List<ChatMessage> conversation = new ArrayList<>();

    @Column(name = "credits_used", nullable = false)
    @Builder.Default
    private Integer creditsUsed = 1;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatMessage {
        private String role; // "system", "user", "assistant"
        private String content;
        @Builder.Default
        private LocalDateTime timestamp = LocalDateTime.now();
    }
}
