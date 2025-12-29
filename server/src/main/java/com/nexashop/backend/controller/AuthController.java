package com.nexashop.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final com.nexashop.backend.service.RefreshTokenService refreshTokenService;
    private final com.nexashop.backend.security.JwtUtils jwtUtils;
    private final com.nexashop.backend.repository.SellerRepository sellerRepository;

    public AuthController(com.nexashop.backend.service.RefreshTokenService refreshTokenService,
            com.nexashop.backend.security.JwtUtils jwtUtils,
            com.nexashop.backend.repository.SellerRepository sellerRepository) {
        this.refreshTokenService = refreshTokenService;
        this.jwtUtils = jwtUtils;
        this.sellerRepository = sellerRepository;
    }

    @Operation(summary = "Refresh Access Token")
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshtoken(
            @org.springframework.web.bind.annotation.RequestBody com.nexashop.backend.dto.TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken).map(refreshTokenService::verifyExpiration)
                .map(com.nexashop.backend.entity.RefreshToken::getEmail).map(email -> {
                    String role = "ROLE_ADMIN";
                    if (sellerRepository.findByEmail(email).isPresent()) {
                        role = "ROLE_SELLER";
                    }
                    String token = jwtUtils.generateToken(email, role);
                    return ResponseEntity
                            .ok(new com.nexashop.backend.dto.TokenRefreshResponse(token, requestRefreshToken));
                }).orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @Operation(summary = "Logout user", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        // Since we are using stateless JWT, the server doesn't need to do much.
        // In a more complex implementation, we might blacklist the token here.
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }
}
