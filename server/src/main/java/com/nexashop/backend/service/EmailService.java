package com.nexashop.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexashop.backend.entity.Order;
import com.nexashop.backend.entity.OrderItem;
import com.nexashop.backend.entity.Seller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

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
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            message.setFrom("Nexashop <" + fromEmail + ">");
            mailSender.send(message);
            logger.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            if (e.getMessage() != null &&
                (e.getMessage().contains("AuthenticationFailedException") ||
                 e.getMessage().contains("535"))) {
                logger.warn("Email authentication failed. TIP: Use an App Password for spring.mail.password (not your email login password).");
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

    /**
     * Order confirmation email sent to customer after checkout
     */
    @Async("emailTaskExecutor")
    public void sendOrderConfirmationEmail(String customerEmail, String customerName, Order order, java.util.List<OrderItem> orderItems) {
        if (customerEmail == null || customerName == null || order == null) {
            logger.warn("Cannot send order confirmation email: missing required information");
            return;
        }

        if (orderItems == null || orderItems.isEmpty()) {
            logger.warn("Cannot send order confirmation email: order items list is empty");
            return;
        }

        String subject = "Nexashop | Order Confirmation #" + (order.getId() != null ? order.getId() : "N/A");

        StringBuilder itemsText = new StringBuilder();
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderItem item : orderItems) {
            if (item == null) continue;
            BigDecimal unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
            Integer quantity = item.getQuantity() != null ? item.getQuantity() : 0;
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
            totalAmount = totalAmount.add(itemTotal);
            String productName = item.getProductNameSnapshot() != null ? item.getProductNameSnapshot() : "Unknown Product";
            itemsText.append("• ").append(productName)
                    .append(" × ").append(quantity)
                    .append(" = Rs. ").append(itemTotal).append("\n");
        }

        String addressText = "Address details not available";
        try {
            if (order.getAddressSnapshotJson() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> address = (Map<String, Object>) objectMapper.readValue(order.getAddressSnapshotJson(), Map.class);
                addressText = String.format("%s\n%s%s\n%s, %s %s\n%s",
                    address.getOrDefault("name", ""),
                    address.getOrDefault("line1", ""),
                    address.getOrDefault("line2", "") != null ? ", " + address.get("line2") : "",
                    address.getOrDefault("city", ""),
                    address.getOrDefault("state", ""),
                    address.getOrDefault("zip", ""),
                    address.getOrDefault("country", ""));
            }
        } catch (JsonProcessingException e) {
            logger.warn("Failed to parse address JSON for email: {}", e.getMessage());
        }

        String text = String.format(
            "Hello %s,\n\n" +
            "🎉 Thank you for your order! We're excited to confirm your purchase.\n\n" +
            "📦 Order Details:\n" +
            "Order ID: #%d\n" +
            "Order Date: %s\n" +
            "Status: %s\n\n" +
            "🛍️ Items Ordered:\n%s\n" +
            "💰 Total Amount: Rs. %s\n\n" +
            "📍 Shipping Address:\n%s\n\n" +
            "We'll send you another email once your order ships. Estimated delivery: 3-5 business days.\n\n" +
            "You can track your order status anytime from your account.\n\n" +
            "Thank you for shopping with us!\n\n" +
            "Warm regards,\n" +
            "Nexashop Team\n" +
            "—\n" +
            "Your trusted online shopping destination",
            customerName,
            order.getId() != null ? order.getId() : 0L,
            order.getCreatedAt() != null ? order.getCreatedAt().toString() : "N/A",
            order.getStatus() != null ? order.getStatus().toString() : "PLACED",
            itemsText.length() > 0 ? itemsText.toString() : "No items",
            order.getTotalAmount() != null ? order.getTotalAmount() : totalAmount,
            addressText
        );

        sendSimpleEmail(customerEmail, subject, text);
    }

    /**
     * New order notification email sent to seller when customer places order
     */
    @Async("emailTaskExecutor")
    public void sendNewOrderNotificationToSeller(String sellerEmail, String sellerName, OrderItem orderItem, Order order, Integer remainingStock) {
        if (sellerEmail == null || sellerName == null || orderItem == null || order == null) {
            logger.warn("Cannot send seller order notification: missing required information");
            return;
        }

        String subject = "Nexashop | New Order Received - " + orderItem.getProductNameSnapshot();

        String addressText = "Address details not available";
        try {
            if (order.getAddressSnapshotJson() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> address = (Map<String, Object>) objectMapper.readValue(order.getAddressSnapshotJson(), Map.class);
                addressText = String.format("%s\n%s%s\n%s, %s %s\n%s%s",
                    address.getOrDefault("name", ""),
                    address.getOrDefault("line1", ""),
                    address.getOrDefault("line2", "") != null ? ", " + address.get("line2") : "",
                    address.getOrDefault("city", ""),
                    address.getOrDefault("state", ""),
                    address.getOrDefault("zip", ""),
                    address.getOrDefault("country", ""),
                    address.getOrDefault("phone", "") != null ? "\nPhone: " + address.get("phone") : "");
            }
        } catch (JsonProcessingException e) {
            logger.warn("Failed to parse address JSON for seller email: {}", e.getMessage());
        }

        BigDecimal itemTotal = orderItem.getUnitPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity()));

        String text = String.format(
            "Hello %s,\n\n" +
            "🎉 Great news! You have received a new order.\n\n" +
            "📦 Order Details:\n" +
            "Order ID: #%d\n" +
            "Order Item ID: #%d\n" +
            "Product: %s\n" +
            "Quantity: %d\n" +
            "Unit Price: Rs. %s\n" +
            "Subtotal: Rs. %s\n" +
            "Status: %s\n\n" +
            "📊 Stock Update:\n" +
            "Remaining Stock: %d units\n\n" +
            "👤 Customer Shipping Address:\n%s\n\n" +
            "Please process and ship this order as soon as possible. Update the order status in your Seller Dashboard once shipped.\n\n" +
            "🔗 Seller Dashboard: %s/seller/dashboard\n\n" +
            "Thank you for being part of Nexashop!\n\n" +
            "Best regards,\n" +
            "Nexashop Team\n" +
            "—\n" +
            "Empowering sellers to grow online",
            sellerName,
            order.getId(),
            orderItem.getId(),
            orderItem.getProductNameSnapshot(),
            orderItem.getQuantity(),
            orderItem.getUnitPrice(),
            itemTotal,
            orderItem.getStatus(),
            remainingStock != null ? remainingStock : 0,
            addressText,
            frontendUrl
        );

        sendSimpleEmail(sellerEmail, subject, text);
    }

    /**
     * Shipment notification email sent to customer when order is shipped
     */
    @Async("emailTaskExecutor")
    public void sendOrderShippedEmail(String customerEmail, String customerName, Order order, OrderItem orderItem) {
        if (customerEmail == null || customerName == null || order == null || orderItem == null) {
            logger.warn("Cannot send shipment email: missing required information");
            return;
        }

        String subject = "Nexashop | Your Order #" + order.getId() + " Has Been Shipped! 🚚";

        String text = String.format(
            "Hello %s,\n\n" +
            "🚚 Great news! Your order has been shipped.\n\n" +
            "📦 Order Details:\n" +
            "Order ID: #%d\n" +
            "Product: %s\n" +
            "Quantity: %d\n" +
            "Status: %s\n\n" +
            "Your order is now on its way to you. Estimated delivery: 3-5 business days.\n\n" +
            "You can track your order status from your account dashboard.\n\n" +
            "Thank you for your patience!\n\n" +
            "Warm regards,\n" +
            "Nexashop Team\n" +
            "—\n" +
            "Your trusted online shopping destination",
            customerName,
            order.getId(),
            orderItem.getProductNameSnapshot(),
            orderItem.getQuantity(),
            orderItem.getStatus()
        );

        sendSimpleEmail(customerEmail, subject, text);
    }

    /**
     * Delivery confirmation email sent to customer when order is delivered
     */
    @Async("emailTaskExecutor")
    public void sendOrderDeliveredEmail(String customerEmail, String customerName, Order order, OrderItem orderItem) {
        if (customerEmail == null || customerName == null || order == null || orderItem == null) {
            logger.warn("Cannot send delivery email: missing required information");
            return;
        }

        String subject = "Nexashop | Your Order #" + order.getId() + " Has Been Delivered! ✅";

        String text = String.format(
            "Hello %s,\n\n" +
            "✅ Your order has been successfully delivered!\n\n" +
            "📦 Order Details:\n" +
            "Order ID: #%d\n" +
            "Product: %s\n" +
            "Quantity: %d\n" +
            "Total: Rs. %s\n\n" +
            "We hope you love your purchase! If you have any questions or concerns, please don't hesitate to contact our support team.\n\n" +
            "💬 We'd love to hear your feedback! Please consider leaving a review.\n\n" +
            "Thank you for shopping with Nexashop!\n\n" +
            "Warm regards,\n" +
            "Nexashop Team\n" +
            "—\n" +
            "Your trusted online shopping destination",
            customerName,
            order.getId(),
            orderItem.getProductNameSnapshot(),
            orderItem.getQuantity(),
            order.getTotalAmount()
        );

        sendSimpleEmail(customerEmail, subject, text);
    }

    /**
     * Order status change notification sent to seller
     */
    @Async("emailTaskExecutor")
    public void sendOrderStatusChangeToSeller(String sellerEmail, String sellerName, OrderItem orderItem, OrderItem.Status oldStatus, OrderItem.Status newStatus) {
        if (sellerEmail == null || sellerName == null || orderItem == null) {
            logger.warn("Cannot send status change email: missing required information");
            return;
        }

        String subject = "Nexashop | Order Status Updated - " + orderItem.getProductNameSnapshot();

        String text = String.format(
            "Hello %s,\n\n" +
            "📋 Order status has been updated.\n\n" +
            "Order Item ID: #%d\n" +
            "Product: %s\n" +
            "Previous Status: %s\n" +
            "New Status: %s\n\n" +
            "Please check your Seller Dashboard for more details.\n\n" +
            "Best regards,\n" +
            "Nexashop Team",
            sellerName,
            orderItem.getId(),
            orderItem.getProductNameSnapshot(),
            oldStatus != null ? oldStatus : "UNKNOWN",
            newStatus
        );

        sendSimpleEmail(sellerEmail, subject, text);
    }

}
