import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";


const initialState = {
    death: [],
    deathlistview:[],
    status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'  
    error: null
}


export const getDeath = createAsyncThunk(
    "Deathhy/Get",
    async () => {
        // async (arg, { rejectWithValue }) => {
        try {
            const response = await request.get(`${APIURLS.DEFAULT_DEATH_GET}`);
            return response.data;
  
        }

        catch (error) {
            // return error.message
            // rejectWithValue(error.message);
            throw error;
        }
    }
);

export const getDeathList = createAsyncThunk(
    "DeathList/Get",
    async () => {
        // async (arg, { rejectWithValue }) => {
        try {
            const response = await request.get(`${APIURLS.POST_dEATHFORMDETAILS}`);
            return response.data;
  
        }

        catch (error) {
            // return error.message
            // rejectWithValue(error.message);
            throw error;
        }
    }
);


const deathSlice = createSlice({
    name: 'deathredux',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder

            // death
            .addCase(getDeath.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getDeath.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.death = action.payload;
            })
            .addCase(getDeath.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            //death list

            .addCase(getDeathList.pending, (state, action) => {
                state.status ='loading'
            })
            .addCase(getDeathList.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.deathlistview = action.payload;
            })
            .addCase(getDeathList.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
    }
})

// Death
export const selectDeathDetail = (state) => state.DeathDetail.death
export const getDeathstatus = (state) => state.DeathDetail.status
export const getDeathError = (state) => state.DeathDetail.error

// death list
export const selectDeathDetaillist = (state) => state.DeathDetaillist.deathlistview
export const getDeathliststatus = (state) => state.DeathDetaillist.status
export const getDeathlistError = (state) => state.DeathDetaillist.error

export const { reducer } = deathSlice;
// export const { reducer: deathReducer } = deathSlice;
 
export default deathSlice.reducer
