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
            if (e.getMessage() != null &&
                (e.getMessage().contains("AuthenticationFailedException") ||
                 e.getMessage().contains("535"))) {

                System.err.println(
                    "TIP: Use an App Password for spring.mail.password (not your email login password)."
                );
            }
        }
    }

    /**
     * Email sent after seller registration
     */
    public void sendVerificationEmail(Seller seller) {
        String subject = "Nexashop | Seller Application Received";

        String text =
                "Hello " + seller.getName() + ",\n\n" +

                "Thank you for registering as a Seller on Nexashop.\n\n" +

                "✅ We have successfully received your application.\n" +
                "🔍 Our team will now review your details for verification.\n\n" +

                "You will be notified once the review process is complete.\n\n" +

                "If you have any questions, feel free to reach out to our support team.\n\n" +

                "Warm regards,\n" +
                "Nexashop Team\n" +
                "—\n" +
                "Building trusted online commerce";

        sendSimpleEmail(seller.getEmail(), subject, text);
    }

    /**
     * Email sent when seller status is updated (APPROVED / DENIED)
     */
    public void sendStatusNotification(Seller seller, String rejectionReason) {
        String subject = "Nexashop | Seller Application Status Update";
        String text;

        if (seller.getStatus() == Seller.SellerStatus.ACTIVE) {
            String loginLink = frontendUrl + "/seller/login";

            text =
                    "Hello " + seller.getName() + ",\n\n" +

                    "🎉 Congratulations! Your Seller account has been APPROVED.\n\n" +

                    "You can now log in to your Seller Dashboard and start listing your products.\n\n" +

                    "🔗 Seller Login:\n" +
                    loginLink + "\n\n" +

                    "We're excited to have you onboard and look forward to your success on Nexashop.\n\n" +

                    "Best wishes,\n" +
                    "Nexashop Team\n" +
                    "—\n" +
                    "Empowering sellers to grow online";

        } else if (seller.getStatus() == Seller.SellerStatus.DENIED) {

            text =
                    "Hello " + seller.getName() + ",\n\n" +

                    "Thank you for your interest in becoming a Seller on Nexashop.\n\n" +

                    "After careful review, we regret to inform you that your application has been declined at this time.\n";

            if (rejectionReason != null && !rejectionReason.trim().isEmpty()) {
                text += "\n📌 Reason:\n" + rejectionReason + "\n";
            }

            text +=
                    "\nYou may reapply in the future once the concerns are addressed.\n\n" +

                    "Thank you for your understanding.\n\n" +

                    "Sincerely,\n" +
                    "Nexashop Team";
        } else {
            return; // No email for other statuses
        }

        sendSimpleEmail(seller.getEmail(), subject, text);
    }
  public void sendCustomerWelcomeEmail(String to, String name) {
    String subject = "Welcome to Nexashop | Account Verified 🎉";

    String text =
            "Hello " + name + ",\n\n" +

            "Welcome to Nexashop! We’re happy to let you know that your account has been successfully verified. ✅\n\n" +

            "You can now explore a wide range of products, enjoy a smooth shopping experience, and place orders with confidence.\n\n" +

            "🛍️ Start shopping anytime and discover great deals curated just for you.\n\n" +

            "If you need any assistance, our support team is always here to help.\n\n" +

            "Happy shopping!\n\n" +

            "Warm regards,\n" +
            "Nexashop Team\n" +
            "—\n" +
            "Your trusted online shopping destination";

    sendSimpleEmail(to, subject, text);
}

}
