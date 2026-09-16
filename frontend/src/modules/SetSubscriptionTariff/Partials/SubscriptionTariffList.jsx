import { SvgIcons } from '@assets/Svg'
import { Button } from '@components/form'
import { CommonLoading, CustomCardView, CustomModal, CustomPopConfirm, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Tooltip } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { IoPrint } from 'react-icons/io5'
import { getSubscriptionTariff, getSubscriptionTariffError, getSubscriptionTariffStatus, selectSubscriptionTariff } from '../SubscriptionTariffSlice'
import { useDispatch, useSelector } from 'react-redux'
import { SetSubscriptionTariff } from './SetSubscriptionTariff'
import { SubscriptionView } from './SubscriptionView'
import request from '@request/request'
import { APIURLS } from '@request/apiUrls/urls'
import successHandler from '@request/successHandler'
import errorHandler from '@request/errorHandler'
import { TableIconHolder } from '@components/common/Styled'
import { CustomStandardTable } from '@components/form/CustomStandardTable'
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from '@modules/Auth/authSlice'
import { userRolesConfig } from '@router/config/roles'
import styled from 'styled-components'
import { useReactToPrint } from 'react-to-print'
import { getCollectionList, getCollectionUserBased, selectCollectionListDetails, selectCollectionUserBasedDetails } from '@modules/CollectionDetails/CollectionDetailsSlice'
import { toast } from 'react-toastify'
import { CommonManagePrintName } from '@modules/ComManagePrintDetails/CommonManagePrint'

const PrintHolder = styled.div`
    padding: 10px 15px;
    @media print{     
      .PrintShowDatadd {
        display: block;
        page-break-before: always;
        border: 1px solid;
      }
      margin: 50px;
      width:100%;
      margin:auto;
    }
`

const PrintShowData = styled.div`
  display: none;
`


const SubscriptionTariffList = () => {

    const dispatch = useDispatch()
    const componentRef = useRef();
    const [dataSource, setDataSource] = useState([])
    const [trigger, setTrigger] = useState(0)

    const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
    const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
    const SubscriptionTariffPermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//


    // ======  Modal Open ========
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modelwith, setModelwith] = useState(0);
    const [modalTitle, setModalTitle] = useState();
    const [modalContent, setModalContent] = useState(null);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const close = () => {
        handleOk();
    }

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        dispatch(getSubscriptionTariff())
        dispatch(getCollectionList());
        dispatch(getCollectionUserBased());
    }, [])

    const SelectAllSubscription = useSelector(selectSubscriptionTariff)
    const SelectAllSubscriptionStatus = useSelector(getSubscriptionTariffStatus)
    const SelectAllSubscriptionError = useSelector(getSubscriptionTariffError)

    const AllCollectionDetails = useSelector(selectCollectionListDetails);
    const AllCollectionUserbasedDetails = useSelector(selectCollectionUserBasedDetails);

    // console.log(AllCollectionDetails,'AllCollectionDetails');
    useEffect(() => {
        setDataSource(SelectAllSubscription)
    }, [SelectAllSubscription])

    const FormExternalClose = () => {
        handleOk();
    };

    const UpdateSubscription = (record) => {
        setModelwith(800)
        setTrigger(trigger + 1)
        setModalContent(<SetSubscriptionTariff closee={close} FormExternalClose={FormExternalClose}
            updateSubscriptionTariff={record} subscriptiontrigger={trigger} />);
        showModal();
    }

    const DeleteSubtariff = async (data) => {
        await request
            .delete(`${APIURLS.DELETE_SUBSCRIPTIONTARIFF}${data?.id}/`, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: "success",
                    type: "success",
                });
                dispatch(getSubscriptionTariff());
                return response.data;
            })
            .catch(function (error) {
                if (error.response.status === 302) {
                    toast.error(error.response.data?.message);
                }
                else {
                    return errorHandler(error);
                }
            });
    };

    const TraiffList = (record) => {
        setModelwith(700)
        setTrigger(trigger + 1)
        setModalContent(<SubscriptionView record={record} />);
        showModal();
    }

    const TableColumn = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Date',
            dataIndex: 'date'
        },
        {
            title: 'Tariff No',
            dataIndex: 'subscription_no'
        },
        {
            title: 'Tariff Amount',
            dataIndex: 'tariff_amount'
        },
        {
            title: 'From',
            dataIndex: 'from_date'
        },
        {
            title: 'To',
            dataIndex: 'to_date'
        },
        {
            title: 'Actions',
            render: (text, record, index) => {
                return (
                    <Flex gap={'20px'} center={'true'}>
                        {superUsers || role === userRolesConfig.ADMIN || SubscriptionTariffPermission?.SubTariff?.View ? (
                            <Tooltip title="View">
                                <TableIconHolder size={'28px'} onClick={() => { TraiffList(record) }}>
                                    <img src={SvgIcons.Eye} style={{ cursor: 'pointer' }} />
                                </TableIconHolder>
                            </Tooltip>
                        ) : null}
                        {superUsers || role === userRolesConfig.ADMIN || SubscriptionTariffPermission?.SubTariff?.Edit ? (
                            <Tooltip title="Edit">
                                <TableIconHolder size={'28px'} onClick={() => { UpdateSubscription(record) }} >
                                    <img src={SvgIcons.Edit} style={{ cursor: 'pointer' }} />
                                </TableIconHolder>
                            </Tooltip>
                        ) : null}
                        {superUsers || role === userRolesConfig.ADMIN || SubscriptionTariffPermission?.SubTariff?.Delete ? (
                            <CustomPopConfirm
                                title="confirmation"
                                description="Are you sure about removing this subscription tariff detail ?"
                                okText="Yes"
                                cancelText="No"
                                confirm={() => DeleteSubtariff(record)}>
                                <Tooltip title="Delete">
                                    <img src={SvgIcons.Delete} style={{ cursor: 'pointer' }} />
                                </Tooltip>
                            </CustomPopConfirm>
                        ) : null}
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
            title: 'Date',
            dataIndex: 'date'
        },
        {
            title: 'Tariff No',
            dataIndex: 'subscription_no'
        },
        {
            title: 'Tariff Amount',
            dataIndex: 'tariff_amount'
        },
        {
            title: 'From',
            dataIndex: 'from_date'
        },
        {
            title: 'To',
            dataIndex: 'to_date'
        },
    ]

    let content;

    if (SelectAllSubscriptionStatus === 'loading') {
        content = <CommonLoading />
    } else if (SelectAllSubscriptionStatus === 'succeeded') {
        const rowKey = (dataSource) => dataSource.id;
        content = <CustomStandardTable columns={TableColumn} data={dataSource} rowKey={rowKey} />
    } else if (SelectAllSubscriptionStatus === 'failed') {
        content = <h2>{
            SelectAllSubscriptionError} </h2>
    }

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (
        <div>
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'Subscription Tariff List'} />
                    </Col>
                    <Col span={24} md={24}>
                        {content}
                    </Col>
                </CustomRow>
                <Flex flexend={'right'} style={{ marginTop: "10px" }}>
                    <a href="https://web.whatsapp.com/" target="blank">
                        <Button.Primary text={'Share'} icon={<FaWhatsapp />} />
                    </a>
                    <Button.Secondary text={'Print'} icon={<IoPrint />} onClick={handlePrint} />
                </Flex>
            </CustomCardView>

            <PrintHolder ref={componentRef}>
                <PrintShowData className="PrintShowDatadd">
                    <CommonManagePrintName />
                    <h3 style={{ textAlign: 'center' }}>Subscription Tariff Details</h3><br />
                    <CustomStandardTable columns={TableColumnPrint} data={dataSource} pagination={false} />
                </PrintShowData>
            </PrintHolder>

            <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={modelwith} modalTitle={modalTitle} modalContent={modalContent} />
        </div>
    )
}

export default SubscriptionTariffList