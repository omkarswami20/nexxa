# NexaShop Backend - Interview Questions & Answers

Comprehensive Q&A guide for technical interviews covering the NexaShop backend implementation.

---

## Table of Contents

1. [Architecture & Design](#architecture--design)
2. [Spring Boot & Framework](#spring-boot--framework)
3. [Security & Authentication](#security--authentication)
4. [Database & JPA](#database--jpa)
5. [API Design & REST](#api-design--rest)
6. [Service Layer & Business Logic](#service-layer--business-logic)
7. [Caching & Performance](#caching--performance)
8. [E-commerce Domain](#e-commerce-domain)
9. [Error Handling & Exceptions](#error-handling--exceptions)
10. [Testing & Best Practices](#testing--best-practices)

---

## Architecture & Design

### Q1: What architecture pattern does NexaShop follow?

**Answer:**
NexaShop follows a **3-tier (3-layer) architecture** pattern:

1. **Controller Layer (Presentation)**: Handles HTTP requests/responses, validation, and routing
2. **Service Layer (Business Logic)**: Contains business rules, transaction management, and orchestration
3. **Repository Layer (Data Access)**: Manages database operations using Spring Data JPA

This separation ensures:
- **Separation of Concerns**: Each layer has a single responsibility
- **Maintainability**: Changes in one layer don't affect others
- **Testability**: Each layer can be tested independently
- **Reusability**: Services can be reused by multiple controllers

### Q2: Is NexaShop a monolithic or microservices architecture?

**Answer:**
NexaShop is a **monolithic Spring Boot application**. All components (controllers, services, repositories) are packaged together and deployed as a single unit.

**Why monolithic?**
- Small to medium scale application
- Single team development
- Strong data consistency requirements (ACID transactions)
- Performance-critical operations
- Cost-effective for current scale

**When to consider microservices:**
- Team size grows (5+ developers)
- Different scaling requirements per service
- Need for technology diversity
- Independent deployment needs

### Q3: Explain the request flow in NexaShop.

**Answer:**
```
1. HTTP Request → Security Filter (JWT Authentication)
2. Controller Layer → Validates request, extracts parameters
3. Service Layer → Executes business logic, manages transactions
4. Repository Layer → Performs database operations
5. Database (TiDB) → Executes SQL queries
6. Response flows back through layers
7. HTTP Response → Formatted JSON response
```

**Key Points:**
- JWT filter validates token before reaching controllers
- `@Transactional` ensures atomic operations
- Exception handling at global level via `GlobalExceptionHandler`

### Q4: How does dependency injection work in this application?

**Answer:**
Spring Boot uses **constructor-based dependency injection**:

```java
@RestController
public class ProductController {
    private final ProductService productService;
    
    public ProductController(ProductService productService) {
        this.productService = productService;
    }
}
```

**Benefits:**
- Dependencies are explicit and required
- Immutable dependencies (final fields)
- Easier testing (can inject mocks)
- Compile-time safety

**Spring manages:**
- Service instantiation
- Dependency resolution
- Lifecycle management
- Singleton scope by default

---

## Spring Boot & Framework

### Q5: What Spring Boot features are used in NexaShop?

**Answer:**
1. **Spring Data JPA**: Database abstraction layer
2. **Spring Security**: Authentication and authorization
3. **Spring Web**: REST API development
4. **Spring Mail**: Email notifications
5. **Spring Data Redis**: Caching and OTP storage
6. **SpringDoc OpenAPI**: API documentation
7. **HikariCP**: Connection pooling
8. **Spring DevTools**: Development hot reload

### Q6: How is transaction management handled?

**Answer:**
Using **declarative transaction management** with `@Transactional`:

```java
@Service
@Transactional
public class OrderService {
    public Order checkout(...) {
        // All operations in single transaction
        // If any fails, entire transaction rolls back
    }
}
```

**Key Points:**
- `@Transactional` on service methods ensures ACID properties
- Checkout process: order creation, stock update, cart clearing - all atomic
- Default propagation: `REQUIRED` (joins existing or creates new)
- Default isolation: `READ_COMMITTED`

### Q7: Explain the configuration approach.

**Answer:**
**Externalized Configuration** using `application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://...
spring.datasource.username=...
spring.datasource.password=...

# JWT
app.jwt.secret=...
app.jwt.expiration-ms=86400000

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379
```

**Benefits:**
- Environment-specific configurations
- No code changes for different environments
- Sensitive data not in code
- Easy to override with environment variables

---

## Security & Authentication

### Q8: How does JWT authentication work in NexaShop?

**Answer:**
**JWT (JSON Web Token) based stateless authentication:**

1. **Login**: User credentials validated → JWT token generated
2. **Token Structure**: Header + Payload (email, role) + Signature
3. **Request**: Client sends token in `Authorization: Bearer <token>` header
4. **Validation**: `JwtAuthenticationFilter` validates token on each request
5. **Security Context**: User email and role set in Spring Security context

**Token Claims:**
- `sub`: User email
- `role`: ROLE_ADMIN, ROLE_SELLER, or ROLE_CUSTOMER
- `iat`: Issued at timestamp
- `exp`: Expiration (24 hours default)

**Benefits:**
- Stateless (no server-side session storage)
- Scalable (works across multiple servers)
- Self-contained (user info in token)

### Q9: How are passwords secured?

**Answer:**
**BCrypt password hashing**:

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// Registration
customer.setPassword(passwordEncoder.encode(rawPassword));

// Login
passwordEncoder.matches(rawPassword, hashedPassword);
```

**BCrypt Features:**
- One-way hashing (cannot be reversed)
- Salt automatically generated and stored
- Adaptive hashing (can increase cost factor)
- Resistant to rainbow table attacks

**Security Best Practices:**
- Never store plain text passwords
- Use strong password policies
- Hash on registration, verify on login

### Q10: Explain role-based access control (RBAC).

**Answer:**
**Three roles with different permissions:**

1. **ROLE_ADMIN**:
   - Access to `/api/v1/admin/*` endpoints
   - Can approve/deny sellers
   - Can manage categories
   - Full system access

2. **ROLE_SELLER**:
   - Access to product management endpoints
   - Can view/manage own orders
   - Cannot access admin endpoints

3. **ROLE_CUSTOMER**:
   - Access to cart, orders, profile
   - Can browse products
   - Cannot access seller/admin endpoints

**Implementation:**
```java
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@GetMapping("/admin/pending")
public ResponseEntity<List<Seller>> getPendingSellers() { ... }
```

### Q11: How is CORS configured?

**Answer:**
**CORS (Cross-Origin Resource Sharing)** configured in `SecurityConfig`:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("http://localhost:5173"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);
    return source;
}
```

**Configuration:**
- Allowed origins: Frontend URLs (localhost:5173, localhost:3000)
- Allowed methods: All HTTP methods
- Credentials: Enabled (for cookies/auth headers)

---

## Database & JPA

### Q12: What database is used and why?

**Answer:**
**TiDB Cloud** - A MySQL-compatible distributed database.

**Why TiDB?**
- MySQL compatibility (familiar SQL syntax)
- Distributed architecture (scalability)
- ACID transactions
- Cloud-managed (less operational overhead)

**Connection Pooling:**
- **HikariCP** for connection management
- Max pool size: 10 connections
- Connection timeout: 30 seconds
- Idle timeout: 30 seconds

### Q13: Explain JPA entity relationships in NexaShop.

**Answer:**
**Key Relationships:**

1. **Product → Seller (Many-to-One)**:
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "seller_id")
private Seller seller;
```

2. **Product → Category (Many-to-One)**:
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "category_id")
private Category category;
```

3. **CartItem → Customer (Many-to-One, implicit)**:
```java
@Column(nullable = false)
private Long customerId; // Foreign key reference
```

**Fetch Strategies:**
- **LAZY**: Load on demand (default for @ManyToOne)
- **EAGER**: Load immediately (avoid for performance)

### Q14: How are database transactions handled?

**Answer:**
**Spring's `@Transactional` annotation**:

```java
@Transactional
public Order checkout(String email, ...) {
    // 1. Validate cart
    // 2. Check stock
    // 3. Create order
    // 4. Create order items
    // 5. Update stock
    // 6. Clear cart
    // All in single transaction
}
```

**Transaction Properties:**
- **Atomicity**: All or nothing
- **Consistency**: Database constraints maintained
- **Isolation**: Default READ_COMMITTED
- **Durability**: Committed changes persist

**Rollback Scenarios:**
- Exception thrown (RuntimeException)
- Insufficient stock
- Invalid data

### Q15: Explain the entity design for orders.

**Answer:**
**Order and OrderItem entities**:

**Order Entity:**
- Contains customer ID, address snapshot (JSON), total amount
- Status: PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELED

**OrderItem Entity:**
- Contains product snapshot (name, price) - immutable after order
- Links to order, product, seller
- Individual status per item (seller can update)

**Why snapshot?**
- Product details may change after order
- Historical accuracy (what customer ordered)
- Price changes don't affect past orders

---

## API Design & REST

### Q16: What REST principles are followed?

**Answer:**
**RESTful API design:**

1. **Resource-Based URLs**:
   - `/api/v1/products` - Product collection
   - `/api/v1/products/{id}` - Specific product
   - `/api/v1/orders` - Order collection

2. **HTTP Methods**:
   - `GET`: Retrieve resources
   - `POST`: Create resources
   - `PUT`: Update resources (full update)
   - `PATCH`: Partial updates
   - `DELETE`: Remove resources

3. **Status Codes**:
   - `200 OK`: Success
   - `201 Created`: Resource created
   - `400 Bad Request`: Invalid input
   - `401 Unauthorized`: Authentication required
   - `403 Forbidden`: Insufficient permissions
   - `404 Not Found`: Resource not found

4. **Stateless**: Each request contains all necessary information

### Q17: How is API versioning handled?

**Answer:**
**URL-based versioning**:

- Primary: `/api/v1/*`
- Backward compatibility: `/api/*` (legacy support)

**Benefits:**
- Clear version separation
- Easy to deprecate old versions
- Multiple versions can coexist

**Example:**
- `/api/v1/products` (current)
- `/api/products` (legacy, still supported)

### Q18: Explain request validation.

**Answer:**
**Bean Validation (Jakarta Validation)**:

```java
@PostMapping
public ResponseEntity<Product> addProduct(
    @Valid @RequestBody ProductRequest request,
    Principal principal
) { ... }
```

**ProductRequest DTO:**
```java
public class ProductRequest {
    @NotBlank
    private String name;
    
    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal price;
    
    @NotNull
    @Min(0)
    private Integer stockQuantity;
}
```

**Validation Benefits:**
- Automatic validation before service layer
- Clear error messages
- Type safety
- Reduces boilerplate code

---

## Service Layer & Business Logic

### Q19: What is the responsibility of the Service layer?

**Answer:**
**Service layer responsibilities:**

1. **Business Logic**: Implement domain rules
2. **Transaction Management**: Ensure data consistency
3. **Orchestration**: Coordinate multiple repositories
4. **Validation**: Business rule validation
5. **External Integration**: Email, SMS, external APIs

**Example - OrderService.checkout():**
- Validates cart is not empty
- Checks product availability
- Calculates total
- Creates order and order items
- Updates product stock
- Clears cart
- Sends notifications

### Q20: How is the checkout process implemented?

**Answer:**
**Atomic checkout transaction:**

```java
@Transactional
public Order checkout(String email, Optional<Long> addressId, ...) {
    // 1. Get customer and cart
    // 2. Validate cart items and stock
    // 3. Process address (existing or new)
    // 4. Calculate total
    // 5. Create order
    // 6. Create order items with product snapshots
    // 7. Update product stock (decrement)
    // 8. Clear cart
    // 9. Send email notifications (async)
    // All in single transaction
}
```

**Key Features:**
- **Atomic**: All or nothing
- **Stock Validation**: Prevents overselling
- **Product Snapshots**: Preserves order history
- **Async Notifications**: Doesn't block transaction

### Q21: How are external services integrated?

**Answer:**
**Multiple external service integrations:**

1. **Email Service (Gmail SMTP)**:
```java
@Service
public class EmailService {
    private final JavaMailSender mailSender;
    
    public void sendOrderConfirmation(...) {
        // Send email asynchronously
    }
}
```

2. **SMS Service**:
```java
// In OtpService
private void sendSms(String mobile, String otp) {
    RestTemplate restTemplate = new RestTemplate();
    // Call SMS API
}
```

3. **ZipCode API**:
```java
@Service
public class ZipCodeService {
    public ZipCodeResponse lookupZipCode(String zip, String country) {
        // Call Zippopotam.us API
    }
}
```

**Best Practices:**
- Async for non-critical operations (emails)
- Error handling for external failures
- Configuration for API keys/URLs
- Retry logic for transient failures

---

## Caching & Performance

### Q22: How is Redis used in NexaShop?

**Answer:**
**Redis for OTP storage and caching:**

1. **OTP Storage**:
```java
// Store OTP with TTL
redisTemplate.opsForValue().set(
    "otp:email:" + email, 
    otp, 
    Duration.ofSeconds(120)
);

// Verify OTP
String storedOtp = redisTemplate.opsForValue()
    .get("otp:email:" + email);
```

2. **Benefits**:
   - Fast in-memory storage
   - Automatic expiration (TTL)
   - High performance
   - Distributed caching support

3. **OTP Lifecycle**:
   - Generated: 6-digit random number
   - Stored: Redis with 120-second TTL
   - Verified: Retrieved and compared
   - Deleted: After successful verification

### Q23: How is performance optimized?

**Answer:**
**Performance optimization strategies:**

1. **Connection Pooling**: HikariCP for database connections
2. **Lazy Loading**: JPA entities loaded on demand
3. **Pagination**: Product listings paginated
4. **Async Operations**: Email notifications don't block
5. **Redis Caching**: Fast OTP lookups
6. **Indexed Queries**: Database indexes on frequently queried columns

**Example - Pagination:**
```java
Pageable pageable = PageRequest.of(offset, limit);
Page<Product> products = productRepository
    .findByStatus(ProductStatus.ACTIVE, pageable);
```

---

## E-commerce Domain

### Q24: How does the cart system work?

**Answer:**
**Cart implementation:**

1. **CartItem Entity**:
   - `customerId`: Links to customer
   - `productId`: Links to product
   - `quantity`: Item quantity
   - Unique constraint: (customerId, productId)

2. **Operations**:
   - **Add/Update**: `PUT /api/v1/cart/items` with productId and quantity
   - **Remove**: `DELETE /api/v1/cart/items/{productId}`
   - **View**: `GET /api/v1/cart` returns items with product details

3. **Business Rules**:
   - Only active products can be added
   - Quantity must be positive
   - Cart cleared after successful checkout

### Q25: Explain the seller verification process.

**Answer:**
**Multi-step seller verification:**

1. **Registration**:
   - Seller registers with email, password, store name
   - Status: `PENDING`
   - Email verification token generated

2. **Email Verification**:
   - Verification email sent with token link
   - Seller clicks link: `GET /api/v1/sellers/verify?token=xxx`
   - Status updated to `PENDING_ADMIN_APPROVAL`

3. **Mobile Verification** (Optional):
   - OTP sent to mobile number
   - Verified via `/api/v1/sellers/mobile/verify-otp`

4. **Admin Approval**:
   - Admin reviews pending sellers
   - Updates status to `APPROVED` or `DENIED`
   - Approved sellers can add products

### Q26: How is product stock managed?

**Answer:**
**Stock management during checkout:**

1. **Stock Check**:
```java
if (product.getStockQuantity() < cartItem.getQuantity()) {
    throw new IllegalArgumentException("Insufficient stock");
}
```

2. **Stock Update**:
```java
@Transactional
public Order checkout(...) {
    // Check stock availability
    // Create order
    // Decrement stock
    product.setStockQuantity(
        product.getStockQuantity() - quantity
    );
}
```

3. **Stock Updates**:
   - Seller can update stock: `PATCH /api/v1/products/{id}/stock`
   - Stock decremented atomically during checkout
   - Prevents overselling (transaction ensures consistency)

### Q27: How are orders processed?

**Answer:**
**Order processing flow:**

1. **Order Creation**:
   - Customer initiates checkout
   - Cart items converted to order items
   - Product snapshots saved (name, price)
   - Address snapshot saved (JSON)

2. **Order Status**:
   - Order: PLACED → CONFIRMED → SHIPPED → DELIVERED
   - OrderItem: Individual status per seller

3. **Seller Actions**:
   - View orders: `GET /api/v1/orders/seller`
   - Update status: `PATCH /api/v1/orders/seller/{orderItemId}/status`

4. **Notifications**:
   - Customer: Order confirmation email
   - Sellers: Notification for each order item

---

## Error Handling & Exceptions

### Q28: How are exceptions handled?

**Answer:**
**Global exception handling**:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
        ResourceNotFoundException ex
    ) {
        return ResponseEntity.status(404)
            .body(new ErrorResponse(ex.getMessage()));
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
        IllegalArgumentException ex
    ) {
        return ResponseEntity.status(400)
            .body(new ErrorResponse(ex.getMessage()));
    }
}
```

**Exception Types:**
- `ResourceNotFoundException` → 404
- `IllegalArgumentException` → 400
- `IllegalStateException` → 400
- `BadCredentialsException` → 401
- `VerificationRequiredException` → 403

### Q29: How are validation errors handled?

**Answer:**
**Bean Validation errors**:

```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ErrorResponse> handleValidation(
    MethodArgumentNotValidException ex
) {
    List<String> errors = ex.getBindingResult()
        .getFieldErrors()
        .stream()
        .map(FieldError::getDefaultMessage)
        .collect(Collectors.toList());
    
    return ResponseEntity.status(400)
        .body(new ErrorResponse("Validation failed", errors));
}
```

**Response Format:**
```json
{
  "message": "Validation failed",
  "errors": [
    "Name is required",
    "Price must be positive"
  ],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## Testing & Best Practices

### Q30: What testing strategies would you use?

**Answer:**
**Multi-level testing approach:**

1. **Unit Tests**:
   - Test service methods in isolation
   - Mock repositories
   - Test business logic

2. **Integration Tests**:
   - Test controller endpoints
   - Use `@SpringBootTest`
   - Test with test database

3. **Repository Tests**:
   - Test JPA queries
   - Use `@DataJpaTest`
   - Verify entity relationships

**Example Test Structure:**
```java
@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testGetProduct() throws Exception {
        mockMvc.perform(get("/api/v1/products/1"))
            .andExpect(status().isOk());
    }
}
```

### Q31: What are the best practices followed?

**Answer:**
**Code quality and best practices:**

1. **Separation of Concerns**: Clear layer boundaries
2. **Dependency Injection**: Constructor-based DI
3. **Transaction Management**: `@Transactional` for data consistency
4. **Exception Handling**: Global exception handler
5. **Validation**: Input validation at controller level
6. **Security**: JWT authentication, password hashing
7. **Configuration**: Externalized configuration
8. **Documentation**: Swagger/OpenAPI documentation
9. **Code Organization**: Package structure by layer
10. **Naming Conventions**: Clear, descriptive names

### Q32: How would you scale this application?

**Answer:**
**Scaling strategies:**

1. **Horizontal Scaling**:
   - Deploy multiple instances
   - Load balancer in front
   - Stateless design (JWT) supports this

2. **Database Optimization**:
   - Read replicas for read-heavy operations
   - Database indexing
   - Query optimization

3. **Caching**:
   - Redis for frequently accessed data
   - Product listings cache
   - Category cache

4. **Async Processing**:
   - Email notifications (already async)
   - Background job processing
   - Message queues for heavy operations

5. **Microservices Migration** (future):
   - Split by domain (Product, Order, Customer)
   - Independent scaling
   - Service-specific databases

---

## Quick Reference

### Key Technologies
- **Framework**: Spring Boot 3.4.0
- **Language**: Java 21
- **Database**: TiDB Cloud (MySQL-compatible)
- **Cache**: Redis
- **Security**: JWT, BCrypt, Spring Security
- **ORM**: Hibernate/JPA
- **Documentation**: SpringDoc OpenAPI

### Key Patterns
- 3-Tier Architecture
- Dependency Injection
- Repository Pattern
- DTO Pattern
- Global Exception Handling
- Stateless Authentication

### Key Principles
- RESTful API design
- Separation of Concerns
- Single Responsibility
- DRY (Don't Repeat Yourself)
- Security First
- Configuration over Code

---

## Tips for Interviews

1. **Know Your Code**: Be able to explain any part of the codebase
2. **Trade-offs**: Understand why choices were made (monolithic vs microservices)
3. **Scalability**: Think about how to scale the application
4. **Security**: Emphasize security practices (JWT, password hashing)
5. **Best Practices**: Highlight following Spring Boot best practices
6. **Problem Solving**: Be ready to discuss how you'd solve specific problems
7. **Architecture Decisions**: Explain why 3-tier architecture was chosen

---

**Good luck with your interviews!** 🚀
