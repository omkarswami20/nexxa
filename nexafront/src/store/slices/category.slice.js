import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    categories: [],
    loading: false,
    error: null,
};

const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {
        setCategories: (state, action) => {
            state.categories = action.payload;
        },
        clearCategories: (state) => {
            state.categories = [];
        },
    },
});

export const { setCategories, clearCategories } = categorySlice.actions;

export default categorySlice.reducer;

export const selectAllCategories = (state) => state.category.categories;
