import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";


const initialState = {
    assetundercategory: [],
    RentalLeases: [],
    rentalassetcategory: [],
    status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'  
    error: null
}

export const getAssetUnderCategory = createAsyncThunk(
    "AssetUnderCategory/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.GET_ASSET_UNDER_ASSET_CATEGORY}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);

export const getRentalLease = createAsyncThunk(
    "RentalLease/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.GET_RENTAL_LEASE}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);

export const getRentalAssetCategory = createAsyncThunk(
    "RentalMovableAsset/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.GET_RENTAL_MOVABLE_ASSET_CATEGORY}`);
            return response.data
        }

        catch (error) {
            throw error;
        }
    }
);


export const getRentalThings = createAsyncThunk(
    "RentThings/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.GET_RENTAL_THINGS}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);

export const getLeaseThings = createAsyncThunk(
    "LeaseThings/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.GET_LEASE_THINGS}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);

export const getMoveableThings = createAsyncThunk(
    "MovableThings/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.POST_MOVEABLE_RENTAL}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);


const leaseSlice = createSlice({
    name: 'leaseredux',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            // Asset Category 
            .addCase(getAssetUnderCategory.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getAssetUnderCategory.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.assetundercategory = action.payload;
            })
            .addCase(getAssetUnderCategory.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            //rental lease

            .addCase(getRentalLease.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getRentalLease.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.RentalLeases = action.payload;
            })
            .addCase(getRentalLease.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            // Rental Movable Asset 
            .addCase(getRentalAssetCategory.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getRentalAssetCategory.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.rentalassetcategory = action.payload;
            })
            .addCase(getRentalAssetCategory.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            // getRentalThings

            .addCase(getRentalThings.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getRentalThings.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.rentalthing = action.payload;
            })
            .addCase(getRentalThings.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            // getLeaseThings

            .addCase(getLeaseThings.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getLeaseThings.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.leasethings = action.payload;
            })
            .addCase(getLeaseThings.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            // getMoveableThings

            .addCase(getMoveableThings.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getMoveableThings.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.moveablethings = action.payload;
            })
            .addCase(getMoveableThings.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

    }
})

// Asset Under Category
export const selectAssetUnderCategoryDetails = (state) => state.leaseDetails.assetundercategory
export const getAssetUnderCategoryStatus = (state) => state.leaseDetails.status
export const getAssetUnderCategoryError = (state) => state.leaseDetails.error

export const selectRentalLeaseDetails = (state) => state.leaseDetails.RentalLeases
export const getRentalLeaseStatus = (state) => state.leaseDetails.status
export const getRentalLeaseError = (state) => state.leaseDetails.error


// Rental Movable Asset
export const selectRentalAssetCategoryDetails = (state) => state.leaseDetails.rentalassetcategory
export const getRentalAssetCategoryStatus = (state) => state.leaseDetails.status
export const getRentalAssetCategoryError = (state) => state.leaseDetails.error

// getRentalThings
export const selectRentalThingDetails = (state) => state.leaseDetails.rentalthing
export const getRentalThingStatus = (state) => state.leaseDetails.status
export const getRentalThingError = (state) => state.leaseDetails.error

// getLeaseThings
export const selectLeaseThingsDetails = (state) => state.leaseDetails.leasethings
export const getLeaseThingsStatus = (state) => state.leaseDetails.status
export const getLeaseThingsError = (state) => state.leaseDetails.error

// getMoveableThings
export const selectMoveableThingsDetails = (state) => state.leaseDetails.moveablethings
export const getMoveableThingsStatus = (state) => state.leaseDetails.status
export const getMoveableThingsError = (state) => state.leaseDetails.error

export const { reducer } = leaseSlice;

export default leaseSlice.reducer
