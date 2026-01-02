package com.nexashop.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexashop.backend.entity.*;
import com.nexashop.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class OrderService {
    private final CustomerRepository customerRepository;
    private final CustomerAddressRepository customerAddressRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OrderService(CustomerRepository customerRepository,
                        CustomerAddressRepository customerAddressRepository,
                        CartItemRepository cartItemRepository,
                        ProductRepository productRepository,
                        OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository) {
        this.customerRepository = customerRepository;
        this.customerAddressRepository = customerAddressRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional
    public Order checkout(String customerEmail, Optional<Long> addressIdOpt, Map<String, Object> inlineAddress) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        Long customerId = customer.getId();

        List<CartItem> cart = cartItemRepository.findByCustomerId(customerId);
        if (cart.isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }

        // Load products and validate stock
        Map<Long, Product> products = new HashMap<>();
        for (CartItem item : cart) {
            Product p = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + item.getProductId()));
            if (p.getStockQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + p.getId());
            }
            products.put(p.getId(), p);
        }

        // Address snapshot JSON
        String addressJson;
        if (addressIdOpt.isPresent()) {
            var addr = customerAddressRepository.findById(addressIdOpt.get())
                    .orElseThrow(() -> new IllegalArgumentException("Address not found"));
            if (!Objects.equals(addr.getCustomerId(), customerId)) {
                throw new IllegalArgumentException("Address does not belong to customer");
            }
            addressJson = serializeAddress(addr);
        } else if (inlineAddress != null && !inlineAddress.isEmpty()) {
            try {
                // Auto-save new address to profile
                CustomerAddress newAddr = new CustomerAddress();
                newAddr.setCustomerId(customerId);
                newAddr.setName((String) inlineAddress.get("name"));
                newAddr.setPhone((String) inlineAddress.get("phone"));
                newAddr.setLine1((String) inlineAddress.get("line1"));
                newAddr.setLine2((String) inlineAddress.get("line2"));
                newAddr.setCity((String) inlineAddress.get("city"));
                newAddr.setState((String) inlineAddress.get("state"));
                newAddr.setZip((String) inlineAddress.get("zip"));
                newAddr.setCountry((String) inlineAddress.get("country"));
                
                // If it's the first address, make it default
                long count = customerAddressRepository.findByCustomerId(customerId).size();
                if (count == 0) {
                    newAddr.setDefault(true);
                }
                
                customerAddressRepository.save(newAddr);

                addressJson = objectMapper.writeValueAsString(inlineAddress);
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Invalid address data");
            }
        } else {
            throw new IllegalArgumentException("Address is required");
        }

        // Compute total and create order
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cart) {
            Product p = products.get(item.getProductId());
            total = total.add(p.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        Order order = new Order();
        order.setCustomerId(customerId);
        order.setAddressSnapshotJson(addressJson);
        order.setTotalAmount(total);
        order.setStatus(Order.Status.PLACED);
        Order savedOrder = orderRepository.save(order);

        // Create order items and deduct stock
        for (CartItem item : cart) {
            Product p = products.get(item.getProductId());
            OrderItem oi = new OrderItem();
            oi.setOrderId(savedOrder.getId());
            oi.setProductId(p.getId());
            oi.setProductNameSnapshot(p.getName());
            oi.setUnitPrice(p.getPrice());
            oi.setQuantity(item.getQuantity());
            oi.setSellerId(p.getSeller().getId());
            oi.setStatus(OrderItem.Status.PLACED);
            orderItemRepository.save(oi);

            // Deduct stock
            p.setStockQuantity(p.getStockQuantity() - item.getQuantity());
            productRepository.save(p);
        }

        // Clear cart
        cartItemRepository.deleteByCustomerId(customerId);

        return savedOrder;
    }

    private String serializeAddress(CustomerAddress addr) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("name", addr.getName());
        snapshot.put("phone", addr.getPhone());
        snapshot.put("line1", addr.getLine1());
        snapshot.put("line2", addr.getLine2());
        snapshot.put("city", addr.getCity());
        snapshot.put("state", addr.getState());
        snapshot.put("zip", addr.getZip());
        snapshot.put("country", addr.getCountry());
        try {
            return objectMapper.writeValueAsString(snapshot);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize address");
        }
    }

    public List<Order> listOrders(String customerEmail) {
        Long customerId = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found")).getId();
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public Map<String, Object> getOrder(String customerEmail, Long orderId) {
        Long customerId = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found")).getId();
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!Objects.equals(order.getCustomerId(), customerId)) {
            throw new IllegalArgumentException("Order not found");
        }
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        Map<String, Object> res = new HashMap<>();
        res.put("order", order);
        res.put("items", items);
        return res;
    }

    public List<OrderItem> listSellerOrderItems(Long sellerId) {
        return orderItemRepository.findBySellerIdOrderByIdDesc(sellerId);
    }

    @Transactional
    public OrderItem updateSellerOrderItemStatus(Long sellerId, Long orderItemId, OrderItem.Status status) {
        OrderItem oi = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new IllegalArgumentException("Order item not found"));
        if (!Objects.equals(oi.getSellerId(), sellerId)) {
            throw new IllegalArgumentException("Order item not found");
        }
        oi.setStatus(status);
        return orderItemRepository.save(oi);
    }
}
