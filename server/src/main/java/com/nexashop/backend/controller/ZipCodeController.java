package com.nexashop.backend.controller;

import com.nexashop.backend.dto.ZipCodeResponse;
import com.nexashop.backend.service.ZipCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Zip Code Lookup")
@RequestMapping({"/api/v1/zipcode", "/api/zipcode"})
public class ZipCodeController {

    private final ZipCodeService zipCodeService;

    public ZipCodeController(ZipCodeService zipCodeService) {
        this.zipCodeService = zipCodeService;
    }

    @Operation(summary = "Lookup address details from zip code", 
               description = "Fetches city, state, and country information for a given zip/postal code. Supports India and other countries via Zippopotam.us API.")
    @GetMapping
    public ResponseEntity<ZipCodeResponse> lookupZipCode(
            @RequestParam String zip,
            @RequestParam(required = false) String country) {
        try {
            ZipCodeResponse response = zipCodeService.lookupZipCode(zip, country);
            if (response == null) {
                return ResponseEntity.ok(null);
            }
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

