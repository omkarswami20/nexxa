# NexaShop Frontend - Interview Questions & Answers

Comprehensive Q&A guide for technical interviews covering the NexaShop React frontend implementation.

---

## Table of Contents

1. [React & Hooks](#react--hooks)
2. [State Management (Redux)](#state-management-redux)
3. [RTK Query & API Integration](#rtk-query--api-integration)
4. [Routing & Navigation](#routing--navigation)
5. [Component Architecture](#component-architecture)
6. [UI/UX & Material-UI](#uiux--material-ui)
7. [Performance Optimization](#performance-optimization)
8. [E-commerce Frontend](#e-commerce-frontend)
9. [Error Handling & Best Practices](#error-handling--best-practices)
10. [Testing & Debugging](#testing--debugging)

---

## React & Hooks

### Q1: What React version is used and what are the key features?

**Answer:**
NexaShop uses **React 19.2.0**, which includes:

1. **Concurrent Features**: Improved rendering performance
2. **Automatic Batching**: Multiple state updates batched automatically
3. **Suspense**: Better loading states and code splitting
4. **Hooks**: Functional components with hooks for state and lifecycle

**Key Hooks Used:**
- `useState`: Local component state
- `useEffect`: Side effects and lifecycle
- `useMemo`: Memoize expensive calculations
- `useCallback`: Memoize functions
- `useSelector`: Redux state selection
- `useDispatch`: Redux action dispatch

### Q2: Explain the Container/Presentational pattern used in NexaShop.

**Answer:**
**Container/Presentational Pattern** (Smart/Dumb components):

**Container Components** (Smart):
- Handle business logic
- Make API calls (RTK Query)
- Manage state (Redux/local)
- Handle events
- Pass data and handlers to presentational components

**Presentational Components** (Dumb):
- Receive props
- Render UI
- No business logic
- Reusable and testable

**Example**:
```javascript
// Container: CartContainer.jsx
const CartContainer = () => {
    const { data: items } = useGetCartQuery();
    const [setQty] = useSetCartItemQuantityMutation();
    
    const handleInc = async (id, qty) => {
        await setQty({ productId: id, quantity: qty + 1 });
    };
    
    return <CartView items={items} onIncrease={handleInc} />;
};

// Presentational: CartView.jsx
const CartView = ({ items, onIncrease }) => {
    return (
        <Box>
            {items.map(item => (
                <Button onClick={() => onIncrease(item.id, item.quantity)}>
                    Increase
                </Button>
            ))}
        </Box>
    );
};
```

**Benefits**:
- Separation of concerns
- Reusability
- Testability
- Maintainability

### Q3: How are React hooks used for performance optimization?

**Answer:**
**Performance Hooks**:

1. **useMemo**: Memoize expensive calculations
```javascript
const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
    );
}, [items]); // Only recalculate when items change
```

2. **useCallback**: Memoize functions
```javascript
const handleClick = useCallback((id) => {
    // Handler logic
}, [dependencies]); // Only recreate when dependencies change
```

3. **React.memo**: Prevent unnecessary re-renders
```javascript
export default React.memo(CartView);
```

**Benefits**:
- Prevents unnecessary re-renders
- Optimizes expensive calculations
- Improves performance

### Q4: Explain the component lifecycle in functional components.

**Answer:**
**Functional Component Lifecycle** (using hooks):

1. **Mount**: Component first renders
```javascript
useEffect(() => {
    // Component mounted
    // Fetch data, setup subscriptions
    return () => {
        // Cleanup on unmount
    };
}, []); // Empty dependency array = run once on mount
```

2. **Update**: Component re-renders
```javascript
useEffect(() => {
    // Runs on every render (if no dependencies)
    // Or when dependencies change
}, [dependency1, dependency2]);
```

3. **Unmount**: Component removed
```javascript
useEffect(() => {
    return () => {
        // Cleanup function
        // Remove event listeners, cancel requests
    };
}, []);
```

---

## State Management (Redux)

### Q5: Why is Redux Toolkit used instead of plain Redux?

**Answer:**
**Redux Toolkit** provides:

1. **Less Boilerplate**: Simplified action creators and reducers
2. **Immer Integration**: Mutate state directly (handles immutability)
3. **RTK Query**: Built-in API integration
4. **Better DX**: Better developer experience

**Example Comparison**:

**Plain Redux**:
```javascript
// Action
const SET_TOKEN = 'SET_TOKEN';
const setToken = (token) => ({ type: SET_TOKEN, payload: token });

// Reducer
const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_TOKEN:
            return { ...state, token: action.payload };
        default:
            return state;
    }
};
```

**Redux Toolkit**:
```javascript
// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setToken: (state, action) => {
            state.token = action.payload; // Immer handles immutability
        },
    },
});
```

### Q6: Explain the Redux store structure in NexaShop.

**Answer:**
**Store Structure**:

```javascript
{
    api: RTKQueryState,        // RTK Query cache
    auth: {
        user: null,
        token: string | null,
        refreshToken: string | null,
        role: 'customer' | 'seller' | 'admin' | null
    },
    product: {
        selectedProduct: Product | null,
        filters: { category, search, status },
        sortBy: string,
        pagination: { currentPage, pageSize }
    },
    category: {
        categories: Category[],
        selectedCategory: Category | null
    }
}
```

**Store Configuration**:
```javascript
export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        auth: authReducer,
        product: productReducer,
        category: categoryReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
});
```

### Q7: How is authentication state managed?

**Answer:**
**Auth Slice** manages authentication:

**State**:
```javascript
{
    user: null,
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    role: localStorage.getItem('role') || null
}
```

**Actions**:
- `setCredentials({ user, token, refreshToken, role })`: Set auth state
- `logout()`: Clear auth state

**Persistence**:
- Tokens stored in `localStorage`
- Restored on app load
- Cleared on logout

**Usage**:
```javascript
// Set credentials
dispatch(setCredentials({ token, refreshToken, role }));

// Logout
dispatch(logout());

// Select token
const token = useSelector(selectCurrentToken);
```

---

## RTK Query & API Integration

### Q8: What is RTK Query and why is it used?

**Answer:**
**RTK Query** is a data fetching and caching library built on Redux Toolkit.

**Benefits**:
1. **Automatic Caching**: Cache API responses automatically
2. **Cache Invalidation**: Invalidate cache on mutations
3. **Loading States**: Built-in loading/error states
4. **Auto Refetch**: Refetch on window focus, network reconnect
5. **Less Boilerplate**: No need for manual API state management

**Example**:
```javascript
// Define endpoint
getCart: builder.query({
    query: () => '/cart',
    providesTags: ['CartItem'],
}),

// Use hook
const { data, isLoading, error } = useGetCartQuery();
```

### Q9: How does automatic token injection work?

**Answer:**
**Token Injection** via `prepareHeaders`:

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

**Flow**:
1. RTK Query makes request
2. `prepareHeaders` called
3. Get token from Redux store
4. Add `Authorization: Bearer <token>` header
5. Send request with token

**Benefits**:
- Automatic token injection
- No manual header management
- Consistent across all requests

### Q10: Explain the token refresh mechanism.

**Answer:**
**Automatic Token Refresh** on 401 errors:

```javascript
const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    
    if (result?.error?.status === 401) {
        // Get refresh token
        const refreshToken = api.getState()?.auth?.refreshToken;
        
        if (refreshToken) {
            // Try to refresh
            const refreshResult = await baseQuery(
                { url: '/auth/refresh-token', method: 'POST', body: { refreshToken } },
                api,
                extraOptions
            );
            
            if (refreshResult?.data) {
                // Update token
                api.dispatch(setCredentials({
                    token: refreshResult.data.accessToken,
                    refreshToken: refreshResult.data.refreshToken,
                }));
                
                // Retry original request
                result = await baseQuery(args, api, extraOptions);
            } else {
                // Refresh failed, logout
                api.dispatch(logout());
            }
        }
    }
    
    return result;
};
```

**Flow**:
1. Request returns 401
2. Get refresh token from store
3. Call refresh endpoint
4. Update tokens in store
5. Retry original request
6. If refresh fails, logout user

### Q11: How is cache management handled?

**Answer:**
**Cache Management** with tags:

**Provide Tags** (mark data):
```javascript
getCart: builder.query({
    query: () => '/cart',
    providesTags: ['CartItem'], // Mark this data
}),
```

**Invalidate Tags** (clear cache):
```javascript
setCartItemQuantity: builder.mutation({
    query: (data) => ({ url: '/cart/items', method: 'PUT', body: data }),
    invalidatesTags: ['CartItem'], // Invalidate cart cache
}),
```

**Flow**:
1. Query provides tags
2. Mutation invalidates tags
3. RTK Query refetches queries with invalidated tags
4. UI updates with fresh data

**Benefits**:
- Automatic cache invalidation
- Fresh data after mutations
- No manual cache management

---

## Routing & Navigation

### Q12: How is React Router configured?

**Answer:**
**React Router v7** configuration:

```javascript
const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="products/:id" element={<ProductDetail />} />
            {/* Protected routes */}
            <Route
                path="cart"
                element={
                    <ProtectedRoute>
                        <Cart />
                    </ProtectedRoute>
                }
            />
        </Route>
    )
);
```

**Features**:
- Nested routes
- Route parameters (`:id`)
- Protected routes
- Layout components

### Q13: How does route protection work?

**Answer:**
**ProtectedRoute Component**:

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

**Usage**:
```javascript
// Require authentication
<ProtectedRoute>
    <Cart />
</ProtectedRoute>

// Require specific role
<ProtectedRoute allowedRoles={['seller']}>
    <SellerDashboard />
</ProtectedRoute>
```

**Flow**:
1. Check if token exists
2. If no token, redirect to home
3. Check role if `allowedRoles` specified
4. If role not allowed, redirect to home
5. Otherwise, render children

### Q14: How is navigation handled after login?

**Answer:**
**Role-Based Navigation**:

```javascript
const handleLogin = async (credentials) => {
    const result = await login(credentials).unwrap();
    
    // Set credentials in store
    dispatch(setCredentials(result));
    
    // Navigate based on role
    if (result.role === 'customer') {
        navigate('/cart');
    } else if (result.role === 'seller') {
        navigate('/seller/dashboard');
    } else if (result.role === 'admin') {
        navigate('/admin/dashboard');
    }
};
```

---

## Component Architecture

### Q15: Explain the folder structure and organization.

**Answer:**
**Folder Structure**:

```
src/
├── components/          # Presentational components
│   ├── common/         # Shared components
│   ├── customer/       # Customer-specific
│   ├── seller/         # Seller-specific
│   └── admin/          # Admin-specific
├── containers/         # Container components
│   ├── customer/
│   ├── seller/
│   └── admin/
├── pages/              # Page components (routes)
├── store/              # Redux store
│   ├── api/           # RTK Query
│   ├── slices/        # Redux slices
│   └── parsers/       # Response transformers
└── theme/              # Material-UI theme
```

**Organization Principles**:
- Feature-based organization
- Layer separation (pages, containers, components)
- Shared components in `common/`
- State management centralized

### Q16: How are props passed through component hierarchy?

**Answer:**
**Props Flow**:

```
Page Component
    ↓ (no props)
Container Component
    ├─ Fetch data (RTK Query)
    ├─ Get state (Redux selectors)
    ├─ Create handlers
    └─ Pass to presentational
        ↓ (props: data, handlers)
Presentational Component
    ├─ Receive props
    ├─ Render UI
    └─ Call callbacks
```

**Example**:
```javascript
// Container
const CartContainer = () => {
    const { data: items } = useGetCartQuery();
    const handleInc = async (id, qty) => { /* ... */ };
    
    return (
        <CartView
            items={items}        // Data prop
            onIncrease={handleInc}  // Handler prop
        />
    );
};

// Presentational
const CartView = ({ items, onIncrease }) => {
    return items.map(item => (
        <Button onClick={() => onIncrease(item.id, item.quantity)}>
            Increase
        </Button>
    ));
};
```

---

## UI/UX & Material-UI

### Q17: Why is Material-UI used?

**Answer:**
**Material-UI (MUI)** provides:

1. **Pre-built Components**: Buttons, cards, forms, etc.
2. **Consistent Design**: Material Design principles
3. **Responsive**: Built-in responsive breakpoints
4. **Theming**: Customizable theme system
5. **Accessibility**: ARIA attributes built-in

**Theme Configuration**:
```javascript
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#0ea5e9' },
        // Custom colors
    },
    typography: {
        // Custom typography
    },
});
```

### Q18: How is responsive design handled?

**Answer:**
**Responsive Design** with MUI breakpoints:

```javascript
<Box
    sx={{
        display: { xs: 'none', md: 'flex' },  // Hide on mobile, show on desktop
        flexDirection: { xs: 'column', md: 'row' },
        width: { xs: '100%', sm: '50%', md: '33%' },
    }}
>
    Content
</Box>
```

**Breakpoints**:
- `xs`: 0px (mobile)
- `sm`: 600px (tablet)
- `md`: 900px (desktop)
- `lg`: 1200px (large desktop)
- `xl`: 1536px (extra large)

### Q19: How are animations implemented?

**Answer:**
**Framer Motion** for animations:

```javascript
import { motion } from 'framer-motion';

<MotionBox
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
>
    Content
</MotionBox>
```

**Use Cases**:
- Page transitions
- Component animations
- Loading states
- Hover effects

---

## Performance Optimization

### Q20: How is code splitting implemented?

**Answer:**
**Code Splitting** with React.lazy:

```javascript
import { lazy, Suspense } from 'react';

const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));

<Suspense fallback={<Loading />}>
    <SellerDashboard />
</Suspense>
```

**Benefits**:
- Load components on demand
- Reduce initial bundle size
- Faster initial load

### Q21: How is memoization used for performance?

**Answer:**
**Memoization Strategies**:

1. **useMemo**: Expensive calculations
```javascript
const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}, [items]);
```

2. **useCallback**: Function memoization
```javascript
const handleClick = useCallback((id) => {
    // Handler logic
}, [dependency]);
```

3. **React.memo**: Component memoization
```javascript
export default React.memo(CartView);
```

**Benefits**:
- Prevent unnecessary re-renders
- Optimize expensive operations
- Improve performance

### Q22: How is RTK Query caching optimized?

**Answer:**
**Cache Optimization**:

1. **Automatic Caching**: Responses cached automatically
2. **Cache Tags**: Invalidate related data
3. **Refetch Policies**: Control when to refetch
4. **Cache Time**: Set cache expiration

**Example**:
```javascript
getCart: builder.query({
    query: () => '/cart',
    providesTags: ['CartItem'],
    // Cache for 5 minutes
    keepUnusedDataFor: 300,
}),
```

---

## E-commerce Frontend

### Q23: How is the cart managed?

**Answer:**
**Cart Management**:

1. **Fetch Cart**: `useGetCartQuery()` - Get cart items
2. **Update Quantity**: `useSetCartItemQuantityMutation()` - Add/update items
3. **Remove Item**: `useRemoveCartItemMutation()` - Remove items
4. **Cache Invalidation**: Cart refetches after mutations

**Flow**:
```
User Action → Container Handler → RTK Query Mutation → 
Backend API → Cache Invalidation → Refetch Cart → UI Update
```

### Q24: How does the checkout process work?

**Answer:**
**Checkout Flow**:

1. **Fetch Cart & Addresses**: Get cart items and saved addresses
2. **Address Selection**: Choose existing or enter new address
3. **Zip Code Lookup**: Auto-fill city/state from zip code
4. **Form Validation**: Validate address fields
5. **Checkout Mutation**: `useCheckoutMutation()` - Create order
6. **Cache Invalidation**: Clear cart, invalidate orders
7. **Navigation**: Redirect to order confirmation

**Key Features**:
- Address validation
- Zip code integration
- Error handling
- Loading states

### Q25: How is product browsing implemented?

**Answer:**
**Product Browsing**:

1. **Fetch Products**: `useGetAllProductsQuery()` with filters
2. **Filtering**: Category, search, pagination
3. **Product Detail**: `useGetProductByIdQuery(id)`
4. **Add to Cart**: `useSetCartItemQuantityMutation()`

**Features**:
- Pagination
- Category filtering
- Search functionality
- Product detail view

---

## Error Handling & Best Practices

### Q26: How are errors handled in the application?

**Answer:**
**Error Handling Strategies**:

1. **RTK Query Errors**: Built-in error states
```javascript
const { data, error, isError } = useGetCartQuery();

if (isError) {
    // Handle error
    return <Error message={error.message} />;
}
```

2. **Try-Catch**: Mutation errors
```javascript
try {
    await addToCart({ productId, quantity }).unwrap();
} catch (error) {
    // Handle error
    showToast(error.message, 'error');
}
```

3. **Global Error Handler**: Toast notifications
4. **Form Validation**: Client-side validation before API calls

### Q27: What are the best practices followed?

**Answer:**
**Best Practices**:

1. **Container/Presentational Pattern**: Separate logic from UI
2. **RTK Query for API**: Use RTK Query for all API calls
3. **Error Handling**: Handle errors at container level
4. **Loading States**: Show loading indicators
5. **Form Validation**: Validate before API calls
6. **Memoization**: Use useMemo/useCallback for performance
7. **Code Splitting**: Lazy load routes
8. **Type Safety**: Consistent prop structures
9. **Reusability**: Create reusable components
10. **Documentation**: Clear component props and usage

---

## Testing & Debugging

### Q28: How would you test React components?

**Answer:**
**Testing Strategies**:

1. **Unit Tests**: Test individual components
```javascript
test('CartView renders items', () => {
    render(<CartView items={mockItems} />);
    expect(screen.getByText('Product 1')).toBeInTheDocument();
});
```

2. **Integration Tests**: Test component interactions
```javascript
test('Add to cart updates quantity', async () => {
    render(<CartContainer />);
    fireEvent.click(screen.getByText('Add to Cart'));
    await waitFor(() => {
        expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
    });
});
```

3. **Redux Testing**: Test reducers and actions
```javascript
test('setCredentials updates auth state', () => {
    const state = authReducer(initialState, setCredentials({ token: 'test' }));
    expect(state.token).toBe('test');
});
```

### Q29: How do you debug Redux state?

**Answer:**
**Debugging Tools**:

1. **Redux DevTools**: Browser extension
2. **Console Logging**: Log state in components
3. **React DevTools**: Inspect component props/state
4. **Network Tab**: Inspect API requests

**Redux DevTools**:
- View state tree
- Time travel debugging
- Action history
- State diff

---

## Quick Reference

### Key Technologies
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **State Management**: Redux Toolkit 2.11.0
- **API Integration**: RTK Query
- **Routing**: React Router v7.9.6
- **UI Library**: Material-UI 7.3.5
- **Animations**: Framer Motion 12.23.24

### Key Patterns
- Container/Presentational Pattern
- RTK Query for API
- Protected Routes
- Token-based Authentication
- Automatic Cache Management

### Key Principles
- Separation of Concerns
- Reusability
- Performance Optimization
- Error Handling
- User Experience

---

## Tips for Interviews

1. **Know Your Code**: Understand component structure and data flow
2. **Redux Knowledge**: Understand Redux Toolkit and RTK Query
3. **React Hooks**: Master hooks usage and optimization
4. **Architecture**: Explain Container/Presentational pattern
5. **Performance**: Discuss optimization strategies
6. **Problem Solving**: Be ready to solve specific problems
7. **Best Practices**: Highlight following React/Redux best practices

---

**Good luck with your interviews!** 🚀
