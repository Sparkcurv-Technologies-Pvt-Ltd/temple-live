import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";


const initialState = {
    chitFundlist: [],
    chitFundInvestor: [],
    profileDetails: [],
    profileDetailsList: [],
    onlyChitProfitList:[],
    settlementAppln: [],
    chitFundSettle:[],
    status: 'idle',  // 'idle' | 'loading' | 'succeeded' | 'failed'  
    error: null
}

// name
export const getChitFundList = createAsyncThunk(
    "chitFundLists/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.ADD_CHIT_FUNT}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);

// Chit Fund Investor
export const getChitFundInvestor = createAsyncThunk(
    "chitFundInvesto/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.CHITFUND_INVESTOR_MEMBER}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);

// Chit Fund Profit
export const getChitFundProfit = createAsyncThunk(
    "chitFundProfit/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.PROFIT_CHITFUND_DETAILS}`);
            return response.data

        }
        catch (error) {
            throw error;
        }
    }
);

// Chit Fund Closed Profit list
export const getChitFundClosedProfitList = createAsyncThunk(
    "chitFundClosedProfitlst/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.TOTAL_CHITFUND_PROFIT}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);

// Chit Fund Only Profit list
export const getChitOnlyProfitList = createAsyncThunk(
    "chitFundOnlyProfitlst/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.CHITFUND_ONLY_PROFIT_DISTRIBUTION}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);

//Settlement Application view
export const getChitSettlementAppln = createAsyncThunk(
    "chitsettlementappln/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.ADD_SETTLEMENT_APPLICATION_POST}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);

//Chit Fund Settlement 
export const getChitFundSettle = createAsyncThunk(
    "chitsettlement/Get",
    async () => {
        try {
            const response = await request.get(`${APIURLS.ADD_SETTLEMENT_POST}`);
            return response.data
        }
        catch (error) {
            throw error;
        }
    }
);


const chitFundListSlice = createSlice({
    name: 'chitFundList',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder

            // sangam name
            .addCase(getChitFundList.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getChitFundList.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.chitFundlist = action.payload;
            })
            .addCase(getChitFundList.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
            // Chit Fund Investor
            .addCase(getChitFundInvestor.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getChitFundInvestor.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.chitFundInvestor = action.payload;
            })
            .addCase(getChitFundInvestor.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
            // Chit Fund Profit
            .addCase(getChitFundProfit.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getChitFundProfit.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.profileDetails = action.payload;
            })
            .addCase(getChitFundProfit.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
            // Chit Fund Closed Profit list
            .addCase(getChitFundClosedProfitList.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getChitFundClosedProfitList.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.profileDetailsList = action.payload;
            })
            .addCase(getChitFundClosedProfitList.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

              // Chit Fund Only Profit list
              .addCase(getChitOnlyProfitList.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getChitOnlyProfitList.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.onlyChitProfitList = action.payload;
            })
            .addCase(getChitOnlyProfitList.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            // Settlement Appln list
            .addCase(getChitSettlementAppln.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getChitSettlementAppln.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.settlementAppln = action.payload;
            })
            .addCase(getChitSettlementAppln.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

            // Chit Fund Settle
            .addCase(getChitFundSettle.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getChitFundSettle.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.chitFundSettle = action.payload;
            })
            .addCase(getChitFundSettle.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })

    }
})

// name
export const AllChitList = (state) => state.chitlistFund.chitFundlist
export const AllChitListStatus = (state) => state.chitlistFund.status
export const AllChitListError = (state) => state.chitlistFund.error
// Chit Fund Investor
export const AllChitFundInvestor = (state) => state.chitlistFund.chitFundInvestor
// Chit Fund Profit
export const AllChitFundProfitDetail = (state) => state.chitlistFund.profileDetails
// Chit Fund Closed Profit list 
export const AllChitFundList = (state) => state.chitlistFund.profileDetailsList
export const AllChitFundListStatus = (state) => state.chitlistFund.status
export const AllChitFundListError = (state) => state.chitlistFund.error

// Chit Fund Only Profit list 
export const AllOnlyProfitChitFundList = (state) => state.chitlistFund.onlyChitProfitList
export const AllOnlyProfitChitFundListStatus = (state) => state.chitlistFund.status
export const AllOnlyProfitChitFundListError = (state) => state.chitlistFund.error

// Chit Fund Settlement Application 
export const AllChitSettlemenetAppln = (state) => state.chitlistFund.settlementAppln
export const AllChitSettlemenetApplnStatus = (state) => state.chitlistFund.status
export const AllChitSettlemenetApplnError = (state) => state.chitlistFund.error

// Chit Fund Settlement 
export const AllChitSettlemenet = (state) => state.chitlistFund.chitFundSettle
export const AllChitSettlemenetStatus = (state) => state.chitlistFund.status
export const AllChitSettlemenetError = (state) => state.chitlistFund.error

export const { reducer } = chitFundListSlice;

export default chitFundListSlice.reducer
