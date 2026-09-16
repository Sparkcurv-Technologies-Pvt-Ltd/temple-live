import {
  Button,
  CustomDatePicker,
  CustomInput,
  CustomInputNumber,
  CustomRadioButton,
  CustomSelect,
  CustomSwitch,
  CustomTextArea,
  CustomUpload,
} from "@components/form";
import { CustomCardView, CustomRow, Flex } from "@components/others";
import {
  CustomPageFormTitle,
  CustomPageFormTitle2,
  CustomPageTitle,
} from "@components/others/CustomPageTitle";
import { Col, Form, Spin } from "antd";
import React, { useState } from "react";
import { useEffect } from "react";
import {
  getAssetUnderCategory,
  getRentalLease,
  selectAssetUnderCategoryDetails,
} from "../RentalorLeaseSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  getAsset,
  selectAssetDetails,
} from "@modules/Asset Details/AssetSlice";
import {
  getMembersDetails,
  selectMemberDetails,
} from "@modules/FamilyDetails/FamilySlice";
import { APIURLS } from "@request/apiUrls/urls";
import request, { IMG_BASE_URL } from "@request/request";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import { toast } from "react-toastify";
import { FaPhone } from "react-icons/fa";
import { RiMailFill } from "react-icons/ri";
import dayjs from "dayjs";
import { getBankDetails, selectBankDetails } from "@modules/Management/ManagementSlice";

const RentalorLease = ({
  closee,
  updateRentalorLease,
  RentalorLeasetrigger,
}) => {

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [tenantType, setTenantType] = useState([]);
  const [rentalPay, setRentalPay] = useState([]); //  Use Time Period

  const [upcomingYears, setUpcomingYears] = useState(false);  // Initail Advance Amt
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState([]);
  const [selectdate, setSelectDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [enddate, setEndDate] = useState(dayjs().format("YYYY-MM"));
  const [endYearDate, setEndYearDate] = useState(dayjs().format("YYYY"))
  const [from, setfrom] = useState(dayjs().format("YYYY-MM-DD"));
  const [to, setto] = useState(dayjs().format("YYYY-MM-DD"));

  const [tenantDetails, setTenantDetails] = useState([]);

  const [leaseRendal, setLeaseRendal] = useState(false);  //use Switch rent/lease
  const [disableRent, setDisableRent] = useState(false);  //use Disabled rent/lease
  const [advance, setAdvance] = useState(false)  // Use Advacne Amt
  const [maxAmt, setMaxAmt] = useState()         //Use  Max value Advance amt

  const [imagesIntialValue, setImagesIntialValue] = useState([]);
  const [documentsIntialValue, setDocumentsIntialValue] = useState([]);
  const [tenantTrigger, setTenantTrigger] = useState(0);
  const [categoryTrigger, setCategoryTrigger] = useState(0);

  const [initialpayType, setInitialPayType] = useState(false);  // use Inital Amt onChange payemnt mode show
  const [paymentMode, setPaymentMode] = useState(null); // use online/offline payment mode show
  const [transactionDate, setTransactionDate] = useState(dayjs().format("YYYY-MM-DD"));  // use  Transaction date
  const [bankPay, setBankPay] = useState({});
  const [transactionType, setTransactionType] = useState({});
  const [selectedBankDetails, setSelectedBankDetails] = useState([]);
  const [disabledExtend, setDisabledExtend] = useState(false);

  const AllBankDetails = useSelector(selectBankDetails);

  useEffect(() => {
    form.resetFields();
  }, []);

  useEffect(() => {
    dispatch(getAssetUnderCategory());
    dispatch(getAsset());
    dispatch(getMembersDetails());
    dispatch(getBankDetails());
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      tenat_mobile: tenantDetails?.member_mobile_number,
      tenat_email: tenantDetails?.member_email,
      tenat_address: tenantDetails?.address,
      tenat_name: tenantDetails?.member_name,
    });
  }, [tenantDetails, tenantTrigger]);


  const AllRentalleaase = useSelector(selectAssetUnderCategoryDetails);
  const AllLease = useSelector(selectAssetDetails);
  const AllMemberDetails = useSelector(selectMemberDetails);

  // Categoryoptions
  const Categoryoptions = AllRentalleaase?.map((lease) => ({
    label: lease?.category?.categoryname,
    value: lease?.category?.id,
  }));
  // AssetOptions
  const AssetNameOptions = selectedCategory?.assets?.map((as) => ({
    label: as?.asset_name,
    value: as?.asset_name,
  }));

  const newSet = new Set();
  const tenantname = AllMemberDetails?.map((memberlist) => ({
    label: memberlist?.member_name,
    value: memberlist?.id,
  }));

  if (tenantname) {
    tenantname.forEach((item) => {
      newSet.add(item.label);
    });
  }

  useEffect(() => {
    form.setFieldsValue({
      asset_name: selectedAsset,
    });
  }, [selectedAsset]);

  //update
  //document

  useEffect(() => {
    form.setFieldsValue({ bank_name: selectedBankDetails });
  }, [selectedBankDetails]);

  useEffect(() => {
    if (updateRentalorLease?.images?.length > 0) {
      setImagesIntialValue([
        {
          uid: "1",
          name: "uploaded images",
          status: "done",
          url: `${updateRentalorLease?.images}`,
        },
      ]);
    } else {
      setImagesIntialValue([]);
    }
  }, [updateRentalorLease, RentalorLeasetrigger]);

  //images

  useEffect(() => {
    if (updateRentalorLease?.documents?.length > 0) {
      setDocumentsIntialValue([
        {
          uid: "1",
          name: "uploaded documents",
          status: "done",
          url: `${IMG_BASE_URL}${updateRentalorLease?.documents}`,
        },
      ]);
    } else {
      setDocumentsIntialValue([]);
    }
  }, [updateRentalorLease, RentalorLeasetrigger]);

  useEffect(() => {
    if (updateRentalorLease) {
      setupdateRentalorLease();

      const AssetDetails = AllRentalleaase?.find((val) => val.category?.id === updateRentalorLease?.category);
      setSelectedCategory(AssetDetails);
    }
  }, [updateRentalorLease, AllRentalleaase, RentalorLeasetrigger]);

  const setupdateRentalorLease = () => {
    const dateFormat = "YYYY-MM-DD";
    const monthFormat = "YYYY-MM";
    const yearFormat = "YYYY";

    const todaydate = new Date(updateRentalorLease?.date);
    const currentDate = dayjs(todaydate).format(dateFormat);
    setSelectDate(currentDate);

    const fromdate = new Date(updateRentalorLease?.from_date);
    const fromDay = dayjs(fromdate).format(dateFormat);
    setfrom(fromDay);

    const todate = new Date(updateRentalorLease?.to_date);
    const toDay = dayjs(todate).format(dateFormat);
    setto(toDay);

    const startdate = new Date(updateRentalorLease?.start_date);
    const startDay = dayjs(startdate).format(dateFormat);
    setStartDate(startDay);


    const enddate = new Date(updateRentalorLease?.end_range);
    const endDay = dayjs(enddate).format(monthFormat);
    setEndDate(endDay);

    const yearDate = new Date(updateRentalorLease?.end_range);
    const yearDay = dayjs(yearDate).format(yearFormat);
    setEndYearDate(yearDay);

    const TransactionDate = new Date(updateRentalorLease?.transaction_date);
    const TransactionFormat = dayjs(TransactionDate).format(dateFormat)

    form.setFieldsValue(updateRentalorLease);
    form.setFieldsValue({
      date: dayjs(currentDate, dateFormat),
      from_date: dayjs(fromDay, dateFormat),
      to_date: dayjs(toDay, dateFormat),
      start_date: dayjs(startDay, dateFormat),
      transaction_date: dayjs(TransactionFormat, dateFormat)
    });
    updateRentalorLease?.rent_pay_type === "Year" && form.setFieldsValue({ end_range: dayjs(yearDay, yearFormat) })
    updateRentalorLease?.rent_pay_type === "Month" && form.setFieldsValue({ end_range: dayjs(endDay, monthFormat) })

    form.setFieldsValue({ images: imagesIntialValue });
    form.setFieldsValue({ documents: documentsIntialValue });
    setRentalPay(updateRentalorLease?.rent_pay_type);
    setUpcomingYears(updateRentalorLease?.increment_apply);
    setTenantType(updateRentalorLease?.tenat_type);
    setLeaseRendal(updateRentalorLease?.rent);
    setDisableRent(true)

    if (updateRentalorLease?.initial_advance_amt > 0) {
      setInitialPayType(true);  // set Inital amt value Use paymentmode fields show
    }
    else {
      setInitialPayType(false);
      setPaymentMode([]);
    }
    setPaymentMode(updateRentalorLease?.payment_mode);
    setTransactionType(updateRentalorLease?.transaction_type);
    setTransactionDate(TransactionFormat, dateFormat);

    //--------------- Rent Amt Extend (upcoming years)--------------
    
    if (updateRentalorLease?.increment_amt_prcnt > 100) {
      form.setFieldsValue({ increase_amt_choice: "Amount" })
      setDisabledExtend(true)
    }
    else {
      setDisabledExtend(false)
    }


  };

  //update use effect end
  const TenantTypeRadio = [
    {
      label: "Other",
      value: "Other",
    },
    {
      label: "Member",
      value: "Member",
    },
  ];

  const RentalPayOptions = [
    {
      label: "Month",
      value: "Month",
    },
    // {
    //     label: "Choose Date",
    //     value: "Choose Date"
    // },
    {
      label: "Year",
      value: "Year",
    },
    // {
    //     label: "Choose Date",
    //     value: "Choose Date"
    // }
  ];

  const Choice = [
    {
      label: "Month",
      value: "Month",
    },
    {
      label: "Year",
      value: "Year",
    },
  ];

  const TimePeriodOptions = [
    {
      label: "₹",
      value: "Amount",
    },
    {
      label: "%",
      value: "Percentage",
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

  const bankoptions = AllBankDetails?.map((bank) => ({
    label: bank?.bank_name,
    value: bank?.id,
  }));

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

  let RadioOptionsTransactionType = [];
  if (paymentMode === "Online") {
    RadioOptionsTransactionType = [
      {
        label: "Bank",
        value: "Bank",
      },
    ];
  } else if (paymentMode === "Offline") {
    RadioOptionsTransactionType = [
      {
        label: "Cash",
        value: "Cash",
      },
      // {
      //   label: "Cheque",
      //   value: "Cheque",
      // },
    ];
  }

  const label =
    paymentMode === "Online"
      ? "Online Transaction Type"
      : paymentMode === "Offline"
        ? "Offline Transaction Type"
        : null;

  const handlePaymentMode = (e) => {
    setPaymentMode(e);
    setTransactionType({});
    form.resetFields(["transaction_type"]);
  };

  const handleTransactiontMode = (e) => {
    setTransactionType(e.target.value);

    form.resetFields([
      "bank_name",
      "bank_link",
      "bank_pay",
      "upi_no",
      "cheque_no",
      "trans_no",
      "transaction_date",
    ]);
  };

  const handleBankPayOptions = (e) => {
    if (e.target.value === "UPI") {
      setBankPay(e.target.value);
    } else {
      setBankPay(e.target.value);
    }
  };
  const handleBankOptions = (bank) => {
    const SelectedBank = AllBankDetails?.find((val) => val.id === bank);
    setSelectedBankDetails(SelectedBank?.bank_name);
    form.resetFields(["bank_pay", "trans_no", "transaction_date"]);
  };
  const handleTransactionDate = (date) => {
    setTransactionDate(date);
  };

  //------------handlemAssetCategory-----------

  const handleAssetCatery = (fam) => {
    form.setFieldsValue({ asset_name: null });
    form.setFieldsValue({ asset: null });

    const AssetDetails = AllRentalleaase?.find((val) => val.category?.id === fam);
    form.setFieldsValue({ asset_category_name: AssetDetails?.category?.categoryname })
    setSelectedCategory(AssetDetails);
    setCategoryTrigger(categoryTrigger + 1);
  };
  const handleAssetName = (nam) => {
    const AssetDetailsName = selectedCategory?.assets?.find(
      (val) => val.asset_name === nam
    );

    setSelectedAsset(AssetDetailsName?.asset_name);
    form.setFieldsValue({ asset: AssetDetailsName?.id });

  };

  const handleTenant = (value) => {
    const AllTenantDetails = AllMemberDetails.find(
      (memberlist) => memberlist?.id === value
    );
    setTenantDetails(AllTenantDetails);
    setTenantTrigger(tenantTrigger + 1);
  };
  //------------ Handle Rent/Lease Switch OnChange Function---------

  const handlechange = (value) => {
    setLeaseRendal(value);
    form.resetFields()
    // setLeaseRendal(false);
    setUpcomingYears(false);
    setIsLoading(false);
    setRentalPay([]);
    setTenantType([]);
    setTransactionType([]);
    setPaymentMode([]);
    setInitialPayType(false);
  };
  //------------ Handle Tenat Type onChage Function --------

  const handleTenantType = (e) => {
    setTenantType(e.target.value);
    form.resetFields([
      "tenat_name",
      "tenat_member",
      "tenat_mobile",
      "tenat_email",
      "tenat_address",
    ]);
  };
  //------------ Handle Rental Type onChage Function --------

  const handleRentalPay = (e) => {
    setRentalPay(e);
    form.resetFields(['end_range'])

  };
  //------------ Handle Inital Advance Amt onChage Function --------

  const handleinitalAdvanceAmt = (e) => {
    let RentAmt = parseFloat(form.getFieldValue("rent_amt"));
    const InitalAdvanceAmt = e;

    if (InitalAdvanceAmt > 0) {
      setInitialPayType(true);  // Use paymentmode fields show
    }
    else {
      setInitialPayType(false);
      form.resetFields(["payment_mode", "transaction_type"]);
      setPaymentMode([]);
      setTransactionType([]);
    }

    // if (InitalAdvanceAmt > RentAmt) {
    //   toast.warn("Initial Advance amount must not be greater than the rent amount!");
    //   setAdvance(true);
    //   setMaxAmt(RentAmt)
    // } else {
    //   setAdvance(false);
    //   RentAmt = InitalAdvanceAmt;
    // }
  }
  //------------- Handle Upcoming OnChange Function----------------

  const handleUpcomingYears = (value) => {
    setUpcomingYears(value);
  };
  //-------------- 

  const handleRentAmtExtend = (value) => {
    if (value > 100) {
      form.setFieldsValue({ increase_amt_choice: "Amount" })
      setDisabledExtend(true)
    }
    else {
      setDisabledExtend(false)
    }
  }
  const onReset = () => {
    form.resetFields();
  };

  const choosedate = (tdate) => {
    setSelectDate(tdate);
  };

  const handleStartDate = (date) => {
    setStartDate(date);
  };

  const handleEndDate = (edate) => {
    setEndDate(edate);

  };
  const handleEndYearDate = (edate) => {
    setEndYearDate(edate);
  };

  // on finish start

  const onFinish = (value) => {
    const formData = new FormData();
    if (updateRentalorLease) {
      formData.append("date", selectdate);
      formData.append("rent", leaseRendal);
      formData.append("category", value?.category);
      formData.append("asset", value?.asset);
      formData.append("asset_category_name", value?.asset_category_name);
      formData.append("asset_name", value?.asset_name);
      formData.append("tenat_type", tenantType);
      if (tenantType !== "Other") {
        formData.append("tenat_member", value?.tenat_member);
      }
      formData.append("tenat_name", value?.tenat_name);
      formData.append("tenat_address", value?.tenat_address);
      if (value && value.tenat_email !== null && value.tenat_email !== undefined) {
        formData.append("tenat_email", value.tenat_email);
      } else {
        console.log("No email");
      }

      formData.append("tenat_mobile", value?.tenat_mobile);
      formData.append("penalty_amt", value?.penalty_amt);
      formData.append("start_date", startDate);
      // {leaseRendal && (
      //   formData.append("end_range", enddate)
      // )}
      if (value?.rent_pay_type === "Month") {
        formData.append("end_range", enddate);
      }
      else {
        formData.append("end_range", endYearDate);
      }

      formData.append("rent_pay_type", value?.rent_pay_type);
      if (value?.rent_pay_type === "Choose Date") {
        formData.append("from_date", from);
        // formData.append('to_date', to)
      }
      if (leaseRendal) {
        formData.append('initial_advance_amt', value?.initial_advance_amt || 0)
        formData.append('payment_mode', value?.payment_mode || "")
        formData.append('transaction_type', value?.transaction_type || "")
        formData.append('bank_name', value?.bank_name || "")
        formData.append('bank_pay', value?.bank_pay || "")
        formData.append('bank_link', value?.bank_link || "") 
         if( value?.payment_mode === "Online"){
           formData.append('transaction_date', transactionDate || null)
         }
        
        formData.append('trans_no', value?.trans_no || "")
      }
      
      formData.append("rent_amt", value?.rent_amt);
      formData.append("increment_apply", upcomingYears);
      if (upcomingYears === true) {
        formData.append("increase_time_period", value?.increase_time_period);
        formData.append(
          "increase_time_period_choice",
          value?.increase_time_period_choice
        );
        formData.append("increment_amt_prcnt", value?.increment_amt_prcnt);
        formData.append("increase_amt_choice", value?.increase_amt_choice);
      }

      if (upcomingYears === false) {
        formData.append("increase_time_period", "");
        formData.append("increase_time_period_choice", "");
        formData.append("increment_amt_prcnt", "");
        formData.append("increase_amt_choice", "");
      }

      //document
      if (value?.documents?.length === 0) {
        formData.append("documents_status", "false");
      } else if (value?.documents && !value.documents[0]?.url) {
        formData.append("documents", value.documents[0].originFileObj);
      }

      if (value?.images?.length === 0) {
        formData.append("photo_status", "false");
      } else if (value?.images && !value.images[0]?.url) {
        formData.append("images", value.images[0].originFileObj);
      }

      updateRentalLease(formData);
      // console.log([...formData.entries()], "Editttttttttttttttt");
    } else {
      formData.append("date", selectdate);
      formData.append("rent", leaseRendal);
      formData.append("category", value?.category);
      formData.append("asset", value?.asset);
      formData.append("asset_category_name", value?.asset_category_name);
      formData.append("asset_name", value?.asset_name);
      formData.append("tenat_type", tenantType);
      if (tenantType !== "Other") {
        formData.append("tenat_member", value?.tenat_member);
      }
      formData.append("tenat_name", value?.tenat_name);
      formData.append("tenat_address", value?.tenat_address);

      if (value && value.tenat_email !== null && value.tenat_email !== undefined) {
        formData.append("tenat_email", value.tenat_email);
      } else {
        console.log("No email");
      }

      formData.append("tenat_mobile", value?.tenat_mobile);
      formData.append("penalty_amt", value?.penalty_amt);
      formData.append("start_date", startDate);
      if (value?.rent_pay_type === "Month") {
        formData.append("end_range", enddate);
      }
      else {
        formData.append("end_range", endYearDate);
      }
      formData.append("rent_pay_type", rentalPay);
      if (rentalPay === "Choose Date") {
        formData.append("from_date", from);
        // formData.append('to_date', to)
      }
      if (leaseRendal) {
        formData.append('initial_advance_amt', value?.initial_advance_amt || 0)
        formData.append('payment_mode', value?.payment_mode || "")
        formData.append('transaction_type', value?.transaction_type || "")
        formData.append('bank_name', value?.bank_name || "")
        formData.append('bank_pay', value?.bank_pay || "")
        {
          paymentMode === "Online" &&
          formData.append('transaction_date', transactionDate || null)
          formData.append('bank_link', value?.bank_link || "")
        }
        formData.append('trans_no', value?.trans_no || "")
      }

      formData.append("rent_amt", value?.rent_amt);
      formData.append("increment_apply", upcomingYears);

      if (upcomingYears === true) {
        formData.append("increase_time_period", value?.increase_time_period);
        formData.append(
          "increase_time_period_choice",
          value?.increase_time_period_choice
        );
        formData.append("increment_amt_prcnt", value?.increment_amt_prcnt);
        formData.append("increase_amt_choice", value?.increase_amt_choice);
      }

      //document
      if (value?.documents && value?.documents.length > 0) {
        value.documents.forEach((file) => {
          formData.append(`documents`, file.originFileObj);
        });
      } else {
        console.error("No images selected");
      }
      // images
      if (value?.images && value.images.length > 0) {
        value.images.forEach((file) => {
          formData.append(`images`, file.originFileObj);
        });
      } else {
        console.error("No images selected");
      }
      // console.log([...formData.entries()], "ADddposttttttttttttttt");
      RentalorLeaseFormDetail(formData);
    }
  };

  // on finish end

  const onFinishFailed = () => {
    toast.warn("Please fill in all the required details !");
  };

  const RentalorLeaseFormDetail = async (data) => {
    setIsLoading(true);
    await request
      .post(`${APIURLS.POST_RENTAL_LEASE}`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Rental or Lease Details Added Successfully",
          type: "success",
        });
        form.resetFields();
        dispatch(getRentalLease());
        setLeaseRendal(false);
        setUpcomingYears(false);
        setIsLoading(false);
        setRentalPay([]);
        setTenantType([]);
        setTransactionType([]);
        setPaymentMode([]);
        setInitialPayType(false);
        // dispatch(getDeath())AllRentalLeasedetails
        return response.data;
      })
      .catch(function (error) {
        setIsLoading(false)
        if (error.response.status === 400) {
          toast.warn(error.response?.data?.start_date?.[0]);
          toast.warn(error.response?.data?.end_range?.[0]);
          toast.warn(error.response?.data?.tenat_mobile?.[0]);
          toast.warn(error.response?.data?.non_field_errors?.[0]);
        } else if (error.response.status === 302) {
          toast.warn(error.response?.data?.message);
        } else {
          return errorHandler(error);
        }
      });

  };

  const updateRentalLease = async (data) => {
    await request
      .put(`${APIURLS.PUT_RENTAL_LEASE}${updateRentalorLease?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "RentalorLease Details Updated Successfully",
          type: "info",
        });
        closee();
        dispatch(getRentalLease());
        dispatch(getAssetUnderCategory());
        return response.data;
      })
      .catch(function (error) {
        setIsLoading(false)
        if (error.response.status === 400) {
          toast.warn(error.response?.data?.start_date?.[0]);
          toast.warn(error.response?.data?.end_range?.[0]);
          toast.warn(error.response?.data?.tenat_mobile?.[0]);
          toast.warn(error.response?.data?.non_field_errors?.[0]);
        } else if (error.response.status === 302) {
          toast.warn(error.response?.data?.message);
        } else {
          return errorHandler(error);
        }
      });

  };

  return (
    <Form
      name="AddRentalorLease"
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      initialValues={{ date: dayjs() }}
      autoComplete="off"
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
    >
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={12}>
            <CustomPageTitle Heading={"Rental / Lease"} />
          </Col>
          <Col span={24} md={12}>
            <Flex flexend={"right"} gap={"20px"}>
              <p style={{ marginTop: "10px" }}>Choose Date</p>
              <CustomDatePicker
                name={"date"}
                onChange={choosedate} disabled={true}
                rules={[
                  {
                    required: true,
                    message: "Please Choose a Date !",
                  },
                ]}
              />
            </Flex>
          </Col>

          <Col span={24} md={24} style={{ marginTop: "20px" }}>
            <CustomSwitch
              checked={leaseRendal}
              name={"rent"}
              onChange={handlechange}
              leftLabel={"Lease"}
              rightLabel={"Rental"}
              disabled={disableRent}
            />
          </Col>

          {/*  */}

          <Col span={24} md={12}>
            <CustomSelect
              label={"Asset Category"}
              name={"category"}
              options={Categoryoptions || []}
              onChange={handleAssetCatery}
              rules={[
                {
                  required: true,
                  message: "Please Select a Asset Category !",
                },
              ]}
            />
            <CustomInput label={"Asset Category Name"} name={"asset_category_name"} display={'none'} />
          </Col>

          <Col span={24} md={12}>
            <CustomSelect
              label={"Asset Name"}
              name={"asset_name"}
              options={AssetNameOptions || []}
              onChange={handleAssetName}
              rules={[
                {
                  required: true,
                  message: "Please Select a Asset !",
                },
              ]}
            />

            <CustomInput label={"Asset Name"} name={"asset"} display={"none"} />
          </Col>
          {/*  */}

          <Col span={24} md={24}>
            <CustomRadioButton
              name={"tenat_type"}
              label={"Tenant Type.."}
              data={TenantTypeRadio}
              onChange={handleTenantType}
              rules={[
                {
                  required: true,
                  message: "Please Choose a Tenant Type !",
                },
              ]}
            />
          </Col>
          {tenantType === "Other" ? (
            <>
              <Col span={24} md={12}>
                <CustomInput
                  label={"Tenant Name"}
                  name={"tenat_name"}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter a Tenant Name !",
                    },
                  ]}
                />
                <CustomInput name={"tenat_member"} display={"none"} />
              </Col>
              <Col span={24} md={12}>
                <CustomInputNumber
                  label={"Mobile Number"}
                  name={"tenat_mobile"}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter a Mobile Number !",
                    },
                  ]}
                  suffix={<FaPhone />}
                  maxLength={10}
                  minLength={10}
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </Col>
              <Col span={24} md={12}>
                <CustomInput
                  label={"Email"}
                  name={"tenat_email"}
                  type={"email"}
                  suffix={<RiMailFill />}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter a Email !",
                    },
                  ]}
                />
              </Col>
              <Col span={24} md={12}>
                <CustomTextArea
                  label={"Address"}
                  name={"tenat_address"}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter a Address !",
                    },
                  ]}
                />
              </Col>
            </>
          ) : null}
          {tenantType === "Member" ? (
            <>
              <Col span={24} md={12}>
                <CustomSelect
                  label={"Tenant Name"}
                  name={"tenat_member"}
                  options={tenantname}
                  onChange={handleTenant}
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Tenant Name !",
                    },
                  ]}
                />
                <CustomInput name={"tenat_name"} display={"none"} />
              </Col>
              <Col span={24} md={12}>
                <CustomInputNumber
                  label={"Mobile Number"}
                  name={"tenat_mobile"}
                  maxLength={10}
                  minLength={10}
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </Col>
              <Col span={24} md={12}>
                <CustomInput
                  label={"Email"}
                  name={"tenat_email"}
                  type={"email"}
                />
              </Col>
              <Col span={24} md={12}>
                <CustomTextArea label={"Address"} name={"tenat_address"} />
              </Col>
            </>
          ) : null}
          <Col span={24} md={24}>
            <CustomPageFormTitle2 Heading={"Time Period"} />
          </Col>
          <Col span={24} md={12}>
            <CustomSelect
              name={"rent_pay_type"}
              label={leaseRendal? "Rental Pay Type":"Lease Pay Type"}
              options={RentalPayOptions}
              onChange={handleRentalPay}
              rules={[
                {
                  required: true,
                  message: `Please Choose a ${leaseRendal?"Rental Pay":"Lease Pay Type"}!`,
                },
              ]}
            />
          </Col>

          {rentalPay === "Year" ? (
            <>
              <Col span={24} md={12}>
                <CustomDatePicker
                  name={"start_date"}
                  label={"Start Date"}
                  onChange={handleStartDate}
                  //  initialValue={}
                  rules={[
                    {
                      required: true,
                      message: "Please Choose a Start Date !",
                    },
                  ]}
                />
              </Col>
              <Col span={24} md={12}>
                <CustomDatePicker
                  picker={"year"}
                  name={"end_range"}
                  label={"End Date"}
                  onChange={handleEndYearDate}
                  rules={[
                    {
                      required: true,
                      message: "Please Choose a End Date !",
                    },
                  ]}
                />
              </Col>
            </>
          ) : null}
          {rentalPay === "Month" ? (
            <>
              <Col span={24} md={12}>
                <CustomDatePicker
                  name={"start_date"}
                  label={"Start Date"}
                  onChange={handleStartDate}
                  rules={[
                    {
                      required: true,
                      message: "Please Choose a Start Date !",
                    },
                  ]}
                />
              </Col>
              <Col span={24} md={12}>
                <CustomDatePicker
                  picker={"month"}
                  name={"end_range"}
                  label={"End Date"}
                  onChange={handleEndDate}
                  // initialValue={}
                  rules={[
                    {
                      required: true,
                      message: "Please Choose a End Date !",
                    },
                  ]}
                />
              </Col>
            </>
          ) : null}

          {/*  */}
          <Col span={24} md={6}>
            <CustomInputNumber
              name={"rent_amt"}
              label={leaseRendal? "Rent Amount":"Lease Amount"}
              suffix={"₹"}
              rules={[
                {
                  required: true,
                  message: `Please Choose a ${leaseRendal?"Rent Amount":"Lease Amount"}!`,
                },
              ]}
            />
          </Col>
          <Col span={24} md={6}>
            <CustomInputNumber
              name={"penalty_amt"}
              label={"Penalty Amount"}
              suffix={"₹"}
              rules={[
                {
                  required: true,
                  message: "Please Enter a Penalty Amount !",
                },
              ]}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomUpload
              form={form}
              name={"documents"}
              label={"Document"}
              maxCount={1}
              accept=".pdf,.doc,.docx"
              initialValue={documentsIntialValue}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomUpload
              form={form}
              name={"images"}
              label={"Images"}
              listType="picture-card"
              maxCount={1}
              accept=".png,.jpeg,.jpg"
              initialValue={imagesIntialValue}
            />
          </Col>
          {leaseRendal && (
            <Col span={24} md={12}>
              <CustomInputNumber
                name={"initial_advance_amt"}
                label={"Initial Advanced Amount"}
                onChange={handleinitalAdvanceAmt}
                max={maxAmt}
                suffix={"₹"}
              />
            </Col>
          )}
          {leaseRendal && initialpayType &&
            <Col span={24} md={12}>
              <CustomSelect
                label={"Payment Mode"}
                placeholder={"Select payment Mode"}
                name={"payment_mode"}
                options={RadioOptionsPaymentMode}
                onChange={handlePaymentMode}
                rules={[
                  {
                    required: true,
                    message: "Please Select a Payment Mode !",
                  },
                ]}
              />
            </Col>}
          <Col span={24} md={24}></Col>
          {paymentMode && paymentMode?.length &&
            <Col span={24} md={12}>
              <CustomRadioButton
                label={label}
                data={RadioOptionsTransactionType}
                onChange={handleTransactiontMode}
                name={"transaction_type"}
                rules={[
                  {
                    required: true,
                    message: "Please Choose Anyone !",
                  },
                ]}
              />
            </Col>}
          {paymentMode === "Offline" ? null : (
            <Col span={24} md={12}>
              {transactionType === "Bank" ? (
                <>
                  <CustomPageFormTitle Heading={"Bank Details"} />

                  <CustomSelect
                    label={"Select Bank"}
                    name={"bank_link"}
                    options={bankoptions}
                    onChange={handleBankOptions}
                    rules={[
                      {
                        required: true,
                        message: "Required !",
                      },
                    ]}
                  />
                  <CustomInput label={'bank'} name={'bank_name'} display={'none'} />
                  <CustomRadioButton
                    label={"Choose Online Transaction Type"}
                    name={"bank_pay"}
                    data={bankPayoptions}
                    onChange={handleBankPayOptions}
                    rules={[
                      {
                        required: true,
                        message: "Required !",
                      },
                    ]}
                  />
                  <CustomInput
                    label={"Transaction Number"}
                    name={"trans_no"}
                    rules={[
                      {
                        required: true,
                        message: "Required !",
                      },
                    ]}
                  />
                  <CustomDatePicker
                    label={"Transaction Date"}
                    name={"transaction_date"}
                    rules={[
                      {
                        required: true,
                        message: "Required !",
                      },
                    ]}
                    onChange={handleTransactionDate}
                  />
                </>
              ) : null}
            </Col>
          )}
          <Col span={24} md={12}>
            {transactionType === "Cheque" ? (
              <>
                <CustomPageFormTitle Heading={"Cheque Details"} />

                <CustomInput
                  label={"Cheque Number"}
                  name={"trans_no"}
                  rules={[
                    {
                      required: true,
                      message: "Required !",
                    },
                  ]}
                />
                <CustomDatePicker
                  label={"Transaction Date"}
                  name={"transaction_date"}
                  rules={[
                    {
                      required: true,
                      message: "Required !",
                    },
                  ]}
                  onChange={handleTransactionDate}
                />
              </>
            ) : null}
          </Col>
          <Col span={24} md={12}></Col>
          {leaseRendal && (
            <Col span={24} md={24}>
              <CustomSwitch
                checked={upcomingYears}
                name={"increment_apply"}
                label={"Extend in Upcoming Years ?"}
                onChange={handleUpcomingYears}
                leftLabel={"No"}
                rightLabel={"Yes"}
              />
            </Col>
          )}
          {upcomingYears === true ? (
            <>
              <Col span={24} md={12}>
                <CustomInputNumber
                  name={"increase_time_period"}
                  label={"Increase Time Period"}
                  rules={[
                    {
                      type: "number",
                      required: true,
                      message: "Please Increase Time Period !",
                    },
                  ]}
                />
              </Col>

              <Col span={24} md={6}>
                <CustomSelect
                  label={"Choose Month or Year"}
                  name={"increase_time_period_choice"}
                  options={Choice}
                  rules={[
                    {
                      required: true,
                      message: "Please Choose Time Period !",
                    },
                  ]}
                />
              </Col>

              <Col span={24} md={12}>
                <CustomInputNumber
                  label={"Rent Amount Percent (or) Amount"}
                  name={"increment_amt_prcnt"}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Rent Amount Percent !",
                    },
                  ]}
                  onChange={handleRentAmtExtend}
                />
              </Col>
              <Col span={24} md={6}>
                <CustomSelect
                  label={"% or Amt"}
                  name={"increase_amt_choice"}
                  options={TimePeriodOptions}
                  disabled={disabledExtend}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Percent or Amount !",
                    },
                  ]}
                />
              </Col>
            </>
          ) : null}
        </CustomRow>
        <Flex center={"true"} gap={"20px"} margin={"30px"}>
          {isLoading ? (
            <Spin />
          ) : (
            <>
              {updateRentalorLease ? (
                <>
                  <Button.Success text={"Update"} htmlType={"submit"} disabled={advance} />
                  <Button.Danger text={"Cancel"} onClick={() => closee()} />
                </>
              ) : (
                <>
                  <Button.Danger text={"Submit"} htmlType={"submit"} disabled={advance} />
                  <Button.Success text={"Reset"} onClick={() => onReset()} />
                </>
              )}
            </>
          )}
        </Flex>
      </CustomCardView>
    </Form>
  );
};

export default RentalorLease;
