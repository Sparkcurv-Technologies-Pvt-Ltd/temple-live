import { CustomRow } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import { Col } from 'antd'
import React from 'react'
import styled from 'styled-components';

export const TotalStyle = styled.div`
padding: 30px;
    & h1 {
        font-size: 18px;
        text-transform: capitalize;
        & span {
            color: #8f8f8f;
            font-size: 18px;
            margin-left: 3px;
        }
    }
    @media screen and (max-width: 500px) {
        padding: 5px;
    }
`
const ProfitDistributionView = ({ DataRecord }) => {
    return (
        <TotalStyle>
            <CustomPageTitle Heading={'View Details'} />
            <CustomRow space={[12, 12]}>
                <Col span={24} md={12}>
                    <h1>chit fund name : <span>{DataRecord?.chit_fund_name}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>distribution date : <span>{DataRecord?.distribution_date}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>distribution percent : <span>{DataRecord?.distribution_percent}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>management invested Amt : <span>{DataRecord?.management_invested_amount}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>management profile : <span>{DataRecord?.management_profile}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>management share : <span>{DataRecord?.management_share}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>outside amount : <span>{DataRecord?.outside_amount}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>per head share amount : <span>{DataRecord?.per_head_share_amount}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>profit amount : <span>{DataRecord?.profit_amount}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>Available amount : <span>{DataRecord?.total_amount}</span></h1>
                </Col>
            </CustomRow>
        </TotalStyle>
    )
}

export default ProfitDistributionView