import { CustomDatePicker, CustomInput, CustomInputNumber } from '@components/form'
import { CustomTabs } from '@components/form/CustomTabs'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Form, Radio, Tabs } from 'antd'
import React, { useState } from 'react'
import { FundTabLeaseHistory, FundTabPaidHistory, FundTabSheet } from './FundTabDetails'
import { StyledTabCard, StyledTabSelected } from '../style'

const FundMemberProfile = () => {

    const [form] = Form.useForm()
    const [size, setSize] = useState('small');
    const onChange = (e) => {
        setSize(e.target.value);
    };
    const TabOptions = [
        {
            key: "1",
            label: "Sheet",
            children: <FundTabSheet />
        },
        {
            key: "2",
            label: "Lease History",
            children: <FundTabLeaseHistory />
        },
        {
            key: "3",
            label: "Paid History",
            children: <FundTabPaidHistory />
        },
    ]

    const SheetClick = () => {
        <StyledTabSelected />
    }

    return (
        <Form
            name='ViewMemberProfile'
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
                <Col span={24} md={24}>
                    <CustomPageTitle Heading={'Fund Member Profile'} />
                </Col>

                <Col span={24} md={12}>
                    <CustomInput label={'Name'} name={'name'} disabled={true} />
                </Col>

                <Col span={24} md={12}>
                    <CustomInputNumber label={'Found Count'} name={'found_count'} disabled={true} />
                </Col>

                <Col span={24} md={12}>
                    <CustomDatePicker label={'Joining Date'} name={'joining_date'} disabled={true} />
                </Col>

                <Col span={24} md={12}>
                </Col>

                <Col span={24} md={24}>
                </Col>
                <Col span={24} md={24}>
                    {/* <CustomCardView> */}
                        {/* <Flex center={'true'}> */}
                            <CustomTabs tabs={TabOptions} />
                        {/* </Flex> */}
                    {/* </CustomCardView> */}
                </Col>
                {/* <Radio.Group
                    value={size}
                    onChange={onChange}
                    style={{
                        marginBottom: 16,
                    }}
                >
                    <Radio.Button value="small">Small</Radio.Button>
                    <Radio.Button value="middle">Middle</Radio.Button>
                    <Radio.Button value="large">Large</Radio.Button>
                </Radio.Group> */}
                {/* <Tabs
                    defaultActiveKey="1"
                    size={size}
                    style={{
                        marginBottom: 32,
                    }}
                    items={new Array(3).fill(null).map((_, i) => {
                        const id = String(i + 1);
                        return {
                            label: `Tab ${id}`,
                            key: id,
                            children: `Content of tab ${id}`,
                        };
                    })}
                /> */}
                {/* <Col span={24} md={24}>
                    <Flex center={'true'}>
                        <Tabs
                            defaultActiveKey="1"
                            type="card"
                            size={size}
                            // items={new Array(3).fill(null).map((_, i) => {
                            //     const id = String(i + 1);
                            //     return {
                            //         label: `Card Tab ${id}`,
                            //         key: id,
                            //         children: `Content of card tab ${id}`,
                            //     };
                            // })}
                            items={TabOptions}
                        />
                    </Flex>
                </Col> */}

                {/* <Col span={24} md={24}>
                    <StyledTabCard>
                        <Flex center={'true'} spacebetween={'true'}>
                            <h1 onClick={SheetClick}>Sheet</h1>
                            <h1>Lease History</h1>
                            <h1>Paid History</h1>
                        </Flex>
                    </StyledTabCard>
                </Col> */}

            </CustomRow>
        </Form>
    )
}

export default FundMemberProfile