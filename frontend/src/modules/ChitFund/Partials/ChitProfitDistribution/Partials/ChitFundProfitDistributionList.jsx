import { SvgIcons } from '@assets/Svg'
import { Button, CustomInput, CustomSwitch } from '@components/form'
import { CommonLoading, CustomCardView, CustomModal, CustomRow, Flex } from '@components/others'
import { CustomPageFormTitle, CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Tooltip } from 'antd'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AllChitFundList, AllChitFundListStatus, AllOnlyProfitChitFundList, AllOnlyProfitChitFundListStatus, getChitFundClosedProfitList, getChitOnlyProfitList } from '@modules/ChitFund/ChitFundSlice'
import { CustomStandardTable } from '@components/form/CustomStandardTable'
import Label from '@components/form/Label'
import { TableIconHolder } from '@components/common/Styled'
import CustomPopconfirm from '@components/others/CustomPopConfirm'
import request from '@request/request'
import { APIURLS } from '@request/apiUrls/urls'
import successHandler from '@request/successHandler'
import errorHandler from '@request/errorHandler'
import ProfitDistributionView from '@modules/ChitFund/Partials/ChitProfitDistribution/Partials/ProfitDistributionView'
import { userRolesConfig } from '@router/config/roles'
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from '@modules/Auth/authSlice'
import { IoPrint } from 'react-icons/io5'
import { FaWhatsapp } from 'react-icons/fa'
import dayjs from 'dayjs'
import { useReactToPrint } from 'react-to-print'
import { CommonManagePrintName, PrintHolder, PrintShowData } from '@modules/ComManagePrintDetails/CommonManagePrint'

const ChitFundProrfitDistributionList = () => {

    const dispatch = useDispatch();
    const componentRef = useRef();

    const [checked, setChecked] = useState(false);
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
        dispatch(getChitFundClosedProfitList());
        dispatch(getChitOnlyProfitList());
    }, [])

    const AllDataList = useSelector(AllChitFundList);
    const AllDataListStatus = useSelector(AllChitFundListStatus);

    const AllOnlyProfitDataList = useSelector(AllOnlyProfitChitFundList)
    const AllOnlyProfitDataListStatus = useSelector(AllOnlyProfitChitFundListStatus)

    const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
    const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
    const ChitFundPermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

    const handleSearchs = (value) => {
        setSearchTexts(value);
    };

    const ViewProfit = (record) => {
        setModelwith(900)
        setModalTitle('')
        setModalContent(<ProfitDistributionView DataRecord={record} />);
        showModal();
    }

    const handleCloseProfitDelete = async (record) => {
        await request
            .delete(`${APIURLS.CHIT_DISTRIBUTION_DELETE}/${record?.id}/`, record)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: "success",
                    type: "success",
                });
                dispatch(getChitFundClosedProfitList())
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            });
    };


    const handleOnlyProfitDelete = async (record) => {
        await request
            .delete(`${APIURLS.CHIT_ONLY_PROFIT_DISTRIBUTION_DELETE}/${record?.id}/`, record)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: "success",
                    type: "success",
                });
                dispatch(getChitOnlyProfitList())
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            });
    };

    const handlechange = () => {
        setChecked(!checked)
    }

    const TableColumn = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
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
            title: 'Available Amount',
            dataIndex: 'total_amount'
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
                                <TableIconHolder size={'28px'} onClick={() => ViewProfit(record)} >
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
                                confirm={() => checked ? handleOnlyProfitDelete(record) : handleCloseProfitDelete(record)} >
                                <img src={SvgIcons.Delete} style={{ cursor: 'pointer' }} />
                            </CustomPopconfirm>) : null}
                    </Flex>
                )
            }
        }
    ]

    const TableColumnPrint = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Chit Fund Name',
            dataIndex: 'chit_fund_name',
        },
        {
            title: 'Available Amount',
            dataIndex: 'total_amount'
        },
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

    let content1;

    if (AllOnlyProfitDataListStatus === 'loading') {
        content1 = <CommonLoading />
    } else if (AllOnlyProfitDataListStatus === 'succeeded') {
        const rowKey = (AllOnlyProfitDataList) => AllOnlyProfitDataList.id;
        content1 = <CustomStandardTable columns={TableColumn} data={AllOnlyProfitDataList} rowKey={rowKey} />
    } else if (AllOnlyProfitDataListStatus === 'failed') {
        const rowKey = (AllOnlyProfitDataList) => AllOnlyProfitDataList.id;
        content1 = <CustomStandardTable columns={TableColumn} data={AllOnlyProfitDataList} rowKey={rowKey} />
    }

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const CurrentDate = dayjs().format('DD-MM-YYYY')

    return (
        <Fragment>
            <CustomCardView>
                <CustomRow >
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'View Chit Profit Distribution'} />
                    </Col>
                    <Col span={24} md={24} style={{ marginTop: "20px" }}>
                        <CustomSwitch
                            name={"rent"}
                            onChange={handlechange}
                            leftLabel={"Closed"}
                            rightLabel={"Profit"}
                        />
                    </Col>
                    <Col span={24} md={12} style={{ padding: '10px 0px' }}>
                        <CustomPageFormTitle Heading={checked ? ' Profit Distribution List' : ' Closed Profit Distribution List'} width={'100%'} />
                    </Col>
                    <Col span={24} md={12}>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                            <Label style={{ marginRight: '20px' }}>Search by Fund Name :</Label>
                            <CustomInput
                                value={searchTexts}
                                placeholder="Search"
                                onSearch={handleSearchs}
                                onChange={(e) => handleSearchs(e.target.value)}
                            />
                        </div>
                    </Col>
                    <Col span={24} md={24}>
                        {checked ? content1 : content}
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
                        {checked ?
                            <>
                                <h3 style={{ textAlign: 'center' }}>Profit Distribution Details</h3><br />
                                <CustomStandardTable columns={TableColumnPrint} data={AllOnlyProfitDataList || []} pagination={false} />
                            </>
                            :
                            <>
                                <h3 style={{ textAlign: 'center' }}>Closed Profit Distribution</h3><br />
                                <CustomStandardTable columns={TableColumnPrint} data={AllDataList || []} pagination={false} />
                            </>
                        }
                    </PrintShowData>
                </PrintHolder>

            </CustomCardView>
            <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={modelwith} modalTitle={modalTitle} modalContent={modalContent} />
        </Fragment>
    )
}

export default ChitFundProrfitDistributionList