import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";

const initialState = {
  management: {},
  authorityExra: [],
  authorityDetails: [],
  bank: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const getManagement = createAsyncThunk("Management/Get", async () => {
  try {
    const response = await request.get(`${APIURLS.GET_MANAGEMENT_DETAILS}`);
    return response.data;
  } catch (error) {
    throw error;
  }
});

export const getBankDetails = createAsyncThunk("BankDetails/Get", async () => {
  try {
    const response = await request.get(`${APIURLS.GET_BANK_DETAILS}`);
    return response.data;
  } catch (error) {
    throw error;
  }
});

export const getAuthorityExtraField = createAsyncThunk(
  "authorityextrafields/Get",
  async () => {
    try {
      const response = await request.get(`${APIURLS.POST_GET_Extra_Fields}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const getAuthorityDetails = createAsyncThunk(
  "authorityDetails/Get",
  async () => {
    try {
      const response = await request.get(`${APIURLS.POST_ADD_AUTHORITY}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

const managementSlice = createSlice({
  name: "managementredux",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Management
      .addCase(getManagement.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getManagement.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.management = action.payload;
      })
      .addCase(getManagement.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Bank Details
      .addCase(getBankDetails.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getBankDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.bank = action.payload;
      })
      .addCase(getBankDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Authority Extra fields Details
      .addCase(getAuthorityExtraField.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getAuthorityExtraField.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.authorityExra = action.payload;
      })
      .addCase(getAuthorityExtraField.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Authority Details
      .addCase(getAuthorityDetails.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getAuthorityDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.authorityDetails = action.payload;
      })
      .addCase(getAuthorityDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});
// Management
export const selectManagementDetails = (state) =>state.managementdetails.management;
export const getManagementStatus = (state) => state.managementdetails.status;
export const getManagementError = (state) => state.managementdetails.error;

// Bank Details
export const selectBankDetails = (state) => state.managementdetails.bank;
export const getBankStatus = (state) => state.managementdetails.status;
export const getBankError = (state) => state.managementdetails.error;

// Authority ExtraFields Details
export const selectAuthorityExtraDetails = (state) =>state.managementdetails.authorityExra;
export const getAuthorityExtraDetailsStatus = (state) =>state.managementdetails.status;
export const getAuthorityExtraDetailsError = (state) =>state.managementdetails.error;

// Authority Details
export const selectAuthorityDetails = (state) =>state.managementdetails.authorityDetails;
export const getAuthorityDetailsStatus = (state) =>state.managementdetails.status;
export const getAuthorityDetailsError = (state) =>state.managementdetails.error;

export const { reducer } = managementSlice;

export default managementSlice.reducer;
