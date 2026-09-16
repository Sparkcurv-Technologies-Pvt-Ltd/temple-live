import React, { Fragment, useEffect } from 'react';
import { useState } from 'react';
import { Form } from 'antd';
import styled from 'styled-components';
import { Button, CustomTextArea } from '@components/form';
import { CustomCardView, Flex } from '@components/others';
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import { APIURLS } from '@request/apiUrls/urls';
import request from '@request/request';
import successHandler from '@request/successHandler';
import { toast } from 'react-toastify';
import { getManagement, selectManagementDetails } from '@modules/Management/ManagementSlice';
import { useDispatch, useSelector } from 'react-redux';

const StyleBox = styled.div`
    width: 50%;
    margin: auto;
    /* background: #f4f4f4; */
    padding: 70px 40px;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
    @media screen and (max-width: 700px) {
        width: 100%;
    }
`;


export const Instruction = ({ bondRecord }) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [updationsValue, setUpdationsValue] = useState({});

    //---------------- Management Details --------------------
    useEffect(() => {
        dispatch(getManagement());
    }, []);

    const AllManagementDetails = useSelector(selectManagementDetails);
    //--------------

    const handleErrors = (error) => {
        if (error.response.status === 401) {
            toast.error(error.response.data?.message);
        } else {
            toast.error('Failed');
        }
    };

    const AddPostInstruction = async (data) => {
        try {
            const response = await request.post(APIURLS.GET_INSTRUCTION, data);
            successHandler(response, {
                notifyOnSuccess: true,
                notifyOnFailed: true,
                msg: 'success',
                type: 'success',
            });
            form.resetFields();
            UpdatetGet();
            return response.data;
        } catch (error) {
            handleErrors(error);
        }
    };

    useEffect(() => {
        UpdatetGet()
    }, [])


    useEffect(() => {
        if (updationsValue && Object.keys(updationsValue).length > 0) {
            form.setFieldsValue({ instruction: updationsValue?.instruction });
        }
    }, [updationsValue]);

    const UpdatetGet = async () => {
        try {
            const response = await request.get(APIURLS.GET_INSTRUCTION);
            setUpdationsValue(response.data);
            return response.data;
        } catch (error) {
            handleErrors(error);
        }
    };

    const UpdatetInstructions = async (data) => {
        try {
            const response = await request.put(`${APIURLS.PUT_INSTRUCTION}/${updationsValue?.id}/`, data);
            successHandler(response, {
                notifyOnSuccess: true,
                notifyOnFailed: true,
                msg: 'success',
                type: 'success',
            });
            setUpdationsValue(response.data);
            return response.data;
        } catch (error) {
            handleErrors(error);
        }
    };

    const onFinish = (value) => {
        updationsValue?.instruction?.length > 0 ?
            UpdatetInstructions(value)
            :
            AddPostInstruction(value);
    };

    const onFinishFailed = (error) => {
        toast.warn("Please fill in all the required details !");
    };

   
    return (
        <Fragment>
            <CustomCardView>
                <CustomPageTitle Heading={'Terms & Conditions'} />
                <br />
                <StyleBox>
                    <Form
                        form={form}
                        name={'memberlist'}
                        labelCol={{
                            span: 24,
                        }}
                        wrapperCol={{
                            span: 24,
                        }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <CustomTextArea
                            label={'Terms and condition'}
                            name={'instruction'}
                            rows={12}
                            rules={[
                                {
                                    required: true,
                                    message: 'This is a required field!',
                                },
                            ]}
                        />
                        {updationsValue?.instruction?.length > 0 ? (
                            <Flex center={true} margin={'30px 0px'}>
                                <Button.Primary text={' Update'} htmlType="submit" />
                            </Flex>
                        ) : (
                            <Flex center={true} margin={'30px 0px'}>
                                <Button.Danger text={'Submit'} htmlType="submit" />
                            </Flex>
                        )}
                    </Form>
                </StyleBox>
            </CustomCardView>

        </Fragment>
    );
};


