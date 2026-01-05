package com.nexashop.backend.controller;

import com.nexashop.backend.dto.LoginResponse;
import com.nexashop.backend.dto.SellerLoginRequest;
import com.nexashop.backend.dto.SellerRegisterRequest;
import com.nexashop.backend.entity.Seller;
import com.nexashop.backend.service.SellerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({ "/api/v1/sellers", "/api/sellers" })
public class SellerController {

    private final SellerService sellerService;

    public SellerController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    @Operation(summary = "Register a new Seller", description = "Creates a new seller account with PENDING_APPROVAL status and sends a verification email.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registration successful"),
            @ApiResponse(responseCode = "400", description = "Email already exists")
    })
    @PostMapping("/register")
    public ResponseEntity<Seller> registerSeller(@Valid @RequestBody SellerRegisterRequest request) {
        return ResponseEntity.ok(sellerService.registerSeller(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginSeller(@RequestBody SellerLoginRequest request) {
        return ResponseEntity.ok(sellerService.loginSeller(request));
    }

    @Operation(summary = "Resend seller verification email")
    @PostMapping("/resend-verification-email")
    public ResponseEntity<?> resendVerificationEmail(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Email is required"));
        }
        sellerService.resendVerificationEmail(email);
        return ResponseEntity.ok(java.util.Map.of("message", "Verification email resent"));
    }
}
