import { CustomDatePicker, CustomInputNumber, CustomTable } from '@components/form'
import { CustomRow } from '@components/others'
import { Col, Form } from 'antd'
import React from 'react'

export const FundTabSheet = () => {
    const TabSheet = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Credit',
            dataIndex: 'Credit'
        },
        {
            title: 'Debit',
            dataIndex: 'Debit'
        },
        {
            title: 'Balance',
            dataIndex: 'Balance'
        },

    ]

    return (
        <div>
            <CustomTable columns={TabSheet} />
        </div>
    )
}

export const FundTabLeaseHistory = () => {

    const [form] = Form.useForm()

    return (
        <Form
            name='viewTabLeaseHistory'
            form={form}
            labelCol={{
                span: 24,
            }}
            wrapperCol={{
                span: 24,
            }}
            autoComplete="off"
        >
            <CustomRow space={[12, 12]}>

                <Col span={24} md={12}>
                    <CustomDatePicker label={'Lease Date'} name={'lease_date'} disabled={true} />
                </Col>

                <Col span={24} md={12}>
                    <CustomInputNumber label={'Lease Amount'} name={'lease_amount'} disabled={true} />
                </Col>

                <Col span={24} md={12}>
                </Col>

            </CustomRow>
        </Form>
    )
}

export const FundTabPaidHistory = () => {

    const TabPaidHistory = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Date',
            dataIndex: 'Date'
        },
        {
            title: 'Mode',
            dataIndex: 'Mode'
        },
        {
            title: 'Amount',
            dataIndex: 'Amount'
        },

    ]

    return (
        <div>
            <CustomTable columns={TabPaidHistory} />
        </div>
    )
}

