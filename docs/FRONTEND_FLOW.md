# NexaShop Frontend Flow Documentation

This document describes the component flows, API request flows, state management flows, and user interaction flows in the NexaShop React frontend application.

---

## Table of Contents

1. [Component Rendering Flow](#component-rendering-flow)
2. [Authentication Flow](#authentication-flow)
3. [API Request Flow](#api-request-flow)
4. [Token Refresh Flow](#token-refresh-flow)
5. [Cart Management Flow](#cart-management-flow)
6. [Product Browsing Flow](#product-browsing-flow)
7. [Checkout Flow](#checkout-flow)
8. [State Update Flow](#state-update-flow)
9. [Route Navigation Flow](#route-navigation-flow)

---

## Component Rendering Flow

### React Component Lifecycle

```mermaid
sequenceDiagram
    participant User
    participant Router
    participant Page
    participant Container
    participant Component
    participant RTKQuery
    participant ReduxStore

    User->>Router: Navigate to Route
    Router->>Page: Render Page Component
    Page->>Container: Render Container
    Container->>RTKQuery: useQuery/useMutation Hook
    RTKQuery->>ReduxStore: Check Cache
    alt Cache Hit
        ReduxStore-->>RTKQuery: Return Cached Data
        RTKQuery-->>Container: Data Available
    else Cache Miss
        RTKQuery->>RTKQuery: Make API Request
        RTKQuery-->>Container: Loading State
        RTKQuery-->>Container: Data/Error
    end
    Container->>Component: Pass Props (data, handlers)
    Component->>User: Render UI
```

### Component Hierarchy Rendering

```
User Action / Route Change
    ↓
React Router
    ↓
Page Component (Route Entry)
    ↓
Container Component
    ├─ RTK Query Hook (fetch data)
    ├─ Redux Selector (get state)
    ├─ Event Handlers (user actions)
    └─ State Management
    ↓
Presentational Component
    ├─ Receives Props
    ├─ Renders UI
    └─ Calls Callbacks
    ↓
User Sees UI
```

---

## Authentication Flow

### Login Flow

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant LoginContainer
    participant LoginView
    participant RTKQuery
    participant BackendAPI
    participant ReduxStore
    participant LocalStorage

    User->>LoginView: Enter Credentials & Submit
    LoginView->>LoginContainer: Call onSubmit Handler
    LoginContainer->>RTKQuery: useLoginMutation()
    RTKQuery->>BackendAPI: POST /api/v1/auth/login/customer
    BackendAPI-->>RTKQuery: { token, refreshToken, email, role }
    RTKQuery->>ReduxStore: Dispatch setCredentials
    ReduxStore->>LocalStorage: Save token, refreshToken, role
    ReduxStore->>ReduxStore: Update auth state
    LoginContainer->>LoginContainer: Navigate to Dashboard
    LoginContainer-->>User: Redirect to Dashboard
```

### Token Storage and Retrieval

```mermaid
sequenceDiagram
    participant Component
    participant ReduxStore
    participant LocalStorage
    participant RTKQuery

    Note over Component,RTKQuery: On App Load
    Component->>ReduxStore: Initialize from localStorage
    ReduxStore->>LocalStorage: Get token, refreshToken, role
    LocalStorage-->>ReduxStore: Return stored values
    ReduxStore->>ReduxStore: Set initial state

    Note over Component,RTKQuery: On API Request
    Component->>RTKQuery: useQuery/useMutation
    RTKQuery->>ReduxStore: Get token via selector
    ReduxStore-->>RTKQuery: Return token
    RTKQuery->>RTKQuery: Inject token in headers
    RTKQuery->>BackendAPI: Request with Authorization header
```

### Logout Flow

```mermaid
sequenceDiagram
    participant User
    participant Layout
    participant ReduxStore
    participant LocalStorage
    participant Router

    User->>Layout: Click Logout
    Layout->>ReduxStore: Dispatch logout()
    ReduxStore->>ReduxStore: Clear auth state
    ReduxStore->>LocalStorage: Remove token, refreshToken, role
    ReduxStore->>Router: Navigate to Home
    Router-->>User: Redirect to Landing Page
```

---

## API Request Flow

### RTK Query Request Flow

```mermaid
sequenceDiagram
    participant Component
    participant RTKQueryHook
    participant BaseQuery
    participant TokenInjector
    participant BackendAPI
    participant Parser
    participant ReduxCache

    Component->>RTKQueryHook: useGetCartQuery()
    RTKQueryHook->>ReduxCache: Check cache
    alt Cache Valid
        ReduxCache-->>RTKQueryHook: Return cached data
        RTKQueryHook-->>Component: { data, isLoading: false }
    else Cache Invalid/Missing
        RTKQueryHook->>BaseQuery: Execute query
        BaseQuery->>TokenInjector: prepareHeaders()
        TokenInjector->>ReduxStore: Get token
        ReduxStore-->>TokenInjector: Return token
        TokenInjector->>BaseQuery: Add Authorization header
        BaseQuery->>BackendAPI: GET /api/v1/cart
        BackendAPI-->>BaseQuery: Response data
        BaseQuery->>Parser: transformResponse()
        Parser-->>BaseQuery: Transformed data
        BaseQuery->>ReduxCache: Store in cache
        BaseQuery-->>RTKQueryHook: Return data
        RTKQueryHook-->>Component: { data, isLoading: false }
    end
```

### Mutation Flow

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Container
    participant RTKQueryHook
    participant BackendAPI
    participant ReduxCache
    participant Component2

    User->>Component: Click "Add to Cart"
    Component->>Container: Call onAddToCart handler
    Container->>RTKQueryHook: useSetCartItemQuantityMutation()
    RTKQueryHook->>RTKQueryHook: Set isLoading: true
    RTKQueryHook->>BackendAPI: PUT /api/v1/cart/items
    BackendAPI-->>RTKQueryHook: Success Response
    RTKQueryHook->>ReduxCache: Invalidate 'CartItem' tags
    ReduxCache->>ReduxCache: Clear related cache
    RTKQueryHook->>Component2: Refetch useGetCartQuery (if subscribed)
    RTKQueryHook-->>Container: { isLoading: false, isSuccess: true }
    Container->>Component: Update UI (show success)
```

---

## Token Refresh Flow

### Automatic Token Refresh on 401

```mermaid
sequenceDiagram
    participant Component
    participant RTKQuery
    participant BackendAPI
    participant RefreshLogic
    participant ReduxStore
    participant LocalStorage

    Component->>RTKQuery: API Request with expired token
    RTKQuery->>BackendAPI: Request with Authorization header
    BackendAPI-->>RTKQuery: 401 Unauthorized
    RTKQuery->>RefreshLogic: Detect 401 error
    RefreshLogic->>ReduxStore: Get refreshToken
    ReduxStore-->>RefreshLogic: Return refreshToken
    RefreshLogic->>BackendAPI: POST /api/v1/auth/refresh-token
    BackendAPI-->>RefreshLogic: { accessToken, refreshToken }
    RefreshLogic->>ReduxStore: Dispatch setCredentials
    ReduxStore->>LocalStorage: Update tokens
    RefreshLogic->>RTKQuery: Retry original request
    RTKQuery->>BackendAPI: Request with new token
    BackendAPI-->>RTKQuery: 200 OK + Data
    RTKQuery-->>Component: Return data
```

### Token Refresh Failure

```mermaid
sequenceDiagram
    participant Component
    participant RTKQuery
    participant BackendAPI
    participant RefreshLogic
    participant ReduxStore
    participant Router

    Component->>RTKQuery: API Request
    RTKQuery->>BackendAPI: Request
    BackendAPI-->>RTKQuery: 401 Unauthorized
    RTKQuery->>RefreshLogic: Try refresh
    RefreshLogic->>BackendAPI: POST /auth/refresh-token
    BackendAPI-->>RefreshLogic: 400 Bad Request (invalid refresh token)
    RefreshLogic->>ReduxStore: Dispatch logout()
    ReduxStore->>ReduxStore: Clear auth state
    ReduxStore->>Router: Navigate to Home
    Router-->>Component: Redirect to Landing Page
```

---

## Cart Management Flow

### Add to Cart Flow

```mermaid
sequenceDiagram
    participant User
    participant ProductDetailView
    participant ProductDetailContainer
    participant RTKQuery
    participant BackendAPI
    participant ReduxCache
    participant CartView

    User->>ProductDetailView: Click "Add to Cart"
    ProductDetailView->>ProductDetailContainer: Call onAddToCart(quantity)
    ProductDetailContainer->>RTKQuery: useSetCartItemQuantityMutation()
    RTKQuery->>RTKQuery: Set isLoading: true
    RTKQuery->>BackendAPI: PUT /api/v1/cart/items
    Note over RTKQuery,BackendAPI: { productId, quantity }
    BackendAPI-->>RTKQuery: Success Response
    RTKQuery->>ReduxCache: Invalidate 'CartItem' tags
    ReduxCache->>CartView: Trigger refetch (if mounted)
    RTKQuery-->>ProductDetailContainer: { isSuccess: true }
    ProductDetailContainer->>ProductDetailView: Show success message
    ProductDetailView-->>User: Display "Added to Cart"
```

### Update Cart Quantity Flow

```mermaid
sequenceDiagram
    participant User
    participant CartView
    participant CartContainer
    participant RTKQuery
    participant BackendAPI
    participant ReduxCache

    User->>CartView: Click "+" or "-" button
    CartView->>CartContainer: Call onIncrease/onDecrease
    CartContainer->>RTKQuery: useSetCartItemQuantityMutation()
    RTKQuery->>BackendAPI: PUT /api/v1/cart/items
    Note over RTKQuery,BackendAPI: { productId, quantity: newQty }
    BackendAPI-->>RTKQuery: Updated CartItem
    RTKQuery->>ReduxCache: Invalidate 'CartItem' tags
    ReduxCache->>CartContainer: Trigger useGetCartQuery refetch
    CartContainer->>CartView: Updated items prop
    CartView-->>User: Updated quantity displayed
```

### Remove from Cart Flow

```mermaid
sequenceDiagram
    participant User
    participant CartView
    participant CartContainer
    participant RTKQuery
    participant BackendAPI
    participant ReduxCache

    User->>CartView: Click "Remove" button
    CartView->>CartContainer: Call onRemove(productId)
    CartContainer->>RTKQuery: useRemoveCartItemMutation(productId)
    RTKQuery->>BackendAPI: DELETE /api/v1/cart/items/{productId}
    BackendAPI-->>RTKQuery: Success Response
    RTKQuery->>ReduxCache: Invalidate 'CartItem' tags
    ReduxCache->>CartContainer: Trigger useGetCartQuery refetch
    CartContainer->>CartView: Updated items (item removed)
    CartView-->>User: Item removed from UI
```

---

## Product Browsing Flow

### Product List Flow

```mermaid
sequenceDiagram
    participant User
    participant LandingPage
    participant LandingPageContainer
    participant ProductBrowsingView
    participant RTKQuery
    participant BackendAPI
    participant ReduxCache

    User->>LandingPage: Navigate to Home
    LandingPage->>LandingPageContainer: Render
    LandingPageContainer->>RTKQuery: useGetAllProductsQuery()
    RTKQuery->>ReduxCache: Check cache
    alt Cache Hit
        ReduxCache-->>RTKQuery: Return cached products
    else Cache Miss
        RTKQuery->>BackendAPI: GET /api/v1/products
        BackendAPI-->>RTKQuery: Products array
        RTKQuery->>ReduxCache: Store in cache
    end
    RTKQuery-->>LandingPageContainer: { data: products, isLoading }
    LandingPageContainer->>ProductBrowsingView: Pass products prop
    ProductBrowsingView-->>User: Display product grid
```

### Product Filter Flow

```mermaid
sequenceDiagram
    participant User
    participant ProductBrowsingView
    participant LandingPageContainer
    participant RTKQuery
    participant BackendAPI

    User->>ProductBrowsingView: Select Category Filter
    ProductBrowsingView->>LandingPageContainer: Call onFilterChange('category', value)
    LandingPageContainer->>RTKQuery: useGetAllProductsQuery({ category: value })
    RTKQuery->>BackendAPI: GET /api/v1/products?category=Electronics
    BackendAPI-->>RTKQuery: Filtered products
    RTKQuery-->>LandingPageContainer: { data: filteredProducts }
    LandingPageContainer->>ProductBrowsingView: Updated products prop
    ProductBrowsingView-->>User: Display filtered products
```

### Product Detail Flow

```mermaid
sequenceDiagram
    participant User
    participant ProductCard
    participant Router
    participant ProductDetailPage
    participant ProductDetailContainer
    participant RTKQuery
    participant BackendAPI

    User->>ProductCard: Click Product Card
    ProductCard->>Router: Navigate to /products/:id
    Router->>ProductDetailPage: Render
    ProductDetailPage->>ProductDetailContainer: Render
    ProductDetailContainer->>Router: Get product ID from params
    ProductDetailContainer->>RTKQuery: useGetProductByIdQuery(id)
    RTKQuery->>BackendAPI: GET /api/v1/products/{id}
    BackendAPI-->>RTKQuery: Product details
    RTKQuery-->>ProductDetailContainer: { data: product, isLoading }
    ProductDetailContainer->>ProductDetailView: Pass product prop
    ProductDetailView-->>User: Display product details
```

---

## Checkout Flow

### Complete Checkout Process

```mermaid
sequenceDiagram
    participant User
    participant CheckoutView
    participant CheckoutContainer
    participant RTKQuery
    participant BackendAPI
    participant Router
    participant ReduxCache

    User->>CheckoutView: Fill Address & Click "Place Order"
    CheckoutView->>CheckoutContainer: Call onCheckout handler
    CheckoutContainer->>CheckoutContainer: Validate form
    alt Validation Failed
        CheckoutContainer->>CheckoutView: Show validation error
    else Validation Passed
        CheckoutContainer->>RTKQuery: useCheckoutMutation()
        RTKQuery->>RTKQuery: Set isLoading: true
        RTKQuery->>BackendAPI: POST /api/v1/orders/checkout
        Note over RTKQuery,BackendAPI: { addressId or address }
        BackendAPI-->>RTKQuery: Order created
        RTKQuery->>ReduxCache: Invalidate 'CartItem', 'Order' tags
        ReduxCache->>ReduxCache: Clear cart cache
        RTKQuery-->>CheckoutContainer: { data: order, isSuccess: true }
        CheckoutContainer->>Router: Navigate to /orders/{orderId}
        Router-->>User: Show order confirmation
    end
```

### Address Selection Flow

```mermaid
sequenceDiagram
    participant User
    participant CheckoutView
    participant CheckoutContainer
    participant RTKQuery

    User->>CheckoutView: Select "Use Saved Address"
    CheckoutView->>CheckoutContainer: Call onAddressChange(addressId)
    CheckoutContainer->>CheckoutContainer: Set selectedAddressId
    CheckoutContainer->>CheckoutView: Update UI (show selected address)

    alt User Selects "New Address"
        User->>CheckoutView: Select "New Address"
        CheckoutView->>CheckoutContainer: Call onAddressChange('new')
        CheckoutContainer->>CheckoutContainer: Set useNewAddress: true
        CheckoutContainer->>CheckoutView: Show address form
    end
```

### Zip Code Lookup Flow

```mermaid
sequenceDiagram
    participant User
    participant CheckoutView
    participant CheckoutContainer
    participant RTKQuery
    participant ZipCodeAPI

    User->>CheckoutView: Enter Zip Code & Blur
    CheckoutView->>CheckoutContainer: Call onZipCodeBlur(zip)
    CheckoutContainer->>CheckoutContainer: Set zipCodeLookup state
    CheckoutContainer->>RTKQuery: useGetZipCodeInfoQuery({ zip, country })
    RTKQuery->>ZipCodeAPI: GET /api/v1/zipcode?zip=10001
    ZipCodeAPI-->>RTKQuery: { city, state, country }
    RTKQuery-->>CheckoutContainer: Zip code data
    CheckoutContainer->>CheckoutContainer: Auto-fill city, state, country
    CheckoutContainer->>CheckoutView: Updated address form
    CheckoutView-->>User: Auto-filled address fields
```

---

## State Update Flow

### Redux State Update

```mermaid
sequenceDiagram
    participant Component
    participant Container
    participant ReduxAction
    participant ReduxReducer
    participant ReduxStore
    participant Component2

    Component->>Container: User Action
    Container->>ReduxAction: Dispatch action
    ReduxAction->>ReduxReducer: Action received
    ReduxReducer->>ReduxReducer: Update state (immutable)
    ReduxReducer->>ReduxStore: New state
    ReduxStore->>ReduxStore: Update store
    ReduxStore->>Component2: Notify subscribers (useSelector)
    Component2->>Component2: Re-render with new state
```

### RTK Query Cache Update

```mermaid
sequenceDiagram
    participant Component
    participant Mutation
    participant BackendAPI
    participant RTKQuery
    participant ReduxCache
    component Component2

    Component->>Mutation: useMutation().trigger()
    Mutation->>BackendAPI: API Request
    BackendAPI-->>Mutation: Success Response
    Mutation->>RTKQuery: invalidatesTags(['CartItem'])
    RTKQuery->>ReduxCache: Invalidate cache
    ReduxCache->>ReduxCache: Clear related cache entries
    ReduxCache->>Component2: Trigger refetch (if subscribed)
    Component2->>BackendAPI: Refetch query
    BackendAPI-->>Component2: Fresh data
    Component2-->>Component2: Update UI
```

---

## Route Navigation Flow

### Protected Route Flow

```mermaid
sequenceDiagram
    participant User
    participant Router
    participant ProtectedRoute
    participant ReduxStore
    participant Page

    User->>Router: Navigate to /cart
    Router->>ProtectedRoute: Render ProtectedRoute
    ProtectedRoute->>ReduxStore: useSelector(selectCurrentToken)
    ReduxStore-->>ProtectedRoute: Return token
    alt Token Exists
        ProtectedRoute->>ReduxStore: useSelector(selectCurrentRole)
        ReduxStore-->>ProtectedRoute: Return role
        alt Role Check Passed
            ProtectedRoute->>Page: Render children (Cart page)
            Page-->>User: Display Cart
        else Role Check Failed
            ProtectedRoute->>Router: Navigate to /
            Router-->>User: Redirect to Home
        end
    else No Token
        ProtectedRoute->>Router: Navigate to /
        Router-->>User: Redirect to Home
    end
```

### Navigation After Login

```mermaid
sequenceDiagram
    participant User
    participant LoginContainer
    participant RTKQuery
    participant ReduxStore
    participant Router

    User->>LoginContainer: Submit Login Form
    LoginContainer->>RTKQuery: useLoginMutation()
    RTKQuery-->>LoginContainer: { isSuccess: true, data }
    LoginContainer->>ReduxStore: Dispatch setCredentials
    ReduxStore->>ReduxStore: Update auth state
    LoginContainer->>Router: Navigate based on role
    alt Role is 'customer'
        Router->>Router: Navigate to /cart or /
    else Role is 'seller'
        Router->>Router: Navigate to /seller/dashboard
    else Role is 'admin'
        Router->>Router: Navigate to /admin/dashboard
    end
    Router-->>User: Display appropriate dashboard
```

---

## Error Handling Flow

### API Error Handling

```mermaid
sequenceDiagram
    participant Component
    participant Container
    participant RTKQuery
    participant BackendAPI
    participant ErrorHandler

    Component->>Container: User Action
    Container->>RTKQuery: useMutation()
    RTKQuery->>BackendAPI: API Request
    BackendAPI-->>RTKQuery: Error Response (400/500)
    RTKQuery-->>Container: { error, isError: true }
    Container->>ErrorHandler: Handle error
    ErrorHandler->>ErrorHandler: Extract error message
    ErrorHandler->>Component: Show error (Toast/Alert)
    Component-->>User: Display error message
```

### Network Error Handling

```mermaid
sequenceDiagram
    participant Component
    participant RTKQuery
    participant Network
    participant ErrorHandler

    Component->>RTKQuery: API Request
    RTKQuery->>Network: Send request
    Network-->>RTKQuery: Network Error (timeout/offline)
    RTKQuery-->>Component: { error: 'Network Error', isError: true }
    Component->>ErrorHandler: Handle network error
    ErrorHandler->>Component: Show "Network Error" message
    Component-->>User: Display error notification
```

---

## Summary

The frontend flow follows these key patterns:

1. **Component Rendering**: Page → Container → Presentational
2. **API Requests**: RTK Query hooks with automatic caching
3. **State Management**: Redux for global state, local state for UI
4. **Authentication**: Token-based with automatic refresh
5. **Error Handling**: Centralized error handling in containers
6. **Navigation**: React Router with protected routes
7. **Cache Management**: Automatic cache invalidation on mutations

All flows are designed for optimal user experience, performance, and maintainability.
