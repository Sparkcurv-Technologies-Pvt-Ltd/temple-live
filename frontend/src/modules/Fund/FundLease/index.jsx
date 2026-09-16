import { CustomTabs } from '@components/form/CustomTabs'
import { CustomCardView, CustomRow } from '@components/others'
import { Col } from 'antd'
import React, { Fragment } from 'react'
import AddNormalFundLease from './NormalFundLease/Partials/AddNormalFundLease'
import { FundLeaseForm } from './Partials/FundLease'

const FundLease = () => {
    const TabOptions = [
        {
            key: "1",
            label: "Fund Lease",
            children: <FundLeaseForm />
        },
        {
            key: "2",
            label: "Normal Fund Lease",
            children: <AddNormalFundLease />
        },

    ]

  return (
    <Fragment>
       <CustomCardView>
                <CustomRow >
                    <Col span={24} md={24}>
                        <CustomTabs tabs={TabOptions} />
                    </Col>
                </CustomRow>
            </CustomCardView>
    </Fragment>
  )
}

export default FundLease
