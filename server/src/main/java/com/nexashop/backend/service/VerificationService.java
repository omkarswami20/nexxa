package com.nexashop.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
public class VerificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(VerificationService.class);
    
    private final StringRedisTemplate redisTemplate;

    public VerificationService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String createToken(String context, String identifier, Duration ttl) {
        String token = UUID.randomUUID().toString();
        String key = buildKey(context, token);
        logger.debug("Creating verification token - Context: {}, Key: {}, Identifier: {}", context, key, identifier);
        redisTemplate.opsForValue().set(key, identifier, ttl);
        return token;
    }

    public String consumeToken(String context, String token) {
        return consumeToken(context, token, true);
    }

    public String consumeToken(String context, String token, boolean delete) {
        String key = buildKey(context, token);
        String identifier = redisTemplate.opsForValue().get(key);
        logger.debug("Consuming verification token - Context: {}, Key: {}, Found Identifier: {}, Delete: {}", 
                context, key, identifier, delete);
        if (identifier != null && delete) {
            redisTemplate.delete(key);
        }
        return identifier;
    }

    private String buildKey(String context, String token) {
        return "verify:" + context.toLowerCase() + ":" + token;
    }
}
