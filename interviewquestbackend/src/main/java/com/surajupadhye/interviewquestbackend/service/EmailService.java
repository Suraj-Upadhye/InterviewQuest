package com.surajupadhye.interviewquestbackend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        logger.info("==================================================");
        logger.info("OTP verification code for {}: {}", toEmail, otp);
        logger.info("==================================================");

        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured. Email not sent.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("InterviewQuest <no-reply@interviewquest.com>");
            message.setTo(toEmail);
            message.setSubject("InterviewQuest - Verify Your Email");
            message.setText("Hello,\n\n" +
                    "Thank you for registering with InterviewQuest!\n" +
                    "Your email verification code is: " + otp + "\n\n" +
                    "This code is valid for 5 minutes. Please do not share this code with anyone.\n\n" +
                    "Best regards,\n" +
                    "The InterviewQuest Team");

            mailSender.send(message);
            logger.info("OTP email sent successfully to {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again later. (Development OTP: " + otp + ")");
        }
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        logger.info("==================================================");
        logger.info("Password Reset Link for {}: {}", toEmail, resetLink);
        logger.info("==================================================");

        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured. Email not sent.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("InterviewQuest <no-reply@interviewquest.com>");
            message.setTo(toEmail);
            message.setSubject("InterviewQuest - Reset Your Password");
            message.setText("Hello,\n\n" +
                    "We received a request to reset your password for your InterviewQuest account.\n" +
                    "Please click the link below to reset your password:\n" +
                    resetLink + "\n\n" +
                    "This link is valid for 15 minutes. If you did not request a password reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "The InterviewQuest Team");

            mailSender.send(message);
            logger.info("Password reset email sent successfully to {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send password reset email. Please try again later.");
        }
    }
}
