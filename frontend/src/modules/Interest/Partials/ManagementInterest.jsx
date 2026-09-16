import { SvgIcons } from '@assets/Svg'
import { Button, CustomInput, CustomSelect } from '@components/form'
import { CommonLoading, CustomCardView, CustomModal, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Tooltip } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { IoPrint } from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux'
import { getManagementCapital, getManagementCapitalError, getManagementCapitalStatus, getManagementDetailsError, getManagementDetailsstatus, getManagementInstallMent, getManagementInstallMentError, getManagementInstallMentStatus, getManagementInterest, selectManagementCapitalDetails, selectManagementInstallMentDetails, selectManagementInteresetDetails } from '@modules/Interest/InterestSlice'
import { CustomStandardTable } from '@components/form/CustomStandardTable'
import { TableIconHolder } from '@components/common/Styled'
import { useNavigate } from 'react-router-dom'
import { Interest } from '@modules/Interest/Partials/Interest'
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from '@modules/Auth/authSlice'
import { userRolesConfig } from '@router/config/roles'
import dayjs from 'dayjs'
import { useReactToPrint } from 'react-to-print'
import { CommonManagePrintName, PrintHolder, PrintShowData } from '@modules/ComManagePrintDetails/CommonManagePrint'
import CustomPopconfirm from '@components/others/CustomPopConfirm'
import successHandler from '@request/successHandler'
import request from '@request/request'
import { APIURLS } from '@request/apiUrls/urls'
import errorHandler from '@request/errorHandler'
import { toast } from 'react-toastify'

const ManagementInterest = () => {

    const nevigate = useNavigate();
    const componentRef = useRef();
    const [filer, setFiler] = useState({})
    const [interestCategory, setInterestCategory] = useState('Management_Interest'); //------ Use Interest Category Options -----
    const [searchTexts, setSearchTexts] = useState([]);   //---------Seach Bar 1--------
    const [search2Texts, setSearch2Texts] = useState([]);   //---------Seach Bar 2--------
    const [manageTrigger, setManageTrigger] = useState(0)
    // ======  Modal Open ========
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [installInt, setInstallInt] = useState([])
    const [capitalInt, setCapitalInt] = useState([])

    // ======  Modal Title and Content ========
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState(null);

    // ----------  Form Reset UseState ---------
    const [modelwith, setModelwith] = useState(0);

    // ===== Modal Functions Start =====
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getManagementInterest());
        dispatch(getManagementInstallMent());
        dispatch(getManagementCapital());
    }, [])

    //---------------- Management Interest ------------------------------//

    const AllManagementInterest = useSelector(selectManagementInteresetDetails)
    const AllManagementInterestStatus = useSelector(getManagementDetailsstatus)
    const AllManagementInterestError = useSelector(getManagementDetailsError)

    //---------------- Management InstallMent Interest ------------------------//

    const AllManagementInstallMentDetails = useSelector(selectManagementInstallMentDetails)
    const AllManagementInstallMentStatus = useSelector(getManagementInstallMentStatus)
    const AllManagementInstallMentError = useSelector(getManagementInstallMentError)

    //---------------- Management Capital Interest --------------------------//

    const AllManagementCapitalDetails = useSelector(selectManagementCapitalDetails)
    const AllManagementCapitalStatus = useSelector(getManagementCapitalStatus)
    const AllManagementCapitalError = useSelector(getManagementCapitalError)

    //-----------

    const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
    const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
    const ManagementIntPermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

    useEffect(() => {
        setDataSource(AllManagementInterest)
        setInstallInt(AllManagementInstallMentDetails)
        setCapitalInt(AllManagementCapitalDetails)
    }, [AllManagementInterest, AllManagementInstallMentDetails, AllManagementCapitalDetails])

    const ProfileOnchange = (record) => {
        nevigate(`/ManagementInterestProfile/${record?.id}`)
    }

    const ClosUpdaForm = () => {
        handleOk()
        dispatch(getManagementInterest())
    }

    const handleApplyOverdue = async () => {
        try {
            const { data } = await request.post(
                `${APIURLS.APPLY_OVERDUE_INTEREST || '/api/interest/apply_overdue_interest_and_penalty/'}`,
                {}
            );
            toast.success(
                `Applied overdue charges — Interest: ₹${data?.data?.added_interest_total || 0}, Penalty: ₹${data?.data?.added_penalty_total || 0} across ${data?.data?.records_processed || 0} records.`
            );
            dispatch(getManagementInterest());
        } catch (e) {
            errorHandler(e);
        }
    };

    const handleRecomputeBalance = async () => {
        try {
            const { data } = await request.post(
                `${APIURLS.RECOMPUTE_INTEREST_BALANCE || '/api/interest/recompute_interest_balance/'}`,
                {}
            );
            toast.success(
                `Healed drift on ${data?.data?.records_needing_fix || 0} of ${data?.data?.records_scanned || 0} records (₹${data?.data?.total_drift_healed || 0}).`
            );
            dispatch(getManagementInterest());
        } catch (e) {
            errorHandler(e);
        }
    };

    const InterestEdit = (record) => {
        setManageTrigger(manageTrigger + 1)
        setModalTitle('')
        setModelwith(900)
        setModalContent(<Interest RecordData={record} ClosUpdaForm={ClosUpdaForm} manageTrigger={manageTrigger} />)
        showModal();
    }

    const InterestCategoryOptions = [
        {
            label: "Management Interest",
            value: "Management_Interest",
        },
        {
            label: "Management InstallMent",
            value: "Management_Installment",
        },
        {
            label: "Management Capital",
            value: "Management_Capital",
        },
    ];

    const handleInterestCategory = (value) => {
        setInterestCategory(value);
    };

    const SelectOption = [
        {
            label: 'Person Name',
            value: 'MemberName'
        },
        {
            label: 'Intrest No',
            value: 'phone_no'
        }
    ]

    const handleSearchs = (value) => {
        setSearchTexts(value);
    };

    const handle2Search = (value) => {
        setSearch2Texts(value);
    };

    const handleSelect = (value) => {
        setFiler(value)
        setSearchTexts([])
        setSearch2Texts([])
    }
    const DeleteManagementInterest = async (record) => {
        await request
            .delete(`${APIURLS.DELETE_MANAGEMENT_INTEREST}/${record?.id}/`, record)
            .then(function (response) {
                if (response?.status === 226) {
                    toast.warn(response?.data?.msg)
                }
                else {
                    successHandler(response, {
                        notifyOnSuccess: true,
                        notifyOnFailed: true,
                        msg: "success",
                        type: "success",
                    });
                    dispatch(getManagementInterest());
                    dispatch(getManagementInstallMent());
                    dispatch(getManagementCapital());
                }
                return response.data;
            })
            .catch(function (error) {
                if (error.response?.status === 302) {
                    toast.error(error.response.data?.message)
                } else {
                    errorHandler(error);
                }
            });
    };

    const TableColumn = [
        {
            title: "S.No",
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Intrest No',
            dataIndex: 'intrest_no',
            filteredValue: search2Texts ? [search2Texts] : null,
            onFilter: (value, record) => {
                return String(record.intrest_no).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.intrest_no).includes(value.toUpperCase());
            },
        },
        {
            title: 'Person Name',
            dataIndex: 'people_name',
            filteredValue: searchTexts ? [searchTexts] : null,
            onFilter: (value, record) => {
                return String(record.people_name).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.people_name).includes(value.toUpperCase());
            },
        },
        {
            title: 'Principal Amount',
            dataIndex: 'principal_amt'
        },
        {
            title: 'Interest Amount',
            dataIndex: 'interest_amt'
        },
        {
            title: 'Action',
            render: (text, record, index) => {
                return (
                    <Flex gap={'20px'} center={'true'}>
                        {superUsers ||
                            role === userRolesConfig.ADMIN ||
                            ManagementIntPermission?.Interest?.View ? (
                            <Tooltip title="Profile">
                                <TableIconHolder size={'28px'} onClick={() => ProfileOnchange(record)}>
                                    <img src={SvgIcons.Person} style={{ cursor: 'pointer' }} />
                                </TableIconHolder>
                            </Tooltip>) : null}
                        {/* {superUsers ||
                            role === userRolesConfig.ADMIN ||
                            ManagementIntPermission?.Interest?.Edit ? (
                            <Tooltip title="Edit">
                                <TableIconHolder size={'28px'} onClick={() => InterestEdit(record)}>
                                    <img src={SvgIcons.Edit} style={{ cursor: 'pointer' }} />
                                </TableIconHolder>
                            </Tooltip>) : null} */}

                        {superUsers ||
                            role === userRolesConfig.ADMIN ||
                            ManagementIntPermission?.Interest?.Delete ? (
                            <CustomPopconfirm
                                title="Confirmation"
                                description="Are you sure you want to remove this Management-Interest detail?"
                                okText="Yes"
                                cancelText="No"
                                confirm={() => DeleteManagementInterest(record)}
                            >
                                <Tooltip title="Delete">
                                    <img src={SvgIcons.Delete} style={{ cursor: "pointer" }} />
                                </Tooltip>
                            </CustomPopconfirm>
                        ) : null}
                    </Flex>
                )
            }
        }
    ]

    const TableColumnPrint = [
        {
            title: "S.No",
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Intrest No',
            dataIndex: 'intrest_no',
        },
        {
            title: 'Person Name',
            dataIndex: 'people_name',
        },
        {
            title: 'Principal Amount',
            dataIndex: 'principal_amt'
        },
        {
            title: 'Interest Amount',
            dataIndex: 'interest_amt'
        },
    ]

    let content;

    if (AllManagementInterestStatus === 'loading') {
        content = <CommonLoading />
    } else if (AllManagementInterestStatus === 'succeeded') {
        const rowKey = (dataSource) => dataSource?.id;
        content = <CustomStandardTable columns={TableColumn} data={dataSource} rowKey={rowKey} />
    } else if (AllManagementInterestStatus === 'failed') {
        content = <h2>{
            AllManagementInterestError} </h2>
    }
    let content1;

    if (AllManagementInstallMentStatus === 'loading') {
        content1 = <CommonLoading />
    } else if (AllManagementInstallMentStatus === 'succeeded') {
        const rowKey = (installInt) => installInt.id;
        content1 = <CustomStandardTable columns={TableColumn} data={installInt} rowKey={rowKey} />
    } else if (AllManagementInstallMentStatus === 'failed') {
        content1 = <h2>{
            AllManagementInstallMentError} </h2>
    }
    let content2;

    if (AllManagementCapitalStatus === 'loading') {
        content2 = <CommonLoading />
    } else if (AllManagementCapitalStatus === 'succeeded') {
        const rowKey = (capitalInt) => capitalInt.id;
        content2 = <CustomStandardTable columns={TableColumn} data={capitalInt} rowKey={rowKey} />
    } else if (AllManagementCapitalStatus === 'failed') {
        content2 = <h2>{
            AllManagementCapitalError} </h2>
    }

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const CurrentDate = dayjs().format('DD-MM-YYYY')


    return (
        <div>
            <CustomCardView>
                <CustomRow space={[12, 12]}>

                    <Col span={24} md={6}>
                        {interestCategory === "Management_Interest" && (
                            <CustomPageTitle Heading={"Management Interest"} />
                        )}
                        {interestCategory === "Management_Installment" && (
                            <CustomPageTitle Heading={"Management Installment"} />
                        )}
                        {interestCategory === "Management_Capital" && (
                            <CustomPageTitle Heading={"Management Capital"} />
                        )}
                    </Col>
                    <Col span={24} md={6}>
                        <CustomSelect
                            placeholder={"Select..."}
                            options={InterestCategoryOptions}
                            onChange={handleInterestCategory}
                            defaultValue={"Management_Interest"}
                        />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomRow space={[12, 12]}>
                            <Col span={24} md={12}>
                                <CustomSelect name={'Select'}
                                    placeholder={'Select'} options={SelectOption}
                                    onChange={handleSelect} />
                            </Col>
                            <Col span={24} md={12}>
                                {filer === 'MemberName' ?
                                    (
                                        <CustomInput
                                            value={searchTexts}
                                            placeholder="Search Name"
                                            onSearch={handleSearchs}
                                            onChange={(e) => handleSearchs(e.target.value)}
                                        />
                                    ) :
                                    (
                                        <CustomInput
                                            value={search2Texts}
                                            placeholder="Search Intrest No"
                                            onSearch={handle2Search}
                                            onChange={(e) => handle2Search(e.target.value)}
                                        />
                                    )
                                }
                            </Col>
                        </CustomRow>
                    </Col>
                    <Col span={24} md={24}>
                        {interestCategory === "Management_Interest" && (
                            content
                        )}
                        {interestCategory === "Management_Installment" && (
                            content1
                        )}
                        {interestCategory === "Management_Capital" && (
                            content2
                        )}
                    </Col>
                </CustomRow>

                <Flex flexend={"right"} style={{ marginTop: "10px" }}>
                    <CustomPopconfirm
                        title="Recompute balance from audit trail?"
                        description="Rebuilds every interest record's balance from InterestPeopleReport transactions to heal any drift. Idempotent."
                        confirm={handleRecomputeBalance}
                    >
                        <Button.Secondary
                            text={"Recompute Balances"}
                            data-testid="recompute-mgmt-interest-balance-btn"
                        />
                    </CustomPopconfirm>
                    <CustomPopconfirm
                        title="Apply overdue charges?"
                        description="Backfills missed monthly interest and 20th-of-month penalties for every unpaid record. Idempotent."
                        confirm={handleApplyOverdue}
                    >
                        <Button.Primary
                            text={"Apply Overdue Charges"}
                            data-testid="apply-overdue-interest-btn"
                        />
                    </CustomPopconfirm>
                    <a href="https://web.whatsapp.com/" target="blank">
                        <Button.Primary text={"Share"} icon={<FaWhatsapp />} />
                    </a>
                    <Button.Secondary text={"Print"} icon={<IoPrint />} onClick={handlePrint} />
                </Flex>

                <PrintHolder ref={componentRef}>
                    <PrintShowData className="PrintShowDatadd">
                        <CommonManagePrintName />
                        <h5 style={{ textAlign: 'end', marginRight: '20px' }}>Date :{CurrentDate} </h5><br />
                        {interestCategory === "Management_Interest" && (
                            <>
                                <h3 style={{ textAlign: 'center' }}>Management Interest</h3><br />
                                <CustomStandardTable columns={TableColumnPrint} data={dataSource || []} pagination={false} />
                            </>
                        )}
                        {interestCategory === "Management_Installment" && (
                            <>
                                <h3 style={{ textAlign: 'center' }}>Management Installment</h3><br />
                                <CustomStandardTable columns={TableColumnPrint} data={installInt || []} pagination={false} />
                            </>
                        )}
                        {interestCategory === "Management_Capital" && (
                            <>
                                <h3 style={{ textAlign: 'center' }}>Management Capital</h3><br />
                                <CustomStandardTable columns={TableColumnPrint} data={capitalInt || []} pagination={false} />
                            </>
                        )}

                    </PrintShowData>
                </PrintHolder>

            </CustomCardView>
            <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={modelwith} modalTitle={modalTitle} modalContent={modalContent} />
        </div>
    )
}

export default ManagementInterest