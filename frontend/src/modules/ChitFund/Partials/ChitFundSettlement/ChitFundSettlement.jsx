
import { Button, CustomDatePicker, CustomInput, CustomInputNumber, CustomSelect } from '@components/form'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { Col, Form } from 'antd'
import React, { useEffect, useState } from 'react'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'
import request from '@request/request'
import { APIURLS } from '@request/apiUrls/urls'
import successHandler from '@request/successHandler'
import errorHandler from '@request/errorHandler'


export const ChitFundSettlement = () => {

    const [form] = Form.useForm()

    const [getData, setGetData] = useState([])
    const [FundIdFind, setFundIdFind] = useState({})
    const [FundIdFindTrigger, setFundIdFindTrigger] = useState(0)


    useEffect(() => {
        form.resetFields();
    }, [])

    useEffect(() => {
        GetInvestor()
    }, [FundIdFindTrigger])

    const GetInvestor = async (data) => {
        await request.get(APIURLS.SETTLEMENT_SELECT_URL, data)
            .then(function (response) {
                setGetData(response.data)
                return response.data;
            })
            .catch(function (error) {
                // console.log(error.response, 'jjj error');
                // return errorHandler(error);
            })
    }

    // useEffect(() => {
    //     dispatch(getChitFundList())
    // }, [FundIdFindTrigger])

    // const AllDetails = useSelector(AllChitList)

    const chitfundoptions = getData?.map((fund) => ({
        // label: fund?.application?.chit_fund_name, 
        label: `${fund?.application?.chit_fund_name}/${fund?.investers?.invester_name}`,
        value: fund?.application?.id
    }))

    useEffect(() => {
        form.setFieldsValue({
            chitt_fund: FundIdFind?.application?.chitt_fund,
            chit_fund_name: FundIdFind?.application?.chit_fund_name,
            chit_fund_name_inves: `${FundIdFind?.application?.chit_fund_name || ''}${FundIdFind?.application?.chit_fund_name ? '/' : ''}${FundIdFind?.investers?.invester_name || ''}`,
            final_settlement_amt: FundIdFind?.investers?.final_settlement_amount,
            invested_amt: FundIdFind?.investers?.investment_amt,
            investers: FundIdFind?.application?.investers,
            share_amt: FundIdFind?.investers?.share_amount,
            application_date: FundIdFind?.investers?.application_date,
            date_of_investment: FundIdFind?.investers?.joining_date,
            invester_name: FundIdFind?.investers?.invester_name,
            chitt_settilement:FundIdFind?.application?.id

        })
    }, [FundIdFind, FundIdFindTrigger])

    const handleChooseFund = (value) => {
        const FindIDD = getData?.find((fId) => fId?.application?.id === value)
        setFundIdFind(FindIDD)
        setFundIdFindTrigger(FundIdFindTrigger + 1)
        form.resetFields(['invester_name']);
    }

   
    const onReset = () => {
        form.resetFields();
    }

    const handleApplicationDate = (date) => { }

    const handleDate = (date) => { }
    
    const AddSettlement = async (data) => {
        await request.post(APIURLS.ADD_SETTLEMENT_POST, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: 'success',
                    type: 'success',
                })
                form.resetFields();
                return response.data;
            })
            .catch(function (error) {
                if (error.response.status === 400) {
                    if (error.response.data?.investers) {
                        toast.error(error.response.data?.investers[0])
                    }
                } else {
                    return errorHandler(error);
                }
            })
    }
    const onFinish = (data) => {
        AddSettlement(data)
    };

    const onFinishFailed = (errorInfo) => {
        toast.warn("Please fill in all the required details !");
    };

    return (

        <Form
            name='ChitFundSettlement'
            form={form}
            labelCol={{
                span: 24,
            }}
            wrapperCol={{
                span: 24,
            }}
            initialValues={{
                date: dayjs()
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off">
            <CustomCardView>
                <CustomRow space={[24, 24]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'Chit Fund Settlement'} />
                    </Col>
                    <Col span={24} md={12}>
                        <Flex flexend={'right'}>
                            <CustomDatePicker name={'date'} onChange={handleDate} disabled={'true'} />
                        </Flex>
                    </Col>

                    <Col span={24} md={12}>
                        <CustomSelect label={'Choose Chit Fund'} name={'chit_fund_name_inves'}
                            options={chitfundoptions} onChange={handleChooseFund}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select Chit Fund !',
                                }
                            ]}
                        />
                        <CustomInput name={'chit_fund_name'} display={'none'} />
                        <CustomInput name={'chitt_settilement'} display={'none'} />
                        <CustomInput name={'chitt_fund'} display={'none'} />
                    </Col>

                    {/* <Col span={24} md={12}>
                        <CustomSelect label={'Choose Investors'} name={'invester_name'}
                            options={investersoptions || []} onChange={handleInvester}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select Investers !',
                                }
                            ]}
                        />
                        <CustomInput name={'investers'} />
                    </Col> */}

                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Invested Amount'} name={'invested_amt'}
                            suffix={'₹'} disabled
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Invested Amount !',
                                }
                            ]}
                        />
                        <CustomInput name={'investers'} display={'none'} />
                        <CustomInput name={'invester_name'} display={'none'} />

                    </Col>

                    <Col span={24} md={12}>
                        <CustomInput label={'Date of Investment'} name={'date_of_investment'}
                            // onChange={handleInvestmentDate} 
                            disabled
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select Date of Investment !',
                                }
                            ]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Share Amount'} name={'share_amt'}
                            disabled rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Share Amount !',
                                }
                            ]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Final Settlement Amount'} disabled
                            name={'final_settlement_amt'} rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Final Settlement Amount !',
                                }
                            ]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomInput label={'Application Date'} name={'application_date'} onChange={handleApplicationDate} disabled
                        // rules={[
                        //     {
                        //         required: true,
                        //         message: 'Please Select Application Date !',
                        //     }
                        // ]}
                        />
                    </Col>

                </CustomRow>

                <Flex center gap={'20px'} style={{ margin: '30px' }}>
                    <Button.Danger text={'Submit'} htmlType={'submit'} />
                    <Button.Success text={'Reset'} onClick={onReset} />
                </Flex>
            </CustomCardView>

        </Form>
    )
}
