
import { Button, CustomDatePicker, CustomInput, CustomInputNumber, CustomSelect, CustomTextArea, CustomUpload } from '@components/form'
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


export const ChitFundInvestors = () => {

    const dispatch = useDispatch()
    const [form] = Form.useForm()
    const [personType, setPersonType] = useState([])
    const [FundIdFind, setFundIdFind] = useState({})
    const [FundIdMemFind, setFundIdMemFind] = useState({})
    const [FundIdFindTrigger, setFundIdFindTrigger] = useState(0)
    const [FundIdMemFindTrigger, setFundIdMemFindTrigger] = useState(0)
    const [submitDisable, setSubmitDisable] = useState(false)
    const [AllChiTGet, setAllChiTGet] = useState([])
    const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [initialImageValue, setInitialImageValue] = useState([])
    const [initialImageValueDoct, setInitialImageValueDoct] = useState([])

    useEffect(() => {
        form.resetFields();
    }, [])

    useEffect(() => {
        dispatch(getChitFundList())
    }, [FundIdFindTrigger])

    const AllDetails = useSelector(AllChitList);

    // Feb 2026 (QA CHITFUND_001 fix): the Investor Amount must
    // reflect the CURRENT Demand Share Amount shown on
    // Chit Fund → List → View Details, not the static
    // ``fixed_chitfund_amount`` seed value. Same formula as
    // ChitFundListView.jsx:121-135.
    const computeDemandShareAmount = (fund) => {
        if (!fund) return 0;
        const investerCount = Number(fund.investers_share_count || 0);
        const mgmtCount = Number(fund.management_share_count || 0);
        const totalShares = investerCount + mgmtCount;
        if (!totalShares) return 0;
        const mgmtInvested = Number(fund.management_amt || 0);
        const outerInvest = Number(fund.outer_invest_amount || 0);
        const profitAmount = Number(fund.profit_amount || 0);
        const value = (mgmtInvested + outerInvest + profitAmount) / totalShares;
        return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
    }

    const handlePersonType = (value) => {
        setPersonType(value)
        const SendDetails = form.getFieldValue('chitt_fund')
        const MemberData = value

        const TotalData = {
            chit_fund: SendDetails,
            person_type: MemberData
        }

        if (SendDetails == undefined) {
            toast.error('select chit')

        } else {
            if (value === 'Member') {
                MemberChoosepost(TotalData)
                form.setFieldsValue({ 'invester_name': null })
                // form.resetFields(['invested_amount']);
                form.setFieldsValue({ invested_amount: computeDemandShareAmount(FundIdFind) })
            }
        }
        if (value === 'Other') {
            setAllChiTGet([]);
            // form.resetFields(['invested_amount']);
            // form.resetFields();
            form.setFieldsValue({ invested_amount: computeDemandShareAmount(FundIdFind) })
            form.setFieldsValue({ 'invester_name': null, })
            form.setFieldsValue({ chitt_fund_name: FundIdFind?.chit_name, chitt_fund: FundIdFind?.id })
        }

        form.resetFields(['invester_name', 'invester_mobile', 'invester_email', 'invester_member', 'invester_address'])

    }

    const MemberChoosepost = async (data) => {
        await request.post(APIURLS.CHIT_IDSEND, data)
            .then(function (response) {
                setAllChiTGet(response.data)
                return response.data;
            })
            .catch(function (error) {
            })
    }

    //---------- Choose chit fund options --------------
    const chitfundoptions = AllDetails?.map((fund) => ({ label: fund?.chit_name, value: fund?.id }))

    //-------------

    const handleChooseFund = (value) => {
        const FindChitFundDetails = AllDetails?.find((fId) => fId?.id === value)
        setFundIdFind(FindChitFundDetails)
        form.setFieldsValue({ chitt_fund_name: FindChitFundDetails?.chit_name })
        form.setFieldsValue({ invested_amount: computeDemandShareAmount(FindChitFundDetails) })

        setFundIdFindTrigger(FundIdFindTrigger + 1)
        form.resetFields(['invester_type']);
        // form.resetFields(['invested_amount']);
        setFundIdMemFind({})
        setPersonType([])
        // form.setFieldsValue({ 'invester_name': null })
    }

    // Member find 

    useEffect(() => {
        form.setFieldsValue({
            invester_member: FundIdMemFind?.id,
            invester_address: FundIdMemFind?.address,
            invester_email: FundIdMemFind?.member_email,
            invester_mobile: FundIdMemFind?.member_mobile_number,
            invester_name: FundIdMemFind?.member_name,
            // invested_amount: FundIdMemFind?.invested_amount,
        })
    }, [FundIdMemFind, FundIdMemFindTrigger])

    const membersoptions = AllChiTGet?.map((fund) => ({ label: fund?.member_name, value: fund?.id }))

    const handleMemberFind = (value) => {
        const FindMemIDD = AllChiTGet?.find((fId) => fId?.id === value)
        setFundIdMemFind(FindMemIDD)
        setFundIdMemFindTrigger(FundIdMemFindTrigger + 1)
    }

    const persontypeoptions = [
        {
            label: 'Member',
            value: 'Member'
        },
        {
            label: 'Other',
            value: 'Other'
        }
    ]

    const onReset = () => {
        form.resetFields();
    }

    const handleDate = (date) => {

    }

    const handleOnChange = (date) => {
        setSelectedDate(date);
    };

const handlesharecount = () => {
    const InvestorAmt = form.getFieldValue('invested_amount')
    const ShareCount = form.getFieldValue('share_count')

    const InvesMentAmt = Number((InvestorAmt * ShareCount).toFixed(2))
    form.setFieldsValue({ investment_amt: InvesMentAmt })

    if (InvesMentAmt < 0) {
        setSubmitDisable(true)
    } else {
        setSubmitDisable(false)
    }
}

    const AddFundInvestor = async (data) => {
        await request.post(APIURLS.ADD_CHITINVESTOR, data)
            .then(function (response) {
                if (response.status === 201) {
                    successHandler(response, {
                        notifyOnSuccess: true,
                        notifyOnFailed: true,
                        msg: 'success',
                        type: 'success',
                    })
                    form.resetFields();
                }
                setPersonType([])
                return response.data;

            })
            .catch(function (error) {
                if (error.response.status == 400) {
                    toast.error(error.response.data?.invester_mobile?.[0])
                }
                else {
                    return errorHandler(error);
                }
            })
    }

    const onFinish = (data) => {
        const FamDetails = {
            ...data,
            joining_date:
                data?.joining_date === null
                    ? ""
                    : dayjs(selectedDate).format("YYYY-MM-DD")
                        ? dayjs(data?.joining_date).format("YYYY-MM-DD")
                        : dayjs(data?.joining_date).format("YYYY-MM-DD"),
        }

        const formData = new FormData();
        formData.append('chitt_fund_name', FamDetails?.chitt_fund_name);
        formData.append('chitt_fund', FamDetails?.chitt_fund);
        formData.append('joining_date', FamDetails?.joining_date);
        formData.append('invester_type', FamDetails?.invester_type);
        formData.append('invester_name', FamDetails?.invester_name);
        {
            FamDetails?.invester_type === "Other" ?
                null
                :
                formData.append('invester_member', FamDetails?.invester_member)
        }
        formData.append('invester_mobile', FamDetails?.invester_mobile);
        if(FamDetails?.invester_email){
            formData.append('invester_email', FamDetails?.invester_email);
        }
        formData.append('invester_address', FamDetails?.invester_address);
        formData.append('comments', FamDetails?.comments || '');
        formData.append('invested_amount', FamDetails?.invested_amount);
        formData.append('share_count', FamDetails?.share_count);
        formData.append('investment_amt', FamDetails?.investment_amt);

        if (FamDetails?.images && FamDetails.images.length > 0) {
            FamDetails.images.forEach((file) => {
                formData.append(`images`, file.originFileObj);
            });
        } else {
            console.error('No images selected');
        }

        if (FamDetails?.documents && FamDetails.documents.length > 0) {
            FamDetails.documents.forEach((file) => {
                formData.append(`documents`, file.originFileObj);
            });
        } else {
            console.error('No images selected');
        }
        // console.log([...formData.entries()], 'chitinvestorpost');

        AddFundInvestor(formData)

    };

    const onFinishFailed = (errorInfo) => {
        toast.warn("Please fill in all the required details !");
    };

    useEffect(() => {
        if (submitDisable == true) {
            toast.warn("Total Investment Amount value is negative")
        } else {
            console.log('ki');
        }
    }, [submitDisable])

    return (

        <Form
            name='ChitFundInvestors'
            form={form}
            labelCol={{
                span: 24,
            }}
            wrapperCol={{
                span: 24,
            }}
            initialValues={{
                date: dayjs(),
                joining_date: dayjs()
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off">
            <CustomCardView>
                <CustomRow space={[24, 24]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'Add Chit Fund Investers'} />
                    </Col>
                    <Col span={24} md={12}>
                        <Flex flexend={'right'}>
                            <CustomDatePicker name={'date'} onChange={handleDate} disabled={true} />
                        </Flex>
                    </Col>

                    <Col span={24} md={12}>
                        <CustomSelect label={'Choose Chit Fund'} name={'chitt_fund'}
                            options={chitfundoptions} onChange={handleChooseFund}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select a Chit Fund !',
                                }
                            ]}
                        />
                        <CustomInput name={'chitt_fund_name'} display={'none'}   />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomSelect label={'Person Type'} name={'invester_type'}
                            options={persontypeoptions} onChange={handlePersonType}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select Chit Fund !',
                                }
                            ]}
                        />
                    </Col>

                    {
                        personType === 'Member' ?
                            <Col span={24} md={12}>
                                <CustomSelect label={'Choose Investers'} name={'invester_name'}
                                    options={membersoptions} onChange={handleMemberFind} rules={[
                                        {
                                            required: true,
                                            message: 'Please Select Members !',
                                        }
                                    ]}
                                />
                                <CustomInput name={'invester_member'} display={'none'} />
                            </Col> :
                            <Col span={24} md={12}>
                                <CustomInput label={'Invester Name'} name={'invester_name'}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please Select Members !',
                                        }
                                    ]}
                                />
                            </Col>
                    }
                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Mobile Number'} name={'invester_mobile'} maxLength={10}
                            onKeyPress={(event) => {
                                if (!/[0-9]/.test(event.key)) {
                                    event.preventDefault();
                                }
                            }}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Mobile Number !',
                                }
                            ]}
                        />
                    </Col>


                    <Col span={24} md={12}>
                        <CustomInput label={'Email'} name={'invester_email'} type={'email'}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomDatePicker label={'Joining Date'} name={'joining_date'} disabled
                            placeholder={'Choose'} onChange={handleOnChange}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Joining Date !',
                                }
                            ]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomTextArea label={'Address'} name={'invester_address'}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Address !',
                                }
                            ]}
                        />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomTextArea label={'Comments'} name={'comments'} />
                    </Col>

                    <Col span={24} md={8}>
                        <CustomInputNumber label={'Invested Amount'} suffix={'₹'}
                            name={'invested_amount'} disabled />
                    </Col>
                    <Col span={24} md={4}>
                        <CustomInputNumber label={'share Count'} name={'share_count'}
                            onChange={handlesharecount} />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Total Investment Amount'} name={'investment_amt'}
                            suffix={'₹'} disabled rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Invested Amount!',
                                }
                            ]}
                        />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomUpload label={'Photo'} name={'images'} maxCount={1} form={form}
                            initialValue={initialImageValue} accept={'.png,.jpeg,.jpg'}
                        // rules={[
                        //     {
                        //         required: true,
                        //         message: 'Please Upload Photo !',
                        //     }
                        // ]}
                        />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomUpload label={'Document'} name={'documents'} maxCount={1}
                            form={form} initialValue={initialImageValueDoct} accept=".pdf,.doc,.docx"
                        // rules={[
                        //     {
                        //         required: true,
                        //         message: 'Please Upload Document !',
                        //     }
                        // ]}
                        />
                    </Col>


                </CustomRow>

                <Flex center gap={'20px'} style={{ margin: '30px' }}>
                    <Button.Danger text={'Submit'} htmlType={'submit'} disabled={submitDisable == true ? true : false} />
                    <Button.Success text={'Reset'} onClick={onReset} />
                </Flex>
            </CustomCardView>

        </Form>
    )
}
