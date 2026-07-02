package com.surajupadhye.interviewquestbackend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Async
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${spring.mail.from:onboarding@resend.dev}")
    private String fromEmail;

    @Value("${interviewquest.mail.failOnError:true}")
    private boolean failOnError;

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
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Verify Your Email - InterviewQuest");
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
            if (failOnError) {
                throw new RuntimeException("Failed to send verification email. Please try again later.");
            }
            logger.warn("Continuing execution because failOnError is false. You can find the OTP/link in the console logs above.");
        }
    }

    public void sendPasswordChangeOtpEmail(String toEmail, String otp) {
        logger.info("==================================================");
        logger.info("Password Change OTP verification code for {}: {}", toEmail, otp);
        logger.info("==================================================");

        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured. Email not sent.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Verify Your Password Change - InterviewQuest");
            message.setText("Hello,\n\n" +
                    "We received a request to change your password for your InterviewQuest account.\n" +
                    "Your verification code is: " + otp + "\n\n" +
                    "This code is valid for 5 minutes. Please do not share this code with anyone.\n\n" +
                    "Best regards,\n" +
                    "The InterviewQuest Team");

            mailSender.send(message);
            logger.info("Password change OTP email sent successfully to {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send password change OTP email to {}: {}", toEmail, e.getMessage());
            if (failOnError) {
                throw new RuntimeException("Failed to send verification email. Please try again later.");
            }
            logger.warn("Continuing execution because failOnError is false. You can find the OTP/link in the console logs above.");
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
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Reset Your Password - InterviewQuest");
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
            if (failOnError) {
                throw new RuntimeException("Failed to send password reset email. Please try again later.");
            }
            logger.warn("Continuing execution because failOnError is false. You can find the OTP/link in the console logs above.");
        }
    }
}
