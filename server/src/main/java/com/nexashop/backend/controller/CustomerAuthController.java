package com.nexashop.backend.controller;

import com.nexashop.backend.dto.CustomerLoginRequest;
import com.nexashop.backend.dto.CustomerRegisterRequest;
import com.nexashop.backend.dto.LoginResponse;
import com.nexashop.backend.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerAuthController {

    private final CustomerService customerService;

    public CustomerAuthController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @Operation(summary = "Register a customer and send OTPs")
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody CustomerRegisterRequest req) {
        var saved = customerService.register(req);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "email", saved.getEmail()));
    }

    @Operation(summary = "Login customer")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody CustomerLoginRequest req) {
        return ResponseEntity.ok(customerService.login(req));
    }

    @Operation(summary = "Verify customer email OTP")
    @PostMapping("/verify-email-otp")
    public ResponseEntity<?> verifyEmailOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        boolean ok = customerService.verifyEmailOtp(email, otp);
        return ok ? ResponseEntity.ok(Map.of("valid", true)) :
                ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Invalid or expired OTP"));
    }

    @Operation(summary = "Verify customer mobile OTP")
    @PostMapping("/verify-mobile-otp")
    public ResponseEntity<?> verifyMobileOtp(@RequestBody Map<String, String> body) {
        String mobile = body.get("mobile");
        String otp = body.get("otp");
        boolean ok = customerService.verifyMobileOtp(mobile, otp);
        return ok ? ResponseEntity.ok(Map.of("valid", true)) :
                ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Invalid or expired OTP"));
    }

    @Operation(summary = "Request forgot password OTP by email")
    @PostMapping("/forgot-password/request")
    public ResponseEntity<?> forgotPasswordRequest(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        customerService.requestForgotPassword(email);
        return ResponseEntity.ok(Map.of("message", "OTP sent"));
    }

    @Operation(summary = "Verify forgot password OTP and set new password")
    @PostMapping("/forgot-password/verify")
    public ResponseEntity<?> forgotPasswordVerify(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        String newPassword = body.get("newPassword");
        boolean ok = customerService.verifyForgotPassword(email, otp, newPassword);
        return ok ? ResponseEntity.ok(Map.of("message", "Password updated")) :
                ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP"));
    }
    @Operation(summary = "Resend OTP")
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier");
        String type = body.get("type"); // "email" or "mobile"
        if (identifier == null || type == null) {
             return ResponseEntity.badRequest().body(Map.of("message", "Identifier and type are required"));
        }
        try {
            customerService.resendOtp(identifier, type);
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
