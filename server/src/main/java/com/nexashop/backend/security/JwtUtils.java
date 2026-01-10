package com.nexashop.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${app.jwt.secret:}")
    private String secretFromProperty;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long expirationTime;

    private Key key;

    @PostConstruct
    public void init() {
        // Check environment variable first, then property
        String secret = System.getenv("JWT_SECRET");
        if (secret == null || secret.trim().isEmpty()) {
            secret = secretFromProperty;
        }
        
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException(
                "JWT secret must be configured via JWT_SECRET environment variable or app.jwt.secret property. " +
                "For production, use a strong secret (minimum 32 characters)."
            );
        }
        if (secret.length() < 32) {
            throw new IllegalStateException(
                "JWT secret is too short. For security, use a secret with at least 32 characters. " +
                "Set JWT_SECRET environment variable or app.jwt.secret property with a strong secret."
            );
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Log the exception if needed
            return false;
        }
    }

    public String extractRole(String token) {
        return (String) Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().get("role");
    }
}
