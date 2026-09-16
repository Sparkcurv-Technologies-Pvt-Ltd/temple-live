
// =======  Auth Start ======
const LOGIN = 'user/login'; // ( Auth Login Post)
// =======  Auth End ======

//  ======= Management Details Starts =======
const POST_MANAGEMENT_DETAILS = 'management/add_management/'
const GET_MANAGEMENT_DETAILS = 'management/add_management/'
const PUT_MANAGEMENT_DETAILS = 'management/edit_management'
const GET_BANK_DETAILS = 'management/view_bank_details/'

//  ======= Management Details Ends =======


//  ======= Add Authorities End ========

//===== Asset Start ======

const POST_Asset_Category = `assets/add_asset_category_details/`
const EDIT_ASSET_CATEGORY = `assets/edit_asset_category_details`
const GET_ASSET_CATEGORY = 'assets/add_asset_category_details/'
const POST_ASSET_DETAILS = 'assets/add_asset_details/'
const GET_ASSET_DETAILS = 'assets/add_asset_details/'
const PUT_ASSET_DETAILS = 'assets/edit_asset_details/'
const DELETE_ASSET_DETAILS = 'assets/edit_asset_details/'

const GET_ASSET_UNDER_ASSET_CATEGORY = 'assets/lease_page_categ_wise_asset_details/'

// moveableasset
const GET_MOVABLEASSET_DETAILS ='assets/add_movableasset_details/'
const DELETE_MOVABLEASSET_DETAILS ='assets/edit_movableasset_details/'
const PUT_MOVEABLE_ASSET_DETAILS = 'assets/edit_movableasset_details/'

//===== Asset End ======


// Movable Assets

const GET_MOVABLE_ASSET_CATEGORY = 'assets/add_movableasset_category_details/'
const POST_MOVABLE_ASSET_CATEGORY_MODAL = 'assets/add_movableasset_category_details/'
const EDIT_MOVABLE_ASSET_CATEGORY = 'assets/edit_movableasset_category_details'
const POST_MOVABLE_CATEGORY = 'assets/add_movableasset_details/'
const GET_RENTAL_MOVABLE_ASSET_CATEGORY = 'assets/lease_page_categ_wise_movable_asset_details/'

//  ======= Authorities Start ========


const POST_GET_Extra_Fields = `authorities/add_extrafield_authority/`
const POST_GET_AUTHORITY_POSTION = `authorities/add_authority_position/`
const GET_AUTHORITY_MEMBER = 'authorities/get_authrity_members_view/'
const GET_FUND_NOMINEE_MEMBER = 'authorities/get_authrity_members_view2/'
const POST_ADD_AUTHORITY = 'authorities/add_authority_Details/'
const PUT_AUTHORITY_DETAILS = 'authorities/edit_authority_Details'
const PATCH_RESIGN_AUTHORITY = 'authorities/authority_resign'
const PATCH_REJOIN_AUTHORITY = 'authorities/authority_rejoin'

//===== Authorities end ====

//===== Family Add Starts ======

const POST_ADD_FAMILY = 'family/add_family/'
const GET_ANSESTER = 'family/ansester_view/'
const GET_ANCESTER_EDIT ='family/ansester_view_edit_family'
const GET_FAMILY_GROUP = 'family/add_family/'
// const GET_FAMILY_GROUP = 'family/family_group_view/'
const PUT_PATCH_FAMILY_GROUP = 'family/edit_family/'
const GET_FAMILY_MEMBERS = 'family/members_view/'
// const GET_ALL_MEMBERS = 'family/members_view/'
const GET_ALL_MEMBERS = 'family/alive_members_view/'
const GET_MEMBER_PROFILE_LIST = 'family/single_member_view'
const GET_DEATH_MEMBER_LIST = 'family/death_members_view/'
const GET_LEAVING_MEMBER_LIST = 'family/leaving_members_view/'
const GET_MARRIAGE_REMOVE_MEMBER_LIST = 'family/marriage_remove_members_view/'
const GET_ALL_MEMBERS_LIST ='family/members_view/'
const GET_ANCESTORVIEW ='family/ansester_view/'
const GET_LINK_FAMILY_ANCESTOR ='family/view_family_link_to_ancester'
const MEMBER_BALANCESHEET_FROMTODATE_POST = 'family/Single_mem_balancesheet/'

//===== Family Add Ends  ======

//  ======= ROLE Starts =======

const POST_ROLE_PERMISSION = 'permisions/add_role_details/'
const GET_ROLE_PERMISSION = 'permisions/add_role_details/'
const PUT_ROLE_PERMISSION = 'permisions/edit_role/'

// === POST 

const POST_USER = 'user/user_register'
const GET_USER = 'user/users_view/'
const DELETE_USER = 'user/user_edit/'
const PUT_USER = 'user/user_edit/'
//  ======= User Ends =======

//  ======= Expense Starts =======

const POST_EXPENSE_CATEGORY = 'expense/add_expen_categry/'
const GET_EXPENSE_CATEGORY = 'expense/add_expen_categry/'
const UPDATE_EXPENSE_CATEGORY = 'expense/edit_expen_categry'
const POST_EXPENSE_NAME = 'expense/add_expen_names/'
const GET_EXPENSE_NAME = 'expense/add_expen_names/'
const UPDATE_EXPENSE_NAME = 'expense/edit_expen_names'
const POST_EXPENSE = 'expense/add_expen_details/'
const GET_EXPENSE = 'expense/add_expen_details/'
const EDIT_EXPENSE = 'expense/edit_expen_details'
const DELETE_EXPENSE = 'expense/edit_expen_details'

//  ======= Expense Ends =======

//  ======= Festival Starts =======

const POST_FESTIVAL = 'festival/add_festival_details/'
const GET_FESTIVAL = 'festival/add_festival_details/'
const DLETE_FESTIVAL = 'festival/edit_festival_details/'
const PUT_FESTIVAL = 'festival/edit_festival_details/'
//  ======= Festival Ends =======

//  ======= Fund Starts =======

const POST_CREATE_FUND = 'fund/add_fund_name_details/'
const GET_CREATED_FUND = 'fund/add_fund_name_details/'
const GET_CHOOSE_FUND_GROUP ='fund/fund_group_view_fundname/'
const DELETE_FUND_DETAils = 'fund/edit_fund_name_details/'
const PUT_FUND_DETAILS = 'fund/edit_fund_name_details/'

const POST_FUND_SETTLEMENT ='fund/lease_fund_settlement'

const POST_FUND_DETAILS = 'fund/add_fund_groups/'
const GET_FUND_DETAILS = 'fund/add_fund_groups/'
const EDIT_FUND_GROUP = 'fund/edit_fund_groups'
const GET_FUNDGROUP_MEMBER = 'fund/fund_profile_page'

const GET_FUND_LEASE = 'fund/lease_page_fund_get/'
const GET_NORMAL_FUND_LEASE = 'fund/lease_page_normal_fund_get/'
const GET_NORMAL_FUND_LEASE_TABLE = 'fund/lease_normal_view/'
const GET_FUND_NAME_SEND = 'fund/new_lease_page_fund_get'
const POST_GET_FUND_LEASE = 'fund/fund_lease_details/'
const PUT_FUND_LEASE = 'fund/edit_fund_lease_details'
const VIEWPROFILE_FUND_LEASE_BASEDON_MEMBER = 'fund/view_fund_lease_profile_page'

//=================CHIT FUND BALANCE SHEET =================
const BALANCESHEET_DATE_POST = 'balancesheet/balancesheet_view/'
const BALANCESHEET_CHIT_FUND_POST = 'balancesheet/balancesheet_chitfundview/'


//  ======= Fund Ends =======

// ==========  Collections start ============

const COLLECTION_DETAILS = 'collection/add_collection_details/'
const COLLECTION_EDIT_DELETE = 'collection/edit_collections_details'
const SELECTED_TYPE_COLLECTIONS = 'collection/get_select_type/'
const SELECTED_TYPE_COLLECT_TWO = 'collection/get_select_member_collection/'
const GET_MANAGE_INTEREST_DETAILS = 'collection/management_interest_member_details/'
const POST_INT_PERSON_DETAILS = 'collection/chitfund_interest_member_details/'
const FIND_MEM_ID_POST = 'collection/get_amount_details/'
const FUND_MEM_DETAILS = 'collection/fund_member_details/'
const SUBSCRIPTION_COLLECTIONS = 'collection/get_sub_tariff_details/'
const MARRIAGE_COLLECTIONS = 'collection/get_marriage_detail/'
const BALANCE_COLLECTIONS ='collection/get_member_balance/'
const BALANCE_INTEREST_COLLECTIONS = 'collection/interest_balance_collection/'
const CHIT_INT_COLLECTIONS = 'collection/chit_fund_details/'
const INT_CATEGORY_DETAILS ='collection/chitname_get_details/'

const COLLECTION_USER_LIST ='collection/collection_user_list/'
const COLLECTION_USER_DATE ='collection/collection_summary_user_date/'
const COLLECTION_USERBASED_DETAILS ='collection/collection_list_filter_by_user/'


const COLLECTION_INTEREST_FILTER_DETAILS = 'collection/chitname_withfiltering_category/'

// =========== Collections end ===========

// ==========  Interest page url start ============

const MEMBER_SELECT_GET = 'interest/interest_member_list'
const CHIT_FUND_OPTN_GET = 'chit_fund/add_chit_fund/'
const INTREST_POST_URL = 'interest/add_interest_given_details/'
const INTREST_EDIT_URL = 'interest/edit_interest_given_details'
const MANAGEMENT_INTEREST_TABLE = 'interest/management_interest_details_table/'
const MANAGEMENT_INTEREST_PROFILE_GET = 'interest/interest_profile'
const APPLY_OVERDUE_INTEREST = 'interest/apply_overdue_interest_and_penalty/'
const RECOMPUTE_INTEREST_BALANCE = 'interest/recompute_interest_balance/'

// ==========  Interest page url end ============

// ==========  CHIT FUNT page url start ============

const ADD_CHIT_FUNT = 'chit_fund/add_chit_fund/'
const EDIT_CHIT_FUNT = 'chit_fund/edit_chit_fund'
const GET_MEMBER_CHITFUND = 'chit_fund/get_chitfund_member_details/'
const CHITFUND_INVESTOR_MEMBER = 'chit_fund/get_chitfund_members/'
const CHIT_IDSEND = 'chit_fund/get_chitfund_members/'
const GET_MEMBER_CHITFUND_VIEW = 'chit_fund/edit_chit_fund'
const ADD_CHITINVESTOR = 'chit_fund/add_chit_fund_investors/'
const ADD_SETTLEMENT_POST = 'chit_fund/add_chit_fund_settlement/'
const EDIT_DELETE_CHIT_SETTLEMENT ='chit_fund/edit_chit_fund_settlement'
const ADD_SETTLEMENT_APPLICATION_POST = 'chit_fund/add_chit_fund_settlement_application_details/'
const EDIT_DELETE_SETTLEMENT_APPLN= 'chit_fund/edit_chit_fund_settlement_application_details'
const INVESTOR__APPLICTION_SELECT_GET = 'chit_fund/get_chitfund_settlement_application_mem/'
const SETTLEMENT_SELECT_URL = 'chit_fund/chit_fund_settlement_application_get/'

const PROFIT_CHITFUND_DETAILS = 'chit_fund/get_active_chitfunds/'
const PROFIT_CHITFUND_POST = 'chit_fund/get_chitfund_distribution/'
// const PROFIT_
const INVESTOR_LOGIN_REGISTER_CHIT = 'user/investor_register'
const TOTAL_CHITFUND_PROFIT = 'chit_fund/add_chitfund_distribution/'
const CHITFUND_ONLY_PROFIT_DISTRIBUTION = 'chit_fund/chitfund_only_profit_distribution/'
const CHIT_DISTRIBUTION_DELETE = 'chit_fund/distributed_chit_fund'
const CHIT_ONLY_PROFIT_DISTRIBUTION_DELETE = 'chit_fund/profit_only_chit_fund_edit'
const INVESTOR_DASHBOARD_GET = 'chit_fund/get_chitfund_members_amount/'
const INVESTOR_DASHBOARD_TABLE_GET = 'chit_fund/chit_fund_investers_register_list/'

const CASH_IN_HAND_CHITSHAREAMT = 'chit_fund/management_treasure_get/'


// ==========  CHIT FUNT page url start ============

//  ======= SubscriptionTariff Starts =======

const POST_SUBSCRIPTIONTARIFF = 'sub_tariff/add_tariff_details/'
const GET_SUBSCRIPTIONTARIFF = 'sub_tariff/add_tariff_details/'
const PUT_SUBSCRIPTIONTARIFF = 'sub_tariff/edit_tariff_details/'
const DELETE_SUBSCRIPTIONTARIFF = 'sub_tariff/edit_tariff_details/'
//  ======= SubscriptionTariff Ends =======

//  ======= Death form start =======

const POST_dEATHFORMDETAILS = 'death/add_death_details/'
const DEFAULT_DEATH_GET = 'family/alive_family_and_the_members/'
const PUT_DEATHFORMDETAILS = 'death/edit_death_details/'
const DELETE_DEATHFORMDETAILS = 'death/edit_death_details/'

// const GET_DaLIVEdETAILS = 'alive_family_and_the_members'
//  ======= Death form end=======

//  ======= Income Details Starts =======

const POST_INCOME_DETAILS = 'income/add_income_details/'
const GET_INCOME_DETAILS = 'income/add_income_details/'
const PUT_INCOME_DETAILS = 'income/edit_income_details/'
const DELETE_INCOME_DETAILS = 'income/edit_income_details/'

const POST_GET_INCOMECATEGORY ='income/add_income_categry/'
const POST_GET_INCOMENAME ='income/add_income_names/'
const PUT_PATCH_INCOMECATEGORY ='income/edit_income_categry'
const PUT_PATCH_INCOMEName = 'income/edit_income_names'

//  ======= Income Details Ends =======

// ======== Marriage Starts ============

const POST_MARRIAGE_DETAILS = '/marriage/add_marriage_details/'
const GET_MARRIAGE_DETAILS = 'marriage/add_marriage_details/'
const PUT_MARRIAGE_DETAILS = '/marriage/edit_marriage_details/'
const DELETE_MARRIAGE_DETAILS = '/marriage/edit_marriage_details/'

const GET_GROOM_DETAILS = 'family/marriage_groom_family_view/'
const GET_BRIDE_DETAILS = 'family/marriage_bride_family_view/'

// ======== Marriage Ends ============

//===== sangam Starts ======

const POST_SANGAM_NAME = 'sangam/add_sangam_name/'
const GET_SANGAM_NAME = 'sangam/add_sangam_name/'
const GET_SANGAM_MEMBERS = 'sangam/get_sangam_members/'

const POST_SANGAM_DETAILS = 'sangam/add_sangam_details/'
const GET_SANGAM_DETAILS = 'sangam/add_sangam_details/'
const PUT_SANGAM_DETAILS = 'sangam/edit_sangam_details/'
const DELETE_SANGAM_DETAILS = 'sangam/edit_sangam_details/'

//===== sangam end ======

//===== rental/lease Starts ======

const POST_RENTAL_LEASE = `/rental/add_lease_things/`
const GET_RENTAL_LEASE = '/rental/add_lease_things/'
const DELETRE_RENTAL_LEASE = '/rental/edit_lease_things/'
const SETTLEMENT_CONFERMATIONS = 'rental/rental_advance_settlement'
const FORCE_SETTLEMENT_CONFERMATIONS = 'rental/force_settlement_close'
const PUT_RENTAL_LEASE = '/rental/edit_lease_things/'

const POST_MOVEABLE_RENTAL ='/rental/add_movable_rent_things/'
const PUT_MOVEABLE_RENTAL ='/rental/edit_moveable_lease_things'

const GET_RENTAL_THINGS ='/rental/get_rent_things/'
const GET_LEASE_THINGS ='/rental/get_lease_things/'
const GET_MOVEABLE_THINGS ='/rental/get_moveablerent_things/'


//===== rental/lease End ======

//==== interest start ======
const GET_MANAGEMENT_INTEREST = 'interest/management_interest_details_table/'
const GET_MANAGEMENT_INSTALLMENT ='interest/management_installment_interest_details_table/'
const GET_MANAGEMENT_CAPITAL ='interest/management_capital_interest_details_table/'
const DELETE_MANAGEMENT_INTEREST ='interest/edit_interest_given_details'


const GET_CHITFUND_INTEREST = 'interest/chit_fund_interest_details_table/'
const GET_CHITFUND_INSTALLMENT ='interest/chit_fund_installment_interest_details_table/'
const GET_CHITFUND_CAPITAL = 'interest/chit_fund_capitalinterest_details_table/'

//==== interest end ======

// instructions

const GET_INSTRUCTION ='management/add_instructions/'
const PUT_INSTRUCTION ='management/edit_instructions'

// Reports

const CATEGORY_FILTER_REPORTS  = 'collection/unpaid_list/'
const TYPE_LIST_FILTER_REPORTS ='collection/unpaid_list_member/'
const TYPE_DATE_FILTER_REPORTS = 'collection/unpaid_list_member_date_filter/'
const COLLECTION_HISTORY_REPORTS ='collection/collection_amountdetails_filter_by_user_list/'
const COLLECTION_FILTERUSER_REPORTS ='collection/collection_amountdetails_filter_by_user/'
const BANK_STATEMENT_FILTER_REPORTS = 'amount/bank_statement/'
const CASH_STATEMENT_FILTER_REPORTS = 'amount/cash_tranfer_statement/'
const INTEREST_MEMBER_BALANCE_REPORTS = 'interest/interest_people_balance_get/'
const INTEREST_MEMBER_BALANCE_Installment_REPORTS = 'interest/interest_people_installmentinterest_balance_get/'



// Bank Transaction
const BANK_TRANSACTIONPOST = "amount/bank_transaction/" 
const BANK_GET_DETAILS ="amount/get_bank_details/"
const CASH_GET_DETAILS = "amount/get_cash_details/"
const CASH_PAID_DETAILS = "amount/get_detail_cash_borrowedlist/"
const BANK_TO_BANK_FILTER = "amount/get_bank_details_filter"

// Create User

const CREATEUSER_ROLE_POST = 'permisions/assign_permissions/'
const Enable_user = 'user/g_user_Enable'
const Disable_User = 'user/g_user_disable'

// Admin

const ADMIN_POST = 'user/admin_register/'
const ADMIN_GET_TABLE_VIEW = 'user/admins_view/'


export const APIURLS = {
    // Auth 
    LOGIN,   // --> Auth Login Post

    POST_MANAGEMENT_DETAILS,   // --> Management
    GET_MANAGEMENT_DETAILS,
    PUT_MANAGEMENT_DETAILS,
    GET_BANK_DETAILS,


    POST_Asset_Category,
    EDIT_ASSET_CATEGORY,

    POST_GET_Extra_Fields,
    POST_GET_AUTHORITY_POSTION,
    GET_AUTHORITY_MEMBER,              // AUTHORITY
    GET_FUND_NOMINEE_MEMBER,
    POST_ADD_AUTHORITY,
    PUT_AUTHORITY_DETAILS,
    PATCH_RESIGN_AUTHORITY,
    PATCH_REJOIN_AUTHORITY,

    POST_ROLE_PERMISSION,       // --> User
    GET_ROLE_PERMISSION,
    PUT_ROLE_PERMISSION,
    POST_USER,

    GET_USER,
    DELETE_USER,
    PUT_USER,

    POST_ADD_FAMILY,            // --> Add Family
    GET_ANSESTER,
    GET_ANCESTER_EDIT,
    GET_FAMILY_GROUP,
    PUT_PATCH_FAMILY_GROUP,
    GET_FAMILY_MEMBERS,
    GET_ALL_MEMBERS,
    GET_MEMBER_PROFILE_LIST,
    GET_DEATH_MEMBER_LIST,
    GET_LEAVING_MEMBER_LIST,
    GET_MARRIAGE_REMOVE_MEMBER_LIST,
    GET_ALL_MEMBERS_LIST,
    GET_ANCESTORVIEW,
    GET_LINK_FAMILY_ANCESTOR,
    MEMBER_BALANCESHEET_FROMTODATE_POST,
    

    GET_ASSET_CATEGORY,             // --> Assets
    POST_ASSET_DETAILS,
    GET_ASSET_DETAILS,
    PUT_ASSET_DETAILS,
    DELETE_ASSET_DETAILS,

    GET_ASSET_UNDER_ASSET_CATEGORY,
    
    GET_MOVABLEASSET_DETAILS,
    DELETE_MOVABLEASSET_DETAILS,
    PUT_MOVEABLE_ASSET_DETAILS,

    // Movable Assets

    GET_MOVABLE_ASSET_CATEGORY,
    POST_MOVABLE_ASSET_CATEGORY_MODAL,
    EDIT_MOVABLE_ASSET_CATEGORY,
    POST_MOVABLE_CATEGORY,
    GET_RENTAL_MOVABLE_ASSET_CATEGORY,



    POST_EXPENSE_CATEGORY,          // --> Expense
    GET_EXPENSE_CATEGORY,
    UPDATE_EXPENSE_CATEGORY,
    POST_EXPENSE_NAME,
    GET_EXPENSE_NAME,
    UPDATE_EXPENSE_NAME,
    POST_EXPENSE,
    GET_EXPENSE,
    EDIT_EXPENSE,
    DELETE_EXPENSE,

    POST_FESTIVAL,              // --> Festival
    GET_FESTIVAL,
    DLETE_FESTIVAL,
    PUT_FESTIVAL,


    POST_CREATE_FUND,           // --> Fund
    GET_CREATED_FUND,
    GET_CHOOSE_FUND_GROUP,
    DELETE_FUND_DETAils,
    PUT_FUND_DETAILS,

    POST_FUND_SETTLEMENT,

    POST_FUND_DETAILS,          // --> Fund Group/List Details
    GET_FUND_DETAILS,
    EDIT_FUND_GROUP,
    GET_FUNDGROUP_MEMBER,

    GET_FUND_LEASE,             //--> Fund Lease
    GET_NORMAL_FUND_LEASE,
    GET_NORMAL_FUND_LEASE_TABLE,
    GET_FUND_NAME_SEND,
    POST_GET_FUND_LEASE,
    PUT_FUND_LEASE,
    VIEWPROFILE_FUND_LEASE_BASEDON_MEMBER,


    BALANCESHEET_DATE_POST,            //-----------> CHIT FUND BALANCE SHEET
    BALANCESHEET_CHIT_FUND_POST,

    POST_SUBSCRIPTIONTARIFF,     // --> SubscriptionTariff
    GET_SUBSCRIPTIONTARIFF,
    PUT_SUBSCRIPTIONTARIFF,
    DELETE_SUBSCRIPTIONTARIFF,


    POST_dEATHFORMDETAILS,
    DEFAULT_DEATH_GET,                      // --> Death form
    POST_dEATHFORMDETAILS,
    PUT_DEATHFORMDETAILS,
    DELETE_DEATHFORMDETAILS,


    // GET_DaLIVEdETAILS,


    POST_INCOME_DETAILS,           // --> post income
    GET_INCOME_DETAILS,            // --> get income
    PUT_INCOME_DETAILS,            // --> put income
    DELETE_INCOME_DETAILS,         // --> delete income
    
    POST_GET_INCOMECATEGORY,           //--->POST INCOME CATEGORY
    PUT_PATCH_INCOMECATEGORY,           //---> Edit/Delete Income Category
    POST_GET_INCOMENAME,                 //--->POST INCOME NAME
    PUT_PATCH_INCOMEName,               //--> EDIT/delete income name

    

    POST_MARRIAGE_DETAILS,         // --> Marriage 
    GET_MARRIAGE_DETAILS,

    PUT_MARRIAGE_DETAILS,
    DELETE_MARRIAGE_DETAILS,

    GET_GROOM_DETAILS,
    GET_BRIDE_DETAILS,

    POST_SANGAM_NAME,           // --> post sangam
    GET_SANGAM_NAME,            // --> get sangam
    GET_SANGAM_MEMBERS,
    POST_SANGAM_DETAILS,            // --> post sangam details
    GET_SANGAM_DETAILS,            // --> get sangam details
    PUT_SANGAM_DETAILS,            // --> put sangam details
    DELETE_SANGAM_DETAILS,            // --> delete sangam details

    POST_RENTAL_LEASE,        // post rentalorlease
    GET_RENTAL_LEASE,         // get rentalorlease
    DELETRE_RENTAL_LEASE,
    SETTLEMENT_CONFERMATIONS,
    FORCE_SETTLEMENT_CONFERMATIONS,
    PUT_RENTAL_LEASE,

    POST_MOVEABLE_RENTAL,     // POST moveable rental
    PUT_MOVEABLE_RENTAL,      // Update moveable rental

    GET_RENTAL_THINGS,
    GET_LEASE_THINGS,
    GET_MOVEABLE_THINGS,

    COLLECTION_DETAILS,           // Collection page
    COLLECTION_EDIT_DELETE,
    SELECTED_TYPE_COLLECTIONS,
    SELECTED_TYPE_COLLECT_TWO,
    GET_MANAGE_INTEREST_DETAILS,
    POST_INT_PERSON_DETAILS,
    FIND_MEM_ID_POST,
    FUND_MEM_DETAILS,
    SUBSCRIPTION_COLLECTIONS,
    MARRIAGE_COLLECTIONS,
    BALANCE_COLLECTIONS,
    BALANCE_INTEREST_COLLECTIONS,
    CHIT_INT_COLLECTIONS,
    INT_CATEGORY_DETAILS,

    COLLECTION_USER_LIST,
    COLLECTION_USER_DATE,
    COLLECTION_USERBASED_DETAILS,           // Collection user Based

    COLLECTION_INTEREST_FILTER_DETAILS,

    MEMBER_SELECT_GET,         // Intrest page
    CHIT_FUND_OPTN_GET,
    INTREST_POST_URL,
    INTREST_EDIT_URL,
    MANAGEMENT_INTEREST_TABLE,
    APPLY_OVERDUE_INTEREST,
    RECOMPUTE_INTEREST_BALANCE,
    MANAGEMENT_INTEREST_PROFILE_GET,

    ADD_CHIT_FUNT,             // Chit fund page
    EDIT_CHIT_FUNT,
    GET_MEMBER_CHITFUND,
    CHITFUND_INVESTOR_MEMBER,
    CHIT_IDSEND,
    GET_MEMBER_CHITFUND_VIEW,
    ADD_CHITINVESTOR,
    ADD_SETTLEMENT_POST,
    EDIT_DELETE_CHIT_SETTLEMENT,
    ADD_SETTLEMENT_APPLICATION_POST,
    EDIT_DELETE_SETTLEMENT_APPLN,
    INVESTOR__APPLICTION_SELECT_GET,
    SETTLEMENT_SELECT_URL,
    PROFIT_CHITFUND_DETAILS,
    PROFIT_CHITFUND_POST,
    TOTAL_CHITFUND_PROFIT,
    CHITFUND_ONLY_PROFIT_DISTRIBUTION,
    CHIT_DISTRIBUTION_DELETE,
    INVESTOR_LOGIN_REGISTER_CHIT,
    CHIT_ONLY_PROFIT_DISTRIBUTION_DELETE,
    INVESTOR_DASHBOARD_GET,
    INVESTOR_DASHBOARD_TABLE_GET,
    CASH_IN_HAND_CHITSHAREAMT,

                                       
    GET_MANAGEMENT_INTEREST,        // Management-Fund Interest
    GET_MANAGEMENT_INSTALLMENT,
    GET_MANAGEMENT_CAPITAL,
    DELETE_MANAGEMENT_INTEREST,
    
         
    GET_CHITFUND_INTEREST,         // Chit-Fund Interest
    GET_CHITFUND_INSTALLMENT,
    GET_CHITFUND_CAPITAL,

    GET_INSTRUCTION,  // instruction
    PUT_INSTRUCTION,

    CATEGORY_FILTER_REPORTS, // reports 
    TYPE_LIST_FILTER_REPORTS, 
    TYPE_DATE_FILTER_REPORTS,
    COLLECTION_HISTORY_REPORTS,
    COLLECTION_FILTERUSER_REPORTS,
    BANK_STATEMENT_FILTER_REPORTS,
    CASH_STATEMENT_FILTER_REPORTS,
    INTEREST_MEMBER_BALANCE_REPORTS,
    INTEREST_MEMBER_BALANCE_Installment_REPORTS,

    BANK_TRANSACTIONPOST, //  bank transaction
    BANK_GET_DETAILS,
    CASH_GET_DETAILS,
    CASH_PAID_DETAILS,
    BANK_TO_BANK_FILTER,


    // CREATE USER
    CREATEUSER_ROLE_POST,
    Enable_user,
    Disable_User,

    // ADMIN
    ADMIN_POST,
    ADMIN_GET_TABLE_VIEW,

    // Dashboard stats
    PENALTY_SUMMARY: 'penalty/summary/',

}

