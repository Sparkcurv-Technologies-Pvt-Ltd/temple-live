import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";

const initialState = {
    subscriptionTariff: [],
    status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'  
    error: null
}

export const getSubscriptionTariff = createAsyncThunk(
    "subscriptionTariff/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.GET_SUBSCRIPTIONTARIFF}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);

const subscriptionTariffSlice = createSlice({
    name: 'subscriptionTariffredux',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder

            //------------ subscriptionTariff-----------------
            .addCase(getSubscriptionTariff.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getSubscriptionTariff.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.subscriptionTariff = action.payload;
            })
            .addCase(getSubscriptionTariff.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
    }
})

export const selectSubscriptionTariff = (state) => state.subscriptionTarif.subscriptionTariff
export const getSubscriptionTariffStatus = (state) => state.subscriptionTarif.status
export const getSubscriptionTariffError = (state) => state.subscriptionTarif.error

export const { reducer } = subscriptionTariffSlice;

export default subscriptionTariffSlice.reducer


