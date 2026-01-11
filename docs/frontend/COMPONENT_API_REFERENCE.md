# NexaShop Frontend - Component & API Reference

Complete reference for all components, pages, containers, and API hooks in the NexaShop React frontend application.

---

## Table of Contents

1. [Pages](#pages)
2. [Container Components](#container-components)
3. [Presentational Components](#presentational-components)
4. [RTK Query API Hooks](#rtk-query-api-hooks)
5. [Redux Slices](#redux-slices)
6. [Routing Configuration](#routing-configuration)
7. [Component Props](#component-props)

---

## Pages

Pages are top-level route components that render containers. They follow a simple pattern: import and render the corresponding container.

### Public Pages

| Page | Route | Container | Description |
|------|-------|-----------|-------------|
| `LandingPage` | `/` | `LandingPageContainer` | Home page with product browsing |
| `ProductDetail` | `/products/:id` | `ProductDetailContainer` | Product detail page |

### Customer Pages

| Page | Route | Auth Required | Container | Description |
|------|-------|---------------|-----------|-------------|
| `CustomerRegister` | `/customer/register` | No | `CustomerRegisterContainer` | Customer registration |
| `CustomerLogin` | `/customer/login` | No | `CustomerLoginContainer` | Customer login |
| `ForgotPassword` | `/customer/forgot-password` | No | - | Forgot password page |
| `VerifyOtp` | `/customer/verify-email`<br/>`/customer/verify-mobile` | No | - | OTP verification |
| `Cart` | `/cart` | Yes | `CartContainer` | Shopping cart |
| `Checkout` | `/checkout` | Yes | `CheckoutContainer` | Checkout page |
| `Orders` | `/orders` | Yes | - | Order list |
| `OrderDetail` | `/orders/:orderId` | Yes | - | Order details |
| `CustomerProfile` | `/customer/profile` | Yes | - | Customer profile |
| `CustomerAddresses` | `/customer/addresses` | Yes | - | Address management |

### Seller Pages

| Page | Route | Auth Required | Container | Description |
|------|-------|---------------|-----------|-------------|
| `SellerRegister` | `/seller/register` | No | `SellerRegisterContainer` | Seller registration |
| `SellerLogin` | `/seller/login` | No | `SellerLoginContainer` | Seller login |
| `SellerVerifyEmail` | `/seller/verify` | No | - | Email verification |
| `SellerDashboard` | `/seller/dashboard` | Yes (Seller) | `SellerDashboardContainer` | Seller dashboard |
| `SellerOrders` | `/seller/orders` | Yes (Seller) | - | Seller order management |

### Admin Pages

| Page | Route | Auth Required | Container | Description |
|------|-------|---------------|-----------|-------------|
| `AdminLogin` | `/admin/login` | No | `AdminLoginContainer` | Admin login |
| `AdminDashboard` | `/admin/dashboard` | Yes (Admin) | `AdminDashboardContainer` | Admin dashboard |

---

## Container Components

Containers handle business logic, API calls, and state management. They pass data and handlers to presentational components.

### Customer Containers

#### `CartContainer`
**Location**: `src/containers/customer/CartContainer.jsx`

**Responsibilities**:
- Fetch cart items using `useGetCartQuery`
- Calculate total quantity and amount
- Handle quantity updates (`useSetCartItemQuantityMutation`)
- Handle item removal (`useRemoveCartItemMutation`)
- Navigate to checkout

**Props Passed to View**:
- `items`: Cart items array
- `isLoading`: Loading state
- `totalQty`: Total quantity
- `totalAmount`: Total amount
- `onIncrease`: Handler for quantity increase
- `onDecrease`: Handler for quantity decrease
- `onRemove`: Handler for item removal
- `onCheckout`: Navigate to checkout

#### `CheckoutContainer`
**Location**: `src/containers/customer/CheckoutContainer.jsx`

**Responsibilities**:
- Fetch cart items and addresses
- Manage address selection (existing or new)
- Zip code lookup integration
- Handle checkout mutation
- Form validation

**State Management**:
- `selectedAddressId`: Selected saved address
- `useNewAddress`: Whether to use new address
- `newAddress`: New address form data
- `zipCodeLookup`: Zip code lookup state

#### `ProductBrowsingContainer`
**Location**: `src/containers/customer/ProductBrowsingContainer.jsx`

**Responsibilities**:
- Fetch products with filters
- Manage pagination
- Handle category and search filters
- Product selection

#### `ProductDetailContainer`
**Location**: `src/containers/customer/ProductDetailContainer.jsx`

**Responsibilities**:
- Fetch product by ID
- Add product to cart
- Handle quantity selection

### Seller Containers

#### `SellerDashboardContainer`
**Location**: `src/containers/seller/SellerDashboardContainer.jsx`

**Responsibilities**:
- Fetch seller products
- Product CRUD operations
- Filter and pagination management
- Product status updates

#### `SellerLoginContainer`
**Location**: `src/containers/seller/SellerLoginContainer.jsx`

**Responsibilities**:
- Handle seller login
- Form validation
- Error handling
- Redirect after login

#### `SellerRegisterContainer`
**Location**: `src/containers/seller/SellerRegisterContainer.jsx`

**Responsibilities**:
- Handle seller registration
- Form validation
- Success/error handling

### Admin Containers

#### `AdminDashboardContainer`
**Location**: `src/containers/admin/AdminDashboardContainer.jsx`

**Responsibilities**:
- Fetch pending sellers
- Seller status management
- Category management

#### `AdminLoginContainer`
**Location**: `src/containers/admin/AdminLoginContainer.jsx`

**Responsibilities**:
- Handle admin login
- Form validation
- Redirect after login

### Public Containers

#### `LandingPageContainer`
**Location**: `src/containers/public/LandingPageContainer.jsx`

**Responsibilities**:
- Fetch all products
- Product browsing
- Category filtering

---

## Presentational Components

Presentational components are pure UI components that receive props and render UI. They don't contain business logic.

### Common Components

#### `ProtectedRoute`
**Location**: `src/components/common/ProtectedRoute.jsx`

**Purpose**: Route protection based on authentication and roles

**Props**:
- `children`: Component to render if authorized
- `allowedRoles`: Array of allowed roles (optional)

**Behavior**:
- Redirects to home if no token
- Redirects to home if role not in `allowedRoles`
- Renders children if authorized

**Usage**:
```jsx
<ProtectedRoute allowedRoles={['seller']}>
  <SellerDashboard />
</ProtectedRoute>
```

#### `ProductCard`
**Location**: `src/components/common/ProductCard.jsx`

**Purpose**: Display product card with image, name, price

**Props**:
- `product`: Product object
- `onClick`: Click handler
- Other styling props

#### `Toast`
**Location**: `src/components/common/Toast.jsx`

**Purpose**: Display toast notifications

**Props**:
- `message`: Toast message
- `severity`: 'success' | 'error' | 'warning' | 'info'
- `open`: Boolean
- `onClose`: Close handler

#### `OtpModal`
**Location**: `src/components/common/OtpModal.jsx`

**Purpose**: OTP input modal

**Props**:
- `open`: Boolean
- `onClose`: Close handler
- `onVerify`: Verify handler
- `onResend`: Resend handler
- `identifier`: Email or mobile
- `type`: 'email' | 'mobile'

#### `ImageUpload`
**Location**: `src/components/common/ImageUpload.jsx`

**Purpose**: Image upload component

**Props**:
- `onUpload`: Upload handler
- `currentImage`: Current image URL
- `productName`: Product name for file naming

#### `ProductSkeleton`
**Location**: `src/components/common/ProductSkeleton.jsx`

**Purpose**: Loading skeleton for products

### Customer Components

#### `CartView`
**Location**: `src/components/customer/CartView.jsx`

**Purpose**: Cart display and management UI

**Props**:
- `items`: Cart items array
- `isLoading`: Loading state
- `totalQty`: Total quantity
- `totalAmount`: Total amount
- `onIncrease`: Quantity increase handler
- `onDecrease`: Quantity decrease handler
- `onRemove`: Remove item handler
- `onCheckout`: Checkout handler

#### `CheckoutView`
**Location**: `src/components/customer/CheckoutView.jsx`

**Purpose**: Checkout form UI

**Props**:
- `items`: Cart items
- `addresses`: Saved addresses
- `selectedAddressId`: Selected address ID
- `useNewAddress`: Boolean
- `newAddress`: New address object
- `onAddressChange`: Address selection handler
- `onNewAddressChange`: New address field handler
- `onCheckout`: Checkout handler
- `isLoading`: Loading state
- `error`: Error message

#### `ProductBrowsingView`
**Location**: `src/components/customer/ProductBrowsingView.jsx`

**Purpose**: Product grid/list display

**Props**:
- `products`: Products array
- `isLoading`: Loading state
- `onProductClick`: Product click handler
- `filters`: Filter state
- `onFilterChange`: Filter change handler

#### `ProductDetailView`
**Location**: `src/components/customer/ProductDetailView.jsx`

**Purpose**: Product detail display

**Props**:
- `product`: Product object
- `isLoading`: Loading state
- `onAddToCart`: Add to cart handler
- `quantity`: Selected quantity
- `onQuantityChange`: Quantity change handler

### Seller Components

#### `SellerDashboardView`
**Location**: `src/components/seller/SellerDashboardView.jsx`

**Purpose**: Seller dashboard UI

**Props**:
- `products`: Products array
- `filters`: Filter state
- `pagination`: Pagination state
- `onFilterChange`: Filter change handler
- `onProductCreate`: Create product handler
- `onProductUpdate`: Update product handler
- `onProductDelete`: Delete product handler
- `onStatusUpdate`: Status update handler

#### `ProductFormDialog`
**Location**: `src/components/seller/ProductFormDialog.jsx`

**Purpose**: Product create/edit form dialog

**Props**:
- `open`: Boolean
- `onClose`: Close handler
- `onSubmit`: Submit handler
- `product`: Product object (for edit)
- `categories`: Categories array

#### `ProductFilters`
**Location**: `src/components/seller/ProductFilters.jsx`

**Purpose**: Product filter controls

**Props**:
- `filters`: Filter state
- `onFilterChange`: Filter change handler
- `onClearFilters`: Clear filters handler

#### `StockUpdateDialog`
**Location**: `src/components/seller/StockUpdateDialog.jsx`

**Purpose**: Stock update dialog

**Props**:
- `open`: Boolean
- `onClose`: Close handler
- `onUpdate`: Update handler
- `currentStock`: Current stock quantity
- `productId`: Product ID

### Admin Components

#### `AdminDashboardView`
**Location**: `src/components/admin/AdminDashboardView.jsx`

**Purpose**: Admin dashboard UI

**Props**:
- `pendingSellers`: Pending sellers array
- `onApprove`: Approve handler
- `onDeny`: Deny handler

#### `CategoryManagement`
**Location**: `src/components/admin/CategoryManagement.jsx`

**Purpose**: Category CRUD UI

**Props**:
- `categories`: Categories array
- `onCreate`: Create handler
- `onUpdate`: Update handler
- `onDelete`: Delete handler

### Layout Components

#### `Layout`
**Location**: `src/components/layouts/Layout.jsx`

**Purpose**: Main application layout with navigation

**Features**:
- Navigation bar with role-based menu
- Cart icon with badge (customer only)
- User menu with logout
- Mobile menu
- Footer

**State**:
- `token`: Authentication token
- `role`: User role
- `cartItemCount`: Cart item count
- `scrolled`: Scroll state for navbar styling

---

## RTK Query API Hooks

All API hooks are generated from RTK Query API slice. They follow the pattern:
- Queries: `use[Resource]Query`
- Mutations: `use[Action][Resource]Mutation`

### Authentication Hooks

#### Customer Authentication
```javascript
// Registration
useRegisterCustomerMutation()

// Login
useLoginCustomerMutation()

// OTP Verification
useVerifyCustomerEmailOtpMutation()
useVerifyCustomerMobileOtpMutation()
useResendOtpMutation()

// Password
useRequestForgotPasswordMutation()
useVerifyForgotPasswordMutation()
```

#### Seller Authentication
```javascript
// Registration
useRegisterSellerMutation()

// Login
useLoginSellerMutation()

// Email Verification
useVerifySellerEmailMutation()

// Mobile OTP
useVerifySellerMobileOtpMutation()
useResendSellerOtpMutation()

// Resend Verification Email
useResendSellerVerificationEmailMutation()
```

#### Admin Authentication
```javascript
// Login
useLoginAdminMutation()

// Logout (all roles)
useLogoutUserMutation()
```

### Customer Profile Hooks

```javascript
// Profile
useGetCustomerProfileQuery()
useUpdateCustomerProfileMutation()
useChangeCustomerPasswordMutation()

// Addresses
useGetAddressesQuery()
useCreateAddressMutation()
useUpdateAddressMutation()
useDeleteAddressMutation()

// Zip Code
useGetZipCodeInfoQuery({ zip, country })
```

### Product Hooks

```javascript
// Public Products
useGetAllProductsQuery({ category, search, limit, offset })
useGetProductByIdQuery(id)

// Seller Products
useGetSellerProductsQuery({ status, category, search, limit, offset })
useGetSellerProductListQuery()

// Product CRUD
useCreateProductMutation()
useUpdateProductMutation()
useDeleteProductMutation()
useUpdateProductStatusMutation({ id, status })
useUpdateProductStockMutation({ id, stockQuantity })

// Product Images
useUploadProductImageMutation({ file, productName })
useDeleteProductImageMutation(url)
```

### Cart Hooks

```javascript
// Cart Operations
useGetCartQuery()
useSetCartItemQuantityMutation({ productId, quantity })
useRemoveCartItemMutation(productId)
```

### Order Hooks

```javascript
// Customer Orders
useGetOrdersQuery()
useGetOrderByIdQuery(orderId)

// Checkout
useCheckoutMutation({ addressId, address })

// Seller Orders
useGetSellerOrderItemsQuery()
useUpdateSellerOrderItemStatusMutation({ orderItemId, status })
```

### Category Hooks

```javascript
// Categories
useGetCategoriesQuery()
useCreateCategoryMutation(data)
useUpdateCategoryMutation({ id, ...data })
useDeleteCategoryMutation(id)
```

### Admin Hooks

```javascript
// Seller Management
useGetPendingSellersQuery()
useGetAllSellersQuery()
useUpdateSellerStatusMutation({ sellerId, newStatus, rejectionReason })
```

### OTP Hooks

```javascript
// Seller OTP
useSendSellerOtpMutation(email)
useVerifySellerOtpMutation({ email, otp })

// User OTP
useSendUserOtpMutation(email)
useVerifyUserOtpMutation({ email, otp })
```

---

## Redux Slices

### Auth Slice
**Location**: `src/store/slices/auth.slice.js`

**State Structure**:
```javascript
{
  user: null,
  token: string | null,
  refreshToken: string | null,
  role: 'customer' | 'seller' | 'admin' | null
}
```

**Actions**:
- `setCredentials({ user, token, refreshToken, role })`: Set authentication
- `logout()`: Clear authentication

**Selectors**:
- `selectCurrentUser(state)`: Get current user
- `selectCurrentToken(state)`: Get current token
- `selectCurrentRole(state)`: Get current role

**Persistence**: Token and role stored in `localStorage`

### Product Slice
**Location**: `src/store/slices/product.slice.js`

**State Structure**:
```javascript
{
  selectedProduct: Product | null,
  filters: {
    category: string,
    search: string,
    status: string
  },
  sortBy: 'name' | 'price' | 'stock' | 'createdAt',
  sortOrder: 'asc' | 'desc',
  pagination: {
    currentPage: number,
    pageSize: number
  }
}
```

**Actions**:
- `setSelectedProduct(product)`
- `clearSelectedProduct()`
- `setCategoryFilter(category)`
- `setSearchFilter(search)`
- `setStatusFilter(status)`
- `clearFilters()`
- `setSortBy(sortBy)`
- `setSortOrder(order)`
- `setCurrentPage(page)`
- `setPageSize(size)`
- `resetPagination()`
- `resetProductState()`

**Selectors**:
- `selectSelectedProduct(state)`
- `selectProductFilters(state)`
- `selectSortBy(state)`
- `selectSortOrder(state)`
- `selectPagination(state)`

### Category Slice
**Location**: `src/store/slices/category.slice.js`

**State Structure**:
```javascript
{
  categories: Category[],
  selectedCategory: Category | null
}
```

**Actions**:
- Category management actions

---

## Routing Configuration

### Route Structure

```javascript
<Route path="/" element={<Layout />}>
  {/* Public Routes */}
  <Route index element={<LandingPage />} />
  <Route path="products/:id" element={<ProductDetail />} />

  {/* Seller Routes */}
  <Route path="seller/register" element={<SellerRegister />} />
  <Route path="seller/verify" element={<SellerVerifyEmail />} />
  <Route path="seller/login" element={<SellerLogin />} />
  <Route
    path="seller/dashboard"
    element={
      <ProtectedRoute allowedRoles={['seller']}>
        <SellerDashboard />
      </ProtectedRoute>
    }
  />
  <Route
    path="seller/orders"
    element={
      <ProtectedRoute allowedRoles={['seller']}>
        <SellerOrders />
      </ProtectedRoute>
    }
  />

  {/* Admin Routes */}
  <Route path="admin/login" element={<AdminLogin />} />
  <Route
    path="admin/dashboard"
    element={
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    }
  />

  {/* Customer Routes - Public Auth */}
  <Route path="customer/register" element={<CustomerRegister />} />
  <Route path="customer/login" element={<CustomerLogin />} />
  <Route path="customer/forgot-password" element={<ForgotPassword />} />
  <Route path="customer/verify-email" element={<VerifyOtp mode="email" />} />
  <Route path="customer/verify-mobile" element={<VerifyOtp mode="mobile" />} />

  {/* Short Aliases */}
  <Route path="login" element={<Navigate to="/customer/login" replace />} />
  <Route path="register" element={<Navigate to="/customer/register" replace />} />

  {/* Customer Routes - Protected */}
  <Route
    path="cart"
    element={
      <ProtectedRoute>
        <Cart />
      </ProtectedRoute>
    }
  />
  <Route
    path="checkout"
    element={
      <ProtectedRoute>
        <Checkout />
      </ProtectedRoute>
    }
  />
  <Route
    path="orders"
    element={
      <ProtectedRoute>
        <Orders />
      </ProtectedRoute>
    }
  />
  <Route
    path="orders/:orderId"
    element={
      <ProtectedRoute>
        <OrderDetail />
      </ProtectedRoute>
    }
  />
  <Route
    path="customer/profile"
    element={
      <ProtectedRoute>
        <CustomerProfile />
      </ProtectedRoute>
    }
  />
  <Route
    path="customer/addresses"
    element={
      <ProtectedRoute>
        <CustomerAddresses />
      </ProtectedRoute>
    }
  />
</Route>
```

### Route Protection

**Public Routes**: No authentication required
- Landing page, product detail, login/register pages

**Protected Routes**: Authentication required
- Cart, checkout, orders, profile, addresses

**Role-Based Routes**: Specific role required
- Seller dashboard (seller role)
- Admin dashboard (admin role)

---

## Component Props

### Common Props Patterns

#### Loading States
Most components accept `isLoading` prop:
```javascript
{isLoading ? <Skeleton /> : <Content />}
```

#### Error Handling
Components handle errors via:
- Error states in RTK Query hooks
- Error props passed to views
- Toast notifications

#### Callback Props
Follow naming convention:
- `on[Action]`: Event handlers (e.g., `onClick`, `onChange`)
- `handle[Action]`: Internal handlers in containers

#### Data Props
- Arrays default to `[]`
- Objects default to `null` or `{}`
- Always use optional chaining for nested access

---

## API Base Configuration

**Base URL**: `http://localhost:8080/api`

**Token Injection**: Automatic via `prepareHeaders` in RTK Query

**Token Refresh**: Automatic retry on 401 errors

**Response Transformers**: Located in `src/store/parsers/`

---

## Best Practices

1. **Container/Presentational Pattern**: Separate logic from UI
2. **RTK Query Hooks**: Use generated hooks for all API calls
3. **Error Handling**: Handle errors at container level
4. **Loading States**: Show loading indicators during API calls
5. **Form Validation**: Validate at container level before API calls
6. **State Management**: Use Redux for global state, local state for UI
7. **Component Reusability**: Create reusable presentational components
8. **Type Safety**: Use consistent prop structures

---

This reference provides a complete overview of the frontend component architecture and API integration patterns.
