import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";

const initialState = {
  family: [],
  familygroup: [],
  members: [],
  deathMembers: [],
  leavingMembers: [],
  marriageMembers: [],
  allmembers: [],
  ancestor: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const getFamilyDetails = createAsyncThunk(
  "FamilyDetails/Get",
  async () => {
    try {
      const response = await request.get(`${APIURLS.GET_ANSESTER}`);
      return [...response.data];
    } catch (error) {
      throw error;
    }
  }
);

export const getFamilyGroupDetails = createAsyncThunk(
  "FamilyGroupDetails/Get",
  async () => {
    try {
      const response = await request.get(`${APIURLS.GET_FAMILY_GROUP}`);
      return [...response.data];
    } catch (error) {
      if (error.response && error.response.status === 406) {
        const errorMessage = error.response.data.message;
        throw new Error(errorMessage);
      } else {
        // console.log(error, 'errrryyy');
        throw error;
      }
    }
  }
);

export const getMembersDetails = createAsyncThunk(
  "MembersDetails/Get",
  async () => {
    try {
      const response = await request.get(`${APIURLS.GET_MEMBER_CHITFUND}`);
      return [...response.data];
    } catch (error) {
      throw error;
    }
  }
);

export const getDeathMembers = createAsyncThunk(
  "DeathMembersDetails/Get",
  async () => {
    try {
      const response = await request.get(`${APIURLS.GET_DEATH_MEMBER_LIST}`);
      return [...response.data];
    } catch (error) {
      throw error;
    }
  }
);

export const getLeaveMembers = createAsyncThunk(
  "LeaveMembersDetails/Get",
  async () => {
    try {
      const response = await request.get(`${APIURLS.GET_LEAVING_MEMBER_LIST}`);
      return [...response.data];
    } catch (error) {
      throw error;
    }
  }
);

export const getMarriageMembers = createAsyncThunk(
  "MarriageMembersDetails/Get",
  async () => {
    try {
      const response = await request.get(
        `${APIURLS.GET_MARRIAGE_REMOVE_MEMBER_LIST}`
      );
      return [...response.data];
    } catch (error) {
      throw error;
    }
  }
);
export const getAllMembers = createAsyncThunk(
  "AllMembersDetails/Get",
  async () => {
    try {
      const response = await request.get(`${APIURLS.GET_ALL_MEMBERS_LIST}`);
      return [...response.data];
    } catch (error) {
      if (error.response && error.response.status === 406) {
        const errorMessage = error.response.data.message;
        throw new Error(errorMessage);
      } else {
        // console.log(error, 'errrryyy');
        throw error;
      }
    }
  }
);
export const getAncestor = createAsyncThunk("AncestorView/Get", async () => {
  try {
    const response = await request.get(`${APIURLS.GET_ANCESTORVIEW}`);
    return [...response.data];
  } catch (error) {
    // console.log(error, 'errrryyy');
    throw error;
  }
});

const familySlice = createSlice({
  name: "familyredux",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Ancestor Family
      .addCase(getFamilyDetails.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getFamilyDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.family = action.payload;
      })
      .addCase(getFamilyDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Family Group
      .addCase(getFamilyGroupDetails.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getFamilyGroupDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.familygroup = action.payload;
      })
      .addCase(getFamilyGroupDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Members
      .addCase(getMembersDetails.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getMembersDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.members = action.payload;
      })
      .addCase(getMembersDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Death members
      .addCase(getDeathMembers.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getDeathMembers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.deathMembers = action.payload;
      })
      .addCase(getDeathMembers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Leave members
      .addCase(getLeaveMembers.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getLeaveMembers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.leavingMembers = action.payload;
      })
      .addCase(getLeaveMembers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // marriage members
      .addCase(getMarriageMembers.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getMarriageMembers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.marriageMembers = action.payload;
      })
      .addCase(getMarriageMembers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // All members
      .addCase(getAllMembers.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getAllMembers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allmembers = action.payload;
      })
      .addCase(getAllMembers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      //aNCESTOR
      .addCase(getAncestor.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(getAncestor.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ancestor = action.payload;
      })
      .addCase(getAncestor.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});
// Family Details
export const selectFamilyDetails = (state) => state.familyDetails.family;
export const getFamilyStatus = (state) => state.familyDetails.status;
export const getFamilyError = (state) => state.familyDetails.error;

// Family Group
export const selectFamilyGroupDetails = (state) =>
  state.familyDetails.familygroup;
export const getFamilyGroupStatus = (state) => state.familyDetails.status;
export const getFamilyGroupError = (state) => state.familyDetails.error;

// members
export const selectMemberDetails = (state) => state.familyDetails.members;
export const getMemberStatus = (state) => state.familyDetails.status;
export const getMemberError = (state) => state.familyDetails.error;

// death members
export const selectDeathMemberDetails = (state) =>state.familyDetails.deathMembers;
export const getDeathMemberStatus = (state) => state.familyDetails.status;
export const getDeathMemberError = (state) => state.familyDetails.error;

// leaving members
export const selectLeavingMemberDetails = (state) =>
  state.familyDetails.leavingMembers;
export const getLeavingMemberStatus = (state) => state.familyDetails.status;
export const getLeavingMemberError = (state) => state.familyDetails.error;

// marriage members
export const selectMarriageMemberDetails = (state) =>
  state.familyDetails.marriageMembers;
export const getMarriageMemberStatus = (state) => state.familyDetails.status;
export const getMarriageMemberError = (state) => state.familyDetails.error;

// All members
export const selectAllMemberDetails = (state) => state.familyDetails.allmembers;
export const getAllMemberStatus = (state) => state.familyDetails.status;
export const getAllMemberError = (state) => state.familyDetails.error;

// Ancestor
export const selectAllAncestorDetails = (state) => state.familyDetails.ancestor;
export const getAllAncestorStatus = (state) => state.familyDetails.status;
export const getAllAncestorError = (state) => state.familyDetails.error;

export const { reducer } = familySlice;

export default familySlice.reducer;
