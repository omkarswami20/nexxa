package com.nexashop.backend.controller;

import com.nexashop.backend.dto.TokenRefreshRequest;
import com.nexashop.backend.entity.RefreshToken;
import com.nexashop.backend.exception.InvalidRefreshTokenException;
import com.nexashop.backend.repository.SellerRepository;
import com.nexashop.backend.security.JwtUtils;
import com.nexashop.backend.service.RefreshTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private SellerRepository sellerRepository;

    @InjectMocks
    private AuthController authController;

    private RefreshToken refreshToken;
    private TokenRefreshRequest request;

    @BeforeEach
    void setUp() {
        refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-token-123");
        refreshToken.setEmail("test@example.com");
        refreshToken.setExpiryDate(Instant.now().plusSeconds(3600));

        request = new TokenRefreshRequest();
        request.setRefreshToken("refresh-token-123");
    }

    @Test
    void testRefreshToken_Success() {
        when(refreshTokenService.findByToken(anyString())).thenReturn(Optional.of(refreshToken));
        when(refreshTokenService.verifyExpiration(refreshToken)).thenReturn(refreshToken);
        when(sellerRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(jwtUtils.generateToken(anyString(), anyString())).thenReturn("new-access-token");

        ResponseEntity<?> response = authController.refreshtoken(request);

        assertNotNull(response);
        assertTrue(response.getStatusCode().is2xxSuccessful());
        verify(jwtUtils, times(1)).generateToken(eq("test@example.com"), eq("ROLE_ADMIN"));
    }

    @Test
    void testRefreshToken_InvalidToken() {
        when(refreshTokenService.findByToken(anyString())).thenReturn(Optional.empty());

        assertThrows(InvalidRefreshTokenException.class, () -> {
            authController.refreshtoken(request);
        });
    }

    @Test
    void testLogout_Success() {
        ResponseEntity<?> response = authController.logoutUser();

        assertNotNull(response);
        assertTrue(response.getStatusCode().is2xxSuccessful());
    }
}

