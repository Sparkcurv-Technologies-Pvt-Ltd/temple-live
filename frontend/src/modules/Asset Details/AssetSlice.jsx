import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";


const initialState = {
    assetcategory: [],
    asset: [],
    movableassestcategory: [],
    movableassest: [],
    status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'  
    error: null
}

export const getAssetCategory = createAsyncThunk(
    "AssetCategory/Get",
    async () => {
        // async (arg, { rejectWithValue }) => {
        try {
            const response = await request.get(`${APIURLS.GET_ASSET_CATEGORY}`);
            return response.data
        }

        catch (error) {
            // return error.message
            // rejectWithValue(error.message);
            throw error;
        }
    }
);

export const getAsset = createAsyncThunk(
    "Asset/Get",
    async () => {
        // async (arg, { rejectWithValue }) => {
        try {
            const response = await request.get(`${APIURLS.GET_ASSET_DETAILS}`);
            return response.data
        }

        catch (error) {
            // return error.message
            // rejectWithValue(error.message);
            throw error;
        }
    }
);

export const getMovableAssetCategory = createAsyncThunk(
    "MovableAsset/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.GET_MOVABLE_ASSET_CATEGORY}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);

export const getMovableAsset = createAsyncThunk(
    "GETMOVABLEASSETDETAILS/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.GET_MOVABLEASSET_DETAILS}`);
            console.log(response.data, 'jkjkjk');
            return response.data
        }

        catch (error) {
            throw error;
        }
    }
);

const assetSlice = createSlice({
    name: 'assetredux',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            // Asset Category 
            .addCase(getAssetCategory.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getAssetCategory.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.assetcategory = action.payload;
            })
            .addCase(getAssetCategory.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            // Asset 
            .addCase(getAsset.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getAsset.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.asset = action.payload;
            })
            .addCase(getAsset.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            // Movable Asset 
            .addCase(getMovableAssetCategory.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getMovableAssetCategory.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.movableassestcategory = action.payload;
            })
            .addCase(getMovableAssetCategory.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            // Movable Asset get
            .addCase(getMovableAsset.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getMovableAsset.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.movableassest = action.payload;
            })
            .addCase(getMovableAsset.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

    }
})

// Asset Category
export const selectAssetCategoryDetails = (state) => state.assetDetails.assetcategory
export const getAssetCategoryStatus = (state) => state.assetDetails.status
export const getAssetCategoryError = (state) => state.assetDetails.error

// Asset
export const selectAssetDetails = (state) => state.assetDetails.asset
export const getAssetStatus = (state) => state.assetDetails.status
export const getAssetError = (state) => state.assetDetails.error

// Movable Asset
export const selectMovableAssetDetails = (state) => state.assetDetails.movableassestcategory
export const getMovableAssetStatus = (state) => state.assetDetails.status
export const getMovableAssetError = (state) => state.assetDetails.error

// movable asset list

export const selectMovableDetails = (state) => state.assetDetails.movableassest
export const getMovableStatus = (state) => state.assetDetails.status
export const getMovableError = (state) => state.assetDetails.error

export const { reducer } = assetSlice;

export default assetSlice.reducer


