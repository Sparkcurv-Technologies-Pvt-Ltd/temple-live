import { CustomRow } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import { Col } from 'antd'
import React from 'react'
import dayjs from 'dayjs';
import { TotalStyle } from '../../ChitProfitDistribution/Partials/ProfitDistributionView';

// Business rule: The record's `settlement_date` field actually stores the
// APPLICATION DATE (the day the investor filed the settlement request).
// The real Settlement Date is calculated as Application Date + 60 days.
const computeSettlementDate = (applicationDate) => {
    if (!applicationDate) return '-';
    const d = dayjs(applicationDate);
    if (!d.isValid()) return '-';
    return d.add(60, 'day').format('YYYY-MM-DD');
};

const ViewChitFundSettlementAppln = ({ settleRecord }) => {
    const applicationDate = settleRecord?.settlement_date;
    return (
        <TotalStyle>
            <CustomPageTitle Heading={'View Settlement Application'} />
            <CustomRow space={[12, 12]}>
                <Col span={24} md={12}>
                    <h1>chit fund name : <span>{settleRecord?.chit_fund_name}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>Investor Name : <span>{settleRecord?.invester_name}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>Settlement Aplication No : <span>{settleRecord?.settlement_aplication_no}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1 data-testid="settlement-view-application-date">
                      Application Date : <span>{applicationDate || '-'}</span>
                    </h1>
                </Col>
                <Col span={24} md={12}>
                    <h1 data-testid="settlement-view-settlement-date">
                      Settlement Date : <span>{computeSettlementDate(applicationDate)}</span>
                    </h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>Invested Amount : <span>₹ {Number(settleRecord?.investment_amt || 0).toFixed(2)}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>Share Count : <span>{settleRecord?.share_count ?? 0}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>Share Amount : <span>₹ {Number(settleRecord?.share_amount || 0).toFixed(2)}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>Total Amount : <span style={{ color: '#0F5132', fontWeight: 700 }}>₹ {Number(settleRecord?.total_amount || 0).toFixed(2)}</span></h1>
                </Col>
            </CustomRow>
        </TotalStyle>
    )
}

export default ViewChitFundSettlementAppln
