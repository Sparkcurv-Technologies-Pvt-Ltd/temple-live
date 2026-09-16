import { Button, CustomDatePicker, CustomInput, CustomInputNumber, CustomRadioButton, CustomSelect, CustomTextArea } from '@components/form';
import { CustomCardView, CustomRow, Flex } from '@components/others';
import { CustomPageFormTitle, CustomPageTitle } from '@components/others/CustomPageTitle';
import { getMembersDetails, selectMemberDetails } from '@modules/FamilyDetails/FamilySlice';
import { APIURLS } from '@request/apiUrls/urls';
import errorHandler from '@request/errorHandler';
import request from '@request/request';
import successHandler from '@request/successHandler';
import { Col, Form } from 'antd'
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react'
import { FaPhone } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const BankTransactionForm = ({ updateRecord }) => {

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [selecteDefaultDate, setSelecteDefaultDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [typeMode, setTypeMode] = useState([]);
  const [bankDetails, setBankDetails] = useState([]);
  const [cashDetails, setCashDetails] = useState([]);
  const [cashpaidDetails, setCashpaidDetails] = useState([]);

  const [maxvalue, setMaxvalue] = useState();  //Use Max Amt Enter
  const [maxesValue, setMaxesValue] = useState();
  const [maxbankValue, setMaxbankValue] = useState();
  const [maxPaidAmt, setMaxPaidAmt] = useState();
  const [tenantType, setTenantType] = useState([]);
  const [tenantDetails, setTenantDetails] = useState([]);
  const [tenantTrigger, setTenantTrigger] = useState(0);
  const [payType, setPayType] = useState([]);
  const [loanMax, setLoanMax] = useState();
  const [banktoFilter, setBanktoFilter] = useState([]); //use From Bank to To bank  filter Details

  useEffect(() => {
    form.setFieldsValue({ casin_hand_amt: cashDetails[0]?.cash })
  }, [cashDetails]);

  useEffect(() => {
    GetBankDetails();
    GetcashDetails();
    dispatch(getMembersDetails());
    GetCashPaidDetails();
  }, [])
  const AllMemberDetails = useSelector(selectMemberDetails);
  //---------Get Bank Details -----------------------------//
  const GetBankDetails = async () => {
    await request
      .get(`${APIURLS.BANK_GET_DETAILS}`)
      .then(function (response) {
        setBankDetails(response.data)
        return response.data;
      })
      .catch(function (error) {
      });
  };

  //---------Get Cash Details -----------------------------//
  const GetcashDetails = async () => {
    await request
      .get(`${APIURLS.CASH_GET_DETAILS}`)
      .then(function (response) {
        setCashDetails(response.data)
        return response.data;
      })
      .catch(function (error) {
      });
  };
  //-------------------
  //---------Get Cash Paid typeDetails -----------------------------//
  const GetCashPaidDetails = async () => {
    await request
      .get(`${APIURLS.CASH_PAID_DETAILS}`)
      .then(function (response) {
        setCashpaidDetails(response.data)
        return response.data;
      })
      .catch(function (error) {
      });
  };
  //-------------------

  //---------Get Bank to Bank typeDetails -----------------------------//

  const handleTenant = (value) => {
    const AllTenantDetails = AllMemberDetails.find(
      (memberlist) => memberlist?.id === value
    );
    setTenantDetails(AllTenantDetails);
    setTenantTrigger(tenantTrigger + 1);
  };

  useEffect(() => {
    form.setFieldsValue({
      mobile_number: tenantDetails?.member_mobile_number,
      address: tenantDetails?.address,
      name: tenantDetails?.member_name,
    });
  }, [tenantDetails, tenantTrigger]);

  const BankTypeModeOptions = [
    {
      label: "Bank To Cash",
      value: "Bank To Cash"
    },
    {
      label: "Cash To Bank",
      value: "Cash To Bank"
    },
    {
      label: "Loan Amount",
      value: "Loan Amount"
    },
    {
      label: "Loan Repayment",
      value: "Loan Repayment",
    },
    {
      label: "Bank To Bank",
      value: "Bank To Bank"
    },
    {
      label: "Cash Borrowed",
      value: "Cash Borrowed"
    },
    {
      label: "Cash Paid",
      value: "Cash Paid"
    }
  ]
  //----------------  Pay Type Radio --------
  const PayTypeRadioOptions = [
    {
      label: "Bank",
      value: "Bank",
    },
    {
      label: "Cash",
      value: "Cash",
    },
  ]
  //----------- Tenat Type-----------------
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
  //-------- Bank Options---------------------------
  const BankNameOptions = bankDetails?.map((ban) => ({
    label: ban?.bank_name,
    value: ban?.id
  }))
  //-------- Bank To BankOptions---------------------------
  const BankFilterOptions = banktoFilter?.map((ban) => ({
    label: ban?.bank_name,
    value: ban?.id
  }))
  //---------------Paid List options and onChange fn -----------------------------
  const PaidListOptions = cashpaidDetails?.map((paid) => ({
    label: `${paid?.name}/${paid?.mobile_number}`,
    value: paid?.id
  }))

  const handlePaidList = (value) => {
    const FindPaidListDetails = cashpaidDetails?.find((ite) => ite?.id === value);
    form.setFieldsValue({ cash_paid_amt: FindPaidListDetails?.cash_paid_amt })
  }
  //------------ Handle Select Bank Fn------------------------------
  const handleBankChange = (e) => {

    if(typeMode ==="Bank To Bank"){
      const BankToBank = banktoFilter?.find((ban) => ban?.id === e)
    // console.log(BankToBank, 'BankToBank');
    form.setFieldsValue({ banks_name: BankToBank?.bank_name })
    form.setFieldsValue({ totalAmt: BankToBank?.credit_amt })
    form.setFieldsValue({ loan_repay_amt: BankToBank?.loan_repay_amt })
    }
    else{

      const BankIdFind = bankDetails?.find((ban) => ban?.id === e)
      // console.log(BankIdFind, 'BankIdFind');
      const LoanTotalAmt = BankIdFind?.loan_amt - BankIdFind?.loan_repay_amt || 0;
      form.setFieldsValue({ banks_name: BankIdFind?.bank_name })
      form.setFieldsValue({ totalAmt: BankIdFind?.credit_amt })
      form.setFieldsValue({ loan_repay_amt: LoanTotalAmt })
    }
    form.resetFields(["amount"])

  };
  const handleFromBankChange = async (e) => {
    if (typeMode === "Bank To Bank") {
      await PostBankToBank(e);
      // const BankToBank = banktoFilter?.find((ban) => ban?.id === e);
      // form.setFieldsValue({ banks2_name: BankToBank?.bank_name });
      // form.setFieldsValue({ from_bank_amt: BankToBank?.credit_amt });
      form.setFieldsValue({ banks: "" });
      form.setFieldsValue({ banks_name: "" });
    } else {
      const BankIdFind = bankDetails?.find((ban) => ban?.id === e);
      // console.log(BankIdFind, 'BankIdFind');
      form.setFieldsValue({ banks2_name: BankIdFind?.bank_name });
      form.setFieldsValue({ from_bank_amt: BankIdFind?.credit_amt });
    }
    form.resetFields(["amount"]);
  };
  
  const PostBankToBank = async (bankid) => {
    try {
      const response = await request.get(`${APIURLS.BANK_TO_BANK_FILTER}/${bankid}/`);
      setBanktoFilter(response.data);
      // console.log(response.data, 'getCashPaid');
      const BankToBank = bankDetails?.find((item)=>item?.id === bankid);
      // console.log(BankToBank,'BankToBank');
      form.setFieldsValue({ banks2_name: BankToBank?.bank_name });
      form.setFieldsValue({ from_bank_amt: BankToBank?.credit_amt });
      return response.data;
    } catch (error) {
      console.error(error);
      // Handle error if needed
    }
  };
  
  
  //------------- Type Mode OnChange ------------------
  const handleTypeModeChange = (value) => {
    setTypeMode(value)
    form.resetFields(["banks", "banks_name", "totalAmt", "amount", "pay_type", "member_type", "cash_trans", "cash_paid_amt"])
    setPayType([]);
    setTenantType([]);
  }

  //--------------- handle Default date show -------------------
  const handleDate = (date) => {
    setSelecteDefaultDate(date)
  }
  //-----------

  //------------ Handle Tenat Type onChange Function --------

  const handleTenantType = (e) => {
    setTenantType(e.target.value);
    form.resetFields([
      "name",
      "member",
      "mobile_number",
      "address",
    ]);
  };
  //-------------Handle Pay Type onChange Function
  const handlePayType = (e) => {
    setPayType(e.target.value)
    form.resetFields(["amount"])
  }
  //------------------
  const CalcGreateAmtonChange = (e) => {

    let creditBankAmt = parseFloat(form.getFieldValue("totalAmt")) || 0
    let creditCashAmt = parseFloat(form.getFieldValue("casin_hand_amt")) || 0;
    const PayAmt = parseFloat(e);


    if (typeMode === "Bank To Cash") {
      if (PayAmt > creditBankAmt) {
        toast.warn("With draw Amt not greater than Amount!");
        setMaxvalue(creditBankAmt)
      }
    }
    else if (typeMode === "Cash To Bank") {
      if (PayAmt > creditCashAmt) {

        toast.warn("Deposit Amount not greater than Cash In Hand Amt!");
        setMaxesValue(creditCashAmt)
      }
    }

    else {
      creditBankAmt = PayAmt;
      creditCashAmt = PayAmt;
      setMaxvalue("");
      setMaxesValue("");
    }

  };
  //==---------------=== Bank to Bank Amount Greater amt onChange ---------------=====
  const CalcGreateAmt2onChange = (e) => {

    let creditAmt = parseFloat(form.getFieldValue("from_bank_amt")) || 0
    const PayAmt = parseFloat(e);

    if (PayAmt > creditAmt) {

      toast.warn("Amount not greater than Credit Amt!");
      setMaxbankValue(creditAmt)
    } else {
      creditAmt = PayAmt;
      setMaxbankValue("")
    }

  };
  //==---------------=== Cash Paid amt onChange ---------------=====
  const CalcGreaterCashPaidAmt = (e) => {

    let paidAmt = parseFloat(form.getFieldValue("totalAmt")) || 0
    const PayAmt = parseFloat(e);

    if (PayAmt > paidAmt) {
      toast.warn("Amount not greater than Cash Bank Amt!");
      setMaxPaidAmt(paidAmt)

    } else {
      paidAmt = PayAmt;
      setMaxPaidAmt("")
    }
  };
  const [maxpaids, setMaxpaids] = useState()
  const CalcGreaterCashPaidAmt2 = (e) => {

    let borrowAmt = parseFloat(form.getFieldValue("cash_paid_amt")) || 0         // greater than cash Amount
    const PayAmt = parseFloat(e);

    if (PayAmt > borrowAmt) {
      toast.warn("Amount not greater than Cash Borrowed Amt!");
      setMaxpaids(borrowAmt)

    } else {
      borrowAmt = PayAmt;
      setMaxpaids("")
    }
  };
  //==---------------=== loan amt to amount onChange ---------------=====
  const handleLoanAmountChange = (e) => {

    let loanAmt = parseFloat(form.getFieldValue("loan_repay_amt")) || 0
    const PayAmt = parseFloat(e);

    if (PayAmt > loanAmt) {
      toast.warn("Amount not greater than Loan Amt!");
      setLoanMax(loanAmt)

    } else {
      loanAmt = PayAmt;
      setLoanMax("")
    }
  };
  //-------------- ADD Bank Statement POST -----------------------

  const AddBankTransaction = async (data) => {
    await request
      .post(`${APIURLS.BANK_TRANSACTIONPOST}`, data)
      .then(function (response) {

        if(response.status === 226){
          toast.warn(response.data?.message)
        }
        else{
          successHandler(response, {
            notifyOnSuccess: true,
            notifyOnFailed: true,
            msg: "success",
            type: "success",
          });
          setTypeMode([]);
          GetBankDetails();
          GetcashDetails();
          GetCashPaidDetails();
          setPayType([]);
          setTenantType([]);
          form.resetFields();
        }
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };
  const onFinish = (value) => {
    const Newvalues = { ...value, date: selecteDefaultDate }
    AddBankTransaction(Newvalues);
  }

  const onFinishFailed = () => {
    toast.warn("Please fill in all the required details !");
  };
  const onReset = () => {
    form.resetFields();
  }

  return (
    <Form
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      initialValues={{
        date: dayjs(),
      }}
    >
      <CustomCardView>
        <CustomRow space={[24, 24]}>
          <Col span={24} md={12}>
            {updateRecord ? <CustomPageTitle Heading={"Update Bank Transaction"} /> : <CustomPageTitle Heading={"Add Transaction"} />}
          </Col>
          <Col span={24} md={12}>
            <Flex flexend={"right"}>
              <CustomDatePicker
                name={"date"}
                onChange={handleDate}
                disabled={true}
              />
            </Flex>
          </Col>
          <Col span={24} md={24}>
            <CustomPageFormTitle Heading={"Cash Transfer :"} />
          </Col>
          <Col span={24} md={12}>
            <CustomSelect
              label={"Type"}
              name={"trans_type"}
              options={BankTypeModeOptions}
              onChange={handleTypeModeChange}
              rules={[{ required: true, message: "Please Choose a Type !" }]}
            />
          </Col>

          <Col span={24} md={24}>
            <CustomPageFormTitle Heading={typeMode} />
          </Col>
          {typeMode === "Cash Paid" &&
            <>
              <Col span={24} md={12}>
                <CustomSelect
                  label={"Paid List"}
                  name={"cash_trans"}
                  options={PaidListOptions}
                  onChange={handlePaidList}
                />
              </Col>
              <Col span={24} md={12}>
                <CustomInputNumber
                  label={"Cash Borrowed Amt"}
                  name={"cash_paid_amt"}
                  suffix={"₹"}
                  disabled
                />
              </Col>
            </>
          }
          {typeMode === "Cash To Bank" &&
            <Col span={24} md={12}>
              <CustomInputNumber
                label={"Cash In Hand Amt"}
                name={"casin_hand_amt"}
                suffix={"₹"}
                disabled
              />
            </Col>}
          {/* // */}
          {typeMode === "Bank To Bank" &&
            <Col span={24} md={12}>
              <CustomSelect
                label={"Choose From Bank"}
                name={"banks2"}
                options={BankNameOptions}
                onChange={handleFromBankChange}
                rules={[{ required: true, message: "Please Choose a From Bank !" }]}
              />
              <CustomInput name={'banks2_name'} display={'none'} />
            </Col>}
          {/* cash borrowed */}

          {(typeMode === "Cash Borrowed") && <>

            <Col span={24} md={24}>
              <CustomRadioButton
                name={"pay_type"}
                label={"Pay Type.."}
                data={PayTypeRadioOptions}
                onChange={handlePayType}
                rules={[
                  {
                    required: true,
                    message: "Please Choose a Any One!",
                  },
                ]}
              />
            </Col>
            {payType === "Bank" &&
              <Col span={24} md={12}>
                <CustomSelect
                  label={"Choose Bank"}
                  name={"banks"}
                  options={BankNameOptions}
                  onChange={handleBankChange}

                  rules={[{ required: true, message: "Please Choose a Bank !" }]}
                />
                <CustomInput name={'banks_name'} display={'none'} />
              </Col>}
            {(payType === 'Bank' || payType === 'Cash') &&
              <Col span={24} md={12}>
                <CustomInputNumber
                  label={"Amount"}
                  name={"amount"}
                  suffix={"₹"}
                  rules={[
                    {
                      required: true,
                      message: "Please Enter a amount !",
                    },
                  ]}
                />
              </Col>}
            {typeMode !== "Cash Paid" &&
              <Col span={24} md={24}>
                <CustomRadioButton
                  name={"member_type"}
                  label={"Member Type.."}
                  data={TenantTypeRadio}
                  onChange={handleTenantType}
                  rules={[
                    {
                      required: true,
                      message: "Please Choose a Tenant Type !",
                    },
                  ]}
                />
              </Col>}
            {tenantType === "Other" ? (
              <>
                <Col span={24} md={12}>
                  <CustomInput
                    label={"Member Name"}
                    name={"name"}
                    rules={[
                      {
                        required: true,
                        message: "Please Enter a Tenant Name !",
                      },
                    ]}
                  />
                </Col>
                <Col span={24} md={12}>
                  <CustomInputNumber
                    label={"Mobile Number"}
                    name={"mobile_number"}
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
                  <CustomTextArea
                    label={"Address"}
                    name={"address"}
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
                    label={"Member Name"}
                    name={"member"}
                    options={tenantname}
                    onChange={handleTenant}
                    rules={[
                      {
                        required: true,
                        message: "Please Select a Tenant Name !",
                      },
                    ]}
                  />
                  <CustomInput name={"name"} display={"none"} />
                </Col>
                <Col span={24} md={12}>
                  <CustomInputNumber
                    label={"Mobile Number"}
                    name={"mobile_number"}
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
                  <CustomTextArea label={"Address"} name={"address"} />
                </Col>
              </>
            ) : null}
          </>
          }
          {/* End Cash borrowed */}

          {typeMode === "Cash Paid" &&
            <>
              <Col span={24} md={24}>
                <CustomRadioButton
                  name={"pay_type"}
                  label={"Pay Type.."}
                  data={PayTypeRadioOptions}
                  onChange={handlePayType}
                  rules={[
                    {
                      required: true,
                      message: "Please Choose a Any One!",
                    },
                  ]}
                />
              </Col>
              {payType === "Bank" &&
                <>
                  <Col span={24} md={12}>
                    <CustomSelect
                      label={"Choose Bank"}
                      name={"banks"}
                      options={BankNameOptions}
                      onChange={handleBankChange}

                      rules={[{ required: true, message: "Please Choose a Bank !" }]}
                    />
                    <CustomInput name={'banks_name'} display={'none'} />
                  </Col>
                  <Col span={24} md={12}>
                    <CustomInputNumber
                      label={"Bank Amount"}
                      name={"totalAmt"}
                      suffix={"₹"}
                      disabled
                    />
                  </Col>
                </>
              }
              {(payType === 'Bank' || payType === 'Cash') &&
                <Col span={24} md={12}>
                  <CustomInputNumber
                    label={"Amount"}
                    name={"amount"}
                    suffix={"₹"}
                    max={payType === "Bank" ? maxPaidAmt : maxpaids}
                    onChange={payType === "Bank" ? CalcGreaterCashPaidAmt : CalcGreaterCashPaidAmt2}
                    rules={[
                      {
                        required: true,
                        message: "Please Enter a amount !",
                      },
                    ]}
                  />
                </Col>}
            </>
          }
          {(typeMode !== "Cash Borrowed" && typeMode !== "Cash Paid") &&
            <Col span={24} md={12}>
              <CustomSelect
                label={"Choose Bank"}
                name={"banks"}
                options={typeMode === "Bank To Bank" ? BankFilterOptions : BankNameOptions}
                onChange={handleBankChange}

                rules={[{ required: true, message: "Please Choose a Bank !" }]}
              />
              <CustomInput name={'banks_name'} display={'none'} />
            </Col>
          }
          {/* Bank To Cash Start */}
          {typeMode === "Bank To Cash" &&
            <>
              <Col span={24} md={12}>
                <CustomInputNumber
                  label={"Amount"}
                  name={"totalAmt"}
                  suffix={"₹"}
                  disabled
                />
              </Col>
              <Col span={24} md={12}>
                <CustomInputNumber
                  label={"With Draw Amt"}
                  name={"amount"}
                  suffix={"₹"}
                  max={maxvalue}
                  onChange={CalcGreateAmtonChange}
                  rules={[{ required: true, message: "Please Enter a With Draw Amt !" }]}
                />
              </Col>
            </>}
          {/* Bank To Cash End */}

          {/* Cash To Bank Start */}
          {typeMode === "Cash To Bank" &&
            <>
              <Col span={24} md={12}>
                <CustomInputNumber
                  label={"Deposit Amt"}
                  name={"amount"}
                  suffix={"₹"}
                  max={maxesValue}
                  onChange={CalcGreateAmtonChange}
                  rules={[{ required: true, message: "Please Enter a Deposit Amt !" }]}
                />
              </Col>
            </>}
          {/* Cash To Bank End */}

          {/* Loan Amount Start */}
          {typeMode === "Loan Amount" &&
            <>
              <Col span={24} md={12}>
                <CustomInputNumber
                  label={"Amount"}
                  name={"amount"}
                  suffix={"₹"}
                  rules={[{ required: true, message: "Please Enter a Amount !" }]}
                />
              </Col>
            </>}
          {/* Loan Amount End */}

          {/* Loan Repayment Start */}
          {typeMode === "Loan Repayment" &&
            <>
              <Col span={24} md={12}>
                <CustomInputNumber
                  label={"Loan Amount"}
                  name={"loan_repay_amt"}
                  suffix={"₹"}
                  disabled
                />
              </Col>
              <Col span={24} md={12}>
                <CustomInputNumber
                  label={"Amount"}
                  name={"amount"}
                  suffix={"₹"}
                  max={loanMax}
                  rules={[{ required: true, message: "Please Enter a Amount !" }]}
                  onChange={handleLoanAmountChange}

                />
              </Col>
            </>}
          {/* Loan Repayment End */}

          {/* bank to bank Start */}
          {typeMode === "Bank To Bank" &&
            <>
              <Col span={24} md={12}>
                <CustomInputNumber
                  label={"Credit Amt"}
                  name={"from_bank_amt"}
                  suffix={"₹"}
                  disabled
                />
              </Col>
              <Col span={24} md={12}>
                <CustomInputNumber
                  label={"Amount"}
                  name={"amount"}
                  suffix={"₹"}
                  max={maxbankValue}
                  onChange={CalcGreateAmt2onChange}
                  rules={[{ required: true, message: "Please Enter a Amount !" }]}
                />
              </Col>
            </>
          }
          {/* bank to bank End */}

        </CustomRow>
        <Flex gap={"20px"} center={true}>
          {updateRecord ? (
            <>
              <Button.Success text={"Update"} htmlType={"submit"} />
              <Button.Danger text={"Cancel"} />
            </>
          ) : (
            <>
              <Button.Danger text={"Submit"} htmlType={"submit"} />
              <Button.Success text={"Reset"} onClick={onReset} />
            </>
          )}
        </Flex>
      </CustomCardView>
    </Form>
  )
}

export default BankTransactionForm
