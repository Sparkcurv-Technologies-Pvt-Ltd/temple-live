import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseRequest } from "@request/request";

const initialState = {
    product: [],
    status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'  
    error: null
}

export const getProduct = createAsyncThunk(
    "Product/Get",
    async () => {
        // async (arg, { rejectWithValue }) => {
        try {
            const response = await baseRequest.get('product/add_items_entry/');
            return [...response.data];
        }
        catch (error) {
            // return error.message
            // rejectWithValue(error.message);
            throw error;
        }
    }
);

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProduct.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getProduct.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.product = action.payload;
            })
            .addCase(getProduct.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
    }
})

export const selectAllProducts = (state) => state.products.product
export const getProductsStatus = (state) => state.products.status
export const getProductError = (state) => state.products.error

export const { reducer } = productSlice;

export default productSlice.reducer


