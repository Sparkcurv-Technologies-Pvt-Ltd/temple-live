import { SvgIcons } from '@assets/Svg'
import { CommonLoading, CustomCardView, CustomModal, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Tooltip } from 'antd'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getRole, getRoleStatus, selectRoleDetails } from '../UserSlice'
import { CustomStandardTable } from '@components/form/CustomStandardTable'
import AddUserPermission from './AddUserPermission'
import { TableIconHolder } from '@components/common/Styled'

const RoleList = () => {

    const dispatch = useDispatch();

    const [dataSource, setDataSource] = useState([]);
    // ======  Modal Open ========
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ======  Modal Title and Content ========
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState(null);
    const [trigger, setTrigger] = useState(0);

    // ----------  Form Reset UseState ---------
    const [modelwith, setModelwith] = useState(0);

    // ===== Modal Functions Start =====
    const showModal = () => {
        setIsModalOpen(true);
    };

    const ResetTrigger = () => {
        setTrigger(trigger + 1)
    }

    const CloseForm = () => {
        handleOk()
    }

    const handleOk = () => {
        setIsModalOpen(false);
        ResetTrigger()
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        dispatch(getRole())
    }, [])

    const AllRoles = useSelector(selectRoleDetails)
    const AllRolesStatus = useSelector(getRoleStatus)

    useEffect(() => {
        setDataSource(AllRoles)
    }, [AllRoles])

    const UpdateRole = (record) => {
        setModelwith(700)
        setTrigger(trigger + 1)
        setModalTitle("Choose Role");
        setModalContent(<AddUserPermission trigger={trigger} record={record} CloseEditForm={handleOk} />);
        showModal();
    }

    const TableColumn = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Role Name',
            dataIndex: 'Role_name'
        },
        {
            title: 'Action',
            render: (record) => {
                return (
                    <Flex gap={'20px'} center={'true'}>

                        <Tooltip title="Edit">
                            <TableIconHolder size={'28px'} onClick={() => {
                                UpdateRole(record)
                            }}>
                                <img src={SvgIcons.Edit} style={{cursor:'pointer'}}/>
                            </TableIconHolder>
                        </Tooltip>

                    </Flex>
                )
            }
        }
    ]

    let content;
    if (AllRolesStatus === 'loading') {
        content = <CommonLoading />
    } else if (AllRolesStatus === 'succeeded') {
        const rowKey = (dataSource) => dataSource.id;
        content = <CustomStandardTable columns={TableColumn} data={dataSource} rowKey={rowKey} />
    }
    else if (AllRolesStatus === 'failed') {
        const rowKey = (dataSource) => dataSource.id;
        content = <CustomStandardTable columns={TableColumn} data={dataSource} rowKey={rowKey} />
    }

    return (
        <div>
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'Role List'} />
                    </Col>
                    {/* <Col span={24} md={6}>
                        <CustomSelect label={'Filter'} options={filteroption} name={'filter'} />
                    </Col>
                    <Col span={24} md={6}>
                        <CustomInput label={'Value'} name={'value'} disabled={'true'} />
                    </Col> */}
                    <Col span={24} md={24}>
                        {content}
                    </Col>
                </CustomRow>
            </CustomCardView>
            <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={modelwith} modalTitle={modalTitle} modalContent={modalContent} />
        </div>
    )
}

export default RoleList