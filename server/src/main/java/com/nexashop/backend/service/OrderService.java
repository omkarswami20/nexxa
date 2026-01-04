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
    private final SellerRepository sellerRepository;
    private final EmailService emailService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OrderService(CustomerRepository customerRepository,
                        CustomerAddressRepository customerAddressRepository,
                        CartItemRepository cartItemRepository,
                        ProductRepository productRepository,
                        OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        SellerRepository sellerRepository,
                        EmailService emailService) {
        this.customerRepository = customerRepository;
        this.customerAddressRepository = customerAddressRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.sellerRepository = sellerRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Order checkout(String customerEmail, Optional<Long> addressIdOpt, Map<String, Object> inlineAddress) {

        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        Long customerId = customer.getId();
        System.out.println("Customer found: " + customerId);

        List<CartItem> cart = cartItemRepository.findByCustomerId(customerId);
        if (cart.isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }
        System.out.println("Cart size: " + cart.size());

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
        System.out.println("Products loaded");

        // Address processing (retaining logic)
        String addressJson;
        if (addressIdOpt.isPresent()) {
            System.out.println("Using existing address ID: " + addressIdOpt.get());
            var addr = customerAddressRepository.findById(addressIdOpt.get())
                    .orElseThrow(() -> new IllegalArgumentException("Address not found"));
            if (!Objects.equals(addr.getCustomerId(), customerId)) {
                throw new IllegalArgumentException("Address does not belong to customer");
            }
            addressJson = serializeAddress(addr);
        } else if (inlineAddress != null && !inlineAddress.isEmpty()) {
             System.out.println("Processing inline address");
             // ... existing inline address logic ...
            try {
                // Validate required address fields
                String name = (String) inlineAddress.get("name");
                String line1 = (String) inlineAddress.get("line1");
                String city = (String) inlineAddress.get("city");
                String state = (String) inlineAddress.get("state");
                String zip = (String) inlineAddress.get("zip");
                String country = (String) inlineAddress.get("country");
                
                if (name == null || name.trim().isEmpty() ||
                    line1 == null || line1.trim().isEmpty() ||
                    city == null || city.trim().isEmpty() ||
                    state == null || state.trim().isEmpty() ||
                    zip == null || zip.trim().isEmpty() ||
                    country == null || country.trim().isEmpty()) {
                    throw new IllegalArgumentException("All required address fields must be provided");
                }
                
                // Auto-save new address to profile
                CustomerAddress newAddr = new CustomerAddress();
                newAddr.setCustomerId(customerId);
                newAddr.setName(name.trim());
                newAddr.setPhone(inlineAddress.get("phone") != null ? ((String) inlineAddress.get("phone")).trim() : null);
                newAddr.setLine1(line1.trim());
                newAddr.setLine2(inlineAddress.get("line2") != null ? ((String) inlineAddress.get("line2")).trim() : null);
                newAddr.setCity(city.trim());
                newAddr.setState(state.trim());
                newAddr.setZip(zip.trim());
                newAddr.setCountry(country.trim());
                
                // If it's the first address, make it default
                long count = customerAddressRepository.findByCustomerId(customerId).size();
                if (count == 0) {
                    newAddr.setDefault(true);
                }
                
                System.out.println("Saving new address");
                customerAddressRepository.save(newAddr);

                addressJson = objectMapper.writeValueAsString(inlineAddress);
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Invalid address data: " + e.getMessage());
            }
        } else {
            throw new IllegalArgumentException("Address is required");
        }
        System.out.println("Address processed");

        // Compute total and create order
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cart) {
            Product p = products.get(item.getProductId());
            total = total.add(p.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        System.out.println("Total calculated: " + total);

        Order order = new Order();
        order.setCustomerId(customerId);
        order.setAddressSnapshotJson(addressJson);
        order.setTotalAmount(total);
        order.setStatus(Order.Status.PLACED);
        
        System.out.println("Saving order...");
        Order savedOrder = orderRepository.save(order);
        System.out.println("Order saved: " + savedOrder.getId());

        // Create order items and deduct stock
        for (CartItem item : cart) {
            System.out.println("Processing item: " + item.getId());
            Product p = products.get(item.getProductId());
            OrderItem oi = new OrderItem();
            oi.setOrderId(savedOrder.getId());
            oi.setProductId(p.getId());
            oi.setProductNameSnapshot(p.getName());
            oi.setUnitPrice(p.getPrice());
            oi.setQuantity(item.getQuantity());
            oi.setSellerId(p.getSeller().getId()); // Potential NPE if seller is null
            oi.setStatus(OrderItem.Status.PLACED);
            orderItemRepository.save(oi);

            // Deduct stock
            p.setStockQuantity(p.getStockQuantity() - item.getQuantity());
            productRepository.save(p);
        }
        
        System.out.println("Items processed. Clearing cart...");

        // Clear cart
        cartItemRepository.deleteAll(cart);
        System.out.println("Cart cleared.");

        // Send email notifications asynchronously (don't block transaction)
        // Move email sending outside transaction to avoid issues
        try {
            // Get order items for email (after transaction commits)
            List<OrderItem> savedOrderItems = orderItemRepository.findByOrderId(savedOrder.getId());
            
            if (savedOrderItems != null && !savedOrderItems.isEmpty()) {
                // Send order confirmation email to customer
                if (customer != null && customer.getEmail() != null && !customer.getEmail().trim().isEmpty()) {
                    try {
                        emailService.sendOrderConfirmationEmail(
                            customer.getEmail(),
                            customer.getName() != null && !customer.getName().trim().isEmpty() 
                                ? customer.getName() : "Customer",
                            savedOrder,
                            savedOrderItems
                        );
                    } catch (Exception e) {
                        org.slf4j.LoggerFactory.getLogger(OrderService.class)
                            .warn("Failed to send order confirmation email: {}", e.getMessage());
                    }
                }

                // Send new order notifications to sellers (grouped by seller)
                Map<Long, List<OrderItem>> itemsBySeller = new HashMap<>();
                for (OrderItem item : savedOrderItems) {
                    if (item != null && item.getSellerId() != null) {
                        itemsBySeller.computeIfAbsent(item.getSellerId(), k -> new ArrayList<>()).add(item);
                    }
                }

                for (Map.Entry<Long, List<OrderItem>> entry : itemsBySeller.entrySet()) {
                    Long sellerId = entry.getKey();
                    List<OrderItem> sellerItems = entry.getValue();
                    
                    if (sellerId != null && sellerItems != null && !sellerItems.isEmpty()) {
                        try {
                            sellerRepository.findById(sellerId).ifPresent(seller -> {
                                if (seller != null && seller.getEmail() != null && !seller.getEmail().trim().isEmpty()) {
                                    for (OrderItem item : sellerItems) {
                                        if (item != null) {
                                            try {
                                                Product product = productRepository.findById(item.getProductId()).orElse(null);
                                                Integer remainingStock = product != null ? product.getStockQuantity() : null;
                                                
                                                emailService.sendNewOrderNotificationToSeller(
                                                    seller.getEmail(),
                                                    seller.getName() != null && !seller.getName().trim().isEmpty()
                                                        ? seller.getName() : "Seller",
                                                    item,
                                                    savedOrder,
                                                    remainingStock
                                                );
                                            } catch (Exception e) {
                                                org.slf4j.LoggerFactory.getLogger(OrderService.class)
                                                    .warn("Failed to send seller notification for item {}: {}", 
                                                        item.getId(), e.getMessage());
                                            }
                                        }
                                    }
                                }
                            });
                        } catch (Exception e) {
                            org.slf4j.LoggerFactory.getLogger(OrderService.class)
                                .warn("Failed to process seller notifications for seller {}: {}", sellerId, e.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Log error but don't fail the order creation
            org.slf4j.LoggerFactory.getLogger(OrderService.class)
                .error("Failed to send order notification emails: {}", e.getMessage(), e);
        }

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
        
        OrderItem.Status oldStatus = oi.getStatus();
        oi.setStatus(status);
        OrderItem savedItem = orderItemRepository.save(oi);

        // Send email notifications based on status change
        try {
            Order order = orderRepository.findById(oi.getOrderId()).orElse(null);
            Customer customer = order != null ? customerRepository.findById(order.getCustomerId()).orElse(null) : null;
            Seller seller = sellerRepository.findById(sellerId).orElse(null);

            // Send status change notification to seller
            if (seller != null && seller.getEmail() != null) {
                emailService.sendOrderStatusChangeToSeller(
                    seller.getEmail(),
                    seller.getName() != null ? seller.getName() : "Seller",
                    savedItem,
                    oldStatus,
                    status
                );
            }

            // Send shipment/delivery notifications to customer
            if (customer != null && customer.getEmail() != null && order != null) {
                if (status == OrderItem.Status.SHIPPED) {
                    emailService.sendOrderShippedEmail(
                        customer.getEmail(),
                        customer.getName() != null ? customer.getName() : "Customer",
                        order,
                        savedItem
                    );
                } else if (status == OrderItem.Status.DELIVERED) {
                    emailService.sendOrderDeliveredEmail(
                        customer.getEmail(),
                        customer.getName() != null ? customer.getName() : "Customer",
                        order,
                        savedItem
                    );
                }
            }
        } catch (Exception e) {
            // Log error but don't fail the status update
            org.slf4j.LoggerFactory.getLogger(OrderService.class)
                .error("Failed to send status change notification emails: {}", e.getMessage(), e);
        }

        return savedItem;
    }
}
