package com.nexashop.backend.service;

import com.nexashop.backend.dto.ProductRequest;
import com.nexashop.backend.entity.Category;
import com.nexashop.backend.entity.Product;
import com.nexashop.backend.entity.ProductStatus;
import com.nexashop.backend.entity.Seller;
import com.nexashop.backend.exception.ResourceNotFoundException;
import com.nexashop.backend.repository.CategoryRepository;
import com.nexashop.backend.repository.ProductRepository;
import com.nexashop.backend.repository.SellerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository,
            SellerRepository sellerRepository,
            CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.sellerRepository = sellerRepository;
        this.categoryRepository = categoryRepository;
    }

    private Seller getSellerByEmail(String email) {
        return sellerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found for email: " + email));
    }

    public Product addProduct(ProductRequest request, String sellerEmail) {
        Seller seller = getSellerByEmail(sellerEmail);

        Product product = new Product();
        updateProductFromRequest(product, request);
        product.setSeller(seller);

        // Default status if not provided (though Request should probably handle
        // defaults)
        if (product.getStatus() == null) {
            product.setStatus(ProductStatus.ACTIVE);
        }

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductRequest request, String sellerEmail) {
        Product product = getProductOwnedBySeller(id, sellerEmail);
        updateProductFromRequest(product, request);
        return productRepository.save(product);
    }

    public void deleteProduct(Long id, String sellerEmail) {
        Product product = getProductOwnedBySeller(id, sellerEmail);
        productRepository.delete(product);
    }

    public Product updateProductStatus(Long id, String statusStr, String sellerEmail) {
        Product product = getProductOwnedBySeller(id, sellerEmail);
        try {
            ProductStatus newStatus = ProductStatus.valueOf(statusStr.toUpperCase());
            product.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + statusStr);
        }
        return productRepository.save(product);
    }

    public Product updateProductStock(Long id, Integer stock, String sellerEmail) {
        Product product = getProductOwnedBySeller(id, sellerEmail);
        if (stock < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }
        product.setStockQuantity(stock);
        return productRepository.save(product);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .filter(p -> p.getStatus() == ProductStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    public List<Product> getAllActiveProducts() {
        return productRepository.findByStatus(ProductStatus.ACTIVE);
    }

    public Map<String, Object> getAllActiveProductsPaginated(String category, String search, int limit, int offset) {
        // Convert offset to page number (Spring Data uses 0-based page numbers)
        int pageNumber = offset / limit;
        Pageable pageable = PageRequest.of(pageNumber, limit);
        
        // Normalize empty strings to null for query
        String categoryParam = (category != null && category.trim().isEmpty()) ? null : category;
        String searchParam = (search != null && search.trim().isEmpty()) ? null : search;
        
        // Use database-level query with filters
        Page<Product> productPage = productRepository.findActiveProductsWithFilters(
            ProductStatus.ACTIVE,
            categoryParam,
            searchParam,
            pageable
        );

        Map<String, Object> response = new HashMap<>();
        response.put("products", productPage.getContent());
        response.put("total", productPage.getTotalElements());
        response.put("page", productPage.getNumber() + 1); // Convert to 1-based page number
        response.put("pageSize", productPage.getSize());
        response.put("totalPages", productPage.getTotalPages());

        return response;
    }

    // This method handles the complex filtering that was in the controller
    public Map<String, Object> getSellerProducts(String sellerEmail, String status, String category, String search,
            int limit, int offset) {
        Seller seller = getSellerByEmail(sellerEmail);
        
        // Convert offset to page number (Spring Data uses 0-based page numbers)
        int pageNumber = offset / limit;
        Pageable pageable = PageRequest.of(pageNumber, limit);
        
        // Parse status enum, null if invalid or not provided
        ProductStatus statusParam = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                statusParam = ProductStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid status - will be ignored in query
            }
        }
        
        // Normalize empty strings to null for query
        String categoryParam = (category != null && category.trim().isEmpty()) ? null : category;
        String searchParam = (search != null && search.trim().isEmpty()) ? null : search;
        
        // Use database-level query with filters
        Page<Product> productPage = productRepository.findSellerProductsWithFilters(
            seller.getId(),
            statusParam,
            categoryParam,
            searchParam,
            pageable
        );

        Map<String, Object> response = new HashMap<>();
        response.put("products", productPage.getContent());
        response.put("total", productPage.getTotalElements());
        response.put("page", productPage.getNumber() + 1); // Convert to 1-based page number
        response.put("pageSize", productPage.getSize());
        response.put("totalPages", productPage.getTotalPages());

        return response;
    }

    public List<Map<String, Object>> getSellerProductList(String sellerEmail) {
        Seller seller = getSellerByEmail(sellerEmail);
        List<Product> products = productRepository.findBySellerId(seller.getId());

        return products.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("name", p.getName());
            map.put("imageUrl", p.getImageUrl());
            map.put("price", p.getPrice());
            return map;
        }).collect(Collectors.toList());
    }

    // Helper methods
    private Product getProductOwnedBySeller(Long productId, String sellerEmail) {
        Seller seller = getSellerByEmail(sellerEmail);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new SecurityException("You do not own this product");
        }
        return product;
    }

    private void updateProductFromRequest(Product product, ProductRequest request) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());

        if (request.getStatus() != null) {
            try {
                product.setStatus(ProductStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep old status or default
            }
        }

        if (request.getCategoryId() != null) {
            Category cat = categoryRepository.findById(request.getCategoryId())
                    .orElse(null); // Or throw exception if category required
            product.setCategory(cat);
        } else {
            product.setCategory(null);
        }
    }
}

