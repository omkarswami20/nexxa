package com.nexashop.backend.controller;

import com.nexashop.backend.dto.UpdateSellerStatusRequest;
import com.nexashop.backend.entity.Seller;
import com.nexashop.backend.service.SellerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({ "/api/v1/admin", "/api/admin" })
public class AdminController {

    private final SellerService sellerService;
    
    public AdminController(SellerService sellerService) {
        this.sellerService = sellerService;
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
