package com.nexashop.backend.controller;

import com.nexashop.backend.service.SellerService;
import io.swagger.v3.oas.annotations.Operation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/v1/sellers", "/api/v1/seller"})
public class SellerVerificationController {

    private static final Logger logger = LoggerFactory.getLogger(SellerVerificationController.class);
    
    private final SellerService sellerService;

    public SellerVerificationController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    @Operation(summary = "Verify seller email via link token")
    @GetMapping("/verify")
    public ResponseEntity<?> verifySellerEmail(@RequestParam("token") String token) {
        logger.debug("Received seller email verification request");
        boolean ok = sellerService.verifySellerEmail(token);
        if (ok) {
            logger.info("Seller email verified successfully");
        } else {
            logger.warn("Seller email verification failed - invalid or expired token");
        }
        return ok ? ResponseEntity.ok(Map.of("verified", true)) :
                ResponseEntity.badRequest().body(Map.of("verified", false, "message", "Invalid or expired token"));
    }

    @Operation(summary = "Send seller mobile OTP (Compatible with /api/seller/send-otp)")
    @PostMapping(value = {"/mobile/send-otp", "/send-otp"}) // Supporting both for backward compatibility and new requirement
    public ResponseEntity<?> sendMobileOtp(@RequestBody Map<String, String> body) {
        String mobile = body.get("mobile");
        // Support "identifier" from the new requirement
        if (mobile == null) {
            mobile = body.get("identifier");
        }
        
        if (mobile == null || mobile.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "mobile/identifier is required"));
        }
        sellerService.sendSellerMobileOtp(mobile);
        return ResponseEntity.ok(Map.of("message", "OTP sent"));
    }

    @Operation(summary = "Verify seller mobile OTP")
    @PostMapping("/mobile/verify-otp")
    public ResponseEntity<?> verifyMobileOtp(@RequestBody Map<String, String> body) {
        String mobile = body.get("mobile");
        String otp = body.get("otp");
        boolean ok = sellerService.verifySellerMobileOtp(mobile, otp);
        return ok ? ResponseEntity.ok(Map.of("valid", true)) :
                ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Invalid or expired OTP"));
    }
}
