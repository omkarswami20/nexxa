package com.nexashop.backend.controller;

import com.nexashop.backend.dto.CheckoutRequest;
import com.nexashop.backend.entity.Order;
import com.nexashop.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@Tag(name = "Checkout")
@RequestMapping({"/api/v1", "/api"})
public class CheckoutController {

    private final OrderService orderService;

    public CheckoutController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(
        summary = "Checkout and place order",
        description = "Process checkout with either an existing address (addressId) or a new address. " +
                     "If addressId is provided, address can be null. If addressId is null, address must be provided with all required fields. " +
                     "After successful checkout, order confirmation emails are sent to customer and sellers.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/checkout")
    public ResponseEntity<Order> checkout(Principal principal, @Valid @RequestBody CheckoutRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Checkout request cannot be null");
        }
        
        if (principal == null || principal.getName() == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        
        Optional<Long> addressId = request.getAddressId() != null 
            ? Optional.of(request.getAddressId()) 
            : Optional.empty();
        
        Map<String, Object> inlineAddress = null;
        // Only process address if addressId is not provided
        if (request.getAddressId() == null && request.getAddress() != null) {
            CheckoutRequest.AddressDto addr = request.getAddress();
            // Only create inlineAddress if address has actual content (not just empty object)
            if (addr.getName() != null && !addr.getName().trim().isEmpty() &&
                addr.getLine1() != null && !addr.getLine1().trim().isEmpty() &&
                addr.getCity() != null && !addr.getCity().trim().isEmpty()) {
                inlineAddress = new HashMap<>();
                inlineAddress.put("name", addr.getName().trim());
                if (addr.getPhone() != null && !addr.getPhone().trim().isEmpty()) {
                    inlineAddress.put("phone", addr.getPhone().trim());
                }
                inlineAddress.put("line1", addr.getLine1().trim());
                if (addr.getLine2() != null && !addr.getLine2().trim().isEmpty()) {
                    inlineAddress.put("line2", addr.getLine2().trim());
                }
                inlineAddress.put("city", addr.getCity().trim());
                inlineAddress.put("state", addr.getState() != null ? addr.getState().trim() : "");
                inlineAddress.put("zip", addr.getZip() != null ? addr.getZip().trim() : "");
                inlineAddress.put("country", addr.getCountry() != null ? addr.getCountry().trim() : "");
            }
        }
        
        try {
            Order order = orderService.checkout(principal.getName(), addressId, inlineAddress);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e; // These are handled by GlobalExceptionHandler
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(CheckoutController.class)
                .error("Unexpected error during checkout: ", e);
            throw new RuntimeException("Checkout failed: " + e.getMessage(), e);
        }
    }
}
