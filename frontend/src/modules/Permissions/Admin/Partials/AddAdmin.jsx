import { Button, CustomInput, CustomInputPassword } from '@components/form';
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import { APIURLS } from '@request/apiUrls/urls';
import errorHandler from '@request/errorHandler';
import request from '@request/request';
import successHandler from '@request/successHandler';
import { Col, Form } from 'antd';
import React from 'react'
import { toast } from 'react-toastify';

const AddAdmin = () => {

    const [form] = Form.useForm();

    const onFinish = (values) => {
        AdminPost(values)
    }

    const AdminPost = async (data) => {
        await request.post(APIURLS.ADMIN_POST, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: 'success',
                    type: 'success'
                })
                form.resetFields();
                return response.data;
            })
            .catch(function (error) {
                if (error.response.status === 401) {
                    toast.error(error.response.data?.message)
                } else {
                    return errorHandler(error);
                }
            })
    }

    const onFinishFailed = () => {
        toast.warn("Please fill in all the required details !");
    }

    const onReset = () => {
        form.resetFields()
    }

    return (
        <CustomCardView>
            <Form
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}>
                <CustomRow space={[24, 24]}  >
                    <Col span={24} md={24}>
                        <CustomPageTitle Heading={'Create Admin'} />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomInput name={'name'} label={'Name'} placeholder={'Enter Name'} rules={[
                            {
                                required: true,
                                message: 'This is required field!',
                            }
                        ]} />

                    </Col>
                    <Col span={24} md={12}>
                        <CustomInput name={'email'} label={'Email'} placeholder={'Enter Email'} rules={[
                            {
                                required: true,
                                message: 'This is required field!',
                            }
                        ]} />

                    </Col>
                    <Col span={24} md={12}>
                        <CustomInputPassword name="password" placeholder={'Password'} label={'Password'} rules={[
                            {
                                required: true,
                                message: 'This is required field!',
                            }
                        ]} />

                    </Col>
                </CustomRow>
                <Flex center={true} margin={'30px 0px'}>
                    <Button.Danger text={'Submit'} htmlType="submit" />
                    <Button.Success text={'Cancel'} onClick={() => onReset()} />
                </Flex>

            </Form>
        </CustomCardView>
    )
}

export default AddAdmin