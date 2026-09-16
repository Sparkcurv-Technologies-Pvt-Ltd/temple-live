import React, { Fragment, useEffect, useRef } from 'react';
import { Col, Form } from 'antd';
import { CommonLoading, CustomRow, Flex } from '@components/others';
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import request from '@request/request';
import { APIURLS } from '@request/apiUrls/urls';
import { useState } from 'react';
import {
    CreditStyle,
    HeadingStyle, PrintHolder, PrintShowData, StyledCard
} from '@modules/Report/Style';
import { useDispatch, useSelector } from 'react-redux';
import { getManagement, selectManagementDetails } from '@modules/Management/ManagementSlice';
import { useReactToPrint } from 'react-to-print';
import { IoPrint } from 'react-icons/io5';
import { Button, CustomDateRangePicker, CustomSelect } from '@components/form';
import successHandler from '@request/successHandler';
import errorHandler from '@request/errorHandler';
import dayjs from 'dayjs';
import { userRolesConfig } from '@router/config/roles';
import { selectCurrentSuperUser, selectCurrentUserRole } from '@modules/Auth/authSlice';
import {
    getCollectionUserBased, getCollectionUserList,
    selectUserlistDetails
} from '@modules/CollectionDetails/CollectionDetailsSlice';


const ViewCollectionReports = () => {

    const [form] = Form.useForm();
    const [collectDetails, setCollectDetails] = useState([]);
    const [datePick, setDatePick] = useState(dayjs().format("YYYY-MM-DD"));
    const [loading, setLoading] = useState(true);
    const componentRef = useRef();
    const dispatch = useDispatch();

    const role = useSelector(selectCurrentUserRole); // Role
    const superUsers = useSelector(selectCurrentSuperUser);  // SuperUser

    //--------------------- user List Details--------------------//
    const AllUserlistDetails = useSelector(selectUserlistDetails);

    //---------------- Management Details -------------------------//
    useEffect(() => {
        dispatch(getManagement());
        GetCollectionReports();
        dispatch(getCollectionUserBased());
        dispatch(getCollectionUserList());
    }, []);

    const AllManagementDetails = useSelector(selectManagementDetails);

    //-------------------- User Options -------------------------------//
    const userListOptions = AllUserlistDetails?.user?.map((items) => ({
        label: items?.name,
        value: items?.id,
    }));

    //---------------------Handle Print --------------------------

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });
    //------------------- Date filter Date range fn --------------

    const GetCollectionReports = async () => {
        setLoading(true)
        await request
            .get(`${APIURLS.COLLECTION_HISTORY_REPORTS}`)
            .then(function (response) {
                setCollectDetails(response.data)
                setLoading(false)
                return response.data;
            })
            .catch(function (error) {
                setLoading(false)
            });
    };

    const formatIndianNumber = (number) => {
        const strNumber = number?.toString();
        const length = strNumber?.length;
        if (length <= 3) {
            return strNumber;
        }
        const lastThreeDigits = strNumber?.substring(length - 3);
        const mainPart = strNumber?.substring(0, length - 3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
        return `${mainPart},${lastThreeDigits}`;
    };

    const handleDatepicker = (value) => {
        setDatePick(value);
    };

    const CollectionFilterbyUser = async (data) => {
        await request
            .post(APIURLS.COLLECTION_FILTERUSER_REPORTS, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: "success",
                    type: "success",
                });
                setCollectDetails(response.data)
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            });
    };

    const onFinish = (value) => {
        const result = { ...value, datePick };
        let NewValue = {
            user_id: result?.user_id,
            range: {
                start_date: result?.datePick?.start_date,
                end_date: result?.datePick?.end_date,
            },
        };
        CollectionFilterbyUser(NewValue);
    };

    return (

        <Fragment>
            {loading ? <><CommonLoading /></> :
                <div>
                    <CustomPageTitle Heading={"Collection Reports"} />
                    <Form onFinish={onFinish} form={form}>
                        <CustomRow>
                            {superUsers || role === userRolesConfig.ADMIN ? (
                                <Col span={24} md={8}>
                                    <p>Users</p>
                                    <CustomSelect name={"user_id"} options={userListOptions || []} placeholder={'Select'}
                                        rules={[
                                            { required: true, message: "Please Select a User !" },
                                        ]}
                                    />
                                </Col>
                            ) : null}
                            <Col span={24} md={1}></Col>
                            <Col span={24} md={10}>
                                <p>Choose From To Date</p>
                                <CustomDateRangePicker name={"range"} onChange={handleDatepicker}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please choose a 'From' and 'To' date!",
                                        },
                                    ]} />
                            </Col>
                            <Col span={24} md={1}></Col>
                            <Col span={24} md={4}>
                                <Flex gap={"20px"} style={{ margin: '9px' }}>
                                    <Button.Danger type="danger" htmlType={"submit"} text={"Submit"} />
                                </Flex>
                            </Col>
                        </CustomRow>
                    </Form>

                    <PrintHolder ref={componentRef}>
                        <StyledCard >
                            <PrintShowData className="PrintShowDatadd">
                                <HeadingStyle>
                                    <h1>{AllManagementDetails?.temple_name}</h1>
                                    <h2>{AllManagementDetails?.address}</h2>
                                    <h3>Collection Report Details</h3>
                                </HeadingStyle>
                            </PrintShowData>

                            {collectDetails?.map((rep, index) => (
                                // <Card>
                                <CustomRow gutter={[24, 24]} key={index} className="BorderAP"  >

                                    <Col span={24} md={12} className='BorderRi'>
                                        <div className='HeadingStyles'><h4>Credit</h4></div>

                                        <CreditStyle>
                                            <h3 className='Rolename'><span>{rep?.user}</span></h3><br />
                                            <div className='AmtLabel'>
                                                <h3>Rent Amount </h3>
                                                <h3>{formatIndianNumber(rep?.rent_amount)}</h3>
                                            </div>
                                            <div className='AmtLabel'>
                                                <h3>Rent Advance Amount</h3>
                                                <h3>{formatIndianNumber(rep?.rent_advance_amount)}</h3>
                                            </div>
                                            <div className='AmtLabel'>
                                                <h3>Lease Amount</h3>
                                                <h3>{formatIndianNumber(rep?.lease_amount)}</h3>
                                            </div>
                                            <div className='AmtLabel'>
                                                <h3>Moveable Rental Amount</h3>
                                                <h3>{formatIndianNumber(rep?.move_amount)}</h3>
                                            </div>
                                            <div className='AmtLabel'>
                                                <h3>Moveable Rental Received Amt</h3>
                                                <h3>{formatIndianNumber(rep?.move_receive_amt)}</h3>
                                            </div>
                                            <div className='AmtLabel'>
                                                <h3>Subscription Amount</h3>
                                                <h3>{formatIndianNumber(rep?.sub_amount)}</h3>

                                            </div>
                                            <div className='AmtLabel'>
                                                <h3>Festival Amount</h3>
                                                <h3>{formatIndianNumber(rep?.festi_amount)}</h3>
                                            </div>
                                            <div className='AmtLabel'>
                                                <h3>Marriage Amount</h3>
                                                <h3>{formatIndianNumber(rep?.marriage_amount)}</h3>
                                            </div>
                                            <div className='AmtLabel'>
                                                <h3>Death Amount</h3>
                                                <h3>{formatIndianNumber(rep?.death_amount)}</h3>
                                            </div>
                                            <div className='AmtLabel'>
                                                <h3>Income Amount</h3>
                                                <h3>{formatIndianNumber(rep?.income_amount)}</h3>
                                            </div>
                                            <div className='AmtLabel'>
                                                <h3>Balance Amount</h3>
                                                <h3>{formatIndianNumber(rep?.bal_amount)}</h3>
                                            </div>
                                            <div className='AmtLabel'>
                                                <h3>Chit Amount</h3>
                                                <h3>{formatIndianNumber(parseFloat(rep?.chit_amount).toFixed(0))}</h3>
                                            </div>
                                            <div className='AmtLabel'>
                                                <h3>Fund Amount</h3>
                                                <h3>{formatIndianNumber(parseFloat(rep?.fund_amount).toFixed(0))}</h3>
                                            </div>
                                            <div className='AmtLabel'>
                                                <h3>Management Interest Amt</h3>
                                                <h3>{formatIndianNumber(parseFloat(rep?.manageinter_amount).toFixed(0))}</h3>
                                            </div>
                                        </CreditStyle>
                                        <div className='DeskLabelStyle mobileresponsbalane' >
                                            <div className='TotalAmtStyle' >
                                                <div className='TotalLabelStyle'>
                                                    <h2>Credit Amount</h2>
                                                </div>
                                                <h3 style={{ padding: '0px 20px' }}>
                                                    ₹&nbsp;{formatIndianNumber(parseFloat(rep?.total_amount).toFixed(0))}
                                                </h3>
                                            </div>
                                        </div>
                                    </Col>

                                    <Col span={24} md={12}>
                                        <div className='HeadingStyles'><h4>Debit</h4></div>
                                        <CreditStyle>
                                            <div className='AmtLabel'>
                                                <h3>Rent Settlement Amount</h3>
                                                <h3>{formatIndianNumber(rep?.rent_settlement_amount)}</h3>
                                            </div>
                                            <div className='AmtLabel'>
                                                <h3>Moveable Rental Pay Amt</h3>
                                                <h3>{formatIndianNumber(rep?.move_pay_amt)}</h3>
                                            </div>
                                            <div className='AmtLabel'>
                                                <h3>Expense Amount</h3>
                                                <h3>{formatIndianNumber(rep?.expense_amount)}</h3>
                                            </div>
                                        </CreditStyle>
                                        <div className='DeskLabelStyle'>
                                            <div className='TotalAmtStyle' >
                                                {/* <div className='lineplace'><hr /></div> */}
                                                <div className='TotalLabelStyle'>
                                                    <h2>Debit Amount</h2>
                                                </div>
                                                <h3 style={{ padding: '0px 20px' }}>
                                                ₹&nbsp;{formatIndianNumber(parseFloat(rep?.debit_amount).toFixed(0))}
                                                </h3>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={24} md={24}>
                                            <CustomRow>
                                                <Col span={24} md={12}>
                                                  
                                                    <div className='MobileLablestyle'>

                                                        <div className='TotalAmtStyle' >
                                                            {/* <div className='lineplace'><hr /></div> */}
                                                            <div className='TotalLabelStyle'>
                                                                <h2>Credit Amount</h2>
                                                            </div>
                                                            <h3 style={{ padding: '0px 20px' }}>
                                                            ₹&nbsp;{formatIndianNumber(parseFloat(rep?.total_amount).toFixed(0))}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                   
                                                </Col>
                                                <Col span={24} md={12}>
                                                   
                                                    <div className='MobileLablestyle'>
                                                        <div className='TotalAmtStyle' >
                                                            {/* <div className='lineplace'><hr /></div> */}
                                                            <div className='TotalLabelStyle'>
                                                                <h2>Debit Amount</h2>
                                                            </div>
                                                            <h3 style={{ padding: '0px 20px' }}>
                                                                ₹&nbsp;{formatIndianNumber(parseFloat(rep?.debit_amount).toFixed(0))}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </CustomRow>
                                    </Col>
                                    <Col span={24} md={12}></Col>
                                    <Col span={24} md={12}>
                                        <CreditStyle style={{ float: 'right' }}>
                                            <div className='footerAmtStyle'>
                                                <div className='footerAmt'>
                                                    <h2>Credit Amt : &nbsp;</h2>
                                                    <h1> ₹{formatIndianNumber(parseFloat(rep?.total_amount).toFixed(0))}</h1>
                                                </div>
                                                <div className='footerAmt'>
                                                    <h2>Debit Amt :&nbsp;</h2>
                                                    <h1>₹{formatIndianNumber(parseFloat(rep?.debit_amount).toFixed(0))}</h1>
                                                </div>

                                                {/* <div className='footerAmt'>
                                                    <h2>Total : &nbsp;</h2>
                                                    <h1>₹{formatIndianNumber(parseFloat(rep?.total_amount + rep?.debit_amount).toFixed(0))}
                                                    </h1>
                                                </div> */}
                                            </div>
                                        </CreditStyle>
                                    </Col>
                                    <Col span={24} md={24}>
                                        <hr />
                                    </Col>
                                </CustomRow>
                                // </Card>
                            ))}
                        </StyledCard>
                    </PrintHolder>

                    <Flex end={true}>
                        <Button.Secondary text={"Print"} icon={<IoPrint />} onClick={handlePrint} />
                    </Flex>
                </div>
            }
        </Fragment>
    );
};

export default ViewCollectionReports;
