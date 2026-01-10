# NexaShop API Endpoints Reference

Complete list of all API endpoints in the NexaShop backend application.

**Base URL**: `http://localhost:8080`  
**API Version**: `/api/v1` (backward compatible with `/api`)

---

## Authentication Endpoints

### Auth Controller (`/api/v1/auth`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/auth/register/seller` | No | Register a new seller account (status: PENDING_APPROVAL) |
| POST | `/api/v1/auth/login/seller` | No | Login as seller, returns JWT token |
| POST | `/api/v1/auth/register/customer` | No | Register a new customer account |
| POST | `/api/v1/auth/login/customer` | No | Login as customer, returns JWT token |
| POST | `/api/v1/auth/login/admin` | No | Login as admin, returns JWT token |
| POST | `/api/v1/auth/refresh-token` | No | Refresh access token using refresh token |
| POST | `/api/v1/auth/logout` | Yes | Logout user (stateless, no server action) |

**Request Examples:**
- Seller Registration: `{ "name": "John", "email": "john@example.com", "password": "password123", "storeName": "John's Store" }`
- Login: `{ "email": "user@example.com", "password": "password123" }`
- Refresh Token: `{ "refreshToken": "token_string" }`

**Response Example (Login):**
```json
{
  "token": "jwt_access_token",
  "refreshToken": "refresh_token_string",
  "email": "user@example.com",
  "role": "ROLE_SELLER"
}
```

---

## Customer Endpoints

### Customer Authentication (`/api/v1/customers`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/customers/otp/verify-email` | No | Verify customer email OTP |
| POST | `/api/v1/customers/otp/verify-mobile` | No | Verify customer mobile OTP |
| POST | `/api/v1/customers/forgot-password/request` | No | Request forgot password OTP via email |
| POST | `/api/v1/customers/forgot-password/verify` | No | Verify forgot password OTP and set new password |
| POST | `/api/v1/customers/resend-otp` | No | Resend OTP (email or mobile) |

**Request Examples:**
- Verify Email OTP: `{ "email": "user@example.com", "otp": "123456" }`
- Forgot Password: `{ "email": "user@example.com", "otp": "123456", "newPassword": "newpass123" }`
- Resend OTP: `{ "identifier": "user@example.com", "type": "email" }`

### Customer Profile (`/api/v1/customers`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/customers/profile` | Yes | Get customer profile |
| PUT | `/api/v1/customers/profile` | Yes | Update customer profile (name, mobile) |
| POST | `/api/v1/customers/change-password` | Yes | Change customer password |

**Request Example (Update Profile):**
```json
{
  "name": "John Doe",
  "mobile": "+1234567890"
}
```

### Customer Addresses (`/api/v1/customers/addresses`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/customers/addresses` | Yes | List all customer addresses |
| POST | `/api/v1/customers/addresses` | Yes | Create new address |
| PUT | `/api/v1/customers/addresses/{id}` | Yes | Update existing address |
| DELETE | `/api/v1/customers/addresses/{id}` | Yes | Delete address |

**Request Example (Create Address):**
```json
{
  "name": "Home",
  "phone": "+1234567890",
  "line1": "123 Main St",
  "line2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "zip": "10001",
  "country": "USA",
  "default": true
}
```

---

## Product Endpoints

### Product Controller (`/api/v1/products`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/products` | No | Get all active products (public, paginated) |
| GET | `/api/v1/products/{id}` | No | Get product by ID (public, active only) |
| GET | `/api/v1/products/seller` | Yes (Seller) | Get seller's products (with filters) |
| GET | `/api/v1/products/seller/list` | Yes (Seller) | Get list of product names for seller |
| POST | `/api/v1/products` | Yes (Seller) | Add new product |
| PUT | `/api/v1/products/{id}` | Yes (Seller) | Update product |
| DELETE | `/api/v1/products/{id}` | Yes (Seller) | Delete product |
| PATCH | `/api/v1/products/{id}/status` | Yes (Seller) | Update product status |
| PATCH | `/api/v1/products/{id}/stock` | Yes (Seller) | Update product stock quantity |

**Query Parameters (GET /products):**
- `category` - Filter by category name
- `search` - Search in product name/description
- `limit` - Items per page (default: 12)
- `offset` - Pagination offset (default: 0)

**Query Parameters (GET /products/seller):**
- `status` - Filter by status (ACTIVE, INACTIVE, etc.)
- `category` - Filter by category
- `search` - Search term
- `limit` - Items per page (default: 5)
- `offset` - Pagination offset (default: 0)

**Request Example (Add Product):**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "stockQuantity": 100,
  "categoryId": 1,
  "imageUrl": "/uploads/products/image.jpg",
  "status": "ACTIVE"
}
```

**Request Example (Update Status):**
```json
{
  "status": "INACTIVE"
}
```

**Request Example (Update Stock):**
```json
{
  "stockQuantity": 50
}
```

---

## Order Endpoints

### Order Controller (`/api/v1/orders`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/orders` | Yes (Customer) | List customer's orders |
| GET | `/api/v1/orders/{orderId}` | Yes (Customer) | Get order details |
| GET | `/api/v1/orders/seller` | Yes (Seller) | List seller's order items |
| PATCH | `/api/v1/orders/seller/{orderItemId}/status` | Yes (Seller) | Update order item status |

**Request Example (Update Order Item Status):**
```json
{
  "status": "SHIPPED"
}
```

**Order Status Values:**
- `PLACED` - Order placed by customer
- `CONFIRMED` - Order confirmed
- `SHIPPED` - Order shipped
- `DELIVERED` - Order delivered
- `CANCELED` - Order canceled

**Order Item Status Values:**
- `PENDING` - Pending processing
- `CONFIRMED` - Confirmed by seller
- `SHIPPED` - Shipped
- `DELIVERED` - Delivered
- `CANCELED` - Canceled

### Checkout Controller (`/api/v1/orders`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/orders/checkout` | Yes (Customer) | Checkout cart and create order |

**Request Example (Checkout):**
```json
{
  "addressId": 1,
  "address": {
    "name": "John Doe",
    "phone": "+1234567890",
    "line1": "123 Main St",
    "line2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  }
}
```

**Note:** Either `addressId` or `address` object must be provided. If `addressId` is provided, `address` can be null.

---

## Cart Endpoints

### Cart Controller (`/api/v1/cart`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/cart` | Yes (Customer) | Get cart items with product details |
| PUT | `/api/v1/cart/items` | Yes (Customer) | Set item quantity (add/update) |
| DELETE | `/api/v1/cart/items/{productId}` | Yes (Customer) | Remove item from cart |

**Request Example (Set Item Quantity):**
```json
{
  "productId": 1,
  "quantity": 3
}
```

**Response Example (Get Cart):**
```json
{
  "items": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "product": {
        "id": 1,
        "name": "Product Name",
        "price": 99.99,
        "imageUrl": "/uploads/products/image.jpg"
      }
    }
  ],
  "total": 199.98
}
```

---

## Category Endpoints

### Category Controller (`/api/v1/categories`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/categories` | No | Get all categories (public) |
| POST | `/api/v1/categories` | Yes (Admin) | Create new category |
| PUT | `/api/v1/categories/{id}` | Yes (Admin) | Update category |
| DELETE | `/api/v1/categories/{id}` | Yes (Admin) | Delete category |

**Request Example (Create Category):**
```json
{
  "name": "Electronics",
  "description": "Electronic products"
}
```

---

## Seller Endpoints

### Seller Controller (`/api/v1/sellers`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/sellers/verification/resend` | No | Resend seller verification email |

**Request Example:**
```json
{
  "email": "seller@example.com"
}
```

### Seller Verification (`/api/v1/sellers`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/sellers/verify` | No | Verify seller email via token (query param: `token`) |
| POST | `/api/v1/sellers/mobile/send-otp` | No | Send OTP to seller mobile |
| POST | `/api/v1/sellers/mobile/verify-otp` | No | Verify seller mobile OTP |

**Request Example (Send Mobile OTP):**
```json
{
  "mobile": "+1234567890"
}
```

**Request Example (Verify Mobile OTP):**
```json
{
  "mobile": "+1234567890",
  "otp": "123456"
}
```

---

## Admin Endpoints

### Admin Controller (`/api/v1/admin`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/admin/pending` | Yes (Admin) | Get list of pending sellers |
| GET | `/api/v1/admin/sellers` | Yes (Admin) | Get all sellers |
| PUT | `/api/v1/admin/update-status` | Yes (Admin) | Update seller status |

**Request Example (Update Seller Status):**
```json
{
  "sellerId": 1,
  "status": "APPROVED"
}
```

**Seller Status Values:**
- `PENDING` - Initial registration
- `PENDING_ADMIN_APPROVAL` - Awaiting admin approval
- `APPROVED` - Approved by admin
- `DENIED` - Denied by admin
- `ACTIVE` - Active seller

---

## Utility Endpoints

### File Upload (`/api/v1/upload`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/upload/product-image` | Yes | Upload product image (multipart/form-data) |
| DELETE | `/api/v1/upload/product-image` | Yes | Delete product image |

**Request (Upload):**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Fields:
  - `file` - Image file (max 5MB)
  - `productName` (optional) - Product name for file naming

**Response Example:**
```json
{
  "url": "/uploads/products/product_image_1234567890.jpg",
  "message": "File uploaded successfully"
}
```

### OTP Service (`/api/v1/otp`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/otp/seller/send` | No | Send OTP for seller |
| POST | `/api/v1/otp/seller/verify` | No | Verify seller OTP |
| POST | `/api/v1/otp/user/send` | No | Send OTP for user |
| POST | `/api/v1/otp/user/verify` | No | Verify user OTP |

**Request Example:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Zip Code Lookup (`/api/v1/zipcode`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/zipcode` | No | Lookup address details from zip code |

**Query Parameters:**
- `zip` (required) - Zip/postal code
- `country` (optional) - Country code (default: IN for India)

**Example:** `/api/v1/zipcode?zip=10001&country=US`

**Response Example:**
```json
{
  "zip": "10001",
  "city": "New York",
  "state": "NY",
  "country": "US"
}
```

---

## Authentication

### JWT Token Usage

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Token Structure

- **Access Token**: Short-lived (24 hours default)
- **Refresh Token**: Longer-lived (23 hours default)
- **Token Claims**: 
  - `sub`: User email
  - `role`: User role (ROLE_ADMIN, ROLE_SELLER, ROLE_CUSTOMER)

### Role-Based Access

- **ROLE_ADMIN**: Full access to admin endpoints
- **ROLE_SELLER**: Access to seller-specific endpoints (products, orders)
- **ROLE_CUSTOMER**: Access to customer endpoints (cart, orders, profile)

---

## Error Responses

Standard error response format:

```json
{
  "message": "Error description",
  "timestamp": "2024-01-01T00:00:00Z",
  "status": 400
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Backward Compatibility

All endpoints support both `/api/v1` and `/api` prefixes for backward compatibility. The `/api/v1` prefix is recommended for new integrations.

---

## Swagger Documentation

Interactive API documentation available at:
- **Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

---

## Notes

1. **File Uploads**: Maximum file size is 5MB (configurable in `application.properties`)
2. **Pagination**: Default limit is 12 for public endpoints, 5 for seller endpoints
3. **OTP Expiration**: OTPs expire after a configured time (stored in Redis)
4. **CORS**: Configured for `http://localhost:5173` and `http://localhost:3000`
5. **Stateless Authentication**: JWT tokens are stateless; no server-side session storage
