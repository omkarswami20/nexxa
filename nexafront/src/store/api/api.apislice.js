import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../slices/auth.slice';
import { transformLogoutResponse } from '../parsers/auth.parser';
import { transformPaginatedProductResponse, transformProductListResponse, transformProductResponse } from '../parsers/product.parser';
import { transformCategoryListResponse, transformCategoryResponse } from '../parsers/category.parser';
import { transformCartResponse } from '../parsers/cart.parser';
import { transformAddressListResponse, transformAddressResponse } from '../parsers/address.parser';
import { transformOrderListResponse, transformOrderDetailResponse } from '../parsers/order.parser';

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:8080/api',
    prepareHeaders: (headers, { getState }) => {
        const state = getState?.();
        const token = state?.auth?.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    if (result?.error && result.error.status === 401) {
        const refreshToken = api.getState()?.auth?.refreshToken;
        if (refreshToken) {
            const refreshResult = await baseQuery(
                {
                    url: '/auth/refresh-token',
                    method: 'POST',
                    body: { refreshToken },
                },
                api,
                extraOptions
            );

            if (refreshResult?.data) {
                const state = api.getState?.();
                const user = state?.auth?.user ?? null;
                const role = state?.auth?.role ?? null;

                api.dispatch(setCredentials({
                    user,
                    token: refreshResult.data.accessToken,
                    refreshToken: refreshResult.data.refreshToken,
                    role
                }));

                result = await baseQuery(args, api, extraOptions);
            } else {
                api.dispatch(logout());
            }
        } else {
            api.dispatch(logout());
        }
    }
    return result;
};

export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Seller', 'Admin', 'Product', 'Categories', 'CartItem', 'Order', 'OrderItem', 'Address'],
    endpoints: (builder) => ({
        // Seller Endpoints
        registerSeller: builder.mutation({
            query: (credentials) => ({
                url: '/v1/auth/register/seller',
                method: 'POST',
                body: credentials,
            }),
        }),
        loginSeller: builder.mutation({
            query: (credentials) => ({
                url: '/v1/auth/login/seller',
                method: 'POST',
                body: credentials,
            }),
        }),
        verifySellerEmail: builder.mutation({
            query: (token) => ({
                url: `/sellers/verify?token=${token}`,
                method: 'GET',
            }),
        }),

        // Customer Auth & Profile Endpoints
        registerCustomer: builder.mutation({
            query: (data) => ({ url: '/v1/auth/register/customer', method: 'POST', body: data }),
        }),
        loginCustomer: builder.mutation({
            query: (data) => ({ url: '/v1/auth/login/customer', method: 'POST', body: data }),
        }),
        verifyCustomerEmailOtp: builder.mutation({
            query: ({ email, otp }) => ({ url: '/v1/customers/otp/verify-email', method: 'POST', body: { email, otp } }),
        }),
        verifyCustomerMobileOtp: builder.mutation({
            query: ({ mobile, otp }) => ({ url: '/v1/customers/otp/verify-mobile', method: 'POST', body: { mobile, otp } }),
        }),
        resendOtp: builder.mutation({
            query: ({ identifier, type }) => ({ url: '/customers/resend-otp', method: 'POST', body: { identifier, type } }),
        }),
        requestForgotPassword: builder.mutation({
            query: (email) => ({ url: '/customers/forgot-password/request', method: 'POST', body: { email } }),
        }),
        verifyForgotPassword: builder.mutation({
            query: ({ email, otp, newPassword }) => ({ url: '/customers/forgot-password/verify', method: 'POST', body: { email, otp, newPassword } }),
        }),
        getCustomerProfile: builder.query({
            query: () => '/customers/profile',
        }),
        updateCustomerProfile: builder.mutation({
            query: (data) => ({ url: '/customers/profile', method: 'PUT', body: data }),
        }),
        changeCustomerPassword: builder.mutation({
            query: ({ oldPassword, newPassword }) => ({ url: '/customers/change-password', method: 'POST', body: { oldPassword, newPassword } }),
        }),

        // Customer Addresses
        getAddresses: builder.query({
            query: () => '/customers/addresses',
            transformResponse: transformAddressListResponse,
            providesTags: ['Address'],
        }),
        createAddress: builder.mutation({
            query: (data) => ({ url: '/customers/addresses', method: 'POST', body: data }),
            transformResponse: transformAddressResponse,
            invalidatesTags: ['Address'],
        }),
        updateAddress: builder.mutation({
            query: ({ id, ...data }) => ({ url: `/customers/addresses/${id}`, method: 'PUT', body: data }),
            transformResponse: transformAddressResponse,
            invalidatesTags: ['Address'],
        }),
        deleteAddress: builder.mutation({
            query: (id) => ({ url: `/customers/addresses/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Address'],
        }),

        // Admin Endpoints
        loginAdmin: builder.mutation({
            query: (credentials) => ({
                url: '/v1/auth/login/admin',
                method: 'POST',
                body: credentials,
            }),
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            transformResponse: transformLogoutResponse,
        }),
        getPendingSellers: builder.query({
            query: () => '/admin/pending',
            providesTags: ['Seller'],
        }),
        getAllSellers: builder.query({
            query: () => '/admin/sellers',
            providesTags: ['Seller'],
        }),
        updateSellerStatus: builder.mutation({
            query: ({ sellerId, newStatus, rejectionReason }) => ({
                url: '/admin/update-status',
                method: 'PUT',
                body: { sellerId, newStatus, rejectionReason },
            }),
            invalidatesTags: ['Seller'],
        }),

        // Product Endpoints
        getSellerProducts: builder.query({
            query: ({ status, category, search, limit = 5, offset = 0 } = {}) => {
                const params = new URLSearchParams();
                if (status) params.append('status', status);
                if (category) params.append('category', category);
                if (search) params.append('search', search);
                params.append('limit', limit.toString());
                params.append('offset', offset.toString());
                return `/products/seller?${params.toString()}`;
            },
            providesTags: (result) => {
                const products = result?.products ?? [];
                return products.length
                    ? [
                        ...products.map(({ id }) => ({ type: 'Product', id })),
                        { type: 'Product', id: 'LIST' },
                    ]
                    : [{ type: 'Product', id: 'LIST' }];
            },
            transformResponse: transformPaginatedProductResponse,
        }),
        getSellerProductList: builder.query({
            query: () => '/products/seller/summaries',
            providesTags: (result) => {
                const list = result ?? [];
                return list.length
                    ? [
                        ...list.map(({ id }) => ({ type: 'Product', id })),
                        { type: 'Product', id: 'LIST' },
                    ]
                    : [{ type: 'Product', id: 'LIST' }];
            },
        }),
        getAllProducts: builder.query({
            query: ({ category, search, limit, offset } = {}) => {
                const params = new URLSearchParams();
                if (category) params.append('category', category);
                if (search) params.append('search', search);
                if (limit) params.append('limit', limit);
                if (offset) params.append('offset', offset);
                const queryString = params.toString();
                return `/products${queryString ? `?${queryString}` : ''}`;
            },
            providesTags: (result) => {
                const products = result?.products ?? result ?? [];
                const list = Array.isArray(products) ? products : [];
                return list.length
                    ? [
                        ...list.map(({ id }) => ({ type: 'Product', id })),
                        { type: 'Product', id: 'ALL' },
                    ]
                    : [{ type: 'Product', id: 'ALL' }];
            },
            transformResponse: (response) => {
                // Check if it's a paginated response
                if (response && response.products && Array.isArray(response.products)) {
                    return transformPaginatedProductResponse(response);
                }
                // Otherwise use list transformer
                return transformProductListResponse(response);
            },
        }),
        getProductById: builder.query({
            query: (id) => `/products/${id}`,
            providesTags: (result, error, id) => [{ type: 'Product', id }],
            transformResponse: transformProductResponse,
        }),
        createProduct: builder.mutation({
            query: (product) => ({
                url: '/products',
                method: 'POST',
                body: product,
            }),
            invalidatesTags: [{ type: 'Product', id: 'LIST' }],
            transformResponse: transformProductResponse,
        }),
        updateProduct: builder.mutation({
            query: ({ id, ...product }) => ({
                url: `/products/${id}`,
                method: 'PUT',
                body: product,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Product', id },
                { type: 'Product', id: 'LIST' },
            ],
            transformResponse: transformProductResponse,
        }),
        deleteProduct: builder.mutation({
            query: (id) => ({
                url: `/products/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Product', id },
                { type: 'Product', id: 'LIST' },
            ],
        }),
        updateProductStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/products/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Product', id },
                { type: 'Product', id: 'LIST' },
            ],
        }),
        updateProductStock: builder.mutation({
            query: ({ id, stockQuantity }) => ({
                url: `/products/${id}/stock`,
                method: 'PATCH',
                body: { stockQuantity },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Product', id },
                { type: 'Product', id: 'LIST' },
            ],
        }),
        uploadProductImage: builder.mutation({
            query: ({ file, productName }) => {
                const formData = new FormData();
                formData.append('file', file);
                if (productName) {
                    formData.append('productName', productName);
                }
                return {
                    url: '/upload/product-image',
                    method: 'POST',
                    body: formData,
                };
            },
        }),
        deleteProductImage: builder.mutation({
            query: (url) => ({
                url: '/upload/product-image',
                method: 'DELETE',
                params: { url },
            }),
        }),


        // Cart Endpoints (Customer)
        getCart: builder.query({
            query: () => '/cart',
            providesTags: (result) => {
                const list = result ?? [];
                return list.length
                    ? [
                        ...list.map(({ id }) => ({ type: 'CartItem', id })),
                        { type: 'CartItem', id: 'LIST' },
                    ]
                    : [{ type: 'CartItem', id: 'LIST' }];
            },
            transformResponse: transformCartResponse,
        }),
        setCartItemQuantity: builder.mutation({
            query: ({ productId, quantity }) => ({
                url: '/cart/items',
                method: 'PUT',
                body: { productId, quantity },
            }),
            invalidatesTags: [{ type: 'CartItem', id: 'LIST' }],
        }),
        removeCartItem: builder.mutation({
            query: (productId) => ({
                url: `/cart/items/${productId}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'CartItem', id: 'LIST' }],
        }),

        // Checkout
        checkout: builder.mutation({
            query: ({ addressId, address }) => {
                const body = {};
                if (addressId != null) {
                    body.addressId = addressId;
                }
                if (address != null) {
                    body.address = address;
                }
                return {
                    url: '/v1/orders/checkout',
                    method: 'POST',
                    body,
                };
            },
            invalidatesTags: [{ type: 'CartItem', id: 'LIST' }, { type: 'Order', id: 'LIST' }, 'Address'],
        }),

        // Orders (Customer)
        getOrders: builder.query({
            query: () => '/v1/orders',
            providesTags: (result) => {
                const list = result ?? [];
                return list.length
                    ? [
                        ...list.map(({ id }) => ({ type: 'Order', id })),
                        { type: 'Order', id: 'LIST' },
                    ]
                    : [{ type: 'Order', id: 'LIST' }];
            },
            transformResponse: transformOrderListResponse,
        }),
        getOrderById: builder.query({
            query: (orderId) => `/v1/orders/${orderId}`,
            providesTags: (result, error, id) => [{ type: 'Order', id }],
            transformResponse: transformOrderDetailResponse,
        }),

        // Orders (Seller)
        getSellerOrderItems: builder.query({
            query: () => '/v1/orders/seller',
            providesTags: (result) => {
                const list = result ?? [];
                return list.length
                    ? [
                        ...list.map(({ id }) => ({ type: 'OrderItem', id })),
                        { type: 'OrderItem', id: 'LIST' },
                    ]
                    : [{ type: 'OrderItem', id: 'LIST' }];
            },
        }),
        updateSellerOrderItemStatus: builder.mutation({
            query: ({ orderItemId, status }) => ({
                url: `/v1/orders/seller/${orderItemId}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: (result, error, { orderItemId }) => [
                { type: 'OrderItem', id: orderItemId },
                { type: 'OrderItem', id: 'LIST' },
            ],
        }),
        // OTP Endpoints
        sendSellerOtp: builder.mutation({
            query: (email) => ({
                url: '/otp/seller/send',
                method: 'POST',
                body: { email },
            }),
        }),
        verifySellerOtp: builder.mutation({
            query: ({ email, otp }) => ({
                url: '/otp/seller/verify',
                method: 'POST',
                body: { email, otp },
            }),
        }),
        verifySellerMobileOtp: builder.mutation({
            query: ({ mobile, otp }) => ({
                url: '/sellers/mobile/verify-otp',
                method: 'POST',
                body: { mobile, otp },
            }),
        }),
        resendSellerOtp: builder.mutation({
            query: ({ identifier }) => ({
                url: '/sellers/mobile/send-otp',
                method: 'POST',
                body: { identifier },
            }),
        }),
        resendSellerVerificationEmail: builder.mutation({
            query: ({ email }) => ({
                url: '/sellers/verification/resend',
                method: 'POST',
                body: { email },
            }),
        }),
        sendUserOtp: builder.mutation({
            query: (email) => ({
                url: '/otp/user/send',
                method: 'POST',
                body: { email },
            }),
        }),
        verifyUserOtp: builder.mutation({
            query: ({ email, otp }) => ({
                url: '/otp/user/verify',
                method: 'POST',
                body: { email, otp },
            }),
        }),


        // Category Endpoints
        getCategories: builder.query({
            query: () => '/categories',
            providesTags: ['Categories'],
            transformResponse: transformCategoryListResponse,
        }),
        createCategory: builder.mutation({
            query: (data) => ({
                url: '/categories',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Categories'],
            transformResponse: transformCategoryResponse,
        }),
        updateCategory: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/categories/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Categories'],
            transformResponse: transformCategoryResponse,
        }),
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/categories/${id}`,
                method: 'DELETE',
                params: { id },
            }),
            invalidatesTags: ['Categories'],
        }),
    }),
});

export const {
    useRegisterSellerMutation,
    useLoginSellerMutation,
    useVerifySellerEmailMutation,
    useVerifySellerMobileOtpMutation,
    useResendSellerOtpMutation,
    useResendSellerVerificationEmailMutation,
    // Customer Auth/Profile/Addresses
    useRegisterCustomerMutation,
    useLoginCustomerMutation,
    useVerifyCustomerEmailOtpMutation,
    useVerifyCustomerMobileOtpMutation,
    useResendOtpMutation,
    useRequestForgotPasswordMutation,
    useVerifyForgotPasswordMutation,
    useGetCustomerProfileQuery,
    useUpdateCustomerProfileMutation,
    useChangeCustomerPasswordMutation,
    useGetAddressesQuery,
    useCreateAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,
    useLoginAdminMutation,
    useLogoutUserMutation,
    useGetPendingSellersQuery,
    useGetAllSellersQuery,
    useUpdateSellerStatusMutation,
    useGetSellerProductsQuery,
    useGetSellerProductListQuery,
    useGetAllProductsQuery,
    useGetProductByIdQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useUpdateProductStatusMutation,
    useUpdateProductStockMutation,
    useUploadProductImageMutation,
    useDeleteProductImageMutation,
    useSendSellerOtpMutation,
    useVerifySellerOtpMutation,
    useSendUserOtpMutation,
    useVerifyUserOtpMutation,
    // Cart / Checkout / Orders
    useGetCartQuery,
    useSetCartItemQuantityMutation,
    useRemoveCartItemMutation,
    useCheckoutMutation,
    useGetOrdersQuery,
    useGetOrderByIdQuery,
    useGetSellerOrderItemsQuery,
    useUpdateSellerOrderItemStatusMutation,
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = api;

