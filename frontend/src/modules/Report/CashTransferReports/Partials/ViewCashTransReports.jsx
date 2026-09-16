import { Button, CustomDateRangePicker, CustomInput, CustomSelect } from "@components/form";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import { CustomModal, CustomRow, Flex } from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { CardStyle, Filter, HeadingStyle, MoveSlider, PrintHolder, PrintShowData } from "@modules/Report/Style";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";
import { Col, Form, Spin } from "antd";
import dayjs from "dayjs";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { TbArrowsExchange } from "react-icons/tb";
import { toast } from "react-toastify";
import { BiFilterAlt } from "react-icons/bi";
import { getManagement, selectManagementDetails } from "@modules/Management/ManagementSlice";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { IoPrint } from "react-icons/io5";
import { formatIndianNumber } from "@modules/Report/MemberBalanceReports/Partials/ViewMemberBalanceReports";

export const ViewCashTransferReports = () => {

    const [form] = Form.useForm();
    const componentRef = useRef();
    const dispatch = useDispatch();
    const [isLoadspin, setIsLoadspin] = useState(false)
    const [dataSource, setDataSource] = useState([]);
    const [bankShow, setBankShow] = useState(false);
    const [dateRange, setDateRange] = useState(false);
    const [rangeFilterDate, setRangeFilterDate] = useState(
        dayjs().format("YYYY-MM-DD")
    );

    const [deathData, setDeathData] = useState([]);
    const [modalWidth, setModalWidth] = useState(0);
    const [showdetailsON, setShowdetailsON] = useState(true);
    // ======  Modal Open ========
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ======  Modal Title and Content ========
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState(null);

    // ----------  Form Reset UseState ---------
    const [formReset, setFormReset] = useState(0);
    const [bankDetails, setBankDetails] = useState([]);

    const [bankData, setBankData] = useState(false);

    // ===== Modal Functions Start =====

    const handleOk = () => {
        setIsModalOpen(false);
        FormRest();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        FormRest();
    };

    const FormRest = () => {
        setFormReset(formReset + 1);
    };

    //================= Date filter Date range fn============

    const handleDateRangeChange = (date) => {
        setRangeFilterDate(date);
    };
    //---------------- Management Details --------------------
    useEffect(() => {
        dispatch(getManagement());
    }, []);

    const AllManagementDetails = useSelector(selectManagementDetails);


    useEffect(() => {
        GetBankDetails();
    }, [])
    //---------Get Bank Details -----------------------------//
    const GetBankDetails = async () => {
        await request
            .get(`${APIURLS.BANK_GET_DETAILS}`)
            .then(function (response) {
                setBankDetails(response.data)
                return response.data;
            })
            .catch(function (error) {
            });
    };

    //-------- Bank Options---------------------------
    const BankNameOptions = bankDetails?.map((ban) => ({
        label: ban?.bank_name,
        value: ban?.id
    }))
    //------------ Handle Select Bank Fn------------------------------
    const handleBankOptions = (e) => {
        const BankIdFind = bankDetails?.find((ban) => ban?.id === e);
        setBankData(BankIdFind);
        form.setFieldsValue({ bank_name: BankIdFind?.bank_name })
    };
    //=====================================================
    const DateSearch = (values) => {
        setIsLoadspin(true)
        request.post(`${APIURLS.CASH_STATEMENT_FILTER_REPORTS}`, values)
            .then(function (response) {
                setDataSource(response.data?.cash_det);
                if (response.data?.cash_det?.length) {
                    toast.success(
                        "Cash Transfer details report filtered by date successfully retrieved."
                    );
                } else {
                    toast.warn(
                        "No Cash Transfer details report data found for the selected date !"
                    );
                }
                setIsLoadspin(false)
            })
            .catch(function (error) {
                toast.error("Failed");
                setIsLoadspin(false)
            });
    };

    const handleChange = () => {
        setShowdetailsON(true);
    };
    //==========Handle Print =================

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });
    //=================

    const onFinish = (values) => {
        const BankValues = {
            range: rangeFilterDate,
            bank_id: values?.bank,
        };
        DateSearch(BankValues);

    };

    const onFinishFailed = (errorInfo) => {
        toast.warn("Please fill in all the required details !");
    };

    const columns = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: "Date",
            dataIndex: "created_at",
            render: (date) => {
                return date ? new Date(date).toLocaleDateString() : "";
            },
        },
        {
            title: "Type",
            dataIndex: "trans_type",
        },
       {
            title: "From",
            dataIndex: "banks2_name",
            render: (record,data) => {
                return <span style={{display:'flex',justifyContent:'center'}}>{data?.trans_type === "Bank To Bank" ? data?.banks2_name : '--' }</span>
            }
        },
        {
            title: "To",
            dataIndex: "banks_name",
            render: (record,data) => {
                return <span style={{display:'flex',justifyContent:'center'}}>{data?.trans_type === "Bank To Bank" ? data?.banks_name : '--' }</span>
            }
        },
        {
            title: "Amount",
            render:(record)=>{
                return <span> ₹ {formatIndianNumber(record?.amount)}&nbsp;</span> 
               }
        },
    ];
    if (dataSource?.trans_type === "Bank To Bank") {
        const bankNameIndex = columns.findIndex(column => column.title === "Bank Name");
        if (bankNameIndex !== -1) {
            columns.splice(bankNameIndex, 1); // Remove the "Bank Name" column
        }
    }
    const BankHeaderDetails = () => {
        return (
            <CardStyle>
                <CustomRow space={[12, 12]}>
                    <Col span={24} sm={10} md={10}>
                        <div className="Headerdetail">
                            <h4>Bank Name&nbsp;: &nbsp;&nbsp;&nbsp;{bankData?.bank_name} </h4>
                        </div>
                    </Col>
                    <Col span={24} sm={10} md={10}>
                        <div className="Headerdetail">
                            <Flex end={true}>
                                <h4>From Date&nbsp;:&nbsp;&nbsp; {rangeFilterDate?.start_date}</h4>
                            </Flex><br />
                            <Flex end={true}>
                                <h4>To Datee&nbsp;:&nbsp;&nbsp; {rangeFilterDate?.end_date}</h4>
                            </Flex>
                        </div>
                    </Col>
                </CustomRow>
            </CardStyle>
        )
    }
    return (
        <Fragment>
            <Form
                form={form}
                labelCol={{
                    span: 24,
                }}
                wrapperCol={{
                    span: 24,
                }}
                initialValues={{
                    from_date: dayjs(),
                }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <CustomRow space={[24, 24]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={"Cash Transfer Report"} />
                    </Col>
                    <Col span={24} md={12}>
                        <Flex end={true}>
                            <Button.Secondary
                                text={"Print"}
                                icon={<IoPrint />}
                                onClick={handlePrint}
                            />
                        </Flex>
                    </Col>
                    <Col span={24} md={5}>
                        <Filter onClick={handleChange}>
                            <BiFilterAlt />
                            &nbsp;&nbsp;Filter
                        </Filter>
                    </Col>
                    <Col span={24} md={15}></Col>
                    <Col span={24} md={4}></Col>
                </CustomRow>
                <MoveSlider showdetailsons={showdetailsON ? "true" : undefined}>
                    <CustomRow
                        space={[24, 24]}
                        style={{ marginTop: "20px", flexWrap: "wrap" }}>
                        <>
                            <Col span={24} md={24}>
                                <CustomRow space={[12, 24]}>
                                    <Col span={24} md={24} lg={6}>
                                        <b>Choose Bank Name</b>&nbsp;
                                        <TbArrowsExchange />
                                    </Col>

                                    <Col span={24} md={10}>
                                        <CustomSelect
                                            name={"bank"}
                                            options={BankNameOptions}
                                            onChange={handleBankOptions}
                                            placeholder={'Please Choose Bank Name'}
                                            rules={[{ required: true, message: "Please Choose a Bank !" }]}
                                        />
                                        <CustomInput name={'bank_name'} display={'none'} />
                                    </Col>
                                </CustomRow><br />
                                <CustomRow space={[12, 24]}>
                                    <Col span={24} md={24} lg={6}>
                                        <b>Choose Date Range</b>&nbsp;&nbsp;
                                        <TbArrowsExchange />
                                    </Col>

                                    <Col span={24} md={24} lg={8}>
                                        <CustomDateRangePicker
                                            onChange={handleDateRangeChange}
                                            name={"range"}
                                            value={rangeFilterDate}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Please Choose a Date Range !",
                                                },
                                            ]}
                                        />
                                    </Col>
                                    <Col span={24} md={24} lg={4}>
                                        <Flex aligncenter={true} style={{ marginTop: "-8px" }}>
                                            {isLoadspin ? <Spin style={{ marginTop: '15px' }} /> :
                                                <Button.Primary text={"Submit"} htmlType={"submit"} />
                                            }
                                        </Flex>
                                    </Col>
                                </CustomRow>

                            </Col>
                        </>
                    </CustomRow>
                </MoveSlider>
            </Form>
            <PrintHolder ref={componentRef}>
                <PrintShowData className="PrintShowDatadd">
                    <HeadingStyle>
                        <h1>{AllManagementDetails?.temple_name}</h1>
                        <h2>{AllManagementDetails?.address}</h2>
                        <h3>Cash Transfer Details</h3>
                    </HeadingStyle>
                    <BankHeaderDetails/>
                    <CustomStandardTable
                        columns={columns}
                        data={dataSource}
                        pagination={false}
                    />
                </PrintShowData>
            </PrintHolder>
            <CustomStandardTable columns={columns} data={dataSource} />
            <CustomModal
                isVisible={isModalOpen}
                handleOk={handleOk}
                handleCancel={handleCancel}
                width={modalWidth}
                modalTitle={modalTitle}
                modalContent={modalContent}
            />
        </Fragment>
    );
};
