import { CustomRow } from '@components/others';
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import { Col } from 'antd';
import React from 'react'
import styled from 'styled-components';

const Totalstyle = styled.div`
  padding: 0px 24px 24px 35px !important;
`;

export const SubscriptionView = ({ record }) => {
    return (
        <Totalstyle>
        <div>
        <CustomRow>
            <Col span={24} md={24}>
                <CustomPageTitle Heading={'Subscription Tariff View'} />
            </Col>
            <Col span={24} md={24}>
                <CustomRow>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'normal' }}>Date</h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.date}</h3>
                    </Col>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'normal' }}>Tariff No</h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.subscription_no}</h3>
                    </Col>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'normal' }}>Tariff Amt</h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.tariff_amount}</h3>
                    </Col>

                    {/* <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'normal' }}>Penalty Percentage</h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.penalty_percentage}</h3>
                    </Col> */}
                        <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'normal' }}>Penalty Type</h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.penalty_amount_type}</h3>
                    </Col>
                    
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'normal' }}>Penalty Amount</h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.penalty_amt}</h3>
                    </Col>
{/* 
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'normal' }}>Exception Percentage</h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.exp_percentage}</h3>
                    </Col> */}

                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'normal' }}>Exception type </h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.exp_amount_type}</h3>
                    </Col>

                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'normal' }}>Exception Amount</h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.exp_amount}</h3>
                    </Col>

                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'normal' }}>From Date</h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.from_date}</h3>
                    </Col>

                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'normal' }}>To Date</h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.to_date}</h3>
                    </Col>

                </CustomRow>


                {/* <h4>Date: {record?.date}</h4>
                <h4>Subscription Tariff Amount: {record?.tariff_amount}</h4>
                <h4>Penalty Percentage: {record?.penalty_percentage}</h4> */}
                {/* <h4>Penalty Amount: {record?.penalty_amt}</h4> */}
                {/* <h4>Exception Percentage: {record?.exp_percentage}</h4>
                <h4>Exception Amount: {record?.exp_amount}</h4> */}
                {/* <h4>From: {record?.from_date}</h4>
                <h4>To: {record?.to_date}</h4> */}
            </Col>
            <Col span={24} md={6}>

            </Col>
        </CustomRow>
        </div>
    </Totalstyle>
    )
}
