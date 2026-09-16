import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";


const initialState = {
    expensecategory: [],
    expensename: [],
    expense : [],
    status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'  
    error: null
}

export const getExpenseCategory = createAsyncThunk(
    "ExpenseCategory/Get",
    async () => {
        // async (arg, { rejectWithValue }) => {
        try {
            const response = await request.get(`${APIURLS.GET_EXPENSE_CATEGORY}`);
            return response.data
        }

        catch (error) {
            // return error.message
            // rejectWithValue(error.message);
            throw error;
        }
    }
);

export const getExpenseName = createAsyncThunk(
    "ExpenseName/Get",
    async () => {
        // async (arg, { rejectWithValue }) => {
        try {
            const response = await request.get(`${APIURLS.GET_EXPENSE_NAME}`);
            return [...response.data]

        }

        catch (error) {
            // return error.message
            // rejectWithValue(error.message);
            throw error;
        }
    }
);

export const getExpense = createAsyncThunk(
    "Expense/Get",
    async () => {
        // async (arg, { rejectWithValue }) => {
        try {
            const response = await request.get(`${APIURLS.GET_EXPENSE}`);
            return [...response.data]

        }

        catch (error) {
            // return error.message
            // rejectWithValue(error.message);
            throw error;
        }
    }
);

const expenseSlice = createSlice({
    name: 'expenseredux',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder

            // Expense Category
            .addCase(getExpenseCategory.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getExpenseCategory.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.expensecategory = action.payload;
            })
            .addCase(getExpenseCategory.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            // Expense Name
            .addCase(getExpenseName.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getExpenseName.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.expensename = action.payload;
            })
            .addCase(getExpenseName.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            // Expense
            .addCase(getExpense.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getExpense.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.expense = action.payload;
            })
            .addCase(getExpense.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
    }
})

export const selectExpenseCategoryDetails = (state) => state.expenseDetails.expensecategory
export const getExpenseCategoryStatus = (state) => state.expenseDetails.status
export const getExpenseCategoryError = (state) => state.expenseDetails.error

export const selectExpenseNameDetails = (state) => state.expenseDetails.expensename
export const getExpenseNameStatus = (state) => state.expenseDetails.status
export const getExpenseNameError = (state) => state.expenseDetails.error

export const selectExpenseDetails = (state) => state.expenseDetails.expense
export const getExpenseStatus = (state) => state.expenseDetails.status
export const getExpenseError = (state) => state.expenseDetails.error

export const { reducer } = expenseSlice;

export default expenseSlice.reducer


