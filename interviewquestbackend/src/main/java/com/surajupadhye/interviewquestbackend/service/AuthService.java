package com.surajupadhye.interviewquestbackend.service;

import com.surajupadhye.interviewquestbackend.dto.JwtResponse;
import com.surajupadhye.interviewquestbackend.dto.LoginRequest;
import com.surajupadhye.interviewquestbackend.dto.RegisterRequest;
import com.surajupadhye.interviewquestbackend.entity.Role;
import com.surajupadhye.interviewquestbackend.entity.User;
import com.surajupadhye.interviewquestbackend.entity.RefreshToken;
import com.surajupadhye.interviewquestbackend.entity.OtpVerification;
import com.surajupadhye.interviewquestbackend.entity.PasswordResetToken;
import com.surajupadhye.interviewquestbackend.repository.UserRepository;
import com.surajupadhye.interviewquestbackend.repository.OtpVerificationRepository;
import com.surajupadhye.interviewquestbackend.repository.PasswordResetTokenRepository;
import com.surajupadhye.interviewquestbackend.security.JwtUtils;
import com.surajupadhye.interviewquestbackend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public void register(RegisterRequest registerRequest) {
        // Verify OTP
        OtpVerification otpVerification = otpVerificationRepository.findById(registerRequest.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Error: No OTP request found for this email."));

        if (!otpVerification.getOtpCode().equals(registerRequest.getOtp())) {
            throw new IllegalArgumentException("Error: Invalid OTP code.");
        }

        if (otpVerification.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpVerificationRepository.delete(otpVerification);
            throw new IllegalArgumentException("Error: OTP code has expired.");
        }

        // Delete the OTP after successful verification
        otpVerificationRepository.delete(otpVerification);

        if (userRepository.existsByUsername(registerRequest.getName())) {
            throw new IllegalArgumentException("Error: Name/Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        // Create new user's account - Force ROLE_USER (only user can sign up)
        User user = User.builder()
                .username(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(encoder.encode(registerRequest.getPassword()))
                .role(Role.ROLE_USER)
                .emailVerified(true)
                .build();

        userRepository.save(user);
    }

    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsernameOrEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        // Create Refresh Token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        return new JwtResponse(
                jwt,
                refreshToken.getToken(),
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                role
        );
    }

    @Transactional
    public JwtResponse loginWithGoogle(String idToken) {
        // Call Google's tokeninfo API to verify the ID token
        String googleTokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
        RestTemplate restTemplate = new RestTemplate();
        
        Map<String, Object> response;
        try {
            response = restTemplate.getForObject(googleTokenInfoUrl, Map.class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error: Invalid Google Token.");
        }

        if (response == null || response.containsKey("error_description")) {
            throw new IllegalArgumentException("Error: Google token verification failed.");
        }

        String email = (String) response.get("email");
        String name = (String) response.get("name");
        String googleId = (String) response.get("sub");

        if (email == null) {
            throw new IllegalArgumentException("Error: Google Token does not contain email.");
        }

        // Find or create user
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Create a unique username from name
            String baseUsername = name != null ? name.replaceAll("\\s+", "").toLowerCase() : "googleuser";
            String username = baseUsername;
            int suffix = 1;
            while (userRepository.existsByUsername(username)) {
                username = baseUsername + suffix;
                suffix++;
            }

            user = User.builder()
                    .username(username)
                    .email(email)
                    .password(encoder.encode(UUID.randomUUID().toString())) // Random password
                    .role(Role.ROLE_USER)
                    .emailVerified(true)
                    .googleId(googleId)
                    .build();
            user = userRepository.save(user);
        } else if (user.getGoogleId() == null) {
            // Link Google ID if user existed but googleId wasn't set
            user.setGoogleId(googleId);
            user.setEmailVerified(true);
            user = userRepository.save(user);
        }

        // Authenticate user in Spring Security
        org.springframework.security.core.userdetails.UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        // Create Refresh Token
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return new JwtResponse(
                jwt,
                refreshToken.getToken(),
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                role
        );
    }

    public void sendOtp(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // Save or update in database
        OtpVerification otpVerification = OtpVerification.builder()
                .email(email)
                .otpCode(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5)) // 5 minutes expiry
                .build();
        
        otpVerificationRepository.save(otpVerification);

        // Send Email
        emailService.sendOtpEmail(email, otp);
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Error: No user found with this email."));

        // Delete existing reset tokens for this user
        passwordResetTokenRepository.deleteByUser(user);

        // Generate secure token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiryTime(LocalDateTime.now().plusMinutes(15)) // 15 minutes expiry
                .build();

        passwordResetTokenRepository.save(resetToken);

        // Send email
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(email, resetLink);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Error: Invalid password reset token."));

        if (resetToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Error: Password reset token has expired.");
        }

        User user = resetToken.getUser();
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);

        // Delete token
        passwordResetTokenRepository.delete(resetToken);
    }
}
