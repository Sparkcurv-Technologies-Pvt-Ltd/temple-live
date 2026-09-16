import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";

const initialState = {
  managementInterest: [],
  managementInstallMent: [],
  managementCapital: [],
  chitFund: [],
  chitInstallMent: [],
  chitCapital: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Management Interest Table

export const getManagementInterest = createAsyncThunk(
  "ManagementInterest/Get",
  async () => {
    try {
      const response = await request.get(`${APIURLS.GET_MANAGEMENT_INTEREST}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);
// Management  Installment interest
export const getManagementInstallMent = createAsyncThunk(
  "ManagementInstallMentInterest/Get",
  async () => {
    try {
      const response = await request.get(
        `${APIURLS.GET_MANAGEMENT_INSTALLMENT}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);
// Management interest with Capital
export const getManagementCapital = createAsyncThunk(
  "ManagementInstallMentCapital/Get",
  async () => {
    try {
      const response = await request.get(`${APIURLS.GET_MANAGEMENT_CAPITAL}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

// ChitFund Interest Table

export const getChitFundInterest = createAsyncThunk(
  "ChitFundInterest/Get",
  async () => {
    try {
      const response = await request.get(`${APIURLS.GET_CHITFUND_INTEREST}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);
// ChitFund Interest InstallMent Table

export const getChitInstallMent = createAsyncThunk(
  "ChitFundInterestInstallMent/Get",
  async () => {
    try {
      const response = await request.get(`${APIURLS.GET_CHITFUND_INSTALLMENT}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

//Chit-Fund Interest With Capital

export const getChitFundCapital = createAsyncThunk(
  "ChitFundInterestCapital/Get",
  async () => {
    try {
      const response = await request.get(`${APIURLS.GET_CHITFUND_CAPITAL}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

const interestSlice = createSlice({
  name: "interestRedux",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      //--------------> Management Interest <----------------

      .addCase(getManagementInterest.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getManagementInterest.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.managementInterest = action.payload;
      })
      .addCase(getManagementInterest.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      //--------------> Management InstallMent Interest <----------------

      .addCase(getManagementInstallMent.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getManagementInstallMent.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.managementInstallMent = action.payload;
      })
      .addCase(getManagementInstallMent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      //--------------> Management Capital Interest <----------------

      .addCase(getManagementCapital.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getManagementCapital.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.managementCapital = action.payload;
      })
      .addCase(getManagementCapital.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      //--------------> Chit-Fund Interest <----------------

      .addCase(getChitFundInterest.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getChitFundInterest.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.chitFund = action.payload;
      })
      .addCase(getChitFundInterest.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      //--------------> Chit-Fund Interest InstallMent <----------------

      .addCase(getChitInstallMent.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getChitInstallMent.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.chitInstallMent = action.payload;
      })
      .addCase(getChitInstallMent.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      //--------------> Chit-Fund Interest With Capital <----------------

      .addCase(getChitFundCapital.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getChitFundCapital.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.chitCapital = action.payload;
      })
      .addCase(getChitFundCapital.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const selectManagementInteresetDetails = (state) =>state.interest.managementInterest;
export const getManagementDetailsstatus = (state) => state.interest.status;
export const getManagementDetailsError = (state) => state.interest.error;

export const selectManagementInstallMentDetails = (state) => state.interest.managementInstallMent;
export const getManagementInstallMentStatus = (state) => state.interest.status;
export const getManagementInstallMentError = (state) => state.interest.error;

export const selectManagementCapitalDetails = (state) => state.interest.managementCapital;
export const getManagementCapitalStatus = (state) => state.interest.status;
export const getManagementCapitalError = (state) => state.interest.error;

export const selectChitFundIntresetDetails = (state) => state.interest.chitFund;
export const getChitFundIntresetsStatus = (state) => state.interest.status;
export const getChitFundIntresetError = (state) => state.interest.error;

export const selectChitInstallMentDetails = (state) =>state.interest.chitInstallMent;
export const getChitInstallMentStatus = (state) => state.interest.status;
export const getChitInstallMentError = (state) => state.interest.error;

export const selectChitCapitalDetails = (state) => state.interest.chitCapital;
export const getChitCapitalStatus = (state) => state.interest.status;
export const getChitCapitalError = (state) => state.interest.error;

export const { reducer } = interestSlice;

export default interestSlice.reducer;
