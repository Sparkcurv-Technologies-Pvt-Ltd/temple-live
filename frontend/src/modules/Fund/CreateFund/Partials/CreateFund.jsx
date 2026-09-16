
import { Button, CustomAddSelect, CustomDatePicker, CustomInput, CustomInputNumber, CustomSelect, CustomTextArea } from '@components/form'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { Col, Form } from 'antd'
import React, { useEffect, useState } from 'react'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { APIURLS } from '@request/apiUrls/urls'
import successHandler from '@request/successHandler'
import request from '@request/request'
import errorHandler from '@request/errorHandler'
import dayjs from 'dayjs'
import { getCreatedFund } from '../../FundSlice'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

export const CreateFund = ({ updatefundlist, closee, fundtrigger }) => {

    const [form] = Form.useForm()
    const dispatch = useDispatch()

    const [fundDate, setFundDate] = useState(dayjs().format("YYYY-MM-DD"))
    const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"))
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"))
    const [fundType, setFundType] = useState([])

    useEffect(() => {
        form.resetFields();
    }, [])

    useEffect(() => {
        if (updatefundlist) {
            SetFundDetails()
        }
    }, [updatefundlist, fundtrigger])

    const FundOptions = [
        {
            label: 'Normal', value: 'Normal'
        },
        {
            label: 'Fund 20', value: 'Fund 20'
        },
        {
            label: 'Fund 21', value: 'Fund 21'
        },
    ]
    const handleFundType = (value) => {
        setFundType(value)
    }

    const SetFundDetails = () => {

        const dateFormat = 'YYYY/MM/DD';

        const fundofdate = new Date(updatefundlist?.date);
        const fundDate = dayjs(fundofdate).format(dateFormat);

        const fundofday = new Date(updatefundlist?.start_date);
        const fundday = dayjs(fundofday).format(dateFormat);

        const fundofdays = new Date(updatefundlist?.end_date);
        const funddays = dayjs(fundofdays).format(dateFormat);

        // form.setFieldsValue(updatefundlist)
        form.setFieldsValue({
            date: dayjs(fundDate, dateFormat),
            start_date: dayjs(fundday, dateFormat),
            end_date: dayjs(funddays, dateFormat)
        })
        form.setFieldsValue({ fund_name: updatefundlist?.fund_name })
        form.setFieldsValue({ fund_type: updatefundlist?.fund_type })
        form.setFieldsValue({ fund_count: updatefundlist?.fund_count })

    }

    const onReset = () => {
        form.resetFields();
    }

    const handleDate = (date) => {
        setFundDate(date)
    }

    const handleStartDate = (date) => {
        setStartDate(date)
    }

    const handleEndDate = (date) => {
        setEndDate(date)
    }
    const CreateFundPost = async (data) => {
        await request.post(APIURLS.POST_CREATE_FUND, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: 'Fund Created Successfully ! ',
                    type: 'success',
                })
                form.resetFields()
                dispatch(getCreatedFund())
                setFundType([]);
                return response.data;
            })
            .catch(function (error) {
                if (error.response.status === 400) {
                    if (error.response.data?.start_date) {
                        toast.error(error.response.data?.start_date[0])
                    } else if (error.response.data?.end_date) {
                        toast.error(error.response.data?.end_date[0])
                    } else {
                        toast.error('Some Error')
                    }
                } else {
                    errorHandler(error);
                }
            })
    }

    const UpdateFund = async (data) => {
        await request.put(`${APIURLS.PUT_FUND_DETAILS}${updatefundlist?.id}/`, data)
            .then(function (response) {

                if (response.status === 226) {
                    toast.warn(response.data?.Message)
                }
                else {
                    successHandler(response, {
                        notifyOnSuccess: true,
                        notifyOnFailed: true,
                        msg: "success",
                        type: "info",
                    })
                    form.resetFields()
                    dispatch(getCreatedFund())
                    closee();
                }
                return response.data;
            })
            .catch(function (error) {
                if (error.response.status === 400) {
                    if (error.response.data?.start_date) {
                        toast.error(error.response.data?.start_date[0])
                    } else if (error.response.data?.end_date) {
                        toast.error(error.response.data?.end_date[0])
                    } else {
                        toast.error('Some Error')
                    }
                } else {
                    errorHandler(error);
                }
            })
    }

    const onFinish = (data) => {
        const NewData = {
            ...data, date: fundDate, start_date: startDate,
            end_date: data?.end_date === null ? '' : dayjs(endDate).format('YYYY-MM-DD') ? dayjs(data?.end_date).format('YYYY-MM-DD') : dayjs(data?.end_date).format('YYYY-MM-DD'),

        }
        if (updatefundlist) {
            UpdateFund(NewData)
        } else {
            CreateFundPost(NewData)
        }
    };

    const onFinishFailed = (errorInfo) => {
        toast.warn("Please fill in all the required details !");
    };


    return (

        <Form
            name='AddFund'
            form={form}
            labelCol={{
                span: 24,
            }}
            wrapperCol={{
                span: 24,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            initialValues={{ date: dayjs() }}
            autoComplete="off">
            <CustomCardView>
                {
                    updatefundlist ? (<CustomPageTitle Heading={'Update Fund'} />) : (<CustomPageTitle Heading={'Add Fund'} />)
                }
                <CustomRow space={[24, 24]}>
                    <Col span={24} md={12}>
                    </Col>
                    <Col span={24} md={12}>
                        <Flex flexend={'right'}>
                            <CustomDatePicker name={'date'} onChange={handleDate} disabled/>
                        </Flex>
                    </Col>

                    <Col span={24} md={12}>
                        <CustomInput label={'Fund Name'} name={'fund_name'}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Fund Name !',
                                }
                            ]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomDatePicker label={'Start Date'} name={'start_date'} onChange={handleStartDate}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select From Date !',
                                }
                            ]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomDatePicker label={'End Date'} name={'end_date'} onChange={handleEndDate}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select End Date !',
                                }
                            ]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomSelect label={'Fund Type'} name={'fund_type'} options={FundOptions} onChange={handleFundType}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select Fund Type!',
                                }
                            ]}
                        />
                    </Col>
                    {/* {fundType === 'Normal'&&
                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Fund Count'} name={'fund_count'}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Fund Count !',
                                }
                            ]}
                        />
                    </Col> } */}

                </CustomRow>

                <Flex center gap={'20px'} style={{ margin: '30px' }}>
                    {updatefundlist ?
                        <>
                            <Button.Danger text={'Update'} htmlType={'submit'} />
                            <Button.Success text={'Cancel'} onClick={closee} />
                        </>
                        :
                        <>
                            <Button.Danger text={'Submit'} htmlType={'submit'} />
                            <Button.Success text={'Reset'} onClick={onReset} />
                        </>
                    }
                </Flex>
            </CustomCardView>

        </Form>
    )
}
