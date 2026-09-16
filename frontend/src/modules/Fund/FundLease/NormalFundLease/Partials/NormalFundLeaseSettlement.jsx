import { Button } from '@components/form'
import { CustomRow, Flex } from '@components/others'
import { Col, Form, Spin } from 'antd'
import React, { Fragment, useState } from 'react'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { APIURLS } from '@request/apiUrls/urls'
import successHandler from '@request/successHandler'
import request from '@request/request'
import errorHandler from '@request/errorHandler'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { Totalstyle } from '@modules/IncomeDetails/AddIncomeForms/Partials/IncomeView'
import {getFundLeasenormaltable } from '@modules/Fund/FundSlice'


export const NormalFundLeaseSettlement = ({ settlementRecord, closee, fundtrigger }) => {

    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const [isloading, setIsloading] = useState(false);
    const FinalLeaseAmt = settlementRecord?.final_lease_amount - settlementRecord?.multiplied_commission_amount || 0;

    const AddSettlementNormalFundLease = async (data) => {
        setIsloading(true);
        await request.put(`${APIURLS.POST_FUND_SETTLEMENT}/${settlementRecord?.id}/`, data)
            .then(function (response) {
        
                if (response.status === 226) {
                    toast.warn(response.data?.Message)
                }
                else{
                    successHandler(response, {
                        notifyOnSuccess: true,
                        notifyOnFailed: true,
                        msg: 'Successfully Settled Amount! ',
                        type: 'success',
                    })
                    form.resetFields()
                    dispatch(getFundLeasenormaltable());
                    closee();
                }
                setIsloading(false);
                return response.data;
            })
            .catch(function (error) {
                setIsloading(false);
                errorHandler(error);

            })
    }

    const handlePostSettlement = (data) => {
        const Newdata = {
            lease_date: settlementRecord?.lease_date,
            fund_name: settlementRecord?.fund_name,
            fund_type: settlementRecord?.fund_type,
            leased_members_count: settlementRecord?.leased_members_count,
            fund_lease_amount: settlementRecord?.fund_lease_amount,
            commssion_amount:settlementRecord?.commssion_amount,
            final_lease_amount: FinalLeaseAmt,
        }
        AddSettlementNormalFundLease(Newdata)
    };

    return (
        <Fragment>
            <Totalstyle>
                {/* <div> */}
                <CustomRow>
                    <Col span={24} md={24}>
                        <CustomPageTitle Heading={'Normal Fund Lease Settlement'} />
                    </Col>
                    <Col span={24} md={24} style={{background:'#efe7e7',padding:'10px 20px',borderRadius:'5px'}}>
                        <CustomRow>
                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h2 style={{ fontWeight: 'normal' }}>Lease Date</h2>
                            </Col>
                            <Col span={2} md={1}><h3>:</h3></Col>
                            <Col span={10} md={10}>
                                <h3 style={{ paddingLeft: '5px',fontWeight: 'normal' }}>{settlementRecord?.lease_date}</h3>
                            </Col>
                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h2 style={{ fontWeight: 'normal' }}>Fund Name</h2>
                            </Col>
                            <Col span={2} md={1}><h3>:</h3></Col>
                            <Col span={10} md={10}>
                                <h3 style={{ paddingLeft: '5px' }}>{settlementRecord?.fund_name}</h3>
                            </Col>
                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h2 style={{ fontWeight: 'normal' }}>Fund Type</h2>
                            </Col>
                            <Col span={2} md={1}><h3>:</h3></Col>
                            <Col span={10} md={10}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{settlementRecord?.fund_type}</h3>
                            </Col>
                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h2 style={{ fontWeight: 'normal' }}>Lease Member Count</h2>
                            </Col>
                            <Col span={2} md={1}><h3>:</h3></Col>
                            <Col span={10} md={10}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{settlementRecord?.leased_members_count}</h3>
                            </Col>
                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h2 style={{ fontWeight: 'normal' }}>Fund Lease Amount</h2>
                            </Col>
                            <Col span={2} md={1}><h3>:</h3></Col>
                            <Col span={10} md={10}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>₹&nbsp;{settlementRecord?.final_lease_amount}</h3>
                            </Col>
                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h2 style={{ fontWeight: 'normal' }}>Commission Amount</h2>
                            </Col>
                            <Col span={2} md={1}><h3>:</h3></Col>
                            <Col span={10} md={10}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>₹&nbsp;{settlementRecord?.multiplied_commission_amount}</h3>
                            </Col>
                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h2 style={{ fontWeight: 'normal' }}>Settlement Amount</h2>
                            </Col>
                            <Col span={2} md={1}><h3>:</h3></Col>
                            <Col span={10} md={10}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>₹&nbsp;{FinalLeaseAmt}</h3>
                            </Col>
                        </CustomRow>
                    </Col>
                </CustomRow>
                {isloading ? (
                    <Flex center gap="20px" style={{ margin: '15px' }}>
                        <Spin />
                    </Flex>
                ) : (
                    <Flex center gap="20px" style={{ margin: '15px' }}>
                        <Button.Danger text="Submit" htmlType="submit" onClick={handlePostSettlement} />
                    </Flex>
                )}

            </Totalstyle>
        </Fragment>

    )
}
