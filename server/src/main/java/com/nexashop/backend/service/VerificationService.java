package com.nexashop.backend.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
public class VerificationService {
    private final StringRedisTemplate redisTemplate;

    public VerificationService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String createToken(String context, String identifier, Duration ttl) {
        String token = UUID.randomUUID().toString();
        String key = buildKey(context, token);
        System.out.println("VerificationService: Creating token. Key: " + key + ", Identifier: " + identifier);
        redisTemplate.opsForValue().set(key, identifier, ttl);
        return token;
    }

    public String consumeToken(String context, String token) {
        return consumeToken(context, token, true);
    }

    public String consumeToken(String context, String token, boolean delete) {
        String key = buildKey(context, token);
        String identifier = redisTemplate.opsForValue().get(key);
        System.out.println("VerificationService: Consuming token. Key: " + key + ", Found Identifier: " + identifier + ", Delete: " + delete);
        if (identifier != null && delete) {
            redisTemplate.delete(key);
        }
        return identifier;
    }

    private String buildKey(String context, String token) {
        return "verify:" + context.toLowerCase() + ":" + token;
    }
}
