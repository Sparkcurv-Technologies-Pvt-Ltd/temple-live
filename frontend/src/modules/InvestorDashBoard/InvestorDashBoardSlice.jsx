import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";


const initialState = {
    investortable: [],
    status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'  
    error: null
}

export const getInvestortable = createAsyncThunk(
    "Investortabledetails/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.INVESTOR_DASHBOARD_TABLE_GET}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);


const marriageSlice = createSlice({
    name: 'Investortabless',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder

            // Groom Family
            .addCase(getInvestortable.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getInvestortable.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.investortable = action.payload;
            })
            .addCase(getInvestortable.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

    }
})

export const AllInvestortableData = (state) => state.investordashboard.investortable
export const AllInvestortableStatus = (state) => state.investordashboard.status
export const AllInvestortableError = (state) => state.investordashboard.error

export const { reducer } = marriageSlice;

export default marriageSlice.reducer


