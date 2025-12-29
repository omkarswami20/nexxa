package com.nexashop.backend.service;

import com.nexashop.backend.entity.Seller;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            message.setFrom("Nexashop <" + fromEmail + ">");
            mailSender.send(message);
            System.out.println("Email sent to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    public void sendVerificationEmail(Seller seller) {
        String subject = "Welcome to Nexashop - Application Received";
        String text = "Dear " + seller.getName() + ",\n\n" +
                "Thank you for registering with Nexashop. Your application has been received and is currently Pending Approval.\n"
                +
                "We will notify you once an Admin reviews your details.\n\n" +
                "Best Regards,\n" +
                "Nexashop Team";
        sendSimpleEmail(seller.getEmail(), subject, text);
    }

    public void sendStatusNotification(Seller seller, String rejectionReason) {
        String subject = "Nexashop - Application Status Update";
        String text;

        if (seller.getStatus() == Seller.SellerStatus.APPROVED) {
            String loginLink = frontendUrl + "/seller/login";
            text = "Dear " + seller.getName() + ",\n\n" +
                    "Congratulations! Your account has been APPROVED.\n" +
                    "You can now login to your dashboard and start selling.\n\n" +
                    "Click here to login: " + loginLink + "\n\n" +
                    "Best Regards,\n" +
                    "Nexashop Team";
        } else if (seller.getStatus() == Seller.SellerStatus.DENIED) {
            text = "Dear " + seller.getName() + ",\n\n" +
                    "We are sorry, but your application was DENIED.\n";
            if (rejectionReason != null && !rejectionReason.trim().isEmpty()) {
                text += "Reason: " + rejectionReason + "\n";
            }
            text += "\nBest Regards,\nNexashop Team";
        } else {
            return; // No email for other status changes
        }

        sendSimpleEmail(seller.getEmail(), subject, text);
    }
}
