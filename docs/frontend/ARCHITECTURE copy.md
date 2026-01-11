# NexaShop Backend Architecture

## Overview

NexaShop is a **monolithic Spring Boot application** built using a **3-tier (3-layer) architecture**. This document explains the architecture patterns used, the difference between monolithic and microservices architectures, and why the current design was chosen.

---

## 3-Tier Architecture (3-Part API)

The application follows a **3-tier architecture** pattern, also known as the **3-layer architecture**:

```
┌─────────────────────────────────────────┐
│         Presentation Layer               │
│         (Controller / API Layer)         │
│  - Handles HTTP requests/responses       │
│  - Request validation                    │
│  - Response formatting                   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Business Logic Layer             │
│         (Service Layer)                  │
│  - Business rules & logic                 │
│  - Transaction management                │
│  - Service orchestration                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Data Access Layer                │
│         (Repository Layer)               │
│  - Database operations                   │
│  - Entity management                     │
│  - Query execution                       │
└─────────────────────────────────────────┘
```

### Layer 1: Controller Layer (Presentation)

**Location**: `com.nexashop.backend.controller`

**Responsibilities**:
- Receive HTTP requests
- Validate request data (using `@Valid` annotations)
- Call appropriate service methods
- Format and return HTTP responses
- Handle authentication via `Principal` object
- Apply security annotations (`@PreAuthorize`, `@SecurityRequirement`)

**Example**:
```java
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    private final ProductService productService;
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(new ProductResponse(product));
    }
}
```

**Key Controllers**:
- `AuthController` - Authentication endpoints
- `ProductController` - Product management
- `OrderController` - Order processing
- `CartController` - Shopping cart operations
- `CategoryController` - Category management
- `AdminController` - Admin operations

### Layer 2: Service Layer (Business Logic)

**Location**: `com.nexashop.backend.service`

**Responsibilities**:
- Implement business logic and rules
- Coordinate between multiple repositories
- Manage transactions (`@Transactional`)
- Handle business exceptions
- Orchestrate complex operations (e.g., checkout process)
- Integrate with external services (Email, SMS, Redis)

**Example**:
```java
@Service
@Transactional
public class ProductService {
    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    
    public Product addProduct(ProductRequest request, String sellerEmail) {
        Seller seller = sellerRepository.findByEmail(sellerEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Seller not found"));
        
        Product product = new Product();
        // Business logic: validate, set defaults, etc.
        product.setSeller(seller);
        return productRepository.save(product);
    }
}
```

**Key Services**:
- `ProductService` - Product business logic
- `OrderService` - Order processing and checkout
- `CartService` - Cart management
- `CustomerService` - Customer operations
- `SellerService` - Seller management
- `EmailService` - Email notifications
- `OtpService` - OTP generation and verification

### Layer 3: Repository Layer (Data Access)

**Location**: `com.nexashop.backend.repository`

**Responsibilities**:
- Database operations (CRUD)
- Query execution using Spring Data JPA
- Entity relationship management
- Custom query methods

**Example**:
```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerIdAndStatus(Long sellerId, ProductStatus status);
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
}
```

**Key Repositories**:
- `ProductRepository` - Product data access
- `OrderRepository` - Order data access
- `CustomerRepository` - Customer data access
- `SellerRepository` - Seller data access
- `CartItemRepository` - Cart data access

---

## Benefits of 3-Tier Architecture

1. **Separation of Concerns**: Each layer has a single, well-defined responsibility
2. **Maintainability**: Changes in one layer don't affect others
3. **Testability**: Each layer can be tested independently
4. **Reusability**: Service layer can be reused by different controllers
5. **Scalability**: Can optimize each layer independently

---

## Current Architecture: Monolithic Application

### What is a Monolithic Architecture?

A **monolithic application** is a single, unified application where all components are packaged together and deployed as one unit. In NexaShop:

- All controllers, services, and repositories are in one codebase
- Single deployment unit (one JAR file)
- Single database (TiDB Cloud)
- All services run in the same process
- Shared memory space

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│              NexaShop Monolithic Application          │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐│
│  │ Controllers  │  │   Services   │  │ Repositories││
│  │  (15 files)  │→ │  (13 files)  │→ │ (10 files)  ││
│  └──────────────┘  └──────────────┘  └─────────────┘│
│                                                       │
│  ┌─────────────────────────────────────────────────┐│
│  │         Spring Boot Application Context          ││
│  │  - Dependency Injection                          ││
│  │  - Security Configuration                        ││
│  │  - JWT Authentication                            ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
    ┌─────────┐          ┌─────────┐          ┌─────────┐
    │  TiDB   │          │  Redis  │          │  Email  │
    │ Database│          │  Cache  │          │   SMS   │
    └─────────┘          └─────────┘          └─────────┘
```

### Advantages of Monolithic Architecture

1. **Simplicity**
   - Single codebase to manage
   - Easier to develop and debug
   - Straightforward deployment

2. **Performance**
   - No network calls between services
   - Shared memory access
   - Faster inter-service communication

3. **Transaction Management**
   - ACID transactions across all operations
   - Easier to maintain data consistency
   - Single database simplifies queries

4. **Development Speed**
   - Faster development for small teams
   - No need for service contracts
   - Easier to refactor

5. **Cost-Effective**
   - Single server/deployment
   - Lower infrastructure costs
   - Simpler monitoring

### Disadvantages of Monolithic Architecture

1. **Scalability Challenges**
   - Must scale entire application
   - Can't scale individual components
   - Resource-intensive operations affect all services

2. **Technology Constraints**
   - All services must use same tech stack
   - Difficult to adopt new technologies
   - Limited language flexibility

3. **Deployment Risk**
   - Single point of failure
   - Changes require full redeployment
   - Risk of breaking unrelated features

4. **Team Coordination**
   - Multiple teams work on same codebase
   - Merge conflicts and coordination issues
   - Slower development as team grows

---

## Microservices Architecture

### What are Microservices?

**Microservices** is an architectural pattern where an application is built as a collection of small, independent services that:

- Run in separate processes
- Communicate over network (HTTP/REST, gRPC, message queues)
- Have their own databases
- Can be developed, deployed, and scaled independently
- Own their business domain

### Microservices Architecture Diagram

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Product    │  │    Order     │  │   Customer   │
│   Service    │  │   Service    │  │   Service    │
│              │  │              │  │              │
│  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │
│  │   DB   │  │  │  │   DB   │  │  │  │   DB   │  │
│  └────────┘  │  │  └────────┘  │  │  └────────┘  │
└──────────────┘  └──────────────┘  └──────────────┘
       ↓                 ↓                 ↓
       └─────────────────┴─────────────────┘
                         ↓
              ┌──────────────────┐
              │  API Gateway     │
              │  (Load Balancer) │
              └──────────────────┘
                         ↓
              ┌──────────────────┐
              │   Frontend App   │
              └──────────────────┘
```

### Example: NexaShop as Microservices

If NexaShop were microservices, it might be split into:

1. **Product Service**
   - Product CRUD operations
   - Category management
   - Product search

2. **Order Service**
   - Order creation
   - Order status management
   - Order history

3. **Cart Service**
   - Cart management
   - Cart persistence

4. **Customer Service**
   - Customer registration
   - Profile management
   - Address management

5. **Seller Service**
   - Seller registration
   - Seller verification
   - Seller management

6. **Auth Service**
   - Authentication
   - JWT token generation
   - User authorization

7. **Notification Service**
   - Email notifications
   - SMS notifications

8. **Payment Service** (if added)
   - Payment processing
   - Payment gateway integration

### Advantages of Microservices

1. **Independent Scalability**
   - Scale only the services that need it
   - Product service can handle more load during sales
   - Order service can scale during peak times

2. **Technology Diversity**
   - Each service can use different technologies
   - Product service: Java/Spring Boot
   - Analytics service: Python
   - Search service: Elasticsearch

3. **Team Autonomy**
   - Teams can work independently
   - Faster development cycles
   - Less coordination overhead

4. **Fault Isolation**
   - Failure in one service doesn't crash entire system
   - Better resilience
   - Easier debugging

5. **Independent Deployment**
   - Deploy services independently
   - Faster release cycles
   - Reduced deployment risk

### Disadvantages of Microservices

1. **Complexity**
   - Network communication overhead
   - Service discovery needed
   - Distributed system challenges

2. **Data Consistency**
   - No ACID transactions across services
   - Eventual consistency required
   - Distributed transaction challenges

3. **Operational Overhead**
   - Multiple deployments to manage
   - More infrastructure to monitor
   - Complex debugging across services

4. **Network Latency**
   - Inter-service calls add latency
   - Network failures affect system
   - Performance overhead

5. **Cost**
   - More infrastructure resources
   - Multiple databases
   - Higher operational costs

---

## When to Use Monolithic vs Microservices

### Use Monolithic When:

✅ **Small to medium-sized application**
- NexaShop fits this category
- Single team or small team
- Limited complexity

✅ **Simple business domain**
- E-commerce is well-understood
- Clear business boundaries
- Standard operations

✅ **Performance is critical**
- Low latency requirements
- High transaction volume
- Real-time operations

✅ **Rapid development needed**
- MVP or startup phase
- Need to move fast
- Limited resources

✅ **Strong data consistency required**
- ACID transactions needed
- Complex queries across entities
- Data integrity critical

### Use Microservices When:

✅ **Large, complex application**
- Multiple teams (10+ developers)
- Complex business domains
- Different scaling needs

✅ **Different scaling requirements**
- Some services need more resources
- Uneven load distribution
- Resource optimization needed

✅ **Technology diversity needed**
- Different tech stacks required
- Specialized tools for specific services
- Innovation in specific areas

✅ **Independent deployment needed**
- Frequent deployments
- Different release cycles
- Reduced deployment risk

✅ **Organizational structure**
- Multiple teams
- Clear service boundaries
- Team autonomy required

---

## NexaShop: Why Monolithic?

### Current State Analysis

**NexaShop is well-suited for monolithic architecture because:**

1. **Small to Medium Scale**
   - Single team development
   - Manageable codebase size
   - Clear business domain

2. **Strong Data Consistency**
   - E-commerce requires ACID transactions
   - Order processing needs consistency
   - Inventory management critical

3. **Performance Requirements**
   - Fast response times needed
   - Low latency for user experience
   - Efficient database queries

4. **Development Speed**
   - Rapid feature development
   - Easy refactoring
   - Quick bug fixes

5. **Cost Efficiency**
   - Single deployment
   - Lower infrastructure costs
   - Simpler operations

### When to Consider Microservices

Consider migrating to microservices when:

1. **Team Size Grows**
   - Multiple teams (5+ developers)
   - Coordination becomes difficult
   - Merge conflicts increase

2. **Scaling Challenges**
   - Product service needs more resources
   - Order service has different load patterns
   - Independent scaling required

3. **Technology Needs**
   - Need specialized tools
   - Different languages for specific services
   - Innovation requirements

4. **Deployment Frequency**
   - Frequent deployments needed
   - Different release cycles
   - Reduced deployment risk required

5. **Business Complexity**
   - Multiple business domains
   - Complex workflows
   - Service boundaries clear

---

## Technology Stack

### Core Framework
- **Spring Boot 3.4.0** - Application framework
- **Java 21** - Programming language
- **Spring Security** - Security framework
- **Spring Data JPA** - Data access layer

### Database
- **TiDB Cloud** - MySQL-compatible distributed database
- **Hibernate** - ORM framework
- **HikariCP** - Connection pooling

### Caching & Storage
- **Redis** - OTP storage and caching
- **Local File System** - Product image storage

### External Services
- **Gmail SMTP** - Email service
- **SMS API** - OTP delivery
- **Zippopotam.us API** - Zip code lookup

### Security
- **JWT (jjwt)** - Token-based authentication
- **BCrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Documentation
- **SpringDoc OpenAPI** - API documentation
- **Swagger UI** - Interactive API explorer

---

## Data Flow Example

### Request Flow: Get Product by ID

```
1. HTTP Request
   GET /api/v1/products/123
   ↓
2. Security Filter (JwtAuthenticationFilter)
   - Extract JWT token
   - Validate token
   - Set authentication context
   ↓
3. ProductController.getProductById()
   - Extract path variable (id = 123)
   - Call ProductService.getProductById(123)
   ↓
4. ProductService.getProductById()
   - Business logic validation
   - Call ProductRepository.findById(123)
   ↓
5. ProductRepository.findById()
   - Execute SQL query
   - Map result to Product entity
   ↓
6. Database (TiDB)
   - Execute SELECT query
   - Return product data
   ↓
7. Response flows back through layers
   Product → ProductService → ProductController → HTTP Response
```

### Transaction Flow: Checkout Process

```
1. CustomerController.checkout()
   ↓
2. OrderService.checkout()
   @Transactional
   {
     3. Validate cart items
     4. Check product availability
     5. Calculate total
     6. Create Order entity
     7. Create OrderItem entities
     8. Update product stock
     9. Clear cart items
     10. Send email notifications (async)
   }
   ↓
11. All operations in single transaction
    - If any step fails, entire transaction rolls back
    - Ensures data consistency
```

---

## Summary

- **Current Architecture**: Monolithic Spring Boot application with 3-tier architecture
- **3-Tier Pattern**: Controller → Service → Repository layers
- **Why Monolithic**: Small team, strong consistency needs, performance, cost-effective
- **When to Migrate**: Team growth, scaling challenges, technology diversity needs
- **Best Practice**: Start monolithic, migrate to microservices when needed

The monolithic architecture is the right choice for NexaShop's current scale and requirements. As the application grows, consider microservices migration when the benefits outweigh the added complexity.
