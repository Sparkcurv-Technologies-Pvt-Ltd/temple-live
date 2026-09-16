import { NetWorkError } from "@router/components/NetWorkError"
import PageNotFound from "@router/components/PageNotFound"
import UserSignin from "@modules/Auth/Partials/UserSignin"
import PublicMemberStatement from "@modules/PublicStatement/PublicMemberStatement"
import PublicInterestStatement from "@modules/PublicStatement/PublicInterestStatement"
import AddAuthorities from "@modules/Management/Authorities/AddAuthorities/Partials/AddAuthorities"
import AddSangamDetails from "@modules/Sangam/SangamDetails/Partials/AddSangamDetails"
import { AddIncomeForm } from "@modules/IncomeDetails/AddIncomeForms/Partials/AddIncome"
import { AddExpenseForm } from "@modules/ExpenseDetails/AddExpense/Partials/AddExpense"
import IncomeList from "@modules/IncomeDetails/AddIncomeForms/Partials/IncomeList"
import ExpenseList from "@modules/ExpenseDetails/AddExpense/Partials/ExpenseList"
import SangamList from "@modules/Sangam/SangamDetails/Partials/SangamList"
import AuthorityList from "@modules/Management/Authorities/AddAuthorities/Partials/AuthorityList"
import { Collection } from "@modules/CollectionDetails/Partials/Collection"
import { ChitFundSettlement } from "@modules/ChitFund/Partials/ChitFundSettlement/ChitFundSettlement"
import { ChitFundSettlementApplication } from "@modules/ChitFund/Partials/SettlementApplication/Partials/ChitFundSettlementAppln"
import { ChitFundDistribution } from "@modules/ChitFund/Partials/ChitProfitDistribution/Partials/ChitFundProfitDistribution"
import ChitFundProrfitDistributionList from "@modules/ChitFund/Partials/ChitProfitDistribution/Partials/ChitFundProfitDistributionList"
import { AddChitFund } from "@modules/ChitFund/Partials/AddChitFunds/Partials/AddChitFund"
import { ChitFundInvestors } from "@modules/ChitFund/Partials/ChitFundInvestors/Partials/ChitFundInvestors"
import RentalorLeaseExtend from "@modules/Rental/LeaseExtend/Partials/RentalorLeaseExtend"
import RentalorLeaseList from "@modules/Rental/LeaseExtend/Partials/RentalorLeaseList"
import ViewFundLeaseMember from "@modules/Fund/FundLease/Partials/ViewFundLease"
import ViewFundCollectionHistory from "@modules/CollectionDetails/Partials/ViewFundCollectionHistory"
import PendingPenaltyList from "@modules/CollectionDetails/Partials/PendingPenaltyList"
import ManagementInterest from "@modules/Interest/Partials/ManagementInterest"
import ChitFundInterest from "@modules/Interest/Partials/ChitFundInterest"
import FundLeaseHistory from "@modules/Fund/FundDetails/Partials/FundLeaseHistory"
import TaxList from "@modules/SetTax/Partials/TaxList"
import ChitFundLists from "@modules/ChitFund/Partials/AddChitFunds/Partials/ChitFundList"
import ChitFundInterestPeopleList from "@modules/Interest/Partials/ChitFundInterestPeopleList"
import BalanceSheet from "@modules/Fund/FundDetails/Partials/BalanceSheet"
import DeathForm from "@modules/DeathForm/partials/DeathForm"
import Marriage from "@modules/Marriage/Partials/Marriage"
import DeathDetailList from "@modules/DeathForm/partials/DeathList"
import MarriageList from "@modules/Marriage/Partials/MarriageList"
import { SetSubscriptionTariff } from "@modules/SetSubscriptionTariff/Partials/SetSubscriptionTariff"
import SubscriptionTariffList from "@modules/SetSubscriptionTariff/Partials/SubscriptionTariffList"
import MemberList from "@modules/FamilyDetails/partials/MemberList"
import FamilyGroup from "@modules/FamilyDetails/partials/FamilyGroup"
import { AddFamilyDetails } from "@modules/FamilyDetails/partials/AddFamilyDetails"
import { AddFestival } from "@modules/Festival/Partials/AddFestival"
import { FestivalList } from "@modules/Festival/Partials/FestivalList"
import { Interest } from "@modules/Interest/Partials/Interest"
import { FundLeaseCase } from "@modules/Fund/Partials/FundLeaseCase"
import { RentalandLeaseList } from "@modules/Rental/RentalorLease/Partials/RentalandLeaseList"
import MemberProfile from "@modules/FamilyDetails/partials/MemberProfile"
import { CreateFund } from "@modules/Fund/CreateFund/Partials/CreateFund"
import ViewFund from "@modules/Fund/CreateFund/Partials/ViewFundsTable"
import ManagementInterestProfile from "@modules/Interest/Partials/ManagementInterestProfile"
import { Fund } from "@modules/Fund/AddFund/Partials/Fund"
import FundList from "@modules/Fund/AddFund/Partials/ViewFundList"
import FundMemberProfile from "@modules/Fund/FundDetails"
import ViewFundMemDetails from "@modules/Fund/FundMembers/Partials/ViewFundMemProfile"
import ChitFundInterestProfile from "@modules/Interest/Partials/ChitFundInterestProfile"
import { Instruction } from "@modules/ChitFund/Partials/Instruction"
import { CreateUsers } from "@modules/Permissions"
import { UsersTable } from "@modules/Permissions/Admin"
import RoleList from "@modules/Permissions/Users/Partials/RoleList"
import ManagementDetails from "@modules/Management/ManagementDetails"
import HomeView from "@modules/Home/Partials/FirstModal"
import ViewFamilyDetails from "@modules/FamilyDetails/partials/ViewFamilyDetails"
import Ancestorview from "@modules/FamilyDetails/partials/Ancestorview"
import { AssestIndex } from "@modules/Asset Details/AssestIndex"
import AssestTableIndex from "@modules/Asset Details/AssestTableIndex"
import { CollectionUserList } from "@modules/CollectionDetails/Partials/CollectionUserList"
import { BalanceSheetOverall } from "@modules/BalanceSheet"
import { RentalTabIndex } from "@modules/Rental/RentalorLease/Partials/RentalTabIndex"
import { CategoryIndex } from "@modules/Asset Details/CategoryIndex"
import { InvestorLoginRegister } from "@modules/ChitFund/Partials/ChitFundInvestors/Partials/InvestorLoginRegister"
import { InvestorDashBoardDetails } from "@modules/InvestorDashBoard"
import { IncomeCategoryAndName } from "@modules/IncomeDetails/Category&NameList"
import { AllReports } from "@modules/Report"
import { ExpenseCategoryAndNameList } from "@modules/ExpenseDetails/Category&NameList"
import FundLease from "@modules/Fund/FundLease"
import ChitFundBalanceSheet from "@modules/ChitFund/Partials/BalanceSheet"
import ChitFundSettlementApplicationList from "@modules/ChitFund/Partials/SettlementApplication/Partials/ChitFundSettlementApplnList"
import ChitFundSettlementList from "@modules/ChitFund/Partials/ChitFundSettlement/Partials/ChitFundSettlementList"
import ChitFundListView from "@modules/ChitFund/Partials/AddChitFunds/Partials/ChitFundListView"
import ChitFundPendingBorrowersPage from "@modules/ChitFund/Partials/AddChitFunds/Partials/ChitFundPendingBorrowersPage"
import { InvestorTable } from "@modules/ChitFund/Partials/ChitFundInvestors/InvestorTable"
import BankTransactionForm from "@modules/BankTransaction/Partials/BankTransactionForm"



export const anonymous = [
    {
        routePath: '/signin',
        Component: UserSignin,
    },
    {
        // Public 1-year member statement, opened via WhatsApp link.
        routePath: '/statement/:token',
        Component: PublicMemberStatement,
    },
    {
        // Public 1-year statement for a specific interest loan (Chit Fund
        // Interest / Management Interest). Used when the borrower is not a
        // Member (people_type = "Other").
        routePath: '/interest-statement/:token',
        Component: PublicInterestStatement,
    },


]

export const adminAuthenticated = [
 
    {
        routePath: '/',
        Component: HomeView,
    },
    {
        routePath: '/family',
        Component: AddFamilyDetails,
    },
    {
        routePath: '/view_family_details/:id',
        Component: ViewFamilyDetails,
    },
    {
        routePath: '/ancestor_view/:id',
        Component: Ancestorview,
    },
    {
        routePath: 'DeathForm',
        Component: DeathForm,
    },
    {
        routePath: '/management_details',
        Component: ManagementDetails,
    },
    {
        routePath: '/add_authorities',
        Component: AddAuthorities,
    },
    {
        routePath: '/add_sangam_details',
        Component: AddSangamDetails,
    },
    {

        routePath: '/Marriage',
        Component: Marriage,
    },
    {
        routePath: '/add_income',
        Component: AddIncomeForm,
    },
    {
        routePath: '/income_category_and_Name',
        Component: IncomeCategoryAndName,
    },
    {
        routePath: '/expense_category_and_Name',
        Component: ExpenseCategoryAndNameList,
    },
    {
        routePath: '/add_expense',
        Component: AddExpenseForm,
    },
    {
        routePath: '/add_users',
        Component: CreateUsers,
    },
    {
        routePath: 'AddFestival',
        Component: AddFestival,
    },
    {
        routePath: 'AssetDetails',
        Component: AssestIndex,
    },
    {
        routePath: '/asset_list',
        Component: AssestTableIndex,
    },
    {
        routePath: '/categorieslist',
        Component: CategoryIndex,
    },
    {
        routePath: '/view_income',
        Component: IncomeList,
    },
    {
        routePath: '/view_expense',
        Component: ExpenseList,
    },
    {
        routePath: '/view_deathlist',
        Component: DeathDetailList,
    },
    {
        routePath: '/view_marriagelist',
        Component: MarriageList,
    },
    {
        routePath: '/view_sangamlist',
        Component: SangamList,
    },
    {
        routePath: 'SetSubscriptionTariff',
        Component: SetSubscriptionTariff,
    },
    {
        routePath: 'FestivalList',
        Component: FestivalList,
    },
    {
        routePath: '/view_authoritylist',
        Component: AuthorityList,
    },
    {
        routePath: '/view_userslist',
        Component: UsersTable,
    },
    {
        routePath: '/collection',
        Component: Collection,
    },
    {
        routePath: '/CollectionUserList',
        Component: CollectionUserList,
    },
    {
        routePath: '/create_fund',
        Component: CreateFund,
    },
    {
        routePath: '/fund',
        Component: Fund,
    },
    {
        routePath: '/view_fundlist',
        Component: FundList,
    },
    {
        routePath: '/view_fund',
        Component: ViewFund,
    },
    {
        routePath: '/view_fund_member_profile/:id',
        Component: FundMemberProfile,
    },
    {
        routePath: 'view_fund_member_details/:id',
        Component: ViewFundMemDetails,
    },
    {
        routePath: '/chitfund_settlement',
        Component: ChitFundSettlement,
    },
    {
        routePath:'/chit_fund_settlementList',
        Component:ChitFundSettlementList

    },
    {
        routePath: '/chitfund_settlement_application',
        Component: ChitFundSettlementApplication,
    },
    {
        routePath:'/view_settlement_application',
        Component:ChitFundSettlementApplicationList,
    },
    {
        routePath: '/chitfund_profitdistribution',
        Component: ChitFundDistribution,
    },
    {
        routePath: '/chitfund_profitdistributionlist',
        Component: ChitFundProrfitDistributionList,
    },
    {
        routePath: '/terms_and_conditions',
        Component: Instruction,
    },
    {
        routePath: '/chitfund_balancesheet',
        Component: ChitFundBalanceSheet,
    },
    {
        routePath: '/add_chitfund',
        Component: AddChitFund,
    },
    {
        routePath: '/chitfund_investors',
        Component: ChitFundInvestors,
    },
    {
        routePath: '/chitfund_investors_view',
        Component: InvestorTable,
    },
    {
        routePath: '/investor_login_register',
        Component: InvestorLoginRegister,
    },
    {
        routePath: '/FundLease',
        Component: FundLease,
    },
    {
        routePath: 'FundLeaseCase',
        Component: FundLeaseCase,
    },
    {
        routePath: '/rental_leaseextend',
        Component: RentalorLeaseExtend,
    },
    {
        routePath: '/rental_leaselist',
        Component: RentalorLeaseList,
    },
    // {
    //     routePath:'/rental_leaseextendlist',
    //     Component: RentalorLeaseExtendList,
    // },
    {
        routePath: '/rental_lease',
        Component: RentalTabIndex,
    },
    // {
    //     routePath:'/set_tax',
    //     Component: SetTax,
    // },
    {
        routePath: 'balanceSheetAll',
        Component: BalanceSheetOverall,
    },
    {
        routePath: '/view_fund_lease_member',
        Component: ViewFundLeaseMember,
    },
    {
        routePath: '/view_fund_collectiohistory',
        Component: ViewFundCollectionHistory,
    },
    {
        routePath: '/pending_penality_list',
        Component: PendingPenaltyList,
    },
    {
        routePath: '/management_interest',
        Component: ManagementInterest,
    },
    {
        routePath: '/chit_fund_interest',
        Component: ChitFundInterest,
    },
    {
        routePath: '/fund_lease_history',
        Component: FundLeaseHistory,
    },
    {
        routePath: '/subscription_tariff_list',
        Component: SubscriptionTariffList,
    },
    {
        routePath: '/tax_list',
        Component: TaxList,
    },
    {
        routePath: '/chit_fund_lists',
        Component: ChitFundLists,
    },
    {
        routePath: '/chit_fund_interest_peoplelist',
        Component: ChitFundInterestPeopleList,
    },
    {
        routePath: '/Interest',
        Component: Interest,
    },
    {
        routePath: '/member_list',
        Component: MemberList,
        // Component: AllFamilyMemberList ,
    },
    {
        routePath: '/family_group',
        Component: FamilyGroup,
    },
    {
        routePath: '/balance_sheet',
        Component: BalanceSheet,
    },
    {
        routePath: '/role_list',
        Component: RoleList,
    },
    {
        routePath: '/RentalandLeaseList',
        Component: RentalandLeaseList,
    },
    {
        routePath: '/memberProfileView/:id',
        Component: MemberProfile,
    },
    {
        routePath: '/chitfundListView/:id',
        Component: ChitFundListView,
    },
    {
        routePath: '/chit-fund/:id/pending-borrowers',
        Component: ChitFundPendingBorrowersPage,
    },
    {
        routePath: '/ManagementInterestProfile/:id',
        Component: ManagementInterestProfile,
    },
    {
        routePath: '/chit-Fund_Interest/:id',
        Component: ChitFundInterestProfile,
    },
    {
        routePath: '/bank_transaction',
        Component: BankTransactionForm,
    },
    {
        routePath: '/all_reports',
        Component: AllReports,
    },
    {       // ----------- Page Not Fonund
        routePath: '*',
        Component: PageNotFound,
    },
    {       // ----------- Network Error
        routePath: 'networkerror',
        Component: NetWorkError,
    },


]

export const userAuthenticated = [
  
    {
        routePath: '/',
        Component: HomeView,
    },
    {
        routePath: '/family',
        Component: AddFamilyDetails,
    },
    {
        routePath: '/view_family_details/:id',
        Component: ViewFamilyDetails,
    },
    {
        routePath: '/ancestor_view/:id',
        Component: Ancestorview,
    },
    {
        routePath: 'DeathForm',
        Component: DeathForm,
    },
    {
        routePath: '/management_details',
        Component: ManagementDetails,
    },
    {
        routePath: '/add_authorities',
        Component: AddAuthorities,
    },
    {
        routePath: '/add_sangam_details',
        Component: AddSangamDetails,
    },
    {

        routePath: '/Marriage',
        Component: Marriage,
    },
    {
        routePath: '/add_income',
        Component: AddIncomeForm,
    },
    {
        routePath: '/income_category_and_Name',
        Component: IncomeCategoryAndName,
    },
    {
        routePath: '/add_expense',
        Component: AddExpenseForm,
    },
    {
        routePath: 'AddFestival',
        Component: AddFestival,
    },
    {
        routePath: 'AssetDetails',
        Component: AssestIndex,
    },
    {
        routePath: '/asset_list',
        Component: AssestTableIndex,
    },
    {
        routePath: '/categorieslist',
        Component: CategoryIndex,
    },
    {
        routePath: '/view_income',
        Component: IncomeList,
    },
    {
        routePath: '/view_expense',
        Component: ExpenseList,
    },
    {
        routePath: '/view_deathlist',
        Component: DeathDetailList,
    },
    {
        routePath: '/view_marriagelist',
        Component: MarriageList,
    },
    {
        routePath: '/view_sangamlist',
        Component: SangamList,
    },
    {
        routePath: 'SetSubscriptionTariff',
        Component: SetSubscriptionTariff,
    },
    {
        routePath: 'FestivalList',
        Component: FestivalList,
    },
    {
        routePath: '/view_authoritylist',
        Component: AuthorityList,
    },
    {
        routePath: '/collection',
        Component: Collection,
    },

    {
        routePath: '/CollectionUserList',
        Component: CollectionUserList,
    },
    {
        routePath: '/create_fund',
        Component: CreateFund,
    },
    {
        routePath: '/fund',
        Component: Fund,
    },
    {
        routePath: '/view_fundlist',
        Component: FundList,
    },
    {
        routePath: '/view_fund',
        Component: ViewFund,
    },
    {
        routePath: '/view_fund_member_profile/:id',
        Component: FundMemberProfile,
    },
    {
        routePath: 'view_fund_member_details/:id',
        Component: ViewFundMemDetails,
    },
    {
        routePath: '/chitfund_settlement',
        Component: ChitFundSettlement,
    },
    {
        routePath:'/chit_fund_settlementList',
        Component:ChitFundSettlementList

    },
    {
        routePath: '/chitfund_settlement_application',
        Component: ChitFundSettlementApplication,
    },
    {
        routePath:'/view_settlement_application',
        Component:ChitFundSettlementApplicationList,
    },
    {
        routePath: '/chitfund_profitdistribution',
        Component: ChitFundDistribution,
    },
    {
        routePath: '/chitfund_profitdistributionlist',
        Component: ChitFundProrfitDistributionList,
    },
    {
        routePath: '/terms_and_conditions',
        Component: Instruction,
    },
    {
        routePath: '/chitfund_balancesheet',
        Component: ChitFundBalanceSheet,
    },
    {
        routePath: '/add_chitfund',
        Component: AddChitFund,
    },
    {
        routePath: '/chitfund_investors',
        Component: ChitFundInvestors,
    },
    {
        routePath: '/chitfund_investors_view',
        Component: InvestorTable,
    },
    {
        routePath: '/FundLease',
        Component: FundLease,
    },
    {
        routePath: 'FundLeaseCase',
        Component: FundLeaseCase,
    },
    {
        routePath: '/rental_leaseextend',
        Component: RentalorLeaseExtend,
    },
    {
        routePath: '/rental_leaselist',
        Component: RentalorLeaseList,
    },
    // {
    //     routePath:'/rental_leaseextendlist',
    //     Component: RentalorLeaseExtendList,
    // },
    {
        routePath: '/rental_lease',
        Component: RentalTabIndex,
    },
    // {
    //     routePath:'/set_tax',
    //     Component: SetTax,
    // },
    {
        routePath: 'balanceSheetAll',
        Component: BalanceSheetOverall,
    },
    {
        routePath: '/view_fund_lease_member',
        Component: ViewFundLeaseMember,
    },
    {
        routePath: '/view_fund_collectiohistory',
        Component: ViewFundCollectionHistory,
    },
    {
        routePath: '/pending_penality_list',
        Component: PendingPenaltyList,
    },
    {
        routePath: '/management_interest',
        Component: ManagementInterest,
    },
    {
        routePath: '/chit_fund_interest',
        Component: ChitFundInterest,
    },
    {
        routePath: '/fund_lease_history',
        Component: FundLeaseHistory,
    },
    {
        routePath: '/subscription_tariff_list',
        Component: SubscriptionTariffList,
    },
    {
        routePath: '/tax_list',
        Component: TaxList,
    },
    {
        routePath: '/chit_fund_lists',
        Component: ChitFundLists,
    },
    {
        routePath: '/chit_fund_interest_peoplelist',
        Component: ChitFundInterestPeopleList,
    },
    {
        routePath: '/Interest',
        Component: Interest,
    },
    {
        routePath: '/member_list',
        Component: MemberList,
        // Component: AllFamilyMemberList ,
    },
    {
        routePath: '/family_group',
        Component: FamilyGroup,
    },
    {
        routePath: '/balance_sheet',
        Component: BalanceSheet,
    },
    {
        routePath: '/role_list',
        Component: RoleList,
    },
    {
        routePath: '/RentalandLeaseList',
        Component: RentalandLeaseList,
    },
    {
        routePath: '/memberProfileView/:id',
        Component: MemberProfile,
    },
    {
        routePath: '/chitfundListView/:id',
        Component: ChitFundListView,
    },
    {
        routePath: '/chit-fund/:id/pending-borrowers',
        Component: ChitFundPendingBorrowersPage,
    },
    {
        routePath: '/ManagementInterestProfile/:id',
        Component: ManagementInterestProfile,
    },
    {
        routePath: '/chit-Fund_Interest/:id',
        Component: ChitFundInterestProfile,
    },
    {       // ----------- Page Not Fonund
        routePath: '*',
        Component: PageNotFound,
    },
    {       // ----------- Network Error
        routePath: 'networkerror',
        Component: NetWorkError,
    },


]

export const investerDashBoard = [
    {
        routePath: '/',
        Component: InvestorDashBoardDetails,
    },
    {       // ----------- Page Not Fonund
        routePath: '*',
        Component: PageNotFound,
    },
    {       // ----------- Network Error
        routePath: 'networkerror',
        Component: NetWorkError,
    },
   

]