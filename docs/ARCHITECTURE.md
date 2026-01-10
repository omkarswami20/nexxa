# NexaShop Frontend Architecture

## Overview

NexaShop frontend is a **React 19** application built with **Vite**, using **Redux Toolkit** for state management, **RTK Query** for API integration, **Material-UI** for UI components, and **React Router v7** for routing. The application follows a **Container/Presentational** pattern for component organization.

---

## Architecture Pattern: Container/Presentational

The application uses a **Container/Presentational** pattern (also known as Smart/Dumb components):

```
┌─────────────────────────────────────────┐
│            Page Component               │
│  (Route Entry Point)                    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Container Component             │
│  (Smart Component)                      │
│  - Business Logic                        │
│  - API Calls (RTK Query)                 │
│  - State Management                      │
│  - Event Handlers                        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Presentational Component           │
│  (Dumb Component)                       │
│  - UI Rendering                          │
│  - Props-based                           │
│  - No Business Logic                     │
└─────────────────────────────────────────┘
```

### Example Flow

```javascript
// Page: Cart.jsx
const Cart = () => {
    return <CartContainer />;
};

// Container: CartContainer.jsx
const CartContainer = () => {
    const { data: items } = useGetCartQuery();
    const [setQty] = useSetCartItemQuantityMutation();
    
    const handleInc = async (id, qty) => {
        await setQty({ productId: id, quantity: qty + 1 });
    };
    
    return (
        <CartView
            items={items}
            onIncrease={handleInc}
            // ... other props
        />
    );
};

// Presentational: CartView.jsx
const CartView = ({ items, onIncrease, ... }) => {
    return (
        <Box>
            {items.map(item => (
                <Card>
                    <Button onClick={() => onIncrease(item.id, item.quantity)}>
                        Increase
                    </Button>
                </Card>
            ))}
        </Box>
    );
};
```

### Benefits

1. **Separation of Concerns**: Logic separated from UI
2. **Reusability**: Presentational components can be reused
3. **Testability**: Easy to test logic and UI separately
4. **Maintainability**: Clear structure and responsibilities

---

## Folder Structure

```
nexafront/
├── src/
│   ├── components/          # Presentational components
│   │   ├── common/          # Shared components
│   │   ├── customer/        # Customer-specific components
│   │   ├── seller/          # Seller-specific components
│   │   ├── admin/           # Admin-specific components
│   │   └── layouts/         # Layout components
│   ├── containers/          # Container components
│   │   ├── customer/         # Customer containers
│   │   ├── seller/           # Seller containers
│   │   ├── admin/            # Admin containers
│   │   └── public/           # Public containers
│   ├── pages/                # Page components (route entries)
│   ├── store/                # Redux store
│   │   ├── api/              # RTK Query API slice
│   │   ├── slices/            # Redux slices
│   │   └── parsers/          # Response transformers
│   ├── theme/                # Material-UI theme
│   ├── utils/                # Utility functions
│   ├── App.jsx               # Router configuration
│   └── main.jsx              # Application entry point
├── public/                   # Static assets
└── package.json
```

### Organization Principles

1. **Feature-Based**: Components organized by feature (customer, seller, admin)
2. **Layer Separation**: Clear separation between pages, containers, and components
3. **Shared Components**: Common components in `components/common/`
4. **State Management**: Centralized in `store/` directory

---

## State Management Architecture

### Redux Toolkit + RTK Query

The application uses **Redux Toolkit** for global state and **RTK Query** for API integration.

```
┌─────────────────────────────────────────┐
│         Redux Store                      │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      RTK Query API Slice           │ │
│  │  - API endpoints                   │ │
│  │  - Automatic caching                │ │
│  │  - Request/response handling        │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      Redux Slices                    │ │
│  │  - auth.slice.js                    │ │
│  │  - product.slice.js                  │ │
│  │  - category.slice.js                 │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Store Configuration

```javascript
// store/index.js
export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,  // RTK Query
        auth: authReducer,
        product: productReducer,
        category: categoryReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
});
```

### RTK Query API Slice

**Location**: `store/api/api.apislice.js`

**Features**:
- Centralized API configuration
- Automatic token injection
- Token refresh on 401 errors
- Response transformation
- Cache management with tags

**Base Query Configuration**:
```javascript
const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:8080/api',
    prepareHeaders: (headers, { getState }) => {
        const token = getState()?.auth?.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});
```

**Token Refresh Logic**:
```javascript
const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    
    if (result?.error?.status === 401) {
        // Try to refresh token
        const refreshResult = await baseQuery(
            { url: '/auth/refresh-token', method: 'POST', body: { refreshToken } },
            api,
            extraOptions
        );
        
        if (refreshResult?.data) {
            // Update token and retry original request
            api.dispatch(setCredentials({ ... }));
            result = await baseQuery(args, api, extraOptions);
        } else {
            // Logout if refresh fails
            api.dispatch(logout());
        }
    }
    
    return result;
};
```

### Redux Slices

#### Auth Slice
- **Purpose**: Authentication state
- **State**: `{ user, token, refreshToken, role }`
- **Persistence**: Token stored in `localStorage`

#### Product Slice
- **Purpose**: Product filters, pagination, selected product
- **State**: `{ selectedProduct, filters, sortBy, pagination }`

#### Category Slice
- **Purpose**: Category management
- **State**: `{ categories, selectedCategory }`

---

## Component Hierarchy

### Three-Layer Architecture

```
┌─────────────────────────────────────────┐
│         Layer 1: Pages                   │
│  - Route entry points                    │
│  - Minimal logic                        │
│  - Render containers                     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Layer 2: Containers              │
│  - Business logic                        │
│  - API calls                             │
│  - State management                      │
│  - Event handlers                        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Layer 3: Components              │
│  - UI rendering                          │
│  - Props-based                           │
│  - Reusable                               │
└─────────────────────────────────────────┘
```

### Component Types

1. **Pages**: Route components that render containers
2. **Containers**: Smart components with logic
3. **Presentational**: Dumb components for UI
4. **Layout**: Shared layout components (Layout, ProtectedRoute)

---

## Routing Architecture

### React Router v7

**Router Configuration**:
```javascript
const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />}>
            {/* Routes */}
        </Route>
    )
);
```

### Route Types

1. **Public Routes**: No authentication required
   - Landing page, product detail, login/register

2. **Protected Routes**: Authentication required
   - Cart, checkout, orders, profile

3. **Role-Based Routes**: Specific role required
   - Seller dashboard (seller role)
   - Admin dashboard (admin role)

### Protected Route Implementation

```javascript
const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = useSelector(selectCurrentToken);
    const role = useSelector(selectCurrentRole);
    
    if (!token) {
        return <Navigate to="/" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};
```

---

## API Integration Pattern

### RTK Query Hooks

**Query Hooks** (Data Fetching):
```javascript
const { data, isLoading, error } = useGetCartQuery();
```

**Mutation Hooks** (Data Modification):
```javascript
const [addToCart, { isLoading, error }] = useSetCartItemQuantityMutation();

// Usage
await addToCart({ productId: 1, quantity: 2 }).unwrap();
```

### Response Transformation

**Parsers**: Transform API responses to frontend format
- Location: `store/parsers/`
- Functions: `transformProductResponse`, `transformCartResponse`, etc.

**Example**:
```javascript
export const transformProductResponse = (response) => {
    return {
        ...response,
        price: parseFloat(response?.price) || 0,
        imageUrl: response?.imageUrl || '',
        // Normalize data structure
    };
};
```

### Cache Management

**Tags**: Invalidate cache on mutations
```javascript
getCart: builder.query({
    query: () => '/cart',
    providesTags: ['CartItem'],
}),

setCartItemQuantity: builder.mutation({
    query: (data) => ({ url: '/cart/items', method: 'PUT', body: data }),
    invalidatesTags: ['CartItem'],  // Refetch cart
}),
```

---

## UI Architecture

### Material-UI (MUI)

**Theme Configuration**:
- Location: `theme/theme.js`
- Custom theme with dark mode support
- Consistent color palette and typography

**Component Usage**:
- MUI components for consistent UI
- Custom styling with `sx` prop
- Responsive design with breakpoints

### Framer Motion

**Animations**: Used for smooth transitions
- Page transitions
- Component animations
- Loading states

**Example**:
```javascript
import { motion } from 'framer-motion';

<MotionBox
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
>
    Content
</MotionBox>
```

---

## Build & Deployment

### Vite Build System

**Configuration**: `vite.config.js`
```javascript
export default defineConfig({
    plugins: [react()],
});
```

**Build Process**:
1. **Development**: `npm run dev` - Vite dev server with HMR
2. **Production**: `npm run build` - Optimized production build
3. **Preview**: `npm run preview` - Preview production build

**Optimizations**:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

### Environment Configuration

**API Base URL**: Configured in RTK Query base query
- Development: `http://localhost:8080/api`
- Production: Set via environment variables

---

## Data Flow

### Component Data Flow

```
User Action
    ↓
Container Event Handler
    ↓
RTK Query Mutation/Query
    ↓
API Request (with token)
    ↓
Backend API
    ↓
Response
    ↓
Parser (transform)
    ↓
Redux Store Update
    ↓
Component Re-render
```

### State Update Flow

```
Action Dispatch
    ↓
Redux Reducer
    ↓
Store Update
    ↓
Component Subscription (useSelector)
    ↓
Component Re-render
```

---

## Performance Optimizations

### Code Splitting

**Lazy Loading**: Load components on demand
```javascript
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));

<Suspense fallback={<Loading />}>
    <SellerDashboard />
</Suspense>
```

### Memoization

**useMemo**: Memoize expensive calculations
```javascript
const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}, [items]);
```

**React.memo**: Prevent unnecessary re-renders
```javascript
export default React.memo(CartView);
```

### RTK Query Caching

- Automatic caching of query results
- Cache invalidation on mutations
- Refetch on window focus (configurable)

---

## Security

### Authentication

1. **Token Storage**: JWT stored in `localStorage`
2. **Token Injection**: Automatic via RTK Query headers
3. **Token Refresh**: Automatic on 401 errors
4. **Route Protection**: ProtectedRoute component

### Best Practices

1. **No Sensitive Data in State**: Only store necessary data
2. **HTTPS in Production**: Always use HTTPS
3. **Token Expiration**: Handle token expiration gracefully
4. **XSS Prevention**: React's built-in XSS protection

---

## Testing Strategy

### Component Testing

**Unit Tests**: Test individual components
- Presentational components (props-based)
- Container components (with mocks)

**Integration Tests**: Test component interactions
- Container + Presentational
- API integration

### State Testing

**Redux Testing**: Test reducers and actions
- Slice reducers
- Selectors

**RTK Query Testing**: Test API hooks
- Mock API responses
- Test error handling

---

## Development Workflow

### Component Development

1. **Create Page**: Route entry point
2. **Create Container**: Business logic
3. **Create Presentational**: UI component
4. **Connect**: Wire up props and handlers

### State Management

1. **Define Slice**: Create Redux slice if needed
2. **Add to Store**: Register reducer
3. **Use in Container**: Dispatch actions, select state

### API Integration

1. **Add Endpoint**: Add to RTK Query API slice
2. **Create Parser**: Transform response if needed
3. **Use Hook**: Use generated hook in container

---

## Summary

- **Architecture**: Container/Presentational pattern
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router v7 with protected routes
- **UI**: Material-UI with custom theme
- **Build**: Vite for fast development and optimized builds
- **Patterns**: Separation of concerns, reusability, testability

This architecture provides a scalable, maintainable, and performant frontend application structure.
