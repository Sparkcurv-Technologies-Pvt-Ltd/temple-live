
import { Button, CustomAddSelect, CustomDatePicker, CustomInput, CustomInputNumber, CustomSelect, CustomSwitch, CustomTextArea } from '@components/form'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { Col, Form } from 'antd'
import React, { useEffect, useState } from 'react'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import request from '@request/request'
import { useDispatch, useSelector } from 'react-redux'
import { AllChitFundProfitDetail, getChitFundProfit } from '@modules/ChitFund/ChitFundSlice'
import { APIURLS } from '@request/apiUrls/urls'
import errorHandler from '@request/errorHandler'
import successHandler from '@request/successHandler'

export const ChitFundDistribution = () => {

    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const [chooseFundID, setChooseFundID] = useState({});
    const [chooseFundIDTrigger, setChooseFundIDTrigger] = useState(0);
    const [GetDetails, setGetDetails] = useState();
    const [Selectdate, setSelectdate] = useState(dayjs().format("YYYY-MM-DD"));
    const [profitSwitch, setProfitSwitch] = useState(false);

    useEffect(() => {
        form.resetFields();
    }, [])

    useEffect(() => {
        dispatch(getChitFundProfit());
    }, [chooseFundIDTrigger])

    const FundChoose = useSelector(AllChitFundProfitDetail)

    const chitfundoptions = FundChoose?.map((fund) => ({ label: fund?.chit_name, value: fund?.id }))

    useEffect(() => {
        form.setFieldsValue({
            chitt_fund: chooseFundID?.id,
            chit_fund_name: chooseFundID?.chit_name
        })
    }, [chooseFundID, chooseFundIDTrigger])

    //------------- Choose Fund Select Fn-----------------
    const handlechooseFund = (value) => {
        const FindFundID = FundChoose?.find((ID) => ID?.id === value)
        setChooseFundID(FindFundID);
        setChooseFundIDTrigger(chooseFundIDTrigger + 1)
        const ValueChit = {
            chit_fund: value
        }
        ChooseFundPOstSEnd(ValueChit);
        setGetDetails([]);
    }

    //------------------------
    useEffect(() => {
        form.setFieldsValue({
            outside_amount: GetDetails?.outside_amount,
            total_amount: GetDetails?.total_amount,
            profit_amount: GetDetails?.profit_amount,
            management_invested_amount: GetDetails?.management_amt,
            // per_head_share_amount: GetDetails?.per_head_share,
            management_share: GetDetails?.management_share,
            distribution_percent: GetDetails?.distribution_percent,
        })
    }, [GetDetails])
    //------Choose Chit Fund Post --------------
    const ChooseFundPOstSEnd = async (data) => {
        await request.post(APIURLS.PROFIT_CHITFUND_POST, data)
            .then(function (response) {
                if (response?.status === 226) {
                    toast.warn(response?.data?.Message)
                }
                else {
                    setGetDetails(response.data);
                }
                return response.data;
            })
            .catch(function (error) {
                if (error.response?.status === 302) {
                    toast.error(error?.response.data?.message)
                } else {
                    return errorHandler(error);
                }
            })
    }
    //-----------------------
    const onReset = () => {
        form.resetFields();
    }

    const handleDate = (date) => {
        setSelectdate(date)
    }

    const handlechange = (value) => {
        setProfitSwitch(value);
        form.resetFields(['chit_fund_name'])
        form.resetFields();
    }

    const ADDCLOSEDPROFIT = async (data) => {
        await request.post(APIURLS.TOTAL_CHITFUND_PROFIT, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: 'success',
                    type: 'success',
                })
                dispatch(getChitFundProfit());
                form.resetFields();
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            })
    }


    const ADDONLYPROFIT = async (data) => {
        await request.post(APIURLS.CHITFUND_ONLY_PROFIT_DISTRIBUTION, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: 'success',
                    type: 'success',
                })
                dispatch(getChitFundProfit());
                form.resetFields();
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            })
    }


    const onFinish = (data) => {
        const FamDetails = {
            ...data,
            distribution_date:
                data?.distribution_date === null
                    ? ""
                    : dayjs(Selectdate).format("YYYY-MM-DD")
                        ? dayjs(data?.distribution_date).format("YYYY-MM-DD")
                        : dayjs(data?.distribution_date).format("YYYY-MM-DD"),
        }

        let NewValues = {
            distribution_date: FamDetails?.distribution_date,
            chit_fund_name: FamDetails?.chit_fund_name,
            chitt_fund: FamDetails?.chitt_fund,
            outside_amount: FamDetails?.outside_amount,
            management_invested_amount: FamDetails?.management_invested_amount,
            management_share: FamDetails?.management_share,
            total_amount: FamDetails?.total_amount,
            profit_amount: FamDetails?.profit_amount,
            // per_head_share_amount: FamDetails?.per_head_share_amount,
            distribution_percent: FamDetails?.distribution_percent,
        }
        if (profitSwitch) {
            ADDONLYPROFIT(NewValues);
        }
        else {
            ADDCLOSEDPROFIT(NewValues);
        }
    };

    const onFinishFailed = (errorInfo) => {
        toast.warn("Please fill in all the required details !");
    };

    return (

        <Form
            name='ChitFundDistribution'
            form={form}
            labelCol={{
                span: 24,
            }}
            wrapperCol={{
                span: 24,
            }}
            initialValues={{
                distribution_date: dayjs()
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off">
            <CustomCardView>
                <CustomRow space={[24, 24]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'Chit Fund Profit Distribution'} width={'100%'} />
                    </Col>
                    <Col span={24} md={12}>
                        <Flex flexend={'right'}>
                            <CustomDatePicker name={'distribution_date'} onChange={handleDate} disabled />
                        </Flex>
                    </Col>
                    <Col span={24} md={24} style={{ marginTop: "20px" }}>
                        <CustomSwitch
                            name={"profit"}
                            onChange={handlechange}
                            leftLabel={"Closed"}
                            rightLabel={"Profit"}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomSelect label={'Choose Chit Fund'} name={'chit_fund_name'}
                            options={chitfundoptions} onChange={handlechooseFund}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select Chit Fund !',
                                }
                            ]}
                        />
                        <CustomInput name={'chitt_fund'} display={'none'} disabled/>
                    </Col>

                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Amount From Outside'} name={'outside_amount'} suffix={'₹'}

                           disabled={true}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Total Management Invested Amount'}
                            name={'management_invested_amount'} disabled={true}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Total Management Invested Amount !',
                                }
                            ]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Management share'}
                            name={'management_share'} disabled={true}

                        />
                    </Col>


                    <Col span={24} md={12}>

                        <CustomInputNumber label={'Available Amount'} name={'total_amount'} disabled={true}
                        
                        />
                    </Col>

                    <Col span={24} md={12}>

                        <CustomInputNumber label={'Profit Amount'} name={'profit_amount'} disabled={true}/>
                   
                    </Col>

                    {/* <Col span={24} md={12}>
                        <CustomInputNumber label={'Profit Distribution Amount'} name={'per_head_share_amount'} suffix={'₹'}
                            disabled={true}
                        />
                    </Col> */}
                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Distribution Percent'}
                            name={'distribution_percent'} suffix={'%'} disabled={true} />
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
