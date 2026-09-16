import { AiTwotoneAccountBook } from "react-icons/ai";
import { BsBoxSeam } from "react-icons/bs";
import { MenuText } from "@layout/Partials/Style";
import { MdAddchart, MdFamilyRestroom, MdFormatListBulletedAdd, MdGroupAdd, MdManageAccounts, MdOutlineCommentBank, MdOutlineGpsFixed, MdOutlineRateReview } from "react-icons/md";
import { HiOfficeBuilding, HiReceiptTax, HiUserGroup } from "react-icons/hi";
import {
  GiCrackedBallDunk,
  GiLandMine,
  GiMoneyStack,
  GiReceiveMoney,
  GiTakeMyMoney,
} from "react-icons/gi";
import { FaMoneyBillTrendUp, FaPeopleGroup } from "react-icons/fa6";
import {
  HiClipboardDocumentList,
  HiMiniUser,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import { TbFileInvoice, TbHeartHandshake, TbReportSearch } from "react-icons/tb";
import { LuTableProperties } from "react-icons/lu";
import { RiFileList3Line, RiPassExpiredFill } from "react-icons/ri";
import { FaHome, FaWpforms } from "react-icons/fa";
import { GrMoney } from "react-icons/gr";


export const adminItems = (collapsed) => {
  function getItem(label, key, icon, children, type) {
    return {
      key,
      icon,
      children,
      label,
      type,
    };
  }

  let items = [
    getItem(
      <MenuText>{collapsed ? null : ""}</MenuText>,
      "menu",
      null,
      [

        getItem("Home", "", <FaHome />),

        getItem('Management Details', 'management_details', <FaWpforms />),
        // ]),
        getItem('Users', 'sub1', <HiMiniUser />, [
          getItem('Add Users', 'add_users', <AiTwotoneAccountBook />),
          getItem('Users List', 'view_userslist', <HiOutlineClipboardDocumentList />),
          getItem('Role List', 'role_list', <HiOutlineClipboardDocumentList />),
        ]),
        getItem('FamilyDetails', 'sub2', <HiUserGroup />, [
          getItem('AddFamilyDetails', 'family', <MdGroupAdd />),
          getItem('Family Group', 'family_group', <MdFamilyRestroom />),
          getItem('Member List', 'member_list', <HiOutlineClipboardDocumentList />),
        ]),
        getItem('Authorities', 'sub3', <MdManageAccounts />, [
          getItem('Add Authorities', 'add_authorities', <FaWpforms />),
          getItem('Authorities List', 'view_authoritylist', <HiOutlineClipboardDocumentList />),
        ]),

        getItem('Marriage', 'sub4', <TbHeartHandshake />, [
          getItem('Marriage', 'Marriage', <FaWpforms />),
          getItem('Marriage List', 'view_marriagelist', <HiOutlineClipboardDocumentList />),
        ]),
        getItem('Festival', 'sub5', <GiCrackedBallDunk />, [
          getItem('AddFestival', 'AddFestival', <FaWpforms />),
          getItem('FestivalList', 'FestivalList', <HiOutlineClipboardDocumentList />),
        ]),

        getItem('Death', 'sub6', <RiPassExpiredFill />, [
          getItem('DeathForm', 'DeathForm', <FaWpforms />),
          getItem('Death List', 'view_deathlist', <HiOutlineClipboardDocumentList />),
        ]),
        getItem('Income', 'sub7', <GiMoneyStack />, [
          getItem('Add Income', 'add_income', <FaWpforms />),
          getItem('Income List', 'view_income', <HiOutlineClipboardDocumentList />),
          getItem('Category & Name List', 'income_category_and_Name', <HiOutlineClipboardDocumentList />),
        ]),
        getItem('Expense', 'sub8', <FaMoneyBillTrendUp />, [
          getItem('Add Expense', 'add_expense', <FaWpforms />),
          getItem('Expense List', 'view_expense', <HiOutlineClipboardDocumentList />),
          getItem('Category & Name List', 'expense_category_and_Name', <HiOutlineClipboardDocumentList />),
        ]),

        getItem('Fund', 'sub9', <GiReceiveMoney />, [
          getItem(<MenuText style={{ color: 'red', cursor: 'text' }}>{collapsed ? null : 'Create Fund'}</MenuText>, '/', null,),
          getItem('Create Fund', 'create_fund', <MdAddchart />),
          getItem('View Fund', 'view_fund', <MdOutlineRateReview />),
          getItem(<MenuText style={{ color: 'red', cursor: 'text' }}>{collapsed ? null : 'Fund Group'}</MenuText>, '/', null,),
          getItem('Fund', 'fund', <MdAddchart />),
          getItem('Fund List', 'view_fundlist', <MdOutlineRateReview />),
          getItem(<MenuText style={{ color: 'red', cursor: 'text' }}>{collapsed ? null : 'Fund Lease'}</MenuText>, '/', null,),
          getItem('Fund Lease', 'FundLease', <MdAddchart />),
          getItem('View Fund Lease', 'view_fund_lease_member', <MdOutlineRateReview />),
        ]),

        getItem('Chit Fund', 'sub10', <GiTakeMyMoney />, [

          getItem('Add Chit Fund', 'add_chitfund', <MdAddchart />),
          getItem('Chit Fund List', 'chit_fund_lists', <MdOutlineRateReview />),
          getItem(<MenuText style={{ color: 'red', cursor: 'text' }}>{collapsed ? null : 'Investors'}</MenuText>, '/', null,),

          getItem('Investor Login Register', 'investor_login_register', <HiOutlineClipboardDocumentList />),
          getItem('Chit Fund Investers', 'chitfund_investors', <MdFormatListBulletedAdd />),
          getItem('View Login Investers', 'chitfund_investors_view', <MdOutlineRateReview />),
          
          getItem(<MenuText style={{ color: 'red', cursor: 'text' }}>{collapsed ? null : 'Settlement Application'}</MenuText>, '/', null,),
          getItem('Settlement Application', 'chitfund_settlement_application', <MdAddchart />),
          getItem('View Settlement', 'view_settlement_application', <MdOutlineRateReview />),
          getItem(<MenuText style={{ color: 'red', cursor: 'text' }}>{collapsed ? null : 'Chit Settlement'}</MenuText>, '/', null,),
          getItem('Chit Fund Settlement', 'chitfund_settlement', <MdAddchart />),
          getItem('View Chit Fund Settlement', 'chit_fund_settlementList', <MdOutlineRateReview />),
          getItem(<MenuText style={{ color: 'red', cursor: 'text' }}>{collapsed ? null : 'Profit Distribution'}</MenuText>, '/', null,),
          getItem('Add Profit Distribution', 'chitfund_profitdistribution', <MdAddchart />),
          getItem('View Profit Distribution', 'chitfund_profitdistributionlist', <MdOutlineRateReview />),

          getItem('Terms & Conditions', 'terms_and_conditions', <RiFileList3Line />),
          getItem(<MenuText style={{ color: 'red', cursor: 'text' }}>{collapsed ? null : 'Balance Sheet'}</MenuText>, '/', null,),
          getItem('Balance Sheet', 'chitfund_balancesheet', <TbFileInvoice />)
        ]),

        getItem('Interest', 'sub11', <HiReceiptTax />, [
          getItem('Interest', 'Interest', <HiReceiptTax />),
          getItem('Management Interest', 'management_interest', <HiOfficeBuilding />),
          getItem('Chit-Fund Interest', 'chit_fund_interest', <GrMoney />),

        ]),

        getItem('Asset', 'sub12', <LuTableProperties />, [
          getItem('AssetDetails', 'AssetDetails', <BsBoxSeam />),
          getItem('Asset List', 'asset_list', <HiOutlineClipboardDocumentList />),
          getItem('Category List', 'categorieslist', <HiOutlineClipboardDocumentList />),

        ]),
        getItem('Rental/Lease', 'sub13', <GiLandMine />, [
          getItem('Rental/Lease', 'rental_lease', <AiTwotoneAccountBook />),
          getItem('Rental/Lease List', 'RentalandLeaseList', <AiTwotoneAccountBook />),
        ]),

        getItem('Sangam', 'sub14', <FaPeopleGroup />, [
          getItem('Add Sangam Details', 'add_sangam_details', <FaWpforms />),
          getItem('Sangam List', 'view_sangamlist', <HiOutlineClipboardDocumentList />),
        ]),

        getItem('Subscription Tariff', 'sub15', <MdOutlineGpsFixed />, [
          getItem('SetSubscriptionTariff', 'SetSubscriptionTariff', <FaWpforms />),
          getItem('SubscriptionTariff List', 'subscription_tariff_list', <HiOutlineClipboardDocumentList />),
        ]),

        getItem('Collection Details', 'sub16', <HiClipboardDocumentList />, [
          getItem('Collection', 'collection', <FaWpforms />),
          getItem('Collection History', 'CollectionUserList', <HiOutlineClipboardDocumentList />),
        ]),
        getItem('Temple Balance Sheet', 'balanceSheetAll', <MdOutlineCommentBank />),
        getItem('Bank Transaction', 'bank_transaction', <FaWpforms />),
        getItem('Report', 'all_reports', <TbReportSearch />),
      ], 'group'),
  ]

  return items;
};

export const adminKeys = [
  "sub1",
  "sub2",
  "sub3",
  "sub4",
  "sub5",
  "sub6",
  "sub7",
  "sub8",
  "sub9",
  "sub10",
  "sub11",
  "sub12",
  "sub13",
  "sub14",
  "sub15",
  "sub16",
];
