package com.nexashop.backend.controller;

import com.nexashop.backend.exception.InvalidRefreshTokenException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import com.nexashop.backend.service.AdminAuthService;
import com.nexashop.backend.dto.AdminLoginRequest;

@RestController
@RequestMapping({ "/api/v1/auth", "/api/auth" })
public class AuthController {
    private final com.nexashop.backend.service.RefreshTokenService refreshTokenService;
    private final com.nexashop.backend.security.JwtUtils jwtUtils;
    private final com.nexashop.backend.repository.SellerRepository sellerRepository;
    private final com.nexashop.backend.service.SellerService sellerService;
    private final com.nexashop.backend.service.CustomerService customerService;
    private final AdminAuthService adminAuthService;

    public AuthController(com.nexashop.backend.service.RefreshTokenService refreshTokenService,
            com.nexashop.backend.security.JwtUtils jwtUtils,
            com.nexashop.backend.repository.SellerRepository sellerRepository,
            com.nexashop.backend.service.SellerService sellerService,
            com.nexashop.backend.service.CustomerService customerService,
            AdminAuthService adminAuthService) {
        this.refreshTokenService = refreshTokenService;
        this.jwtUtils = jwtUtils;
        this.sellerRepository = sellerRepository;
        this.sellerService = sellerService;
        this.customerService = customerService;
        this.adminAuthService = adminAuthService;
    }

    @Operation(summary = "Register a new Seller", description = "Creates a new seller account with PENDING_APPROVAL status and sends a verification email.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Registration successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Email already exists")
    })
    @PostMapping("/register/seller")
    public ResponseEntity<com.nexashop.backend.entity.Seller> registerSeller(
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.nexashop.backend.dto.SellerRegisterRequest request) {
        return ResponseEntity.ok(sellerService.registerSeller(request));
    }

    @Operation(summary = "Login Seller", description = "Authenticates a seller and returns a JWT token.")
    @PostMapping("/login/seller")
    public ResponseEntity<com.nexashop.backend.dto.LoginResponse> loginSeller(
            @org.springframework.web.bind.annotation.RequestBody com.nexashop.backend.dto.SellerLoginRequest request) {
        return ResponseEntity.ok(sellerService.loginSeller(request));
    }

    @Operation(summary = "Register a customer and send OTPs")
    @PostMapping("/register/customer")
    public ResponseEntity<?> registerCustomer(
            @org.springframework.web.bind.annotation.RequestBody com.nexashop.backend.dto.CustomerRegisterRequest req) {
        var saved = customerService.register(req);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "email", saved.getEmail()));
    }

    @Operation(summary = "Login customer")
    @PostMapping("/login/customer")
    public ResponseEntity<com.nexashop.backend.dto.LoginResponse> loginCustomer(
            @org.springframework.web.bind.annotation.RequestBody com.nexashop.backend.dto.CustomerLoginRequest req) {
        return ResponseEntity.ok(customerService.login(req));
    }

    @Operation(summary = "Login admin")
    @PostMapping("/login/admin")
    public ResponseEntity<com.nexashop.backend.dto.LoginResponse> loginAdmin(@org.springframework.web.bind.annotation.RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(adminAuthService.login(request));
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
                })
                .orElseThrow(() -> new InvalidRefreshTokenException("Refresh token is not in database or has expired"));
    }

    @Operation(summary = "Logout user", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        // Since we are using stateless JWT, the server doesn't need to do much.
        // In a more complex implementation, we might blacklist the token here.
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }
}
