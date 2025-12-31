package com.nexashop.backend.repository;

import com.nexashop.backend.entity.Product;
import com.nexashop.backend.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerId(Long sellerId);

    List<Product> findByCategoryName(String name);

    List<Product> findBySellerIdAndStatus(Long sellerId, ProductStatus status);

    List<Product> findBySellerIdAndCategoryName(Long sellerId, String name);

    List<Product> findBySellerIdAndNameContainingIgnoreCase(Long sellerId, String name);

    List<Product> findByStatus(ProductStatus status);
    
    // Database-level pagination queries
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.status = :status " +
           "AND (:category IS NULL OR LOWER(p.category.name) = LOWER(:category)) " +
           "AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findActiveProductsWithFilters(
        @Param("status") ProductStatus status,
        @Param("category") String category,
        @Param("search") String search,
        Pageable pageable
    );
    
    @Query("SELECT p FROM Product p WHERE p.seller.id = :sellerId " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (:category IS NULL OR LOWER(p.category.name) = LOWER(:category)) " +
           "AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findSellerProductsWithFilters(
        @Param("sellerId") Long sellerId,
        @Param("status") ProductStatus status,
        @Param("category") String category,
        @Param("search") String search,
        Pageable pageable
    );
}
