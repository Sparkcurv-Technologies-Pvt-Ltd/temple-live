
import { Button, CustomInput } from '@components/form'
import { CustomRow, Flex } from '@components/others'
import { APIURLS } from '@request/apiUrls/urls'
import errorHandler from '@request/errorHandler'
import request from '@request/request'
import successHandler from '@request/successHandler'
import { Col, Form } from 'antd'
import React, { useEffect } from 'react'
import { toast } from 'react-toastify'


export const AddFieldModals = ({ CloseForm ,trigger,handleExtraGet }) => {

    const [form] = Form.useForm()

    useEffect(() => {
        form.resetFields();  
    }, [trigger])
    
    const onReset = () => {
        form.resetFields();
        CloseForm()
    }
    const ExtraField = async (data) => {
        await request.post(APIURLS.POST_GET_Extra_Fields, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: 'success',
                    type: 'success',    
                })
                handleExtraGet()
                return response.data;
            })
            .catch(function (error) {
                if(error.response.status === 406){
                    toast.error(error.response.data.message);
                  }
                  else{
                    return errorHandler(error);
                  }
            })
    }
    const onFinish = (data) => {
        ExtraField(data)
    };

    const onFinishFailed = (errorInfo) => {
        toast.warn("Please fill in all the required details !");
    };

    return (

        <Form
            name='AddField'
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
                    <CustomInput label={'Field Name'} name={'name'}
                        rules={[
                            {
                                required: true,
                                message: 'Please Enter Field Name !',
                            }
                        ]}
                    />
                </Col>
                
            </CustomRow>

            <Flex center={true} gap={'20px'} style={{ margin: '30px' }}>
                <Button.Danger text={'Add'} htmlType={'submit'} />
                <Button.Success text={'Cancel'} onClick={onReset} />
            </Flex>
        </Form>
    )
}


export const AddDesignationModals = ({ FormClose ,trigger ,GetDesignations }) => {

    const [form] = Form.useForm()

    useEffect(() => {
        form.resetFields();  
    }, [trigger])
    

    const onReset = () => {
        form.resetFields();
    }

    const Add_Authorities = async (data) => {
        await request.post(`${APIURLS.POST_GET_AUTHORITY_POSTION}`, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: 'Authorities Details Added Successfully',
                    type: 'success',
                })
                FormClose()
                GetDesignations()
                return response.data      
                })  
            .catch(function (error) {
                if(error.response.status === 406){
                    toast.error(error.response.data.message);
                  }
                  else{
                    return errorHandler(error);
                  }
            })
    }
    const onFinish = (data) => {
        Add_Authorities(data)
    };

    const onFinishFailed = (errorInfo) => {
        toast.warn("Please fill in all the required details !");
    };
    return (

        <Form
            name='AddField'
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
                    <CustomInput label={'Designation Name'} name={'position_name'}
                        rules={[
                            {
                                required: true,
                                message: 'Please Enter a Designation Name !',
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



