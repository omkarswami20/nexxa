package com.nexashop.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Random;
import org.springframework.web.client.RestTemplate;

@Service
public class OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);

    public enum OtpType { SELLER, USER }

    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;
    private final Random random = new Random();
    
    @Value("${app.sms.api.key:}")
    private String smsApiKey;
    
    @Value("${app.sms.api.url:https://ciacloud.in/otpapi.php}")
    private String smsApiUrl;

    public OtpService(StringRedisTemplate redisTemplate, EmailService emailService) {
        this.redisTemplate = redisTemplate;
        this.emailService = emailService;
    }

    private void sendSms(String mobile, String otp) {
        if (smsApiKey == null || smsApiKey.trim().isEmpty()) {
            // Log warning but don't fail - SMS is optional in development
            return;
        }

        try {
            String url = smsApiUrl + "?number=" + mobile + "&otp=" + otp;
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "Basic " + smsApiKey);
            
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            
            new RestTemplate().exchange(url, org.springframework.http.HttpMethod.GET, entity, String.class);
        } catch (org.springframework.web.client.HttpClientErrorException.Unauthorized e) {
            // SMS API key invalid - log but don't fail
        } catch (Exception e) {
            // Failed to send SMS - log but don't fail
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
        
        logger.debug("Sending OTP - Context: {}, Identifier: {}, Redis Key: {}, TTL: {} seconds", 
                context, identifier, key, ttlSeconds);
        
        redisTemplate.opsForValue().set(key, otp, Duration.ofSeconds(ttlSeconds));
        logger.debug("OTP stored in Redis with key: {}", key);

        // Dispatch based on context
        if ("SELLER".equals(context) || "user-mobile".equals(context) || "CUSTOMER_MOBILE".equals(context)) {
            logger.debug("Dispatching SMS for mobile: {}", identifier);
            sendSms(identifier, otp);
        } else if ("user-email".equals(context) || "CUSTOMER_EMAIL".equals(context) || "forgot-password".equals(context)) {
            logger.debug("Dispatching Email for: {}", identifier);
            String subject = "Nexashop OTP";
            String body = "Your OTP is: " + otp;
            emailService.sendSimpleEmail(identifier, subject, body);
        }
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
