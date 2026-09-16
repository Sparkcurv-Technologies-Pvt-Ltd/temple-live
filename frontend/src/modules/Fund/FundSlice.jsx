import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";

const initialState = {
  createfund: [],
  fundList: [],
  fundLease: [],
  normalfundLeasetable: [],
  fundGroup: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const getCreatedFund = createAsyncThunk("CreatedFund/Get", async () => {
  try {
    const response = await request.get(`${APIURLS.GET_CREATED_FUND}`);
    return [...response.data];
  } catch (error) {
    throw error;
  }
});
export const getChooseFundGroup = createAsyncThunk("ChoosefundgroupFund/Get", async () => {
  try {
    const response = await request.get(`${APIURLS.GET_CHOOSE_FUND_GROUP}`);
    return [...response.data];
  } catch (error) {
    throw error;
  }
});

export const getFundList = createAsyncThunk("FundList/Get", async () => {
  try {
    const response = await request.get(`${APIURLS.GET_FUND_DETAILS}`);
    return [...response.data];
  } catch (error) {
    throw error;
  }
});

export const getFundLease = createAsyncThunk("FundLease/Get", async () => {
  try {
    const response = await request.get(`${APIURLS.POST_GET_FUND_LEASE}`);
    return [...response.data];
  } catch (error) {
    throw error;
  }
});

export const getFundLeasenormaltable = createAsyncThunk("FundLeasenormaTable/Get", async () => {
  try {
    const response = await request.get(`${APIURLS.GET_NORMAL_FUND_LEASE_TABLE}`);
    return [...response.data];
  } catch (error) {
    throw error;
  }
});



const fundSlice = createSlice({
  name: "fundredux",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Create Fund
      .addCase(getCreatedFund.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getCreatedFund.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.createfund = action.payload;
      })
      .addCase(getCreatedFund.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Fund List
      .addCase(getFundList.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getFundList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.fundList = action.payload;
      })
      .addCase(getFundList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Fund Group 
      .addCase(getChooseFundGroup.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getChooseFundGroup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.fundGroup = action.payload;
      })
      .addCase(getChooseFundGroup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // FundLease
      .addCase(getFundLease.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getFundLease.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.fundLease = action.payload;
      })
      .addCase(getFundLease.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // normal fund Lease table
      .addCase(getFundLeasenormaltable.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getFundLeasenormaltable.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.normalfundLeasetable = action.payload;
      })
      .addCase(getFundLeasenormaltable.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })


  },
});

// ---------------> create fund <-----------------
export const selectCreatedFundDetails = (state) => state.fundDetails.createfund;
export const getCreatedFundStatus = (state) => state.fundDetails.status;
export const getCreatedFundError = (state) => state.fundDetails.error;

//-----------------> fund list<-----------------------

export const selectFundDetails = (state) => state.fundDetails.fundList;
export const getFundDetailsStatus = (state) => state.fundDetails.status;
export const getFundDetailsError = (state) => state.fundDetails.error;


//------------------> fund Groupt<---------------------

export const selectFundGroup = (state) => state.fundDetails.fundGroup;

export const selectFundLeaseDetails = (state) => state.fundDetails.fundLease;
export const getFundLeaseStatus = (state) => state.fundDetails.status;
export const geFundLeaseError = (state) => state.fundDetails.error;

//------------------> normal fund Lease table <---------------------

export const AllNoramlLeaseTable = (state) => state.fundDetails.normalfundLeasetable;
export const getNoramlLeaseTableStatus = (state) => state.fundDetails.status;
export const getNoramlLeaseTableError = (state) => state.fundDetails.error;

export const { reducer } = fundSlice;

export default fundSlice.reducer;
