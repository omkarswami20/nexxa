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
        List<Product> products = productRepository.findByStatus(ProductStatus.ACTIVE);

        // Filter by Category
        if (category != null && !category.isEmpty()) {
            products = products.stream()
                    .filter(p -> p.getCategory() != null && p.getCategory().getName().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }

        // Filter by Search (Name or Description)
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            products = products.stream()
                    .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(searchLower)) ||
                            (p.getDescription() != null && p.getDescription().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }

        int total = products.size();
        int fromIndex = Math.min(offset, total);
        int toIndex = Math.min(offset + limit, total);
        List<Product> paginatedProducts = products.subList(fromIndex, toIndex);

        Map<String, Object> response = new HashMap<>();
        response.put("products", paginatedProducts);
        response.put("total", total);
        response.put("page", (offset / limit) + 1);
        response.put("pageSize", limit);

        return response;
    }

    // This method handles the complex filtering that was in the controller
    public Map<String, Object> getSellerProducts(String sellerEmail, String status, String category, String search,
            int limit, int offset) {
        Seller seller = getSellerByEmail(sellerEmail);
        List<Product> products = productRepository.findBySellerId(seller.getId());

        // 1. Filter by Status
        if (status != null && !status.isEmpty()) {
            try {
                ProductStatus productStatus = ProductStatus.valueOf(status.toUpperCase());
                products = products.stream()
                        .filter(p -> p.getStatus() == productStatus)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Ignore invalid status filter
            }
        }

        // 2. Filter by Category
        if (category != null && !category.isEmpty()) {
            products = products.stream()
                    .filter(p -> p.getCategory() != null && p.getCategory().getName().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }

        // 3. Filter by Search (Name or Description)
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            products = products.stream()
                    .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(searchLower)) ||
                            (p.getDescription() != null && p.getDescription().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }

        int total = products.size();
        int fromIndex = Math.min(offset, total);
        int toIndex = Math.min(offset + limit, total);
        List<Product> paginatedProducts = products.subList(fromIndex, toIndex);

        Map<String, Object> response = new HashMap<>();
        response.put("products", paginatedProducts);
        response.put("total", total);
        response.put("page", (offset / limit) + 1);
        response.put("pageSize", limit);

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
