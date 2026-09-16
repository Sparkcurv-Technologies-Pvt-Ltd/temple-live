import { CustomRow } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import { Col } from 'antd'
import React from 'react'
import { TotalStyle } from '../../ChitProfitDistribution/Partials/ProfitDistributionView';

const ViewChitSettlement = ({ chitsettleRecord }) => {
    return (
        <TotalStyle>
            <CustomPageTitle Heading={'View Settlement Application'} />
            <CustomRow space={[12, 12]}>
                <Col span={24} md={12}>
                    <h1>chit fund name : <span>{chitsettleRecord?.chit_fund_name}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>Investor Name : <span>{chitsettleRecord?.invester_name}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>Investor Amount : <span>{chitsettleRecord?.invested_amt}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>Share Amount : <span>{chitsettleRecord?.share_amt}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>Final Settlement Amount : <span>{chitsettleRecord?.final_settlement_amt}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>Application Date : <span>{chitsettleRecord?.application_date}</span></h1>
                </Col>
                <Col span={24} md={12}>
                    <h1>Date of investment : <span>{chitsettleRecord?.date_of_investment}</span></h1>
                </Col>
            </CustomRow>
        </TotalStyle>
    )
}

export default ViewChitSettlement