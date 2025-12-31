package com.nexashop.backend.service;

import com.nexashop.backend.entity.Product;
import com.nexashop.backend.entity.ProductStatus;
import com.nexashop.backend.entity.Seller;
import com.nexashop.backend.exception.ResourceNotFoundException;
import com.nexashop.backend.repository.CategoryRepository;
import com.nexashop.backend.repository.ProductRepository;
import com.nexashop.backend.repository.SellerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SellerRepository sellerRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    private Seller seller;
    private Product product;

    @BeforeEach
    void setUp() {
        seller = new Seller();
        seller.setId(1L);
        seller.setEmail("seller@example.com");

        product = new Product();
        product.setId(1L);
        product.setName("Test Product");
        product.setPrice(new BigDecimal("99.99"));
        product.setStockQuantity(10);
        product.setStatus(ProductStatus.ACTIVE);
        product.setSeller(seller);
    }

    @Test
    void testGetAllActiveProductsPaginated_NoFilters() {
        List<Product> products = Arrays.asList(product);
        Page<Product> productPage = new PageImpl<>(products, PageRequest.of(0, 12), 1);

        when(productRepository.findActiveProductsWithFilters(
                eq(ProductStatus.ACTIVE),
                isNull(),
                isNull(),
                any(Pageable.class)
        )).thenReturn(productPage);

        var result = productService.getAllActiveProductsPaginated(null, null, 12, 0);

        assertNotNull(result);
        assertEquals(1, result.get("total"));
        assertEquals(1, result.get("page"));
        assertEquals(12, result.get("pageSize"));
        assertNotNull(result.get("products"));
    }

    @Test
    void testGetAllActiveProductsPaginated_WithCategoryFilter() {
        List<Product> products = Arrays.asList(product);
        Page<Product> productPage = new PageImpl<>(products, PageRequest.of(0, 12), 1);

        when(productRepository.findActiveProductsWithFilters(
                eq(ProductStatus.ACTIVE),
                eq("Electronics"),
                isNull(),
                any(Pageable.class)
        )).thenReturn(productPage);

        var result = productService.getAllActiveProductsPaginated("Electronics", null, 12, 0);

        assertNotNull(result);
        assertEquals(1, result.get("total"));
        verify(productRepository, times(1)).findActiveProductsWithFilters(
                eq(ProductStatus.ACTIVE),
                eq("Electronics"),
                isNull(),
                any(Pageable.class)
        );
    }

    @Test
    void testGetAllActiveProductsPaginated_WithSearchFilter() {
        List<Product> products = Arrays.asList(product);
        Page<Product> productPage = new PageImpl<>(products, PageRequest.of(0, 12), 1);

        when(productRepository.findActiveProductsWithFilters(
                eq(ProductStatus.ACTIVE),
                isNull(),
                eq("Test"),
                any(Pageable.class)
        )).thenReturn(productPage);

        var result = productService.getAllActiveProductsPaginated(null, "Test", 12, 0);

        assertNotNull(result);
        verify(productRepository, times(1)).findActiveProductsWithFilters(
                eq(ProductStatus.ACTIVE),
                isNull(),
                eq("Test"),
                any(Pageable.class)
        );
    }

    @Test
    void testGetProductById_NotFound() {
        when(productRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            productService.getProductById(999L);
        });
    }

    @Test
    void testGetProductById_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Product result = productService.getProductById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Product", result.getName());
    }
}

