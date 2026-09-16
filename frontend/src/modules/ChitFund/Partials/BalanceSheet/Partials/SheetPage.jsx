import { Button, CustomDatePicker, CustomDateRangePicker, CustomSelect } from '@components/form'
import { CustomRow, Flex } from '@components/others'
import { APIURLS } from '@request/apiUrls/urls'
import errorHandler from '@request/errorHandler'
import request from '@request/request'
import { Col, Form, Spin, Tooltip } from 'antd'
import dayjs from 'dayjs'
import React, { Fragment, useRef, useState } from 'react'
import { MdKeyboardArrowRight, MdOutlineKeyboardArrowDown } from 'react-icons/md'
import styled from 'styled-components'
import { CFProfitDistributionView, ChitfundInterestGivenView, ChitfundInvesView, ChitFundExpenseView, FromCollectionView } from './SheetView'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { IoPrint } from 'react-icons/io5'
import { useReactToPrint } from 'react-to-print'
import { CommonManagePrintName } from '@modules/ComManagePrintDetails/CommonManagePrint'

export const SheetPage = () => {

    const [form] = Form.useForm();
    const componentRef = useRef();

    const [isLoadspin, setIsLoadspin] = useState(false);
    const [rangeType, setRangeType] = useState({});
    const [dataSource, setDataSource] = useState([]);
    const [dateRange, setDateRange] = useState(dayjs().format("YYYY-MM-DD"));
    const [dateChange, setDateChange] = useState(dayjs().format("YYYY-MM-DD"));

    const [chitfundInvestmant, setChitfundInvestmant] = useState([]);
    const [interestGivenModal, setInterestGivenModal] = useState(false);  // ------ Used Interest Given Modal
    const [profitDistritnModal, setProfitDistritnModal] = useState(false);  // ------Used Profit Distribution Modal
    // Feb 2026 owner rule: expand/collapse toggle for the new "Chit
    // Fund Expense" row in the Debit column.
    const [chitFundExpenseModal, setChitFundExpenseModal] = useState(false);
    const [fromCollectionModal, setFromCollectionModal] = useState(false); // ------Used From CollectionModal Modal

    const CreditDetails = dataSource?.Credit;
    const DebitDetails = dataSource?.Debit;

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

    const ChitFundInvestmentModal = (valueID, index) => {
        const CreditDetails = dataSource?.Credit?.Chit_fund_Investment || [];
        const FilterIncomeData = CreditDetails.find(item => item.id === valueID);

        const isVisible = chitfundInvestmant?.some(item => item?.id === FilterIncomeData?.id);
        if (isVisible) {
            setChitfundInvestmant(prevValue => prevValue.filter(item => item?.id !== FilterIncomeData?.id));

        } else {
            setChitfundInvestmant(prevValue => [...prevValue, CreditDetails[index]]);
        }
    };

    const ChitFundInterestGiven = () => {
        setInterestGivenModal(!interestGivenModal)
    };

    const ChitFundProfitDistri = () => {
        setProfitDistritnModal(!profitDistritnModal)
    }
    const ChitFundExpenseToggle = () => {
        setChitFundExpenseModal(!chitFundExpenseModal)
    };

    const FromCollectionFunctn = () => {
        setFromCollectionModal(!fromCollectionModal)
    };

    //-------- Post Url  ----------
    const AddBalancesheet = async (data) => {
        setIsLoadspin(true)
        await request.post(APIURLS.BALANCESHEET_CHIT_FUND_POST, data)
            .then(function (response) {
                setDataSource(response.data);
                setIsLoadspin(false)
                setChitfundInvestmant([])
                setInterestGivenModal(false)
                setProfitDistritnModal(false)
                setFromCollectionModal(false)
                console.log(response.data, 'response.data');
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

    const formatIndianNumber = (number) => {
        let strNumber = number?.toString();

        // Check for decimal in the number
        let decimalPart = '';
        if (strNumber.includes('.')) {
            [strNumber, decimalPart] = strNumber.split('.');
            decimalPart = '.' + decimalPart; // prepend '.' to keep the decimal part
        }
        const length = strNumber?.length;
        if (length <= 3) {
            return strNumber + decimalPart;
        }
        const lastThreeDigits = strNumber?.substring(length - 3);
        const mainPart = strNumber?.substring(0, length - 3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
        return `${mainPart},${lastThreeDigits}${decimalPart}`;
    };

    const currentDate = dayjs().format('YYYY-MM-DD');

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });


    return (
        <Fragment>
            <Form
                name="chitfundbalancesheet"
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
                        <CustomPageTitle Heading={"Chit Fund Balance Sheet"} />
                    </Col>
                    <Col span={24} md={16}>
                        <Button.Secondary text={"Print"} icon={<IoPrint />}
                            style={{ float: "right" }}
                            onClick={handlePrint} />
                    </Col>
                </CustomRow>


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

            {/* --------------  Balance details ---------- */}

            <PrintHolder ref={componentRef}>
                <PrintShowData className="PrintShowDatadd">
                    <CommonManagePrintName />
                    <h3 style={{ textAlign: 'center' }}>Chit Fund Balance Sheet</h3><br />
                    <Flex spacebetween={true} aligncenter={true}>
                        <div>
                            <h5><span>Date Type</span> : {dataSource?.name === 'custom_date_range' ? 'Custom Date Range' : 'Custom Date'}</h5>
                            <br />
                            <h5><span>Start Date</span> : {dataSource?.start_date} </h5>
                            {dataSource && dataSource?.end_date ?
                                <h5><span>End Date</span> : {dataSource?.end_date} </h5>
                                : null}
                        </div>
                        <div>
                            <h5 style={{ marginRight: '10px' }}><span>Print Date</span> : {currentDate} </h5>
                        </div>
                    </Flex> <br />
                </PrintShowData>
                <ChitSheetStyle>
                    <CustomRow>
                        <Col span={24} md={12} className='RightLi'>
                            <div className='Titleshow'>Credit</div>
                            <div className='BodeyContent'>

                                {CreditDetails && "opening_balance" in CreditDetails ? (
                                    <Flex spacebetween={true} margin={'20px 5px'} >
                                        <div className='flexClass'>
                                            <h3 className='NameHead'>Opening Balance</h3>
                                        </div>
                                        <div className='NameHead'>{formatIndianNumber(CreditDetails?.opening_balance)} </div>
                                    </Flex>
                                ) : null}

                                {CreditDetails && CreditDetails.Chit_fund_Investment ? (
                                    <>
                                        <h3 className='NameHead' style={{ marginTop: '10px' }}>Chit Fund Investment</h3>
                                        <Flex spacebetween={true} margin={'10px 5px'}>
                                            <div>
                                                {CreditDetails?.Chit_fund_Investment?.map((item, index) => (
                                                    <Flex aligncenter={true} style={{ margin: '10px 0' }} key={index}
                                                        onClick={() => ChitFundInvestmentModal(item?.id, index)} >
                                                        <span className="NameHead">{index + 1} .&nbsp;</span>&nbsp;
                                                        <span className="NameHeadclr">{item.chitfund_name}</span>
                                                        {chitfundInvestmant.some(ite => ite?.id === item.id) ?
                                                            <MdOutlineKeyboardArrowDown fontSize={22} /> :
                                                            <MdKeyboardArrowRight fontSize={22} />
                                                        }

                                                        {CreditDetails.Chit_fund_Investment.length > 1 &&
                                                            index !== CreditDetails.Chit_fund_Investment.length - 1 && (
                                                                ''
                                                            )}
                                                    </Flex>
                                                ))}
                                            </div>
                                            <div>
                                                {CreditDetails?.Chit_fund_Investment?.map((item, index) => (
                                                    <Flex style={{ margin: '15px 0' }} key={index}>
                                                        -
                                                        {CreditDetails.Chit_fund_Investment.length > 1 &&
                                                            index !== CreditDetails.Chit_fund_Investment.length - 1 && (
                                                                '')}
                                                    </Flex>
                                                ))}
                                            </div>
                                            <div>
                                                {CreditDetails?.Chit_fund_Investment?.map((item, index) => (
                                                    <Flex end={true} style={{ margin: '10px 5px' }} key={index}>
                                                        <Tooltip placement="topRight" title={"Total"} className="NameHead">
                                                            {formatIndianNumber(item.total_amount)}
                                                        </Tooltip>
                                                        {CreditDetails.Chit_fund_Investment.length > 1 &&
                                                            index !== CreditDetails.Chit_fund_Investment.length - 1 && (
                                                                ''
                                                            )}
                                                    </Flex>
                                                ))}
                                                <div style={{ color: '#9898984c', borderBottom: '1px solid' }} />

                                            </div>
                                        </Flex>
                                        <div>
                                            {chitfundInvestmant ?
                                                <ChitfundInvesView datas={chitfundInvestmant} /> : null}
                                        </div>
                                    </>
                                ) : null}

                                {CreditDetails && CreditDetails.From_Collection ? (
                                    <>
                                        <Flex spacebetween={true} margin={'20px 5px'} onClick={() => FromCollectionFunctn()}>
                                            <div className='flexClass'>
                                                <h3 className='NameHead'>From Collection</h3>
                                                {fromCollectionModal ? <MdOutlineKeyboardArrowDown fontSize={22} /> : <MdKeyboardArrowRight fontSize={22} />}
                                            </div>
                                            <div className='NameHead'>{formatIndianNumber(CreditDetails.From_Collection?.total_amount)} </div>
                                        </Flex>
                                        {fromCollectionModal ?
                                            <FromCollectionView datas={CreditDetails} /> : null
                                        }
                                    </>
                                ) : null}

                                {dataSource && dataSource.total_credit_amount ?
                                    <div className='NameHead mobileresponsive'>
                                        <Flex end={true}><hr style={{ width: '50%' }} /></Flex>
                                        <Flex end={true} margin={'10px'}>Total : ₹&nbsp;{formatIndianNumber(dataSource?.total_credit_amount)}</Flex></div>
                                    : null}

                            </div>

                        </Col>

                        <Col span={24} md={12} className='LeftLi'>
                            <div className='Titleshow'>Debit</div>
                            <div className='BodeyContent'>

                                {DebitDetails && "opening_balance" in DebitDetails ? (
                                    <Flex spacebetween={true} margin={'20px 5px'} >
                                        <div className='flexClass'>
                                            <h3 className='NameHead'>Opening Balance</h3>
                                        </div>
                                        <div className='NameHead'>{formatIndianNumber(DebitDetails?.opening_balance)} </div>
                                    </Flex>
                                ) : null}

                                {DebitDetails && DebitDetails.Chit_fund_Interest_Given ? (
                                    <>
                                        <Flex spacebetween={true} margin={'10px 5px'} onClick={() => ChitFundInterestGiven()}>
                                            <div className='flexClass'>
                                                <h3 className='NameHead'>Interest Given</h3>
                                                {interestGivenModal ? <MdOutlineKeyboardArrowDown fontSize={22} /> : <MdKeyboardArrowRight fontSize={22} />}
                                            </div>
                                            <div className='NameHead'>{formatIndianNumber(DebitDetails.Chit_fund_Interest_Given?.total_amount)} </div>
                                        </Flex>
                                        {interestGivenModal ?
                                            <ChitfundInterestGivenView datas={DebitDetails} /> : null
                                        }
                                    </>
                                ) : null}

                                {DebitDetails && DebitDetails.Chit_fund_Profit_Distribution ? (
                                    <>
                                        <Flex spacebetween={true} margin={'20px 5px'} onClick={() => ChitFundProfitDistri()}>
                                            <div className='flexClass'>
                                                <h3 className='NameHead'>Profit Distribution</h3>
                                                {profitDistritnModal ? <MdOutlineKeyboardArrowDown fontSize={22} /> : <MdKeyboardArrowRight fontSize={22} />}
                                            </div>
                                            <div className='NameHead'>{formatIndianNumber(DebitDetails.Chit_fund_Profit_Distribution?.total_amount)} </div>
                                        </Flex>
                                        {profitDistritnModal ?
                                            <CFProfitDistributionView datas={DebitDetails} /> : null
                                        }
                                    </>
                                ) : null}

                                {/* Feb 2026 owner rule: line-item breakdown for
                                    Chit Fund Expense on the Debit column, so
                                    the Total no longer includes an "invisible"
                                    amount and operators can drill into which
                                    expenses hit which chit fund. */}
                                {DebitDetails && DebitDetails.Chit_Fund_Expense ? (
                                    <>
                                        <Flex spacebetween={true} margin={'20px 5px'} onClick={() => ChitFundExpenseToggle()} data-testid="chitfund-expense-row">
                                            <div className='flexClass'>
                                                <h3 className='NameHead'>Chit Fund Expense</h3>
                                                {chitFundExpenseModal ? <MdOutlineKeyboardArrowDown fontSize={22} /> : <MdKeyboardArrowRight fontSize={22} />}
                                            </div>
                                            <div className='NameHead'>{formatIndianNumber(DebitDetails.Chit_Fund_Expense?.total_amount)} </div>
                                        </Flex>
                                        {chitFundExpenseModal ?
                                            <ChitFundExpenseView datas={DebitDetails} /> : null
                                        }
                                    </>
                                ) : null}

                                {dataSource && dataSource.total_debit_amount ?
                                    <div className='NameHead mobileresponsive'>
                                        <Flex end={true}><hr style={{ width: '50%' }} /></Flex>
                                        <Flex end={true} margin={'10px'}>Total : ₹{formatIndianNumber(dataSource?.total_debit_amount)}</Flex>
                                    </div>
                                    : null}
                            </div>
                        </Col>

                        <Col span={24} md={12} className='RightLi NameHead webresponsive'>
                            {dataSource && dataSource.total_debit_amount ? <div style={{ width: '50%', float: 'right' }}><hr /></div> : null}
                            {dataSource && dataSource.total_credit_amount ?
                                <Flex end={true} margin={'10px 20px'}>Total : ₹&nbsp;{formatIndianNumber(dataSource?.total_credit_amount)}</Flex>
                                : null}
                        </Col>
                        <Col span={24} md={12} className='LeftLi NameHead webresponsive'>
                            {dataSource && dataSource.total_debit_amount ? <div style={{ width: '50%', float: 'right' }}><hr /></div> : null}
                            {dataSource && dataSource.total_debit_amount ?
                                <Flex end={true} margin={'10px 20px'}>Total : ₹{formatIndianNumber(dataSource?.total_debit_amount)}</Flex>
                                : null}
                        </Col>

                    </CustomRow>
                </ChitSheetStyle>

                <ChitSheetStyle>
                    {dataSource?.balance_amount >= 0 &&
                        <Flex end={true} className='footerSection' >
                            <h3>Balance Amt : ₹&nbsp;{formatIndianNumber(dataSource?.balance_amount)} {dataSource?.balance_amount > 0 && `(${dataSource?.balance_type})`}  </h3>
                        </Flex>
                    }
                </ChitSheetStyle>
            </PrintHolder>
            {/* --------------  Balance details ---------- */}
        </Fragment>
    )
}

export const ChitSheetStyle = styled.div`
   background-color: #fff;
   border: 1px solid #9b9b9b;
   & span , & h3, & svg {
    cursor: pointer;
   }
   .borderline {
    border: 1px solid #9b9b9b;
   }
   .flexClass {
    display: flex;
    align-items: center;
   }
   .RightLi {
    border-right: 1px solid #9b9b9b;
   }
   .LeftLi {
    border-left: 1px solid #9b9b9b;
   }
   .Titleshow {
    text-align: center;
    padding: 15px;
    background-color: #990000;
    color: #fff;
    font-size: 18px;
    font-weight: 700;
   }
   .BodeyContent {
    padding: 10px;
   }
   .NameHead {
    font-size: 18px;
    font-weight: 700;
   }
   .NameHeadclr {
    font-size: 18px;
    color: red;
    font-weight: 700;
   }
   .mobileresponsive {
    visibility: hidden;
   }
   .webresponsive {
    visibility: visible;
   }
   .footerSection {
    padding: 20px;
   }
   @media screen and (max-width: 767px) {
    .mobileresponsive {
     visibility: visible;
   }
   .webresponsive {
    visibility: hidden;
    display: none;
   }
   }
`

const PrintHolder = styled.div`
 & h5 {
      color: #a1a1a1;
      margin: 10px 0;
      & span {
        color: #000000;
      }
    };
    @media print{     
        padding: 20px;
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
      .webresponsive {
        display: none !important;
      }
      
      .mobileresponsive {
        visibility: visible !important;
      }
    };

    @media (orientation: landscape) {
      .webresponsive {
        visibility: visible !important;
      }
      
      .mobileresponsive {
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
