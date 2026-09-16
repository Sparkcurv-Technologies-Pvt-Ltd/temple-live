import { Col } from 'antd';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getAdmin, getAdminGetStatus, selectAllAdminGet } from '../AdminSlice';
import { CommonLoading, CustomCardView, CustomModal, CustomRow } from '@components/others';
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import { CustomInput, CustomSelect } from '@components/form';
import { CustomStandardTable } from '@components/form/CustomStandardTable';
import Label from '@components/form/Label';

export const AdminTable = () => {

    const dispatch = useDispatch()

    const [dataSource, setDataSource] = useState([])

    const [searchTexts, setSearchTexts] = useState([]);   //---------Seach Bar 1--------
    const [search2Texts, setSearch2Texts] = useState([]);   //---------Seach Bar 2--------
    const [filer, setFiler] = useState({})

    // ======  Modal Open ========
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ======  Modal Title and Content ========
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState(null);

    // ----------  Form Reset UseState ---------
    const [formReset, setFormReset] = useState(0);
    const [modelwith, setModelwith] = useState(0);
    const [groceryFormUpdate, setGroceryFormUpdate] = useState(0)



    // ===== Modal Functions Start =====

    const showModal = () => {
        setIsModalOpen(true);
        FormUpdate()
    };
    
    const handleOk = () => {
        setIsModalOpen(false);
        RestForm()
        FormUpdate()
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        RestForm()
    };
    const FormUpdate = () => {
        setGroceryFormUpdate(groceryFormUpdate + 1)
    }
    const RestForm = () => {
        setFormReset(formReset + 1)
    }

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
            label: 'Name',
            value: 'Name'

        },
        {
            label: 'Email',
            value: 'Email'
        }
    ]




    useEffect(() => {
        dispatch(getAdmin())
    }, [])

    const adminGet = useSelector(selectAllAdminGet)
    const adminStatus = useSelector(getAdminGetStatus)


    useEffect(() => {
        setDataSource(adminGet)
    }, [adminGet])


    // const handleEdit = (record) => {
    //     setGroceryFormUpdate(groceryFormUpdate + 1)
    //     setModelwith(700)
    //     setModalTitle("Edit Role");
    //     setModalContent(<AddRolePermission ViewRecord={record} handleOk={handleOk} RestForm={groceryFormUpdate} />);
    //     showModal();
    // };

    // const handleDeleted = (record) => {
    //     setModalContent(<ConfirmDeleted record={record} />)
    //     setModalTitle('')
    //     showModal()
    //     setModelwith(400)
    // }


    // const ConfirmDeleted = (record) => {
    //     return (
    //         <div>
    //             <h5 style={{ fontSize: '20px', textAlign: 'center' }}>Are You Sure To Delete ?</h5>
    //             <Flex gap={'20px'} margin={'20px'} center={true}>
    //                 <Button.Primary text={'yes'} onClick={() => handleDeletedPost(record)} />
    //                 <Button.Secondary text={'No'} onClick={() => handleOk()} />
    //             </Flex>
    //         </div>
    //     )
    // }

    // const handleDeletedPost = (record) => {
    //     request.delete(`${APIURLS.CREATEROLEDelete}${record?.record?.id}/`)
    //         .then(function (response) {
    //             successHandler(response, {
    //                 notifyOnSuccess: true,
    //                 notifyOnFailed: true,
    //                 msg: 'Delete success',
    //                 type: 'success'
    //             })
    //             handleOk()
    //             dispatch(getRole())
    //             return response.data;
    //         })
    //         .catch(function (error) {
    //             if (error.response.status === 401) {
    //                 toast.error(error.response.data?.message)
    //             } else {
    //                 return errorHandler(error);
    //             }
    //         })
    // }




    const tableColumns = [
        {
            title: 'S.No',
            render: (text, record, index) => {
                return (
                    <h4>{index + 1}</h4>
                )
            },
        },
        {
            title: 'Name',
            dataIndex: 'name',
            filteredValue: searchTexts ? [searchTexts] : null,
            onFilter: (value, record) => {
                return String(record.name).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.name).includes(value.toUpperCase());
            },
        },
        {
            title: 'Email',
            dataIndex: 'email',
            filteredValue: search2Texts ? [search2Texts] : null,
            onFilter: (value, record) => {
                return String(record.email).toLowerCase().includes(value.toLowerCase()) ||
                    String(record.email).includes(value.toUpperCase());
            },
        },
        // {
        //     title: 'Action',
        //     render: (record) => {
        //         return (
        //             <Flex center gap={'10px'}>
        //                 <Tooltip title={'Edit'}>
        //                     <TableIconHolder size={'28px'} onClick={() => handleEdit(record)}>
        //                         <img src={SvgIcons.Edit} alt="edit" />
        //                     </TableIconHolder>
        //                 </Tooltip>

        //                 <Tooltip title={'Delete'}>
        //                     <TableIconHolder color={THEME.red} size={'22px'}
        //                         onClick={() => handleDeleted(record)}>
        //                         <img src={SvgIcons.Delete} alt="delete" />
        //                     </TableIconHolder>
        //                 </Tooltip>
        //             </Flex>
        //         )
        //     }
        // },
    ]

    let content;
    if (adminStatus === 'loading') {
        content = <CommonLoading />
    } else if (adminStatus === 'succeeded') {
        const rowKey = (dataSource) => dataSource.id;
        content = <CustomStandardTable columns={tableColumns} data={dataSource} rowKey={rowKey} />
    }
    else if (adminStatus === 'failed') {
        const rowKey = (dataSource) => dataSource.id;
        content = <CustomStandardTable columns={tableColumns} data={dataSource} rowKey={rowKey} />
    }

    return (
        <CustomCardView>
            <CustomRow space={[12, 12]}>
                <Col span={24} md={10}>
                <CustomPageTitle Heading={'Admin List'} />
                </Col>
                <Col span={24} md={14}>
                    <CustomRow center={'true'} space={[12, 12]}>
                        <Col span={24} md={3}>
                            <Label>Filter By</Label>
                        </Col>
                        <Col span={24} md={10}>
                            {/* <Flex aligncenter={true} spacebetween={true}> */}

                            <CustomSelect name={'Select'}
                                placeholder={'Select'} options={SelectOption} onChange={handleSelect} />
                            {/* </Flex> */}
                        </Col>
                        <Col span={24} md={10}>
                            {filer === 'Name' ?
                                (
                                    <CustomInput
                                        value={searchTexts}
                                        placeholder="Search  Name"
                                        onSearch={handleSearchs}
                                        onChange={(e) => handleSearchs(e.target.value)}
                                    />
                                ) :
                                (
                                    <CustomInput
                                        value={search2Texts}
                                        placeholder="Search Email"
                                        onSearch={handle2Search}
                                        onChange={(e) => handle2Search(e.target.value)}
                                    />
                                )
                            }
                        </Col>

                    </CustomRow>
                </Col>
                </CustomRow>
                {content}
                <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={modelwith} modalTitle={modalTitle} modalContent={modalContent} />
       
        </CustomCardView>
    )
}
