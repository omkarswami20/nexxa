package com.nexashop.backend.controller;

import com.nexashop.backend.entity.Order;
import com.nexashop.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@RestController
@Tag(name = "Checkout")
@RequestMapping("/api/v1")
public class CheckoutController {

    private final OrderService orderService;

    public CheckoutController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Operation(summary = "Checkout and place order", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/checkout")
    public ResponseEntity<Order> checkout(Principal principal, @RequestBody Map<String, Object> body) {
        Number addressIdNum = (Number) body.get("addressId");
        Optional<Long> addressId = addressIdNum != null ? Optional.of(addressIdNum.longValue()) : Optional.empty();
        Map<String, Object> inlineAddress = (Map<String, Object>) body.get("address");
        Order order = orderService.checkout(principal.getName(), addressId, inlineAddress);
        return ResponseEntity.ok(order);
    }
}
