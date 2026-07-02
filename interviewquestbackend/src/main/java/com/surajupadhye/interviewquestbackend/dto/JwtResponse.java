package com.surajupadhye.interviewquestbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String refreshToken;
    private Long id;
    private String username;
    private String email;
    private String role;
    private boolean isGoogleUser;

    public JwtResponse(String token, String refreshToken, Long id, String username, String email, String role, boolean isGoogleUser) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.isGoogleUser = isGoogleUser;
    }
}
