import { Button, CustomDatePicker, CustomDateRangePicker, CustomInput, CustomInputNumber, CustomSelect, CustomTable } from '@components/form'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { CustomPageFormTitle2, CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Form } from 'antd'
import React from 'react'
import { StyledAdd } from '../style'
import { SvgIcons } from '@assets/Svg'

export const FundLeaseCase = () => {

    const ChangeProductId = (e) => {
    }

    const onFinish = (_data) => {
    };

    const categoryOption = [
        {
            label: '1st Item',
            value: '1st item'
        },
        {
            label: '2nd Item',
            value: '2nd item'
        }
    ]

    const TableColumn = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Person Name',
            dataIndex: 'fund_name'
        },
        {
            title: 'Lease Amount',
            dataIndex: 'start_date'
        },
        {
            title: 'Action',
            render: (text, record, index) => {
                return (
                    <Flex gap={'20px'} center={'true'}>
                        <img src={SvgIcons.Remove}
                        // onClick={ViewFundMemberProfile}
                        />

                    </Flex>
                )
            }
        }
    ]
    const dataSource = [
        {
            key: '1',
            date: "07/12/2023",
            income_type: "Donation",
            income_name: "Try",
            income_amount: "7777"
        }
    ]
    return (
        <Form>
            <CustomCardView>
                <CustomRow space={[24, 24]}>
                    <Col span={24} md={24}>
                        <CustomPageTitle Heading={'Fund Lease'} />
                    </Col>
                    <Col span={24} md={12}><br />
                        <CustomPageFormTitle2 Heading={'Case 2'} />
                    </Col>
                    <Col span={24} md={12}><br />
                        <Flex flexend={'right'}>
                            <label style={{ padding: '10px' }}>Lease Date</label>
                            <CustomDatePicker
                                name={'date'}
                                //  onChange={deathDate} 
                                disabled />
                        </Flex>
                    </Col>

                    <Col span={24} md={12}>
                        <label>Choose Fund</label>
                        <CustomInput name={'name'} />
                    </Col>

                    <Col span={24} md={6}>
                        <label>From</label>
                        <CustomInput name={'name'} disabled />

                    </Col>

                    <Col span={24} md={6}>
                        <label>To</label>
                        <CustomInput name={'name'} disabled />

                    </Col>
                    <Col span={24} md={12}>
                        <label>Members Count</label>
                        <CustomInput name={'name'} disabled />

                    </Col>
                    <Col span={24} md={8}>
                        <label>Lease Amount</label>
                        <CustomInputNumber name={'fixed_fund_amount'} suffix={'₹'}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Fixed Fund Amount !',
                                }
                            ]}
                        />
                    </Col>
                    <Col span={24} md={4}>
                        <StyledAdd onClick={onFinish} > <h3>Add</h3> </StyledAdd>
                    </Col>

                    <Col span={24} md={12}>
                        <label>Funds Count</label>
                        <CustomInput name={'Funds Count'} disabled />
                    </Col>
                    <Col span={24} md={12} >
                        <label>Per Head Amount</label>
                        <CustomInputNumber name={'fun'} suffix={'₹'} />
                    </Col>

                    <Col span={24} md={12}>
                        <label>Tenant Person</label>
                        <CustomSelect
                            options={categoryOption}
                            name={'category'}
                            // disabled
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter details!',
                                },
                            ]} onChange={ChangeProductId} />
                    </Col>

                    <Col span={24} md={24}>
                        <CustomTable columns={TableColumn} data={dataSource} />
                    </Col>

                    <Flex gap={'20px'} center={"true"} margin={'20px 0'}>
                        <Button.Danger text={'Submit'} htmlType={'submit'} />
                        <Button.Success text={'cancel'} onClick={() => {}} />
                    </Flex>

                </CustomRow>
            </CustomCardView>
        </Form>
    )
}
