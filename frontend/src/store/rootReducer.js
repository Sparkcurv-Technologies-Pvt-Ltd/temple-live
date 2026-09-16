import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@modules/Auth/authSlice";
import managementReducer from "@modules/Management/ManagementSlice"
import userReducer from "@modules/Permissions/Users/UserSlice"
import adminReducer from '@modules/Permissions/Admin/AdminSlice'
import familyReducer from "@modules/FamilyDetails/FamilySlice"
import assetReducer from "@modules/Asset Details/AssetSlice"
import expenseReducer from "@modules/ExpenseDetails/ExpenseSlice"
import festivalReducer from "@modules/Festival/FestivalSlice"
import fundReducer from "@modules/Fund/FundSlice"
import subscriptionReducer from "@modules/SetSubscriptionTariff/SubscriptionTariffSlice"
import DeathDetailReducer from "@modules/DeathForm/DeathSlice"
import DeathDetailListReducer from "@modules/DeathForm/DeathSlice"
import incomeReducer from "@modules/IncomeDetails/IncomeSlice"
import marriageReducer from "@modules/Marriage/MarriageSlice"
import sangamReducer from "@modules/Sangam/SangamDetails/SangamSlice"
import leaseReducer from "@modules/Rental/RentalorLease/RentalorLeaseSlice"
import chitlistFundReducer from '@modules/ChitFund/ChitFundSlice'
import ManagementDetailsReducer from '@modules/Interest/InterestSlice'
import CollcetionDetailsReducer from '@modules/CollectionDetails/CollectionDetailsSlice'
import InvestorDashboardReducer from '@modules/InvestorDashBoard/InvestorDashBoardSlice'

// Combine all reducers.

// Define your initial state
const initialState = {
  auth: {}, // Add other reducers and their initial state here
  // Add other states here
};

const appReducer = combineReducers({

  auth: authReducer,
  managementdetails: managementReducer,
  userdetails: userReducer,
  admindetails: adminReducer,
  familyDetails: familyReducer,
  assetDetails: assetReducer,
  expenseDetails: expenseReducer,
  festivalDetails: festivalReducer,
  fundDetails: fundReducer,
  subscriptionTarif: subscriptionReducer,
  DeathDetail: DeathDetailReducer,
  incomeDetails: incomeReducer,
  marriageDetails: marriageReducer,
  leaseDetails: leaseReducer,
  sangamDetail: sangamReducer,
  chitlistFund: chitlistFundReducer,
  interest: ManagementDetailsReducer,
  DeathDetaillist: DeathDetailListReducer,
  collectiondetails: CollcetionDetailsReducer,
  investordashboard: InvestorDashboardReducer,


});

const rootReducer = (state, action) => {
  if (action.type === 'auth/logOut') {
    state = initialState;
  }
  return appReducer(state, action);
};

export default rootReducer;