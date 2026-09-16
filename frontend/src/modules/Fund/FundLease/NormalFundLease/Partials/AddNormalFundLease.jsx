import { SvgIcons } from "@assets/Svg";
import {
    Button,
    CustomDatePicker,
    CustomInput,
    CustomInputNumber,
    CustomRadioButton,
    CustomSelect,
} from "@components/form";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import {
    CustomCardView,
    CustomModal,
    CustomRow,
    Flex,
} from "@components/others";
import { CustomPageFormTitle, CustomPageTitle } from "@components/others/CustomPageTitle";
import CustomPopconfirm from "@components/others/CustomPopConfirm";
import {
    getAsset,
} from "@modules/Asset Details/AssetSlice";
import {
    getMembersDetails,
    selectMemberDetails,
} from "@modules/FamilyDetails/FamilySlice";
import {
    getAssetUnderCategory,
    getRentalAssetCategory,
} from "@modules/Rental/RentalorLease/RentalorLeaseSlice";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";
import successHandler from "@request/successHandler";

import { Col, Form, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { getBankDetails, selectBankDetails } from "@modules/Management/ManagementSlice";
import AddTenatPerson from "./AddTenatPerson";
import errorHandler from "@request/errorHandler";

const AddNormalFundLease = ({
    normalfundleaseMainRecord,
    closee,
    MoveRentalorLeasetrigger
}) => {

    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const [coderDate, setCornerDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [memberType, setMembertype] = useState([]);
    const [dummyData, setDummyData] = useState([]);
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const [advance, setAdvance] = useState(false)  // Use Advacne Amt
    const [maxAmt, setMaxAmt] = useState()         //Use  Max value Advance amt

    const [initialpayType, setInitialPayType] = useState(false);  // use Inital Amt onChange payemnt mode show
    const [paymentMode, setPaymentMode] = useState(null); // use online/offline payment mode show
    const [transactionDate, setTransactionDate] = useState(dayjs().format("YYYY-MM-DD"));  // use  Transaction date
    const [bankPay, setBankPay] = useState({});
    const [transactionType, setTransactionType] = useState({});
    const [selectedBankDetails, setSelectedBankDetails] = useState([]);


    const [fundLease, setFundLease] = useState([]);
    const [leaseDate, setLeaseDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [fundDetails, setFundDetails] = useState([]);
    const [maxValue, setMaxValue] = useState();
    const [isloading, setIsloading] = useState(false);
    const [personCounts, setPersonCounts] = useState(0);
    const [leaseAmt, setLeaseAmt] = useState(0);
    const [trigger, setTrigger] = useState(0);

    // ======  Modal Open ========
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ======  Modal Title and Content ========
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState(null);

    // ----------  Form Reset UseState ---------

    const [modelwith, setModelwith] = useState(0);

    // ===== Modal Functions Start =====
    const showModal = () => {
        setIsModalOpen(true);
    };
    const CloseForm = () => {
        handleOk();
    };

    const handleOk = () => {
        setIsModalOpen(false);
        // ResetTrigger()
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    useEffect(() => {
        dispatch(getRentalAssetCategory());
        dispatch(getMembersDetails());
        dispatch(getAsset());
        dispatch(getAssetUnderCategory());
        dispatch(getBankDetails());
    }, []);

    const AllMemberDetails = useSelector(selectMemberDetails);
    const AllBankDetails = useSelector(selectBankDetails);

    useEffect(() => {
        GetFoundLeaseDetails();
    }, []);

    const GetFoundLeaseDetails = async (data) => {
        request
            .get(APIURLS.GET_NORMAL_FUND_LEASE)
            .then(function (response) {
                setFundLease(response.data);
                return response.data;
            })
            .catch(function (error) {
            });
    };
    //============== Add Total sale amount (Table values)  Set in Total Amt field================
    useEffect(() => {

        let totalAmount = dummyData?.reduce((acc, item) => {
            return acc + parseFloat(item.lease_amount);
        }, 0);

        form.setFieldsValue({
            final_lease_amount: normalfundleaseMainRecord?.final_lease_amount && totalAmount || totalAmount || 0,
        });

    }, [dummyData, form, normalfundleaseMainRecord]);

    //================

    useEffect(() => {
        form.setFieldsValue({ bank_name: selectedBankDetails });
    }, [selectedBankDetails]);

    useEffect(() => {
        if (normalfundleaseMainRecord) {
            form.setFieldsValue(normalfundleaseMainRecord);
            const dateformat = "YYYY-MM-DD";
            const DefaultDate = new Date(normalfundleaseMainRecord?.lease_date);
            const date = dayjs(DefaultDate).format(dateformat);
            setCornerDate(date);

            const startDateSet = new Date(normalfundleaseMainRecord?.start_date);
            const StartDate = dayjs(startDateSet).format(dateformat);
            setStartDate(StartDate);

            const TransactionDate = new Date(normalfundleaseMainRecord?.transaction_date);
            const TransactionFormat = dayjs(TransactionDate).format(dateformat)

            form.setFieldsValue({
                lease_date: dayjs(date, dateformat),
                start_date: dayjs(StartDate, dateformat),
                transaction_date: dayjs(TransactionFormat, dateformat)
            });
            setMembertype(normalfundleaseMainRecord?.tenat_type); // Member_type radio button check

            if (normalfundleaseMainRecord?.advance_amt > 0) {
                setInitialPayType(true);  // set Inital amt value Use paymentmode fields show
            }
            else {
                setInitialPayType(false);
                setPaymentMode([]);
            }
            setPaymentMode(normalfundleaseMainRecord?.payment_mode);
            setTransactionType(normalfundleaseMainRecord?.transaction_type);
            setTransactionDate(TransactionFormat, dateformat);

            setPersonCounts(normalfundleaseMainRecord?.divided_by);

            const FindFundLease = fundLease?.find((funl) => funl.id === normalfundleaseMainRecord?.fund_group);
            setFundDetails(FindFundLease);
        }
    }, [normalfundleaseMainRecord, fundLease, MoveRentalorLeasetrigger]);


    useEffect(() => {
        // if (normalfundleaseMainRecord) {
        const tableData = normalfundleaseMainRecord?.flease.map((value, index) => ({
            ...value,
            key: index,
        }));

        setDummyData(tableData);
        // }
    }, [normalfundleaseMainRecord, MoveRentalorLeasetrigger]);

    const handlemember = (value) => {
        const AllTenantDetails = AllMemberDetails.find(
            (memberlist) => memberlist?.id === value
        );
        form.setFieldsValue({ tenat_name: AllTenantDetails?.member_name });
        form.setFieldsValue({
            tenat_mobile: AllTenantDetails?.member_mobile_number,
        });
        form.setFieldsValue({ tenat_address: AllTenantDetails?.address });
        form.setFieldsValue({
            tenat_email: AllTenantDetails?.member_email,
        });
    };
    //------------ Handle Advance Amt onChage Function --------

    const handleAdvanceAmt = (e) => {
        let TotalAmt = parseFloat(form.getFieldValue("final_lease_amount"));
        const AdvanceAmt = e;

        setPaymentMode([])

        if (AdvanceAmt > 0) {
            setInitialPayType(true);  // Use paymentmode fields show
        }
        else {
            setInitialPayType(false);
            form.resetFields(["payment_mode", "transaction_type"]);
            setPaymentMode([]);
            setTransactionType([]);
        }

        // if (AdvanceAmt > TotalAmt) {
        //   toast.warn("Advance amount must not be greater than the total amount!");
        //   setAdvance(true);
        //   setMaxAmt(TotalAmt)
        // } else {
        //   setAdvance(false);
        //   TotalAmt = AdvanceAmt;
        // }
    }
    //-----------

    const bankPayoptions = [
        {
            label: "UPI",
            value: "UPI",
        },
        {
            label: "Net Banking",
            value: "Net Banking",
        },
        {
            label: "NEFT",
            value: "NEFT",
        },
    ];

    const bankoptions = AllBankDetails?.map((bank) => ({
        label: bank?.bank_name,
        value: bank?.id,
    }));

    const RadioOptionsPaymentMode = [
        {
            label: "Online",
            value: "Online",
        },
        {
            label: "Offline",
            value: "Offline",
        },
    ];

    let RadioOptionsTransactionType = [];
    if (paymentMode === "Online") {
        RadioOptionsTransactionType = [
            {
                label: "Bank",
                value: "Bank",
            },
        ];
    } else if (paymentMode === "Offline") {
        RadioOptionsTransactionType = [
            {
                label: "Cash",
                value: "Cash",
            },
            // {
            //   label: "Cheque",
            //   value: "Cheque",
            // },
        ];
    }

    const label =
        paymentMode === "Online"
            ? "Online Transaction Type"
            : paymentMode === "Offline"
                ? "Offline Transaction Type"
                : null;

    const handlePaymentMode = (e) => {
        setPaymentMode(e);
        setTransactionType({});
        form.resetFields(["transaction_type"]);
    };

    const handleTransactiontMode = (e) => {
        setTransactionType(e.target.value);

        form.resetFields([
            "bank_name",
            "bank_link",
            "bank_pay",
            "upi_no",
            "cheque_no",
            "trans_no",
            "transaction_date",
        ]);
    };

    const handleBankPayOptions = (e) => {
        if (e.target.value === "UPI") {
            setBankPay(e.target.value);
        } else {
            setBankPay(e.target.value);
        }
    };
    const handleBankOptions = (bank) => {
        const SelectedBank = AllBankDetails?.find((val) => val.id === bank);
        setSelectedBankDetails(SelectedBank?.bank_name);
        form.resetFields(["bank_pay", "trans_no", "transaction_date"]);
    };
    const handleTransactionDate = (date) => {
        setTransactionDate(date);
    };
    // ---------------------MemberOptions--------------------------
    const newSet = new Set();
    const memberoptions = AllMemberDetails?.map((memberlist) => ({
        label: memberlist?.member_name,
        value: memberlist?.id,
    }));

    if (memberoptions) {
        memberoptions.forEach((item) => {
            newSet.add(item.label);
        });
    }

    const handleStarttDate = (date) => {
        setStartDate(date);
    };
    // ---------- SET VALUE TO DYNAMIC DATA ------
    const SetDynamicTable = (value) => {
        setDummyData((prev) => {
            if (!Array.isArray(prev)) {
                // If prev is not an array, create a new array with the current and new value
                return [{ ...value, key: 0 }];
            }

            const isAssetNameExists = prev.some((item) => item.fund_mem === value.fund_mem);

            if (!isAssetNameExists) {
                const maxKey = Math.max(...prev.map((item) => item.key), 0);
                return [...prev, { ...value, key: maxKey + 1 }];
            } else {
                toast.warn("This Tenat Person already exists in the table !");
                return prev;
            }
        });
    };

    const SetDynamicEditTable = (value) => {
        setDummyData((prev) => {
            if (!Array.isArray(prev)) {
                // If prev is not an array, create a new array with the current and new value
                return [{ ...value, key: 0 }];
            }

            const rowIndexToUpdate = prev.findIndex((item) => item.key === value.key);

            if (rowIndexToUpdate !== -1) {
                // If the row exists, update its values
                const updatedDynamicTable = [...prev];
                updatedDynamicTable[rowIndexToUpdate] = { ...value };
                return updatedDynamicTable;
            }
            // If the row doesn't exist, check if the asset_name already exists in any of the existing rows
            const isAssetNameExists = prev.some((item) => item.fund_mem === value.fund_mem);

            if (!isAssetNameExists) {
                const maxKey = Math.max(...prev.map((item) => item.key), 0);
                return [...prev, { ...value, key: maxKey + 1 }];
            } else {
                toast.warning("This Tenat Person already exists in the table!");
                return prev;
            }

        });
    };

    const RowRemove = (rowKey) => {
        const newArr = dummyData?.filter((item) => item.key !== rowKey);
        setDummyData(newArr);

        const totalAmount = newArr.reduce((acc, item) => {
            return acc + item.lease_amount;
        }, 0);

        form.setFieldsValue({ final_lease_amount: totalAmount });
    };

    const handleMemberType = (e) => {
        setMembertype(e.target.value);
        form.resetFields([
            "tenat_name",
            "tenat_member",
            "tenat_mobile",
            "tenat_email",
            "tenat_address",
        ]);

    };

    const MemberTypeRadio = [
        {
            label: "Member",
            value: "Member",
        },
        {
            label: "Other",
            value: "Other",
        },
    ];
    //===========Fund lease Options =====================//

    const FundLeaseOptions = fundLease?.map((item) => ({
        label: item?.fund_name,
        value: item?.id,
    }));
    useEffect(() => {
        const FundLeaseAmt = form.getFieldValue('fund_lease_amount');
        setLeaseAmt(FundLeaseAmt);
        form.setFieldsValue({ lease_date: dayjs() })
    }, [])
    const handleFundLeaseChange = (e) => {
        setLeaseAmt(e);
        CalculateleaseDividedAmt()
    };

    const handleCommissionAmountChange = () => {
        CalculateleaseDividedAmt();
    };

    const CalculateleaseDividedAmt = () => {
        const FundAmt = form.getFieldValue("fund_amount") || 0;
        const FundLeaseAmt = form.getFieldValue("fund_lease_amount") || 1;

        if (FundLeaseAmt > FundAmt) {
            toast.warn('Lease amount not greater than Fund Amount !')
            setMaxValue(FundAmt)
        }
        else {
            // FundAmt = FundLeaseAmt
            setMaxValue("")
        }
        const DivideAmt = Math.floor(FundAmt / FundLeaseAmt);

        form.setFieldsValue({
            divided_by: DivideAmt,
        });
        setPersonCounts(DivideAmt);
    };
    const handleFund = (value) => {
        const FindFundLease = fundLease?.find((funl) => funl.id === value);
        form.setFieldsValue({ fund_name: FindFundLease?.fund_name });
        form.setFieldsValue({ fund_type: FindFundLease?.fund_type });
        form.setFieldsValue({ members_count: FindFundLease?.members_count });
        form.setFieldsValue({ fund_count: FindFundLease?.fixed_fund_count });
        form.setFieldsValue({ fund_amount: FindFundLease?.cash_available_amount })
        form.setFieldsValue({ leased_members_count: FindFundLease?.leased_members_count });
        form.setFieldsValue({ from_date: FindFundLease?.from_date });

        form.setFieldsValue({ to_date: FindFundLease?.to_date });
        form.setFieldsValue({
            per_head_collection_amount: FindFundLease?.per_head_collection_amount,
        });
        setFundDetails(FindFundLease);

        // SendFundName(value);
        // CalculateleaseDiviedAmt();
        setTrigger(trigger + 1)
        form.resetFields(['fund_mem', 'person_name', 'fund_lease_amount', 'divided_by', 'commission_amount'])
    };

    const TableColumn = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: "Tenat Person",
            dataIndex: "person_name",
        },
        {
            title: "Lease Amount",
            dataIndex: "lease_amount",
        },
        {
            title: "Action",
            render: (text, record, index) => {
                const rowKey = record.key;
                return (
                    <Flex gap={"true"} center={"true"}>

                        <CustomPopconfirm
                            title="Confirmation"
                            description="Are you absolutely certain about removing this added detail?"
                            okText="Yes"
                            cancelText="No"
                            confirm={() => RowRemove(rowKey)}
                        >
                            <img src={SvgIcons.Remove} style={{ cursor: "pointer" }} />
                        </CustomPopconfirm>
                    </Flex>
                );
            },
        },
    ];

    const PostNormalFundLease = async (data) => {
        setIsloading(true);
        await request
            .post(`${APIURLS.POST_GET_FUND_LEASE}`, data)
            .then(function (response) {
                if (response.status === 226) {
                    toast.warn(response.data?.Message);
                }
                else {
                    successHandler(response, {
                        notifyOnSuccess: true,
                        notifyOnFailed: true,
                        msg: "Successfully Submited",
                        type: "success",
                    });
                    form.resetFields();
                    setDummyData([]);
                    setMembertype([]);
                    setTransactionType([]);
                    setPaymentMode([]);
                    setInitialPayType(false);
                    form.setFieldsValue({ lease_date: dayjs() });
                }
                setIsloading(false);
                return response.data;
            })
            .catch(function (error) {
                setIsloading(false);
                return errorHandler(error);
            });
    };

    const UpdateNormalFundlease = async (data) => {
        setInitialPayType(true);
        setIsloading(true);
        await request
            .put(`${APIURLS.PUT_FUND_LEASE}/${normalfundleaseMainRecord?.id}/`, data)
            .then(function (response) {
                if (response.status === 226) {
                    toast.warn(response.data?.Message);
                }
                else{
                    successHandler(response, {
                        notifyOnSuccess: true,
                        notifyOnFailed: true,
                        msg: "Updated Successfully",
                        type: "info",
                    });
                    setInitialPayType(false);
                    closee();
          
                }
                setIsloading(false);
                return response.data;
            })
            .catch(function (error) {
                setIsloading(false);
                setInitialPayType(false);
                return errorHandler(error);

            });
    };
    const onFinish = (values) => {
        if (dummyData?.length < values?.divided_by) {
            toast.warn("The number of persons must be not less than  distributed count !");
            return;
        }
        const Nevalues = {
            ...values,
            lease_date: coderDate,
            start_date: startDate,
            transaction_date: transactionDate,
            flease: dummyData,
        };
        if (normalfundleaseMainRecord) {
            UpdateNormalFundlease(Nevalues);
        } else {
            PostNormalFundLease(Nevalues);
        }
    };

    const onFinishFailed = () => {
        toast.warn("Please fill in all the required details !");
    };
    const onReset = () => {
        if (normalfundleaseMainRecord) {
            closee();
        } else {
            form.resetFields();
        }
    };
    const onSubmit = () => {
        form.submit();
    };

    return (
        <CustomCardView>
            <Form
                name="AddMovableRentalorLease"
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                initialValues={{ lease_date: dayjs(), start_date: dayjs() }}
                autoComplete="off"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
            >
                <Col span={24} md={12}>
                    <CustomPageTitle Heading={"Normal Fund Lease"} />
                </Col>
                <CustomRow space={[24, 24]}>
                    <Col span={24} md={12}>
                        <CustomPageFormTitle Heading={"Fund Details :"} />
                    </Col>
                    <Col span={24} md={12}>
                        <Flex flexend={"right"} gap={"20px"}>
                            <p style={{ marginTop: "10px" }}>Lease Date</p>
                            <CustomDatePicker
                                name={"lease_date"}
                                disabled
                                rules={[
                                    {
                                        required: true,
                                        message: "Please Select Date !",
                                    },
                                ]}
                            />
                        </Flex>
                    </Col>
                    <Col span={24} md={12}>
                        <CustomSelect
                            options={FundLeaseOptions}
                            name={"fund_group"}
                            label={"Choose Fund"}
                            onChange={handleFund}
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter details!",
                                },
                            ]}
                        />
                        <CustomInput name={"fund_name"} display={"none"} />
                    </Col>
                    <Col span={24} md={12}></Col>
                    <Col span={24} md={12}>
                        <CustomInput label={"Fund Type"} name={"fund_type"} disabled />
                    </Col>
                    <Col span={24} md={6}>
                        <CustomInput
                            label={"Member Count"}
                            name={"members_count"}
                            disabled
                        />
                    </Col>
                    <Col span={24} md={6}>
                        <CustomInput
                            label={"Lease Member Count"}
                            name={"leased_members_count"}
                            disabled
                        />
                    </Col>
                    <Col span={24} md={6}>
                        <CustomInputNumber
                            label={"Fund Available Amount"}
                            name={"fund_amount"}
                            suffix={"₹"}
                            disabled
                        />
                    </Col>
                    <Col span={24} md={6}>
                        <CustomInputNumber
                            label={"Lease Amount"}
                            name={"fund_lease_amount"}
                            suffix={"₹"}
                            max={maxValue}
                            disabled={normalfundleaseMainRecord && true}
                            onChange={handleFundLeaseChange}
                        />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomInputNumber
                            label={"Divide Distributed Count"}
                            name={"divided_by"}
                            suffix={"₹"}
                            disabled

                        />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomInputNumber
                            label={"Commission Amount"}
                            name={"commission_amount"}
                            suffix={"₹"}
                            onChange={handleCommissionAmountChange}
                        />
                    </Col>
                </CustomRow>
            </Form>
            <AddTenatPerson SetDynamicTable={SetDynamicTable} SetDynamicEditTable={SetDynamicEditTable}
                fundDetails={fundDetails} leaseAmt={leaseAmt} personCounts={personCounts} dummyData={dummyData} />
            <Form form={form} name="AddTotalAmt" onFinish={onFinish} onFinishFailed={onFinishFailed} trigger={trigger}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
            >
                <CustomRow space={[24, 24]}>
                    <Col span={24} md={24}>
                        <CustomStandardTable columns={TableColumn} data={dummyData} />
                        <Flex flexend={"right"} gap={"20px"} style={{ margin: '15px 0px' }}>
                            <p style={{ marginTop: "10px" }}>Total Amount</p>
                            <CustomInputNumber disabled name={"final_lease_amount"} />
                        </Flex>
                        <br />
                        {/* <Flex flexend={"right"} gap={"20px"}>
                            <p style={{ marginTop: "10px" }}>Advance Amount</p>
                            <CustomInputNumber type={"number"} name={"advance_amt"} max={maxAmt} onChange={handleAdvanceAmt} />
                        </Flex> */}
                    </Col>
                    {initialpayType &&
                        <Col span={24} md={12}>
                            <CustomSelect
                                label={"Payment Mode"}
                                placeholder={"Select payment Mode"}
                                name={"payment_mode"}
                                options={RadioOptionsPaymentMode}
                                onChange={handlePaymentMode}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please Select a Payment Mode !",
                                    },
                                ]}
                            />
                        </Col>}
                    <Col span={24} md={24}></Col>
                    {paymentMode && paymentMode?.length &&
                        <Col span={24} md={12}>
                            <CustomRadioButton
                                label={label}
                                data={RadioOptionsTransactionType}
                                onChange={handleTransactiontMode}
                                name={"transaction_type"}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please Choose Anyone !",
                                    },
                                ]}
                            />
                        </Col>}
                    {paymentMode === "Offline" ? null : (
                        <Col span={24} md={12}>
                            {transactionType === "Bank" ? (
                                <>
                                    <CustomPageFormTitle Heading={"Bank Details"} />
                                    <CustomSelect
                                        label={"Select Bank"}
                                        name={"bank_link"}
                                        options={bankoptions}
                                        onChange={handleBankOptions}
                                        rules={[
                                            {
                                                required: true,
                                                message: "Required !",
                                            },
                                        ]}
                                    />
                                    <CustomInput label={'bank'} name={'bank_name'} display={'none'} />
                                    <CustomRadioButton
                                        label={"Choose Online Transaction Type"}
                                        name={"bank_pay"}
                                        data={bankPayoptions}
                                        onChange={handleBankPayOptions}
                                        rules={[
                                            {
                                                required: true,
                                                message: "Required !",
                                            },
                                        ]}
                                    />
                                    <CustomInput
                                        label={"Transaction Number"}
                                        name={"trans_no"}
                                        rules={[
                                            {
                                                required: true,
                                                message: "Required !",
                                            },
                                        ]}
                                    />
                                    <CustomDatePicker
                                        label={"Transaction Date"}
                                        name={"transaction_date"}
                                        rules={[
                                            {
                                                required: true,
                                                message: "Required !",
                                            },
                                        ]}
                                        onChange={handleTransactionDate}
                                    />
                                </>
                            ) : null}
                        </Col>
                    )}
                    <Col span={24} md={12}>
                        {transactionType === "Cheque" ? (
                            <>
                                <CustomPageFormTitle Heading={"Cheque Details"} />

                                <CustomInput
                                    label={"Cheque Number"}
                                    name={"trans_no"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Required !",
                                        },
                                    ]}
                                />
                                <CustomDatePicker
                                    label={"Transaction Date"}
                                    name={"transaction_date"}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Required !",
                                        },
                                    ]}
                                    onChange={handleTransactionDate}
                                />
                            </>
                        ) : null}
                    </Col>
                </CustomRow>
            </Form>
            {isloading ?
                <Flex center gap={'20px'} style={{ margin: '30px' }}><Spin /></Flex>
                :
                <Flex center={"true"} gap={"20px"} margin={"30px"}>
                    {normalfundleaseMainRecord ? (
                        <>
                            <Button.Danger text={"Update"} onClick={onSubmit} disabled={advance} />
                            <Button.Success text={"Cancel"} onClick={() => onReset()} />
                        </>
                    ) : (
                        <>
                            <Button.Danger text={"Submit"} onClick={onSubmit} disabled={advance} />
                            <Button.Success text={"Reset"} onClick={() => onReset()} />
                        </>
                    )}
                </Flex>}
            <CustomModal
                isVisible={isModalOpen}
                handleOk={handleOk}
                handleCancel={handleCancel}
                width={modelwith}
                modalTitle={modalTitle}
                modalContent={modalContent}
            />
        </CustomCardView>
    );
};

export default AddNormalFundLease;
