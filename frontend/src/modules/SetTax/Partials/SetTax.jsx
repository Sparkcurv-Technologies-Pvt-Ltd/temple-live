import { Button, CustomDatePicker, CustomInput, CustomInputNumber, CustomSwitch } from '@components/form'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Form } from 'antd'
import React from 'react'
import { useEffect } from 'react'
import { toast } from 'react-toastify'

const SetTax = () => {

    const [form] = Form.useForm()

    useEffect(() => {
        form.resetFields()
    }, [])

    const onReset = () => {
        form.resetFields()
    }

    const onFinish = () => {

    }

    const onFinishFailed = () => {
        toast.warn("Please fill in all the required details !");
    }

    return (
        <Form
            name='SetTheTax'
            form={form}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete='off'
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
        >
            <CustomCardView>

                <CustomRow space={[12, 12]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'Set Tax'} />
                    </Col>
                    <Col span={24} md={12} >
                        <Flex flexend={'right'}>
                            <CustomDatePicker name={'date'}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please Select Date !',
                                    }
                                ]} />
                        </Flex>
                    </Col>

                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Tax Amount'} name={'tax_amount'} suffix={'₹'}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Tax Amount !',
                                }
                            ]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Penalty Amount'} name={'penalty_amount'} suffix={'₹'}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Penalty Amount !',
                                }
                            ]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Penalty Percentage'} name={'penalty_percentage'} suffix={'%'}
                            max={100}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Penalty Percent !',
                                },
                                {
                                    validator: (_, value) => {
                                        if (value !== undefined && value !== null && Number(value) > 100) {
                                            return Promise.reject(
                                                new Error('Penalty percentage cannot exceed 100%')
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        />
                    </Col>

                    <Col span={24} md={6}>
                        <CustomDatePicker label={'From'} name={'from'}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select From Date !',
                                }
                            ]} />
                    </Col>

                    <Col span={24} md={6}>
                        <CustomDatePicker label={'To'} name={'to'}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select To Date !',
                                }
                            ]} />
                    </Col>
                </CustomRow>
                <Flex center={'true'} gap={'20px'} margin={'30px'}>
                    <Button.Danger text={'Submit'} htmlType={'submit'} />
                    <Button.Success text={'Cancel'} onClick={onReset} />
                </Flex>
            </CustomCardView>
        </Form >
    )
}

export default SetTax