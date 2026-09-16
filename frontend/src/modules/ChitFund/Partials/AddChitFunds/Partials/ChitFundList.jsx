import { SvgIcons } from '@assets/Svg'
import { Button, CustomInput, CustomSelect, CustomTable } from '@components/form'
import { CommonLoading, CustomCardView, CustomModal, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Tooltip } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { IoPrint } from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux'
import { AllChitList, AllChitListStatus, getChitFundList } from '@modules/ChitFund/ChitFundSlice'
import { CustomStandardTable } from '@components/form/CustomStandardTable'
import { TableIconHolder } from '@components/common/Styled'
import { AddChitFund } from '@modules/ChitFund/Partials/AddChitFunds/Partials/AddChitFund'
import ChitFundListView from '@modules/ChitFund/Partials/AddChitFunds/Partials/ChitFundListView'
import Label from '@components/form/Label'
import styled from 'styled-components'
import { useReactToPrint } from 'react-to-print'

import { useNavigate } from 'react-router-dom'
import { userRolesConfig } from '@router/config/roles'
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from '@modules/Auth/authSlice'
import { toast } from 'react-toastify'
import CustomPopconfirm from '@components/others/CustomPopConfirm'
import request from '@request/request'
import { APIURLS } from '@request/apiUrls/urls'
import errorHandler from '@request/errorHandler'
import successHandler from '@request/successHandler'


const PrintHolder = styled.div`
    padding: 10px 15px;
    @media print{     
      .PrintShowDatadd {
        display: block;
        page-break-before: always;
      };
      margin: 50px;
      width:100%;
      margin:auto;
    }
`

const PrintShowData = styled.div`
  display: none;
`
const TableStyle = styled.div`
  .row_color_change {
    background-color: red;  // Ensures that this style applies to elements with this class within the component
  }

  .even-row {
    background-color: #f7f7f7;
  }

  .odd-row {
    background-color: white;
  }
`;

const ChitFundLists = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate();
    const componentRef = useRef();

    const [searchTexts, setSearchTexts] = useState([]);   //---------Seach Bar --------
    // ======  Modal Open ========
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ======  Modal Title and Content ========
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState(null);

    // ----------  Form Reset UseState ---------
    const [modelwith, setModelwith] = useState(0);

    const [chitTrigger, setChitTrigger] = useState(0);

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

    const handleSearchs = (value) => {
        setSearchTexts(value);
    };

    useEffect(() => {
        dispatch(getChitFundList());
    }, [])

    const AllDetails = useSelector(AllChitList);
    const AllDetailsStatus = useSelector(AllChitListStatus);

    const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
    const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
    const ChitFundPermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

    const FormUpdate = () => {
        dispatch(getChitFundList())
        handleOk()
    }
    const EditChitFund = (record) => {
        setChitTrigger(chitTrigger + 1)
        setModelwith(1000)
        setModalContent(<AddChitFund ChitFundRecord={record} FormUpdate={FormUpdate} chitTrigger={chitTrigger} chitClose={handleOk} />);
        showModal();
    }

    const ViewMemberProfile = (record) => {
        navigate(`/chitfundListView/${record?.id}`);
    }
    const getRowClassName = (record, index) => {
        if (record?.action === false) {
            return 'row_color_change';
        }
        return index % 2 === 0 ? 'even-row' : 'odd-row';
    };
    const DeleteChitFUndList = async (record) => {
        await request
            .delete(`${APIURLS.EDIT_CHIT_FUNT}/${record?.id}/`, record)
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
                    dispatch(getChitFundList());
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
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Fund No',
            dataIndex: 'chit_no'
        },
        {
            title: 'Chit Fund Name',
            dataIndex: 'chit_name',
            filteredValue: searchTexts ? [searchTexts] : null,
            onFilter: (value, record) => {
                return String(record.chit_name).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.chit_name).includes(value.toUpperCase());
            },
        },
        {
            title: 'Start Date',
            dataIndex: 'starting_date'
        },
        {
            title: 'Total Amount',
            dataIndex: 'cash_inhand_amount'
        },
        {
            title: 'Action',
            render: (text, record, index) => {
                return (
                    <Flex gap={'20px'} flexstart={true}>
                        {superUsers ||
                            role === userRolesConfig.ADMIN ||
                            ChitFundPermission?.Chitfund?.View ? (
                            <Tooltip title="View">
                                <TableIconHolder size={'28px'} onClick={() => ViewMemberProfile(record)} >
                                    <img src={SvgIcons.Eye} style={{ cursor: "pointer" }} />
                                </TableIconHolder>
                            </Tooltip>) : null}
                        {superUsers && record?.action  || role === userRolesConfig.ADMIN && record?.action  || ChitFundPermission?.Chitfund?.Edit && record?.action ? (
                            <Tooltip title="Edit">
                                <TableIconHolder size={'28px'} onClick={() => EditChitFund(record)}  >
                                    <img src={SvgIcons.Edit} style={{ cursor: "pointer" }} />
                                </TableIconHolder>
                            </Tooltip>) : null}

                        {superUsers && record?.action  || role === userRolesConfig.ADMIN && record?.action  || ChitFundPermission?.Chitfund?.Delete && record?.action ? (
                            <CustomPopconfirm
                                title="Confirmation"
                                description="Are you sure you want to remove this Chit-Fund detail?"
                                okText="Yes"
                                cancelText="No"
                                confirm={() => DeleteChitFUndList(record)}
                            >
                                <Tooltip title="Delete">
                                    <img src={SvgIcons.Delete} style={{ cursor: "pointer" }} />
                                </Tooltip>
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
            title: 'Fund No',
            dataIndex: 'chit_no'
        },
        {
            title: 'Fund Name',
            dataIndex: 'chit_name',
        },
        {
            title: 'Start Date',
            dataIndex: 'starting_date'
        },
        {
            title: 'Total Amount',
            dataIndex: 'cash_inhand_amount'
        },
    ]

    let content;

    // Assuming AllDetailsStatus and other logic is handled within this component
    if (AllDetailsStatus === 'loading') {
        content = <CommonLoading />
    } else if (AllDetailsStatus === 'succeeded') {
        const rowKey = record => record.id;
        content = <CustomStandardTable columns={TableColumn} data={AllDetails} rowKey={rowKey} rowClassName={getRowClassName} />
    } else if (AllDetailsStatus === 'failed') {
        const rowKey = record => record.id;
        content = <CustomStandardTable columns={TableColumn} data={AllDetails} rowKey={rowKey} rowClassName={getRowClassName} />
    }
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (
        <div>
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'Chit - Fund List'} />
                    </Col>
                    <Col span={24} md={12}>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                            <Label style={{ marginRight: '20px' }}>Search by Chit Fund Name :</Label>
                            <CustomInput
                                value={searchTexts}
                                placeholder="Search"
                                onSearch={handleSearchs}
                                onChange={(e) => handleSearchs(e.target.value)}
                            />
                        </div>
                    </Col>
                    <Col span={24} md={24}>
                        <TableStyle>
                            {content}
                        </TableStyle>
                    </Col>
                </CustomRow>

                <Flex flexend={'right'} style={{ marginTop: "10px" }}>
                    <a href="https://web.whatsapp.com/" target="blank">
                        <Button.Primary text={'Share'} icon={<FaWhatsapp />} />
                    </a>
                    <Button.Secondary text={'Print'} icon={<IoPrint />} onClick={handlePrint} />
                </Flex>

                <PrintHolder ref={componentRef}>
                    <PrintShowData className="PrintShowDatadd">
                        <h1 style={{ textAlign: 'center' }}>Chit Fund Details</h1><br />
                        <CustomStandardTable columns={TableColumnPrint} data={AllDetails} pagination={false} />
                    </PrintShowData>
                </PrintHolder>

            </CustomCardView>

            <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={modelwith} modalTitle={modalTitle} modalContent={modalContent} />
        </div>
    )
}

export default ChitFundLists