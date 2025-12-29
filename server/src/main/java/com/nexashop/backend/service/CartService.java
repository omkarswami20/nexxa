package com.nexashop.backend.service;

import com.nexashop.backend.entity.CartItem;
import com.nexashop.backend.entity.Product;
import com.nexashop.backend.repository.CartItemRepository;
import com.nexashop.backend.repository.CustomerRepository;
import com.nexashop.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository,
                       CustomerRepository customerRepository,
                       ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    public List<CartItem> getCart(String customerEmail) {
        Long customerId = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found")).getId();
        return cartItemRepository.findByCustomerId(customerId);
    }

    public List<Map<String, Object>> getCartWithProducts(String customerEmail) {
        Long customerId = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found")).getId();
        List<CartItem> cartItems = cartItemRepository.findByCustomerId(customerId);
        
        return cartItems.stream().map(item -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", item.getId());
            map.put("productId", item.getProductId());
            map.put("quantity", item.getQuantity());
            map.put("createdAt", item.getCreatedAt());
            map.put("updatedAt", item.getUpdatedAt());
            
            // Fetch product details
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product != null) {
                Map<String, Object> productMap = new HashMap<>();
                productMap.put("id", product.getId());
                productMap.put("name", product.getName());
                productMap.put("description", product.getDescription());
                productMap.put("price", product.getPrice());
                productMap.put("imageUrl", product.getImageUrl());
                productMap.put("stockQuantity", product.getStockQuantity());
                if (product.getCategory() != null) {
                    Map<String, Object> categoryMap = new HashMap<>();
                    categoryMap.put("id", product.getCategory().getId());
                    categoryMap.put("name", product.getCategory().getName());
                    productMap.put("category", categoryMap);
                }
                map.put("product", productMap);
            }
            
            return map;
        }).collect(Collectors.toList());
    }

    public CartItem setItemQuantity(String customerEmail, Long productId, int quantity) {
        Long customerId = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found")).getId();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        if (quantity < 0) throw new IllegalArgumentException("Quantity must be >= 0");
        if (quantity > 0 && product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock for product");
        }
        CartItem item = cartItemRepository.findByCustomerIdAndProductId(customerId, productId)
                .orElseGet(() -> {
                    CartItem ci = new CartItem();
                    ci.setCustomerId(customerId);
                    ci.setProductId(productId);
                    ci.setQuantity(0);
                    return ci;
                });
        if (quantity == 0) {
            if (item.getId() != null) cartItemRepository.delete(item);
            return item;
        }
        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    public void removeItem(String customerEmail, Long productId) {
        Long customerId = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found")).getId();
        cartItemRepository.deleteByCustomerIdAndProductId(customerId, productId);
    }

    public void clearCart(Long customerId) {
        cartItemRepository.deleteByCustomerId(customerId);
    }
}
