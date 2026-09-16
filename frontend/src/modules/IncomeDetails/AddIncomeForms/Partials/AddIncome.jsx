import {
  Button,
  CustomAddSelect,
  CustomDatePicker,
  CustomInput,
  CustomInputNumber,
  CustomRadioButton,
  CustomSelect,
  CustomTextArea,
} from "@components/form";
import { CustomCardView, CustomModal, CustomRow, Flex } from "@components/others";
import {
  CustomPageFormTitle,
  CustomPageTitle,
} from "@components/others/CustomPageTitle";
import {
  getMembersDetails,
  selectMemberDetails,
} from "@modules/FamilyDetails/FamilySlice";
import {
  getFestival,
  selectFestivalDetails,
} from "@modules/Festival/FestivalSlice";
import { APIURLS } from "@request/apiUrls/urls";
import errorHandler from "@request/errorHandler";
import request from "@request/request";
import successHandler from "@request/successHandler";
import { Col, Form } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getIncome, getIncomeCategory, getIncomeName, selectIncomeCategoryDetails, selectIncomeNameDetails } from "../../IncomeSlice";
import {
  getSangamDetails,
  selectSangamDetails,
} from "@modules/Sangam/SangamDetails/SangamSlice";
import { toast } from "react-toastify";
import {
  getBankDetails,
  selectBankDetails,
} from "@modules/Management/ManagementSlice";
import { AddIncomeCategoryModal, AddIncomeNameModal } from "./AllIncomeModals";


export const AddIncomeForm = ({
  FormExternalClose,
  updateIncome,
  incomeTrigger,
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [incomeType, setIncomeType] = useState([]);
  const [festival, setFestival] = useState();
  const [memberList, setMemberList] = useState({});
  const [sangamList, setSangamList] = useState();
  const [donationtype, setDonationType] = useState();
  const [transactionType, setTransactionType] = useState({});
  const [offeringType, setOfferingType] = useState();
  const [closeUnwanted, setCloseUnwanted] = useState(false);
  const [TransactionData, setTransactionData] = useState({});
  const [trigger, setTrigger] = useState(0);
  const [transactionDate, setTransactionDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [bankPay, setBankPay] = useState({});
  const [incomeDate, setIncomeDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedBankDetails, setSelectedBankDetails] = useState([]);

  const [paymentMode, setPaymentMode] = useState(null);
  // Watched Subcategory value – Income Category dropdown is shown ONLY when
  // Subcategory = "Temple Income". For "Chit Fund Income" the category
  // stays hidden per business rule.
  const [incomeSubcategory, setIncomeSubcategory] = useState(
    updateIncome?.income_subcategory || null
  );
  const showIncomeCategory = incomeSubcategory === "Temple Income";

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

  const ResetTrigger = () => {
    setTrigger(trigger + 1);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const CloseForm = () => {
    handleOk();
  };

  useEffect(() => {
    form.resetFields();
  }, [incomeTrigger]);

  useEffect(() => {
    dispatch(getFestival());
    dispatch(getMembersDetails());
    dispatch(getSangamDetails());
    dispatch(getBankDetails());
    dispatch(getIncomeCategory());
    dispatch(getIncomeName());
  }, []);

  const AllFestival = useSelector(selectFestivalDetails);
  const AllFamilyMember = useSelector(selectMemberDetails);
  const AllSangamList = useSelector(selectSangamDetails);

  const AllBankDetails = useSelector(selectBankDetails);

  const AllIncomeCategory = useSelector(selectIncomeCategoryDetails);
  const AllIncomeNames = useSelector(selectIncomeNameDetails);

  //--------------festival options----------------

  const festivaloptions = AllFestival.map((item) => ({
    label: item.festival_name,
    value: item.festival_name,
  }));

  const handleFestivalChange = (value) => {
    const AllFestivalDetails = AllFestival.find(
      (fes) => fes.festival_name === value
    );
    setFestival(AllFestivalDetails?.id);
  };
  //-----------------------

  useEffect(() => {
    form.setFieldsValue({ festival: festival });
  }, [festival]);

  //   family member list

  // const memberoptions = AllFamilyMember.map((item) => ({
  //   label: item.member.member_name,
  //   value: item.member.member_name,
  // }));

  const newSet = new Set();
  const memberoptions = AllFamilyMember?.map((item) => ({
    label: item?.member_name,
    value: item?.id,
  }));

  if (memberoptions) {
    memberoptions.forEach((item) => {
      newSet.add(item.label);
    });
  }

  const handleMemberChange = (value) => {
    const AllMemberDetails = AllFamilyMember.find(
      (fes) => fes?.id === value
    );
    form.setFieldsValue({ member_name: AllMemberDetails?.member_name })
    // setMemberList(AllMemberDetails.member.id);
  };

  //---------sangam list-------------

  const sangamoptions = AllSangamList.map((item) => ({
    label: item.name,
    value: item.name,
  }));
  //---------------

  const handleSangamChange = (value) => {
    const AllSangamoptions = AllSangamList.find((item) => item.name === value);
    setSangamList(AllSangamoptions.id);
  };

  const handleBankOptions = (bank) => {
    const SelectedBank = AllBankDetails?.find((val) => val.id === bank);
    setSelectedBankDetails(SelectedBank?.bank_name);
    form.resetFields(["bank_pay", "transaction_no", "transaction_date"]);
  };
  useEffect(() => {
    form.setFieldsValue({ bank_name: selectedBankDetails });
  }, [selectedBankDetails]);

  useEffect(() => {
    form.setFieldsValue({ sangam: sangamList });
  }, [sangamList]);

  const incometypeoptions = [
    {
      title: "Offering",
      value: "Offering",
    },
    {
      title: "Donation",
      value: "Donation",
    },
    {
      title: "Sangam",
      value: "Sangam",
    },
    {
      title: "Others",
      value: "Others",
    },
  ];

  const offeringtypeoptions = [
    {
      title: "Festival",
      value: "Festival",
    },
    {
      title: "Offering Box",
      value: "Offering Box",
    },
    {
      title: "Others",
      value: "Others",
    },
  ];

  const giveroptions = [
    {
      title: "Native",
      value: "Native",
    },
    {
      title: "Others",
      value: "Others",
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

  const bankoptions = AllBankDetails?.map((bank) => ({
    label: bank?.bank_name,
    value: bank?.id,
  }));

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

  const IncomeCategoryOptions = AllIncomeCategory?.map((incat) => ({
    label: incat?.category_name,
    value: incat?.id,
  }));
  const IncomeNameOptions = AllIncomeNames?.map((inn) => ({
    label: inn?.income_name,
    value: inn?.id,
  }));

  const incomeSubcategoryOptions = [
    { label: "Chit Fund Income", value: "Chit Fund Income" },
    { label: "Temple Income", value: "Temple Income" },
  ];

  const onReset = () => {
    form.resetFields();
  };

  const handleIncomeType = (e) => {
    setIncomeType(e);
    setOfferingType([]);
    setDonationType([]);
    form.resetFields(["offering_type", "giver_native", "sangam_name"])
  };

  const handleGiverNative = (e) => {
    setDonationType(e);
    form.resetFields(["member_name", "name", "address"])
  };

  const handleOfferingType = (e) => {
    setOfferingType(e);
    form.resetFields(["festival_name"])
  };

  const handlePaymentMode = (e) => {
    setPaymentMode(e);
    setTransactionType({});
    form.resetFields(["transaction_type"]);
  };

  const handleTransactiontMode = (e) => {
    setTransactionType(e.target.value);

    form.resetFields([
      "bank_name",
      "bank",
      "bank_pay",
      "upi_no",
      "cheque_no",
      "transaction_no",
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

  const handleTransactionDate = (date) => {
    setTransactionDate(date);
  };

  const handleIncomeDate = (date) => {
    setIncomeDate(date);
  };

  //----------- handle Income Category Functions------------

  const handleIncomeCategory = (value) => {
    const FindIncomeCategories = AllIncomeCategory?.find((inc) => inc.id === value);
    form.setFieldsValue({ category_name: FindIncomeCategories?.category_name });

  };
  const AddIncomeCategory = () => {
    setTrigger(trigger + 1);
    setModelwith(500);
    setModalContent(
      <AddIncomeCategoryModal
        formname={"AddIncomeCategory"}
        CloseForm={CloseForm}
        Expensetrigr={trigger}
      />
    );
    showModal();
  };
  //----------- handle Income Name Functions------------

  const handleIncomeName = (value) => {
    const FindIncomeNameDetails = AllIncomeNames?.find((incna) => incna.id === value);
    form.setFieldsValue({ income_name: FindIncomeNameDetails?.income_name });

  };
  const AddIncomeName = () => {
    setTrigger(trigger + 1);
    setModelwith(500);
    setModalContent(
      <AddIncomeNameModal
        formname={"AddIncomeName"}
        CloseFormm={CloseForm}
        Expensetrigr={trigger}
      />
    );
    showModal();
  };
  //-------------------------

  useEffect(() => {
    if (updateIncome) {
      setIncome();
    }
  }, [updateIncome, incomeTrigger]);

  const setIncome = () => {
    const datetoday = new Date(updateIncome?.date);
    const transactdatee = new Date(updateIncome?.transaction_date);

    const dateFormat = "YYYY/MM/DD";
    const Dated = dayjs(datetoday).format(dateFormat);
    const TransactionDate = dayjs(transactdatee).format(dateFormat);

    form.setFieldsValue(updateIncome);
    setIncomeType(updateIncome?.income_type);
    setTransactionData(updateIncome?.payment_mode);
    setPaymentMode(updateIncome?.payment_mode);
    setDonationType(updateIncome?.giver_native);
    setTransactionType(updateIncome?.transaction_type);
    setOfferingType(updateIncome?.offering_type);
    setSangamList(updateIncome?.sangam);
    setTransactionDate(updateIncome?.transaction_date);
    setIncomeDate(updateIncome?.date);
    setIncomeSubcategory(updateIncome?.income_subcategory || null);
    form.setFieldsValue({
      date: dayjs(Dated),
      transaction_date: dayjs(TransactionDate, dateFormat),
    });
  };

  const PostIncome = async (data) => {
    await request
      .post(APIURLS.POST_INCOME_DETAILS, data)
      .then(function (response) {
        if (response.status === 201) {
          successHandler(response, {
            notifyOnSuccess: true,
            notifyOnFailed: true,
            msg: "success",
            type: "success",
          });
          form.resetFields();
          dispatch(getIncome());
          setOfferingType([]);
          setDonationType([]);
          setTransactionData([]);
          setTransactionType([]);
          setIncomeType([]);
          setMemberList([]);
          setPaymentMode(null);
        } else {
          toast.warn("Added Failed");
        }
        return response.data;
      })
      .catch(function (error) {
        if (error.response?.status === 400) {
          if (error.response.data?.date) {
            toast.error(error.response.data?.date[0]);
          } else if (error.response.data && typeof error.response.data === "object") {
            const first = Object.entries(error.response.data)[0];
            if (first) {
              const [field, msgs] = first;
              const msg = Array.isArray(msgs) ? msgs[0] : String(msgs);
              toast.error(`${field}: ${msg}`);
            } else {
              toast.error("Please check the form and try again");
            }
          } else {
            toast.error("Please check the form and try again");
          }
        }
        else if (error.response?.status === 406) {
          toast.error(error.response.data.message);
        }
        else {
          return errorHandler(error);
        }

      });
  };

  const UpdateIncome = async (data) => {
    await request
      .put(`${APIURLS.PUT_INCOME_DETAILS}${updateIncome?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Income Updated Successfully",
          type: "success",
        });
        FormExternalClose();
        dispatch(getIncome());
        return response.data;
      })
      .catch(function (error) {
        if (error.response?.status === 400) {
          if (error.response.data?.date) {
            toast.error(error.response.data?.date[0]);
          } else if (error.response.data && typeof error.response.data === "object") {
            const first = Object.entries(error.response.data)[0];
            if (first) {
              const [field, msgs] = first;
              const msg = Array.isArray(msgs) ? msgs[0] : String(msgs);
              toast.error(`${field}: ${msg}`);
            } else {
              toast.error("Please check the form and try again");
            }
          } else {
            toast.error("Please check the form and try again");
          }
        }
        else {
          return errorHandler(error);
        }
      });
  };


  const onFinish = (data) => {
    let newValues;
    if (data.transaction_type === "Cash") {
      newValues = {
        ...data,
        date: incomeDate,

      };
    } else {
      newValues = {
        ...data,
        date: incomeDate,
        transaction_date: transactionDate,
      };
    }
    if (updateIncome) {
      UpdateIncome(newValues);
    } else {
      PostIncome(newValues);
    }
  };
  const onFinishFailed = (errorInfo) => {
    toast.warn("Please fill in all the required details !");
  };

  const label =
    paymentMode === "Online"
      ? "Online Transaction Type"
      : paymentMode === "Offline"
        ? "Offline Transaction Type"
        : null;

  return (
    <Form
      name="AddIncome"
      form={form}
      labelCol={{
        span: 24,
      }}
      wrapperCol={{
        span: 24,
      }}
      initialValues={{ date: dayjs() }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <CustomCardView>
        <CustomRow space={[24, 24]}>
          <Col span={24} md={24}>
            {updateIncome ? (
              <CustomPageTitle Heading={"Update Income"} />
            ) : (
              <CustomPageTitle Heading={"Add Income"} />
            )}
          </Col>
          <Col span={24} md={12}>
            <CustomSelect
              label={"Subcategory"}
              name={"income_subcategory"}
              options={incomeSubcategoryOptions}
              placeholder={"Choose Subcategory"}
              onChange={(val) => {
                setIncomeSubcategory(val);
                // Always clear any previously-picked Income Category when the
                // Subcategory changes — prevents stale FK / label carrying
                // over between Temple and Chit Fund selections.
                form.setFieldsValue({ category: undefined, category_name: undefined });
              }}
              rules={[
                {
                  required: true,
                  message: "Please Select a Subcategory !",
                },
              ]}
              data-testid={"income-subcategory-select"}
            />
          </Col>
          <Col span={24} md={12}></Col>
          {/*
            Income Category is shown ONLY when Subcategory = "Temple Income".
            For Chit Fund Income we skip categorisation entirely (business rule).
          */}
          {showIncomeCategory ? (
            <Col span={24} md={12}>
              <CustomAddSelect
                label={"Income Category"}
                name={"category"}
                options={IncomeCategoryOptions}
                onChange={handleIncomeCategory}
                onButtonClick={AddIncomeCategory}
                rules={[
                  {
                    required: true,
                    message: "Please Select a Income Category !",
                  },
                ]}
              />
              <CustomInput name={"category_name"} display={'none'} />
            </Col>
          ) : (
            <>
              <CustomInput name={"category"} display={"none"} />
              <CustomInput name={"category_name"} display={'none'} />
            </>
          )}

          <Col span={24} md={12}>
            <CustomAddSelect
              label={"Income Name"}
              name={"income"}
              options={IncomeNameOptions}
              onChange={handleIncomeName}
              onButtonClick={AddIncomeName}
              rules={[
                {
                  required: true,
                  message: "Please Select a Income Name !",
                },
              ]}
            />
            <CustomInput name={"income_name"} display={'none'} />
          </Col>
          <Col span={24} md={12}>
            <CustomDatePicker
              label={"Income Date"}
              name={"date"}
              onChange={handleIncomeDate}
              disabled
            />
          </Col>
          <Col span={24} md={12}>
            <CustomInputNumber
              label={"Income Amount"}
              name={"income_amt"}
              suffix={"₹"}
              rules={[
                {
                  required: true,
                  message: "Please Enter a Income Amount !",
                },
              ]}
            />
          </Col>
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
          </Col>
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
                    name={"bank"}
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
                  />
                  <CustomInput
                    label={"Transaction Number"}
                    name={"transaction_no"}
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
                  name={"transaction_no"}
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

          <Col span={24} md={24}>
            <CustomTextArea label={"Comments"} name={"comments"} />
          </Col>
        </CustomRow>
        {updateIncome ? (
          <Flex center gap={"20px"} style={{ margin: "30px" }}>
            <Button.Danger text={"Update"} htmlType={"submit"} />
            <Button.Success text={"Cancel"} onClick={FormExternalClose} />
          </Flex>
        ) : (
          <Flex center gap={"20px"} style={{ margin: "30px" }}>
            <Button.Danger text={"Add"} htmlType={"submit"} />
            <Button.Success text={"Reset"} onClick={onReset} />
          </Flex>
        )}
      </CustomCardView>
      <CustomModal
        isVisible={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        width={modelwith}
        modalTitle={modalTitle}
        modalContent={modalContent}
      />
    </Form>
  );
};
