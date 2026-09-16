import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";

// Sep 2026 fix — each dataset now gets its OWN status/error pair instead
// of sharing a single top-level `status`/`error`. Previously all six
// thunks (managementInterest, managementInstallMent, managementCapital,
// chitFund, chitInstallMent, chitCapital) wrote to the same `state.status`
// / `state.error`, so when multiple thunks were dispatched together (e.g.
// ManagementInterest.jsx firing all three Management thunks on mount),
// whichever request settled last would clobber the loading/succeeded/
// failed state for the other tabs too — causing tabs to flicker into the
// wrong status, show a stale error from an unrelated request, or briefly
// render "succeeded" with stale data while their own fetch was still in
// flight. Each thunk now only ever touches its own status/error field.
const initialState = {
  managementInterest: [],
  managementInterestStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  managementInterestError: null,

  managementInstallMent: [],
  managementInstallMentStatus: "idle",
  managementInstallMentError: null,

  managementCapital: [],
  managementCapitalStatus: "idle",
  managementCapitalError: null,

  chitFund: [],
  chitFundStatus: "idle",
  chitFundError: null,

  chitInstallMent: [],
  chitInstallMentStatus: "idle",
  chitInstallMentError: null,

  chitCapital: [],
  chitCapitalStatus: "idle",
  chitCapitalError: null,
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

      .addCase(getManagementInterest.pending, (state) => {
        state.managementInterestStatus = "loading";
      })
      .addCase(getManagementInterest.fulfilled, (state, action) => {
        state.managementInterestStatus = "succeeded";
        state.managementInterest = action.payload;
      })
      .addCase(getManagementInterest.rejected, (state, action) => {
        state.managementInterestStatus = "failed";
        state.managementInterestError = action.error.message;
      })

      //--------------> Management InstallMent Interest <----------------

      .addCase(getManagementInstallMent.pending, (state) => {
        state.managementInstallMentStatus = "loading";
      })
      .addCase(getManagementInstallMent.fulfilled, (state, action) => {
        state.managementInstallMentStatus = "succeeded";
        state.managementInstallMent = action.payload;
      })
      .addCase(getManagementInstallMent.rejected, (state, action) => {
        state.managementInstallMentStatus = "failed";
        state.managementInstallMentError = action.error.message;
      })

      //--------------> Management Capital Interest <----------------

      .addCase(getManagementCapital.pending, (state) => {
        state.managementCapitalStatus = "loading";
      })
      .addCase(getManagementCapital.fulfilled, (state, action) => {
        state.managementCapitalStatus = "succeeded";
        state.managementCapital = action.payload;
      })
      .addCase(getManagementCapital.rejected, (state, action) => {
        state.managementCapitalStatus = "failed";
        state.managementCapitalError = action.error.message;
      })
      //--------------> Chit-Fund Interest <----------------

      .addCase(getChitFundInterest.pending, (state) => {
        state.chitFundStatus = "loading";
      })
      .addCase(getChitFundInterest.fulfilled, (state, action) => {
        state.chitFundStatus = "succeeded";
        state.chitFund = action.payload;
      })
      .addCase(getChitFundInterest.rejected, (state, action) => {
        state.chitFundStatus = "failed";
        state.chitFundError = action.error.message;
      })

      //--------------> Chit-Fund Interest InstallMent <----------------

      .addCase(getChitInstallMent.pending, (state) => {
        state.chitInstallMentStatus = "loading";
      })
      .addCase(getChitInstallMent.fulfilled, (state, action) => {
        state.chitInstallMentStatus = "succeeded";
        state.chitInstallMent = action.payload;
      })
      .addCase(getChitInstallMent.rejected, (state, action) => {
        state.chitInstallMentStatus = "failed";
        state.chitInstallMentError = action.error.message;
      })

      //--------------> Chit-Fund Interest With Capital <----------------

      .addCase(getChitFundCapital.pending, (state) => {
        state.chitCapitalStatus = "loading";
      })
      .addCase(getChitFundCapital.fulfilled, (state, action) => {
        state.chitCapitalStatus = "succeeded";
        state.chitCapital = action.payload;
      })
      .addCase(getChitFundCapital.rejected, (state, action) => {
        state.chitCapitalStatus = "failed";
        state.chitCapitalError = action.error.message;
      });
  },
});

export const selectManagementInteresetDetails = (state) => state.interest.managementInterest;
export const getManagementDetailsstatus = (state) => state.interest.managementInterestStatus;
export const getManagementDetailsError = (state) => state.interest.managementInterestError;

export const selectManagementInstallMentDetails = (state) => state.interest.managementInstallMent;
export const getManagementInstallMentStatus = (state) => state.interest.managementInstallMentStatus;
export const getManagementInstallMentError = (state) => state.interest.managementInstallMentError;

export const selectManagementCapitalDetails = (state) => state.interest.managementCapital;
export const getManagementCapitalStatus = (state) => state.interest.managementCapitalStatus;
export const getManagementCapitalError = (state) => state.interest.managementCapitalError;

export const selectChitFundIntresetDetails = (state) => state.interest.chitFund;
export const getChitFundIntresetsStatus = (state) => state.interest.chitFundStatus;
export const getChitFundIntresetError = (state) => state.interest.chitFundError;

export const selectChitInstallMentDetails = (state) => state.interest.chitInstallMent;
export const getChitInstallMentStatus = (state) => state.interest.chitInstallMentStatus;
export const getChitInstallMentError = (state) => state.interest.chitInstallMentError;

export const selectChitCapitalDetails = (state) => state.interest.chitCapital;
export const getChitCapitalStatus = (state) => state.interest.chitCapitalStatus;
export const getChitCapitalError = (state) => state.interest.chitCapitalError;

export const { reducer } = interestSlice;

export default interestSlice.reducer;
