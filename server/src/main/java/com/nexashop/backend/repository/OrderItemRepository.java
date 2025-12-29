package com.nexashop.backend.repository;

import com.nexashop.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
    List<OrderItem> findBySellerIdOrderByIdDesc(Long sellerId);
}
