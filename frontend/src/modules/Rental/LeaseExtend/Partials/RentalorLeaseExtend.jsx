import { Button, CustomDatePicker, CustomInput, CustomInputNumber, CustomSwitch } from '@components/form'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Form } from 'antd'
import React from 'react'
import { useEffect } from 'react'
import { toast } from 'react-toastify'

const RentalorLeaseExtend = () => {

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
            name='AddRentalorLeaseExtend'
            form={form}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete='off'
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
        >
            <CustomCardView>
                <CustomPageTitle Heading={'Rental / Lease Extend'} />
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={24} style={{ marginTop: "20px" }}>
                        <CustomSwitch name={'rental_or_lease'} leftLabel={'Rental'} rightLabel={'Lease'} />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomInput label={'Rental / Lease ID'} name={'rental_or_leaseid'}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Rental / Lease ID !',
                                }
                            ]} />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomDatePicker label={'Extend Date'} name={'extend_date'}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select Extend Date !',
                                }
                            ]} />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Amount'} name={'amount'} suffix={'₹'}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Amount !',
                                }
                            ]}
                        />
                    </Col>
                </CustomRow>
                <Flex center={'true'} gap={'20px'} margin={'30px'}>
                    <Button.Danger text={'Submit'} htmlType={'submit'} />
                    <Button.Success text={'Cancel'} onClick={onReset } />
                </Flex>
            </CustomCardView>
        </Form>
    )
}

export default RentalorLeaseExtend