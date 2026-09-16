
import { Button, CustomInput } from '@components/form'
import { CustomRow, Flex } from '@components/others'
import { APIURLS } from '@request/apiUrls/urls'
import errorHandler from '@request/errorHandler'
import request from '@request/request'
import successHandler from '@request/successHandler'
import { Col, Form } from 'antd'
import React, { useEffect } from 'react'
import { getSangamName } from '../SangamSlice'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

export const AddSangamNameModals = ({ CloseForm ,trigger,FormExternalClose }) => {

    const [form] = Form.useForm()
    const dispatch = useDispatch()

    useEffect(() => {
        form.resetFields();  
    }, [trigger])
    

    const onReset = () => {
        form.resetFields();
    }

    const onFinish = (data) => {
        AddSangamName(data)
    };

    const onFinishFailed = (errorInfo) => {
        toast.warn("Please fill in all the required details !");
    };

    const AddSangamName = async (data) => {
        await request.post(APIURLS.POST_SANGAM_NAME, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: 'success',
                    type: 'success',
                })
                FormExternalClose();
                dispatch(getSangamName())
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            })
    }

    return (

        <Form
            name='AddNewSangam'
            form={form}
            labelCol={{
                span: 24,
            }}
            wrapperCol={{
                span: 24,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off">

            <CustomRow space={[24, 24]}>
                <Col span={24} md={24}>
                    <CustomInput label={'Sangam Name'} name={'sangam_name'}
                        rules={[
                            {
                                required: true,
                                message: 'Please Enter Sangam Name !',
                            }
                        ]}
                    />
                </Col>
            </CustomRow>

            <Flex center gap={'20px'} style={{ margin: '30px' }}>
                <Button.Danger text={'Add'} htmlType={'submit'} />
                <Button.Success text={'Reset'} onClick={onReset} />
            </Flex>
        </Form>
    )
}
