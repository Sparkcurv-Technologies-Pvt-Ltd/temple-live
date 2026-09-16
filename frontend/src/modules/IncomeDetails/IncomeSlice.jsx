import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";


const initialState = {
    income: [],
    incomecategory: [],
    incomename: [],
    status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'  
    error: null
}

export const getIncome = createAsyncThunk(
    "Income/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.GET_INCOME_DETAILS}`);
            return response.data

        }
        catch (error) {
            throw error;
        }
    }
);
export const getIncomeCategory = createAsyncThunk(
    "incomecategory/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.POST_GET_INCOMECATEGORY}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);

export const getIncomeName = createAsyncThunk(
    "InomeName/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.POST_GET_INCOMENAME}`);
            return [...response.data]
        }
        catch (error) {
            throw error;
        }
    }
);
const incomeSlice = createSlice({
    name: 'incomeredux',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder

            // Income
            .addCase(getIncome.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getIncome.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.income = action.payload;
            })
            .addCase(getIncome.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
                // Income Category
                .addCase(getIncomeCategory.pending, (state, action) => {
                    state.status = 'loading'
                })
                .addCase(getIncomeCategory.fulfilled, (state, action) => {
                    state.status = 'succeeded'
                    state.incomecategory = action.payload;
                })
                .addCase(getIncomeCategory.rejected, (state, action) => {
                    state.status = 'failed'
                    state.error = action.error.message
                })
    
                // Income Name
                .addCase(getIncomeName.pending, (state, action) => {
                    state.status = 'loading'
                })
                .addCase(getIncomeName.fulfilled, (state, action) => {
                    state.status = 'succeeded'
                    state.incomename = action.payload;
                })
                .addCase(getIncomeName.rejected, (state, action) => {
                    state.status = 'failed'
                    state.error = action.error.message
                })
    }
})

export const selectIncomeDetails = (state) => state.incomeDetails.income
export const getIncomeStatus = (state) => state.incomeDetails.status
export const getIncomeError = (state) => state.incomeDetails.error

export const selectIncomeCategoryDetails = (state) => state.incomeDetails.incomecategory
export const getIncomeCategoryStatus = (state) => state.incomeDetails.status
export const getIncomeCategoryError = (state) => state.incomeDetails.error

export const selectIncomeNameDetails = (state) => state.incomeDetails.incomename
export const getIncomeNameStatus = (state) => state.incomeDetails.status
export const getIncomeNameError = (state) => state.incomeDetails.error

export const { reducer } = incomeSlice;

export default incomeSlice.reducer


