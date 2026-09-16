import { SvgIcons } from '@assets/Svg'
import { Button, CustomInput } from '@components/form'
import { CommonLoading, CustomCardView, CustomModal, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Tooltip } from 'antd'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AllChitSettlemenetAppln, AllChitSettlemenetApplnStatus, getChitSettlementAppln } from '@modules/ChitFund/ChitFundSlice'
import { CustomStandardTable } from '@components/form/CustomStandardTable'
import Label from '@components/form/Label'
import { TableIconHolder } from '@components/common/Styled'
import CustomPopconfirm from '@components/others/CustomPopConfirm'
import request from '@request/request'
import { APIURLS } from '@request/apiUrls/urls'
import successHandler from '@request/successHandler'
import errorHandler from '@request/errorHandler'
import ViewChitFundSettlementAppln from './ViewChitFundSettlementAppln'
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from '@modules/Auth/authSlice'
import { userRolesConfig } from '@router/config/roles'
import { FaWhatsapp } from 'react-icons/fa'
import { IoPrint } from 'react-icons/io5'
import dayjs from 'dayjs'
import { useReactToPrint } from 'react-to-print'
import { CommonManagePrintName, PrintHolder, PrintShowData } from '@modules/ComManagePrintDetails/CommonManagePrint'

const ChitFundSettlementApplicationList = () => {

    const dispatch = useDispatch();

    const componentRef = useRef();

    const [searchTexts, setSearchTexts] = useState([]);   //---------Seach Bar --------
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

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        dispatch(getChitSettlementAppln())
    }, [])

    const AllDataList = useSelector(AllChitSettlemenetAppln);
    const AllDataListStatus = useSelector(AllChitSettlemenetApplnStatus);


    const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
    const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
    const ChitFundPermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

    const handleSearchs = (value) => {
        setSearchTexts(value);
    };

    const ViewSettleAppln = (record) => {
        setModelwith(900)
        setModalContent(<ViewChitFundSettlementAppln settleRecord={record} />);
        showModal();
    }

    const handleDelete = async (record) => {
        await request
            .delete(`${APIURLS.EDIT_DELETE_SETTLEMENT_APPLN}/${record?.id}/`, record)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: "success",
                    type: "success",
                });
                dispatch(getChitSettlementAppln())
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            });
    };


    const computeSettlementDate = (applicationDate) => {
        if (!applicationDate) return '-';
        const d = dayjs(applicationDate);
        if (!d.isValid()) return '-';
        return d.add(60, 'day').format('YYYY-MM-DD');
    };

    const TableColumn = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Settlement Application No',
            dataIndex: 'settlement_aplication_no'
        },
        {
            title: 'Application Date',
            dataIndex: 'settlement_date'
        },
        {
            title: 'Settlement Date',
            dataIndex: 'settlement_date',
            key: 'settlement_date_computed',
            render: (v) => computeSettlementDate(v),
        },
        {
            title: 'Chit Fund Name',
            dataIndex: 'chit_fund_name',
            filteredValue: searchTexts ? [searchTexts] : null,
            onFilter: (value, record) => {
                return String(record.chit_fund_name).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.chit_fund_name).includes(value.toUpperCase());
            },
        },
        {
            title: 'Investor Name',
            dataIndex: 'invester_name'
        },
        {
            title: 'Share Count',
            dataIndex: 'share_count',
            render: (v) => v ?? 0,
        },
        {
            title: 'Share Amount',
            dataIndex: 'share_amount',
            render: (v) => `₹ ${Number(v || 0).toFixed(2)}`,
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount',
            render: (v) => (
                <b style={{ color: '#0F5132' }}>₹ {Number(v || 0).toFixed(2)}</b>
            ),
        },
        {
            title: 'Action',
            render: (text, record, index) => {
                return (
                    <Flex gap={'20px'} center={'true'}>
                        {superUsers ||
                            role === userRolesConfig.ADMIN ||
                            ChitFundPermission?.Chitfund?.View ? (
                            <Tooltip title="View">
                                <TableIconHolder size={'28px'} onClick={() => ViewSettleAppln(record)} >
                                    <img src={SvgIcons.Eye} style={{ cursor: 'pointer' }} />
                                </TableIconHolder>
                            </Tooltip>) : null}
                        {superUsers ||
                            role === userRolesConfig.ADMIN ||
                            ChitFundPermission?.Chitfund?.Delete ? (
                            <CustomPopconfirm
                                title="Confirmation"
                                description="Are You Sure About Removing This ?"
                                okText="Yes"
                                cancelText="No"
                                confirm={() => handleDelete(record)}>
                                <img src={SvgIcons.Delete} style={{ cursor: 'pointer' }} />
                            </CustomPopconfirm>) : null}
                    </Flex>
                )
            }
        }
    ]

    let content;

    if (AllDataListStatus === 'loading') {
        content = <CommonLoading />
    } else if (AllDataListStatus === 'succeeded') {
        const rowKey = (AllDataList) => AllDataList.id;
        content = <CustomStandardTable columns={TableColumn} data={AllDataList} rowKey={rowKey} />
    } else if (AllDataListStatus === 'failed') {
        const rowKey = (AllDataList) => AllDataList.id;
        content = <CustomStandardTable columns={TableColumn} data={AllDataList} rowKey={rowKey} />
    }

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const CurrentDate = dayjs().format('DD-MM-YYYY')

    const TableColumnPrint = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Settlement Application No',
            dataIndex: 'settlement_aplication_no'
        },
        {
            title: 'Application Date',
            dataIndex: 'settlement_date'
        },
        {
            title: 'Settlement Date',
            dataIndex: 'settlement_date',
            key: 'settlement_date_computed',
            render: (v) => computeSettlementDate(v),
        },
        {
            title: 'Chit Fund Name',
            dataIndex: 'chit_fund_name',
        },
        {
            title: 'Investor Name',
            dataIndex: 'invester_name'
        },
        {
            title: 'Share Count',
            dataIndex: 'share_count',
            render: (v) => v ?? 0,
        },
        {
            title: 'Share Amount',
            dataIndex: 'share_amount',
            render: (v) => `₹ ${Number(v || 0).toFixed(2)}`,
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount',
            render: (v) => `₹ ${Number(v || 0).toFixed(2)}`,
        },
    ]

    return (
        <Fragment>
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'View Chit Fund Settlement Application'} width={'100%'} />
                    </Col>
                    <Col span={24} md={12}>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                            <Label style={{ marginRight: '20px' }}>Search by Chit Fund :</Label>
                            <CustomInput
                                value={searchTexts}
                                placeholder="Search"
                                onSearch={handleSearchs}
                                onChange={(e) => handleSearchs(e.target.value)}
                            />
                        </div>
                    </Col>
                    <Col span={24} md={24}>
                        {content}
                    </Col>
                </CustomRow>

                <Flex flexend={"right"} style={{ marginTop: "10px" }}>
                    <a href="https://web.whatsapp.com/" target="blank">
                        <Button.Primary text={"Share"} icon={<FaWhatsapp />} />
                    </a>
                    <Button.Secondary text={"Print"} icon={<IoPrint />} onClick={handlePrint} />
                </Flex>

                <PrintHolder ref={componentRef}>
                    <PrintShowData className="PrintShowDatadd">
                        <CommonManagePrintName />
                        <h5 style={{ textAlign: 'end', marginRight: '20px' }}>Date :{CurrentDate} </h5><br />
                        <h3 style={{ textAlign: 'center' }}>Chit Fund Settlement Application Details</h3><br />
                        <CustomStandardTable columns={TableColumnPrint} data={AllDataList || []} pagination={false} />
                    </PrintShowData>
                </PrintHolder>

            </CustomCardView>
            <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={modelwith} modalTitle={modalTitle} modalContent={modalContent} />
        </Fragment>
    )
}

export default ChitFundSettlementApplicationList