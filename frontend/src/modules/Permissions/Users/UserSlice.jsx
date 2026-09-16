import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";


const initialState = {
    role: [],
    temuser: [],
    status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'  
    error: null
}

export const getRole = createAsyncThunk(
    "RoleList/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.GET_ROLE_PERMISSION}`);
            return response.data
        }

        catch (error) {
            throw error;
        }
    }
);

export const GetUser = createAsyncThunk(
    "UserList/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.GET_USER}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);

const userSlice = createSlice({
    name: 'userredux',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            // Role
            .addCase(getRole.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getRole.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.role = action.payload;
            })
            .addCase(getRole.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            // user
            .addCase(GetUser.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(GetUser.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.temuser = action.payload;
            })
            .addCase(GetUser.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
    }

})

export const selectRoleDetails = (state) => state.userdetails.role
export const getRoleStatus = (state) => state.userdetails.status
export const getRoleError = (state) => state.userdetails.error

export const selectUserDetails = (state) => state.userdetails.temuser
export const getUserStatus = (state) => state.userdetails.status
export const getUserError = (state) => state.userdetails.error

export const { reducer } = userSlice;

export default userSlice.reducer


