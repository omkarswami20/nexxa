package com.nexashop.backend.controller;

import com.nexashop.backend.dto.UpdateSellerStatusRequest;
import com.nexashop.backend.entity.Seller;
import com.nexashop.backend.service.SellerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({ "/api/v1/admin", "/api/admin" })
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final SellerService sellerService;
    
    public AdminController(SellerService sellerService) {
        this.sellerService = sellerService;
    }



    // ------------ PROTECTED ENDPOINTS ------------ //

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get pending sellers", description = "Retrieves a list of sellers waiting for admin approval.")
    @GetMapping("/pending")
    public ResponseEntity<List<Seller>> getPendingSellers() {
        return ResponseEntity.ok(sellerService.getPendingSellers());
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get all sellers", description = "Retrieves a list of all registered sellers.")
    @GetMapping("/sellers")
    public ResponseEntity<List<Seller>> getAllSellers() {
        return ResponseEntity.ok(sellerService.getAllSellers());
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update seller status", description = "Approves or Denies a seller account. Sends notification email.")
    @PutMapping("/update-status")
    public ResponseEntity<Seller> updateSellerStatus(@RequestBody UpdateSellerStatusRequest request) {
        return ResponseEntity.ok(sellerService.updateSellerStatus(request));
    }
}
