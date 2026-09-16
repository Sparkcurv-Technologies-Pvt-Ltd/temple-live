
import { Button, CustomAddSelect, CustomDatePicker, CustomInput, CustomInputNumber, CustomSelect, CustomTextArea } from '@components/form'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { Col, Form } from 'antd'
import React, { useEffect, useState } from 'react'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { AllChitList, getChitFundList } from '@modules/ChitFund/ChitFundSlice'
import dayjs from 'dayjs'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import request from '@request/request'
import { APIURLS } from '@request/apiUrls/urls'
import successHandler from '@request/successHandler'
import errorHandler from '@request/errorHandler'


export const ChitFundSettlementApplication = () => {

    const [form] = Form.useForm()

    const dispatch = useDispatch()
    const [getData, setGetData] = useState([])
    const [FundIdFind, setFundIdFind] = useState({})
    const [FundIdFindTrigger, setFundIdFindTrigger] = useState(0)
    const [InvestorFind, setInvestorFind] = useState({})
    const [InvestorTriggerFind, setInvestorTriggerFind] = useState(0)
    const [SelecteDAte, setSelecteDAte] = useState(dayjs().format("YYYY-MM-DD"))

    useEffect(() => {
        form.resetFields();
    }, [])

    useEffect(() => {
        GetInvestor()
    }, [FundIdFindTrigger])

    const GetInvestor = async (data) => {
        await request.get(APIURLS.INVESTOR__APPLICTION_SELECT_GET, data)
            .then(function (response) {
                setGetData(response.data)
                return response.data;
            })
            .catch(function (error) {
                // return errorHandler(error);
            })
    }

    // useEffect(() => {
    //     dispatch(getChitFundList())
    // }, [FundIdFindTrigger])

    // const AllDetails = useSelector(AllChitList)

    const chitfundoptions = getData?.map((fund) => ({
        label: fund?.chit_fund?.chit_name, value: fund?.chit_fund?.id
    }))

    useEffect(() => {
        form.setFieldsValue({
            chitt_fund: FundIdFind?.chit_fund?.id,
            chitt_fund_name: FundIdFind?.chit_fund?.chit_name
        })
    }, [FundIdFind, FundIdFindTrigger])

    const handleChooseFund = (value) => {
        const FindIDD = getData?.find((fId) => fId?.chit_fund?.id === value)
        setFundIdFind(FindIDD)
        setFundIdFindTrigger(FundIdFindTrigger + 1)
        form.resetFields(['invester_name']);
    }

    // investor Functions 

    const investersoptions = FundIdFind?.investers?.map((fund) => ({
        label: fund?.invester_name, value: fund?.id
    }))

    useEffect(() => {
        form.setFieldsValue({
            investers: InvestorFind?.id,
            invester_name: InvestorFind?.invester_name,
            display_investment_amt: Number(InvestorFind?.investment_amt || 0).toFixed(2),
            display_share_count: InvestorFind?.share_count ?? 0,
            display_share_amount: Number(
                InvestorFind?.collected_share_amount ?? InvestorFind?.share_amount ?? 0
            ).toFixed(2),
            display_total_amount: (
                Number(InvestorFind?.investment_amt || 0) +
                Number(InvestorFind?.collected_share_amount ?? InvestorFind?.share_amount ?? 0)
            ).toFixed(2),
        })
    }, [InvestorFind, InvestorTriggerFind])


    const handleInvester = (value) => {
        const FindInvestorID = FundIdFind?.investers?.find((fin) => fin?.id === value)
        setInvestorFind(FindInvestorID)
        setInvestorTriggerFind(InvestorTriggerFind + 1)
    }

    const onReset = () => {
        form.resetFields();
    }

    const handleSettlementDate = (date) => {
        setSelecteDAte(date)
    }

    const handleDate = (date) => { }



    const AddSettlementApplication = async (data) => {
        await request.post(APIURLS.ADD_SETTLEMENT_APPLICATION_POST, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: 'success',
                    type: 'success',
                })
                form.resetFields();
                setInvestorFind({})
                setFundIdFind({});
                GetInvestor();
                form.setFieldsValue({ 'invester_name': null })
                return response.data;
            })
            .catch(function (error) {
                if (error.response.status === 400) {
                    toast.error(error.response.data?.investers[0])
                } else { errorHandler(error); }
            })
    }

    const onFinish = (data) => {
        const FamDetails = {
            ...data,
            settlement_date:
                data?.settlement_date === null
                    ? ""
                    : dayjs(SelecteDAte).format("YYYY-MM-DD")
                        ? dayjs(data?.settlement_date).format("YYYY-MM-DD")
                        : dayjs(data?.settlement_date).format("YYYY-MM-DD"),
        }
        let Newdata = {
            settlement_date: FamDetails?.settlement_date,
            chit_fund_name: FamDetails?.chitt_fund_name,
            chitt_fund: FamDetails?.chitt_fund,
            invester_name: FamDetails?.invester_name,
            investers: FamDetails?.investers,
            comments: FamDetails?.comments || '',
        }
        AddSettlementApplication(Newdata)
    };

    const onFinishFailed = (errorInfo) => {
        toast.warn("Please fill in all the required details !");
    };


    return (

        <Form
            name='ChitfundSettlementApplication'
            form={form}
            labelCol={{
                span: 24,
            }}
            wrapperCol={{
                span: 24,
            }}
            initialValues={{
                date: dayjs(),
                settlement_date: dayjs(),
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off">
            <CustomCardView>
                <CustomRow space={[24, 24]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'Chit Fund Settlement Application'} width={'100%'} />
                    </Col>
                    <Col span={24} md={12}>
                        <Flex flexend={'right'}>
                            <CustomDatePicker name={'date'} onChange={handleDate} disabled />
                        </Flex>
                    </Col>

                    <Col span={24} md={12}>
                        <CustomSelect label={'Choose Chit Fund'} name={'chitt_fund_name'}
                            options={chitfundoptions} onChange={handleChooseFund}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select Chit Fund !',
                                }
                            ]}
                        />
                        <CustomInput name={'chitt_fund'} display={'none'} />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomSelect label={'Choose Investors'} name={'invester_name'}
                            options={investersoptions || []} onChange={handleInvester}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select Investers !',
                                }
                            ]}
                        />
                        <CustomInput name={'investers'} display={'none'} />
                    </Col>

                    <Col span={24} md={6}>
                        <CustomInput
                            label={'Invested Amount'}
                            name={'display_investment_amt'}
                            disabled
                            data-testid="settlement-invested-amt"
                        />
                    </Col>
                    <Col span={24} md={6}>
                        <CustomInput
                            label={'Share Count'}
                            name={'display_share_count'}
                            disabled
                            data-testid="settlement-share-count"
                        />
                    </Col>
                    <Col span={24} md={6}>
                        <CustomInput
                            label={'Share Amount'}
                            name={'display_share_amount'}
                            disabled
                            data-testid="settlement-share-amount"
                        />
                    </Col>
                    <Col span={24} md={6}>
                        <CustomInput
                            label={'Total Amount'}
                            name={'display_total_amount'}
                            disabled
                            data-testid="settlement-total-amount"
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomTextArea label={'Comments'} name={'comments'}
                        // rules={[
                        //     {
                        //         required: true,
                        //         message: 'Please Enter Comments !',
                        //     }
                        // ]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomDatePicker label={'Application Date'} name={'settlement_date'}
                            onChange={handleSettlementDate} disabled
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select Settlement Date !',
                                }
                            ]}
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
