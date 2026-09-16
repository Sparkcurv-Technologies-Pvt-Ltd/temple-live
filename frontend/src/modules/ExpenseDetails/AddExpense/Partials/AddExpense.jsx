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
import {
  CustomCardView,
  CustomModal,
  CustomRow,
  Flex,
} from "@components/others";
import { Col, Form, Spin } from "antd";
import React, { useEffect, useState } from "react";
import {
  AddExpenseCategoryModal,
  AddExpenseNameModal,
} from "./AllExpenseModals";
import {
  CustomPageFormTitle,
  CustomPageTitle,
} from "@components/others/CustomPageTitle";
import { useDispatch, useSelector } from "react-redux";
import {
  getExpenseCategory,
  getExpenseName,
  selectExpenseCategoryDetails,
  selectExpenseNameDetails,
} from "../../ExpenseSlice";
import {
  getFestival,
  selectFestivalDetails,
} from "@modules/Festival/FestivalSlice";
import {
  getBankDetails,
  selectBankDetails,
} from "@modules/Management/ManagementSlice";
import request from "@request/request";
import errorHandler from "@request/errorHandler";
import successHandler from "@request/successHandler";
import { APIURLS } from "@request/apiUrls/urls";
import dayjs from "dayjs";
import { toast } from "react-toastify";

export const AddExpenseForm = ({
  UpdateRecord,
  HandleClose,
  UpdateForm,
  Expensetrigr,
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [trigger, setTrigger] = useState(0);
  const [expenseFrom, setExpenseFrom] = useState([]);
  const [expeNameTrigger, setExpeNameTrigger] = useState(0);
  const [expeCategyTrigger, setExpeCategyTrigger] = useState(0);
  const [transactionType, setTransactionType] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedExpName, setSelectedExpName] = useState([]);
  const [selectedBankDetails, setSelectedBankDetails] = useState([]);
  const [selectedfestivalType, setSelectedFestivaltype] = useState([]);
  const [expenseDate, setExpenseDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [transactionDate, setTransactionDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [TransactionData, setTransactionData] = useState({});
  const [expenseLoading, setExpenseLoading] = useState(false);
  // Watched value of the Subcategory selector – Expense Category only shows
  // when the user picks "Temple Expense". For "Chit Fund Expense" the
  // category field stays hidden per business rule.
  const [expenseSubcategory, setExpenseSubcategory] = useState(
    UpdateRecord?.expense_subcategory || null
  );
  const showExpenseCategory = expenseSubcategory === "Temple Expense";
  // Chit Fund selector state (Feb 2026 owner rule): populated whenever
  // Subcategory === "Chit Fund Expense". Fetched via existing
  // /api/chit_fund/get_active_chitfunds/ endpoint.
  const showChitFundSelector = expenseSubcategory === "Chit Fund Expense";
  const [chitFundList, setChitFundList] = useState([]);
  const [bankPay, setBankPay] = useState(null);
  useEffect(() => {
    if (!showChitFundSelector) return;
    request
      .get(APIURLS.PROFIT_CHITFUND_DETAILS)
      .then((res) => setChitFundList(res?.data || []))
      .catch(() => setChitFundList([]));
  }, [showChitFundSelector]);
  const chitFundOptions = chitFundList?.map((c) => ({
    label: c.chit_name,
    value: c.id,
  }));
  // ======  Modal Open ========
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ======  Modal Title and Content ========
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState(null);

  // ----------  Form Reset UseState ---------
  const [modelwith, setModelwith] = useState(0);

  // Record Data placed

  useEffect(() => {
    if (UpdateRecord) {
      const FromDate = new Date(UpdateRecord?.date);
      const transactionDate = new Date(UpdateRecord?.transaction_date);
      const dateFormat = "YYYY-MM-DD";
      const expenseDate = dayjs(FromDate).format(dateFormat);
      const TODateDOB = dayjs(transactionDate).format(dateFormat);

      form.setFieldsValue(UpdateRecord);
      setExpenseFrom(UpdateRecord?.expense_from);
      setTransactionData(UpdateRecord?.payment_mode);
      setTransactionType(UpdateRecord?.transaction_type);
      form.setFieldsValue({
        date: dayjs(expenseDate, dateFormat),
        transaction_date: dayjs(TODateDOB, dateFormat),
      });
      setExpenseDate(expenseDate);
      setTransactionDate(TODateDOB);
      setExpenseSubcategory(UpdateRecord?.expense_subcategory || null);
      // Pre-fill chit fund selector on Edit (Feb 2026 owner rule)
      if (UpdateRecord?.chitt_fund) {
        form.setFieldsValue({
          chitt_fund: UpdateRecord.chitt_fund,
          chit_fund_name: UpdateRecord.chit_fund_name,
        });
      }
      form.setFieldsValue({expense_name:UpdateRecord?.expense_name})
    }
  }, [UpdateRecord, Expensetrigr]);

  useEffect(() => {
    dispatch(getExpenseCategory());
  }, [expeCategyTrigger]);

  useEffect(() => {
    dispatch(getExpenseName());
  }, [expeNameTrigger]);

  useEffect(() => {
    dispatch(getFestival());
  }, []);

  useEffect(() => {
    dispatch(getBankDetails());
  }, []);

  const AllExpenseCategory = useSelector(selectExpenseCategoryDetails);
  const AllExpenseName = useSelector(selectExpenseNameDetails);
  const AllFestivals = useSelector(selectFestivalDetails);
  const AllBankDetails = useSelector(selectBankDetails);

  const expensecategoryoptions = AllExpenseCategory?.map((excat) => ({
    label: excat?.category_name,
    value: excat?.id,
  }));
  const expensenameoptions = AllExpenseName?.map((exname) => ({
    label: exname?.expense_name,
    value: exname?.id,
  }));
  const festivaloptions = AllFestivals?.map((fest) => ({
    label: fest?.festival_name,
    value: fest?.id,
  }));
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


  useEffect(() => {
    // Only push a string value; skip when selectedCategory is null/empty
    // (initial mount, or after subcategory switch cleared it) — otherwise
    // an array [] would land in the payload and DRF rejects it with
    // "category_name: Not a valid string."
    if (typeof selectedCategory === "string" && selectedCategory.length > 0) {
      form.setFieldsValue({ category_name: selectedCategory });
    }
    if (UpdateRecord) {
      form.setFieldsValue({ category_name: UpdateRecord?.category_name });
    }
  }, [selectedCategory, expeCategyTrigger]);

  useEffect(() => {
    if (UpdateRecord) {
      form.setFieldsValue({ bank_name: UpdateRecord?.bank_name });
    }
  }, [selectedBankDetails]);

  // ===== Modal Functions Start =====
  const showModal = () => {
    setIsModalOpen(true);
  };

  const ResetTrigger = () => {
    setTrigger(trigger + 1);
  };
  const handleOk = () => {
    setIsModalOpen(false);
    ResetTrigger();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const CloseForm = () => {
    handleOk();
  };

  const handleExpenseDate = (date) => {
    setExpenseDate(date);
  };

  const handleExpenseFrom = (e) => {
    setExpenseFrom(e);
    form.resetFields(["festival","others_name"])
  };

  const expensefromoptions = [
    {
      title: "Festival",
      value: "Festival",
    },
    {
      title: "Others",
      value: "Others",
    },
  ];

  const expenseSubcategoryOptions = [
    { label: "Chit Fund Expense", value: "Chit Fund Expense" },
    { label: "Temple Expense", value: "Temple Expense" },
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

  if (TransactionData === "Online") {
    RadioOptionsTransactionType = [
      {
        label: "Bank",
        value: "Bank",
      },
    ];
  } else if (TransactionData === "Offline") {
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
  const handleBankPayOptions = (e) => {
    if (e.target.value === "UPI") {
      setBankPay(e.target.value);
    } else {
      setBankPay(e.target.value);
    }
  };
  const handleExpenseCategory = (cat) => {
    const SelectedCategory = AllExpenseCategory?.find((exp) => exp.id === cat);
    setSelectedCategory(SelectedCategory?.category_name);
    setExpeCategyTrigger(expeCategyTrigger + 1);
  };

  const handleExpenseName = (name) => {
    const SelectedExpenseName = AllExpenseName?.find((exp) => exp.id === name);
    form.setFieldsValue({ expense_name: SelectedExpenseName?.expense_name });
    setExpeNameTrigger(expeNameTrigger + 1);
  };

  const handleFestival = (fest) => {
    const SelectedFestival = AllFestivals?.find((val) => val.id === fest);
    form.setFieldsValue({festival_name:SelectedFestival?.festival_name})

  };

  const handleBankOptions = (bank) => {
    const SelectedBank = AllBankDetails?.find((val) => val.id === bank);
    form.setFieldsValue({bank_name:SelectedBank?.bank_name})
  };


  const handlePaymentMode = (e) => {
    setTransactionData(e);
    setTransactionType({});
    form.resetFields(["transaction_type"]);
  };
  const handleTransactionDate = (date) => {
    setTransactionDate(date);
  };

  const handleTransactionType = (e) => {
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

  const AddExpenseCategory = () => {
    setTrigger(trigger + 1);
    setModelwith(500);
    setModalTitle("Add Expense Category");
    setModalContent(
      <AddExpenseCategoryModal
        formname={"AddExpenseCategory"}
        CloseForm={CloseForm}
        Expensetrigr={trigger}
      />
    );
    showModal();
  };

  const AddExpenseName = () => {
    setTrigger(trigger + 1);
    setModelwith(500);
    setModalTitle("Add Expense Name");
    setModalContent(
      <AddExpenseNameModal
        formname={"AddExpenseName"}
        CloseFormm={CloseForm}
        Expensetrigr={trigger}
      />
    );
    showModal();
  };


  const AddExpense = async (data) => {
    setExpenseLoading(true);
    await request
      .post(APIURLS.POST_EXPENSE, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        form.resetFields();
        setExpenseLoading(false);
        setTransactionType([]);
        setExpenseFrom([]);
        setTransactionData(null);
        return response.data;
      })
      .catch(function (error) {
        setExpenseLoading(false);
        if (error.response?.status === 400) {
          // Backend returned a DRF validation error – surface every field
          // error via toast so submit is never silent. Falls back to a
          // generic message if the shape is unexpected.
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
       else if(error.response?.status === 406){
          toast.error(error.response.data.message);
        }
        else{
          return errorHandler(error);
        }

      });
  };

  const EditExpense = async (data) => {
    await request
      .put(`${APIURLS.EDIT_EXPENSE}/${UpdateRecord?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Expense Details Updated Successfully",
          type: "info",
        });
        form.resetFields();
        setTransactionType([]);
        setExpenseFrom([]);
        UpdateForm();
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
        else if (error.response?.status === 302) {
          toast.warn(error.response?.data?.message);
        } else {
          return errorHandler(error);
        }
      });
  };
  const onFinish = (data) => {
    // Always build the payload — previously we only built `NewData` when
    // TransactionData was "Online" or "Offline", causing the submit to
    // silently no-op if the payment_mode state hadn't been captured yet.
    const NewData = {
      ...data,
      date: expenseDate,
      transaction_date: transactionDate,
    };

    if (UpdateRecord) {
      EditExpense(NewData);
    } else {
      AddExpense(NewData);
    }
  };
  const onFinishFailed = (errorInfo) => {
    toast.warn("Please fill in all the required details !");
  };

  const label =
    TransactionData === "Online"
      ? "Online Transaction Type"
      : TransactionData === "Offline"
      ? "Offline Transaction Type"
      : null;

      const onReset = () => {
        form.resetFields();
      };
  return (
    <Form
      name="AddExpense"
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
            {UpdateRecord ? (
              <CustomPageTitle Heading={"Update Expense"} />
            ) : (
              <CustomPageTitle Heading={"Add Expense"} />
            )}
          </Col>
          <Col span={24} md={12}>
            <CustomSelect
              label={"Subcategory"}
              name={"expense_subcategory"}
              options={expenseSubcategoryOptions}
              placeholder={"Choose Subcategory"}
              onChange={(val) => {
                setExpenseSubcategory(val);
                // Always clear any previously-picked Expense Category when the
                // Subcategory changes — prevents stale FK / label carrying
                // over between Temple and Chit Fund selections.
                form.setFieldsValue({ category: undefined, category_name: undefined });
                setSelectedCategory(null);
              }}
              rules={[
                {
                  required: true,
                  message: "Please Select a Subcategory !",
                },
              ]}
              data-testid={"expense-subcategory-select"}
            />
          </Col>
          <Col span={24} md={12}></Col>
          {/*
            Expense Category is shown ONLY when Subcategory = "Temple Expense".
            For Chit Fund Expense we skip categorisation entirely (business rule).
          */}
          {showExpenseCategory ? (
            <Col span={24} md={12}>
              <CustomAddSelect
                label={"Expense Category"}
                name={"category"}
                options={expensecategoryoptions}
                onChange={handleExpenseCategory}
                onButtonClick={AddExpenseCategory}
                rules={[
                  {
                    required: true,
                    message: "Please Select a Expense Category !",
                  },
                ]}
              />
              <CustomInput name={"category_name"} display={"none"} />
            </Col>
          ) : showChitFundSelector ? (
            /* Feb 2026 owner rule: link the Chit Fund Expense to a
               specific chit fund so its profit_amount + cash_inhand_amount
               are debited atomically on Add / Edit / Delete. */
            <Col span={24} md={12}>
              <CustomSelect
                label={"Chit Fund"}
                name={"chitt_fund"}
                options={chitFundOptions}
                placeholder={"Choose Chit Fund"}
                onChange={(val) => {
                  const c = chitFundList?.find((x) => x.id === val);
                  form.setFieldsValue({ chit_fund_name: c?.chit_name });
                }}
                rules={[
                  {
                    required: true,
                    message: "Please Select a Chit Fund !",
                  },
                ]}
                data-testid={"expense-chitfund-select"}
              />
              <CustomInput name={"chit_fund_name"} display={"none"} />
              <CustomInput name={"category"} display={"none"} />
              <CustomInput name={"category_name"} display={"none"} />
            </Col>
          ) : (
            <>
              <CustomInput name={"category"} display={"none"} />
              <CustomInput name={"category_name"} display={"none"} />
            </>
          )}

          <Col span={24} md={12}>
            <CustomAddSelect
              label={"Expense Name"}
              name={"expense"}
              options={expensenameoptions}
              onButtonClick={AddExpenseName}
              onChange={handleExpenseName}
              rules={[
                {
                  required: true,
                  message: "Please Select a Expense Name !",
                },
              ]}
            />
            <CustomInput name={"expense_name"} display={"none"} />
          </Col>

          <Col span={24} md={12}>
            <CustomDatePicker
              label={"Expense Date"}
              name={"date"}
              onChange={handleExpenseDate}
             disabled
            />
          </Col>

          <Col span={24} md={12}>
            <CustomInputNumber
              label={"Expense Amount"}
              name={"expense_amt"}
              suffix={"₹"}
              rules={[
                {
                  required: true,
                  message: "Please Enter a Expense Amount !",
                },
              ]}
            />
          </Col>

          <Col span={24} md={12}>
            <CustomTextArea label={"Comments"} name={"comments"} />
          </Col>
          <Col span={24} md={12}></Col>
          {/* <Col span={24} md={12}>
            <CustomSelect
              label={"Expense From"}
              name={"expense_from"}
              options={expensefromoptions}
              onChange={handleExpenseFrom}
              rules={[
                {
                  required: true,
                  message: "Please Select a Expense Amount !",
                },
              ]}
            />
            {expenseFrom && expenseFrom === "Festival" ? (
              <>
                <CustomSelect
                  label={"Festival Name"}
                  name={"festival"}
                  options={festivaloptions}
                  onChange={handleFestival}
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Festival Name !",
                    },
                  ]}
                />
                <CustomInput
                  label={"Festival"}
                  name={"festival_name"}
                  display={"none"}
                />
              </>
            ) : null}
            {expenseFrom && expenseFrom === "Others" ? (
              <CustomInput
                label={"Others Name"}
                name={"others_name"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter a Others Name !",
                  },
                ]}
              />
            ) : null}
          </Col> */}
          <Col span={24} md={12}>
            <CustomSelect
              label={"Payment Mode"}
              options={RadioOptionsPaymentMode}
              name={"payment_mode"}
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
         {TransactionData && TransactionData?.length ?
          <Col span={24} md={12}>
            <CustomRadioButton
              label={label}
              data={RadioOptionsTransactionType}
              name={"transaction_type"}
              onChange={handleTransactionType}
              rules={[
                {
                  required: true,
                  message: "Please Choose Anyone !",
                },
              ]}
            />
          </Col>:null}
         {TransactionData === "Offline" ? null : (
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
                        message: "Please Select a Bank Name !",
                      },
                    ]}
                  />
                  <CustomInput label={'bank'} name={'bank_name'} display={'none'}/>
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
                        message: "Please Enter a  Transaction Number!",
                      },
                    ]}
                  />
                  <CustomDatePicker
                    label={"Transaction Date"}
                    name={"transaction_date"}
                    rules={[
                      {
                        required: true,
                        message: "Please Choose a Transaction Date !",
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
                      message: "Please Enter a Cheque Number !",
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
        </CustomRow>
        <br />
        {expenseLoading ? (
          <Spin />
        ) : (
          <>
            {UpdateRecord ? (
              <Flex center gap={"20px"} style={{ margin: "30px" }}>
                <Button.Danger text={"Update"} htmlType={"submit"} />
                <Button.Success text={"Cancel"} onClick={HandleClose} />
              </Flex>
            ) : (
              <Flex center gap={"20px"} style={{ margin: "30px" }}>
                <Button.Danger text={"Submit"} htmlType={"submit"} />
                <Button.Success text={"Reset"} onClick={onReset} />
              </Flex>
            )}
          </>
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
