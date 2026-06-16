package com.surajupadhye.interviewquestbackend.controller;

import com.surajupadhye.interviewquestbackend.dto.JwtResponse;
import com.surajupadhye.interviewquestbackend.dto.LoginRequest;
import com.surajupadhye.interviewquestbackend.dto.MessageResponse;
import com.surajupadhye.interviewquestbackend.dto.RegisterRequest;
import com.surajupadhye.interviewquestbackend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        try {
            authService.register(signUpRequest);
            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.login(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }
}
