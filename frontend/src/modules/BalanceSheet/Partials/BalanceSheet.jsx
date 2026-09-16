import {
  Button,
  CustomDatePicker,
  CustomDateRangePicker,
  CustomSelect,
} from "@components/form";
import {
  CustomCardView,
  CustomModal,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { APIURLS } from "@request/apiUrls/urls";
import errorHandler from "@request/errorHandler";
import request from "@request/request";
import { Col, Form, Spin, Tooltip } from "antd";
import dayjs from "dayjs";
import React, { Fragment, useEffect, useRef } from "react";
import { useState } from "react";
import { IoPrint } from "react-icons/io5";
import styled from "styled-components";
import {
  BalancePaymentMemberView,
  BankLoanView,
  BankrepayLoanView,
  BorrowIncmView,
  BorrowPaidView,
  ChitfundProfitView,
  ChitfundTabView,
  DeathMemberView,
  ExpenseMemberView,
  FestivalMemberView,
  IncomeMemberView,
  InterestCollectionView,
  InterestPrincipalView,
  MarriageMemberView,
  MemberJoiningView,
  OtherExpenseMemberView,
  RentLeaseMemberView,
  TariffMemberView,
} from "./BalanceSheetView";
import { useReactToPrint } from "react-to-print";
import { MdKeyboardArrowRight, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { toast } from "react-toastify";
import { CommonManagePrintName } from "@modules/ComManagePrintDetails/CommonManagePrint";



const BalanceSheet = () => {

  const [form] = Form.useForm();
  const componentRef = useRef();

  const [rangeType, setRangeType] = useState({});
  const [dataSource, setDataSource] = useState([]);
  const [dateRange, setDateRange] = useState(dayjs().format("YYYY-MM-DD"));
  const [dateChange, setDateChange] = useState(dayjs().format("YYYY-MM-DD"));

  const [festivalModal, setFestivalModal] = useState([]) // -- festival Modal
  const [tarifTabModal, setTarifTabModal] = useState([]) // -- tariff Modal
  const [incomModal, setIncomModal] = useState([])  // -- income Modal
  const [deathtabModal, setDeathtabModal] = useState([])  // -- deatht Modal
  const [balanceTotalPayModal, setBalanceTotalPayModal] = useState(false)  // -- balance total Modal
  const [marriagetabModal, setMarriagetabModal] = useState(false)  // -- marriage Modal
  const [memberjoinModal, setMemberjoinmModal] = useState(false)  // -- memberjoin Modal
  const [rentModalTab, setRentModalTab] = useState(false)  // -- rent Modal
  const [expensedataModal, setExpensedataModal] = useState([])  // -- expense Modal
  const [otherexpensedataModal, setOtherExpensedataModal] = useState(false)  // -- other expense Modal
  const [bankLoanModal, setBankLoanModal] = useState(false)  // --  bank loan Modal
  const [borrowIncomesModal, setBorrowIncomesModal] = useState(false)  // --  Borrow income Modal
  const [chitfundProfitModal, setChitfundProfitModal] = useState(false)  // --  chit fund Profit Modal
  const [bankrepayLoanModal, setBankrepayLoanModal] = useState(false)  // --  bank repayment loan Modal
  const [investPrincipalAmtModal, setInvestPrincipalAmtModal] = useState(false)  // --  bank repayment loan Modal
  const [borrowpaidAmtModal, setBorrowpaidAmtModal] = useState(false)  // --  borrow paid AmtModal Modal
  const [interestCollectionModal, setTnterestCollectionModal] = useState(false)  // -- Interest collection AmtModal Modal

  const [chitfundModals, setChitfundModals] = useState([])  // -- income Modal
  const [incomIconModal, setIncomIconModal] = useState(true)

  const [isLoadspin, setIsLoadspin] = useState(false)
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

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const DateRangeType = [
    {
      label: "Custom Date Range",
      value: "custom_date_range",
    },
    {
      label: "Custom Date",
      value: "custom_date",
    },
  ];

  const hadleDateChoose = (value) => {
    setRangeType(value);
    form.setFieldsValue({ startend: null })
    form.setFieldsValue({ start_date: null })
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleDateChange = (dates) => {
    setDateChange(dates);
  };

  const FestivalhandleModal = (valueID, index) => {

    const CreditDetails = dataSource?.Credit?.festival || [];
    const FilterfestivalData = CreditDetails.find(item => item.id === valueID);

    const isVisible = festivalModal?.some(item => item?.id === FilterfestivalData?.id);

    if (isVisible) {
      setFestivalModal(prevValue => prevValue.filter(item => item?.id !== FilterfestivalData?.id));
    } else {
      setFestivalModal(prevValue => [...prevValue, CreditDetails[index]]);
    }

    // setFestivalModal(!festivalModal)
  };

  const TariffModal = (valueID, index) => {
    const CreditDetails = dataSource?.Credit?.tariff || [];
    const FilterTariffData = CreditDetails.find(item => item.id === valueID);

    const isVisible = tarifTabModal?.some(item => item?.id === FilterTariffData?.id);

    if (isVisible) {
      setTarifTabModal(prevValue => prevValue.filter(item => item?.id !== FilterTariffData?.id));
    } else {
      setTarifTabModal(prevValue => [...prevValue, CreditDetails[index]]);
    }
  };

  const IncomeModal = (valueID, index) => {

    const CreditDetails = dataSource?.Credit?.income?.income_details || [];
    const FilterIncomeData = CreditDetails.find(item => item.id === valueID);

    const isVisible = incomModal?.some(item => item?.id === FilterIncomeData?.id);

    if (isVisible) {
      setIncomModal(prevValue => prevValue.filter(item => item?.id !== FilterIncomeData?.id));
      setIncomIconModal('open')
    } else {
      setIncomModal(prevValue => [...prevValue, CreditDetails[index]]);
      setIncomIconModal('close')

    }

  };

  const ChitFundModal = (valueID, index) => {

    const CreditDetails = dataSource?.Debit?.Chit_fund_Investment || [];
    const FilterIncomeData = CreditDetails.find(item => item.id === valueID);

    const isVisible = chitfundModals?.some(item => item?.id === FilterIncomeData?.id);

    if (isVisible) {
      setChitfundModals(prevValue => prevValue.filter(item => item?.id !== FilterIncomeData?.id));
    } else {
      setChitfundModals(prevValue => [...prevValue, CreditDetails[index]]);
    }

  };

  const DeathModal = (valueID, index) => {
    const CreditDetails = dataSource?.Credit?.death || [];
    const FilterDeathData = CreditDetails.find(item => item.id === valueID);

    const isVisible = deathtabModal?.some(item => item?.id === FilterDeathData?.id);

    if (isVisible) {
      setDeathtabModal(prevValue => prevValue.filter(item => item?.id !== FilterDeathData?.id));
    } else {
      setDeathtabModal(prevValue => [...prevValue, CreditDetails[index]]);
    }
  };

  const BankLoan = () => {
    setBankLoanModal(!bankLoanModal)
  };

  const BorrowIncome = () => {
    setBorrowIncomesModal(!borrowIncomesModal)
  };

  const ChitFundProfit = () => {
    setChitfundProfitModal(!chitfundProfitModal)
  };

  const InterestCollection = () => {
    setTnterestCollectionModal(!interestCollectionModal)
  }

  const BankRepayLoan = () => {
    setBankrepayLoanModal(!bankrepayLoanModal)
  };

  const InterestPrincipalAmt = () => {
    setInvestPrincipalAmtModal(!investPrincipalAmtModal)
  };

  const BorrowpaidAmt = () => {
    setBorrowpaidAmtModal(!borrowpaidAmtModal)
  };

  const BalancePayModal = () => {
    setBalanceTotalPayModal(!balanceTotalPayModal)
  };

  const MarriageModal = () => {
    setMarriagetabModal(!marriagetabModal)
  };

  const MemberjoinModal = () => {
    setMemberjoinmModal(!memberjoinModal)
  };

  const RentModal = () => {
    setRentModalTab(!rentModalTab)
  };

  const ExpenseeModal = (valueID, index) => {

    const DebitDetails = dataSource?.Debit?.expense?.expense_details || [];
    const FilterExpenseData = DebitDetails.find(item => item.id === valueID);

    const isVisible = expensedataModal?.some(item => item?.id === FilterExpenseData?.id);

    if (isVisible) {
      setExpensedataModal(prevValue => prevValue.filter(item => item?.id !== FilterExpenseData?.id));
    } else {
      setExpensedataModal(prevValue => [...prevValue, DebitDetails[index]]);
    }

    // setExpensedataModal(!expensedataModal)
  };

  const OtherExpenseeModal = () => {
    setOtherExpensedataModal(!otherexpensedataModal)
  }

  // Post Url  ----------
  const AddBalancesheet = async (data) => {
    setIsLoadspin(true)
    await request.post(APIURLS.BALANCESHEET_DATE_POST, data)
      .then(function (response) {
        // successHandler(response, {
        //   notifyOnSuccess: true,
        //   notifyOnFailed: true,
        //   msg: "success",
        //   type: "success",
        // });
        // setRangeType([]);
        // form.resetFields();
        // console.log(response.data, 'ffdsfdsfsdf');
        setDataSource(response.data);
        setIsLoadspin(false)
        setDeathtabModal([])
        setFestivalModal([])
        setTarifTabModal([])
        setIncomModal([])
        setBalanceTotalPayModal(false)
        setMarriagetabModal(false)
        setMemberjoinmModal(false)
        setRentModalTab(false)
        setExpensedataModal([])
        setOtherExpensedataModal(false)
        setChitfundModals([])
        setInvestPrincipalAmtModal(false)
        setBankLoanModal(false)
        setBorrowIncomesModal(false)
        setChitfundProfitModal(false)
        setTnterestCollectionModal(false)
        setBorrowpaidAmtModal(false)
        return response.data;
      })
      .catch(function (error) {
        setIsLoadspin(false)
        return errorHandler(error);
      });
  };

  const onFinish = (value) => {
    const record = { ...value, dateRange, dateChange };
    let NewValue = {
      range_type: record?.range_type,
      start_date:
        value?.range_type === "custom_date"
          ? record?.dateChange
          : record?.dateRange?.start_date,
      end_date:
        value?.range_type === "custom_date" ? "" : record?.dateRange?.end_date,
      // end_date: record?.dateRange?.end_date,
    };
    AddBalancesheet(NewValue);
  };

  const CreditDetails = dataSource?.Credit;
  const DebitDetails = dataSource?.Debit;
  const BalanceDetails = dataSource?.balance;


  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const currentDate = dayjs().format('YYYY-MM-DD');

  const formatIndianNumber = (number) => {
    // Convert number to string
    let strNumber = number?.toString();

    // Check for decimal in the number
    let decimalPart = '';
    if (strNumber.includes('.')) {
      [strNumber, decimalPart] = strNumber.split('.');
      decimalPart = '.' + decimalPart; // prepend '.' to keep the decimal part
    }

    // Formatting the integer part
    const length = strNumber.length;
    if (length <= 3) {
      return strNumber + decimalPart;
    }
    const lastThreeDigits = strNumber.substring(length - 3);
    const mainPart = strNumber.substring(0, length - 3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");

    return `${mainPart},${lastThreeDigits}${decimalPart}`;
  };


  useEffect(() => {
    if (dataSource?.total_credit_amount == 0 && dataSource?.total_debit_amount == 0) {
      toast.warn('No data added for this date.')
    } else {
      console.log('data coming');
    }
  }, [dataSource])


  return (
    <Fragment>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={8}>
            <CustomPageTitle Heading={"Temple Balance Sheet"} />
          </Col>
          <Col span={24} md={16}>
            <Button.Secondary text={"Print"} icon={<IoPrint />}
              style={{ float: "right" }}
              onClick={handlePrint} />
          </Col>
        </CustomRow>
        <br />
        <Form
          name="balancesheet"
          form={form}
          labelCol={{
            span: 24,
          }}
          wrapperCol={{
            span: 24,
          }}
          onFinish={onFinish}
          autoComplete="off" >
          <CustomRow space={[12, 12]}>
            <Col span={24} md={8}>
              <p style={{ color: "#000" }}>Select Date :</p>
              <CustomSelect
                name={"range_type"}
                options={DateRangeType}
                placeholder={"Choose Date"}
                onChange={hadleDateChoose}
                rules={[{ required: true, message: "Required" }]}
              />
            </Col>
            {rangeType === "custom_date_range" ? (
              <Col span={24} md={10}>
                <p style={{ color: "#000" }}>Date Range :</p>
                <CustomDateRangePicker
                  name={"startend"}
                  onChange={handleDateRangeChange}
                  rules={[{ required: true, message: "Required" }]}
                />
              </Col>
            ) : rangeType === "custom_date" ? (
              <Col span={24} md={8}>
                <p style={{ color: "#000" }}>Custom Date :</p>
                <CustomDatePicker
                  name={"start_date"}
                  onChange={handleDateChange}
                  rules={[{ required: true, message: "Required" }]}
                />
              </Col>
            ) : null}
            <Col span={24} md={4}>
              {rangeType && (
                <Flex center gap={"20px"} style={{ margin: "10px 0" }}>
                  {isLoadspin ? <Spin style={{ marginTop: '15px' }} /> :
                    <Button.Danger text={"Submit"} htmlType={"submit"} />
                  }
                </Flex>
              )}
            </Col>
          </CustomRow>
        </Form>
        <br />
        <PrintHolder ref={componentRef}>
          <PrintShowData className="PrintShowDatadd">
            <CommonManagePrintName />
            <h3 style={{ textAlign: 'center' }}>Temple Balance Sheet</h3><br />
            <Flex spacebetween={true} aligncenter={true}>
              <div>
                <h5><span>Date Type</span> : {dataSource?.name === 'custom_date_range' ? 'Custom Date Range' : 'Custom Date'}</h5>
                <h5><span>Start Date</span> : {dataSource?.start_date} </h5>
                {dataSource && dataSource?.end_date ?
                  <h5><span>End Date</span> : {dataSource?.end_date} </h5>
                  : null}
              </div>
              <div>
                <h5 style={{ marginRight: '10px' }}><span>Print Date</span> : {currentDate} </h5>
              </div>
            </Flex>
          </PrintShowData>
          <DesignT style={{ border: "2px solid #C2C1C1" }}>
            <CustomRow className="BorderAP">
              <Col span={24} md={12} className="BorderRi">
                <h4>Credit</h4>

                {CreditDetails && "opening_balance" in CreditDetails ? (
                  <>
                    <CustomRow space={[24, 24]}>
                      <Col span={15} md={15}><h2>Opening Balance </h2></Col>
                      <Col span={2} md={2}>-</Col>
                      <Col span={7} md={7}>
                        <Flex end style={{ marginRight: '10px' }}>
                          <span> {formatIndianNumber(CreditDetails?.opening_balance)}</span>
                        </Flex>
                      </Col>
                    </CustomRow>
                    < br />
                  </>
                ) : null}

                {CreditDetails && CreditDetails.member_joining ? (
                  <>
                    <CustomRow space={[24, 24]}>
                      <Col span={15} md={15} onClick={() => MemberjoinModal()}>
                        <Flex>
                          <h2>Member Joining</h2>
                          {memberjoinModal == true ? <MdKeyboardArrowRight fontSize={25} /> :
                            <MdOutlineKeyboardArrowDown fontSize={25} />}
                        </Flex>
                      </Col>
                      <Col span={2} md={2}>-</Col>
                      <Col span={7} md={7} onClick={() => MemberjoinModal()}>
                        <Tooltip placement="topLeft" title={"Total Amount"}>
                          <Flex end={true} aligncenter={true} style={{ marginRight: '10px' }}>
                            <span>
                              {formatIndianNumber(CreditDetails?.member_joining?.total_amount)}
                            </span>
                          </Flex>
                        </Tooltip>
                        <div style={{ color: '#9898984c', borderBottom: '1px solid' }} />
                      </Col>
                      {memberjoinModal == true ?
                        <Col span={24} md={24} className="Showtransin">
                          <MemberJoiningView record={dataSource} />
                        </Col>
                        : null}
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {CreditDetails && CreditDetails.marriage ? (
                  <>
                    <CustomRow space={[24, 24]}>
                      <Col span={15} md={15} onClick={() => MarriageModal()}>
                        <Flex>
                          <h2 >Marriage</h2>
                          {marriagetabModal == true ? <MdKeyboardArrowRight style={{ marginTop: '3px' }} fontSize={25} /> :
                            <MdOutlineKeyboardArrowDown style={{ marginTop: '3px' }} fontSize={25} />}
                        </Flex>
                      </Col>
                      <Col span={2} md={2}>-</Col>
                      <Col span={7} md={7} onClick={() => MarriageModal()}>
                        <Flex end style={{ marginRight: "10px" }}>
                          <Tooltip placement="topLeft" title={"Amount"}>
                            <span>
                              {formatIndianNumber(CreditDetails?.marriage?.amount)}
                            </span>
                          </Tooltip>
                        </Flex>
                        <div style={{ color: '#9898984c', borderBottom: '1px solid' }} />
                      </Col>
                      {marriagetabModal == true ? <>
                        {/* marriage cash bank and cashin hand code start */}

                        <Col span={15} md={15}>
                          <Flex aligncenter={true}><span className="NameHead">Bank :&nbsp;</span>
                            <span> {formatIndianNumber(CreditDetails.marriage?.bank_amount)}</span>
                          </Flex>
                        </Col>
                        <Col span={2} md={2}>-</Col>
                        <Col span={7} md={7}>
                          <Flex end={true} aligncenter={true} style={{ marginRight: '10px' }}>
                            <span className="NameHead">Cash:&nbsp;</span>
                            <span> {formatIndianNumber(CreditDetails.marriage?.cash_amount)}
                            </span></Flex>
                        </Col>

                        {/* marriage cash bank and cashin hand code end */}

                        <Col span={24} md={24} className="Showtransin">
                          <MarriageMemberView record={dataSource} />
                        </Col>
                      </>
                        : null}
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {
                  CreditDetails && CreditDetails.income ? (
                    <>
                      <CustomRow space={[24, 12]}>
                        {/* <Flex aligncenter={true}> */}
                        <Col span={24} md={24}>
                          <Flex>
                            <h2>Income</h2>
                          </Flex>
                        </Col>
                        <Col span={24} md={24}>
                          {CreditDetails?.income?.income_details?.map((item, index) => (
                            <Flex gap={'10px'} aligncenter={true} style={{ margin: '6px 0' }} key={index} onClick={() => IncomeModal(item?.id, index)} >
                              <div style={{ width: '5%' }} >
                                <span>{index + 1}&nbsp;.</span>&nbsp;
                              </div>
                              <div style={{ width: '70%' }}>
                                <Tooltip placement="topLeft" title={"Income"}>
                                  <span className="NameHead">{item.name}</span>
                                </Tooltip>
                                {incomModal.some(ite => ite?.id === item.id) ?
                                  <MdOutlineKeyboardArrowDown fontSize={22} style={{ margin: '-8px 0px' }} /> :
                                  <MdKeyboardArrowRight fontSize={22} style={{ margin: '-8px 0px' }} />
                                }
                                {CreditDetails.income.length > 1 &&
                                  index !== CreditDetails.income.length - 1 && (
                                    ''
                                  )}
                              </div>
                              <Flex style={{ margin: '15px 0' }} key={index}>
                                - {CreditDetails.income.length > 1 && index !== CreditDetails.income.length - 1 && <br />}
                              </Flex>
                              <Flex end={true} style={{ margin: '10px', width: '25%' }} key={index}>
                                {CreditDetails.income.length > 1 &&
                                  index !== CreditDetails.income.length - 1 && (
                                    <br />
                                  )}
                                <Tooltip placement="topRight" title={"Income Amount"}>
                                  {formatIndianNumber(item.amount)}
                                </Tooltip>
                                <div style={{ color: '#9898984c', borderBottom: '1px solid' }} />
                              </Flex>
                            </Flex>
                          ))}
                        </Col>

                        <Col span={15} md={15}>
                          <Flex aligncenter><span className="NameHead">Bank :&nbsp;</span>
                            <span> {formatIndianNumber(CreditDetails.income?.bank_amount)}</span>
                          </Flex>
                        </Col>
                        <Col span={2} md={2}>-</Col>
                        <Col span={7} md={7}>
                          <Flex end={true} aligncenter={true} style={{ marginRight: '10px' }}><span className="NameHead">Cash:&nbsp;</span>
                            <span> &nbsp;{formatIndianNumber(CreditDetails.income?.cash_amount)}</span></Flex>
                          <div style={{ color: '#9898984c', margin: '13px 0x', borderBottom: '1px solid' }} />
                        </Col>

                        {/* Income cash bank and cashin hand code end */}

                        <Col span={24} md={24}>
                          <IncomeMemberView incomModal={incomModal} />
                        </Col>

                        {/* </Flex> */}
                      </CustomRow>
                      <br />
                    </>
                  ) : null
                }


                {
                  CreditDetails && CreditDetails.festival ? (
                    <>
                      <CustomRow space={[24, 10]}>
                        {/* <Flex aligncenter={true}> */}
                        <Col span={24} md={24}>
                          <Flex>
                            <h2>Festival</h2>
                          </Flex>
                        </Col>
                        <Col span={24} md={24}>
                          {CreditDetails?.festival?.map((item, index) => (
                            <Flex gap={'10px'} aligncenter={true} style={{ margin: '6px 0' }} key={index} onClick={() => FestivalhandleModal(item?.id, index)}>
                              <div style={{ width: '5%' }} >
                                <span>{index + 1}&nbsp;.</span>&nbsp;
                              </div>
                              <div style={{ width: '70%' }}>
                                <Tooltip placement="topLeft" title={"Festival"}>
                                  <span className="NameHead">{item.name}</span>&nbsp;<span className="NameHeadcount">({item.member_count}  × {item.amount})</span>
                                </Tooltip>
                                {festivalModal.some(ite => ite?.id === item.id) ?
                                  <MdOutlineKeyboardArrowDown fontSize={22} style={{ margin: '-8px 0px' }} /> :
                                  <MdKeyboardArrowRight fontSize={22} style={{ margin: '-8px 0px' }} />
                                }
                                {CreditDetails.festival.length > 1 &&
                                  index !== CreditDetails.festival.length - 1 && (
                                    ''
                                  )}
                              </div>
                              <Flex style={{ margin: '15px 0' }} key={index}>
                                - {CreditDetails.festival.length > 1 && index !== CreditDetails.festival.length - 1 && <br />}
                              </Flex>
                              <Flex end={true} style={{ margin: '10px', width: '25%' }} key={index}>
                                {CreditDetails.festival.length > 1 &&
                                  index !== CreditDetails.festival.length - 1 && (
                                    <br />
                                  )}
                                <Tooltip placement="topRight" title={"Total"}>
                                  {formatIndianNumber(item.total_amount)}
                                </Tooltip>
                              </Flex>
                              <div style={{ color: '#9898984c', borderBottom: '1px solid' }} />
                            </Flex>
                          ))}
                        </Col>

                        <Col span={24} md={24} className="Showtransin">
                          <FestivalMemberView festivalDataModal={festivalModal} /></Col>

                        {/* </Flex> */}
                      </CustomRow>
                      <br />
                    </>
                  ) : null
                }

                {CreditDetails && CreditDetails.tariff ? (
                  <>
                    <CustomRow space={[24, 10]}>
                      <Col span={24} md={24}><h2>Tariff</h2></Col>
                      <Col span={15} md={15}>
                        {CreditDetails?.tariff?.map((item, index) => (
                          <Flex style={{ margin: '10px 0' }} key={index} onClick={() => TariffModal(item?.id, index)}>
                            <span>{index + 1} .&nbsp;</span>&nbsp;
                            <Tooltip placement="topLeft" title={"Tariff"}>
                              <span className="NameHead">{item.name}</span>&nbsp;<span className="NameHeadcount">({item.member_count})</span>
                            </Tooltip>
                            {tarifTabModal.some(ite => ite?.id === item.id) ?
                              <MdOutlineKeyboardArrowDown fontSize={22} /> :
                              <MdKeyboardArrowRight fontSize={22} />
                            }
                            {CreditDetails.tariff.length > 1 &&
                              index !== CreditDetails.tariff.length - 1 && (
                                <br />
                              )}
                          </Flex>
                        ))}
                      </Col>
                      <Col span={2} md={2}>

                        {CreditDetails?.tariff?.map((item, index) => (
                          <Flex style={{ margin: '15px 0' }} key={index}>
                            -
                            {CreditDetails.tariff.length > 1 &&
                              index !== CreditDetails.tariff.length - 1 && (
                                '')}
                          </Flex>
                        ))}
                      </Col>
                      <Col span={7} md={7}>
                        {CreditDetails?.tariff?.map((item, index) => (
                          <Flex end style={{ margin: '10px' }} key={index}>
                            <Tooltip placement="topRight" title={"Total"}>
                              {formatIndianNumber(item.total_amount)}
                            </Tooltip>
                            {CreditDetails.tariff.length > 1 &&
                              index !== CreditDetails.tariff.length - 1 && (
                                <br />
                              )}
                          </Flex>
                        ))}
                        <div style={{ color: '#9898984c', borderBottom: '1px solid' }} />
                      </Col>
                      <Col span={24} md={24} className="Showtransin">
                        <TariffMemberView tarifTabModal={tarifTabModal} />
                      </Col>

                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {CreditDetails && CreditDetails.death ? (
                  <>
                    <CustomRow space={[24, 10]}>
                      <Col span={24} md={24} onClick={() => DeathModal()}>
                        <Flex>
                          <h2>Death</h2>
                        </Flex>
                      </Col>

                      <Col span={15} md={15}>
                        {CreditDetails?.death?.map((item, index) => (
                          <Flex style={{ margin: '10px 0' }} key={index} onClick={() => DeathModal(item?.id, index)}>
                            <span>{index + 1} .&nbsp;</span>&nbsp;
                            <Tooltip placement="topLeft" title={"Member details"}>
                              <span className="NameHead">{item.name}</span>&nbsp;<span className="NameHeadcount">({item.member_count}  × {item.amount})</span>
                            </Tooltip>
                            {deathtabModal.some(ite => ite?.id === item.id) ?
                              <MdOutlineKeyboardArrowDown fontSize={22} /> :
                              <MdKeyboardArrowRight fontSize={22} />
                            }
                            {CreditDetails.death.length > 1 &&
                              index !== CreditDetails.death.length - 1 && (
                                ''
                              )}
                          </Flex>
                        ))}</Col>

                      <Col span={2} md={2}>
                        {CreditDetails?.death?.map((item, index) => (
                          <Flex style={{ margin: '15px 0' }} key={index}>
                            -
                            {CreditDetails.death.length > 1 &&
                              index !== CreditDetails.death.length - 1 && (
                                '')}
                          </Flex>
                        ))}
                      </Col>

                      <Col span={7} md={7}>
                        {CreditDetails?.death?.map((item, index) => (
                          <Flex end style={{ margin: '10px' }} key={index}>
                            <Tooltip placement="topRight" title={"Total"}>
                              {formatIndianNumber(item.total_amount)}
                            </Tooltip>
                            {CreditDetails.death.length > 1 &&
                              index !== CreditDetails.death.length - 1 && (
                                <br />
                              )}
                          </Flex>
                        ))}
                        <div style={{ color: '#9898984c', borderBottom: '1px solid' }} />
                      </Col>

                      <Col span={24} md={24} className="Showtransin" >
                        <DeathMemberView recordfind={dataSource} deathtabModal={deathtabModal} />
                      </Col>
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {CreditDetails && CreditDetails.other_incomes ? (
                  <>
                    <CustomRow space={[24, 10]}>
                      <Col span={24} md={24} onClick={() => RentModal()}>
                        <Flex>
                          <h2>Rent</h2>
                          {/* {rentModalTab == true ? <MdKeyboardArrowRight fontSize={25} /> :
                            <MdOutlineKeyboardArrowDown fontSize={25} />} */}
                        </Flex>
                      </Col>

                      <Col span={15} md={15} onClick={() => RentModal()}>
                        <Flex aligncenter><span className="NameHead">Bank :&nbsp;</span>
                          <span> {formatIndianNumber(CreditDetails.other_incomes?.bank_amount)}</span>
                        </Flex>
                      </Col>

                      <Col span={2} md={2}>-</Col>

                      <Col span={7} md={7}>
                        <Flex end={true} aligncenter={true} style={{ marginRight: '10px' }}>
                          <span className="NameHead">Cash:&nbsp;</span>
                          <span>
                            {formatIndianNumber(CreditDetails.other_incomes?.cash_amount)}
                          </span>
                        </Flex>

                        <div style={{ color: '#9898984c', borderBottom: '1px solid' }} />
                      </Col>

                      <Col span={24} md={24} className="Showtransin">
                        <RentLeaseMemberView record={dataSource} /></Col>
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {BalanceDetails && BalanceDetails ? (
                  <>
                    <CustomRow space={[24, 10]}>
                      <Col span={24} md={24} onClick={() => BalancePayModal()}>
                        <Flex>
                          <h3>Balance Payment</h3>
                          {balanceTotalPayModal ? <MdKeyboardArrowRight style={{ marginTop: '-3px' }} fontSize={25} /> :
                            <MdOutlineKeyboardArrowDown style={{ marginTop: '-3px' }} fontSize={25} />}
                        </Flex>
                      </Col>
                      <Col span={15} md={15} onClick={() => BalancePayModal()}>
                        <Flex aligncenter><span className="NameHead">{BalanceDetails.name}</span>
                        </Flex>
                      </Col>

                      <Col span={2} md={2}>- </Col>

                      <Col span={7} md={7}>
                        <Flex end >
                          <Tooltip placement="topRight" title={"Total"}>
                            {formatIndianNumber(BalanceDetails.amount)}
                          </Tooltip>
                        </Flex>
                        <div style={{ color: '#9898984c', borderBottom: '1px solid' }} />
                      </Col>

                      {balanceTotalPayModal == true ? <>
                        <Col span={24} md={24} className="Showtransin">
                          <BalancePaymentMemberView record={dataSource} />
                        </Col>
                        <Col span={15} md={15}>
                          <Flex aligncenter><span className="NameHead">Bank :&nbsp;</span>
                            <span> {formatIndianNumber(BalanceDetails?.bank_amount)}</span>
                          </Flex>
                        </Col>

                        <Col span={2} md={2}>-</Col>

                        <Col span={7} md={7}>
                          <Flex end={true} aligncenter={true} style={{ marginRight: '10px' }}>
                            <span className="NameHead">Cash:&nbsp;</span>
                            <span>
                              {formatIndianNumber(BalanceDetails?.cash_amount)}
                            </span>
                          </Flex>

                          <div style={{ color: '#9898984c', borderBottom: '1px solid' }} />
                        </Col></>
                        : null}

                    </CustomRow>
                    <br />
                  </>
                ) : null}


                {CreditDetails && CreditDetails.loan_income?.bank_details ? (
                  <>
                    <br />
                    <CustomRow space={[24, 12]}>
                      <Col span={15} md={15} onClick={() => BankLoan()} >
                        <Flex aligncenter={true}>
                          <h2 style={{ cursor: 'pointer' }}>Bank Loan  </h2>
                          {bankLoanModal ? <MdOutlineKeyboardArrowDown fontSize={25} /> : <MdKeyboardArrowRight fontSize={25} />}
                        </Flex>

                      </Col>

                      <Col span={2} md={2}>- </Col>

                      <Col span={7} md={7}>
                        <Flex end={true} style={{ marginRight: '10px' }} >
                          <span>{formatIndianNumber(CreditDetails?.loan_income?.total_amount)}</span>
                        </Flex>

                      </Col>

                      <Col span={24} md={24}>
                        {bankLoanModal ? <BankLoanView bankloannModal={dataSource} /> : null}
                      </Col>

                    </CustomRow>

                  </>
                ) : null}


                {CreditDetails && CreditDetails.borrow_income ? (
                  <>
                    <br />
                    <CustomRow space={[24, 12]}>
                      <Col span={15} md={15} onClick={() => BorrowIncome()} >
                        <Flex aligncenter={true}>
                          <h2 style={{ cursor: 'pointer' }}>Borrow Income</h2>
                          {borrowIncomesModal ? <MdOutlineKeyboardArrowDown fontSize={25} /> : <MdKeyboardArrowRight fontSize={25} />}
                        </Flex>

                      </Col>

                      <Col span={2} md={2}>- </Col>

                      <Col span={7} md={7}>
                        <Flex end={true} style={{ marginRight: '10px' }} >
                          <span>{formatIndianNumber(CreditDetails?.borrow_income?.total_amount)}</span>
                        </Flex>

                      </Col>

                      <Col span={24} md={24}>
                        {borrowIncomesModal ? <BorrowIncmView borrowIncomesDetails={dataSource} /> : null}
                      </Col>

                    </CustomRow>

                  </>
                ) : null}

                {
                  CreditDetails && CreditDetails.Fund ? (
                    <>
                      <CustomRow space={[24, 12]}>
                        {/* <Flex aligncenter={true}> */}
                        <Col span={24} md={24}>
                          <Flex>
                            <h2>Fund</h2>
                          </Flex>
                        </Col>
                        <Col span={24} md={24}>
                          {CreditDetails?.Fund?.map((item, index) => (
                            <Flex gap={'10px'} aligncenter={true} style={{ margin: '6px 0' }} key={index} >
                              <div style={{ width: '5%' }} >
                                <span>{index + 1}&nbsp;.</span>&nbsp;
                              </div>
                              <div style={{ width: '70%' }}>
                                <Tooltip placement="topLeft" title={"Fund"}>
                                  <span className="NameHead">{item?.fund_name}</span>
                                </Tooltip>
                                {CreditDetails.Fund.length > 1 &&
                                  index !== CreditDetails.Fund.length - 1 && (
                                    ''
                                  )}
                              </div>
                              <Flex style={{ margin: '15px 0' }} key={index}>
                                - {CreditDetails.Fund.length > 1 && index !== CreditDetails.Fund.length - 1 && <br />}
                              </Flex>
                              <Flex end={true} style={{ margin: '10px', width: '25%' }} key={index}>
                                {CreditDetails.Fund.length > 1 &&
                                  index !== CreditDetails.Fund.length - 1 && (
                                    <br />
                                  )}
                                <Tooltip placement="topRight" title={"Total"}>
                                  {formatIndianNumber(item?.amount)}
                                </Tooltip>
                                {CreditDetails.Fund.length > 1 &&
                                  index !== CreditDetails.Fund.length - 1 && (
                                    ''
                                  )}
                                <div style={{ color: '#9898984c', borderBottom: '1px solid' }} />
                              </Flex>
                            </Flex>
                          ))}
                        </Col>
                        <Col span={24} md={24}>
                          {chitfundModals ?
                            <ChitfundTabView chitfundModals={chitfundModals} /> : null}
                        </Col>

                        {/* </Flex> */}
                      </CustomRow>
                      <br />
                    </>
                  ) : null
                }

                {CreditDetails && CreditDetails.Chit_fund_Profit ? (
                  <>
                    <br />
                    <CustomRow space={[24, 12]}>
                      <Col span={15} md={15} onClick={() => ChitFundProfit()} >
                        <Flex aligncenter={true}>
                          <h2 style={{ cursor: 'pointer' }}>Chit Fund Profit</h2>
                          {chitfundProfitModal ? <MdOutlineKeyboardArrowDown fontSize={25} /> : <MdKeyboardArrowRight fontSize={25} />}
                        </Flex>

                      </Col>

                      <Col span={2} md={2}>- </Col>

                      <Col span={7} md={7}>
                        <Flex end={true} style={{ marginRight: '10px' }} >
                          <span>{formatIndianNumber(CreditDetails?.Chit_fund_Profit?.total_amount)}</span>
                        </Flex>

                      </Col>

                      <Col span={24} md={24}>
                        {chitfundProfitModal ? <ChitfundProfitView chitfundProfitdetails={dataSource} /> : null}
                      </Col>

                    </CustomRow>

                  </>
                ) : null}

                {CreditDetails && CreditDetails.Interest_Collection ? (
                  <>
                    <br />
                    <CustomRow space={[24, 12]}>
                      <Col span={15} md={15} onClick={() => InterestCollection()} >
                        <Flex aligncenter={true}>
                          <h2 style={{ cursor: 'pointer' }}>Interest Collection</h2>
                          {interestCollectionModal ? <MdOutlineKeyboardArrowDown fontSize={25} /> : <MdKeyboardArrowRight fontSize={25} />}
                        </Flex>

                      </Col>

                      <Col span={2} md={2}>- </Col>

                      <Col span={7} md={7}>
                        <Flex end={true} style={{ marginRight: '10px' }} >
                          <span>{formatIndianNumber(CreditDetails?.Interest_Collection?.total_amount)}</span>
                        </Flex>

                      </Col>

                      <Col span={24} md={24}>
                        {interestCollectionModal ? <InterestCollectionView interestcollectionDetails={dataSource} /> : null}
                      </Col>

                    </CustomRow>

                  </>
                ) : null}


                <div className='mobileresponsbalane'>
                  <CustomRow space={[24, 24]} >
                    <Col span={24} md={12}></Col>
                    <Col span={24} md={12}>
                      {dataSource && dataSource.total_credit_amount ? <hr /> : null}

                      {dataSource && dataSource.total_credit_amount ? (
                        <Flex end style={{ margin: '10px' }}><h3 className="totalamt">Total : ₹&nbsp;{formatIndianNumber(dataSource?.total_credit_amount)}</h3>
                          <br />
                        </Flex>
                      ) : null}
                    </Col>

                    {/* Bank Loan Details function  */}
                    {/* <Col span={24} md={24} className="BorderRi">
                      {CreditDetails && CreditDetails.loan_income?.bank_details ? (
                        <>
                          <br />
                          <CustomRow space={[24, 12]}>
                            <Col span={15} md={15} onClick={() => BankLoan()} >
                              <Flex aligncenter={true}>
                                <h2 style={{ cursor: 'pointer' }}>Bank Loan  </h2>
                                {bankLoanModal ? <MdOutlineKeyboardArrowDown fontSize={25} /> : <MdKeyboardArrowRight fontSize={25} />}
                              </Flex>

                            </Col>

                            <Col span={2} md={2}>- </Col>

                            <Col span={7} md={7}>
                              <Flex end={true} >
                                <span>{formatIndianNumber(CreditDetails?.loan_income?.total_amount)}</span>
                              </Flex>
                            </Col>

                            <Col span={24} md={24}>
                              {bankLoanModal ? <BankLoanView bankloannModal={dataSource} /> : null}
                            </Col>

                          </CustomRow>

                        </>
                      ) : null}
                    </Col> */}
                    {/* Bank Loan Details function  */}

                  </CustomRow>
                </div>

              </Col>

              {/* -------- OverAll left Box end ------- */}

              {/* OverAll right Box start */}
              <Col span={24} md={12} className="BorderLe">
                <h4>Debit</h4>
                {DebitDetails && "opening_balance" in DebitDetails ? (
                  <div>
                    <CustomRow space={[24, 24]}>
                      <Col span={15} md={15}>
                        <h2>Opening Balance </h2>
                      </Col>
                      <Col span={2} md={2}>-</Col>
                      <Col span={7} md={7}><span >{DebitDetails?.opening_balance}</span></Col>
                    </CustomRow>
                    <br />
                  </div>
                ) : null}

                {DebitDetails && DebitDetails.expense ? (
                  <>
                    <CustomRow space={[24, 12]}>
                      {/* <Flex aligncenter={true}> */}
                      <Col span={24} md={24}>
                        <Flex>
                          <h2>Expense</h2>
                        </Flex>
                      </Col>
                      <Col span={24} md={24}>
                        {DebitDetails?.expense?.expense_details?.map((item, index) => (
                          <Flex gap={'10px'} aligncenter={true} style={{ margin: '6px 0' }} key={index} onClick={() => ExpenseeModal(item?.id, index)}>
                            <div style={{ width: '5%' }} >
                              <span>{index + 1}&nbsp;.</span>&nbsp;
                            </div>
                            <div style={{ width: '70%' }}>
                              <Tooltip placement="topLeft" title={"Expense"}>
                                <span className="NameHead">{item.name}</span>
                              </Tooltip>
                              {expensedataModal.some(ite => ite?.id === item.id) ?
                                <MdOutlineKeyboardArrowDown fontSize={22} style={{ margin: '-8px 0px' }} /> :
                                <MdKeyboardArrowRight fontSize={22} style={{ margin: '-8px 0px' }} />
                              }
                              {DebitDetails.expense.length > 1 &&
                                index !== DebitDetails.expense.length - 1 && (
                                  ''
                                )}
                            </div>
                            <Flex style={{ margin: '15px 0' }} key={index}>
                              - {DebitDetails.expense.length > 1 && index !== DebitDetails.expense.length - 1 && <br />}
                            </Flex>
                            <Flex end={true} style={{ margin: '10px', width: '25%' }} key={index}>
                              {DebitDetails.expense.length > 1 &&
                                index !== DebitDetails.expense.length - 1 && (
                                  <br />
                                )}
                              <Tooltip placement="topRight" title={"Expense Amount"}>
                                {formatIndianNumber(item.amount)}
                              </Tooltip>
                            </Flex>
                          </Flex>
                        ))}
                      </Col>

                      <Col span={15} md={15}>
                        <Flex aligncenter><span className="NameHead">Bank :&nbsp;</span>
                          <span> {formatIndianNumber(DebitDetails.expense?.bank_amount)}</span>
                        </Flex>
                      </Col>
                      <Col span={2} md={2}>-</Col>
                      <Col span={7} md={7}>
                        <Flex end={true} aligncenter={true} style={{ marginRight: '10px' }}><span className="NameHead">Cash:&nbsp;</span>
                          <span> &nbsp;{formatIndianNumber(DebitDetails.expense?.cash_amount)}</span></Flex>
                        <div style={{ color: '#9898984c', margin: '13px 0x', borderBottom: '1px solid' }} />
                      </Col>

                      {/* Expense cash bank and cashin hand code end */}

                      <Col span={24} md={24} className="Showtransin">
                        <ExpenseMemberView expensedataModal={expensedataModal} /></Col>
                      {/* </Flex> */}
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {DebitDetails && DebitDetails.other_expense ? (
                  <>
                    <CustomRow space={[24, 10]}>
                      <Col span={24} md={24} onClick={() => OtherExpenseeModal()}>
                        <Flex>
                          <h2>Settlement Amount</h2>
                          {otherexpensedataModal == true ? <MdKeyboardArrowRight fontSize={25} /> :
                            <MdOutlineKeyboardArrowDown fontSize={25} />}
                        </Flex>
                      </Col>
                      <Col span={15} md={15} onClick={() => OtherExpenseeModal()}>
                        <Flex aligncenter><span className="NameHead">Bank :&nbsp;</span>
                          <span> {formatIndianNumber(DebitDetails.other_expense?.bank_amount)}</span>
                        </Flex>
                      </Col>

                      <Col span={2} md={2}>-</Col>

                      <Col span={7} md={7}>
                        <Flex end={true} aligncenter={true} style={{ marginRight: '10px' }}><span className="NameHead">Cash:&nbsp;</span>
                          <span>
                            &nbsp;{formatIndianNumber(DebitDetails.other_expense?.cash_amount)}
                          </span>
                        </Flex>
                        <div style={{ color: '#9898984c', borderBottom: '1px solid' }} />
                      </Col>
                      {otherexpensedataModal == true ?
                        <Col span={24} md={24} className="Showtransin">
                          <OtherExpenseMemberView record={dataSource} /></Col> : null}
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {DebitDetails && DebitDetails.loan_repayment ? (
                  <>
                    <CustomRow space={[12, 12]}>
                      <Col span={15} md={15} onClick={() => BankRepayLoan()} >
                        <Flex aligncenter={true}>
                          <h2 style={{ cursor: 'pointer' }}>Bank Loan Pay</h2>
                          {bankrepayLoanModal ? <MdOutlineKeyboardArrowDown fontSize={25} /> : <MdKeyboardArrowRight fontSize={25} />}
                        </Flex>

                      </Col>

                      <Col span={2} md={2}>- </Col>

                      <Col span={7} md={7}>
                        <Flex end={true} style={{ marginRight: '10px' }} >
                          <span>{formatIndianNumber(DebitDetails?.loan_repayment?.total_amount)}</span>
                        </Flex>
                        <div style={{ color: '#9898984c', borderBottom: '1px solid' }} />
                      </Col>

                      <Col span={24} md={24}>
                        {bankrepayLoanModal ? <BankrepayLoanView bankloannModal={dataSource} /> : null}
                      </Col>

                    </CustomRow>

                  </>
                ) : null}

                {
                  DebitDetails && DebitDetails.Chit_fund_Investment ? (
                    <>
                      <CustomRow space={[24, 12]}>
                        {/* <Flex aligncenter={true}> */}
                        <Col span={24} md={24}>
                          <Flex>
                            <h2>Chit Fund Investment</h2>
                          </Flex>
                        </Col>
                        <Col span={24} md={24}>
                          {DebitDetails?.Chit_fund_Investment?.map((item, index) => (
                            <Flex gap={'10px'} aligncenter={true} style={{ margin: '6px 0' }} key={index}
                              onClick={() => ChitFundModal(item?.id, index)} >

                              <div style={{ width: '5%' }} >
                                <span>{index + 1}&nbsp;.</span>&nbsp;
                              </div>
                              <div style={{ width: '70%' }}>
                                <Tooltip placement="topLeft" title={"Chit-Fund"}>
                                  <span className="NameHead">{item.chitfund_name}</span>
                                </Tooltip>
                                {chitfundModals.some(ite => ite?.id === item.id) ?
                                  <MdOutlineKeyboardArrowDown fontSize={22} style={{ margin: '-8px 0px' }} /> :
                                  <MdKeyboardArrowRight fontSize={22} style={{ margin: '-8px 0px' }} />
                                }
                                {DebitDetails.Chit_fund_Investment.length > 1 &&
                                  index !== DebitDetails.Chit_fund_Investment.length - 1 && (
                                    ''
                                  )}
                              </div>
                              <Flex style={{ margin: '15px 0' }} key={index}>
                                - {DebitDetails.Chit_fund_Investment.length > 1 && index !== DebitDetails.Chit_fund_Investment.length - 1 && <br />}
                              </Flex>
                              <Flex end={true} style={{ margin: '10px', width: '25%' }} key={index}>
                                {DebitDetails.Chit_fund_Investment.length > 1 &&
                                  index !== DebitDetails.Chit_fund_Investment.length - 1 && (
                                    <br />
                                  )}
                                <Tooltip placement="topRight" title={"Total"}>
                                  {formatIndianNumber(item.total_amount)}
                                </Tooltip>
                                {DebitDetails.Chit_fund_Investment.length > 1 &&
                                  index !== DebitDetails.Chit_fund_Investment.length - 1 && (
                                    ''
                                  )}
                              </Flex>
                            </Flex>
                          ))}
                        </Col>
                        <Col span={24} md={24}>
                          {chitfundModals ?
                            <ChitfundTabView chitfundModals={chitfundModals} /> : null}
                        </Col>

                        {/* </Flex> */}
                      </CustomRow>
                      <br />
                    </>
                  ) : null
                }

                {DebitDetails && DebitDetails.Interest_Principal_amount ? (
                  <><br />
                    <CustomRow space={[12, 12]}>
                      <Col span={15} md={15} onClick={() => InterestPrincipalAmt()} >
                        <Flex aligncenter={true}>
                          <h2 style={{ cursor: 'pointer' }}>Interest Principal Amt</h2>
                          {investPrincipalAmtModal ? <MdOutlineKeyboardArrowDown fontSize={25} /> : <MdKeyboardArrowRight fontSize={25} />}
                        </Flex>

                      </Col>

                      <Col span={2} md={2}>- </Col>

                      <Col span={7} md={7}>
                        <Flex end={true} style={{ marginRight: '10px' }} >
                          <span>{formatIndianNumber(DebitDetails.Interest_Principal_amount?.total_amount)}</span>
                        </Flex>
                        <div style={{ color: '#9898984c', borderBottom: '1px solid', marginTop: '3px' }} />
                      </Col>

                      <Col span={24} md={24}>
                        {investPrincipalAmtModal ? <InterestPrincipalView InterPrincipalModal={dataSource} /> : null}
                      </Col>

                    </CustomRow>

                  </>
                ) : null}

                {DebitDetails && DebitDetails.borrowpaid_amount ? (
                  <><br />
                    <CustomRow space={[12, 12]}>
                      <Col span={15} md={15} onClick={() => BorrowpaidAmt()} >
                        <Flex aligncenter={true}>
                          <h2 style={{ cursor: 'pointer' }}>Borrow Paid Amt</h2>
                          {borrowpaidAmtModal ? <MdOutlineKeyboardArrowDown fontSize={25} /> : <MdKeyboardArrowRight fontSize={25} />}
                        </Flex>

                      </Col>

                      <Col span={2} md={2}>- </Col>

                      <Col span={7} md={7}>
                        <Flex end={true} style={{ marginRight: '10px' }} >
                          <span>{formatIndianNumber(DebitDetails.borrowpaid_amount?.total_amount)}</span>
                        </Flex>
                        <div style={{ color: '#9898984c', borderBottom: '1px solid', marginTop: '3px' }} />
                      </Col>

                      <Col span={24} md={24}>
                        {borrowpaidAmtModal ? <BorrowPaidView datas={DebitDetails} /> : null}
                      </Col>

                    </CustomRow>

                  </>
                ) : null}

                <div className='mobileresponsbalane'>
                  <CustomRow space={[24, 24]}>
                    <Col span={24} md={12}></Col>
                    <Col span={24} md={12}>
                      <div>
                        {dataSource && dataSource.total_debit_amount ? <hr /> : null}
                        {dataSource && dataSource.total_debit_amount ? (
                          <Flex end style={{ margin: '10px' }}> <h3 className="totalamt"> Total : ₹&nbsp;{formatIndianNumber(dataSource?.total_debit_amount)}{" "} </h3>
                            <br />
                          </Flex>
                        ) : null}
                      </div>
                    </Col>
                  </CustomRow>
                </div>


              </Col>
              {/* OverAll right Box start */}

            </CustomRow>

            {/* Total Balance Amt show code start */}
            <div className="webrespons">
              <CustomRow className="BorderAP">

                <Col span={24} md={12} className="BorderRi">
                  <CustomRow space={[24, 24]}>
                    <Col span={24} md={12}></Col>
                    <Col span={24} md={12}>
                      {dataSource && dataSource.total_credit_amount ? <hr /> : null}

                      {dataSource && dataSource.total_credit_amount ? (
                        <Flex end style={{ margin: '10px' }}><h3 className="totalamt">Total : ₹&nbsp;{formatIndianNumber(dataSource?.total_credit_amount)}</h3>
                          <br />
                        </Flex>
                      ) : null}
                    </Col>
                  </CustomRow>

                  {/* Bank Loan Details function  */}
                  {/* <Col span={24} md={24} className="BorderRi">
                    {CreditDetails && CreditDetails.loan_income?.bank_details ? (
                      <>
                        <br />
                        <CustomRow space={[24, 12]}>
                          <Col span={15} md={15} onClick={() => BankLoan()} >
                            <Flex aligncenter={true}>
                              <h2 style={{ cursor: 'pointer' }}>Bank Loan  </h2>
                              {bankLoanModal ? <MdOutlineKeyboardArrowDown fontSize={25} /> : <MdKeyboardArrowRight fontSize={25} />}
                            </Flex>

                          </Col>

                          <Col span={2} md={2}>- </Col>

                          <Col span={7} md={7}>
                            <Flex end={true} >
                              <span>{formatIndianNumber(CreditDetails?.loan_income?.total_amount)}</span>
                            </Flex>
                            
                          </Col>

                          <Col span={24} md={24}>
                            {bankLoanModal ? <BankLoanView bankloannModal={dataSource} /> : null}
                          </Col>

                        </CustomRow>

                      </>
                    ) : null}
                  </Col> */}
                  {/* Bank Loan Details function  */}

                </Col>

                <Col span={24} md={12} className="BorderLe">
                  <CustomRow space={[24, 12]}>
                    <Col span={24} md={12}></Col>
                    <Col span={24} md={12}>
                      <div>
                        {dataSource && dataSource.total_debit_amount ? <hr /> : null}
                        {dataSource && dataSource.total_debit_amount ? (
                          <Flex end style={{ margin: '10px' }}> <h3 className="totalamt"> Total : ₹&nbsp;{formatIndianNumber(dataSource?.total_debit_amount)}{" "} </h3>
                            <br />
                          </Flex>
                        ) : null}
                      </div>
                    </Col>

                    {/* Bank Loan Details function  */}
                    {/* <Col span={24} md={24} className="BorderRi">
                      {CreditDetails && CreditDetails.loan_income?.bank_details ? (
                        <>
                          <CustomRow space={[12, 12]}>
                            <Col span={15} md={15} onClick={() => BankLoan()} >
                              <Flex aligncenter={true}>
                                <h2 style={{ cursor: 'pointer' }}>Bank Loan  </h2>
                                {bankLoanModal ? <MdOutlineKeyboardArrowDown fontSize={25} /> : <MdKeyboardArrowRight fontSize={25} />}
                              </Flex>

                            </Col>

                            <Col span={2} md={2}>- </Col>

                            <Col span={7} md={7}>
                              <Flex end={true} >
                                <span>{formatIndianNumber(CreditDetails?.loan_income?.total_amount)}</span>
                              </Flex>
                            </Col>

                            <Col span={24} md={24}>
                              {bankLoanModal ? <BankLoanView bankloannModal={dataSource} /> : null}
                            </Col>

                          </CustomRow>

                        </>
                      ) : null}
                    </Col> */}
                    {/* Bank Loan Details function  */}
                  </CustomRow>
                </Col>

              </CustomRow>
            </div>
            {/* Total Balance Amt show code end */}



            {/* overall total balance start */}
            <div style={{ borderTop: '2px solid #c2c1c1' }}>
              <CustomRow space={[12, 12]}>
                <Col span={24} md={12}>
                  {dataSource && dataSource.loan_details_bottom ?
                    <div className="footerbalance">Loan Pending amount : ₹ {formatIndianNumber(dataSource.loan_details_bottom?.loan_pending_amount)} </div> : null}

                  {dataSource && dataSource.borrow_details_bottom ?
                    <div className="footerbalance">Borrow amount : ₹ {formatIndianNumber(dataSource.borrow_details_bottom?.borrow_amount)} </div> : null}

                </Col>
                <Col span={24} md={12}>
                  {dataSource?.balance_amount >= 0 &&
                    <div className="footerstyle">
                      <h6>Cash In Hand : <span> ₹ {formatIndianNumber(dataSource?.overall_cash_amount)}&nbsp;</span>
                        {dataSource?.balance_type === 'Credit' && <span style={{ color: 'green' }}><Tooltip title={'Credit'}>(Cr)</Tooltip></span>} {dataSource?.balance_type === 'Debit' && <span style={{ color: 'red' }}><Tooltip title={'Debit'}>(Dr)</Tooltip></span>}
                      </h6>
                      <h6>Bank : <span> ₹ {formatIndianNumber(dataSource?.overall_bank_amount)}</span></h6>
                    </div>
                  }
                </Col>
              </CustomRow>
            </div>

            {/* overall total balance end */}

          </DesignT>
        </PrintHolder>
      </CustomCardView>
      <CustomModal isVisible={isModalOpen}
        handleOk={handleOk} handleCancel={handleCancel}
        width={modelwith} modalTitle={modalTitle}
        modalContent={modalContent} />
    </Fragment>
  );
};

export default BalanceSheet;


const PrintHolder = styled.div`
    padding: 10px 15px;
    & svg {
      cursor: pointer;
    }
    & h5 {
      color: #a1a1a1;
      margin: 10px 0;
      & span {
        color: #000000;
      }
    };
    @media print{     
      .PrintShowDatadd {
        display: block;
        page-break-before: always;
        border: 1px solid #c2c1c1;
        padding: 0 15px;
        @page {
          margin-top: 10px; 
          border-bottom: 2px solid;
        }
      }
      
    @media (orientation: portrait) {
      .webrespons {
        display: none !important;
      }
      
      .mobileresponsbalane {
        visibility: visible !important;
      }
    };

    @media (orientation: landscape) {
      .webrespons {
        visibility: visible !important;
      }
      
      .mobileresponsbalane {
        display: none !important;
      }
    };

      margin: 50px;
      width:100%;
      margin:auto;
    };
`
const PrintShowData = styled.div`
  display: none;
`

const DesignT = styled.div`
 
  & h2 {
    cursor: pointer;
    font-family: system-ui;
    font-weight: 700;
    font-size: 18px;
  };
  & h4 {
    margin-bottom: 20px;
    font-size: 20px;
    color: white;
    cursor: pointer;
    background: #990000;
    padding: 15px;
    text-align: center;
  };
  .totalamt {
    text-align: center;
  };
 
  .styletext {
    font-size: 18px;
    margin-top: 5px;
  };
  & span {
    cursor: pointer;
    font-size: 18px;
  };
  .BorderAP {
    border: 1px solid #c2c1c1 !important;
  };
  .BorderRi {
    border-right: 1px solid #c2c1c1;
  };
  .BorderLe {
    border-left: 1px solid #c2c1c1;
  };

  .mobileresponsbalane {
    visibility: hidden;
  }

  .Showtransin {
    transition: all 9s
  }

  .footerstyle {
    padding: 20px;
    text-align: end;
    & h6 {
      font-size: 17px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    & span {
      color: green;
      font-size: 17px;
    }
  };

  .footerbalance {
    padding: 20px;
    font-size: 17px;
    font-weight: 600;
  }



  @media screen and (max-width: 767px) {
    .BorderRi {
      border-right: 0px solid #c2c1c1;
    }
    .BorderLe {
      border-left: 0px solid #c2c1c1;
    }
    .webrespons {
      display: none;
    }
    .mobileresponsbalane {
      visibility: visible;
    }
  };

  .RentStyle {
    display: flex;
    gap: 20px;
    margin-top: -5px;
    @media screen and (max-width: 1179px) {
      flex-wrap: wrap;
      gap: 0px;
    }
  };

  .AlgnEnd {
    text-align: end;
  }

  .NameHead {
    color: #dd0606;
    font-size: 15px;
    font-weight: 700;
  };
  .NameHeadcount {
    color: #010101;
    font-size: 15px;
    font-weight: 700;
  }
`;