import { SvgIcons } from '@assets/Svg'
import { Button, CustomInput } from '@components/form'
import { CommonLoading, CustomCardView, CustomModal, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Tooltip } from 'antd'
import React, { Fragment, useEffect, useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { IoPrint } from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux'
import { getFundDetailsStatus, getFundList, selectFundDetails } from '../../FundSlice'
import { Fund } from './Fund'
import { CustomStandardTable } from '@components/form/CustomStandardTable'
import Label from '@components/form/Label'
import request from '@request/request'
import { APIURLS } from '@request/apiUrls/urls'
import successHandler from '@request/successHandler'
import errorHandler from '@request/errorHandler'
import CustomPopconfirm from '@components/others/CustomPopConfirm'
import { useNavigate } from 'react-router-dom'
import { userRolesConfig } from '@router/config/roles'
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from '@modules/Auth/authSlice'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
import { useRef } from 'react'
import { CommonManagePrintName, PrintHolder, PrintShowData } from '@modules/ComManagePrintDetails/CommonManagePrint'
import { useReactToPrint } from 'react-to-print'

const FundList = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const componentRef = useRef();

    const [FundTrigger, setFundTrigger] = useState(0)
    const [searchTexts, setSearchTexts] = useState([]);   //---------Seach Bar --------

    // ======  Modal Open ========
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);

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
        dispatch(getFundList())
    }, [])

    const AllFundList = useSelector(selectFundDetails);
    const AllFundListStatus = useSelector(getFundDetailsStatus);

    const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
    const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
    const FundPermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

    useEffect(() => {
        setDataSource(AllFundList)
    }, [AllFundList])

    const handleSearchs = (value) => {
        setSearchTexts(value);
    };

    const DeleteFundList = async (record) => {
        await request
            .delete(`${APIURLS.EDIT_FUND_GROUP}/${record?.id}/`, record)
            .then(function (response) {

                if (response.status === 226) {
                    toast.warn(response.data?.Message)
                }
                else {
                    successHandler(response, {
                        notifyOnSuccess: true,
                        notifyOnFailed: true,
                        msg: "success",
                        type: "success",
                    });
                    dispatch(getFundList());
                }
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            });
    };
    const ViewProfile = (record) => {
        navigate(`/view_fund_member_profile/${record?.id}`)
    }

    const EditFundMemberProfile = (record) => {
        setFundTrigger(FundTrigger + 1)
        setModelwith(900)
        setModalContent(<Fund RecordData={record} CloseModal={handleOk} FundTrigger={FundTrigger} />);
        showModal();
    }

    const TableColumn = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Fund Name',
            dataIndex: 'fund_name',
            filteredValue: searchTexts ? [searchTexts] : null,
            onFilter: (value, record) => {
                return String(record.fund_name).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.fund_name).includes(value.toUpperCase());
            },
        },
        {
            title: 'Fund Type',
            dataIndex: 'fund_type'
        },
        {
            title: 'Start Date',
            dataIndex: 'from_date'
        },
        {
            title: 'End Date',
            dataIndex: 'to_date'
        },
        {
            title: 'Head Name',
            dataIndex: 'head_name',

        },
        {
            title: 'Amount / Head',
            dataIndex: 'fixed_fund_amount'
        },
        {
            title: 'Action',
            render: (text, record, index) => {
                return (
                    <Flex gap={'20px'} center={'true'}  >
                        {superUsers || role === userRolesConfig.ADMIN || FundPermission?.Fund_list?.View ? (
                            <Tooltip title="View">
                                <img src={SvgIcons.Eye} style={{ cursor: 'pointer' }} onClick={() => ViewProfile(record)} />
                            </Tooltip>) : null}
                        {superUsers || role === userRolesConfig.ADMIN || FundPermission?.Fund_list?.Edit ? (
                            <Tooltip title="Edit">
                                <img src={SvgIcons.Edit} style={{ cursor: 'pointer' }} onClick={() => EditFundMemberProfile(record)} />
                            </Tooltip>) : null}
                        {superUsers || role === userRolesConfig.ADMIN || FundPermission?.Fund_list?.Delete ? (
                            <CustomPopconfirm
                                title="Confirmation"
                                description="Are You Sure About Removing this group Detail ?"
                                okText="Yes"
                                cancelText="No"
                                confirm={() => DeleteFundList(record)}
                            >
                                <img src={SvgIcons.Delete} style={{ cursor: 'pointer' }} />
                            </CustomPopconfirm>) : null}
                    </Flex>
                )
            }
        }
    ]
    let content1;


    if (AllFundListStatus === 'loading') {
        content1 = <CommonLoading />
    } else if (AllFundListStatus === 'succeeded') {
        const rowKey = (dataSource) => dataSource?.id;
        content1 = <CustomStandardTable columns={TableColumn} data={dataSource} rowKey={rowKey} />
    } else if (AllFundListStatus === 'failed') {
        const rowKey = (dataSource) => dataSource?.id;
        content1 = <CustomStandardTable columns={TableColumn} data={dataSource} rowKey={rowKey} />
    }

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const TableColumnPrint = [{
        title: "SI No",
        render: (value, item, index) => index + 1,
    },
    {
        title: 'Fund Name',
        dataIndex: 'fund_name',
    },
    {
        title: 'Fund Type',
        dataIndex: 'fund_type'
    },
    {
        title: 'Start Date',
        dataIndex: 'from_date'
    },
    {
        title: 'End Date',
        dataIndex: 'to_date'
    },
    {
        title: 'Head Name',
        dataIndex: 'head_name',

    },
    {
        title: 'Amount / Head',
        dataIndex: 'fixed_fund_amount'
    },];

    const CurrentDate = dayjs().format('DD-MM-YYYY')

    return (
        <Fragment>
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'View Fund List'} />
                    </Col>
                    <Col span={24} md={12}>
                        <Flex aligncenter={true} end={true}>
                            <Label>Search by Fund Name :&nbsp;</Label>
                            <CustomInput
                                value={searchTexts}
                                placeholder="Search"
                                onSearch={handleSearchs}
                                onChange={(e) => handleSearchs(e.target.value)}
                            />
                        </Flex>
                    </Col>
                    <Col span={24} md={24}>
                        {content1}
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
                        <h3 style={{ textAlign: 'center' }}>Create Fund Group Details</h3><br />
                        <CustomStandardTable columns={TableColumnPrint} data={dataSource || []} pagination={false} />
                    </PrintShowData>
                </PrintHolder>


            </CustomCardView>
            <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={modelwith} modalTitle={modalTitle} modalContent={modalContent} />
        </Fragment>
    )
}

export default FundList