package com.nexashop.backend.controller;

import com.nexashop.backend.service.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/otp")
public class OtpController {

    private final OtpService otpService;

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostMapping("/seller/send")
    public ResponseEntity<?> sendSellerOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "email is required"));
        }
        otpService.sendOtp(email, OtpService.OtpType.SELLER);
        return ResponseEntity.ok(Map.of("message", "OTP sent"));
    }

    @PostMapping("/seller/verify")
    public ResponseEntity<?> verifySellerOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "email and otp are required"));
        }
        boolean ok = otpService.verifyOtp(email, otp, OtpService.OtpType.SELLER);
        return ok ? ResponseEntity.ok(Map.of("valid", true)) :
                ResponseEntity.status(400).body(Map.of("valid", false, "message", "Invalid or expired OTP"));
    }

    @PostMapping("/user/send")
    public ResponseEntity<?> sendUserOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "email is required"));
        }
        otpService.sendOtp(email, OtpService.OtpType.USER);
        return ResponseEntity.ok(Map.of("message", "OTP sent"));
    }

    @PostMapping("/user/verify")
    public ResponseEntity<?> verifyUserOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "email and otp are required"));
        }
        boolean ok = otpService.verifyOtp(email, otp, OtpService.OtpType.USER);
        return ok ? ResponseEntity.ok(Map.of("valid", true)) :
                ResponseEntity.status(400).body(Map.of("valid", false, "message", "Invalid or expired OTP"));
    }
}
