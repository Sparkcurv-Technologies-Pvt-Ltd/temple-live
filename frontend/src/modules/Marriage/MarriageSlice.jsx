import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";


const initialState = {
    groomfamily: [],
    bridefamily: [],
    marriagedetail: [],
    status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'  
    error: null
}

export const getGroomDetails = createAsyncThunk(
    "GroomFamily/Get",
    async () => {
        // async (arg, { rejectWithValue }) => {
        try {
            const response = await request.get(`${APIURLS.GET_GROOM_DETAILS}`);
            return response.data

        }

        catch (error) {
            // return error.message
            // rejectWithValue(error.message);
            throw error;
        }
    }
);

export const getBrideDetails = createAsyncThunk(
    "BrideFamily/Get",
    async () => {
        // async (arg, { rejectWithValue }) => {
        try {
            const response = await request.get(`${APIURLS.GET_BRIDE_DETAILS}`);
            return response.data

        }

        catch (error) {
            throw error;
        }
    }
);

export const getmarriageDetails = createAsyncThunk(
    "MarriageDetails/Get",
    async () => {
        // async (arg, { rejectWithValue }) => {
        try {
            const response = await request.get(`${APIURLS.GET_MARRIAGE_DETAILS}`);
            return response.data
        }

        catch (error) {
            // return error.message
            // rejectWithValue(error.message);
            throw error;
        }
    }
);

const marriageSlice = createSlice({
    name: 'marriageredux',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder

            // Groom Family
            .addCase(getGroomDetails.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getGroomDetails.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.groomfamily = action.payload;
            })
            .addCase(getGroomDetails.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            // Bride Family
            .addCase(getBrideDetails.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getBrideDetails.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.bridefamily = action.payload;
            })
            .addCase(getBrideDetails.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            //marriage details
            .addCase(getmarriageDetails.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getmarriageDetails.fulfilled, (state, action)=>{
                state.status = 'succeeded'
                state.marriagedetail = action.payload;
            })
            .addCase(getmarriageDetails.rejected, (state, action) => {
                state.status ='failed'
                state.error = action = action.error.message
            })
    }
})

export const selectMarriageDetails =(state) => state.marriageDetails.marriagedetail
export const getMarriageStatus =(state) =>  state.marriageDetails.status
export const getMarriagesError = (state) => state.marriageDetails.error

export const selectGroomDetails = (state) => state.marriageDetails.groomfamily
export const getGroomStatus = (state) => state.marriageDetails.status
export const getGroomError = (state) => state.marriageDetails.error

export const selectBrideDetails = (state) => state.marriageDetails.bridefamily
export const getBrideStatus = (state) => state.marriageDetails.status
export const getBrideError = (state) => state.marriageDetails.error

export const { reducer } = marriageSlice;

export default marriageSlice.reducer


