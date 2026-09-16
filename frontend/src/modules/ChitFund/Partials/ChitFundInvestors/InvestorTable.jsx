import React, { Fragment, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { AllInvestortableData, AllInvestortableStatus, getInvestortable } from '@modules/InvestorDashBoard/InvestorDashBoardSlice'
import { CustomStandardTable } from '@components/form/CustomStandardTable'
import { CommonLoading, CustomCardView, CustomModal, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { TableIconHolder } from '@components/common/Styled'
import { Tooltip } from 'antd'
import { FaExchangeAlt } from 'react-icons/fa'
import { Button, CustomTag } from '@components/form'
import { APIURLS } from '@request/apiUrls/urls'
import request from '@request/request'

export const InvestorTable = () => {

    const dispatch = useDispatch();

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
        dispatch(getInvestortable())
    }, [])

    const TableData = useSelector(AllInvestortableData)
    const TableDataStatus = useSelector(AllInvestortableStatus)

    const handleStatusConfirm = (record) => {
        setModalContent(
            <StatusConfirm
                record={record}
                onConfirm={() => handleStatus(record)}
                onCancel={handleOk}
            />
        );
        showModal();
        setModelwith(500);
    };

    const StatusConfirm = ({ record, onConfirm, onCancel }) => {
        return (
            <div>
                {record.status === "Enabled" ? (
                    <h5 style={{ fontSize: '20px', textAlign: 'center' }}>Do you want to change the user to In-Active?</h5>

                ) : (
                    <h5 style={{ fontSize: '20px', textAlign: 'center' }}>Do you want to change the user to Active?</h5>

                )}
                <Flex gap={'20px'} margin={'20px'} center={true}>
                    <Button.Primary text={'Yes'} onClick={() => onConfirm(record)} />
                    <Button.Secondary text={'No'} onClick={onCancel} />
                </Flex>
            </div>
        );
    };

    const handleStatus = (record) => {
        const apiUrl = record.status === 'Enabled' ? APIURLS.Disable_User : APIURLS.Enable_user;

        request.patch(`${apiUrl}/${record.id}`)
            .then(function (response) {
                if (response.status === 200) {
                    handleOk();
                    dispatch(getInvestortable());
                    return response.data
                }
                else {
                    toast.error('Failed')
                }

            })
            .catch(function (error) {
            });
    };

    const TableColumn = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Chit Fund Name',
            dataIndex: 'chit_fund_name'
        },
        {
            title: 'Username',
            dataIndex: 'username'
        },
        {
            title: "Date",
            dataIndex: "created_at",
            render: (date) => {
                return date ? new Date(date).toLocaleDateString() : "";
            },
        },
        
        // {
        //     title: 'Role Name',
        //     dataIndex: 'role_name'
        // },
        {
            title: 'Status',
            // dataIndex: 'status',
            render: (record, i) => (
                <Fragment>
                    <Flex center={'true'}>
                        {record.status === "Enabled" ? (
                            <CustomTag bordered={"true"} color={'processing'} title={`${record.status}`} />
                        ) : (
                            <CustomTag bordered={"true"} color={'error'} title={`${record.status}`} />
                        )}
                    </Flex>
                </Fragment>
            ),
        },
        {
            title: 'Action',
            render: (text, record, index) => {
                return (
                    <>
                        <TableIconHolder size={'22px'} onClick={() => handleStatusConfirm(record)}>
                            {record.status === "Enabled" ? (
                                <Tooltip title={'Active'}>
                                    <FaExchangeAlt color='red' style={{ cursor: 'pointer' }} />
                                </Tooltip>
                            ) : (
                                <Tooltip title={'In-Active'}>
                                    <FaExchangeAlt color='blue' style={{ cursor: 'pointer' }} />
                                </Tooltip>
                            )}
                        </TableIconHolder></>
                )
            }
        },
    ]

    let content;

    if (TableDataStatus === 'loading') {
        content = <CommonLoading />
    } else if (TableDataStatus === 'succeeded') {
        const rowKey = (TableData) => TableData.id;
        content = <CustomStandardTable columns={TableColumn} data={TableData} rowKey={rowKey} />
    } else if (TableDataStatus === 'failed') {
        const rowKey = (TableData) => TableData.id;
        content = <CustomStandardTable columns={TableColumn} data={TableData} rowKey={rowKey} />
    }

    return (
        <Fragment>
            <CustomCardView>
                <CustomPageTitle Heading={'Investor Llist'} />
                {content}
            </CustomCardView>
            <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={modelwith}
                modalTitle={modalTitle}
                modalContent={modalContent} />
        </Fragment>
    )
}
