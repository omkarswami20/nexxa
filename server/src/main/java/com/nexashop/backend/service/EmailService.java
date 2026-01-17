package com.nexashop.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexashop.backend.entity.Order;
import com.nexashop.backend.entity.OrderItem;
import com.nexashop.backend.entity.Seller;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async("emailTaskExecutor")
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("Nexashop <" + fromEmail + ">");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true indicates HTML

            mailSender.send(message);
            logger.info("HTML Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send HTML email to {}: {}", to, e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error sending email to {}: {}", to, e.getMessage(), e);
            if (e.getMessage() != null &&
                (e.getMessage().contains("AuthenticationFailedException") ||
                 e.getMessage().contains("535"))) {
                logger.warn("Email authentication failed. TIP: Use an App Password for spring.mail.password.");
            }
        }
    }

    private String getHtmlTemplate(String title, String content) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }" +
                ".container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; }" +
                ".header { background-color: #2c3e50; color: #ffffff; padding: 25px; text-align: center; }" +
                ".header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px; }" +
                ".content { padding: 35px 30px; color: #333333; line-height: 1.6; font-size: 16px; }" +
                ".footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 13px; color: #888888; border-top: 1px solid #eeeeee; }" +
                ".btn { display: inline-block; padding: 12px 24px; background-color: #3498db; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; transition: background-color 0.3s; }" +
                ".btn:hover { background-color: #2980b9; }" +
                ".info-box { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px; margin-top: 20px; }" +
                ".info-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }" +
                ".info-row:last-child { border-bottom: none; }" +
                ".label { font-weight: 600; color: #555; }" +
                ".value { color: #333; }" +
                "ul { padding-left: 20px; margin-top: 10px; }" +
                "li { margin-bottom: 5px; }" +
                "table { wudth: 100%; border-collapse: collapse; margin-top: 15px; width: 100%; }" +
                "th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }" +
                "th { background-color: #f2f2f2; font-weight: 600; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class=\"container\">" +
                "<div class=\"header\">" +
                "<h1>" + title + "</h1>" +
                "</div>" +
                "<div class=\"content\">" +
                content +
                "</div>" +
                "<div class=\"footer\">" +
                "<p>&copy; 2024 Nexashop. All rights reserved.</p>" +
                "<p>This is an automated message, please do not reply.</p>" +
                "<p><a href=\"" + frontendUrl + "\" style=\"color: #3498db; text-decoration: none;\">Visit our website</a></p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    /**
     * Email sent after seller registration
     */
    public void sendVerificationEmail(Seller seller) {
        String subject = "Nexashop | Seller Application Received";
        String content = "<p>Hello <strong>" + seller.getName() + "</strong>,</p>" +
                "<p>Thank you for registering as a Seller on Nexashop. We have successfully received your application.</p>" +
                "<div class=\"info-box\">" +
                "<p><strong>🔍 What Happens Next?</strong></p>" +
                "<p>Our team will review your details for verification. You will be notified once the review process is complete.</p>" +
                "</div>" +
                "<p>If you have any questions, feel free to reach out to our support team.</p>" +
                "<p>Warm regards,<br>Nexashop Team</p>";

        sendHtmlEmail(seller.getEmail(), subject, getHtmlTemplate("Application Received", content));
    }

    /**
     * Email sent when seller status is updated (APPROVED / DENIED)
     */
    public void sendStatusNotification(Seller seller, String rejectionReason) {
        String subject = "Nexashop | Seller Application Status Update";
        String content;
        String title;

        if (seller.getStatus() == Seller.SellerStatus.ACTIVE) {
            title = "Welcome Aboard!";
            String loginLink = frontendUrl + "/seller/login";
            content = "<p>Hello <strong>" + seller.getName() + "</strong>,</p>" +
                    "<p>🎉 <strong>Congratulations!</strong> Your Seller account has been <strong>APPROVED</strong>.</p>" +
                    "<p>You can now log in to your Seller Dashboard and start listing your products.</p>" +
                    "<div style=\"text-align: center;\">" +
                    "<a href=\"" + loginLink + "\" class=\"btn\">Login to Seller Dashboard</a>" +
                    "</div>" +
                    "<p style=\"margin-top: 30px;\">We're excited to have you onboard and look forward to your success on Nexashop.</p>";

        } else if (seller.getStatus() == Seller.SellerStatus.DENIED) {
            title = "Application Update";
            content = "<p>Hello <strong>" + seller.getName() + "</strong>,</p>" +
                    "<p>Thank you for your interest in becoming a Seller on Nexashop.</p>" +
                    "<p>After careful review, we regret to inform you that your application has been declined at this time.</p>";

            if (rejectionReason != null && !rejectionReason.trim().isEmpty()) {
                content += "<div class=\"info-box\"><p><strong style=\"color: #e74c3c;\">📌 Reason for Rejection:</strong></p><p>" + rejectionReason + "</p></div>";
            }

            content += "<p>You may reapply in the future once the concerns are addressed.</p>" +
                    "<p>Thank you for your understanding.</p>";
        } else {
            return; 
        }

        sendHtmlEmail(seller.getEmail(), subject, getHtmlTemplate(title, content));
    }

    public void sendCustomerWelcomeEmail(String to, String name) {
        String subject = "Welcome to Nexashop | Account Verified 🎉";
        String title = "Welcome to Nexashop!";
        String content = "<p>Hello <strong>" + name + "</strong>,</p>" +
                "<p>Welcome to Nexashop! We’re happy to let you know that your account has been successfully verified. ✅</p>" +
                "<p>You can now explore a wide range of products, enjoy a smooth shopping experience, and place orders with confidence.</p>" +
                "<div style=\"text-align: center;\">" +
                "<a href=\"" + frontendUrl + "\" class=\"btn\">Start Shopping</a>" +
                "</div>" +
                "<p style=\"margin-top: 20px;\">If you need any assistance, our support team is always here to help.</p>" +
                "<p>Happy shopping!</p>";

        sendHtmlEmail(to, subject, getHtmlTemplate(title, content));
    }

    /**
     * Order confirmation email sent to customer after checkout
     */
    @Async("emailTaskExecutor")
    public void sendOrderConfirmationEmail(String customerEmail, String customerName, Order order, java.util.List<OrderItem> orderItems) {
        if (customerEmail == null || customerName == null || order == null || orderItems == null || orderItems.isEmpty()) {
            logger.warn("Cannot send order confirmation email: missing information");
            return;
        }

        String subject = "Order Confirmation #" + (order.getId() != null ? order.getId() : "N/A");
        
        StringBuilder itemsHtml = new StringBuilder();
        itemsHtml.append("<table><thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead><tbody>");
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderItem item : orderItems) {
            if (item == null) continue;
            BigDecimal unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
            Integer quantity = item.getQuantity() != null ? item.getQuantity() : 0;
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
            totalAmount = totalAmount.add(itemTotal);
            String productName = item.getProductNameSnapshot() != null ? item.getProductNameSnapshot() : "Unknown Product";
            
            itemsHtml.append("<tr>")
                    .append("<td>").append(productName).append("</td>")
                    .append("<td>").append(quantity).append("</td>")
                    .append("<td>Rs. ").append(itemTotal).append("</td>")
                    .append("</tr>");
        }
        itemsHtml.append("</tbody></table>");

        String addressText = getAddressHtml(order.getAddressSnapshotJson());

        String content = "<p>Hello <strong>" + customerName + "</strong>,</p>" +
                "<p>🎉 Thank you for your order! We're excited to confirm your purchase.</p>" +
                "<div class=\"info-box\">" +
                "<div class=\"info-row\"><span class=\"label\">Order ID:</span> <span class=\"value\">#" + (order.getId() != null ? order.getId() : 0L) + "</span></div>" +
                "<div class=\"info-row\"><span class=\"label\">Date:</span> <span class=\"value\">" + (order.getCreatedAt() != null ? order.getCreatedAt().toString() : "N/A") + "</span></div>" +
                "<div class=\"info-row\"><span class=\"label\">Status:</span> <span class=\"value\">" + (order.getStatus() != null ? order.getStatus().toString() : "PLACED") + "</span></div>" +
                "<div class=\"info-row\"><span class=\"label\">Total:</span> <span class=\"value\">Rs. " + (order.getTotalAmount() != null ? order.getTotalAmount() : totalAmount) + "</span></div>" +
                "</div>" +
                "<p><strong>📦 Items Ordered:</strong></p>" +
                itemsHtml.toString() +
                "<div style=\"margin-top: 20px;\"><strong>📍 Shipping Address:</strong><br>" + addressText + "</div>" +
                "<p>We'll send you another email once your order ships.</p>";

        sendHtmlEmail(customerEmail, subject, getHtmlTemplate("Order Confirmed", content));
    }

    /**
     * New order notification email sent to seller
     */
    @Async("emailTaskExecutor")
    public void sendNewOrderNotificationToSeller(String sellerEmail, String sellerName, OrderItem orderItem, Order order, Integer remainingStock) {
        if (sellerEmail == null || sellerName == null || orderItem == null || order == null) {
            return;
        }

        String subject = "New Order Received - " + orderItem.getProductNameSnapshot();
        String addressText = getAddressHtml(order.getAddressSnapshotJson());
        BigDecimal itemTotal = orderItem.getUnitPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity()));

        String content = "<p>Hello <strong>" + sellerName + "</strong>,</p>" +
                "<p>🎉 <strong>Great news!</strong> You have received a new order.</p>" +
                "<div class=\"info-box\">" +
                "<div class=\"info-row\"><span class=\"label\">Order ID:</span> <span class=\"value\">#" + order.getId() + "</span></div>" +
                "<div class=\"info-row\"><span class=\"label\">Item ID:</span> <span class=\"value\">#" + orderItem.getId() + "</span></div>" +
                "<div class=\"info-row\"><span class=\"label\">Product:</span> <span class=\"value\"><strong>" + orderItem.getProductNameSnapshot() + "</strong></span></div>" +
                "<div class=\"info-row\"><span class=\"label\">Quantity:</span> <span class=\"value\">" + orderItem.getQuantity() + "</span></div>" +
                "<div class=\"info-row\"><span class=\"label\">Earnings:</span> <span class=\"value\">Rs. " + itemTotal + "</span></div>" +
                "<div class=\"info-row\"><span class=\"label\">Stock Left:</span> <span class=\"value\">" + (remainingStock != null ? remainingStock : 0) + "</span></div>" +
                "</div>" +
                "<div style=\"margin-top: 20px;\"><strong>👤 Shipping To:</strong><br>" + addressText + "</div>" +
                "<div style=\"text-align: center;\">" +
                "<a href=\"" + frontendUrl + "/seller/dashboard\" class=\"btn\">Process Order</a>" +
                "</div>";

        sendHtmlEmail(sellerEmail, subject, getHtmlTemplate("New Order 📦", content));
    }

    /**
     * Shipment notification
     */
    @Async("emailTaskExecutor")
    public void sendOrderShippedEmail(String customerEmail, String customerName, Order order, OrderItem orderItem) {
        if (customerEmail == null || customerName == null || order == null || orderItem == null) return;

        String subject = "Your Order #" + order.getId() + " Has Been Shipped! 🚚";
        String content = "<p>Hello <strong>" + customerName + "</strong>,</p>" +
                "<p>🚚 <strong>Great news!</strong> Your order has been shipped.</p>" +
                "<div class=\"info-box\">" +
                "<p><strong>Product:</strong> " + orderItem.getProductNameSnapshot() + "</p>" +
                "<p><strong>Quantity:</strong> " + orderItem.getQuantity() + "</p>" +
                "</div>" +
                "<p>Your order is now on its way to you. Estimated delivery: 3-5 business days.</p>";

        sendHtmlEmail(customerEmail, subject, getHtmlTemplate("Order Shipped 🚚", content));
    }

    /**
     * Delivery confirmation
     */
    @Async("emailTaskExecutor")
    public void sendOrderDeliveredEmail(String customerEmail, String customerName, Order order, OrderItem orderItem) {
        if (customerEmail == null || customerName == null || order == null || orderItem == null) return;

        String subject = "Your Order #" + order.getId() + " Has Been Delivered! ✅";
        String content = "<p>Hello <strong>" + customerName + "</strong>,</p>" +
                "<p>✅ Your order has been successfully delivered!</p>" +
                "<div class=\"info-box\">" +
                "<p><strong>Product:</strong> " + orderItem.getProductNameSnapshot() + "</p>" +
                "<p><strong>Quantity:</strong> " + orderItem.getQuantity() + "</p>" +
                "</div>" +
                "<p>We hope you love your purchase! If you have any questions, please contact our support team.</p>";

        sendHtmlEmail(customerEmail, subject, getHtmlTemplate("Order Delivered ✅", content));
    }

    /**
     * Order status change notification
     */
    @Async("emailTaskExecutor")
    public void sendOrderStatusChangeToSeller(String sellerEmail, String sellerName, OrderItem orderItem, OrderItem.Status oldStatus, OrderItem.Status newStatus) {
        if (sellerEmail == null || sellerName == null || orderItem == null) return;

        String subject = "Order Status Updated - " + orderItem.getProductNameSnapshot();
        String content = "<p>Hello <strong>" + sellerName + "</strong>,</p>" +
                "<p>📋 Order status has been updated.</p>" +
                "<div class=\"info-box\">" +
                "<p><strong>Product:</strong> " + orderItem.getProductNameSnapshot() + "</p>" +
                "<p><strong>Previous Status:</strong> " + (oldStatus != null ? oldStatus : "UNKNOWN") + "</p>" +
                "<p><strong>New Status:</strong> <span style=\"color: #2980b9; font-weight: bold;\">" + newStatus + "</span></p>" +
                "</div>" +
                "<p>Please check your Seller Dashboard for more details.</p>";

        sendHtmlEmail(sellerEmail, subject, getHtmlTemplate("Status Update", content));
    }

    private String getAddressHtml(String addressJson) {
        if (addressJson == null) return "Address details not available";
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> address = (Map<String, Object>) objectMapper.readValue(addressJson, Map.class);
            return String.format("%s<br>%s%s<br>%s, %s %s<br>%s%s",
                    address.getOrDefault("name", ""),
                    address.getOrDefault("line1", ""),
                    address.getOrDefault("line2", "") != null ? ", " + address.get("line2") : "",
                    address.getOrDefault("city", ""),
                    address.getOrDefault("state", ""),
                    address.getOrDefault("zip", ""),
                    address.getOrDefault("country", ""),
                    address.getOrDefault("phone", "") != null ? "<br>Phone: " + address.get("phone") : "");
        } catch (JsonProcessingException e) {
            logger.warn("Failed to parse address JSON for email: {}", e.getMessage());
            return "Address details not available";
        }
    }

    public void sendSellerEmailVerification(String to, String name, String link) {
        String subject = "Verify your email - Nexashop";
        String content = "<p>Hello <strong>" + name + "</strong>,</p>" +
                "<p>Please verify your email address to complete your Seller registration.</p>" +
                "<div style=\"text-align: center;\">" +
                "<a href=\"" + link + "\" class=\"btn\">Verify Email</a>" +
                "</div>" +
                "<p style=\"margin-top: 20px;\">This link is valid for 24 hours.</p>" +
                "<p>If you did not create an account, please ignore this email.</p>";
        sendHtmlEmail(to, subject, getHtmlTemplate("Verify Email", content));
    }

    public void sendOtpEmail(String to, String otp) {
        String subject = "Nexashop OTP Verification";
        String content = "<p>Hello,</p>" +
                "<p>Your One-Time Password (OTP) for Nexashop is:</p>" +
                "<h2 style=\"background: #eee; padding: 10px; text-align: center; letter-spacing: 5px; font-weight: bold; border-radius: 4px; display: inline-block;\">" + otp + "</h2>" +
                "<p>This code is valid for 2 minutes. Do not share it with anyone.</p>";
        sendHtmlEmail(to, subject, getHtmlTemplate("One-Time Password", content));
    }

}
