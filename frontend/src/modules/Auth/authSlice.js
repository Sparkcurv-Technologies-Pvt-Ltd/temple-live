import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    token: null,
    authUser: null,
    role:null,
    superuser:null,
    permissions:null,
    isTokenExpired: false,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { username, jwt,role,superUsers,permission } = action.payload
            state.authUser = username
            state.token = jwt
            state.role = role
            state.superuser = superUsers
            state.permissions = permission
            state.isTokenExpired = false
        },
        setTokenExpired: (state, action) => {
            state.isTokenExpired = action.payload;
          },
        logOut: (state, action) => {
            state.authUser = null
            state.token = null
            state.role = null
            state.superuser = null
            state.permissions = null

        }
    }
})

export const { setCredentials,setTokenExpired, logOut } = authSlice.actions

export const selectCurrentUser = (state) => state.auth.authUser
export const selectCurrentToken = (state) => state.auth.token
export const selectCurrentUserRole = (state) => state.auth.role
export const selectCurrentSuperUser = (state) => state.auth.superuser
export const selectAllPermissions = (state) => state.auth.permissions

//---------------------> User-Expire  <---------------------------

export const userExpire = (state) => state.auth.isTokenExpired

export default authSlice.reducer

