package com.nexashop.backend.controller;

import com.nexashop.backend.entity.Order;
import com.nexashop.backend.entity.OrderItem;
import com.nexashop.backend.entity.Seller;
import com.nexashop.backend.repository.SellerRepository;
import com.nexashop.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Orders")
@RequestMapping("/api/v1")
public class OrderController {

    private final OrderService orderService;
    private final SellerRepository sellerRepository;

    public OrderController(OrderService orderService, SellerRepository sellerRepository) {
        this.orderService = orderService;
        this.sellerRepository = sellerRepository;
    }

    // Customer endpoints
    @Operation(summary = "List customer's orders", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> listOrders(Principal principal) {
        return ResponseEntity.ok(orderService.listOrders(principal.getName()));
    }

    @Operation(summary = "Get order detail", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Map<String, Object>> getOrder(Principal principal, @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrder(principal.getName(), orderId));
    }

    // Seller endpoints
    @Operation(summary = "List seller order items", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/seller/orders")
    public ResponseEntity<List<OrderItem>> listSellerOrderItems(Principal principal) {
        Seller seller = sellerRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Seller not found"));
        return ResponseEntity.ok(orderService.listSellerOrderItems(seller.getId()));
    }

    @Operation(summary = "Update seller order item status", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/seller/orders/{orderItemId}/status")
    public ResponseEntity<OrderItem> updateSellerOrderItemStatus(Principal principal,
                                                                 @PathVariable Long orderItemId,
                                                                 @RequestBody Map<String, String> body) {
        Seller seller = sellerRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Seller not found"));
        String statusStr = body.get("status");
        OrderItem.Status status = OrderItem.Status.valueOf(statusStr);
        return ResponseEntity.ok(orderService.updateSellerOrderItemStatus(seller.getId(), orderItemId, status));
    }
}
