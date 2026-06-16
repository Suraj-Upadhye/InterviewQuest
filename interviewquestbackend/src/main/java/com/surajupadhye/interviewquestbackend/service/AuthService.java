package com.surajupadhye.interviewquestbackend.service;

import com.surajupadhye.interviewquestbackend.dto.JwtResponse;
import com.surajupadhye.interviewquestbackend.dto.LoginRequest;
import com.surajupadhye.interviewquestbackend.dto.RegisterRequest;
import com.surajupadhye.interviewquestbackend.entity.Profile;
import com.surajupadhye.interviewquestbackend.entity.Role;
import com.surajupadhye.interviewquestbackend.entity.User;
import com.surajupadhye.interviewquestbackend.repository.ProfileRepository;
import com.surajupadhye.interviewquestbackend.repository.UserRepository;
import com.surajupadhye.interviewquestbackend.security.JwtUtils;
import com.surajupadhye.interviewquestbackend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public void register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new IllegalArgumentException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        // Determine Role
        Role role = Role.ROLE_USER;
        if (registerRequest.getRole() != null) {
            try {
                role = Role.valueOf(registerRequest.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Error: Invalid Role specified. Choose ROLE_USER or ROLE_ADMIN.");
            }
        }

        // Create new user's account
        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(encoder.encode(registerRequest.getPassword()))
                .role(role)
                .build();

        User savedUser = userRepository.save(user);

        // Auto-create empty profile linked to the user
        Profile profile = Profile.builder()
                .user(savedUser)
                .build();
        profileRepository.save(profile);
    }

    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsernameOrEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                role
        );
    }
}
