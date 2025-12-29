package com.nexashop.backend.controller;

import com.nexashop.backend.dto.AdminLoginRequest;
import com.nexashop.backend.dto.LoginResponse;
import com.nexashop.backend.dto.UpdateSellerStatusRequest;
import com.nexashop.backend.entity.Seller;
import com.nexashop.backend.service.AdminAuthService;
import com.nexashop.backend.service.SellerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminAuthService adminAuthService;
    private final SellerService sellerService;

    public AdminController(AdminAuthService adminAuthService, SellerService sellerService) {
        this.adminAuthService = adminAuthService;
        this.sellerService = sellerService;
    }

    // -------- LOGIN ONLY OPEN ENDPOINT -------- //
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginAdmin(@RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(adminAuthService.login(request));
    }

    // ------------ PROTECTED ENDPOINTS ------------ //

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/pending")
    public ResponseEntity<List<Seller>> getPendingSellers() {
        return ResponseEntity.ok(sellerService.getPendingSellers());
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/sellers")
    public ResponseEntity<List<Seller>> getAllSellers() {
        return ResponseEntity.ok(sellerService.getAllSellers());
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/update-status")
    public ResponseEntity<Seller> updateSellerStatus(@RequestBody UpdateSellerStatusRequest request) {
        return ResponseEntity.ok(sellerService.updateSellerStatus(request));
    }
}
