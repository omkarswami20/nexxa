package com.nexashop.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private JwtUtils jwtUtils;
    private String testSecret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "secret", testSecret);
        ReflectionTestUtils.setField(jwtUtils, "expirationTime", 86400000L); // 24 hours
        ReflectionTestUtils.invokeMethod(jwtUtils, "init");
    }

    @Test
    void testGenerateToken_Success() {
        String email = "test@example.com";
        String role = "ROLE_CUSTOMER";

        String token = jwtUtils.generateToken(email, role);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void testGetEmailFromToken_Success() {
        String email = "test@example.com";
        String role = "ROLE_CUSTOMER";
        String token = jwtUtils.generateToken(email, role);

        String extractedEmail = jwtUtils.getEmailFromToken(token);

        assertEquals(email, extractedEmail);
    }

    @Test
    void testExtractRole_Success() {
        String email = "test@example.com";
        String role = "ROLE_SELLER";
        String token = jwtUtils.generateToken(email, role);

        String extractedRole = jwtUtils.extractRole(token);

        assertEquals(role, extractedRole);
    }

    @Test
    void testValidateToken_ValidToken() {
        String email = "test@example.com";
        String role = "ROLE_CUSTOMER";
        String token = jwtUtils.generateToken(email, role);

        boolean isValid = jwtUtils.validateToken(token);

        assertTrue(isValid);
    }

    @Test
    void testValidateToken_InvalidToken() {
        String invalidToken = "invalid.token.here";

        boolean isValid = jwtUtils.validateToken(invalidToken);

        assertFalse(isValid);
    }

    @Test
    void testValidateToken_EmptyToken() {
        boolean isValid = jwtUtils.validateToken("");

        assertFalse(isValid);
    }
}

