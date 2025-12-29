package com.nexashop.backend.controller;

import com.nexashop.backend.entity.Customer;
import com.nexashop.backend.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerProfileController {

    private final CustomerService customerService;

    public CustomerProfileController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @Operation(summary = "Get profile", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/profile")
    public ResponseEntity<Customer> getProfile(Principal principal) {
        Customer c = customerService.getProfile(principal.getName());
        return ResponseEntity.ok(c);
    }

    @Operation(summary = "Update profile", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/profile")
    public ResponseEntity<Customer> updateProfile(Principal principal, @RequestBody Map<String, String> body) {
        String name = body.get("name");
        String mobile = body.get("mobile");
        Customer c = customerService.updateProfile(principal.getName(), name, mobile);
        return ResponseEntity.ok(c);
    }

    @Operation(summary = "Change password", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Principal principal, @RequestBody Map<String, String> body) {
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        boolean ok = customerService.changePassword(principal.getName(), oldPassword, newPassword);
        return ok ? ResponseEntity.ok(Map.of("message", "Password updated")) :
                ResponseEntity.badRequest().body(Map.of("message", "Old password incorrect"));
    }
}
