import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";

const initialState = {
  collection: [],
  collectionUserbased:[],
  Userlist: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const getCollectionList = createAsyncThunk(
  "CollctionDetails/Get",
  async () => {
    try {
      const response = await request.get(`${APIURLS.COLLECTION_DETAILS}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);
export const getCollectionUserBased = createAsyncThunk(
  "CollctionUserBasedDetails/Get",
  async () => {
    try {
      const response = await request.get(
        `${APIURLS.COLLECTION_USERBASED_DETAILS}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const getCollectionUserList = createAsyncThunk(
  "CollctionUserList/Get",
  async () => {
    try {
      const response = await request.get(`${APIURLS.COLLECTION_USER_LIST}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

const collectionSlice = createSlice({
  name: "leaseredux",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Asset Category
      .addCase(getCollectionList.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getCollectionList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.collection = action.payload;
      })
      .addCase(getCollectionList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // collection userBased list
      .addCase(getCollectionUserBased.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getCollectionUserBased.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.collectionUserbased = action.payload;
      })
      .addCase(getCollectionUserBased.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // collection user list
      .addCase(getCollectionUserList.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getCollectionUserList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.Userlist = action.payload;
      })
      .addCase(getCollectionUserList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

//--------------------- Collection List-------------------------

export const selectCollectionListDetails = (state) =>state.collectiondetails.collection;
export const getCollectionListStatus = (state) =>state.collectiondetails.status;
export const getCollectionListError = (state) => state.collectiondetails.error;

//--------------------- Collection User Based List-------------------------

export const selectCollectionUserBasedDetails = (state) =>state.collectiondetails.collectionUserbased;
export const getCollectionUserBasedStatus = (state) =>state.collectiondetails.status;
export const getCollectionUserBasedError = (state) => state.collectiondetails.error;

export const selectUserlistDetails = (state) =>
  state.collectiondetails.Userlist;
export const getUserlistStatus = (state) => state.collectiondetails.status;
export const getUserlistError = (state) => state.collectiondetails.error;

export const { reducer } = collectionSlice;

export default collectionSlice.reducer;
