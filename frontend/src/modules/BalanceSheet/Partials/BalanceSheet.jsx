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
import { Col, Form, Spin, Table, Tooltip } from "antd";
import dayjs from "dayjs";
import React, { Fragment, useEffect, useRef, useState } from "react";
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

// ============================================================================
// Helpers (module level so the small components below can use them too)
// ============================================================================

const formatIndianNumber = (number) => {
  if (number === null || number === undefined || number === "") return "0";

  let strNumber = number.toString();
  let sign = "";
  if (strNumber.startsWith("-")) {
    sign = "-";
    strNumber = strNumber.slice(1);
  }

  let decimalPart = "";
  if (strNumber.includes(".")) {
    [strNumber, decimalPart] = strNumber.split(".");
    decimalPart = "." + decimalPart;
  }

  const length = strNumber.length;
  if (length <= 3) return sign + strNumber + decimalPart;

  const lastThreeDigits = strNumber.substring(length - 3);
  const mainPart = strNumber
    .substring(0, length - 3)
    .replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  return `${sign}${mainPart},${lastThreeDigits}${decimalPart}`;
};

// One "label - amount" line, used for Opening Balance and Previous Balance
const AmountLine = ({ label, amount, tooltip }) => (
  <>
    <CustomRow space={[24, 24]}>
      <Col span={15} md={15}>
        <h2>{label}</h2>
      </Col>
      <Col span={2} md={2}>-</Col>
      <Col span={7} md={7}>
        <Flex end style={{ marginRight: "10px" }}>
          {tooltip ? (
            <Tooltip placement="topRight" title={tooltip}>
              <span>{formatIndianNumber(amount)}</span>
            </Tooltip>
          ) : (
            <span>{formatIndianNumber(amount)}</span>
          )}
        </Flex>
      </Col>
    </CustomRow>
    <br />
  </>
);

// Opening Balance + Previous Balance for one side (Credit or Debit)
const OpeningLines = ({ details, openingType }) => {
  if (!details) return null;
  return (
    <>
      {"opening_balance" in details ? (
        <AmountLine
          label="Opening Balance"
          amount={details.opening_balance}
          tooltip={openingType ? `Opening balance entered as ${openingType}` : null}
        />
      ) : null}
      {"previous_balance" in details ? (
        <AmountLine
          label="Previous Balance"
          amount={details.previous_balance}
          tooltip="Net of all income and expenses before the selected date"
        />
      ) : null}
    </>
  );
};

// Interest Collection table: Sl No, Int No, Name, Interest Type, Amount
const InterestCollectionTable = ({ details = [] }) => {
  const columns = [
    { title: "Sl No", key: "sl", width: 70, render: (_, __, index) => index + 1 },
    { title: "Int No", dataIndex: "interest_name", key: "interest_name" },
    { title: "Name", dataIndex: "people_name", key: "people_name" },
    { title: "Interest Type", dataIndex: "interest_category", key: "interest_category" },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (value) => formatIndianNumber(value),
    },
  ];

  return (
    <TableHolder>
      <Table
        columns={columns}
        dataSource={details}
        rowKey={(row, index) => `${row.interest_name}-${index}`}
        pagination={false}
        size="small"
        bordered
      />
    </TableHolder>
  );
};

// ============================================================================
// Page
// ============================================================================

const BalanceSheet = () => {
  const [form] = Form.useForm();
  const componentRef = useRef();

  const [rangeType, setRangeType] = useState({});
  const [dataSource, setDataSource] = useState([]);
  const [dateRange, setDateRange] = useState(dayjs().format("YYYY-MM-DD"));
  const [dateChange, setDateChange] = useState(dayjs().format("YYYY-MM-DD"));

  const [festivalModal, setFestivalModal] = useState([]);
  const [tarifTabModal, setTarifTabModal] = useState([]);
  const [incomModal, setIncomModal] = useState([]);
  const [deathtabModal, setDeathtabModal] = useState([]);
  const [balanceTotalPayModal, setBalanceTotalPayModal] = useState(false);
  const [marriagetabModal, setMarriagetabModal] = useState(false);
  const [memberjoinModal, setMemberjoinmModal] = useState(false);
  const [rentModalTab, setRentModalTab] = useState(false);
  const [expensedataModal, setExpensedataModal] = useState([]);
  const [otherexpensedataModal, setOtherExpensedataModal] = useState(false);
  const [bankLoanModal, setBankLoanModal] = useState(false);
  const [borrowIncomesModal, setBorrowIncomesModal] = useState(false);
  const [chitfundProfitModal, setChitfundProfitModal] = useState(false);
  const [bankrepayLoanModal, setBankrepayLoanModal] = useState(false);
  const [investPrincipalAmtModal, setInvestPrincipalAmtModal] = useState(false);
  const [borrowpaidAmtModal, setBorrowpaidAmtModal] = useState(false);
  const [interestCollectionModal, setInterestCollectionModal] = useState(false);
  const [chitfundModals, setChitfundModals] = useState([]);

  const [isLoadspin, setIsLoadspin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle] = useState("");
  const [modalContent] = useState(null);
  const [modelwith] = useState(0);

  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);

  const DateRangeType = [
    { label: "Custom Date Range", value: "custom_date_range" },
    { label: "Custom Date", value: "custom_date" },
  ];

  const hadleDateChoose = (value) => {
    setRangeType(value);
    form.setFieldsValue({ startend: null });
    form.setFieldsValue({ start_date: null });
  };

  const handleDateRangeChange = (dates) => setDateRange(dates);
  const handleDateChange = (dates) => setDateChange(dates);

  // Toggle an item in a list of expanded rows (by id)
  const toggleById = (list, setList, source, valueID, index) => {
    const found = source.find((item) => item.id === valueID);
    const isVisible = list?.some((item) => item?.id === found?.id);
    if (isVisible) {
      setList((prev) => prev.filter((item) => item?.id !== found?.id));
    } else {
      setList((prev) => [...prev, source[index]]);
    }
  };

  const FestivalhandleModal = (valueID, index) =>
    toggleById(festivalModal, setFestivalModal, dataSource?.Credit?.festival || [], valueID, index);

  const TariffModal = (valueID, index) =>
    toggleById(tarifTabModal, setTarifTabModal, dataSource?.Credit?.tariff || [], valueID, index);

  const IncomeModal = (valueID, index) =>
    toggleById(incomModal, setIncomModal, dataSource?.Credit?.income?.income_details || [], valueID, index);

  const ChitFundModal = (valueID, index) =>
    toggleById(chitfundModals, setChitfundModals, dataSource?.Debit?.Chit_fund_Investment || [], valueID, index);

  const DeathModal = (valueID, index) => {
    if (valueID === undefined) return;
    toggleById(deathtabModal, setDeathtabModal, dataSource?.Credit?.death || [], valueID, index);
  };

  const ExpenseeModal = (valueID, index) =>
    toggleById(expensedataModal, setExpensedataModal, dataSource?.Debit?.expense?.expense_details || [], valueID, index);

  const BankLoan = () => setBankLoanModal(!bankLoanModal);
  const BorrowIncome = () => setBorrowIncomesModal(!borrowIncomesModal);
  const ChitFundProfit = () => setChitfundProfitModal(!chitfundProfitModal);
  const InterestCollection = () => setInterestCollectionModal(!interestCollectionModal);
  const BankRepayLoan = () => setBankrepayLoanModal(!bankrepayLoanModal);
  const InterestPrincipalAmt = () => setInvestPrincipalAmtModal(!investPrincipalAmtModal);
  const BorrowpaidAmt = () => setBorrowpaidAmtModal(!borrowpaidAmtModal);
  const BalancePayModal = () => setBalanceTotalPayModal(!balanceTotalPayModal);
  const MarriageModal = () => setMarriagetabModal(!marriagetabModal);
  const MemberjoinModal = () => setMemberjoinmModal(!memberjoinModal);
  const RentModal = () => setRentModalTab(!rentModalTab);
  const OtherExpenseeModal = () => setOtherExpensedataModal(!otherexpensedataModal);

  const resetExpanded = () => {
    setDeathtabModal([]);
    setFestivalModal([]);
    setTarifTabModal([]);
    setIncomModal([]);
    setBalanceTotalPayModal(false);
    setMarriagetabModal(false);
    setMemberjoinmModal(false);
    setRentModalTab(false);
    setExpensedataModal([]);
    setOtherExpensedataModal(false);
    setChitfundModals([]);
    setInvestPrincipalAmtModal(false);
    setBankLoanModal(false);
    setBankrepayLoanModal(false);
    setBorrowIncomesModal(false);
    setChitfundProfitModal(false);
    setInterestCollectionModal(false);
    setBorrowpaidAmtModal(false);
  };

  const AddBalancesheet = async (data) => {
    setIsLoadspin(true);
    await request
      .post(APIURLS.BALANCESHEET_DATE_POST, data)
      .then(function (response) {
        setDataSource(response.data);
        setIsLoadspin(false);
        resetExpanded();
        return response.data;
      })
      .catch(function (error) {
        setIsLoadspin(false);
        return errorHandler(error);
      });
  };

  const onFinish = (value) => {
    const record = { ...value, dateRange, dateChange };
    const NewValue = {
      range_type: record?.range_type,
      start_date:
        value?.range_type === "custom_date"
          ? record?.dateChange
          : record?.dateRange?.start_date,
      end_date: value?.range_type === "custom_date" ? "" : record?.dateRange?.end_date,
    };
    AddBalancesheet(NewValue);
  };

  const CreditDetails = dataSource?.Credit;
  const DebitDetails = dataSource?.Debit;
  const BalanceDetails = dataSource?.balance;
  const openingType = dataSource?.opening_balance_type;

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const currentDate = dayjs().format("YYYY-MM-DD");

  useEffect(() => {
    if (dataSource?.total_credit_amount == 0 && dataSource?.total_debit_amount == 0) {
      toast.warn("No data added for this date.");
    }
  }, [dataSource]);

  const Arrow = ({ open, size = 25, style }) =>
    open ? (
      <MdOutlineKeyboardArrowDown fontSize={size} style={style} />
    ) : (
      <MdKeyboardArrowRight fontSize={size} style={style} />
    );

  const Divider = ({ style }) => (
    <div style={{ color: "#9898984c", borderBottom: "1px solid", ...style }} />
  );

  const BankCashLine = ({ bank, cash }) => (
    <>
      <Col span={15} md={15}>
        <Flex aligncenter={true}>
          <span className="NameHead">Bank :&nbsp;</span>
          <span> {formatIndianNumber(bank)}</span>
        </Flex>
      </Col>
      <Col span={2} md={2}>-</Col>
      <Col span={7} md={7}>
        <Flex end={true} aligncenter={true} style={{ marginRight: "10px" }}>
          <span className="NameHead">Cash:&nbsp;</span>
          <span> &nbsp;{formatIndianNumber(cash)}</span>
        </Flex>
        <Divider />
      </Col>
    </>
  );

  const TotalLine = ({ amount }) =>
    amount ? (
      <>
        <hr />
        <Flex end style={{ margin: "10px" }}>
          <h3 className="totalamt">Total : ₹&nbsp;{formatIndianNumber(amount)}</h3>
          <br />
        </Flex>
      </>
    ) : null;

  return (
    <Fragment>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={8}>
            <CustomPageTitle Heading={"Temple Balance Sheet"} />
          </Col>
          <Col span={24} md={16}>
            <Button.Secondary
              text={"Print"}
              icon={<IoPrint />}
              style={{ float: "right" }}
              onClick={handlePrint}
            />
          </Col>
        </CustomRow>
        <br />

        <Form
          name="balancesheet"
          form={form}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          onFinish={onFinish}
          autoComplete="off"
        >
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
                  {isLoadspin ? (
                    <Spin style={{ marginTop: "15px" }} />
                  ) : (
                    <Button.Danger text={"Submit"} htmlType={"submit"} />
                  )}
                </Flex>
              )}
            </Col>
          </CustomRow>
        </Form>
        <br />

        <PrintHolder ref={componentRef}>
          <PrintShowData className="PrintShowDatadd">
            <CommonManagePrintName />
            <h3 style={{ textAlign: "center" }}>Temple Balance Sheet</h3>
            <br />
            <Flex spacebetween={true} aligncenter={true}>
              <div>
                <h5>
                  <span>Date Type</span> :{" "}
                  {dataSource?.name === "custom_date_range" ? "Custom Date Range" : "Custom Date"}
                </h5>
                <h5>
                  <span>Start Date</span> : {dataSource?.start_date}
                </h5>
                {dataSource && dataSource?.end_date ? (
                  <h5>
                    <span>End Date</span> : {dataSource?.end_date}
                  </h5>
                ) : null}
              </div>
              <div>
                <h5 style={{ marginRight: "10px" }}>
                  <span>Print Date</span> : {currentDate}
                </h5>
              </div>
            </Flex>
          </PrintShowData>

          <DesignT style={{ border: "2px solid #C2C1C1" }}>
            <CustomRow className="BorderAP">
              {/* ============================ CREDIT ============================ */}
              <Col span={24} md={12} className="BorderRi">
                <h4>Credit</h4>

                <OpeningLines details={CreditDetails} openingType={openingType} />

                {CreditDetails && CreditDetails.member_joining ? (
                  <>
                    <CustomRow space={[24, 24]}>
                      <Col span={15} md={15} onClick={MemberjoinModal}>
                        <Flex>
                          <h2>Member Joining</h2>
                          <Arrow open={memberjoinModal} />
                        </Flex>
                      </Col>
                      <Col span={2} md={2}>-</Col>
                      <Col span={7} md={7} onClick={MemberjoinModal}>
                        <Tooltip placement="topLeft" title={"Total Amount"}>
                          <Flex end={true} aligncenter={true} style={{ marginRight: "10px" }}>
                            <span>{formatIndianNumber(CreditDetails?.member_joining?.total_amount)}</span>
                          </Flex>
                        </Tooltip>
                        <Divider />
                      </Col>
                      {memberjoinModal ? (
                        <Col span={24} md={24} className="Showtransin">
                          <MemberJoiningView record={dataSource} />
                        </Col>
                      ) : null}
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {CreditDetails && CreditDetails.marriage ? (
                  <>
                    <CustomRow space={[24, 24]}>
                      <Col span={15} md={15} onClick={MarriageModal}>
                        <Flex>
                          <h2>Marriage</h2>
                          <Arrow open={marriagetabModal} style={{ marginTop: "3px" }} />
                        </Flex>
                      </Col>
                      <Col span={2} md={2}>-</Col>
                      <Col span={7} md={7} onClick={MarriageModal}>
                        <Flex end style={{ marginRight: "10px" }}>
                          <Tooltip placement="topLeft" title={"Amount"}>
                            <span>{formatIndianNumber(CreditDetails?.marriage?.amount)}</span>
                          </Tooltip>
                        </Flex>
                        <Divider />
                      </Col>
                      {marriagetabModal ? (
                        <>
                          <BankCashLine
                            bank={CreditDetails.marriage?.bank_amount}
                            cash={CreditDetails.marriage?.cash_amount}
                          />
                          <Col span={24} md={24} className="Showtransin">
                            <MarriageMemberView record={dataSource} />
                          </Col>
                        </>
                      ) : null}
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {CreditDetails && CreditDetails.income ? (
                  <>
                    <CustomRow space={[24, 12]}>
                      <Col span={24} md={24}>
                        <Flex><h2>Income</h2></Flex>
                      </Col>
                      <Col span={24} md={24}>
                        {CreditDetails?.income?.income_details?.map((item, index) => (
                          <Flex
                            gap={"10px"}
                            aligncenter={true}
                            style={{ margin: "6px 0" }}
                            key={index}
                            onClick={() => IncomeModal(item?.id, index)}
                          >
                            <div style={{ width: "5%" }}>
                              <span>{index + 1}&nbsp;.</span>&nbsp;
                            </div>
                            <div style={{ width: "70%" }}>
                              <Tooltip placement="topLeft" title={"Income"}>
                                <span className="NameHead">{item.name}</span>
                              </Tooltip>
                              <Arrow
                                open={incomModal.some((ite) => ite?.id === item.id)}
                                size={22}
                                style={{ margin: "-8px 0px" }}
                              />
                            </div>
                            <Flex style={{ margin: "15px 0" }}>-</Flex>
                            <Flex end={true} style={{ margin: "10px", width: "25%" }}>
                              <Tooltip placement="topRight" title={"Income Amount"}>
                                {formatIndianNumber(item.amount)}
                              </Tooltip>
                            </Flex>
                          </Flex>
                        ))}
                      </Col>
                      <BankCashLine
                        bank={CreditDetails.income?.bank_amount}
                        cash={CreditDetails.income?.cash_amount}
                      />
                      <Col span={24} md={24}>
                        <IncomeMemberView incomModal={incomModal} />
                      </Col>
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {CreditDetails && CreditDetails.festival ? (
                  <>
                    <CustomRow space={[24, 10]}>
                      <Col span={24} md={24}>
                        <Flex><h2>Festival</h2></Flex>
                      </Col>
                      <Col span={24} md={24}>
                        {CreditDetails?.festival?.map((item, index) => (
                          <Flex
                            gap={"10px"}
                            aligncenter={true}
                            style={{ margin: "6px 0" }}
                            key={index}
                            onClick={() => FestivalhandleModal(item?.id, index)}
                          >
                            <div style={{ width: "5%" }}>
                              <span>{index + 1}&nbsp;.</span>&nbsp;
                            </div>
                            <div style={{ width: "70%" }}>
                              <Tooltip placement="topLeft" title={"Festival"}>
                                <span className="NameHead">{item.name}</span>&nbsp;
                                <span className="NameHeadcount">
                                  ({item.member_count} × {item.amount})
                                </span>
                              </Tooltip>
                              <Arrow
                                open={festivalModal.some((ite) => ite?.id === item.id)}
                                size={22}
                                style={{ margin: "-8px 0px" }}
                              />
                            </div>
                            <Flex style={{ margin: "15px 0" }}>-</Flex>
                            <Flex end={true} style={{ margin: "10px", width: "25%" }}>
                              <Tooltip placement="topRight" title={"Total"}>
                                {formatIndianNumber(item.total_amount)}
                              </Tooltip>
                            </Flex>
                          </Flex>
                        ))}
                      </Col>
                      <Col span={24} md={24} className="Showtransin">
                        <FestivalMemberView festivalDataModal={festivalModal} />
                      </Col>
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {CreditDetails && CreditDetails.tariff ? (
                  <>
                    <CustomRow space={[24, 10]}>
                      <Col span={24} md={24}><h2>Tariff</h2></Col>
                      <Col span={24} md={24}>
                        {CreditDetails?.tariff?.map((item, index) => (
                          <Flex
                            gap={"10px"}
                            aligncenter={true}
                            style={{ margin: "6px 0" }}
                            key={index}
                            onClick={() => TariffModal(item?.id, index)}
                          >
                            <div style={{ width: "5%" }}>
                              <span>{index + 1}&nbsp;.</span>&nbsp;
                            </div>
                            <div style={{ width: "70%" }}>
                              <Tooltip placement="topLeft" title={"Tariff"}>
                                <span className="NameHead">{item.name}</span>&nbsp;
                                <span className="NameHeadcount">({item.member_count})</span>
                              </Tooltip>
                              <Arrow
                                open={tarifTabModal.some((ite) => ite?.id === item.id)}
                                size={22}
                                style={{ margin: "-8px 0px" }}
                              />
                            </div>
                            <Flex style={{ margin: "15px 0" }}>-</Flex>
                            <Flex end={true} style={{ margin: "10px", width: "25%" }}>
                              <Tooltip placement="topRight" title={"Total"}>
                                {formatIndianNumber(item.total_amount)}
                              </Tooltip>
                            </Flex>
                          </Flex>
                        ))}
                        <Divider />
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
                      <Col span={24} md={24}>
                        <Flex><h2>Death</h2></Flex>
                      </Col>
                      <Col span={24} md={24}>
                        {CreditDetails?.death?.map((item, index) => (
                          <Flex
                            gap={"10px"}
                            aligncenter={true}
                            style={{ margin: "6px 0" }}
                            key={index}
                            onClick={() => DeathModal(item?.id, index)}
                          >
                            <div style={{ width: "5%" }}>
                              <span>{index + 1}&nbsp;.</span>&nbsp;
                            </div>
                            <div style={{ width: "70%" }}>
                              <Tooltip placement="topLeft" title={"Member details"}>
                                <span className="NameHead">{item.name}</span>&nbsp;
                                <span className="NameHeadcount">
                                  ({item.member_count} × {item.amount})
                                </span>
                              </Tooltip>
                              <Arrow
                                open={deathtabModal.some((ite) => ite?.id === item.id)}
                                size={22}
                                style={{ margin: "-8px 0px" }}
                              />
                            </div>
                            <Flex style={{ margin: "15px 0" }}>-</Flex>
                            <Flex end={true} style={{ margin: "10px", width: "25%" }}>
                              <Tooltip placement="topRight" title={"Total"}>
                                {formatIndianNumber(item.total_amount)}
                              </Tooltip>
                            </Flex>
                          </Flex>
                        ))}
                        <Divider />
                      </Col>
                      <Col span={24} md={24} className="Showtransin">
                        <DeathMemberView recordfind={dataSource} deathtabModal={deathtabModal} />
                      </Col>
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {CreditDetails && CreditDetails.other_incomes ? (
                  <>
                    <CustomRow space={[24, 10]}>
                      <Col span={24} md={24} onClick={RentModal}>
                        <Flex><h2>Rent</h2></Flex>
                      </Col>
                      <BankCashLine
                        bank={CreditDetails.other_incomes?.bank_amount}
                        cash={CreditDetails.other_incomes?.cash_amount}
                      />
                      <Col span={24} md={24} className="Showtransin">
                        <RentLeaseMemberView record={dataSource} />
                      </Col>
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {BalanceDetails ? (
                  <>
                    <CustomRow space={[24, 10]}>
                      <Col span={24} md={24} onClick={BalancePayModal}>
                        <Flex>
                          <h3>Balance Payment</h3>
                          <Arrow open={balanceTotalPayModal} style={{ marginTop: "-3px" }} />
                        </Flex>
                      </Col>
                      <Col span={15} md={15} onClick={BalancePayModal}>
                        <Flex aligncenter>
                          <span className="NameHead">{BalanceDetails.name}</span>
                        </Flex>
                      </Col>
                      <Col span={2} md={2}>-</Col>
                      <Col span={7} md={7}>
                        <Flex end>
                          <Tooltip placement="topRight" title={"Total"}>
                            {formatIndianNumber(BalanceDetails.amount)}
                          </Tooltip>
                        </Flex>
                        <Divider />
                      </Col>
                      {balanceTotalPayModal ? (
                        <>
                          <Col span={24} md={24} className="Showtransin">
                            <BalancePaymentMemberView record={dataSource} />
                          </Col>
                          <BankCashLine
                            bank={BalanceDetails?.bank_amount}
                            cash={BalanceDetails?.cash_amount}
                          />
                        </>
                      ) : null}
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {CreditDetails && CreditDetails.loan_income?.bank_details ? (
                  <>
                    <br />
                    <CustomRow space={[24, 12]}>
                      <Col span={15} md={15} onClick={BankLoan}>
                        <Flex aligncenter={true}>
                          <h2 style={{ cursor: "pointer" }}>Bank Loan</h2>
                          <Arrow open={bankLoanModal} />
                        </Flex>
                      </Col>
                      <Col span={2} md={2}>-</Col>
                      <Col span={7} md={7}>
                        <Flex end={true} style={{ marginRight: "10px" }}>
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
                      <Col span={15} md={15} onClick={BorrowIncome}>
                        <Flex aligncenter={true}>
                          <h2 style={{ cursor: "pointer" }}>Borrow Income</h2>
                          <Arrow open={borrowIncomesModal} />
                        </Flex>
                      </Col>
                      <Col span={2} md={2}>-</Col>
                      <Col span={7} md={7}>
                        <Flex end={true} style={{ marginRight: "10px" }}>
                          <span>{formatIndianNumber(CreditDetails?.borrow_income?.total_amount)}</span>
                        </Flex>
                      </Col>
                      <Col span={24} md={24}>
                        {borrowIncomesModal ? <BorrowIncmView borrowIncomesDetails={dataSource} /> : null}
                      </Col>
                    </CustomRow>
                  </>
                ) : null}

                {CreditDetails && CreditDetails.Fund ? (
                  <>
                    <CustomRow space={[24, 12]}>
                      <Col span={24} md={24}>
                        <Flex><h2>Fund</h2></Flex>
                      </Col>
                      <Col span={24} md={24}>
                        {CreditDetails?.Fund?.map((item, index) => (
                          <Flex gap={"10px"} aligncenter={true} style={{ margin: "6px 0" }} key={index}>
                            <div style={{ width: "5%" }}>
                              <span>{index + 1}&nbsp;.</span>&nbsp;
                            </div>
                            <div style={{ width: "70%" }}>
                              <Tooltip placement="topLeft" title={"Fund"}>
                                <span className="NameHead">{item?.fund_name}</span>
                              </Tooltip>
                            </div>
                            <Flex style={{ margin: "15px 0" }}>-</Flex>
                            <Flex end={true} style={{ margin: "10px", width: "25%" }}>
                              <Tooltip placement="topRight" title={"Total"}>
                                {formatIndianNumber(item?.amount)}
                              </Tooltip>
                            </Flex>
                          </Flex>
                        ))}
                      </Col>
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {CreditDetails && CreditDetails.Chit_fund_Profit ? (
                  <>
                    <br />
                    <CustomRow space={[24, 12]}>
                      <Col span={15} md={15} onClick={ChitFundProfit}>
                        <Flex aligncenter={true}>
                          <h2 style={{ cursor: "pointer" }}>Chit Fund Profit</h2>
                          <Arrow open={chitfundProfitModal} />
                        </Flex>
                      </Col>
                      <Col span={2} md={2}>-</Col>
                      <Col span={7} md={7}>
                        <Flex end={true} style={{ marginRight: "10px" }}>
                          <span>{formatIndianNumber(CreditDetails?.Chit_fund_Profit?.total_amount)}</span>
                        </Flex>
                      </Col>
                      <Col span={24} md={24}>
                        {chitfundProfitModal ? (
                          <ChitfundProfitView chitfundProfitdetails={dataSource} />
                        ) : null}
                      </Col>
                    </CustomRow>
                  </>
                ) : null}

                {CreditDetails && CreditDetails.Interest_Collection ? (
                  <>
                    <br />
                    <CustomRow space={[24, 12]}>
                      <Col span={15} md={15} onClick={InterestCollection}>
                        <Flex aligncenter={true}>
                          <h2 style={{ cursor: "pointer" }}>Interest Collection</h2>
                          <Arrow open={interestCollectionModal} />
                        </Flex>
                      </Col>
                      <Col span={2} md={2}>-</Col>
                      <Col span={7} md={7}>
                        <Flex end={true} style={{ marginRight: "10px" }}>
                          <span>{formatIndianNumber(CreditDetails?.Interest_Collection?.total_amount)}</span>
                        </Flex>
                      </Col>
                      <Col span={24} md={24}>
                        {interestCollectionModal ? (
                          <InterestCollectionTable
                            details={CreditDetails?.Interest_Collection?.details || []}
                          />
                        ) : null}
                      </Col>
                    </CustomRow>
                  </>
                ) : null}

                <div className="mobileresponsbalane">
                  <CustomRow space={[24, 24]}>
                    <Col span={24} md={12}></Col>
                    <Col span={24} md={12}>
                      <TotalLine amount={dataSource?.total_credit_amount} />
                    </Col>
                  </CustomRow>
                </div>
              </Col>

              {/* ============================ DEBIT ============================ */}
              <Col span={24} md={12} className="BorderLe">
                <h4>Debit</h4>

                <OpeningLines details={DebitDetails} openingType={openingType} />

                {DebitDetails && DebitDetails.expense ? (
                  <>
                    <CustomRow space={[24, 12]}>
                      <Col span={24} md={24}>
                        <Flex><h2>Expense</h2></Flex>
                      </Col>
                      <Col span={24} md={24}>
                        {DebitDetails?.expense?.expense_details?.map((item, index) => (
                          <Flex
                            gap={"10px"}
                            aligncenter={true}
                            style={{ margin: "6px 0" }}
                            key={index}
                            onClick={() => ExpenseeModal(item?.id, index)}
                          >
                            <div style={{ width: "5%" }}>
                              <span>{index + 1}&nbsp;.</span>&nbsp;
                            </div>
                            <div style={{ width: "70%" }}>
                              <Tooltip placement="topLeft" title={"Expense"}>
                                <span className="NameHead">{item.name}</span>
                              </Tooltip>
                              <Arrow
                                open={expensedataModal.some((ite) => ite?.id === item.id)}
                                size={22}
                                style={{ margin: "-8px 0px" }}
                              />
                            </div>
                            <Flex style={{ margin: "15px 0" }}>-</Flex>
                            <Flex end={true} style={{ margin: "10px", width: "25%" }}>
                              <Tooltip placement="topRight" title={"Expense Amount"}>
                                {formatIndianNumber(item.amount)}
                              </Tooltip>
                            </Flex>
                          </Flex>
                        ))}
                      </Col>
                      <BankCashLine
                        bank={DebitDetails.expense?.bank_amount}
                        cash={DebitDetails.expense?.cash_amount}
                      />
                      <Col span={24} md={24} className="Showtransin">
                        <ExpenseMemberView expensedataModal={expensedataModal} />
                      </Col>
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {DebitDetails && DebitDetails.other_expense ? (
                  <>
                    <CustomRow space={[24, 10]}>
                      <Col span={24} md={24} onClick={OtherExpenseeModal}>
                        <Flex>
                          <h2>Settlement Amount</h2>
                          <Arrow open={otherexpensedataModal} />
                        </Flex>
                      </Col>
                      <BankCashLine
                        bank={DebitDetails.other_expense?.bank_amount}
                        cash={DebitDetails.other_expense?.cash_amount}
                      />
                      {otherexpensedataModal ? (
                        <Col span={24} md={24} className="Showtransin">
                          <OtherExpenseMemberView record={dataSource} />
                        </Col>
                      ) : null}
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {DebitDetails && DebitDetails.loan_repayment ? (
                  <>
                    <CustomRow space={[12, 12]}>
                      <Col span={15} md={15} onClick={BankRepayLoan}>
                        <Flex aligncenter={true}>
                          <h2 style={{ cursor: "pointer" }}>Bank Loan Pay</h2>
                          <Arrow open={bankrepayLoanModal} />
                        </Flex>
                      </Col>
                      <Col span={2} md={2}>-</Col>
                      <Col span={7} md={7}>
                        <Flex end={true} style={{ marginRight: "10px" }}>
                          <span>{formatIndianNumber(DebitDetails?.loan_repayment?.total_amount)}</span>
                        </Flex>
                        <Divider />
                      </Col>
                      <Col span={24} md={24}>
                        {bankrepayLoanModal ? <BankrepayLoanView bankloannModal={dataSource} /> : null}
                      </Col>
                    </CustomRow>
                  </>
                ) : null}

                {DebitDetails && DebitDetails.Chit_fund_Investment ? (
                  <>
                    <CustomRow space={[24, 12]}>
                      <Col span={24} md={24}>
                        <Flex><h2>Chit Fund Investment</h2></Flex>
                      </Col>
                      <Col span={24} md={24}>
                        {DebitDetails?.Chit_fund_Investment?.map((item, index) => (
                          <Flex
                            gap={"10px"}
                            aligncenter={true}
                            style={{ margin: "6px 0" }}
                            key={index}
                            onClick={() => ChitFundModal(item?.id, index)}
                          >
                            <div style={{ width: "5%" }}>
                              <span>{index + 1}&nbsp;.</span>&nbsp;
                            </div>
                            <div style={{ width: "70%" }}>
                              <Tooltip placement="topLeft" title={"Chit-Fund"}>
                                <span className="NameHead">{item.chitfund_name}</span>
                              </Tooltip>
                              <Arrow
                                open={chitfundModals.some((ite) => ite?.id === item.id)}
                                size={22}
                                style={{ margin: "-8px 0px" }}
                              />
                            </div>
                            <Flex style={{ margin: "15px 0" }}>-</Flex>
                            <Flex end={true} style={{ margin: "10px", width: "25%" }}>
                              <Tooltip placement="topRight" title={"Total"}>
                                {formatIndianNumber(item.total_amount)}
                              </Tooltip>
                            </Flex>
                          </Flex>
                        ))}
                      </Col>
                      <Col span={24} md={24}>
                        {chitfundModals ? <ChitfundTabView chitfundModals={chitfundModals} /> : null}
                      </Col>
                    </CustomRow>
                    <br />
                  </>
                ) : null}

                {DebitDetails && DebitDetails.Interest_Principal_amount ? (
                  <>
                    <br />
                    <CustomRow space={[12, 12]}>
                      <Col span={15} md={15} onClick={InterestPrincipalAmt}>
                        <Flex aligncenter={true}>
                          <h2 style={{ cursor: "pointer" }}>Interest Principal Amt</h2>
                          <Arrow open={investPrincipalAmtModal} />
                        </Flex>
                      </Col>
                      <Col span={2} md={2}>-</Col>
                      <Col span={7} md={7}>
                        <Flex end={true} style={{ marginRight: "10px" }}>
                          <span>{formatIndianNumber(DebitDetails.Interest_Principal_amount?.total_amount)}</span>
                        </Flex>
                        <Divider style={{ marginTop: "3px" }} />
                      </Col>
                      <Col span={24} md={24}>
                        {investPrincipalAmtModal ? <InterestPrincipalView InterPrincipalModal={dataSource} /> : null}
                      </Col>
                    </CustomRow>
                  </>
                ) : null}

                {DebitDetails && DebitDetails.borrowpaid_amount ? (
                  <>
                    <br />
                    <CustomRow space={[12, 12]}>
                      <Col span={15} md={15} onClick={BorrowpaidAmt}>
                        <Flex aligncenter={true}>
                          <h2 style={{ cursor: "pointer" }}>Borrow Paid Amt</h2>
                          <Arrow open={borrowpaidAmtModal} />
                        </Flex>
                      </Col>
                      <Col span={2} md={2}>-</Col>
                      <Col span={7} md={7}>
                        <Flex end={true} style={{ marginRight: "10px" }}>
                          <span>{formatIndianNumber(DebitDetails.borrowpaid_amount?.total_amount)}</span>
                        </Flex>
                        <Divider style={{ marginTop: "3px" }} />
                      </Col>
                      <Col span={24} md={24}>
                        {borrowpaidAmtModal ? <BorrowPaidView datas={DebitDetails} /> : null}
                      </Col>
                    </CustomRow>
                  </>
                ) : null}

                <div className="mobileresponsbalane">
                  <CustomRow space={[24, 24]}>
                    <Col span={24} md={12}></Col>
                    <Col span={24} md={12}>
                      <TotalLine amount={dataSource?.total_debit_amount} />
                    </Col>
                  </CustomRow>
                </div>
              </Col>
            </CustomRow>

            {/* ===================== Totals (desktop) ===================== */}
            <div className="webrespons">
              <CustomRow className="BorderAP">
                <Col span={24} md={12} className="BorderRi">
                  <CustomRow space={[24, 24]}>
                    <Col span={24} md={12}></Col>
                    <Col span={24} md={12}>
                      <TotalLine amount={dataSource?.total_credit_amount} />
                    </Col>
                  </CustomRow>
                </Col>
                <Col span={24} md={12} className="BorderLe">
                  <CustomRow space={[24, 12]}>
                    <Col span={24} md={12}></Col>
                    <Col span={24} md={12}>
                      <TotalLine amount={dataSource?.total_debit_amount} />
                    </Col>
                  </CustomRow>
                </Col>
              </CustomRow>
            </div>

            {/* ===================== Footer: loans / cash / bank ===================== */}
            <div style={{ borderTop: "2px solid #c2c1c1" }}>
              <CustomRow space={[12, 12]}>
                <Col span={24} md={12}>
                  {dataSource && dataSource.loan_details_bottom ? (
                    <div className="footerbalance">
                      Loan Pending amount : ₹{" "}
                      {formatIndianNumber(dataSource.loan_details_bottom?.loan_pending_amount)}
                    </div>
                  ) : null}
                  {dataSource && dataSource.borrow_details_bottom ? (
                    <div className="footerbalance">
                      Borrow amount : ₹{" "}
                      {formatIndianNumber(dataSource.borrow_details_bottom?.borrow_amount)}
                    </div>
                  ) : null}
                </Col>
                <Col span={24} md={12}>
                  {dataSource?.balance_amount >= 0 && (
                    <div className="footerstyle">
                      <h6>
                        Cash In Hand :{" "}
                        <span>₹ {formatIndianNumber(dataSource?.overall_cash_amount)}&nbsp;</span>
                        {dataSource?.balance_type === "Credit" && (
                          <span style={{ color: "green" }}>
                            <Tooltip title={"Credit"}>(Cr)</Tooltip>
                          </span>
                        )}{" "}
                        {dataSource?.balance_type === "Debit" && (
                          <span style={{ color: "red" }}>
                            <Tooltip title={"Debit"}>(Dr)</Tooltip>
                          </span>
                        )}
                      </h6>
                      <h6>
                        Bank : <span>₹ {formatIndianNumber(dataSource?.overall_bank_amount)}</span>
                      </h6>
                    </div>
                  )}
                </Col>
              </CustomRow>
            </div>
          </DesignT>
        </PrintHolder>
      </CustomCardView>

      <CustomModal
        isVisible={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        width={modelwith}
        modalTitle={modalTitle}
        modalContent={modalContent}
      />
    </Fragment>
  );
};

export default BalanceSheet;

// ============================================================================
// Styles
// ============================================================================

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
  }
  @media print {
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
    }

    @media (orientation: landscape) {
      .webrespons {
        visibility: visible !important;
      }
      .mobileresponsbalane {
        display: none !important;
      }
    }

    width: 100%;
    margin: auto;
  }
`;

const PrintShowData = styled.div`
  display: none;
`;

const TableHolder = styled.div`
  margin: 8px 0 12px;
  & .ant-table-thead > tr > th {
    font-weight: 700;
    font-size: 14px;
  }
  & .ant-table-tbody > tr > td,
  & .ant-table-tbody > tr > td span {
    font-size: 14px;
    cursor: default;
  }
`;

const DesignT = styled.div`
  & h2 {
    cursor: pointer;
    font-family: system-ui;
    font-weight: 700;
    font-size: 18px;
  }
  & h4 {
    margin-bottom: 20px;
    font-size: 20px;
    color: white;
    cursor: pointer;
    background: #990000;
    padding: 15px;
    text-align: center;
  }
  .totalamt {
    text-align: center;
  }
  .styletext {
    font-size: 18px;
    margin-top: 5px;
  }
  & span {
    cursor: pointer;
    font-size: 18px;
  }
  .BorderAP {
    border: 1px solid #c2c1c1 !important;
  }
  .BorderRi {
    border-right: 1px solid #c2c1c1;
  }
  .BorderLe {
    border-left: 1px solid #c2c1c1;
  }
  .mobileresponsbalane {
    visibility: hidden;
  }
  .Showtransin {
    transition: all 9s;
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
  }
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
  }

  .RentStyle {
    display: flex;
    gap: 20px;
    margin-top: -5px;
    @media screen and (max-width: 1179px) {
      flex-wrap: wrap;
      gap: 0px;
    }
  }
  .AlgnEnd {
    text-align: end;
  }
  .NameHead {
    color: #dd0606;
    font-size: 15px;
    font-weight: 700;
  }
  .NameHeadcount {
    color: #010101;
    font-size: 15px;
    font-weight: 700;
  }
`;