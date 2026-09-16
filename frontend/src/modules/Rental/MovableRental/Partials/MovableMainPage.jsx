import { SvgIcons } from "@assets/Svg";
import {
  Button,
  CustomDatePicker,
  CustomInput,
  CustomInputNumber,
  CustomRadioButton,
  CustomSelect,
  CustomTextArea,
} from "@components/form";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import {
  CustomCardView,
  CustomModal,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageFormSubTitle, CustomPageFormTitle, CustomPageTitle } from "@components/others/CustomPageTitle";
import CustomPopconfirm from "@components/others/CustomPopConfirm";
import {
  getAsset,
} from "@modules/Asset Details/AssetSlice";
import {
  getMembersDetails,
  selectMemberDetails,
} from "@modules/FamilyDetails/FamilySlice";
import { StyledRemoveBtn } from "@modules/FamilyDetails/style";
import {
  getAssetUnderCategory,
  getRentalAssetCategory,
} from "@modules/Rental/RentalorLease/RentalorLeaseSlice";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";
import successHandler from "@request/successHandler";

import { Col, Form } from "antd";
import React, { useEffect, useState } from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import { FaPhone } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import MovableRentalAdd from "./MovableRentalAdd";
import dayjs from "dayjs";
import { getBankDetails, selectBankDetails } from "@modules/Management/ManagementSlice";

const MovableMainPage = ({
  MainMovableReocrd,
  closee,
  MoveRentalorLeasetrigger,
}) => {
  const [form] = Form.useForm();

  const dispatch = useDispatch();

  const [coderDate, setCornerDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [memberType, setMembertype] = useState([]);
  const [dummyData, setDummyData] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [advance, setAdvance] = useState(false)  // Use Advacne Amt
  const [maxAmt, setMaxAmt] = useState()         //Use  Max value Advance amt

  const [initialpayType,setInitialPayType] = useState(false);  // use Inital Amt onChange payemnt mode show
  const [paymentMode, setPaymentMode] = useState(null); // use online/offline payment mode show
  const [transactionDate, setTransactionDate] = useState( dayjs().format("YYYY-MM-DD"));  // use  Transaction date
  const [bankPay, setBankPay] = useState({});
  const [transactionType, setTransactionType] = useState({});
  const [selectedBankDetails, setSelectedBankDetails] = useState([]);

  // ======  Modal Open ========
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ======  Modal Title and Content ========
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState(null);

  // ----------  Form Reset UseState ---------
  const [modelwith, setModelwith] = useState(0);

  // ===== Modal Functions Start =====
  const showModal = () => {
    setIsModalOpen(true);
  };

  const CloseForm = () => {
    handleOk();
  };

  const handleOk = () => {
    setIsModalOpen(false);
    // ResetTrigger()
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  useEffect(() => {
    dispatch(getRentalAssetCategory());
    dispatch(getMembersDetails());
    dispatch(getAsset());
    dispatch(getAssetUnderCategory());
    dispatch(getBankDetails());
  }, []);

  const AllMemberDetails = useSelector(selectMemberDetails);
  const AllBankDetails = useSelector(selectBankDetails);

  //============== Add Total sale amount (Table values)  Set in Total Amt field================
  useEffect(() => {

    let totalAmount = dummyData?.reduce((acc, item) => {
      return acc + parseFloat(item.total_amt);
    }, 0);

    form.setFieldsValue({
      total_rent_amt: MainMovableReocrd?.total_rent_amt && totalAmount || totalAmount,
    });

  }, [dummyData, form, MainMovableReocrd]);

  //================

  useEffect(() => {
    form.setFieldsValue({ bank_name: selectedBankDetails });
  }, [selectedBankDetails]);

  useEffect(() => {
    if (MainMovableReocrd) {
      form.setFieldsValue(MainMovableReocrd);
      const dateformat = "YYYY-MM-DD";
      const DefaultDate = new Date(MainMovableReocrd?.date);
      const date = dayjs(DefaultDate).format(dateformat);
      setCornerDate(date);

      const startDateSet = new Date(MainMovableReocrd?.start_date);
      const StartDate = dayjs(startDateSet).format(dateformat);
      setStartDate(StartDate);

      const TransactionDate = new Date(MainMovableReocrd?.transaction_date);
      const TransactionFormat = dayjs(TransactionDate).format(dateformat)

      form.setFieldsValue({
        date: dayjs(date, dateformat),
        start_date: dayjs(StartDate, dateformat),
        transaction_date:dayjs(TransactionFormat,dateformat)
      });
      setMembertype(MainMovableReocrd?.tenat_type); // Member_type radio button check

      if(MainMovableReocrd?.advance_amt  > 0){
        setInitialPayType(true);  // set Inital amt value Use paymentmode fields show
      }
     else{
      setInitialPayType(false);
      setPaymentMode([]);
     }
     setPaymentMode(MainMovableReocrd?.payment_mode);
     setTransactionType(MainMovableReocrd?.transaction_type);
     setTransactionDate(TransactionFormat,dateformat)

    }
  }, [MainMovableReocrd, MoveRentalorLeasetrigger]);

  useEffect(() => {
    // if (MainMovableReocrd?.movable_rent) {
    const tableData = MainMovableReocrd?.movable_rent.map((value, index) => ({
      ...value,
      key: index,
    }));

    setDummyData(tableData);
    // }
  }, [MainMovableReocrd, MoveRentalorLeasetrigger]);

  const handlemember = (value) => {
    const AllTenantDetails = AllMemberDetails.find(
      (memberlist) => memberlist?.id === value
    );
    form.setFieldsValue({ tenat_name: AllTenantDetails?.member_name });
    form.setFieldsValue({
      tenat_mobile: AllTenantDetails?.member_mobile_number,
    });
    form.setFieldsValue({ tenat_address: AllTenantDetails?.address });
    form.setFieldsValue({
      tenat_email: AllTenantDetails?.member_email,
    });
  };
  //------------ Handle Advance Amt onChage Function --------

  const handleAdvanceAmt = (e) => {
    let TotalAmt = parseFloat(form.getFieldValue("total_rent_amt"));
    const AdvanceAmt = e;

    setPaymentMode([])

    if(AdvanceAmt  > 0){
      setInitialPayType(true);  // Use paymentmode fields show
    }
   else{
    setInitialPayType(false);
    form.resetFields(["payment_mode","transaction_type"]);
    setPaymentMode([]);
    setTransactionType([]);
   }

    // if (AdvanceAmt > TotalAmt) {
    //   toast.warn("Advance amount must not be greater than the total amount!");
    //   setAdvance(true);
    //   setMaxAmt(TotalAmt)
    // } else {
    //   setAdvance(false);
    //   TotalAmt = AdvanceAmt;
    // }
  }
  //-----------

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
  // ---------------------MemberOptions--------------------------
  const newSet = new Set();
  const memberoptions = AllMemberDetails?.map((memberlist) => ({
    label: memberlist?.member_name,
    value: memberlist?.id,
  }));

  if (memberoptions) {
    memberoptions.forEach((item) => {
      newSet.add(item.label);
    });
  }

  const handleStarttDate = (date) => {
    setStartDate(date);
  };
  // ---------- SET VALUE TO DYNAMIC DATA ------
  const SetDynamicTable = (value) => {
    setDummyData((prev) => {
      if (!Array.isArray(prev)) {
        // If prev is not an array, create a new array with the current and new value
        return [{ ...value, key: 0 }];
      }

      const isAssetNameExists = prev.some((item) => item.asset === value.asset);

      if (!isAssetNameExists) {
        const maxKey = Math.max(...prev.map((item) => item.key), 0);
        return [...prev, { ...value, key: maxKey + 1 }];
      } else {
        toast.warn("Asset name already exists in the table.");
        return prev;
      }
    });
  };

  const SetDynamicEditTable = (value) => {
    setDummyData((prev) => {
      if (!Array.isArray(prev)) {
        // If prev is not an array, create a new array with the current and new value
        return [{ ...value, key: 0 }];
      }

      const rowIndexToUpdate = prev.findIndex((item) => item.key === value.key);

      if (rowIndexToUpdate !== -1) {
        // If the row exists, update its values
        const updatedDynamicTable = [...prev];
        updatedDynamicTable[rowIndexToUpdate] = { ...value };
        return updatedDynamicTable;
      }
      // If the row doesn't exist, check if the asset_name already exists in any of the existing rows
      const isAssetNameExists = prev.some((item) => item.asset_name === value.asset_name);

      if (!isAssetNameExists) {
        const maxKey = Math.max(...prev.map((item) => item.key), 0);
        return [...prev, { ...value, key: maxKey + 1 }];
      } else {
        toast.warning("Asset name already exists in the table!");
        return prev;
      }

    });
  };

  const RowRemove = (rowKey) => {
    const newArr = dummyData?.filter((item) => item.key !== rowKey);
    setDummyData(newArr);

    // Recalculate total amount after removing the row
    const totalAmount = newArr.reduce((acc, item) => {
      return acc + item.total_amt;
    }, 0);

    // Set total amount to the form field
    form.setFieldsValue({ total_rent_amt: totalAmount });
  };

  const handleMemberType = (e) => {
    setMembertype(e.target.value);
    form.resetFields([
      "tenat_name",
      "tenat_member",
      "tenat_mobile",
      "tenat_email",
      "tenat_address",
    ]);

  };

  const MemberTypeRadio = [
    {
      label: "Member",
      value: "Member",
    },
    {
      label: "Other",
      value: "Other",
    },
  ];

  const updateAssetCategoryDeatails = (record, rowKey) => {
    setUpdateTrigger(updateTrigger + 1);
    setModelwith(700);
    setModalContent(
      <MovableRentalAdd
        rentalRecord={record}
        MainMovableReocrd={MainMovableReocrd}
        SetDynamicEditTable={SetDynamicEditTable}
        SetDynamicTable={SetDynamicTable}
        handleOk={handleOk}
        index={rowKey}
        updateTrigger={updateTrigger}
      />
    );
    showModal();
  };
  const TableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Asset Category",
      dataIndex: "asset_category_name",
    },
    {
      title: "Product Name",
      dataIndex: "asset_name",
    },
    {
      title: "Sale Quantity",
      dataIndex: "qnty",
    },
    {
      title: "Sale Amount",
      dataIndex: "sale_amt",
    },
    {
      title: "Total Amount",
      dataIndex: "total_amt",
    },
    {
      title: "Action",
      render: (text, record, index) => {
        const rowKey = record.key;
        return (
          <Flex gap={"true"} center={"true"}>
            <StyledRemoveBtn>
              <AiFillPlusCircle
                style={{ fontSize: "23px", marginRight: "10px", color: "blue" }}
                onClick={() => updateAssetCategoryDeatails(record, rowKey)}
              />
            </StyledRemoveBtn>

            <CustomPopconfirm
              title="Confirmation"
              description="Are you absolutely certain about removing this added detail?"
              okText="Yes"
              cancelText="No"
              confirm={() => RowRemove(rowKey)}
            >
              <img src={SvgIcons.Remove} style={{ cursor: "pointer" }} />
            </CustomPopconfirm>
          </Flex>
        );
      },
    },
  ];

  const PostMoveableRental = async (data) => {
    await request
      .post(`${APIURLS.POST_MOVEABLE_RENTAL}`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Moveable Rental or Lease Details Added Successfully",
          type: "success",
        });
        form.resetFields();
        setDummyData([]);
        setMembertype([]);
        setTransactionType([]);
        setPaymentMode([]);
        setInitialPayType(false);  
        dispatch(getRentalAssetCategory());
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 400) {
          toast.warn(error.response.data?.start_date?.[0]);
          toast.warn(error.response.data?.end_range?.[0]);
          toast.warn(error.response.data?.tenat_mobile?.[0]);
          toast.warn(error.response.data?.non_field_errors?.[0]);
        } else if (error.response.status === 302) {
          toast.warn(error.response?.data?.message);
        } else {
          return errorHandler(error);
        }
      });
  };

  const UpdateMoveableRental = async (data) => {
    await request
      .put(`${APIURLS.PUT_MOVEABLE_RENTAL}/${MainMovableReocrd?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Moveable Rental or Lease Details Updated Successfully",
          type: "info",
        });
        dispatch(getRentalAssetCategory());
        closee();
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 400) {
          toast.warn(error.response.data?.start_date?.[0]);
          toast.warn(error.response.data?.end_range?.[0]);
          toast.warn(error.response.data?.tenat_mobile?.[0]);
          toast.warn(error.response.data?.non_field_errors[0]);
        } else if (error.response.status === 302) {
          toast.warn(error.response?.data?.message);
        } else {
          return errorHandler(error);
        }
      });
  };

  const onFinish = (values) => {
    const Nevalues = {
      ...values,
      date: coderDate,
      start_date: startDate,
      transaction_date:transactionDate,
      movable_rent: dummyData,
    };
    if (MainMovableReocrd) {
      UpdateMoveableRental(Nevalues);
    } else {
      PostMoveableRental(Nevalues);
    }
  };

  const onFinishFailed = () => {
    toast.warn("Please fill in all the required details !");
  };
  const onReset = () => {
    if (MainMovableReocrd) {
      closee();
    } else {
      form.resetFields();
    }
  };
  const onSubmit = () => {
    form.submit();
  };

  return (
    <CustomCardView>
      <Form
        name="AddMovableRentalorLease"
        form={form}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={{ date: dayjs(), start_date: dayjs() }}
        autoComplete="off"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
      >
         <Col span={24} md={12}>
            <CustomPageTitle Heading={"Movable Rental"} />
          </Col>
        <CustomRow space={[24, 24]}>
          <Col span={24} md={12}>
            <CustomPageFormTitle Heading={"Member Details :"} />
          </Col>
          <Col span={24} md={12}>
            <Flex flexend={"right"} gap={"20px"}>
              <p style={{ marginTop: "10px" }}>Choose Date</p>
              <CustomDatePicker
                name={"date"}
                disabled
                rules={[
                  {
                    required: true,
                    message: "Please Select Date !",
                  },
                ]}
              />
            </Flex>
          </Col>
          <Col span={24} md={24}>
            <CustomRadioButton
              name={"tenat_type"}
              label={"Member Type.."}
              data={MemberTypeRadio}
              onChange={handleMemberType}
              rules={[
                {
                  required: true,
                  message: "Please Choose a Member Type !",
                },
              ]}
            />
          </Col>

          {memberType === "Member" ? (
            <>
              <Col span={24} md={12}>
                <CustomSelect
                  label={"Member Name"}
                  name={"tenat_member"}
                  options={memberoptions}
                  onChange={handlemember}
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Member Name !",
                    },
                  ]}
                />
                <CustomInput name={"tenat_name"} display={"none"} />
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
              {/* <Col span={24} md={12}>
                <CustomInput
                  label={"Email"}
                  name={"tenat_email"}
                  type={"email"}
                  suffix={<RiMailFill />}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Email !",
                    },
                  ]}
                />
              </Col> */}
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
              <Col span={24} md={12}>
                <CustomDatePicker
                  label={"Start Date"}
                  name={"start_date"}
                  onChange={handleStarttDate}
                  rules={[
                    {
                      required: true,
                      message: "Please Choose a Start Date !",
                    },
                  ]}
                />
              </Col>
            </>
          ) : null}
          {memberType === "Other" ? (
            <>
              <Col span={24} md={12}>
                <CustomInput
                  label={"Member Name"}
                  name={"tenat_name"}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter a Member Name !",
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
              {/* <Col span={24} md={12}>
                <CustomInput
                  label={"Email"}
                  name={"tenat_email"}
                  type={"email"}
                  suffix={<RiMailFill />}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Email !",
                    },
                  ]}
                />
              </Col> */}
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
              <Col span={24} md={12}>
                <CustomDatePicker
                  label={"Start Date"}
                  name={"start_date"}
                  onChange={handleStarttDate}
                  rules={[
                    {
                      required: true,
                      message: "Please Choose  a Start Date !",
                    },
                  ]}
                />
              </Col>
            </>
          ) : null}
        </CustomRow>
      </Form>
      <MovableRentalAdd SetDynamicTable={SetDynamicTable} />
      <Form form={form} name="AddMovableRentalorLease" onFinish={onFinish} onFinishFailed={onFinishFailed}
       labelCol={{ span: 24 }}
       wrapperCol={{ span: 24 }}
      >
        <CustomRow space={[24, 24]}>
          <Col span={24} md={24}>
            <CustomStandardTable columns={TableColumn} data={dummyData} />
            <Flex flexend={"right"} gap={"20px"} style={{ margin: '15px 0px' }}>
              <p style={{ marginTop: "10px" }}>Total Amount</p>
              <CustomInputNumber disabled name={"total_rent_amt"} />
            </Flex>
            <br />
            <Flex flexend={"right"} gap={"20px"}>
              <p style={{ marginTop: "10px" }}>Advance Amount</p>
              <CustomInputNumber type={"number"} name={"advance_amt"} max={maxAmt} onChange={handleAdvanceAmt} />
            </Flex>
          </Col>
          {initialpayType &&
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
                  <CustomInput label={'bank'} name={'bank_name'} display={'none'}/>
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
          <Col span={24} md={12}>
            <CustomTextArea
              label={"Comments"}
              name={"comments"}
            //   rules={[
            //     {
            //       required: true,
            //       message: "Please Enter Comments !",
            //     },
            //   ]}
            />
          </Col>
        </CustomRow>
      </Form>
      <Flex center={"true"} gap={"20px"} margin={"30px"}>
        {MainMovableReocrd ? (
          <>
            <Button.Danger text={"Update"} onClick={onSubmit}  disabled={advance} />
            <Button.Success text={"Cancel"} onClick={() => onReset()} />
          </>
        ) : (
          <>
            <Button.Danger text={"Submit"} onClick={onSubmit}  disabled={advance} />
            <Button.Success text={"Reset"} onClick={() => onReset()} />
          </>
        )}
      </Flex>
      <CustomModal
        isVisible={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        width={modelwith}
        modalTitle={modalTitle}
        modalContent={modalContent}
      />
    </CustomCardView>
  );
};

export default MovableMainPage;
