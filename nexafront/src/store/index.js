import { configureStore } from '@reduxjs/toolkit';
import { api } from './api/api.slice';
import authReducer from './slices/auth.slice';
import productReducer from './slices/product.slice';
import categoryReducer from './slices/category.slice';

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
