import {
  Button,
  CustomCheckBox,
  CustomDatePicker,
  CustomInput,
  CustomInputNumber,
  CustomRadioButton,
  CustomSelect,
  CustomTextArea,
} from "@components/form";
import Label from "@components/form/Label";
import { CustomCardView, CustomModal, CustomRow, Flex } from "@components/others";
import {
  CustomPageFormTitle,
  CustomPageTitle,
} from "@components/others/CustomPageTitle";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";
import { getBankDetails, selectBankDetails } from "@modules/Management/ManagementSlice";
import { APIURLS } from "@request/apiUrls/urls";
import errorHandler from "@request/errorHandler";
import request from "@request/request";
import successHandler from "@request/successHandler";
import { userRolesConfig } from "@router/config/roles";
import { Col, Form } from "antd";
import dayjs from "dayjs";
import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ViewCollectionPrint from "./ViewCollectionPrint";

export const Collection = ({ trigger }) => {

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [collectionType, setCollectionType] = useState(); // Use Category select option
  const [personType, setPersonType] = useState();
  const [transactionType, setTransactionType] = useState([]);
  const [balanceType, setBalanceType] = useState(null);  // use Balance Type Change
  const [bankPay, setBankPay] = useState({});
  const [paymentValue, setPaymentValue] = useState('');
  const [tariffType, setTariffType] = useState();
  const [subsMember, setSubsMember] = useState([]); // Use Subs TarifMember click on Category
  const [deathMember, setDeathMember] = useState([]) // use DeathMember Value set
  const [deathAmt, setDeathAmt] = useState([]);  // use Death Amount Value set
  const [festivalData, setFestivalData] = useState([])  // use Festivals value
  const [subsAmt, setSubsAmt] = useState({}); // Use TarifMember based Present absent Amt
  const [subcriptionId, setSetSubcriptionId] = useState({})
  const [getdetailTotal, setGetdetailTotal] = useState([]);
  const [subsCategory, setSubsCategory] = useState([]);
  const [manageInterestId, setManageInterestId] = useState({}); // use Mangement Interest options
  const [findMInterestMemId, setFindMInterestMemId] = useState({});
  const [prinChecked, setprinChecked] = useState(false); // use Management Pricipal amt
  const [intChecked, setIntChecked] = useState(false); // Use Management Interest amt
  const [leaseAmtDisabled, setLeaseAmtDisabled] = useState(false); // Use Lease Amt Disabled
  const [leaseDetails, setLeaseDetails] = useState([]);   // Use Lease Details
  const [maxLease, setMaxLease] = useState();  //Use Lease Max Amt Enter
  const [fundPerson, setFundPerson] = useState([]);   //Use Fund Choose Person
  const [marriageDetails, setMarriageDetails] = useState([]) // Use Marriage details (id,amount show)
  const [balanceDetails, setBalanceDetails] = useState([]) // Use Balalnce details (id,amount show)
  const [balanceIntDetails, setBalanceIntDetails] = useState([]) // Use Balalnce details ( Interest collect)
  const [moveableRental, setMoveableRental] = useState([])  // Use Moveable Rental deatils
  const [moveassetShow, setMoveassetShow] = useState(false);
  const [presentChecked, setPresentChecked] = useState([]);// Use Subscription Present Checked Fn
  const [absentChecked, setAbsentChecked] = useState(false);// Use Subscription Absent Checked Fn
  const [findDeathId, setFindDeathId] = useState({});
  const [DeathMemFind, setDeathMemFind] = useState({});
  const [leaseChosFindID, setLeaseChosFindID] = useState({});
  const [findLeaseMemId, setFindLeaseMemId] = useState({});
  const [interestDetails, setInterestDetails] = useState([]); // use Interest Details get
  const [chitDetails, setChitDetails] = useState([]); // use chit details post
  const [intCategory, setIntCategory] = useState(null);// use Int Category Change

  const [findRentID, setFindRentID] = useState({});
  const [findRentMemId, setFindRentMemId] = useState({});
  const [disabled, setDisabled] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [selectedDatetwo, setSelectedDatetwo] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [selectedDatethre, setSelectedDatethre] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [PlaceFindMem, setPlaceFindMem] = useState({}); //Use All amount deatils
  const [bankId, setBankId] = useState([]); // Use bank id

  const [princpleMax, setPrincpleMax] = useState();
  const [installMax, setInstallMax] = useState();
  const [interestMax, setInterestMax] = useState();
  const [penaltyMax, setPenaltyMax] = useState();
  const [discountMax, setDiscountMax] = useState();

  const [chitintDetails, setChitIntDetails] = useState([]);  // USe Choose chit name details
  const [intrestType, setIntrestType] = useState({});  // Use Interest Category for choose person
  const [loading, setLoading] = useState(false);

  // ======  Modal Open ========
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ======  Modal Title and Content ========
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState(null);

  // =====  Modal Functions Start ===

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // =====  Modal Functions End ===
  const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>> Role
  const superUsers = useSelector(selectCurrentSuperUser);//>>>>>>>>>>> SuperUsers
  const memberListPermissions = useSelector(selectAllPermissions);//>>>>>>>>>>> Member Permissions
  const AllBankName = useSelector(selectBankDetails);  //>>>>>>> Bank Details (Management Details)

  useEffect(() => {
    form.resetFields();
  }, [trigger]);

  useEffect(() => {
    dispatch(getBankDetails())
  }, [])

  //-------- Bank Options---------------------------
  const BankNameOptions = AllBankName?.map((ban) => ({
    label: ban?.bank_name,
    value: ban?.id
  }))

  const RadioOptionsTransactionType = [
    {
      label: "Cash",
      value: "Cash",
      checked: true,
    },
    {
      label: "Bank",
      value: "Bank",
    },
  ];
  const [paymentMode, setPaymentMode] = useState(RadioOptionsTransactionType);
  const collectiontypeoptions = [
    superUsers || role === userRolesConfig.ADMIN || memberListPermissions?.Fund?.Fund ? {
      key: "Fund",
      title: "Fund",
      value: "Fund",
    } : null,
    superUsers || role === userRolesConfig.ADMIN || memberListPermissions?.Festival?.Festival ? {
      key: "Festival",
      title: "Festival",
      value: "Festival",
    } : null,
    superUsers || role === userRolesConfig.ADMIN || memberListPermissions?.Rent?.Rent ? {
      key: "Rent",
      title: "Rent",
      value: "Rent",
    } : null,
    superUsers || role === userRolesConfig.ADMIN || memberListPermissions?.Lease?.Lease ? {
      key: "Lease",
      title: "Lease",
      value: "Lease",
    } : null,
    superUsers || role === userRolesConfig.ADMIN || memberListPermissions?.SubTariffCollection?.SubTariffCollection ? {
      key: "Subscription Tariff",
      title: "Subscription Tariff",
      value: "Subscription Tariff",
    } : null,
    superUsers || role === userRolesConfig.ADMIN || memberListPermissions?.DeathTariff?.DeathTariff ? {
      key: "Death Tariff",
      title: "Death Tariff",
      value: "Death Tariff",
    } : null,
    superUsers || role === userRolesConfig.ADMIN || memberListPermissions?.Marriagecollection?.Marriagecollection ? {
      key: "Marriage",
      title: "Marriage",
      value: "Marriage",
    } : null,
    superUsers || role === userRolesConfig.ADMIN || memberListPermissions?.ManagementInterest?.ManagementInterest ? {
      key: "Management Interest",
      title: "Management Interest",
      value: "Management Interest",
    } : null,
    superUsers || role === userRolesConfig.ADMIN || memberListPermissions?.ChitInterest?.ChitInterest ? {
      key: "Chit Interest",
      title: "Chit Interest",
      value: "Chit Interest",
    } : null,
    superUsers || role === userRolesConfig.ADMIN || memberListPermissions?.Balance?.Balance ? {
      key: "Balance",
      title: "Balance",
      value: "Balance",
    } : null,
    superUsers || role === userRolesConfig.ADMIN || memberListPermissions?.Movableassetrent?.Movableassetrent ? {
      key: "Moveable Rent",
      title: "Moveable Rent",
      value: "Moveable Rent",
    } : null,
  ];

  const filteredOptions = collectiontypeoptions
    .map((option, index) => option ? { ...option, key: index } : null)
    .filter(option => option !== null);

  const memberoptions = [
    {
      title: "NativeMember1",
      value: "NativeMember1",
    },
    {
      title: "NativeMember2",
      value: "NativeMember2",
    },
  ];

  const TariffRadio = [
    {
      label: "Present",
      value: true,
    },
    {
      label: "Absent",
      value: false,
    },
  ];
  const BalanceCollectRadio = [
    {
      label: "Other",
      value: "Other",
    },
    {
      label: "Interest Balance",
      value: "Interest Balance",
    },
  ];

  const RadioOptionsPaymentMode = [
    {
      label: "Online",
      value: "Online",
    },
    {
      label: "Offline",
      value: "Offline",
    },
  ];

  const bankPayoptions = [
    {
      label: "UPI",
      value: "UPI",
    },
    {
      label: "Net Banking",
      value: "Net Banking",
    },
    {
      label: "NEFT",
      value: "NEFT",
    },
  ];
  const InterestCatOptions = [
    {
      label: 'Interest',
      value: 'Interest'
    },
    {
      label: 'Interest with capital',
      value: 'Interest with capital'
    },
    {
      label: 'Installment Interest',
      value: 'Installment Interest'
    }
  ]

  const handleIntCategory = (value) => {
    // console.log(prinChecked, '12345');
    setIntCategory(value);
    form.resetFields(["personId", "principal_amt", "installment_amt", "no_count_install",
      "amount", "interst_amt", "penalty_amt", "interst_amount", "penalty_amount", "_original_principal_amt", "_original_amount", "_original_penalty_amt"]);
    // setChitDetails([]);
    // setprinChecked(false);
    // setIntChecked(false);

    // Owner rule (Feb 2026): the "Choose Person" list must reflect only
    // borrowers whose next installment / interest is due on or before the
    // date the operator picked at the top of the form (`selectedDate` →
    // `pay_date`). Previously the backend hard-coded `date.today()`, so
    // every borrower showed up regardless of the selected date.
    const NewValues = {
      interest_category: value,
      interest_type: collectionType,
      interest_principle: prinChecked,
      interest_field: intChecked,
      selected_date: selectedDate,
      ...(collectionType === "Chit Interest" && { chit_name: manageInterestId.chit_name }),
      ...(collectionType === "Chit Interest" && { type: manageInterestId?.id })
      // type: manageInterestId?.id
    };
    // console.log(NewValues, 'PrintNewValues');

    if (prinChecked === false && intChecked === false) {
      toast.warn(value === "Installment Interest" ? "Please Choose Installment or Interest Amount!" :
        "Please Choose Principal or Interest Amount!")
      form.resetFields(["interest_category"])

      console.log('ifuuu');

    }
    else {
      InterestTypePost(NewValues);
      console.log('elseeee');


    }
  }

  const onReset = () => {
    form.resetFields();
  };
  //--------------- Handle Collcetion Category onChange Function-----------------

  const handleCollectionType = async (e, value) => {
    setCollectionType(e);
    setPersonType([]);
    setTransactionType([]);
    setTariffType([]);
    setFindRentID([]);
    setFindRentMemId([]);
    setPlaceFindMem([]);
    setPaymentMode([]);
    setPresentChecked([]);
    setSubsMember([]);
    setprinChecked(false);
    setIntChecked(false);
    setInterestDetails([]);
    setChitDetails([]);
    setBalanceIntDetails([]);
    setChitDetails([]);


    setPaymentValue('')

    form.setFieldsValue({
      rentsandlease: "",
      person_type: "",
      moveablerent: "",
      death_tariff: "",
      amount_link: "",
      member: "",
      festivals: "",
      advance_amt: "",
      balance_amt: "",
      amount: "",
      absent_amt: "",
      exception_amt: "",
      present: "",
      payment_mode: "",
      moveable_asset_payment: "",
      comments: "",
      funds: "",
      fund_name: "",
      fund_member: "",
      member_name: "",
      chitt_fund: "",
      chit_name: "",
      interest_principle: "",
      interest_field: "",
      interst_amount: "",
      penalty_amount: "",
      principal_amt: "",
      personId: "",
      interest_category: "",
      balance_type:"",

    });

    const ChoiceType = { ...value };

    const UserChoiceValues = {
      category: ChoiceType?.value,
    };
    const MarriageValues = {
      category: ChoiceType?.value,
    };

    // For Subscription Tariff: fetch the list of active tariffs FIRST,
    // then use its newest entry as `type` for the "Choose Member" fetch.
    // Previously we used a stale `subsCategory[0]?.id` which caused paid
    // members to leak into the dropdown.
    if (ChoiceType?.value === "Subscription Tariff") {
      const tariffList = await HandleSelectType(UserChoiceValues);
      const activeType = (Array.isArray(tariffList) && tariffList[0]?.id) || "";
      await HandleSelectMemberCollection({
        category: ChoiceType?.value,
        type: activeType,
      });
      return;
    }

    if (ChoiceType?.value === "Marriage") {
      HandleMarriageCollect(MarriageValues)
    }
    else if (ChoiceType?.value === "Chit Interest") {
      HandleSelectChitInterest(UserChoiceValues)
    }

    // if (ChoiceType?.value !== "Marriage" && ChoiceType?.value !== "Balance" || ChoiceType?.value === "Fund" || ChoiceType?.value !== "Chit Interest") {
    //   HandleSelectType(UserChoiceValues);
    // }

    if (ChoiceType?.value === "Fund" || ChoiceType?.value === "Rent" || ChoiceType?.value === "Lease" || ChoiceType?.value === "Festival" ||
      ChoiceType?.value === "Death Tariff" || ChoiceType?.value === "Management Interest" || ChoiceType?.value === "Chit Interest" ||
      ChoiceType?.value === "Moveable Rent") {
      HandleSelectType(UserChoiceValues);
    }

  };
  //--------------------------------------------------------
  const HandleSelectType = async (data) => {
    try {
      const response = await request.post(APIURLS.SELECTED_TYPE_COLLECTIONS, data);
      setGetdetailTotal(response.data);
      setLeaseDetails(response.data)
      setSubsCategory(response.data);
      setDeathMember(response.data);
      setFestivalData(response.data)
      setMoveableRental(response.data)
      return response.data;
    } catch (error) {
      errorHandler(error);
      return [];
    }
  };

  const HandleSelectMemberCollection = async (data) => {
    await request
      .post(APIURLS.SELECTED_TYPE_COLLECT_TWO, data)
      .then(function (response) {
        // successHandler(response, {
        //   notifyOnSuccess: true,
        //   notifyOnFailed: true,
        //   msg: "success",
        //   type: "success",
        // });
        setGetdetailTotal(response.data);
        setSubsMember(response.data);
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  const HandleSelectChitInterest = async (data) => {
    await request
      .get(APIURLS.CHIT_INT_COLLECTIONS, data)
      .then(function (response) {
        setChitIntDetails(response.data)
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };


  useEffect(() => {
    if (collectionType && collectionType === "Management Interest") {
      GetManageInteresetDetails();
    }
  }, [collectionType])

  const GetManageInteresetDetails = async (data) => {
    await request
      .get(APIURLS.GET_MANAGE_INTEREST_DETAILS, data)
      .then(function (response) {
        setInterestDetails(response.data);
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  //-------------- Choose Marriage collection Post---------

  const HandleMarriageCollect = async (data) => {
    await request
      .post(APIURLS.MARRIAGE_COLLECTIONS, data)
      .then(function (response) {
        // successHandler(response, {
        //   notifyOnSuccess: true,
        //   notifyOnFailed: true,
        //   msg: "success",
        //   type: "success",
        // });
        setMarriageDetails(response.data)
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };
  //--------- Balance Collection Type Change Post------------------
  const HandleBalanceCollect = async (data) => {
    await request
      .post(APIURLS.BALANCE_COLLECTIONS, data)
      .then(function (response) {
        setBalanceDetails(response.data)
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  const HandleBalanceInterestCollect = async (data) => {
    await request
      .post(APIURLS.BALANCE_INTEREST_COLLECTIONS, data)
      .then(function (response) {
        setBalanceIntDetails(response.data)
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };
  //  ---------------FundOptions -------------------
  const FundOptions = getdetailTotal?.map((fund) => ({
    label: `${fund?.fund_name} (${fund?.fund_type})`,
    value: fund?.id,
  }));

  //  ---------------festivaloptions -------------------
  // Only show upcoming/active festivals. Any festival whose `action` has
  // been toggled to false (marked Completed) or whose end_date has passed
  // must NOT appear in the Choose Festival dropdown on the Collection form.
  const _todayISO = new Date().toISOString().slice(0, 10);
  const festivaloptions = festivalData
    ?.filter(
      (fest) =>
        fest?.action !== false &&
        (!fest?.end_date || String(fest.end_date) >= _todayISO)
    )
    .map((fest) => ({
      label: `${fest?.festival_name} / ${fest?.festival_no}`,
      value: fest?.id,
    }));

  //  ---------------Rent options -------------------
  const Rentoptions = leaseDetails?.map((rentmap) => ({
    label: `${rentmap?.asset_name}/  ${rentmap?.lease_rent_no}  /${rentmap?.tenat_mobile}`,
    value: rentmap?.id,
  }));

  //  ------------------- Lease optionsdetails -------------------
  const Leaseoptions = leaseDetails?.map((leasemap) => ({
    label: `${leasemap?.asset_name}/  ${leasemap?.lease_rent_no} /${leasemap?.tenat_mobile}`,
    value: leasemap?.id,
  }));
  //  ------------------- MoveableRent optionsdetails

  const MoveableRentoptions = moveableRental?.map((move) => ({
    label: `${move?.tenat_name}/  ${move?.rent_no}  /${move?.tenat_mobile}`,
    value: move?.id,
  }));

  //  ------------------- Moveable PayType optionsdetails----------------

  const MoveablePayType = [
    {
      label: "Paid",
      value: "Paid",
    },
    {
      label: "Received",
      value: "Received",
    },

  ]
  //  ------------------- persontype options -------------------

  const persontypeoptions = fundPerson?.map((peropt) => ({
    label: `${peropt?.member_name} / ${peropt?.mobile_no}`,
    value: peropt?.id,
  }));

  //  ------------------- Death Options-------------

  const DeathOptions = deathMember?.map((peropt) => ({
    label: peropt?.member_name,
    value: peropt?.id,
  }));
  //---------------  ---- Marriage options -------------=

  const marriageOptions = marriageDetails?.map((mar) => ({
    label: `${mar?.list}/ ${mar?.mobile_number}`,
    value: mar?.ser?.id
  }))
  //-------------------- Balance  options ---------------

  const balanceOptions = balanceDetails?.map((mar) => ({
    label: `${mar?.list?.member_name}/ ${mar?.list?.member_mobile_number}`,
    value: mar?.list?.id
  }))

  const balanceIntrestOptions = balanceIntDetails?.map((int) => ({
    label: `${int?.people_name}/ ${int?.people_mobile}`,
    value: int?.id
  }))

  //  ----------- Choose Management Interest Options-------
  const ChitIntOptions = chitintDetails?.map((chi) => ({
    label: `${chi?.chit_no} / ${chi?.chit_name}`,
    value: chi.id,
  }));
  //---------------------Interest Options -----------------------------------

  const ManagementIntPersonOptions = chitDetails?.map((mem) => ({
    label: `${mem?.people_name} / ${mem?.people_mobile} / ${mem?.intrest_no}`,
    value: mem?.id,
  }));
  const ChitIntPersonOptions = chitDetails?.map((mem) => ({
    label: `${mem?.people_name} / ${mem?.people_mobile} / ${mem?.intrest_no}`,
    value: mem?.id,
  }));

  //---------------- Choose All Member Options =========

  const MemberOptions = subsMember?.map((sub) => ({
    label: `${sub?.member_name} / ${sub?.member_mobile_number}`,
    value: sub?.id,
  }));
  //------------------------------------------------------------
  const SubscriptioMemberBased = (values) => {
    request
      .post(APIURLS.SUBSCRIPTION_COLLECTIONS, values)
      .then(function (response) {
        // successHandler(response, {
        //   notifyOnSuccess: true,
        //   notifyOnFailed: true,
        //   msg: "success",
        //   type: "success",
        // });
        setSubsAmt(response.data?.amount_ser);
        setSetSubcriptionId(response.data?.sub_tari_ser)
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  //--------------------------handle All Memebr onChange Fn ----------------------------

  const handleMemberChange = (value) => {
    const FinfMangeIntrMemId = getdetailTotal?.find((mem) => mem?.id === value);
    form.setFieldsValue({ member_name: FinfMangeIntrMemId?.member_name });
    const Membervalues = {
      type: subsCategory[0]?.id,
      member: value,
      category: collectionType,
    };
    const DeathId = form.getFieldValue("death_tariff")
    const DeathMembervalues = {
      type: DeathId,
      member: value,
      category: collectionType,
    };

    const FestivalsId = form.getFieldValue("festivals")
    const FestivalMembervalues = {
      type: FestivalsId,
      member: value,
      category: collectionType,
    };

    if (collectionType === "Subscription Tariff") {
      SubscriptioMemberBased(Membervalues);
      form.resetFields(["present", "amount", "absent_amt", "exception_amt"])
    }
    else if (collectionType === "Death Tariff") {
      ChoosMemFindIDPost(DeathMembervalues)
    }
    else if (collectionType === "Festival") {
      ChoosMemFindIDPost(FestivalMembervalues)
    }

    if (value) {
      setAbsentChecked(true);
    }
  };

  //------------------ Marriage OnChange Fn --------------------------

  const handleMarriageChange = (value) => {
    const FindMarriageAmtDetails = marriageDetails?.find((mar) => mar?.ser?.id === value);
    form.setFieldsValue({ amount: FindMarriageAmtDetails?.ser?.total_bal_amt })
    form.setFieldsValue({ marriage_name: FindMarriageAmtDetails?.list })
    form.setFieldsValue({ marriage: FindMarriageAmtDetails?.ser?.marriage })
  }

  //-------------------- Balalance OnChange --------------------

  const handleBalanceChange = (value) => {
    const FindBalanceAmtDetails = balanceDetails?.find((bal) => bal?.list?.id === value);
    setMaxLease(undefined);
    form.resetFields(["amount"]);
    form.setFieldsValue({ TotalAmt: FindBalanceAmtDetails?.amount })
    form.setFieldsValue({ balance_name: `${FindBalanceAmtDetails?.list?.member_name}/ ${FindBalanceAmtDetails?.list?.member_mobile_number}` })
  }

  const handleBalanceIntChange = (value) => {
    const FindBalanceAmtDetails = balanceIntDetails?.find((bal) => bal?.id === value);
    setMaxLease(undefined);
    form.resetFields(["amount"]);
    form.setFieldsValue({ TotalAmt: FindBalanceAmtDetails?.amount })
    form.setFieldsValue({ interest: FindBalanceAmtDetails?.id })
    form.setFieldsValue({ balance_name: `${FindBalanceAmtDetails?.people_name}/ ${FindBalanceAmtDetails?.people_mobile}` })
  }
  //-------------------- Chit Interest options----------------------

  const ChitInterestOption = getdetailTotal?.map((chit) => ({
    label: chit?.chit_name,
    value: chit?.id,
  }));

  //  --------------- Death Onchange---------------------------

  useEffect(() => {
    form.setFieldsValue({ death_tariff: findDeathId?.id });
    form.setFieldsValue({ type: findDeathId?.id });
  }, [findDeathId]);

  useEffect(() => {
    form.setFieldsValue({ member: DeathMemFind?.id });
  }, [DeathMemFind]);

  const handleoptiondeath = (value) => {
    const FindDeathID = deathMember?.find((find) => find?.id === value);
    setFindDeathId(FindDeathID);
    form.setFieldsValue({ death_name: FindDeathID?.member_name })

    const ChoiceCategory = form.getFieldValue("collection_category");

    const TypeSelectTwo = {
      category: ChoiceCategory,
      type: value,
    };
    HandleSelectMemberCollection(TypeSelectTwo);
    if (value) {
      form.setFieldsValue({ member: null })
    }
  };
  const handleFestivals = (value) => {
    const FindFestivalId = festivalData?.find((fest) => fest?.id === value);
    form.setFieldsValue({ festival_name: FindFestivalId?.festival_name })

    const ChoiceCategory = form.getFieldValue("collection_category");

    const TypeSelectTwo = {
      category: ChoiceCategory,
      type: value,
    };
    HandleSelectMemberCollection(TypeSelectTwo);

    if (value) {
      form.setFieldsValue({ member: null })
    }
  }
  const handleMoveableRent = (value) => {
    const FindMoveableRentDeatils = moveableRental?.find((move) => move?.id === value);
    form.setFieldsValue({ moveable_rent_name: `${FindMoveableRentDeatils?.tenat_name} / ${FindMoveableRentDeatils?.rent_no}` })

    const ChoiceCategory = form.getFieldValue("collection_category");

    const TypeSelectTwo = {
      category: ChoiceCategory,
      type: value,
      member: "",
    };

    ChoosMemFindIDPost(TypeSelectTwo);

    if (value) {
      form.setFieldsValue({ member: null })
      form.resetFields(["payment_mode", "transaction_type"])
      setPaymentMode([])
      setPaymentValue([])
    }

  }

  const handlePersonDeath = (value) => {
    const FinfDeathMemId = getdetailTotal?.find(
      (rentmemid) => rentmemid?.id === value
    );
    setDeathMemFind(FinfDeathMemId);

    const ChoiceCategory = form.getFieldValue("collection_category");
    const MemberChosType = form.getFieldValue("death_tariff");
    const TypeSelectTwo = {
      category: ChoiceCategory,
      type: MemberChosType,
      member: value,
    };
    ChoosMemFindIDPost(TypeSelectTwo);
  };

  // ========= Choose Fund onchange  Post
  const [fundId, setFundId] = useState({})
  const handleChooseFund = (value) => {
    const ChoiceCategory = form.getFieldValue("collection_category");
    setFundId(value);
    const TypeSelectTwo = {
      category: ChoiceCategory,
      type: value,
    };

    PostFundDetailsMember(TypeSelectTwo)
    const FindFundMember = getdetailTotal?.find((gr) => gr.id === value);

    form.setFieldsValue({ fund_name: FindFundMember?.fund_name })
    if (value) {
      form.setFieldsValue({ fund_member: "" });
    }
    form.resetFields(['fund_member', 'amount', 'member_name', 'mobile_number'])
  };


  useEffect(() => {
    form.setFieldsValue({ type: findRentID?.id });
  }, [findRentID]);

  useEffect(() => {
    form.setFieldsValue({ member: findRentMemId?.id });
  }, [findRentMemId]);
  // -------------- Choose rent onchange  Post--------------------
  const handleChooseRent = (value) => {
    const FindRentDetails = leaseDetails?.find((ren) => ren?.id === value)
    form.setFieldsValue({ rent_name: `${FindRentDetails?.asset_name}/${FindRentDetails?.lease_rent_no}` })

    const ChoiceCategory = form.getFieldValue("collection_category");

    const TypeSelectTwo = {
      category: ChoiceCategory,
      type: value,
      member: "",
    };
    ChoosMemFindIDPost(TypeSelectTwo);
  };


  useEffect(() => {
    form.setFieldsValue({
      type: leaseChosFindID?.id,
    });
  }, [leaseChosFindID]);

  useEffect(() => {
    form.setFieldsValue({ member: findLeaseMemId?.id });
  }, [findLeaseMemId]);

  const calculateLeaseCreditAmount = (e) => {
    if (collectionType === "Lease" || collectionType === "Rent" ||
      collectionType === "Subscription Tariff" || collectionType === "Death Tariff" || collectionType === "Balance") {

      let LeaseCreditAMt = (collectionType === "Subscription Tariff" || collectionType === "Balance") ? parseFloat(form.getFieldValue("TotalAmt")) : parseFloat(form.getFieldValue("credit_amt")) || 0;
      const PayAmt = parseFloat(e);

      if (PayAmt > LeaseCreditAMt) {
        toast.warn("Amount not greater than Total Amount!");
        setLeaseAmtDisabled(true);
        setMaxLease(LeaseCreditAMt)
      } else {
        setLeaseAmtDisabled(false);
        LeaseCreditAMt = PayAmt;
        setMaxLease("")
      }
    }
    else {

    }
  };
  //---------------- Handle Choose Lease Onchange Fn----------------------

  const handleLesedetails = (value) => {
    const FindLeaseDetails = leaseDetails?.find((leas) => leas?.id === value)
    form.setFieldsValue({ lease_name: `${FindLeaseDetails?.asset_name}/${FindLeaseDetails?.lease_rent_no}` })

    const ChoiceCategory = form.getFieldValue("collection_category");

    const TypeSelectTwo = {
      category: ChoiceCategory,
      type: value,
      member: "",
    };
    ChoosMemFindIDPost(TypeSelectTwo);

  };

  useEffect(() => {
    form.setFieldsValue({ manageId: manageInterestId?.id });
  }, [manageInterestId]);

  // useEffect(() => {
  //   form.setFieldsValue({ member: findMInterestMemId?.id });
  // }, [findMInterestMemId]);

  //-=============  Chit Interest category======================

  const handleChitInterestChange = (value) => {
    const ChitInterestFind = chitintDetails?.find((fb) => fb?.id === value);
    setManageInterestId(ChitInterestFind);
    form.setFieldsValue({ chit_name: ChitInterestFind?.chit_name })

    const ChitIntVlues = {
      // category: ChitInterestFind?.interest_type,
      type: ChitInterestFind?.id,
      // member: ChitInterestFind?.people_member,
    };
    PostChitInterestDetails(ChitIntVlues);

    form.resetFields(['member', 'interest_principle', 'interest_field', 'interst_amount', 'amount', 'penalty_amount', 'interest', 'personId', 'mobile_number'])
    setprinChecked(false);
    setIntChecked(false);
  };
  const InterestTypePost = async (data) => {
    await request
      .post(APIURLS.COLLECTION_INTEREST_FILTER_DETAILS, data)
      .then(function (response) {
        setChitDetails(response.data);
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };
  //------------- Handle Pricipal Checked Function---------------
  const handlepricipalChecked = (e) => {
    setprinChecked(!prinChecked);
    form.resetFields(["personId", "principal_amt", "installment_amt", "no_count_install",
      "amount", "interst_amt", "penalty_amt", "interst_amount", "penalty_amount","interest_category","_original_principal_amt","_original_amount","_original_penalty_amt"]);

  };
  //------------ Handle Interest Checked Function--------------

  const handleInterestChecked = (e) => {
    setIntChecked(!intChecked);
    form.resetFields(["personId", "principal_amt", "installment_amt", "no_count_install",
      "amount", "interst_amt", "penalty_amt", "interst_amount", "penalty_amount","interest_category","_original_principal_amt","_original_amount","_original_penalty_amt"]);
  };
  //--------------- Handle Management Interest Person onChange fn--------------

  const handlePersonManegeInterst = (value) => {
    const FinfMangeIntrMemId = getdetailTotal?.find(
      (mem) => mem?.id === value
    );
    setFindMInterestMemId(FinfMangeIntrMemId);

    const ChoiceCategory = form.getFieldValue("collection_category");
    const MemberChosType = form.getFieldValue("manageId");
    const PersonMangementDetails = chitDetails?.find((item) => item?.id === FinfMangeIntrMemId?.id)
    setIntrestType(PersonMangementDetails)
    const TypeSelectTwo = {
      category: ChoiceCategory,
      type: PersonMangementDetails?.id,
      member: "",
    };
    ChoosMemFindIDPost(TypeSelectTwo);
    form.setFieldsValue({ member_name: FinfMangeIntrMemId?.people_name });
    form.setFieldsValue({ member: FinfMangeIntrMemId?.people_member });
    form.setFieldsValue({ mobile_number: FinfMangeIntrMemId?.people_mobile });
    // form.setFieldsValue({ interest_category: FinfMangeIntrMemId?.interest_category });


    form.resetFields(["no_count_install", "discount_amount"])
  };
  //--------------- Handle Chit Interest Person onChange fn--------------

  const handlePersonChitInterst = (value) => {
    const findChitDetails = getdetailTotal?.find(
      (mem) => mem?.id === value
    );
    setFindMInterestMemId(findChitDetails);

    const ChoiceCategory = form.getFieldValue("collection_category");

    const ChitPersonFind = chitDetails?.find((item) => item?.id === findChitDetails?.id)
    setIntrestType(ChitPersonFind)
    const ChitValues = {
      category: ChoiceCategory,
      type: ChitPersonFind?.id,
      member: "",
    };
    ChoosMemFindIDPost(ChitValues);
    form.setFieldsValue({ member_name: findChitDetails?.people_name });
    form.setFieldsValue({ member: findChitDetails?.people_member });
    form.setFieldsValue({ mobile_number: findChitDetails?.people_mobile });
    // form.setFieldsValue({ interest_category: findChitDetails?.interest_category });

    form.resetFields(["no_count_install", "amount"])

  };
  //-----------------Handle Pricipal Amt,Interest Amt,Penalty Amt onChange Fn---------------

  const handlePricipalPay = (value) => {
    const Amount = value || 0;
    const principalAmt = form.getFieldValue("principal_amt") || 0;

    const InterestAmt = form.getFieldValue("installment_amt") || 0;
    const NoCount = form.getFieldValue("no_count_install") || 0;

    let PrincipalAmount;
    if (intCategory === "Installment Interest") {

      PrincipalAmount = InterestAmt * NoCount || 0;
      form.setFieldsValue({ amount: PrincipalAmount });
      // Feb 2026 owner rule: keep the hidden "_original_amount" mirror
      // in sync so the Discount helper sees the LATEST principal-pay
      // amount as its base whenever No of Count changes.
      form.setFieldsValue({ _original_amount: PrincipalAmount });

      // Feb 2026 owner rule: dynamically reduce the displayed
      // Principal Amt as No of Count grows so operators see the
      // remaining balance in real time.  ``_original_principal_amt``
      // is a hidden mirror of the picked borrower's principal_balance
      // — used ONLY for this UI arithmetic; backend still reads the
      // authoritative balance from the DB.
      const original = Number(form.getFieldValue("_original_principal_amt") || 0);
      const remaining = Math.max(original - Number(PrincipalAmount || 0), 0);
      // When No of Count is cleared / zeroed, restore the pristine
      // original so the user sees the full outstanding balance again.
      if (!NoCount || Number(NoCount) <= 0) {
        form.setFieldsValue({ principal_amt: original });
      } else {
        form.setFieldsValue({ principal_amt: remaining });
      }
    }
    // if (Amount > principalAmt || PrincipalAmount > principalAmt) {
    //   toast.warn("Principal Pay Amount cannot be greater than Principal Amount !");
    //   setPrincpleMax(0);
    //   setInstallMax(0);
    //   setDisabled(true)

    // }
    // else {
    else {
      if (value <= 0) {

        form.setFieldsValue({ amount: 1 })
      }
    }
    setPrincpleMax("");
    setInstallMax("");
    setDisabled(false)
    // }

    // if(value < 0){
    //   form.setFieldsValue({amount:1})
    // }
    form.resetFields(["discount_amount"])

  };

  const handleInterestAmt = (value) => {
    const PayAmount = value || 0;
    const InterestAmt = form.getFieldValue("interst_amt") || 0;

    if (PayAmount > InterestAmt) {
      toast.warn("Interest Pay Amount cannot be greater than Interest Amt !");
      setInterestMax(0);
    }
    else {
      setInterestMax("")
    }

  }
  const handlePenaltyAmt = (value) => {
    const PayAmount = value || 0;
    const PenaltyAmt = form.getFieldValue("penalty_amt") || 0;

    if (PayAmount > PenaltyAmt) {
      toast.warn("Penalty Pay Amount cannot be greater than Penalty Amt !");
      setPenaltyMax(0);
    }
    else {
      setPenaltyMax("")
    }

  }

  //---------------- Subscription Tariff --------------------

  const handlePresentChecked = (e) => {
    setPresentChecked(e.target.value);

    if (e.target.value === true) {
      form.setFieldsValue({ TotalAmt: subsAmt?.amount });
      form.setFieldsValue({ amount: subsAmt?.amount || 0 });
      form.setFieldsValue({ sub_tariff: subcriptionId?.id })
    } else {
      form.setFieldsValue({ sub_tariff: subcriptionId?.id })

      form.setFieldsValue({ absent_amt: subsAmt?.amount || 0 });
      form.setFieldsValue({ exception_amt: subsAmt?.exception_amount || 0 });
      form.setFieldValue(
        "amount", (parseFloat(subsAmt?.amount) || 0) + (parseFloat(subsAmt?.exception_amount) || 0));
    }
  };

  //----------------- Choos Member Find Amount Details Post-----------------

  const ChoosMemFindIDPost = async (data) => {
    await request
      .post(APIURLS.FIND_MEM_ID_POST, data)
      .then(function (response) {
        setPlaceFindMem(response.data);
        setDeathAmt(response.data);

        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  const PostChitInterestDetails = async (data) => {
    await request
      .post(APIURLS.POST_INT_PERSON_DETAILS, data)
      .then(function (response) {
        // setChitDetails(response.data);
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };
  //----------------- Choos Member  Fund details Post-----------------

  const PostFundDetailsMember = async (data) => {
    await request
      .post(APIURLS.FUND_MEM_DETAILS, data)
      .then(function (response) {
        setFundPerson(response.data)
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };
  useEffect(() => {
    form.setFieldsValue({
      credit_amt: PlaceFindMem?.credit_amt, //Lease Collcetion
      principal_amt: PlaceFindMem?.principal_balance, // Management Interest Select member name/Int No
      // Feb 2026 owner rule: stash the original picked-borrower
      // principal balance in a hidden field so `handlePricipalPay`
      // can compute the DISPLAYED remaining balance as the operator
      // increases "No of Count". Purely UI arithmetic — backend
      // (collection/views.py) reads principal_balance from the DB,
      // never from this payload.
      _original_principal_amt: PlaceFindMem?.principal_balance,
      // Feb 2026 owner rule: hidden mirrors of the original `amount`
      // (principal pay amt) and `penalty_amt` — used by
      // `handleDiscountInstallAmt` to compute the LIVE remaining
      // amount as the operator types Discount. Backend uses DB values,
      // never these.
      _original_amount: (collectionType === "Chit Interest" || collectionType === "Management Interest") ? 0 : (PlaceFindMem?.balance_amt || PlaceFindMem?.total_bal_amt || 0),
      _original_penalty_amt: PlaceFindMem?.penalty_balance_amt || 0,
      interst_amt: intCategory === "Interest" ? PlaceFindMem?.interest_current_month : PlaceFindMem?.intrest_balance_amt,
      penalty_amt: PlaceFindMem?.penalty_balance_amt, //          ""
      TotalAmt: PlaceFindMem?.amount, //   Death tariff amount       ""
      interest: PlaceFindMem?.interest,
      installment_amt: PlaceFindMem?.installment_amt,
      amount: (collectionType === "Chit Interest" || collectionType === "Management Interest") ? "" : PlaceFindMem?.balance_amt || PlaceFindMem?.total_bal_amt,

    });

    if (collectionType === "Moveable Rent") {
      form.setFieldsValue({ advance_amt: PlaceFindMem?.advance_amt })
      form.setFieldsValue({ balance_amt: PlaceFindMem?.balance_amt })
      form.setFieldsValue({
        amount: Math.abs((PlaceFindMem?.balance_amt || 0) - (PlaceFindMem?.advance_amt || 0))

      });
      if (parseFloat(PlaceFindMem?.advance_amt) > parseFloat(PlaceFindMem?.balance_amt)) {
        form.setFieldsValue({ moveable_asset_payment: 'Paid' })
        setMoveassetShow(false)
      }
      else if (parseFloat(PlaceFindMem?.advance_amt) < parseFloat(PlaceFindMem?.balance_amt)) {
        form.setFieldsValue({ moveable_asset_payment: 'Received' })
        setMoveassetShow(true)
      }
      else {
        form.setFieldsValue({ moveable_asset_payment: "" })
        setMoveassetShow(false)
      }
    }
    else {
      setMoveassetShow(true)
    }
  }, [PlaceFindMem]);

  //----------------- Handle Pay Date onChange Function--------------
  const handlePayDate = (date) => {
    setSelectedDate(date);
  };
  //------------- Handle Person Type Select Fn------------------------

  const handlePersonType = (e, value) => {
    setPersonType(e);
    const FindFundPersonDetails = fundPerson?.find((fun) => fun?.id == e);

    const TypeSelectTwo = {
      category: collectionType,
      type: fundId,
      member: e,
    };
    ChoosMemFindIDPost(TypeSelectTwo);
    form.setFieldsValue({ member_name: FindFundPersonDetails?.member_name });
    form.setFieldsValue({ mobile_number: FindFundPersonDetails?.mobile_no });

    // form.setFieldsValue({ amount: PlaceFindMem?.balance_amt });
  };

  //--------------Handle Discount amount Interest install amt 
  const handleDiscountInstallAmt = (value) => {
    // Feb 2026 owner rule (WAIVER mode + auto-cap):
    // -  Installment Interest chosen → discount reduces the DISPLAYED
    //    Principal Pay Amt (form field ``amount``).
    // -  Penalty is being paid → discount reduces the DISPLAYED
    //    Penalty Amt (form field ``penalty_amt``).
    // -  Auto-cap at the target field's original value so the operator
    //    can never enter a discount larger than what's actually owed.
    // -  Purely UI arithmetic — the backend applies the real ledger
    //    waiver (see collection/views.py).
    const Discount = Number(value) || 0;

    // Discount applies to Penalty when interest_field is ticked and a
    // penalty balance is loaded; otherwise it applies to the principal
    // pay amount.
    const origAmount = Number(form.getFieldValue("_original_amount") || 0);
    const origPenalty = Number(form.getFieldValue("_original_penalty_amt") || 0);
    const payingPenalty = origPenalty > 0 && intChecked === true;

    // Auto-cap
    let cappedDiscount = Discount;
    let overflowed = false;
    if (payingPenalty && Discount > origPenalty) {
      cappedDiscount = origPenalty;
      overflowed = true;
    } else if (!payingPenalty && Discount > origAmount) {
      cappedDiscount = origAmount;
      overflowed = true;
    }
    if (overflowed) {
      toast.warn(
        `Discount capped at Rs. ${cappedDiscount} — cannot exceed the ${payingPenalty ? "Penalty Amt" : "Principal Pay Amt"}.`
      );
      form.setFieldsValue({ discount_amount: cappedDiscount });
    }

    // Live-reduce the displayed target field.
    if (payingPenalty) {
      const remaining = Math.max(origPenalty - cappedDiscount, 0);
      form.setFieldsValue({ penalty_amt: remaining });
    } else {
      const remaining = Math.max(origAmount - cappedDiscount, 0);
      form.setFieldsValue({ amount: remaining });
    }
  }
  //------------ Handle Select Bank Fn------------------------------
  const handleBankOptions = (e) => {
    setBankId(e)
    const BankIdFind = AllBankName?.find((ban) => ban?.id === e)
    form.setFieldsValue({ bank_name: BankIdFind?.bank_name })

  };
  //----------------- Handle Choose Transaction Type------------------

  const handleBankPayOptions = (e) => {
    if (e.target.value === 'UPI') {
      setBankPay(e.target.value)
    }
    else {
      setBankPay(e.target.value)
    }
  }
  //--------------- Handle Transaction onChange Fn-------------------
  const handleTransactionDate = (date) => {
    setSelectedDatethre(date);
  };
  //--------------- Handle Income Date onChange Fn-------------------
  const handleIncomeDate = (date) => {
    setSelectedDatetwo(date);
  };
  //--------------- Handle Transaction Type-------------
  const handleTransactionType = (e) => {
    setTransactionType(e.target.value);
    if (e) {
      form.resetFields(["trans_no", "bank_link", "transaction_date", "bank_pay"
      ])

    }
  };

  //------------- Balance Type Change -------------

  const handleBalanceTypeChange = (e) => {
    setBalanceType(e.target.value);
    form.resetFields(["balance_name", "member", "payment_mode", "amount", "TotalAmt"]);
    setMaxLease(undefined);
    setPaymentMode([]);

    const BalanceValues = {
      category: collectionType,
    };

    if (e.target.value === "Interest Balance") {
      HandleBalanceInterestCollect(BalanceValues)
    }
    else if (e.target.value === "Other") {
      HandleBalanceCollect(BalanceValues);
    }
    else {

    }

  }
  //------------- Handle Payment Mode------------

  const handlePaymentMode = (selectedMode) => {
    setPaymentValue(selectedMode)
    setTransactionType([])
    form.resetFields(["transaction_type"])
    if (selectedMode === "Online") {
      setPaymentMode([
        {
          label: "Bank",
          value: "Bank",
          checked: true,
        },
      ]);
    }

    else if (selectedMode === "Offline") {
      setPaymentMode([
        {
          label: "Cash",
          value: "Cash",
          checked: true,
        },
      ]);

    }
  };
  //================ When Submit Click on Print==========================

  const printOk = async ({ record }) => {
    setModalContent(<ViewCollectionPrint CollectionRecord={record} />);
  };

  const PrintModal = (record) => {
    return (
      <Fragment>
        <h1 style={{ fontSize: '1.2rem' }}>Are you Sure You Want to Print ?</h1>
        <br />
        <Flex gap={'20px'} w_100={"true"} center={"true"} verticallyCenter={true}>
          <Button.Success text={'Print'} onClick={() => printOk(record)} />
          <Button.Danger text={'Cancel'} onClick={handleOk} />
        </Flex>
      </Fragment>
    )
  }
  const handlePrintClick = (record) => {
    setModalContent(<PrintModal record={record} />);
    showModal();
  }
  //-------------- ADD COLLECTION POST -----------------------

  const AddCollections = async (data) => {
    setLoading(true);
    await request
      .post(`${APIURLS.COLLECTION_DETAILS}`, data)
      .then(function (response) {

        if (response.status === 226) {
          toast.warn(response.data.message)
        }
        else {
          if (disabled) {
            toast.warn("Principal Pay Amt cannot be greater than Principal Amt !")
          }
          else {
            successHandler(response, {
              notifyOnSuccess: true,
              notifyOnFailed: true,
              msg: "success",
              type: "success",
            });
            form.resetFields();
            setTransactionType([]);
            setIntChecked(false);
            setprinChecked(false);
            setPresentChecked([]);
            setPaymentMode([]);
            setCollectionType([]);
            setSubsMember([]);
            setPaymentValue('');
            GetManageInteresetDetails();
            form.resetFields(["amount"])
            handlePrintClick(response.data);
          }
        }
        setLoading(false);
        return response.data;
      })
      .catch(function (error) {
        setLoading(false);
        return errorHandler(error);
      });
  };
  const [newValues, setNewValues] = useState(null);

  //-------------------------------------------------------
  const onFinish = (data) => {
    const record = {
      ...data,
      pay_date:
        data?.pay_date === null
          ? ""
          : dayjs(selectedDate).format("YYYY-MM-DD")
            ? dayjs(data?.pay_date).format("YYYY-MM-DD")
            : dayjs(data?.pay_date).format("YYYY-MM-DD"),
      income_date:
        data?.income_date === null
          ? ""
          : dayjs(selectedDatetwo).format("YYYY-MM-DD")
            ? dayjs(data?.income_date).format("YYYY-MM-DD")
            : dayjs(data?.income_date).format("YYYY-MM-DD"),
      transaction_date:
        data?.transaction_date === null
          ? ""
          : dayjs(selectedDatethre).format("YYYY-MM-DD")
            ? dayjs(data?.transaction_date).format("YYYY-MM-DD")
            : dayjs(data?.transaction_date).format("YYYY-MM-DD"),
    };

    let NewValues = {
      pay_date: record?.pay_date,
      income_date: record?.income_date || null,
      collection_category: record?.collection_category,
      amount: record?.amount || 0,      //<<<<<<<<<<<<<<<<<<<<<<<< amount <<<<<<<<<<<<<<<//
      present: record.present || null,
      absent_amt: record?.absent_amt || 0,
      exception_amt: record?.exception_amt || 0,
      funds: record?.funds || null,
      fund_name: record?.fund_name || null,
      fund_member: record?.fund_member || null,
      person_type: record?.person_type || null,
      member_name: record.member_name,
      interest_principle: prinChecked || false,
      interest_field: intChecked || false,
      interest: record?.interest || null,
      principal_amt: record?.principal_amt || 0,
      // Feb 2026: on Edit, seed the hidden mirror with the record's
      // principal_amt so any No-of-Count tweak still computes against
      // the original outstanding balance.
      _original_principal_amt: record?.principal_amt || 0,
      no_count_install: record?.no_count_install || 0,
      interst_amount: record?.interst_amount || 0,
      penalty_amount: record?.penalty_amount || 0,
      discount_amount: record?.discount_amount || 0,
      rentsandlease: record?.rentsandlease || null,
      rent_name: record?.rent_name || null,
      lease_name: record?.lease_name || null,
      type: record?.type || null,
      member: record?.member || null,
      festivals: record?.festivals || null,
      festival_name: record?.festival_name || null,
      death_name: record?.death_name || null,
      death_tariff: record?.death_tariff || null,
      marriage_name: record?.marriage_name || null,
      marriage: record?.marriage || null,
      members: record?.members || null,
      address: record?.address || null,
      absent_amount: record?.absent_amount || null,
      exception_amount: record?.exception_amount || 0,
      payment_mode: record?.payment_mode || null,
      transaction_type: record?.transaction_type || null,
      bank_name: record?.bank_name || null,
      bank_link: record?.bank_link || null,
      trans_no: record?.trans_no || null,
      transaction_date: record?.transaction_date || null,
      comments: record?.comments || null,
      upi_no: record?.upi_no || null,
      bank_pay: record?.bank_pay,
      sub_tariff: record?.sub_tariff || null,
      amount_link: record?.amount_link || null,
      balance_name: record?.balance_name || null,
      moveablerent: record?.moveablerent || null,
      moveable_rent_name: record?.moveable_rent_name || null,
      moveable_asset_payment: record?.moveable_asset_payment || 'Received',
      advance_amt: record?.advance_amt || 0,
      balance_amt: record?.balance_amt || 0,
      chitt_fund: record?.chitt_fund || null,
      chit_name: record?.chit_name || null,
      mobile_number: record?.mobile_number || null,
      ...(balanceType === "Interest Balance" && { balance_type: record?.balance_type || null })
    };
    if (prinChecked) {
      if (record?.amount > 0) {
      }
      else {
        toast.warn("Please enter a Principal Amount greater than 0!")

        return
      }
    }

    if (intChecked) {
      if (record?.penalty_amount > 0 || record?.interst_amount > 0) {
      }
      else {
        toast.warn("Please enter a Interest or Penalty Amount greater than 0!")
        return
      }
    }
    // console.log(NewValues, "addcollectionpost");
    console.log(NewValues)
    AddCollections(NewValues);
    setNewValues(NewValues); 
  };

  const onFinishFailed = () => {
    toast.warn("Please fill in all the required details !");
  };
  return (
    <>
    {/* {newValues && (
        <div>
          <h3>New Values:</h3>
          <pre>{JSON.stringify(newValues, null, 2)}</pre>
        </div>
      )} */}
    <Form
      name="AddCollection"
      form={form}
      labelCol={{
        span: 24,
      }}
      wrapperCol={{
        span: 24,
      }}
      initialValues={{
        pay_date: dayjs(),
        income_date: dayjs(),
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off">

      <CustomCardView>
        <CustomRow space={[24, 24]}>
          <Col span={24} md={12}>
            <CustomPageTitle Heading={"Collection"} />
          </Col>

          <Col span={24} md={12}>
            <Flex flexend={"right"} aligncenter>
              <Label>Date :&nbsp;&nbsp;</Label>
              <CustomDatePicker
                name={"income_date"}
                onChange={handleIncomeDate}
                disabled
              />
            </Flex>
          </Col>
          <Col span={24} md={12}>
            <CustomSelect
              label={"Choose Category"}
              name={"collection_category"}
              options={filteredOptions}
              onChange={handleCollectionType}
              rules={[
                {
                  required: true,
                  message: "Please Select a Category Type !",
                },
              ]}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomDatePicker
              label={"Pay Date"}
              name={"pay_date"}
              onChange={handlePayDate}
              disabled
            />
          </Col>
          {collectionType && collectionType === "Death Tariff" ? (
            <>
              <Col span={24} md={12}>
                <CustomSelect
                  label={"Choose Death Tariff"}
                  name={"death_tariff"}
                  options={DeathOptions}
                  onChange={handleoptiondeath}
                  rules={[
                    {
                      required: true,
                      message: "This Field is required !",
                    },
                  ]}
                />
                <CustomInput name={"death_name"} display={'none'} />
                <CustomInput name={"type"} display={"none"} />
              </Col>
            </>
          ) : null}
          {collectionType && collectionType === "Festival" ? (
            <>
              <Col span={24} md={12}>
                <CustomSelect
                  label={"Choose Festival"}
                  name={"festivals"}
                  options={festivaloptions}
                  onChange={handleFestivals}
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Festivals!",
                    },
                  ]}
                />
              </Col>
              <CustomInput name={'festival_name'} display={'none'} />
            </>
          ) : null}
          {collectionType && collectionType === "Moveable Rent" ? (
            <>
              <Col span={24} md={12}>
                <CustomSelect
                  label={"Choose Moveable Rent"}
                  name={"moveablerent"}
                  options={MoveableRentoptions}
                  onChange={handleMoveableRent}
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Moveable Rent!",
                    },
                  ]}
                />
                <CustomInput name={"moveable_rent_name"} display={'none'} />
              </Col>
              <Col span={24} md={6}>
                <CustomInput label={"Advance Amt"}
                  name={"advance_amt"}
                  precision={2}
                  suffix={"₹"}
                  disabled />
              </Col>
              <Col span={24} md={6}>
                <CustomInput label={"Total Amt"}
                  name={"balance_amt"}
                  precision={2}
                  suffix={"₹"}
                  disabled />
              </Col>
            </>
          ) : null}

          {collectionType && collectionType !== 'Rent' && collectionType !== 'Lease' && collectionType !== 'Marriage' &&
            collectionType !== 'Balance' && collectionType !== 'Moveable Rent' && collectionType !== 'Fund' && collectionType !== 'Management Interest' && collectionType !== "Chit Interest" ? <Col span={24} md={12}>
            <CustomSelect
              label={"Choose Member"}
              name={"member"}
              options={MemberOptions}
              onChange={handleMemberChange}
              rules={[
                {
                  required: true,
                  message: "Please Select a Member!",
                },
              ]}
            />
            <CustomInput name={'member_name'} display={'none'} />
          </Col> : null
          }
          {collectionType === "Chit Interest" &&
            <Col span={24} md={12}>
              <CustomSelect
                label={"Choose Chit Name"}
                name={"chitt_fund"}
                options={ChitIntOptions}
                onChange={handleChitInterestChange}
                rules={[
                  {
                    required: true,
                    message: "This Field is required !",
                  },
                ]}
              />

              <CustomInput name={"chit_name"} display={'none'} />
            </Col>
          }
          {collectionType && collectionType === "Lease" &&
            <>
              <Col span={24} md={12}>
                <CustomSelect
                  label={"Choose Lease"}
                  name={"rentsandlease"}
                  options={Leaseoptions}
                  onChange={handleLesedetails}
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Lease!",
                    },
                  ]}
                />
                <CustomInput label={"Lease"} name={"lease_name"} display={"none"} />
                <CustomInput name={"type"} display={"none"} />
              </Col>
              <Col span={24} md={12}>
                <CustomInput
                  label={"Credit Amount"}
                  name={"credit_amt"}
                  disabled
                  suffix={"₹"}
                />
              </Col>
            </>
          }
          {collectionType === "Subscription Tariff" && (
            <>
              <Col span={24} md={12}>
                <Col span={24} md={12}>
                  <CustomPageFormTitle Heading={"Subscription Tariff"} />
                </Col>
                <Flex flexstart={true} gap={"20px"}>
                  <CustomRadioButton
                    data={TariffRadio}
                    name={"present"}
                    onChange={handlePresentChecked}
                    rules={[
                      {
                        required: true,
                        message: "Please Choose Anyone!",
                      },
                    ]}
                  />
                </Flex>
                <CustomInput name={'sub_tariff'} display={'none'} />
              </Col>
              {absentChecked && (
                <>
                  {/* <Col span={24} md={12}>
              
              </Col> */}
                </>
              )}
            </>
          )}
          {collectionType === "Subscription Tariff" && (
            <>
              {presentChecked === false && (
                <>

                  <Col span={24} md={6}>
                    <CustomInput
                      label={"Subscription Tariff Amount"}
                      name={"absent_amt"}
                      disabled
                      suffix={"₹"}
                    />

                  </Col>
                  <CustomInput name={'sub_tariff'} display={'none'} />
                  {/* <Col span={24} md={12}>
                    <CustomInputNumber
                      label={"Amount"}
                      name={"amount"}
                      precision={2}
                      suffix={"₹"}
                    />
                  </Col> */}
                  <Col span={24} md={6}>
                    <CustomInputNumber
                      label={"Exception Amount"}
                      name={"exception_amt"}
                      precision={2}
                      suffix={"₹"}
                      disabled
                    />
                  </Col>
                </>
              )}
            </>
          )}

          {collectionType && collectionType === "Rent" ? (
            <>
              <Col span={24} md={12}>
                <CustomSelect
                  label={"Choose Rent"}
                  name={"rentsandlease"}
                  options={Rentoptions}
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Rent!",
                    },
                  ]}
                  onChange={handleChooseRent}
                />
                <CustomInput label={'Rent'} name={'rent_name'} display={"none"} />

                <CustomInput name={"type"} display={'none'} />
              </Col>
              <Col span={24} md={12}>
                <CustomInput
                  label={"Credit Amount"}
                  name={"credit_amt"}
                  disabled
                  suffix={"₹"}
                />
              </Col>
            </>
          ) : null}
          {collectionType === "Marriage" &&
            <Col span={24} md={12}>
              <CustomSelect
                label={"Choose Marriage Member"}
                name={"amount_link"}
                options={marriageOptions}
                onChange={handleMarriageChange}
                rules={[
                  {
                    required: true,
                    message: "Please Select a Marriage Member!",
                  },
                ]}
              />
              <CustomInput name={'marriage_name'} display={'none'} />
              <CustomInput name={'marriage'} display={'none'} />

            </Col>
          }
          {collectionType === "Balance" &&
            <>
              <Col span={24} md={12}>
                <CustomRadioButton
                  label={"Balance Type"}
                  data={BalanceCollectRadio}                         //--> Balance Collect Type
                  name={"balance_type"}
                  onChange={handleBalanceTypeChange}
                  rules={[
                    {
                      required: true,
                      message: "Please Choose Anyone !",
                    },
                  ]}
                />
              </Col>
              {balanceType === "Other" ?

                <Col span={24} md={12}>
                  <CustomSelect
                    label={"Choose Balance Member"}
                    name={"member"}
                    options={balanceOptions}
                    onChange={handleBalanceChange}
                    rules={[
                      {
                        required: true,
                        message: "Please Choose a Balance Member!",
                      },
                    ]}
                  />
                  <CustomInput name={'balance_name'} display={'none'} />
                </Col>
                :
                <Col span={24} md={12}>
                  <CustomSelect
                    label={"Choose Balance Member"}
                    name={"member"}
                    options={balanceIntrestOptions}
                    onChange={handleBalanceIntChange}
                    rules={[
                      {
                        required: true,
                        message: "Please Choose a Balance Member!",
                      },
                    ]}
                  />
                  <CustomInput name={'balance_name'} display={'none'} />
                  <CustomInput name={'interest'} display={'none'} />
                </Col>}

              <Col span={24} md={6}>
                <CustomInputNumber
                  label={"Total Balance Amount"}
                  name={"TotalAmt"}
                  precision={2}
                  suffix={"₹"}
                  defaultValue={0}
                  disabled
                />
              </Col>
              <Col span={24} md={6}>
                <CustomInputNumber
                  label={"Amount"}
                  name={"amount"}
                  precision={2}
                  suffix={"₹"}
                  max={maxLease}
                  defaultValue={0}
                  onChange={calculateLeaseCreditAmount}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter a Amount!",
                    },
                  ]}
                />
              </Col>
            </>
          }
          {collectionType && collectionType === "Fund" ? (
            <>
              <Col span={24} md={12}>
                <CustomSelect
                  label={"Choose Fund"}
                  name={"funds"}
                  options={FundOptions || []}
                  rules={[
                    {
                      required: true,
                      message: "This Field is required!",
                    },
                  ]}
                  onChange={handleChooseFund}
                />
                <CustomInput name={"fund_name"} display={'none'} />
              </Col>
              {/* <Col span={24} md={12}></Col> */}
              <Col span={24} md={12}>
                <CustomSelect
                  label={"Choose Person"}
                  name={"fund_member"}
                  options={persontypeoptions}
                  onChange={handlePersonType}
                  rules={[
                    {
                      required: true,
                      message: "Required !",
                    },
                  ]}
                />
              </Col>
              <CustomInput name={"member_name"} display={'none'} />
              <CustomInput name={"mobile_number"} display={'none'} />
            </>
          ) : null}
          {(collectionType && collectionType === "Management Interest") ||
            (collectionType && collectionType === "Chit Interest") ? (
            <>
              {/* <Col span={24} md={12}>
                <CustomSelect
                  label={"Choose Management Interest"}
                  name={"interest"}
                  options={ManageIntresOption}
                  onChange={handleOptionManagInterest}
                  rules={[
                    {
                      required: true,
                      message: "This Field is required !",
                    },
                  ]}
                />

                <CustomInput name={"manageId"} display={"none"} />
              </Col> */}
              <Col span={24} md={12}>
                <Flex gap={"15px"}>
                  <CustomCheckBox
                    label={intCategory === "Installment Interest" ? "Installment Amount" : "Principal"}
                    name={"interest_principle"}
                    onChange={handlepricipalChecked}
                    rules={[
                      {
                        required: true,
                        message: "Please Choose Anyone !",
                      },
                    ]}

                  />
                  {intCategory === "Installment Interest" ?
                    <CustomCheckBox
                      label={"Penalty"}
                      name={"interest_field"}
                      onChange={handleInterestChecked}
                      rules={[
                        {
                          required: true,
                          message: "Please Choose Anyone !",
                        },
                      ]}
                    /> :
                    <CustomCheckBox
                      label={"Interest"}
                      name={"interest_field"}
                      onChange={handleInterestChecked}
                      rules={[
                        {
                          required: true,
                          message: "Please Choose Anyone !",
                        },
                      ]}
                    />}
                </Flex>
              </Col>
              <Col span={24} md={12}>
                <CustomSelect label={'Interest Category'}
                  name={"interest_category"}
                  options={InterestCatOptions}
                  onChange={handleIntCategory}
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Interest Category !",
                    },
                  ]}
                />
              </Col>
              <Col span={24} md={12}>
                <CustomSelect
                  label={"Choose Person"}
                  name={"personId"}
                  options={collectionType && collectionType === "Management Interest" ? ManagementIntPersonOptions : ChitIntPersonOptions}
                  onChange={collectionType && collectionType === "Management Interest" ? handlePersonManegeInterst : handlePersonChitInterst}
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Person!",
                    },
                  ]}
                />
                <CustomInput name={"member_name"} display={"none"} />
                <CustomInput name={"mobile_number"} display={"none"} />
                <CustomInput name={"member"} display={"none"} />
                <CustomInput name={"interest"} display={'none'} />
              </Col>
              <Col span={24} md={12}></Col>

              {prinChecked && (
                <>
                  <Col span={24} md={24}>
                    <CustomPageFormTitle Heading={intCategory === "Installment Interest" ? "Installment Amount Details"
                      : "Principal Amt Details"} />
                  </Col>

                  <Col span={24} md={12}>
                    <CustomInput
                      label={"Principal Amt"}
                      name={"principal_amt"}
                      disabled
                    />
                    {/* Feb 2026 owner rule: hidden mirror of the picked
                        borrower's original principal_balance.  Used by
                        handlePricipalPay to compute the DISPLAYED
                        remaining balance without ever hitting the DB. */}
                    <CustomInput name={"_original_principal_amt"} display={"none"} />
                  </Col>
                  {intCategory === "Installment Interest" ?
                    <>
                      <Col span={24} md={12}>
                        <CustomInputNumber
                          label={"Installment Amt"}
                          name={"installment_amt"}
                          suffix={"₹"}
                          disabled
                        />
                      </Col>
                      <Col span={24} md={12}>
                        <CustomInputNumber
                          label={"No of Count"}
                          name={"no_count_install"}
                          onChange={handlePricipalPay}
                          rules={[
                            {
                              required: true,
                              message: "Please enter a number of counts !",
                            },
                          ]}
                          suffix={"₹"}
                        />
                      </Col>
                      <Col span={24} md={12}>
                        <CustomInputNumber
                          label={"Principal Pay Amt"}
                          name={"amount"}
                          suffix={"₹"}
                          disabled
                          max={installMax}
                          rules={[
                            /* Feb 2026 owner rule: Principal Pay Amt
                               may never exceed the borrower's original
                               Principal Amt.  For Installment loans
                               this happens when No of Count ×
                               installment_amt > outstanding balance —
                               block submit and surface the error under
                               the field. */
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const orig = Number(getFieldValue('_original_principal_amt') || 0);
                                const paid = Number(value || 0);
                                if (paid > orig) {
                                  return Promise.reject(
                                    new Error(`Principal Pay Amt (Rs. ${paid}) cannot exceed Principal Amt (Rs. ${orig})`)
                                  );
                                }
                                return Promise.resolve();
                              }
                            })
                          ]}
                        />
                      </Col>
                    </>
                    :
                    <Col span={24} md={12}>
                      <CustomInputNumber
                        label={"Principal Pay Amt"}
                        name={"amount"}
                        suffix={"₹"}
                        onChange={handlePricipalPay}
                        rules={[
                          /* Same guardrail for non-Installment (user-
                             typed) principal payments. Prevents form
                             submission when the entered amount is more
                             than the outstanding Principal Amt. */
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const orig = Number(getFieldValue('_original_principal_amt') || 0);
                              const paid = Number(value || 0);
                              if (paid > orig) {
                                return Promise.reject(
                                  new Error(`Principal Pay Amt (Rs. ${paid}) cannot exceed Principal Amt (Rs. ${orig})`)
                                );
                              }
                              return Promise.resolve();
                            }
                          })
                        ]}
                      // max={princpleMax}
                      />
                    </Col>}
                </>
              )}

              {intChecked && (
                <>
                  <Col span={24} md={24}>
                    <CustomPageFormTitle Heading={intCategory === "Installment Interest" ? "Penalty Amount Details" : "Interest Amt Details"} />
                  </Col>
                  {intCategory !== "Installment Interest" &&
                    <Col span={24} md={6}>
                      <CustomInput
                        label={"Interest Amt"}
                        name={"interst_amt"}
                        disabled
                      />
                    </Col>}
                  {intCategory!== "Interest with capital" &&
                    <Col span={24} md={6}>
                      <CustomInput
                        label={"Penalty Amt"}
                        name={"penalty_amt"}
                        disabled
                      />
                    </Col>}
                  {intCategory !== "Installment Interest" &&
                    <Col span={24} md={6}>
                      <CustomInputNumber
                        label={"Interest Pay Amt"}
                        name={"interst_amount"}
                        suffix={"₹"}
                        onChange={handleInterestAmt}
                        max={interestMax}
                      />
                    </Col>}
                  {intCategory !== "Interest with capital" &&
                    <Col span={24} md={6}>
                      <CustomInputNumber
                        label={"Penalty Pay Amt"}
                        name={"penalty_amount"}
                        suffix={"₹"}
                        onChange={handlePenaltyAmt}
                        max={penaltyMax}
                      />
                    </Col>}
                </>
              )}
            </>
          ) : null}
          {collectionType !== "Balance" && collectionType !== "Management Interest" && collectionType !== "Chit Interest" &&
            <Col span={24} md={12}>
              <CustomInputNumber
                label={"Amount"}
                name={"amount"}
                precision={2}
                suffix={"₹"}
                max={maxLease}
                defaultValue={0}
                disabled
                onChange={calculateLeaseCreditAmount}
                rules={[
                  {
                    required: true,
                    message: "Please Enter a Amount !",
                  },
                ]}
              />
            </Col>}

          {personType && personType === "Native" ? (
            <>
              <Col span={24} md={12}>
                <CustomSelect
                  label={"Choose Member"}
                  name={"members"}
                  options={memberoptions}
                  onChange={handlePersonType}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Offering Type !",
                    },
                  ]}
                />
              </Col>
              <Col span={24} md={12}></Col>
            </>
          ) : null}
          {personType && personType === "Others" ? (
            <>
              <Col span={24} md={12}>
                <CustomInput
                  label={"Giver Name"}
                  name={"members"}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Offering Type !",
                    },
                  ]}
                />
              </Col>
              <Col span={24} md={12}>
                <CustomTextArea
                  label={"Address"}
                  name={"address"}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Address !",
                    },
                  ]}
                />
              </Col>
            </>
          ) : null}
          {tariffType && tariffType === "Absent" ? (
            <>
              <Col span={24} md={12}>
                <CustomInputNumber
                  label={"Absent Amount"}
                  name={"absent_amount"}
                  disabled={"true"}
                />
              </Col>
              <Col span={24} md={12}>
                <CustomInputNumber
                  label={"Exception Amount"}
                  name={"exception_amount"}
                />
              </Col>
            </>
          ) : null}

          {collectionType === "Moveable Rent" &&
            <Col span={24} md={12}>
              <CustomSelect
                label={"Moveable Rent Payment Type"}
                name={"moveable_asset_payment"}
                options={MoveablePayType}
                disabled
                rules={[
                  {
                    required: true,
                    message: "Please Select a Payment type!",
                  },
                ]}
              />
            </Col>}
          {/* Feb 2026 owner rule: Discount is now available for both
              Installment Interest (waives Principal Pay Amt) and any
              collection where a Penalty is being paid (waives Penalty
              Amt). Auto-cap prevents exceeding either bucket. */}
          {(intCategory === "Installment Interest" || (intChecked === true && Number(form.getFieldValue('_original_penalty_amt') || 0) > 0)) &&
            <Col span={24} md={12}>
              <CustomInputNumber label={"Discount Amount"} name={"discount_amount"}
                suffix={"₹"}
                onChange={handleDiscountInstallAmt}
                data-testid={"discount-amount-input"} />
              {/* Hidden mirrors used by handleDiscountInstallAmt for
                  live UI arithmetic; never persisted anywhere. */}
              <CustomInput name={"_original_amount"} display={"none"} />
              <CustomInput name={"_original_penalty_amt"} display={"none"} />
            </Col>
          }
          {(collectionType !== "Fund" && collectionType !== "Management Interest" && collectionType !== "Chit Interest" && balanceType !== "Interest Balance") && moveassetShow &&
            <Col span={24} md={12}>
              <CustomSelect
                label="Payment Mode"
                placeholder="Choose Payment Mode"
                name="payment_mode"
                options={RadioOptionsPaymentMode}
                onChange={handlePaymentMode}
                rules={[
                  {
                    required: true,
                    message: "Please Select a Payment Mode !",
                  },
                ]}
              />
            </Col>
          }
          {paymentValue &&
            (paymentMode &&
              <Col span={24} md={12}>
                {/* <br /> */}
                <CustomRadioButton
                  label={"Transaction Type"}
                  data={paymentMode}                         // // Transaction cash/cheque
                  name={"transaction_type"}
                  onChange={handleTransactionType}
                  rules={[
                    {
                      required: true,
                      message: "Please Choose Anyone !",
                    },
                  ]}
                />
              </Col>)}
          <Col span={24} md={12}></Col>
          <Col span={24} md={12}>
            {transactionType === "Cheque" ? (
              <Col span={24} md={24}><CustomInput label={"Cheque Number"} name={"trans_no"} rules={[
                {
                  required: true,
                  message: "Please Enter Cheque Number !",
                },
              ]} />
                <CustomDatePicker
                  label={"Transaction Date"}
                  name={"transaction_date"}
                  onChange={handleTransactionDate}
                />
              </Col>
            ) : null}
          </Col>
          <Col span={24} md={12}></Col>
          {transactionType === "Bank" ? (

            <Col span={24} md={10}>
              <CustomPageFormTitle Heading={"Bank Details"} />
              <CustomSelect
                label={"Select Bank"}
                name={"bank_link"}
                options={BankNameOptions}
                onChange={handleBankOptions}
              /> <br />
              <CustomInput name={'bank_name'} display={'none'} />
              <CustomRadioButton
                label={"Choose Online Transaction Type"}
                name={"bank_pay"}
                data={bankPayoptions}
                onChange={handleBankPayOptions}

              /><br />
              {/* {bankPay === "UPI" &&(

              <CustomInput label={"UPI ID"} name={"upi_no"} />
          ) } */}

              <CustomInput
                label={"Transaction Number"}
                name={"trans_no"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter Transaction Number!",
                  },
                ]}
              />

              <CustomDatePicker
                label={"Transaction Date"}
                name={"transaction_date"}
                onChange={handleTransactionDate}
              />
            </Col>
          ) : null}
          <Col span={24} md={24}>
            <CustomTextArea label={"Comments"} name={"comments"} />
          </Col>
        </CustomRow>
        <Flex center gap={"20px"} style={{ margin: "30px" }}>
          <Button.Danger
            text={"Submit"}
            htmlType={"submit"}
            disabled={leaseAmtDisabled}
            loading={loading}
          />
          <Button.Success text={"Reset"} onClick={onReset} />
        </Flex>
      </CustomCardView>
      <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={500} modalTitle={modalTitle} modalContent={modalContent} />
    </Form>
    </>
  );
};
