import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";


const initialState = {
    sangamName: [],
    sangamDetails: [],
    sangamMembers:[],
    status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'  
    error: null
}

//sangam name
export const getSangamName = createAsyncThunk(
    "SangamName /Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.GET_SANGAM_NAME}`);
            return response.data

        }
        catch (error) {
            throw error;
        }
    }
);
//sangam Add members
export const getSangamAddMembers = createAsyncThunk(
    "SangamMembers /Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.GET_SANGAM_MEMBERS}`);
            return response.data

        }
        catch (error) {
            throw error;
        }
    }
);

//sangam details
export const getSangamDetails = createAsyncThunk(
    "SangamDetails/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.GET_SANGAM_DETAILS}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);

const sangamSlice = createSlice({
    name: 'sangamredux',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            // sangam name
            .addCase(getSangamName.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getSangamName.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.sangamName = action.payload;
            })
            .addCase(getSangamName.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

               // sangam Add Members
               .addCase(getSangamAddMembers.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getSangamAddMembers.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.sangamMembers = action.payload;
            })
            .addCase(getSangamAddMembers.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            // sangam details
            .addCase(getSangamDetails.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getSangamDetails.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.sangamDetails = action.payload;
            })
            .addCase(getSangamDetails.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
    }
})

//sangam name
export const selectSangamName = (state) => state.sangamDetail.sangamName
export const getSangamStatus = (state) => state.sangamDetail.status
export const getSangamError = (state) => state.sangamDetail.error

//sangam Members
export const SelectAddMembers = (state) => state.sangamDetail.sangamMembers
export const getAddMembersStatus = (state) => state.sangamDetail.status
export const getAddMembersError = (state) => state.sangamDetail.error

//sangam details
export const selectSangamDetails = (state) => state.sangamDetail.sangamDetails
export const getSangamDetailsStatus = (state) => state.sangamDetail.status
export const getSangamDetailsError = (state) => state.sangamDetail.error

export const { reducer } = sangamSlice;

export default sangamSlice.reducer
