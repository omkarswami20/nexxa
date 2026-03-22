# NexaShop — Production-Grade E-Commerce Backend API

<div align="center">

![Java](https://img.shields.io/badge/Java-21-007396?style=for-the-badge&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.0-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-TiDB_Cloud-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-OTP_%26_Tokens-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

**NexaShop is a fully-featured, production-ready RESTful backend for a multi-role e-commerce platform,
built with Spring Boot 3, secured with JWT + Redis, and designed to serve Customers, Sellers, and Admins simultaneously.**

</div>

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Key Features](#4-key-features)
5. [Security Implementation](#5-security-implementation)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [Service Layer — Deep Dive](#7-service-layer--deep-dive)
8. [How to Run Locally](#8-how-to-run-locally)
9. [Environment Variables](#9-environment-variables)
10. [Design Decisions & Rationale](#10-design-decisions--rationale)

---

## 1. Project Overview

**NexaShop** is a backend API for a multi-vendor e-commerce marketplace. The system supports three distinct user roles — **Customer**, **Seller**, and **Admin** — each with dedicated authentication flows, access controls, and business logic.

### What NexaShop Does

| Domain | Functionality |
|---|---|
| **Multi-Role Auth** | Separate registration and login flows for Customers, Sellers, and Admins — all secured with JWT |
| **OTP Verification** | Email OTP (via SMTP) and mobile OTP (via SMS API) with Redis-backed TTL storage (2-minute expiry) |
| **Seller Lifecycle** | Sellers go through a multi-step verification → Admin approval pipeline before they can sell |
| **Product Catalog** | Sellers manage their own products with categories, stock, and status (ACTIVE/INACTIVE/DRAFT) |
| **Shopping Cart** | Persistent cart per customer with real-time stock validation |
| **Checkout & Orders** | Transactional checkout with address snapshot, stock deduction, and multi-seller order splitting |
| **Email Notifications** | Branded HTML emails for OTP, welcome, order confirmation, shipment, and seller status updates |
| **File Uploads** | Secure image uploads for products with UUID-based or product-name-based file naming |
| **Zip Code Lookup** | Auto-fill address fields by postal code using the Zippopotam.us external API |
| **Swagger UI** | Full interactive OpenAPI 3.0 documentation available at `/swagger-ui.html` |

---

## 2. Tech Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Language** | Java | 21 (LTS) | Primary programming language |
| **Framework** | Spring Boot | 3.4.0 | Application framework, DI, MVC, Security |
| **Database** | MySQL / TiDB Cloud (MySQL-compatible) | 8.x | Relational data storage |
| **ORM** | Spring Data JPA + Hibernate | — | Entity mapping and database interaction |
| **Connection Pool** | HikariCP | — | High-performance JDBC connection pooling |
| **Caching / OTP** | Redis (via Spring Data Redis) | — | Time-limited OTP storage and verification tokens |
| **Security** | Spring Security + JJWT | 0.11.5 | Authentication, Authorization, JWT generation |
| **Email** | Spring Boot Mail (JavaMail / SMTP) | — | Transactional email delivery (Gmail SMTP) |
| **SMS** | CIACloud SMS API (via RestTemplate) | — | Mobile OTP delivery |
| **File Storage** | Local filesystem (NIO) | — | Product image upload and serving |
| **API Documentation** | SpringDoc OpenAPI (Swagger UI) | 2.8.3 | Interactive REST API documentation |
| **Build Tool** | Apache Maven | — | Dependency management and build lifecycle |
| **Async** | Spring `@Async` (`emailTaskExecutor`) | — | Non-blocking email dispatch |

---

## 3. Architecture

NexaShop follows a strict **Layered (N-Tier) Architecture**. This separation of concerns ensures that each layer has a single, well-defined responsibility, making the codebase highly maintainable, testable, and scalable.

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIENT (Frontend / Mobile)               │
└─────────────────────────────┬────────────────────────────────┘
                              │ HTTP Requests
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                  SECURITY LAYER (Spring Security)            │
│  JwtAuthenticationFilter → validates Bearer token per req   │
│  SecurityConfig → strict RBAC (ROLE_ADMIN/SELLER/CUSTOMER)  │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    CONTROLLER LAYER                          │
│  AdminController · AuthController · CartController          │
│  CategoryController · CheckoutController                    │
│  CustomerAuthController · CustomerProfileController         │
│  FileUploadController · OrderController                     │
│  ProductController · SellerController                       │
│  SellerVerificationController · ZipCodeController           │
└─────────────────────────────┬────────────────────────────────┘
                              │ Delegates to
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER (Business Logic)             │
│  AdminAuthService · CartService · CategoryService           │
│  CustomerService · EmailService · FileStorageService        │
│  OrderService · OtpService · ProductService                 │
│  RefreshTokenService · SellerService                        │
│  VerificationService · ZipCodeService                       │
└───────────────┬────────────────────────┬─────────────────────┘
                │                        │
        ┌───────▼──────┐        ┌────────▼────────┐
        │  REPOSITORY  │        │   REDIS LAYER   │
        │    LAYER     │        │  OTP Storage    │
        │  (JPA Repos) │        │  Verification   │
        └───────┬──────┘        │  Tokens         │
                │               └─────────────────┘
                ▼
┌──────────────────────────┐
│     DATABASE (MySQL)     │
│  Admin · Customer        │
│  Seller · Product        │
│  Category · Order        │
│  OrderItem · CartItem    │
│  CustomerAddress         │
│  RefreshToken            │
└──────────────────────────┘
```

### Package Structure

```
com.nexashop.backend/
│
├── config/                    # Cross-cutting configuration beans
│   ├── AppConfig.java            # @Bean RestTemplate (single source of truth)
│   ├── AsyncConfig.java          # Thread pool for @Async email execution
│   ├── DataInitializer.java      # Seeding initial data on startup
│   ├── JacksonConfig.java        # JSON serialization settings
│   ├── SecurityConfig.java       # Spring Security + CORS + strict RBAC rules
│   ├── SwaggerConfig.java        # OpenAPI 3.0 documentation config
│   └── WebConfig.java            # Static resource serving (uploads/)
│
├── controller/                # REST Controllers (HTTP entry points)
│   ├── AdminController.java
│   ├── AuthController.java       # Unified auth: register, login, refresh, logout
│   ├── CartController.java
│   ├── CategoryController.java
│   ├── CheckoutController.java
│   ├── CustomerAuthController.java   # OTP verify, forgot password
│   ├── CustomerProfileController.java
│   ├── FileUploadController.java
│   ├── OrderController.java
│   ├── ProductController.java
│   ├── SellerController.java
│   ├── SellerVerificationController.java
│   └── ZipCodeController.java
│
├── dto/                       # Data Transfer Objects (request/response shapes)
│   ├── AdminLoginRequest.java
│   ├── CategoryRequest / CategoryResponse
│   ├── CheckoutRequest.java
│   ├── CustomerLoginRequest / CustomerRegisterRequest / CustomerResponse
│   ├── ErrorResponse.java
│   ├── LoginResponse.java            # { accessToken, refreshToken }
│   ├── ProductRequest / ProductResponse
│   ├── SellerLoginRequest / SellerRegisterRequest
│   ├── TokenRefreshRequest / TokenRefreshResponse
│   ├── UpdateSellerStatusRequest.java
│   └── ZipCodeResponse.java
│
├── entity/                    # JPA Entities (database tables)
│   ├── Admin.java
│   ├── CartItem.java
│   ├── Category.java
│   ├── Customer.java              # includes AccountStatus enum
│   ├── CustomerAddress.java
│   ├── Order.java                 # includes Status enum (PLACED, CANCELLED…)
│   ├── OrderItem.java             # includes Status enum (PLACED, SHIPPED, DELIVERED…)
│   ├── Product.java
│   ├── ProductStatus.java         # ACTIVE, INACTIVE, DRAFT
│   ├── RefreshToken.java
│   └── Seller.java                # includes SellerStatus enum
│
├── exception/                 # Custom exception classes + global handler
│   ├── GlobalExceptionHandler.java     # @RestControllerAdvice
│   ├── InvalidRefreshTokenException.java
│   ├── ResourceNotFoundException.java
│   └── VerificationRequiredException.java
│
├── repository/                # Spring Data JPA Repositories
│   ├── AdminRepository.java
│   ├── CartItemRepository.java
│   ├── CategoryRepository.java
│   ├── CustomerAddressRepository.java
│   ├── CustomerRepository.java
│   ├── OrderItemRepository.java
│   ├── OrderRepository.java
│   ├── ProductRepository.java       # custom @Query with filters + pagination
│   ├── RefreshTokenRepository.java
│   └── SellerRepository.java
│
├── security/                  # JWT infrastructure
│   ├── JwtAuthenticationFilter.java   # Intercepts every request
│   └── JwtUtils.java                  # Token generation/validation
│
└── service/                   # Business logic (see Section 7 for full detail)
    ├── AdminAuthService.java
    ├── CartService.java
    ├── CategoryService.java
    ├── CustomerService.java
    ├── EmailService.java
    ├── FileStorageService.java
    ├── OrderService.java
    ├── OtpService.java
    ├── ProductService.java
    ├── RefreshTokenService.java
    ├── SellerService.java
    ├── VerificationService.java
    └── ZipCodeService.java
```

---

## 4. Key Features

### Multi-Role System
- Three independent user roles: **Admin**, **Seller**, **Customer**
- Each role has its own registration flow, verification requirements, and JWT claims
- Spring Security enforces strict RBAC at the URL level — only `ROLE_CUSTOMER` can access cart/orders, only `ROLE_SELLER` can manage products, only `ROLE_ADMIN` can approve sellers

### Seller Lifecycle & Admin Approval
```
Seller Registers
      ↓
Email Verification Link sent (24h TTL, Redis-backed UUID token)
      ↓
Mobile OTP Verification (Redis-backed, 2min TTL)
      ↓
Status → PENDING_ADMIN_APPROVAL
      ↓
Admin Reviews → APPROVED or DENIED
      ↓
HTML notification email sent to seller
      ↓
Seller can now log in and list products
```

### Customer Verification Flow
```
Customer Registers
      ↓
Email OTP + Mobile OTP sent simultaneously (2min TTL each)
      ↓
Customer verifies both OTPs
      ↓
Account Status → ACTIVE
      ↓
Welcome email dispatched (async, non-blocking)
      ↓
Customer can log in and shop
```

### Product Management
- Sellers can add, update, delete products and manage stock
- Products support Category association
- `ProductStatus`: `ACTIVE`, `INACTIVE`, `DRAFT`
- Public catalog shows only `ACTIVE` products
- Paginated catalog with `search`, `category`, `limit`, `offset` filters
- Ownership enforced — sellers can only mutate their own products

### Shopping Cart
- Persistent per-customer cart stored in MySQL
- Automatic stock validation on add/update
- Setting quantity to `0` auto-removes the item
- Cart response includes full product details (name, price, image, stock, category)

### Transactional Checkout
- Validates stock for all cart items atomically
- Accepts either a saved address ID or an inline new address
- Inline addresses are auto-saved to the customer's address book
- Price snapshot and product name snapshot taken at purchase time (immutable order history)
- Product stock deducted within the same DB transaction
- Post-commit: async order confirmation email to customer + new order notifications to each seller

### Automated Email Notifications
All emails are sent asynchronously via a dedicated `emailTaskExecutor` thread pool:

| Trigger | Recipient | Email Type |
|---|---|---|
| Customer registration | Customer | Email OTP |
| OTP verification complete | Customer | Welcome email |
| Seller registration | Seller | Email verification link |
| Admin approves seller | Seller | Approval notification |
| Admin denies seller | Seller | Denial with rejection reason |
| Order placed | Customer | Order confirmation with item table |
| Order placed | Each Seller | New order notification + remaining stock |
| Order item → SHIPPED | Customer | Shipment notification |
| Order item → DELIVERED | Customer | Delivery confirmation |
| Order item status changes | Seller | Status change notification |

### Zip Code Auto-Fill
- Integrates with `zippopotam.us` free public API
- Returns city, state, country, and area from a postal code
- Configurable default country (`IN` for India)

---

## 5. Security Implementation

### JWT Access Token

- Library: **JJWT** (io.jsonwebtoken) v0.11.5
- Algorithm: **HS256** (HMAC-SHA256) with a 64-character secret key
- Payload claims: `sub` (email), `role` (`ROLE_ADMIN` / `ROLE_SELLER` / `ROLE_CUSTOMER`)
- Default expiry: **24 hours** (`86400000 ms`)
- Every protected request is intercepted by `JwtAuthenticationFilter`, which:
  1. Extracts the `Bearer` token from the `Authorization` header
  2. Validates signature and expiry using `JwtUtils`
  3. Sets `UsernamePasswordAuthenticationToken` in the `SecurityContextHolder`
  4. Downstream code accesses the authenticated identity via `Principal`

### Refresh Token

- Stored in **MySQL** (`refresh_token` table) — can be revoked at any time
- UUID token string generated on every login
- Default expiry: **23 hours** (`82800000 ms`) stored as `Instant`
- On access token expiry, client sends refresh token to `/api/v1/auth/refresh-token`
- Server validates (exists + not expired), determines role, and issues a new access JWT
- Expired tokens are automatically deleted from DB on verification

### Redis OTP with TTL

OTPs are stored exclusively in Redis — never in the database:

- **Automatic expiry**: Redis native `SET key value EX <seconds>` handles TTL — no cleanup job needed
- **Speed**: O(1) in-memory lookup
- **Replay attack prevention**: On successful OTP match the Redis key is immediately `DELETE`d
- **Security**: OTPs are generated with `SecureRandom` (cryptographically strong), not `java.util.Random`

**Redis Key Schema:**
```
OTP:CUSTOMER:EMAIL:<email>       → 6-digit OTP  (TTL: 120s)
OTP:CUSTOMER:MOBILE:<mobile>     → 6-digit OTP  (TTL: 120s)
OTP:SELLER:<mobile>              → 6-digit OTP  (TTL: 60-120s)
otp:forgot-password:<email>      → 6-digit OTP  (TTL: 120s)
verify:seller-email:<uuid-token> → seller email (TTL: 24h)
```

### Role-Based Access Control (RBAC)

Configured in `SecurityConfig.java` with strict `hasAuthority()` checks — no generic `.authenticated()` calls:

```
ROLE_ADMIN    → /api/v1/admin/**         (manage sellers: approve/deny)
ROLE_SELLER   → /api/v1/products/seller/**   (product CRUD)
              → /api/v1/seller/orders/**     (view & update order items)
ROLE_CUSTOMER → /api/v1/cart/**             (shopping cart)
              → /api/v1/orders/**           (order history & checkout)
PUBLIC        → GET /api/v1/products/**      (browse catalog)
              → GET /api/v1/categories/**
              → GET /api/v1/zipcode/**
              → /api/v1/auth/register/**     (sign up)
              → /api/v1/auth/login/**        (sign in)
              → /api/v1/customers/otp/**     (OTP verification)
              → /swagger-ui/** and /v3/api-docs/**
```

> **Note:** All legacy `/api/` (non-versioned) paths have been removed. The API is exclusively served under `/api/v1/`.

### Password Hashing
- **BCryptPasswordEncoder** with default strength (10 rounds)
- Passwords are never stored or transmitted in plaintext

### CORS Configuration
- Allowed origins: `http://localhost:5173`, `http://localhost:3000`, `http://127.0.0.1:5173`
- Allowed methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `HEAD`, `PATCH`
- Credentials: enabled — `Authorization` header exposed to frontend

---

## 6. API Endpoints Reference

> **Base URL**: `http://localhost:8080/api/v1`
> All protected endpoints require: `Authorization: Bearer <access_token>`

### Authentication — `/api/v1/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/register/customer` | ❌ Public | Register customer; triggers email + mobile OTP |
| `POST` | `/login/customer` | ❌ Public | Customer login; returns `accessToken` + `refreshToken` |
| `POST` | `/register/seller` | ❌ Public | Register seller; triggers email verification link + mobile OTP |
| `POST` | `/login/seller` | ❌ Public | Seller login; enforces email/mobile verified + ACTIVE status |
| `POST` | `/login/admin` | ❌ Public | Admin login via email + password |
| `POST` | `/refresh-token` | ❌ Public | Exchange valid refresh token for new access JWT |
| `POST` | `/logout` | ✅ Bearer | Stateless logout |

### Customer Auth & Profile — `/api/v1/customers`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/otp/verify-email` | ❌ Public | Verify email OTP; activates account if mobile also verified |
| `POST` | `/otp/verify-mobile` | ❌ Public | Verify mobile OTP; activates account if email also verified |
| `POST` | `/resend-otp` | ❌ Public | Resend OTP to email or mobile |
| `POST` | `/forgot-password/request` | ❌ Public | Send forgot-password OTP to email |
| `POST` | `/forgot-password/verify` | ❌ Public | Verify OTP and update password |
| `GET` | `/profile` | ✅ CUSTOMER | Get authenticated customer's profile |
| `PUT` | `/profile` | ✅ CUSTOMER | Update name and/or mobile number |
| `POST` | `/change-password` | ✅ CUSTOMER | Change password (requires old password) |

### Sellers — `/api/v1/sellers` & `/api/v1/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register/seller` | ❌ Public | Seller registration |
| `POST` | `/auth/login/seller` | ❌ Public | Seller login |
| `GET` | `/sellers/verify` | ❌ Public | Verify seller email via token link |
| `POST` | `/sellers/mobile/send-otp` | ❌ Public | Send mobile OTP to seller |
| `POST` | `/sellers/mobile/verify-otp` | ❌ Public | Verify seller mobile OTP |
| `POST` | `/sellers/verification/resend` | ❌ Public | Resend email verification link |

### Admin — `/api/v1/admin`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/pending` | ✅ ADMIN | List sellers awaiting approval |
| `GET` | `/sellers` | ✅ ADMIN | List all registered sellers |
| `PUT` | `/update-status` | ✅ ADMIN | Approve or deny a seller; triggers notification email |

### Products — `/api/v1/products`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ❌ Public | Paginated active product list (filter by category/search) |
| `GET` | `/{id}` | ❌ Public | Get single active product by ID |
| `GET` | `/seller` | ✅ SELLER | Seller's product list (filterable + paginated) |
| `GET` | `/seller/list` | ✅ SELLER | Minimal product list (id, name, price, image) |
| `POST` | `/` | ✅ SELLER | Add a new product |
| `PUT` | `/{id}` | ✅ SELLER | Update product details |
| `DELETE` | `/{id}` | ✅ SELLER | Delete a product (ownership enforced) |
| `PATCH` | `/{id}/status` | ✅ SELLER | Toggle product status (ACTIVE/INACTIVE/DRAFT) |
| `PATCH` | `/{id}/stock` | ✅ SELLER | Update stock quantity |

### Categories — `/api/v1/categories`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ❌ Public | List all categories |
| `POST` | `/` | ✅ ADMIN | Create a new category |
| `PUT` | `/{id}` | ✅ ADMIN | Update a category |
| `DELETE` | `/{id}` | ✅ ADMIN | Delete a category |

### Cart — `/api/v1/cart`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✅ CUSTOMER | Get cart with full product details |
| `PUT` | `/items` | ✅ CUSTOMER | Set item quantity (0 = remove item) |
| `DELETE` | `/items/{productId}` | ✅ CUSTOMER | Remove specific item from cart |

### Orders & Checkout — `/api/v1/orders`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/checkout` | ✅ CUSTOMER | Place order from cart with address |
| `GET` | `/` | ✅ CUSTOMER | List customer's order history (newest first) |
| `GET` | `/{orderId}` | ✅ CUSTOMER | Get order detail + items |
| `GET` | `/seller` | ✅ SELLER | List all order items for this seller |
| `PATCH` | `/seller/{orderItemId}/status` | ✅ SELLER | Update order item status |

### File Upload — `/api/v1/upload`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/product-image` | ✅ SELLER | Upload product image (max 5MB) |

### Utilities — `/api/v1/zipcode`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/{zipCode}` | ❌ Public | Lookup city/state/country for a postal code |

---

## 7. Service Layer — Deep Dive

### `AdminAuthService`
Handles administrator login. Authenticates the admin against the `admin` table using `BCryptPasswordEncoder`, generates a JWT with `ROLE_ADMIN` claim, and issues a refresh token. Supports BCrypt-hashed passwords for production security.

---

### `CartService`
Manages the per-customer persistent shopping cart:
- **`getCartWithProducts(email)`** — returns cart items enriched with full product details (name, price, image, stock, category) in a single call
- **`setItemQuantity(email, productId, quantity)`** — upserts a cart item; validates stock; a quantity of `0` auto-deletes the item; prevents overstocking
- **`removeItem(email, productId)`** — hard-deletes a cart item
- **`clearCart(customerId)`** — batch-deletes all cart items (called post-checkout)

---

### `CategoryService`
Simple CRUD service for product categories. Throws `ResourceNotFoundException` before updates/deletes. All methods are `@Transactional`.

---

### `CustomerService`
The most complex customer-facing service:
- **Registration** — validates email/mobile uniqueness, BCrypt-encodes password, sets `AccountStatus.PENDING`, simultaneously triggers email OTP and mobile OTP (both 2-minute TTL)
- **Login** — validates credentials; if account is not fully verified, auto-resends pending OTPs and throws a structured `VerificationRequiredException` with the exact pending steps
- **OTP Verification** — verifies email/mobile OTPs independently; once both clear, sets `AccountStatus.ACTIVE` and dispatches a welcome email
- **Forgot Password** — sends a time-limited OTP to the registered email; on verification, updates the BCrypt-hashed password
- **Profile Management** — authenticated update of name and mobile
- **Password Change** — verifies old password before encoding and saving the new one

---

### `EmailService`
Sends all outbound HTML emails via Spring Boot Mail (Gmail SMTP). Every method is `@Async("emailTaskExecutor")` — emails never block the HTTP request:
- `sendOtpEmail` — OTP verification code (2-minute notice)
- `sendCustomerWelcomeEmail` — post-verification welcome
- `sendVerificationEmail` — seller application received
- `sendStatusNotification` — APPROVED or DENIED email with rejection reason
- `sendSellerEmailVerification` — click-to-verify seller email link
- `sendOrderConfirmationEmail` — customer order receipt with item table
- `sendNewOrderNotificationToSeller` — per-item seller alert with earnings and remaining stock
- `sendOrderShippedEmail` — shipment notification to customer
- `sendOrderDeliveredEmail` — delivery confirmation to customer
- `sendOrderStatusChangeToSeller` — status update alert to seller

All emails share a `getHtmlTemplate(title, content)` method that renders a branded, responsive HTML layout with inline CSS.

---

### `FileStorageService`
Manages product image files on the local filesystem:
- Validates MIME type (`image/*` only)
- Generates semantically meaningful filenames from product name (`my product → my-product-0001.jpg`) with collision detection
- Falls back to UUID-based filenames if no product name is provided
- Stores files in `uploads/products/`
- `deleteFile(url)` for cleanup on product deletion
- Static files served at `/uploads/**` via `WebConfig`

---

### `OrderService`
The most transaction-critical service:
- **`checkout(email, addressId, inlineAddress)`** — fully `@Transactional`:
  1. Resolves customer and cart
  2. Validates stock for every item atomically
  3. Resolves shipping address (saved ID or new inline — auto-saved to address book)
  4. Computes order total
  5. Persists `Order` with `addressSnapshotJson` (immutable historical record)
  6. Creates `OrderItem` records with `productNameSnapshot` and `unitPrice` snapshot
  7. Deducts stock from each product
  8. Clears the cart
  9. Post-transaction: async emails to customer and each seller (grouped by `sellerId`)
- **`updateSellerOrderItemStatus`** — triggers automated emails: `SHIPPED` → customer, `DELIVERED` → customer, any change → seller

---

### `OtpService`
The Redis-backed OTP engine:
- Generates cryptographically strong 6-digit OTPs using **`SecureRandom`** (not `java.util.Random`)
- Stores OTPs in Redis with configurable TTL: `redisTemplate.opsForValue().set(key, otp, Duration.ofSeconds(ttl))`
- Dispatches via **Email** (for email contexts) or **SMS** (for mobile contexts) based on the `context` string
- **Replay attack prevention**: on successful verification, the Redis key is immediately deleted
- SMS dispatched via the injected `RestTemplate` bean — no per-request `new RestTemplate()` instantiation
- SMS is gracefully disabled if `SMS_API_KEY` is not configured

---

### `ProductService`
Full seller-centric product lifecycle:
- **Ownership enforcement** — every mutating method calls `getProductOwnedBySeller()` which verifies `product.getSeller().getId() == seller.getId()`
- **Public catalog** — `getAllActiveProductsPaginated()` uses a custom JPA `@Query` with optional `category` and `search` filters with Spring Data `Pageable`
- **Seller catalog** — supports filter by `status`, `category`, `search`, plus pagination
- Response DTOs (`ProductResponse`) prevent Hibernate lazy-loading serialization issues

---

### `RefreshTokenService`
Manages JWT refresh token lifecycle in MySQL:
- `createRefreshToken(email)` — generates a UUID token, sets expiry (`Instant.now().plusMillis(duration)`), and persists it
- `verifyExpiration(token)` — if expired, deletes DB record and throws `RuntimeException` (forces re-login)
- `deleteByEmail(email)` — cleans up all refresh tokens for a user

---

### `SellerService`
Orchestrates the entire seller onboarding pipeline:
- **Registration** — encodes password, creates seller with `PENDING` status, sends email verification link (24h token via Redis) AND mobile OTP
- **Email Verification** — reads the signed UUID token from Redis; if valid, sets `emailVerified = true`; if mobile also verified, advances to `PENDING_ADMIN_APPROVAL`
- **Mobile OTP** — same OtpService flow; if email also verified, advances to `PENDING_ADMIN_APPROVAL`
- **Login** — enforces full verification + Admin approval gate; auto-resends pending codes; generates JWT with `ROLE_SELLER`
- **Admin Status Update** — updates `SellerStatus` enum and triggers `EmailService.sendStatusNotification()`

---

### `VerificationService`
General-purpose Redis-backed token service for long-lived verification links:
- `createToken(context, identifier, ttl)` — generates UUID token, stores `verify:<context>:<token>` → `identifier` with TTL
- `consumeToken(context, token, delete)` — retrieves mapped identifier; optionally skips delete for idempotency (double-fetch protection)
- Used exclusively by `SellerService` for the email verification link flow

---

### `ZipCodeService`
Wraps the public Zippopotam.us REST API for postal code auto-fill:
- Calls `https://api.zippopotam.us/{country}/{zipCode}`
- Parses JSON to extract `city`, `state`, `country`, and `area`
- Returns `null` (not an error) for 404 responses (zip not found)
- Fully configurable: `app.zipcode.api.enabled`, `app.zipcode.api.url`, `app.zipcode.api.country`

---

## 8. How to Run Locally

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| JDK | 21 | Eclipse Temurin or Oracle |
| Maven | 3.8+ | Included in most IDEs |
| MySQL | 8.x | Or use TiDB Cloud (see config) |
| Redis | 6.x+ | Must be running on `localhost:6379` |

### Step-by-Step

**1. Clone the repository**
```bash
git clone <repository-url>
cd nexxa/server
```

**2. Start Redis**
```bash
# Docker (recommended)
docker run -d -p 6379:6379 redis:alpine

# Or locally on Linux/macOS
redis-server

# Or on Windows
redis-server.exe
```

**3. Set up MySQL database**
```sql
CREATE DATABASE nexashop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**4. Configure environment variables**
```bash
export DB_URL=jdbc:mysql://localhost:3306/nexashop?useSSL=false&serverTimezone=UTC
export DB_USERNAME=root
export DB_PASSWORD=your_password

export JWT_SECRET=your-64-character-minimum-secret-key-change-this-in-production
export JWT_EXPIRATION_MS=86400000
export JWT_REFRESH_EXPIRATION_MS=82800000

export MAIL_HOST=smtp.gmail.com
export MAIL_PORT=587
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-gmail-app-password

export REDIS_HOST=localhost
export REDIS_PORT=6379
```

> ⚠️ For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) — not your regular account password.

**5. Run the application**
```bash
mvn spring-boot:run
```

**6. Verify startup**
- API base: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

**7. Schema management**

JPA is configured with `spring.jpa.hibernate.ddl-auto=update` — Hibernate automatically creates and updates tables on startup. No manual SQL scripts required.

---

## 9. Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DB_URL` | ✅ Yes | TiDB Cloud URL | JDBC connection URL for MySQL |
| `DB_USERNAME` | ✅ Yes | — | Database username |
| `DB_PASSWORD` | ✅ Yes | — | Database password |
| `JWT_SECRET` | ✅ Yes | Dev key (64 chars) | HMAC-SHA256 signing secret (min 64 chars for prod) |
| `JWT_EXPIRATION_MS` | ❌ No | `86400000` (24h) | Access token lifetime in milliseconds |
| `JWT_REFRESH_EXPIRATION_MS` | ❌ No | `82800000` (23h) | Refresh token lifetime in milliseconds |
| `MAIL_HOST` | ✅ Yes | `smtp.gmail.com` | SMTP server hostname |
| `MAIL_PORT` | ❌ No | `587` | SMTP port (587 = STARTTLS) |
| `MAIL_USERNAME` | ✅ Yes | — | Sender email address |
| `MAIL_PASSWORD` | ✅ Yes | — | Email app password |
| `REDIS_HOST` | ❌ No | `localhost` | Redis server hostname |
| `REDIS_PORT` | ❌ No | `6379` | Redis server port |
| `SMS_API_KEY` | ❌ No | — | Base64 API key for CIACloud SMS (mobile OTP) |
| `SMS_API_URL` | ❌ No | `https://ciacloud.in/otpapi.php` | SMS provider endpoint |

> **Production note:** Never commit real secrets to version control. Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault) or CI/CD environment injection.

---

## 10. Design Decisions & Rationale

### Why Redis for OTP?

| Alternative | Problem |
|---|---|
| MySQL (DB column) | Requires a scheduler/cron to purge expired OTPs |
| Application memory | Lost on restart; breaks in multi-instance deployments |
| **Redis (chosen)** | Native TTL auto-expiry, O(1) lookup, horizontally scalable |

Redis was the natural fit because:
- The `SET key value EX <seconds>` primitive is exactly what OTP storage needs — after 2 minutes the data vanishes automatically
- OTP lookups are on every login path — O(1) performance is critical
- The same Redis instance doubles as the seller email verification token store, making it a unified ephemeral state layer
- Future horizontal scaling (multiple app instances) stays consistent since Redis is a shared external store

---

### Why JWT with Refresh Tokens?

Pure session-based auth requires server-side session storage (stateful), which breaks horizontal scalability. JWT is stateless — but pure short-lived JWT has a key weakness: tokens cannot be revoked before expiry.

The **dual-token pattern** solves this:

| Token | Storage | Lifetime | Purpose |
|---|---|---|---|
| **Access Token** | Client-side only | 24h (short) | Stateless auth; role embedded in claims |
| **Refresh Token** | MySQL DB | 23h | Can be deleted = instant revocation |

This gives the **performance of stateless JWTs** while retaining the ability to **revoke sessions** — essential for a multi-role commercial platform.

---

### Why Strict RBAC with `hasAuthority()` Instead of `.authenticated()`?

Using `.authenticated()` only checks that the user has a valid token — it does NOT check their role. This means a `ROLE_CUSTOMER` could potentially reach seller endpoints, and a `ROLE_SELLER` could reach admin endpoints.

By using `.hasAuthority("ROLE_CUSTOMER")`, `.hasAuthority("ROLE_SELLER")`, and `@PreAuthorize("hasAuthority('ROLE_ADMIN')")`, the security layer enforces the principle of **least privilege** — each role can only reach exactly the endpoints it is supposed to.

---

### Why Layered Architecture?

| Layer | Responsibility | Benefit |
|---|---|---|
| Controller | HTTP request/response handling only | Thin, easy to test in isolation |
| Service | All business logic, transactions, orchestration | Reusable; testable without HTTP context |
| Repository | Pure data access (JPA) | Database-agnostic; swappable (H2 for tests) |
| Entity / DTO | Domain model and API contract shapes (separated) | Prevents internal model from leaking to API consumers |

The separation between **Entity** (internal DB representation) and **DTO** (API contract shape) is critical:
- Prevents Hibernate lazy-loading proxy objects from leaking into JSON responses
- Allows the API shape to evolve independently of the database schema
- `ProductResponse` is a concrete example — it flattens nested `Category` and `Seller` objects

---

### Why Async Email Dispatch?

SMTP delivery can take 200ms–2000ms depending on network. Blocking the HTTP thread during email sending degrades API response times significantly — especially at checkout where emails go to both the customer and potentially multiple sellers simultaneously.

By using `@Async("emailTaskExecutor")` with a dedicated thread pool, the checkout API returns in ~50ms while emails dispatch concurrently in the background. SMTP failures are caught and logged — they never propagate to the HTTP response.

---

### Why Address & Price Snapshots?

At checkout, the shipping address is serialized to JSON and stored as `addressSnapshotJson` in the `Order` record. The same principle applies to `productNameSnapshot` and `unitPrice` in `OrderItem`:

- **Address snapshot**: If a customer later edits or deletes their saved address, past orders retain their original delivery address permanently
- **Price snapshot**: Product price edits after purchase never corrupt historical order totals
- This is a standard **event sourcing principle** — orders are an immutable ledger, not a live view of current data

---

### Why `SecureRandom` for OTP Generation?

`java.util.Random` is a **pseudo-random** generator seeded from the system clock — its output is statistically predictable. For a security-sensitive operation like OTP generation, predictability is a vulnerability.

`java.security.SecureRandom` uses an OS-level entropy source (e.g., `/dev/urandom` on Linux) — its output is **cryptographically unpredictable**, preventing brute-force or prediction attacks against OTPs.

---

### Why Injected `RestTemplate` Instead of `new RestTemplate()`?

Instantiating `new RestTemplate()` inside a method creates a new HTTP client on every call — with no connection pooling, timeout configuration, or interceptor support. It also makes the code untestable (you cannot mock `new ...`).

By declaring `RestTemplate` as a `@Bean` in `AppConfig.java` and injecting it into `OtpService` via constructor, we get:
- **Single shared instance** with connection pooling
- **Testability** — the bean can be mocked in unit tests
- **Centralized configuration** — timeouts, interceptors, etc. configured in one place

---

<div align="center">

*Built with ❤️ using Spring Boot 3 · Java 21 · Redis · MySQL · JWT*

</div>
