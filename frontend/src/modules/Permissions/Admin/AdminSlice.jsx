import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";


const initialState = {
    admin: [],
    status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'  
    error: null
}

export const getAdmin = createAsyncThunk(
    "Admin/Get",
    async () => {
        try {
            const response = await request.get(APIURLS.ADMIN_GET_TABLE_VIEW);
            return [...response.data];
        }
        catch (error) {
            throw error;
        }
    }
);


const userSlice = createSlice({
    name: 'admins',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
        // ADMIN
            .addCase(getAdmin.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getAdmin.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.admin = action.payload;
            })
            .addCase(getAdmin.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

    }
    
})

export const selectAllAdminGet = (state) => state.admindetails.admin
export const getAdminGetStatus = (state) => state.admindetails.status
export const getAdminGetError = (state) => state.admindetails.error

export const { reducer } = userSlice;

export default userSlice.reducer


