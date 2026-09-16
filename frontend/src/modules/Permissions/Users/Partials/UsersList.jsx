import React, { Fragment, useEffect, useState } from 'react'
import { SvgIcons } from '@assets/Svg'
import { Button, CustomInput, CustomSelect, CustomTag } from '@components/form'
import { CommonLoading, CustomCardView, CustomModal, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Tooltip } from 'antd'
import { TableIconHolder } from '@components/common/Styled'
import { useDispatch, useSelector } from 'react-redux'
import { GetUser, getUserStatus, selectUserDetails } from '../UserSlice'
import { UserView } from './UserView'
import { APIURLS } from '@request/apiUrls/urls'
import request from '@request/request'
import errorHandler from '@request/errorHandler'
import successHandler from '@request/successHandler'
import { CustomStandardTable } from '@components/form/CustomStandardTable'
import AddUsers from './AddUsers'
import { FaExchangeAlt } from 'react-icons/fa'
import Label from '@components/form/Label'
import { toast } from 'react-toastify'


const UsersList = () => {

    const dispatch = useDispatch()

    const [userdata, setUserDate] = useState([]);
    const [searchTexts, setSearchTexts] = useState([]);   //---------Seach Bar 1--------
    const [search2Texts, setSearch2Texts] = useState([]);   //---------Seach Bar 2--------
    const [filer, setFiler] = useState({});
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

    const close = () => {
        handleOk();
    }

    useEffect(() => {
        dispatch(GetUser())
    }, [])

    const AllUserDetails = useSelector(selectUserDetails)
    const UserStatus = useSelector(getUserStatus)

    useEffect(() => {
        setUserDate(AllUserDetails)
    }, [AllUserDetails])

    const handleSelect = (value) => {
        setFiler(value)
        setSearchTexts([])
        setSearch2Texts([])
    }
    const handleSearchs = (value) => {
        setSearchTexts(value);
    };
    const handle2Search = (value) => {
        setSearch2Texts(value);
    };

    const SelectOption = [
        {
            label: 'MemberName',
            value: 'MemberName'

        },
        {
            label: 'RoleName',
            value: 'RoleName'
        }
    ]
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
                    dispatch(GetUser());
                    return response.data
                }
                else {
                    toast.error('Failed')
                }

            })
            .catch(function (error) {
            });
    };


    const EditUserList = (record) => {
        setModelwith(700)
        setTrigger(trigger + 1)
        setModalTitle("Edit User");
        setModalContent(<AddUsers closee={close} updateUserList={record} Usertrigger={trigger} />);
        showModal();
    }

    const UserListView = (record) => {
        setModelwith(600)
        setTrigger(trigger + 1)
        setModalContent(<UserView viewUserlist={record} />)
        showModal();
    }

    const DeleteUserList = async (record) => {
        await request
            .delete(`${APIURLS.DELETE_USER}${record?.id}`, record)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: "success",
                    type: "success",
                });
                dispatch(GetUser())
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            });
    };

    const TableColumn = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Member Name',
            dataIndex: 'name',
            filteredValue: searchTexts ? [searchTexts] : null,
            onFilter: (value, record) => {
                return String(record.name).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.name).includes(value.toUpperCase());
            },
        },
        {
            title: 'Role',
            dataIndex: 'role_name',
            filteredValue: search2Texts ? [search2Texts] : null,
            onFilter: (value, record) => {
                return String(record.role_name).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.role_name).includes(value.toUpperCase());
            },
        },
        {
            title: 'E-mail',
            dataIndex: 'email'
        },
        {
            title: 'Status',
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
            render: ( record) => {
                return (
                    <Flex gap={'20px'} center={'true'}>
                        <TableIconHolder size={'22px'} onClick={() => handleStatusConfirm(record)}>
                            {record.status === "Enabled" ? (
                                <Tooltip title={'Active'}>
                                    <FaExchangeAlt color='red' style={{cursor:'pointer'}}/>
                                </Tooltip>
                            ) : (
                                <Tooltip title={'In-Active'}>
                                    <FaExchangeAlt color='blue' style={{cursor:'pointer'}} />
                                </Tooltip>
                            )}
                        </TableIconHolder>
                        <Tooltip title="View">
                            <TableIconHolder size={'28px'} onClick={() => {
                                UserListView(record)
                            }}>
                                <img src={SvgIcons.Eye} style={{cursor:'pointer'}} />
                            </TableIconHolder>
                        </Tooltip>
                        {/* <Tooltip title="Edit">
                            <TableIconHolder size={'28px'} onClick={() => {
                                EditUserList(record)
                            }}>
                                <img src={SvgIcons.Edit} />
                            </TableIconHolder>
                        </Tooltip> */}

                        {/* <CustomPopconfirm
                            title="Confirmation"
                            description="Are You Sure About Removing This RentalandLease Detail ?"
                            okText="Yes"
                            cancelText="No"
                            confirm={() =>
                                DeleteUserList(record)
                            }
                        >
                            <img src={SvgIcons.Delete} />
                        </CustomPopconfirm> */}
                    </Flex>
                )
            }
        }
    ]


    let content;
    if (UserStatus === 'loading') {
        content = <CommonLoading />
    } else if (UserStatus === 'succeeded') {
        const rowKey = (userdata) => userdata.id;
        content = <CustomStandardTable columns={TableColumn} data={userdata} rowKey={rowKey} />
    }
    else if (UserStatus === 'failed') {
        const rowKey = (userdata) => userdata.id;
        content = <CustomStandardTable columns={TableColumn} data={userdata} rowKey={rowKey} />
    }
    return (
        <div>
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={10}>
                        <CustomPageTitle Heading={'Users List'} />
                    </Col>
                    <Col span={24} md={14}>
                        <CustomRow center={'true'} space={[12, 12]}>
                            <Col span={24} md={3}>
                                <Label>Filter By</Label>
                            </Col>
                            <Col span={24} md={10}>
                                <CustomSelect name={'Select'}
                                    placeholder={'Select'} options={SelectOption} onChange={handleSelect} />
                            </Col>
                            <Col span={24} md={10}>
                                {filer === 'MemberName' ?
                                    (
                                        <CustomInput
                                            value={searchTexts}
                                            placeholder="Search Member Name"
                                            onSearch={handleSearchs}
                                            onChange={(e) => handleSearchs(e.target.value)}
                                        />
                                    ) :
                                    (
                                        <CustomInput
                                            value={search2Texts}
                                            placeholder="Search Role"
                                            onSearch={handle2Search}
                                            onChange={(e) => handle2Search(e.target.value)}
                                        />
                                    )
                                }
                            </Col>
                        </CustomRow>
                    </Col>
                    <Col span={24} md={24}>
                        {content}
                    </Col>
                </CustomRow>
            </CustomCardView>
            <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={modelwith}
                modalTitle={modalTitle}
                modalContent={modalContent} />
        </div>
    )
}

export default UsersList