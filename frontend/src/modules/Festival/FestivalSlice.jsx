import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";


const initialState = {
    festival: [],
    status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'  
    error: null
}

export const getFestival = createAsyncThunk(
    "Festival/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.GET_FESTIVAL}`);
            return response.data

        }
        catch (error) {
            throw error;
        }
    }
);

const festivalSlice = createSlice({
    name: 'festivalredux',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder

            // Festival
            .addCase(getFestival.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getFestival.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.festival = action.payload;
            })
            .addCase(getFestival.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
    }
})

export const selectFestivalDetails = (state) => state.festivalDetails.festival
export const getFestivalStatus = (state) => state.festivalDetails.status
export const getFestivalError = (state) => state.festivalDetails.error

export const { reducer } = festivalSlice;

export default festivalSlice.reducer


