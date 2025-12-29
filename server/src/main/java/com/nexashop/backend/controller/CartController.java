package com.nexashop.backend.controller;

import com.nexashop.backend.entity.CartItem;
import com.nexashop.backend.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Cart")
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @Operation(summary = "Get cart items", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping
    public ResponseEntity<?> getCart(Principal principal) {
        return ResponseEntity.ok(cartService.getCartWithProducts(principal.getName()));
    }

    @Operation(summary = "Set quantity for a cart item", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/items")
    public ResponseEntity<CartItem> setItemQuantity(Principal principal, @RequestBody Map<String, Object> body) {
        Long productId = ((Number) body.get("productId")).longValue();
        Integer quantity = ((Number) body.get("quantity")).intValue();
        return ResponseEntity.ok(cartService.setItemQuantity(principal.getName(), productId, quantity));
    }

    @Operation(summary = "Remove an item from cart", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<?> removeItem(Principal principal, @PathVariable Long productId) {
        cartService.removeItem(principal.getName(), productId);
        return ResponseEntity.ok(Map.of("message", "Removed"));
    }
}
