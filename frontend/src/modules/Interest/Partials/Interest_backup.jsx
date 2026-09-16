import { Button, CustomCheckBox, CustomDatePicker, CustomInput, CustomInputNumber, CustomSelect, CustomTextArea, CustomUpload } from '@components/form';
import { CustomModal, CustomRow, Flex } from '@components/others';
import { CustomCardView } from '@components/others'
import { CustomPageFormTitle, CustomPageFormTitle2, CustomPageTitle } from '@components/others/CustomPageTitle';
import { APIURLS } from '@request/apiUrls/urls';
import errorHandler from '@request/errorHandler';
import request from '@request/request';
import successHandler from '@request/successHandler';
import { Col, Form, Spin } from 'antd'
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

export const Interest = ({ RecordData, ClosUpdaForm, manageTrigger }) => {

    const [form] = Form.useForm();
    
    const [isLoading, setIsLoading] = useState(false);
    const [planTypeChoose, setPlanTypeChoose] = useState({});
    const [trigger, setTrigger] = useState(0);
    const [update, setUpdate] = useState(0);

    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState(null);
    const [ShowChooseMemb, setShowChooseMemb] = useState({})
    const [ShowChooseType, setShowChooseType] = useState({})
    const [boxChecked, setBoxChecked] = useState(false)
    const [radioChecked, setRadioChecked] = useState(false)
    const [ShowChooseNamineMemb, setShowChooseNamineMemb] = useState({})
    const [memberSelectDetails, setMemberSelectDetails] = useState([])
    const [memberFindDetails, setMemberFindDetails] = useState({})
    const [memberFindNomineDetails, setMemberFindNomineDetails] = useState({})
    const [memberTrigger, setMemberTrigger] = useState(0)
    const [ImgeShow, setImgeShow] = useState([]);
    const [showDate, setShowDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [categoryChoose, setCategoryChoose] = useState({})
    const [ChFundOption, setChFundOption] = useState([])
    const [FundChooseID, setFundChooseID] = useState({})
    const [FundChooseIDTrigger, setFundChooseIDTrigger] = useState(0)

    const [ImageIntialValue, setImageIntialValue] = useState([]);
    const [disablePenalty, setDisablePenalty] = useState(false);
    const [disableRate, setDisableRate] = useState(false);
    const [penalty, setpenalty] = useState("percentage");
    const [rateType, setRateType] = useState("amount");   // Feb 2026 — ₹ only
    const [fixAmtType, setFixAmtType] = useState("percentage");
    const [finalAmt, setFinalAmt] = useState(0);
    const [MonthDays, setMonthDays] = useState({});


    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    useEffect(() => {
        if (trigger) {
            setShowDate(dayjs().format("YYYY-MM-DD"))
        }
        // else {
        //     setShowDate()
        // }
    }, [trigger])

    const interestOption = [
        {
            label: 'Management Interest',
            value: 'Management Interest'
        },
        {
            label: 'Chit Fund',
            value: 'Chit fund Interest'
        }
    ]

    const categoryOption = [
        {
            label: 'Interest',
            value: 'Interest'
        },
        {
            label: 'Interest with capital',
            value: 'Interest with capital'
        },
        {
            label: 'Installment Interest',
            value: 'Installment Interest'
        }
    ]

    const peopletypeOption = [
        {
            label: 'Member',
            value: 'Member'
        },
        {
            label: 'Other',
            value: 'Other'
        }
    ]

    const peopletypeNomiOption = [
        {
            label: 'Member',
            value: 'Member'
        },
        {
            label: 'Other',
            value: 'Other'
        }
    ]

    const ChoosePlan = [
        {
            label: 'Week',
            value: 'Week'
        },
        {
            label: 'Month',
            value: 'Month'
        },
        {
            label: 'Days',
            value: 'Days'
        }
    ]

    const MemberChooseOpt = memberSelectDetails?.map((mem) => ({ label: mem?.member?.member_name, value: mem?.member?.id }))

    const chooseFundOption = ChFundOption?.map((fun) => ({ label: fun?.chit_name, value: fun?.id }))

    useEffect(() => {
        form.setFieldsValue({
            chitt_fund: FundChooseID?.id,
            chit_name: FundChooseID?.chit_name,
            fix_interest_rate_percent: FundChooseID?.set_intrest_percent
        })
    }, [FundChooseID, FundChooseIDTrigger])

    const handleChangeFund = (value) => {
        const FindFundID = ChFundOption?.find((ID) => ID?.id === value)
        setFundChooseID(FindFundID)
        setFundChooseIDTrigger(FundChooseIDTrigger + 1)

        form.resetFields(['principal_amt', 'fix_interest_rate_percent', 'interest_amt',
            'penalty_amount', 'penalty_type', 'interest_period', 'interest_period_type', 'installment_amt',
            'apply_first_interest', 'final_amt_given', 'apply_first_interest'])
    }
    // Category choose data 

    const handleCategory = (value) => {
        setCategoryChoose(value);
        form.resetFields(['principal_amt', 'fix_interest_rate_percent', 'interest_amt',
            'penalty_amount', 'penalty_type', 'interest_period', 'interest_period_type', 'installment_amt',
            'apply_first_interest', 'final_amt_given', 'apply_first_interest', 'chit_name', 'chit_fund'])
    }

    // Normal member schooice 

    useEffect(() => {
        form.setFieldsValue({
            people_member: memberFindDetails?.member?.id,
            people_name: memberFindDetails?.member?.member_name,
            people_email: memberFindDetails?.member?.member_email,
            people_mobile: memberFindDetails?.member?.member_mobile_number,
            people_address: memberFindDetails?.address,
        })

    }, [memberFindDetails, memberTrigger])

    const handleFindMember = (value) => {

        const FindMEmId = memberSelectDetails?.find((find) => find?.member?.id === value)
        setMemberFindDetails(FindMEmId)
        setMemberTrigger(memberTrigger + 1)

        const imagesToShow = memberSelectDetails
            ?.filter((img) => img?.member?.id === value).map((img) => img?.member?.member_photo);
        setImgeShow(imagesToShow);
    }

    // Nomine member schooice 

    useEffect(() => {
        form.setFieldsValue({
            nominee_member: memberFindNomineDetails?.member?.id,
            nominee_member_name: memberFindNomineDetails?.member?.member_name,
            nominee_mobile_no: memberFindNomineDetails?.member?.member_mobile_number,
            nominee_address: memberFindNomineDetails?.address,
        })
    }, [memberFindNomineDetails, memberTrigger])

    const handleFindNomineMember = (value) => {
        const FindNomineMEmId = memberSelectDetails?.find((find) => find?.member?.id === value);
        setMemberFindNomineDetails(FindNomineMEmId);
        // setMemberTrigger(memberTrigger + 1)
    }


    const handleChooseType = (value) => {
        setShowChooseType(value)
        if (value === 'Chit fund Interest') {
            GetChitFundDetail()
        }
        form.resetFields(['principal_amt', 'fix_interest_rate_percent', 'interest_amt',
            'penalty_amount', 'penalty_type', 'interest_period', 'interest_period_type', 'installment_amt',
            'apply_first_interest', 'final_amt_given', 'apply_first_interest', 'chit_name', 'chit_fund'])
    }

    const HandlePlptypeMembFind = (value) => {
        setShowChooseMemb(value)
        if (value === 'Member') {
            GetMemberDetails()
        } else {
            console.log('gg');
        }
        setMemberFindDetails([])
        setImgeShow([])
    }

    const HandlePlptypeNamineeMembFind = (value) => {
        setShowChooseNamineMemb(value)
        if (value === 'Member') {
            GetMemberDetails()
        }
        setMemberFindNomineDetails([])
    }

    const handleBoxcheck = () => {
        setBoxChecked(!boxChecked)
    }

    // update interest page ---------

    useEffect(() => {
        if (RecordData) {
            form.setFieldsValue(RecordData)
            if (RecordData?.nominee_apply) {
                setRadioChecked(RecordData?.nominee_apply)
            }
            setBoxChecked(RecordData?.apply_first_interest)
            form.setFieldsValue({
                photo: ImageIntialValue,
            })
            //----------------- Penalty -------------------------------

            if (RecordData?.penalty_amt > 100) {
                form.setFieldsValue({ penalty_type: "amount" })
                setDisablePenalty(true)
            }
            else {
                setDisablePenalty(false)
            }
            setpenalty(RecordData?.penalty_type);
            const dateFormat = 'YYYY-MM-DD'
            const intdate = new Date(RecordData?.interest_date);
            const Intrestdate = dayjs(intdate).format(dateFormat);

            form.setFieldsValue({ interest_date: dayjs(Intrestdate, dateFormat) })

            setShowDate(Intrestdate)
        }

        setCategoryChoose(RecordData?.interest_category)
    }, [RecordData, manageTrigger])

    useEffect(() => {
        if (RecordData?.photo?.length > 0) {
            setImageIntialValue(
                [{
                    uid: '1',
                    name: 'uploaded image',
                    status: 'done',
                    url: `${RecordData?.photo}`,
                }],
            )
        }
        else {
            setImageIntialValue([]);
        }
    }, [RecordData, manageTrigger])


    useEffect(() => {
        const FinalAmtValue = parseFloat(form.getFieldValue('principal_amt'))
        const IntserestAmt = categoryChoose === 'Installment Interest' ? parseFloat(form.getFieldValue('installment_amt')) : parseFloat(form.getFieldValue('interest_amt')) || 0;
        if (categoryChoose === 'Installment Interest') {

            if (boxChecked === true) {
                const IntrestCheck = finalAmt - IntserestAmt;
                form.setFieldsValue({ final_amt_given: IntrestCheck || 0 })

            } else if (boxChecked === false) {
                form.setFieldsValue({ final_amt_given: finalAmt || 0 })
            }
            else {
                setBoxChecked(false);

            }
        }
        else {
            form.setFieldsValue({ final_amt_given: FinalAmtValue || 0 })
            // if (boxChecked === true) {
            //     console.log(PrincleAmt,'PrincleAmt');
            //     form.setFieldsValue({ final_amt_given: PrincleAmt || 0 })
            // } 
            // else {
            //     setBoxChecked(false);
            // }  
        }

    }, [boxChecked, categoryChoose, finalAmt, update, form])


    // Date details show -----------

    const handleShowtDate = (date) => {
        setShowDate(date);
        if (rateType === 'percentage') {
            form.resetFields(["interest_period_type", "installment_amt"])
            handleInstallAmt();
        }
        else {
        }
    }
    // Radio onchange function 

    const handleNominee = (value) => {
        setRadioChecked(value.target.checked)
    }

    const handleAmtCalculate = (value) => {
        const PrincleAmt = parseFloat(form.getFieldValue('principal_amt')) || 0
        const interestRate = parseFloat(form.getFieldValue('fix_interest_rate_percent')) || 0
        const interestPeriod = form.getFieldValue('interest_period') || 0;

        let IntrestAmt = 0;
        if (rateType === 'percentage') {
            IntrestAmt = (PrincleAmt * (interestRate / 100)).toFixed(2) || 0;
        }
        else {
            IntrestAmt = interestRate || 0;
            const IntPlusPricpal = PrincleAmt + IntrestAmt || 0;
            // const TotalAmount = interestPeriod * IntPlusPricpal || 0;
            const TotalInstallAmount = IntPlusPricpal / interestPeriod || 0;
            form.setFieldsValue({ final_amt_given: IntPlusPricpal.toFixed(0) || 0 });
            form.setFieldsValue({ installment_amt: TotalInstallAmount.toFixed(0) || 0 })
        }
        form.setFieldsValue({ interest_amt: IntrestAmt })

        form.resetFields(["apply_first_interest"])
        setBoxChecked([]);
        // handleInstallAmt(IntrestAmt);
        handlePlanChoose();
        // handleInstallAmt()
    }
    const handlePlanChoose = (value) => {
        setPlanTypeChoose(value)
        const PrincleAmt = parseFloat(form.getFieldValue('principal_amt')) || 0
        const interestRate = parseFloat(form.getFieldValue('fix_interest_rate_percent')) || 0
        const IntPeriodType = form.getFieldValue('interest_period_type') || 0;
        const interestPeriod = form.getFieldValue('interest_period') || 0;
        let IntrestAmt = 0;

        if (rateType === 'percentage') {
            IntrestAmt = (PrincleAmt * (interestRate / 100)).toFixed(2) || 0;
        }
        else {
            IntrestAmt = interestRate || 0;

            const IntPlusPricpal = PrincleAmt + IntrestAmt || 0;
            // const TotalAmount = interestPeriod * IntPlusPricpal || 0;
            const TotalInstallAmount = IntPlusPricpal / interestPeriod || 0;
            form.setFieldsValue({ final_amt_given: IntPlusPricpal.toFixed(0) || 0 });
            form.setFieldsValue({ installment_amt: TotalInstallAmount.toFixed(0) || 0 })
        }
        form.setFieldsValue({ interest_amt: IntrestAmt })
        // if(rateType ==='percentage'){
        //     form.setFieldsValue({ interest_amt: IntrestAmt  });
        //     handleInstallAmt(IntrestAmt,IntPeriodType);
        // }
        // else{
        //     // form.setFieldsValue({ interest_amt: ""  });
        //     form.setFieldsValue({ interest_amt: interestRate  });
        //     handleInstallAmt(interestRate,IntPeriodType);
        // }
        handleInstallAmt(IntrestAmt, IntPeriodType)

    }

    //--------  handle Calculate Intsallment Interest Amount -------------------

    const handleInstallAmt = (value) => {
        const PrincleAmt = parseFloat(form.getFieldValue('principal_amt')) || 0
        const interestRate = parseFloat(form.getFieldValue('fix_interest_rate_percent')) || 0
        const IntPeriodType = form.getFieldValue('interest_period_type') || value;
        const interestPeriod = form.getFieldValue('interest_period') || 0;
        let IntrestAmt = parseFloat(form.getFieldValue("interest_amt")) || 0;

        const PrincpleAmt = parseFloat(form.getFieldValue('principal_amt')) || 0;
        const InstallIntPeriod = parseFloat(form.getFieldValue('interest_period')) || 0;
        if (rateType === 'percentage') {
            if (IntPeriodType == 'Days') {
                const PerdayInterest = IntrestAmt / 30;
                const TotalPeriodAmt = PerdayInterest * InstallIntPeriod || 0;
                const TotalAmount = PrincpleAmt + TotalPeriodAmt || 0;
                const TotalInstallAmount = TotalAmount / InstallIntPeriod || 0;
                form.setFieldsValue({ final_amt_given: TotalAmount.toFixed(0) || 0 });
                form.setFieldsValue({ installment_amt: TotalInstallAmount.toFixed(0) || 0 })
                setFinalAmt(TotalAmount.toFixed(0))

            } else if (IntPeriodType === 'Month') {

                const startDate = dayjs(showDate).startOf('month');
                if (isNaN(InstallIntPeriod) || InstallIntPeriod <= 0 || !Number.isInteger(InstallIntPeriod)) {
                    console.error("InstallIntPeriod must be a positive integer");
                    return [];
                } else {
                    let nextMonth = startDate.add(1, 'month');
                    const nextMonths = [];
                    let totalDays = 0;
                    for (let i = 0; i < InstallIntPeriod; i++) {
                        const monthName = nextMonth.format('MMMM');
                        const daysInMonth = nextMonth.daysInMonth();
                        nextMonths.push({ month: monthName, days: daysInMonth });
                        totalDays += daysInMonth;
                        nextMonth = nextMonth.add(1, 'month');
                    }
                    setMonthDays(totalDays)
                    const PerdayInterest = IntrestAmt / 30;
                    const MonthalldaysCalculate = totalDays
                    const TotalPeriodAmt = PerdayInterest * MonthalldaysCalculate || 0;
                    const TotalAmount = PrincpleAmt + TotalPeriodAmt || 0;
                    const TotalInstallAmount = TotalAmount / InstallIntPeriod || 0;
                    form.setFieldsValue({ final_amt_given: TotalAmount.toFixed(0) || 0 });
                    form.setFieldsValue({ installment_amt: TotalInstallAmount.toFixed(0) || 0 });
                    setFinalAmt(TotalAmount.toFixed(0))
                    return nextMonths;
                }

            } else if (IntPeriodType === 'Week') {
                const WeekCalculate = InstallIntPeriod * 7 || 0;
                const PerdayInterest = IntrestAmt / 30;
                const TotalPeriodAmt = PerdayInterest * WeekCalculate || 0;
                const TotalAmount = PrincpleAmt + TotalPeriodAmt || 0;
                const TotalInstallAmount = TotalAmount / InstallIntPeriod || 0;
                form.setFieldsValue({ final_amt_given: TotalAmount.toFixed(0) || 0 });
                form.setFieldsValue({ installment_amt: TotalInstallAmount.toFixed(0) || 0 })
                setFinalAmt(TotalAmount.toFixed(0))

            }
            else {
                form.setFieldsValue({ installment_amt: 0 })
            }
        }
        else {
            const IntPlusPricpal = PrincleAmt + IntrestAmt || 0;
            // const TotalAmount = interestPeriod * IntPlusPricpal || 0;
            // console.log(TotalAmount,'TotalAmount');
            const TotalInstallAmount = IntPlusPricpal / interestPeriod || 0;
            form.setFieldsValue({ final_amt_given: IntPlusPricpal.toFixed(0) || 0 });
            form.setFieldsValue({ installment_amt: TotalInstallAmount.toFixed(0) || 0 })
            setFinalAmt(IntPlusPricpal.toFixed(0))


        }

        // setFinalAmt(TotalAmount.toFixed(0));
    }

    // useEffect(() => {
    //     if (categoryChoose === 'Installment Interest') {
    //         const PrincleAmt = parseFloat(form.getFieldValue('principal_amt')) || 0
    //         const interestRate = parseFloat(form.getFieldValue('fix_interest_rate_percent')) || 0

    //         const IntrestAmt = (PrincleAmt * (interestRate / 100)).toFixed(2);

    //         const PrincpleAmt = parseFloat(form.getFieldValue('principal_amt'));
    //         const InstallIntPeriod = parseFloat(form.getFieldValue('interest_period'));

    //         if (planTypeChoose === 'Days') {
    //             const TotalPeriodAmt = IntrestAmt * InstallIntPeriod || 0;
    //             const TotalAmount = PrincpleAmt + TotalPeriodAmt || 0;
    //             const TotalInstallAmount = TotalAmount / InstallIntPeriod || 0;
    //             console.log(TotalInstallAmount, 'totalvalue Days');

    //         } else if (planTypeChoose === 'Month') {

    //             const MonthalldaysCalculate = MonthDays
    //             const TotalPeriodAmt = IntrestAmt * MonthalldaysCalculate || 0;
    //             const TotalAmount = PrincpleAmt + TotalPeriodAmt || 0;
    //             const TotalInstallAmount = TotalAmount / InstallIntPeriod || 0;

    //             console.log(MonthalldaysCalculate,TotalPeriodAmt,TotalAmount,TotalInstallAmount, 'totalvalueFinal Month');

    //             const startDate = dayjs(showDate).startOf('month');
    //             if (isNaN(InstallIntPeriod) || InstallIntPeriod <= 0 || !Number.isInteger(InstallIntPeriod)) {
    //                 console.error("InstallIntPeriod must be a positive integer");
    //                 return [];
    //             } else {
    //                 let nextMonth = startDate.add(1, 'month');
    //                 const nextMonths = [];
    //                 let totalDays = 0;
    //                 for (let i = 0; i < InstallIntPeriod; i++) {
    //                     const monthName = nextMonth.format('MMMM');
    //                     const daysInMonth = nextMonth.daysInMonth();
    //                     nextMonths.push({ month: monthName, days: daysInMonth });
    //                     totalDays += daysInMonth;
    //                     nextMonth = nextMonth.add(1, 'month');
    //                 }
    //                 setMonthDays(totalDays)
    //                 console.log(nextMonths, '');
    //                 return nextMonths;
    //             }


    //         } else if (planTypeChoose === 'Week') {
    //             const WeekCalculate = InstallIntPeriod * 7
    //             const TotalPeriodAmt = IntrestAmt * WeekCalculate || 0;
    //             const TotalAmount = PrincpleAmt + TotalPeriodAmt || 0;
    //             const TotalInstallAmount = TotalAmount / InstallIntPeriod || 0;
    //             console.log(TotalInstallAmount, 'totalvalue Week');
    //         }
    //     }

    // }, [planTypeChoose])


    // const handleInstallAmt = (IntrestAmt) => {
    //     console.log(IntrestAmt, 'IntrestAmt');
    //     const PrincpleAmt = parseFloat(form.getFieldValue('principal_amt'));
    //     const InstallIntPeriod = parseFloat(form.getFieldValue('interest_period'));


    //     const TotalPeriodAmt = IntrestAmt * InstallIntPeriod || 0;
    //     const TotalAmount = PrincpleAmt + TotalPeriodAmt || 0;
    //     const TotalInstallAmount = TotalAmount / InstallIntPeriod || 0;
    //     setFinalAmt(TotalAmount.toFixed(0));
    //     form.setFieldsValue({ final_amt_given: TotalAmount.toFixed(0) });
    //     form.setFieldsValue({ installment_amt: TotalInstallAmount.toFixed(0) })
    // }
    //----------------Handle Penalty -------------



    const handlePenalty = (value) => {
        if (value > 100) {
            form.setFieldsValue({ penalty_type: "amount" })
            setDisablePenalty(true)
        }
        else {
            setDisablePenalty(false)
        }
    }

    const GetMemberDetails = async (data) => {
        await request.get(APIURLS.MEMBER_SELECT_GET, data)
            .then(function (response) {
                setMemberSelectDetails(response.data)
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            })
    }

    const GetChitFundDetail = async (data) => {
        await request.get(APIURLS.PROFIT_CHITFUND_DETAILS, data)
            .then(function (response) {
                // setMemberSelectDetails(response.data)
                setChFundOption(response.data)
                console.log(response.data, 'hg67');
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            })
    }

    // Intrest Post URL 
    const AddIntrest = async (data) => {
        setIsLoading(true)
        await request
            .post(APIURLS.INTREST_POST_URL, data)
            .then(function (response) {
                if (response.status === 201) {
                    successHandler(response, {
                        notifyOnSuccess: true,
                        notifyOnFailed: true,
                        msg: "success",
                        type: "success",
                    });
                    form.resetFields();
                    setMemberFindDetails([]);
                    setRadioChecked([]);
                    setBoxChecked([]);
                    setImgeShow([]);
                    setFinalAmt("")
                    setCategoryChoose([]);
                    setTrigger((trigger) => trigger + 1)
                } else if (response.status === 226) {
                    console.log(response, 'response.data');
                    toast.warn(response?.data?.msg)
                }
                setIsLoading(false);
                return response.data;
            })
            .catch(function (error) {
                setIsLoading(false)
                if (error.response && error.response.status === 400) {
                    if (error.response.data?.people_mobile) {
                        toast.error(error.response.data?.people_mobile[0]);
                    }
                    if (error.response.data?.people_email) {
                        toast.error(error.response.data?.people_email[0]);
                    }
                }
                else {
                    return errorHandler(error);
                }


            });
    };

    // Intrest Post Updat URL 
    const EditIntrest = async (data) => {
        await request.put(`${APIURLS.INTREST_EDIT_URL}/${RecordData?.id}/`, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: "success",
                    type: "success",
                });
                form.resetFields();
                setMemberFindDetails([])
                setRadioChecked([])
                setBoxChecked([])
                ClosUpdaForm()
                return response.data;
            })
            .catch(function (error) {
                setIsLoading(false)
                if (error.response && error.response.status === 400) {
                    if (error.response.data?.people_mobile) {
                        toast.error(error.response.data?.people_mobile[0]);
                    }
                    if (error.response.data?.people_email) {
                        toast.error(error.response.data?.people_email[0]);
                    }
                }
                else {
                    return errorHandler(error);
                }
            })
    }


    const onFinish = (data) => {

        const datevalues = { ...data, interest_date: showDate }

        const formData = new FormData()
        formData.append('interest_date', showDate);
        formData.append('interest_type', data?.interest_type);
        formData.append('interest_category', data?.interest_category);
        formData.append('chitt_fund', data?.chitt_fund === undefined ? '' : data?.chitt_fund);
        formData.append('chit_name', data?.chit_name === undefined ? '' : data?.chit_name);
        formData.append('people_type', data?.people_type);
        formData.append('people_name', data?.people_name);

        if (data?.people_member === undefined) {
            console.log('hgfh');
        } else {
            formData.append('people_member', data?.people_member)
        }
        // formData.append('people_member', data?.people_member === undefined ? 'None' : data?.people_member);
        if (data?.people_email) {
            formData.append('people_email', data?.people_email);
        }
        if (data?.people_mobile) {
            formData.append('people_mobile', data?.people_mobile);
        }
        if (data?.people_address) {
            formData.append('people_address', data?.people_address);
        }
        formData.append('principal_amt', data?.principal_amt);
        formData.append('fix_interest_rate_percent', data?.fix_interest_rate_percent);
        formData.append('interest_type_new', data?.interest_type_new);
        formData.append('interest_amt', categoryChoose === "Installment Interest" ? (boxChecked ? data?.installment_amt : data?.interest_amt) : data?.interest_amt);
        // Penalty rate is now a fixed 3 % (see initialValues). We keep
        // the payload contract intact so the backend serializer / overdue
        // job continue to read `penalty_amount` and `penalty_type` as
        // before.
        formData.append('penalty_amount', data?.penalty_amount || 3);

        if (data?.penalty_type === undefined) {
            console.log('penaltyType');
            formData.append('penalty_type', 'percentage');
        }
        else {
            formData.append('penalty_type', data?.penalty_type);
        }
        // Apply-Penalty toggle — only relevant for Installment-Interest
        // records but always submitted (defaults to true) so re-saves of
        // legacy records keep the previous behaviour.
        formData.append(
            'penalty_enabled',
            data?.penalty_enabled === false ? 'false' : 'true'
        );
        // formData.append('interest_period', data?.interest_period === undefined ? null : data?.interest_period);
        // formData.append('interest_period_type', data?.interest_period_type === undefined ? null : data?.interest_period_type);
        // formData.append('apply_first_interest', data?.apply_first_interest === undefined ? 'fasle' : data?.apply_first_interest);

        if (data?.interest_period === undefined) {
            console.log('hgfh');
        } else {
            formData.append('interest_period', data?.interest_period)
        }
        if (data?.interest_period_type === undefined) {
            console.log('hgfh');
        } else {
            formData.append('interest_period_type', data?.interest_period_type)
        }
        if (data?.apply_first_interest === undefined) {
            console.log('hgfh');
        } else {
            formData.append('apply_first_interest', data?.apply_first_interest)
        }

        if (data?.installment_amt === undefined) {
            console.log('hgfh');
        } else {
            formData.append('installment_amt', data?.installment_amt)
        }

        formData.append('final_amt_given', data?.final_amt_given);
        formData.append('nominee_apply', data?.nominee_apply === undefined ? false : data?.nominee_apply);

        if (data?.nominee_person_type === undefined) {
            console.log('hgfh');
        } else {
            formData.append('nominee_person_type', data?.nominee_person_type)
        }
        if (data?.nominee_member === undefined) {
            console.log('hgfh');
        } else {
            formData.append('nominee_member', data?.nominee_member === undefined ? 'None' : data?.nominee_member)
        }
        if (data?.nominee_member_name === undefined) {
            console.log('hgfh');
        } else {
            formData.append('nominee_member_name', data?.nominee_member_name)
        }
        if (data?.nominee_address === undefined) {
            console.log('hgfh');
        } else {
            formData.append('nominee_address', data?.nominee_address)
        }

        if (data?.nominee_mobile_no === undefined) {
            console.log('hgfh');
        } else {
            formData.append('nominee_mobile_no', data?.nominee_mobile_no)
        }

        if (data?.cheque_no === undefined) {
            console.log('hgfh');
        } else {
            formData.append('cheque_no', data?.cheque_no)
        }


        if (RecordData) {
            if (data?.photo.length === 0) {
                formData.append("images_status", "false");
            } else if (!data?.photo[0]?.url) {
                formData.append("photo", data?.photo[0].originFileObj);
            }
        } else {
            if (data.photo && Array.isArray(data.photo)) {
                data.photo.forEach((file, index) => {
                    formData.append(`photo`, file.originFileObj);
                });
            }
        }
        // console.log([...formData.entries()], 'addintrest');

        if (RecordData) {
            EditIntrest(formData)
        } else {
            AddIntrest(formData)
        }

    }

    const onFinishFailed = () => {
        toast.warn("Please fill in all the required details !");
    }

    const onReset = () => {
        form.resetFields();
    };

    const AmtType = [
        {
            label: '%',
            value: 'percentage'
        },
        {
            label: '₹',
            value: 'amount'
        }
    ]

    // Feb 2026 owner rule — the "Fix Interest Rate" input only accepts
    // rupee (flat ₹) amounts now. Percentage was removed to prevent
    // operator confusion and to match the balance-sheet formula:
    //   intrest_amt = fix_interest_rate_percent      (₹ mode only)
    // Kept as a separate array so `AmtType` above (still used by other
    // dropdowns, e.g. penalty type) stays untouched.
    const FixRateOptionsRupeeOnly = [
        {
            label: '₹',
            value: 'amount'
        }
    ]

    const amttypes = [
        {
            label: '%',
            value: 'percentage'
        },
        {
            label: '₹',
            value: 'amount'
        }
    ]

    const handleamttype = (value) => {
        setpenalty(value);
    }


    const handleFixrateType = (value) => {
        setRateType(value);

        // form.resetFields(['interest_amt','fix_interest_rate_percent','installment_amt'])
        const PrincleAmt = parseFloat(form.getFieldValue('principal_amt')) || 0;
        const interestRate = parseFloat(form.getFieldValue('fix_interest_rate_percent')) || 0;
        const interestPeriod = form.getFieldValue('interest_period') || 0;
        let IntrestAmt = 0;

        if (value === 'percentage') {
            IntrestAmt = (PrincleAmt * (interestRate / 100)).toFixed(2) || 0;
            handleInstallAmt(value);
            form.resetFields(["installment_amt", "interest_period_type", "apply_first_interest", "final_amt_given"])
            setFinalAmt([])

        }
        else {
            IntrestAmt = interestRate || 0;
            const IntPlusPricpal = PrincleAmt + IntrestAmt || 0;
            // const TotalAmount = interestPeriod * IntPlusPricpal || 0;
            const TotalInstallAmount = IntPlusPricpal / interestPeriod || 0;
            form.setFieldsValue({ final_amt_given: IntPlusPricpal.toFixed(0) || 0 });
            form.setFieldsValue({ installment_amt: TotalInstallAmount.toFixed(0) || 0 })
            setFinalAmt(IntPlusPricpal.toFixed(0))
        }
        form.setFieldsValue({ interest_amt: IntrestAmt })
        form.resetFields(["apply_first_interest"])
        setBoxChecked([]);
        // form.resetFields(['fix_interest_rate_percent','interest_amt',''])
        // handlePlanChoose();
        // console.log(value, 'valuehf');
    }


    const SelectSide = (
        <CustomSelect options={AmtType}
            initialValue={penalty}
            name={'penalty_type'}
            width={'70px'}
            disabled={disablePenalty}
            onChange={handleamttype}
            rules={[
                {
                    required: true,
                    message: 'Please Select a Penalty Type!',
                },
            ]} />
    )


    const SelectFixRate = (
        <CustomSelect options={FixRateOptionsRupeeOnly}
            initialValue={'amount'}
            name={'interest_type_new'}
            width={'70px'}
            // disabled={disableRate}
            onChange={handleFixrateType}
            rules={[
                {
                    required: true,
                    message: 'Please Select a Fix Rate Type !',
                },
            ]} />
    )
    return (
        <Form
            form={form}
            labelCol={{
                span: 24,
            }}
            wrapperCol={{
                span: 24,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            initialValues={{
                interest_date: dayjs(),
                // Owner rule (Feb 2026): default penalty is a fixed
                // 3 % of interest balance, applied after due date. The
                // fields stay editable so the operator can override.
                penalty_amount: 3,
                penalty_type: 'percentage',
                // Apply Penalty checkbox — checked by default for new
                // Installment-Interest records. When unchecked the
                // overdue penalty accrual is skipped for this loan.
                penalty_enabled: true,
                // Feb 2026 owner rule — Fix Interest Rate is now
                // rupee-only. Locking the type here prevents the form
                // from resurrecting the legacy "percentage" default.
                interest_type_new: 'amount',
            }}
        >
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'Interest'} />
                    </Col>
                    <Col span={24} md={12}>
                        <Flex end={true}>

                            <CustomDatePicker label={''} name={'interest_date'}
                                onChange={handleShowtDate} />
                        </Flex>
                    </Col>

                    <Col span={24} md={12}>
                        <CustomSelect
                            options={interestOption}
                            label={'Type'}
                            name={'interest_type'}
                            // disabled
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select a Interest Type!',
                                },
                            ]}
                            onChange={handleChooseType}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomSelect
                            options={categoryOption}
                            label={'Category'}
                            name={'interest_category'}
                            onChange={handleCategory}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select a Category!',
                                },
                            ]}
                        //  onChange={ChangeProductId}
                        />
                    </Col>

                    {ShowChooseType === 'Chit fund Interest' ?
                        <Col span={24} md={12}>
                            <CustomSelect
                                options={chooseFundOption}
                                label={'choose Chit Fund'}
                                name={'chit_name'}
                                onChange={handleChangeFund}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please Choose  a Chit-fund!',
                                    },
                                ]}
                            />
                            <CustomInput name={'chitt_fund'} display={'none'} />
                        </Col> : null}

                    <Col span={24} md={12}>
                        <CustomUpload form={form} label={'Photo'}
                            name={'photo'} listType='picture-card'
                            maxCount={3} accept='.png,.jpeg,.jpg'
                            initialValue={ImageIntialValue}
                        />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomSelect
                            options={peopletypeOption}
                            label={'People type'}
                            name={'people_type'}
                            // disabled
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select a People type!',
                                },
                            ]}
                            onChange={HandlePlptypeMembFind}
                        />
                    </Col>
                    <Col span={24} md={12}>
                    </Col>
                    {/* next row */}

                    <Col span={24} md={24}>
                        <CustomPageFormTitle Heading={'Members Details :'} />
                    </Col>
                    {ShowChooseMemb === 'Member' || RecordData?.people_type === 'Member' ?

                        <>
                            <Col span={24} md={12}>
                                <CustomSelect
                                    options={MemberChooseOpt} label={'Choose Member'}
                                    name={'people_name'} rules={[
                                        {
                                            required: true,
                                            message: 'Please Choose a member!',
                                        },
                                    ]}
                                    onChange={handleFindMember}
                                />
                                <CustomInput name={'people_member'} display={'none'} />
                            </Col>
                        </> :
                        <Col span={24} md={12}>
                            <CustomInput
                                label={'Name'}
                                name={'people_name'}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter details!',
                                    },
                                ]}
                            />
                        </Col>}



                    <Col span={24} md={12}>
                        <CustomInput name={'people_email'} label={'Email'} type={'email'} />
                    </Col>

                    <Col span={24} md={24}>
                        <CustomRow>
                            <Col span={24} md={12}>
                                <Col span={24} md={24}>
                                    <CustomInputNumber label={'Phone Number'} name={'people_mobile'} maxLength={10}
                                        onKeyPress={(event) => {
                                            if (!/[0-9]/.test(event.key)) {
                                                event.preventDefault();
                                            }
                                        }} />
                                </Col>

                                <Col span={24} md={24}>
                                    <CustomTextArea label={'Address'} name={'people_address'} />
                                </Col>
                            </Col>
                            <Col span={24} md={12}>
                                <Flex end style={{
                                    objectFit: "cover", height: 'auto',
                                    marginRight: '100px', position: 'relative'
                                }} >
                                    {ImgeShow &&
                                        ImgeShow.map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                style={{
                                                    border: '3px dotted',
                                                    padding: '2px',
                                                    height: '170px',
                                                    width: '170px'
                                                }}
                                            />
                                        ))}

                                </Flex>
                            </Col>

                        </CustomRow>
                    </Col>

                    <Col span={24} md={12} >
                        <CustomInputNumber label={'Principal Amount'}
                            name={'principal_amt'} suffix={'₹'} onChange={handleAmtCalculate}
                            rules={[
                                {
                                    required: true,
                                    message: 'This is Required Field!',
                                },
                            ]} />
                    </Col>

                    <Col span={24} md={12} >
                        {/* <CustomInputNumber label={'Fix Interest Rate'}
                            name={'fix_interest_rate_percent'} suffix={'%'}
                            onChange={handleAmtCalculate} /><br /> */}
                        <CustomInputNumber addonAfter={SelectFixRate} label={'Fix Interest Rate'}
                            onChange={handleAmtCalculate}
                            name={'fix_interest_rate_percent'}
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (
                                            rateType === 'percentage' &&
                                            value !== undefined &&
                                            value !== null &&
                                            Number(value) > 100
                                        ) {
                                            return Promise.reject(
                                                new Error('Fix Interest Rate percentage cannot exceed 100%')
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]} />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Interest Amount'} name={'interest_amt'} disabled
                            suffix={'₹'} />
                    </Col>

                    {/*
                      Penalty input removed (Feb 2026). Prior to this the form
                      exposed a manual "Penalty" number field + %/₹ selector
                      (`penalty_amount` + `penalty_type`). Per owner rule the
                      penalty is now a fixed 3 % applied automatically to every
                      *overdue installment* — turned on via the "Apply
                      Penalty" checkbox inside the Installment-Interest block
                      below. `penalty_amount` and `penalty_type` are still
                      submitted (3 / 'percentage') for backend compatibility.
                    */}

                    {categoryChoose === 'Installment Interest' ?
                        <>
                            <Col span={24} md={8}>
                                <CustomInputNumber label={'Interest Period'}
                                    onChange={handleInstallAmt}
                                    //  onChange={handlePlanChoose}

                                    name={'interest_period'} rules={[
                                        {
                                            required: true,
                                            message: 'Please enter details!',
                                        },
                                    ]} />
                            </Col>
                            <Col span={24} md={4}>
                                <CustomSelect options={ChoosePlan} label={'Choose'} onChange={handleInstallAmt}
                                    name={'interest_period_type'} rules={[
                                        {
                                            required: true,
                                            message: 'Please Select a interest period type !',
                                        },
                                    ]}
                                />
                            </Col>
                            <Col span={24} md={12}>
                                <CustomInputNumber label={'Installment Amt'} name={'installment_amt'} disabled
                                />
                            </Col>
                            <Col span={24} md={12}>
                                {/*
                                  Apply Penalty checkbox — Installment Interest only.
                                  Default: CHECKED (see initialValues -> penalty_enabled:true).
                                  When checked: backend applies 3 % of installment_amt
                                    for every missed due date after the schedule
                                    date (see `overdue_views._apply_for_installment`).
                                  When unchecked: `penalty_enabled=false` is saved and
                                    the overdue job skips this loan entirely
                                    ("skipped: penalty disabled").
                                */}
                                <CustomCheckBox
                                    label={'Apply Penalty (3% × missed due dates)'}
                                    name={'penalty_enabled'}
                                    onChange={() => { }}
                                />
                            </Col>
                        </> : null}


                    <Col span={24} md={24}>
                        <CustomCheckBox label={'First Interest'} name={'apply_first_interest'} onChange={handleBoxcheck} />
                    </Col>

                    {/* 
                    <Col span={24} md={12} >
                        <CustomInputNumber label={'Take First Interest Amount'} name={'death_amt'} suffix={'₹'} />
                    </Col> */}


                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Final Amount'}
                            name={'final_amt_given'} suffix={'₹'} disabled />
                    </Col>
                    <Col span={24} md={24}></Col>
                    <Col span={24} md={24}>
                        <Flex baseline>
                            <CustomPageFormTitle2 Heading={'Nominee'} />&nbsp;&nbsp;&nbsp;

                            {/* <CustomRadioButton name={'nominee_apply'} data={[{ label: 'Yes', value: 'Yes' },
                            { label: 'No', value: 'No' }]} onChange={handleNominee} /> */}
                            <CustomCheckBox name={'nominee_apply'} onChange={handleNominee} />
                        </Flex>
                    </Col>
                    {radioChecked === true ? <>
                        <Col span={24} md={12}>
                            <CustomSelect
                                options={peopletypeNomiOption}
                                label={'Nominee Person Type'}
                                name={'nominee_person_type'}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter details!',
                                    },
                                ]}
                                onChange={HandlePlptypeNamineeMembFind}
                            />
                        </Col>
                        {ShowChooseNamineMemb === 'Member' || RecordData?.nominee_person_type === 'Member' ?

                            <Col span={24} md={12}>
                                <CustomSelect
                                    options={MemberChooseOpt}
                                    label={'Nominee Person'}
                                    name={'nominee_member_name'}
                                    // disabled
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please enter details!',
                                        },
                                    ]}
                                    onChange={handleFindNomineMember}
                                />
                                <CustomInput name={'nominee_member'} display={'none'} />
                            </Col> :
                            <Col span={24} md={12}>
                                <CustomInput
                                    label={'Name'}
                                    name={'nominee_member_name'}
                                    // disabled
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please enter details!',
                                        },
                                    ]}
                                />
                            </Col>}



                        <Col span={24} md={12}>
                            <CustomTextArea label={'Address'} name={'nominee_address'} />
                        </Col>


                        <Col span={24} md={12}>
                            <CustomInputNumber label={'Phone Number'} name={'nominee_mobile_no'} maxLength={10}
                                onKeyPress={(event) => {
                                    if (!/[0-9]/.test(event.key)) {
                                        event.preventDefault();
                                    }
                                }} />
                        </Col>
                        <Col span={24} md={12}>
                            <CustomInput label={'Cheque No (Optional)'} name={'cheque_no'} />
                        </Col>
                    </> : null}


                </CustomRow>
                {RecordData ? <Flex gap={'20px'} center={"true"} margin={'20px 0'}>
                    <Button.Danger text={'Update'} htmlType={'submit'} />
                    <Button.Success text={'Cancel'} onClick={() => ClosUpdaForm()} />
                </Flex> :
                    <Flex gap={'20px'} center={"true"} margin={'20px 0'}>
                        {isLoading ? <Spin /> :
                            <Button.Danger text={'Submit'} htmlType={'submit'} />}
                        <Button.Success text={'Reset'} onClick={() => onReset()} />
                    </Flex>
                }


                <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={800} modalTitle={modalTitle} modalContent={modalContent} />


            </CustomCardView>
        </Form>
    )
}
