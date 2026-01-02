package com.nexashop.backend.controller;

import com.nexashop.backend.dto.ProductRequest;
import com.nexashop.backend.dto.ProductResponse;
import com.nexashop.backend.entity.Product;
import com.nexashop.backend.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/v1/products", "/api/products"})
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @Operation(summary = "Add a new product", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<Product> addProduct(@Valid @RequestBody ProductRequest request, Principal principal) {
        return ResponseEntity.ok(productService.addProduct(request, principal.getName()));
    }

    @Operation(summary = "Get all products for the current seller", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/seller")
    public ResponseEntity<Map<String, Object>> getSellerProducts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(defaultValue = "0") int offset,
            Principal principal) {

        Map<String, Object> result = productService.getSellerProducts(
                principal.getName(), status, category, search, limit, offset);
        // Convert products to DTOs to avoid Hibernate proxy serialization issues
        if (result.containsKey("products") && result.get("products") instanceof List) {
            @SuppressWarnings("unchecked")
            List<Product> products = (List<Product>) result.get("products");
            List<ProductResponse> productResponses = products.stream()
                    .map(ProductResponse::new)
                    .collect(Collectors.toList());
            result.put("products", productResponses);
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Get list of all product names for current seller", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/seller/list")
    public ResponseEntity<List<Map<String, Object>>> getSellerProductList(Principal principal) {
        return ResponseEntity.ok(productService.getSellerProductList(principal.getName()));
    }

    @Operation(summary = "Update a product", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,
            @Valid @RequestBody ProductRequest request, Principal principal) {
        return ResponseEntity.ok(productService.updateProduct(id, request, principal.getName()));
    }

    @Operation(summary = "Delete a product", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, Principal principal) {
        productService.deleteProduct(id, principal.getName());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Update product status", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/{id}/status")
    public ResponseEntity<Product> updateProductStatus(@PathVariable Long id,
            @RequestBody Map<String, String> request, Principal principal) {
        String status = request.get("status");
        return ResponseEntity.ok(productService.updateProductStatus(id, status, principal.getName()));
    }

    @Operation(summary = "Update product stock", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/{id}/stock")
    public ResponseEntity<Product> updateProductStock(@PathVariable Long id,
            @RequestBody Map<String, Integer> request, Principal principal) {
        Integer stock = request.get("stockQuantity");
        if (stock == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(productService.updateProductStock(id, stock, principal.getName()));
    }

    @Operation(summary = "Get all products (Public - Active only)")
    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        // If pagination parameters are provided, return paginated response
        if (limit > 0 || offset > 0 || category != null || search != null) {
            Map<String, Object> result = productService.getAllActiveProductsPaginated(category, search, limit, offset);
            // Convert products to DTOs
            if (result.containsKey("products") && result.get("products") instanceof List) {
                @SuppressWarnings("unchecked")
                List<Product> products = (List<Product>) result.get("products");
                List<ProductResponse> productResponses = products.stream()
                        .map(ProductResponse::new)
                        .collect(Collectors.toList());
                result.put("products", productResponses);
            }
            return ResponseEntity.ok(result);
        }
        // Otherwise return simple list for backward compatibility
        List<Product> products = productService.getAllActiveProducts();
        List<ProductResponse> productResponses = products.stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(productResponses);
    }

    @Operation(summary = "Get product by ID (Public - Active only)")
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(new ProductResponse(product));
    }
}
