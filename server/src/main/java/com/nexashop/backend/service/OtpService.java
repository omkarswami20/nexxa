package com.nexashop.backend.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Random;
import org.springframework.web.client.RestTemplate;

@Service
public class OtpService {

    public enum OtpType { SELLER, USER }

    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;
    private final Random random = new Random();

    public OtpService(StringRedisTemplate redisTemplate, EmailService emailService) {
        this.redisTemplate = redisTemplate;
        this.emailService = emailService;
    }

    private void sendSms(String mobile, String otp) {
        // DEBUG LOGGING
        System.out.println("--------------------------------------------------");
        System.out.println("MOBILE OTP FOR " + mobile + ": " + otp);
        System.out.println("--------------------------------------------------");

        try {
            String url = "https://ciacloud.in/otpapi.php?number=" + mobile + "&otp=" + otp;
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "Basic dGVjaHA6VGVjaFBAIUAj");
            
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            
            new RestTemplate().exchange(url, org.springframework.http.HttpMethod.GET, entity, String.class);
            
            System.out.println("SMS Sent to " + mobile);
        } catch (org.springframework.web.client.HttpClientErrorException.Unauthorized e) {
            System.out.println("SMS Skipped: API Key required (401 Unauthorized). Check OtpService.java or your SMS provider config.");
        } catch (Exception e) {
            System.err.println("Failed to send SMS: " + e.getMessage());
        }
    }

    public void sendOtp(String email, OtpType type) {
        String otp = String.format("%06d", random.nextInt(1_000_000));
        long ttlSeconds = 120; // universal 2 minutes
        String key = buildKey(type, email);
        redisTemplate.opsForValue().set(key, otp, Duration.ofSeconds(ttlSeconds));

        String subject = "Nexashop OTP Verification";
        String body = "Your OTP is: " + otp + "\n" +
                "This code will expire in " + ttlSeconds + " seconds.";
        emailService.sendSimpleEmail(email, subject, body);
    }

    public boolean verifyOtp(String email, String otp, OtpType type) {
        String key = buildKey(type, email);
        String stored = redisTemplate.opsForValue().get(key);
        boolean ok = stored != null && stored.equals(otp);
        if (ok) {
            redisTemplate.delete(key);
        }
        return ok;
    }

    private String buildKey(OtpType type, String email) {
        return "otp:" + type.name().toLowerCase() + ":" + email.toLowerCase();
    }

    // Context-based helpers (email/mobile/forgot-password etc.)
    public void sendOtpWithContext(String identifier, String context, long ttlSeconds) {
        String otp = String.format("%06d", random.nextInt(1_000_000));
        String key = buildContextKey(context, identifier);
        
        System.out.println("=== OTP Service Debug ===");
        System.out.println("Context: " + context);
        System.out.println("Identifier: " + identifier);
        System.out.println("Redis Key: " + key);
        System.out.println("OTP: " + otp);
        System.out.println("TTL: " + ttlSeconds + " seconds");
        
        redisTemplate.opsForValue().set(key, otp, Duration.ofSeconds(ttlSeconds));
        System.out.println("OTP stored in Redis with key: " + key);

        // Dispatch based on context
        if ("SELLER".equals(context) || "user-mobile".equals(context) || "CUSTOMER_MOBILE".equals(context)) {
            System.out.println("Dispatching SMS for mobile: " + identifier);
            sendSms(identifier, otp);
        } else if ("user-email".equals(context) || "CUSTOMER_EMAIL".equals(context) || "forgot-password".equals(context)) {
            System.out.println("Dispatching Email for: " + identifier);
            String subject = "Nexashop OTP";
            String body = "Your OTP is: " + otp;
            emailService.sendSimpleEmail(identifier, subject, body);
        }
        System.out.println("=== End OTP Service Debug ===");
    }

    public boolean verifyOtpWithContext(String identifier, String otp, String context) {
        String key = buildContextKey(context, identifier);
        String stored = redisTemplate.opsForValue().get(key);
        boolean ok = stored != null && stored.equals(otp);
        if (ok) {
            redisTemplate.delete(key);
        }
        return ok;
    }

    private String buildContextKey(String context, String identifier) {
        // Special case for SELLER OTP requirement
        if ("SELLER".equals(context)) {
            return "OTP:SELLER:" + identifier;
        }
        if ("user-mobile".equals(context) || "CUSTOMER_MOBILE".equals(context)) {
            return "OTP:CUSTOMER:MOBILE:" + identifier;
        }
        if ("user-email".equals(context) || "CUSTOMER_EMAIL".equals(context)) {
            return "OTP:CUSTOMER:EMAIL:" + identifier;
        }
        return "otp:" + context.toLowerCase() + ":" + identifier.toLowerCase();
    }
}
