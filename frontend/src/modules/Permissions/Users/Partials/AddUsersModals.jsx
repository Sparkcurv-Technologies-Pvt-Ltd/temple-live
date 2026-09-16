
import { Button, CustomCheckBox, CustomInput } from '@components/form'
import { CustomRow, Flex } from '@components/others'
import { Col, Form } from 'antd'
import React, { useEffect, useState } from 'react'
import request from '@request/request'
import { APIURLS } from '@request/apiUrls/urls'
import successHandler from '@request/successHandler'
import errorHandler from '@request/errorHandler'
import CustomCheckBox2 from '@components/form/CustomCheckbox2'
import { useDispatch } from 'react-redux'
import { getRole } from '../UserSlice'
import { StyledHeading } from '../style'
import { toast } from 'react-toastify'


export const AddUsersModals = ({ CloseForm, trigger, record, CloseEditForm ,triggerr}) => {

    const [form] = Form.useForm()
    const dispatch = useDispatch()
    const [checkAllFamily, setCheckAllFamily] = useState(false)
    const [checkFamily, setCheckFamily] = useState(false)
    const [collectionTick, setCollectionTick] = useState(false)
    const [mapped, setMapped] = useState([])
    const [allCheckedd, setAllCheckedd] = useState(false)
    const [demo, setDemo] = useState(false)
    const [permission, setPermission] = useState({})


    useEffect(() => {
        form.resetFields();
    }, [triggerr])

    // useEffect(() => {
    //     if (record) {
    //         setPermission(record?.role_link)
    //     }

    // }, [record])


    useEffect(() => {
        if (record) {
            setPermissionDetails()
        }
    }, [record, permission, trigger])

    const setPermissionDetails = () => {
        form.setFieldsValue(record.role_link[0])
        form.setFieldsValue(record)
    }


    const permissionOptions = [
        {
            label: 'Add',
            value: 'Add'
        },
        {
            label: 'Edit',
            value: 'Edit'
        },
        {
            label: 'Delete',
            value: 'fam_del'
        },
    ]

    const handleAllFamily = (fam) => {

        const isChecked = fam.target.checked;

        setCheckAllFamily(isChecked)
        // const updatedPermissions = permissionOptions.map(option => ({
        //     ...option,
        //     checked: isChecked,
        // }));
    }

    const handleFamily = (indvfam) => {
        setCheckFamily(indvfam)
    }

    const handleDash = () => {

    }


    const [allChecked, setAllChecked] = useState(false);
    const [famAddChecked, setFamAddChecked] = useState(false);
    const [famEditChecked, setFamEditChecked] = useState(false);
    const [famDelChecked, setFamDelChecked] = useState(false);

    const handleAllClick = (event) => {
        const isChecked = event.target.checked;
        setAllChecked(isChecked);
        setFamAddChecked(isChecked);
        setFamEditChecked(isChecked);
        setFamDelChecked(isChecked);
    };

    const handleFamAdd = (event) => {
        setFamAddChecked(event.target.checked);
        if (event.target.checked === false) {
            setAllChecked(false)
        }
        else {
            setAllChecked(true)
        }

    };

    const handleFamEdit = (event) => {
        setFamEditChecked(event.target.checked);
        if (event.target.checked === false) {
            setAllChecked(false)
        }
        else {
            setAllChecked(true)
        }
    };

    const handleFamDel = (event) => {
        setFamDelChecked(event.target.checked);
        if (event.target.checked === false) {
            setAllChecked(false)
        }
        else {
            setAllChecked(true)
        }
    };

    const handleAsset = (checkedValues) => {
        const mappedValues = permissionOptions.map(option => ({
            [option.value]: checkedValues.includes(option.value),

        }));
        setMapped(mappedValues)
    }
    const handleLease = (per) => {
    }

    const handleCollection = (col) => {
        const SetCollectionTick = col.target.checked
        setCollectionTick(SetCollectionTick)
    }

    const handleAll = (dem) => {
        setDemo(dem.target.value)
    }


    const onReset = () => {
        form.resetFields();
        CloseForm()
    }

    // Check ALL Try 

    const [allCollectionChecked, setAllCollectionChecked] = useState(false)
    const [fundChecked, setFundChecked] = useState(false)
    const [festivalChecked, setFestivalChecked] = useState(false)

    const handlecheckAllCollection = (event) => {
        const isChecked = event.target.checked;
        setAllCollectionChecked(isChecked)
        setFundChecked(isChecked)
        setFestivalChecked(isChecked)
    }

    const handleFund = (fund) => {
        const fundchecked = fund.target.checked
        setFundChecked(fundchecked)
        if (fundchecked === false) {
            setAllCollectionChecked(false)
        }
        else {
            setAllCollectionChecked(true)
        }

    }

    const handleFestival = (fest) => {
        const festchecked = fest.target.checked
        setFestivalChecked(festchecked)
        if (festchecked === false) {
            setAllCollectionChecked(false)
        }
        else {
            setAllCollectionChecked(true)
        }
    }

    // Check ALL Try 

    const onFinish = (data) => {
        for (const key in data) {
            if (data.hasOwnProperty(key) && data[key] === undefined) {
                data[key] = false;
            }
        }

        const newvalues = {
            Role_name: data.Role_name,
            role_link: [{ ...data }]
        };

        delete newvalues.role_link[0].Role_name;

        if (record) {
            const UpdateNewValue = {
                Role_name: data.Role_name,
                id: record?.id,
                role_link: [{ ...data, id: record?.role_link[0]?.id }]
            };
            delete UpdateNewValue.role_link[0].Role_name;
            UpdateRole(UpdateNewValue)
        }
        else {
            PostRole(newvalues)
        }
        // const roleLinkArray = Object.entries(data)
        // .filter(([name]) => name !== 'Role_name')
        // .map(([name, value]) => ({ [name]: value }));


    };

    const onFinishFailed = (errorInfo) => {
        toast.warn("Please fill in all the required details !");
    };


    const PostRole = async (data) => {
        await request.post(`${APIURLS.POST_ROLE_PERMISSION}`, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: 'Role Added Successfully ! ',
                    type: 'success',
                })
                dispatch(getRole())
                CloseForm()
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            })
    }

    const UpdateRole = async (data) => {
        await request.put(`${APIURLS.PUT_ROLE_PERMISSION}${record?.id}/`, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: 'Role Updated Successfully ! ',
                    type: 'info',
                })
                dispatch(getRole())
                CloseEditForm()
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            })
    }

    const options = ['Tax', 'Rent', 'Lease'];

    const handleCheckboxChange = (checkedList) => {
    };

    return (

        <Form
            name='AddRole'
            form={form}
            labelCol={{
                span: 24,
            }}
            wrapperCol={{
                span: 24,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off">

            <CustomRow space={[24, 24]}>
                {/* <Col span={24} md={24}>
                    <CustomInput label={'Role Name'} name={'Role_name'}
                        rules={[
                            {
                                required: true,
                                message: 'Please Enter Role Name !',
                            }
                        ]}
                    />
                </Col>

                <Col span={24} md={24}>
                    <StyledHeading>
                        <p>Permission</p>
                    </StyledHeading>
                </Col>

                <Col span={24} md={24}></Col>
            </CustomRow>

            <CustomRow space={[12, 12]} >
                <Col span={24} md={24}>
                    <Flex spacearound={'true'} >
                        <CustomCheckBox label={'Dashboard'} name={'dashboard'} />
                        <CustomCheckBox label={'Balance Sheet View'} name={'balance_sheet_view'} />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Family'} name={'Family'} onChange={handleAllFamily} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group name='fammmmm'
                            options={permissionOptions}
                            onChange={handleFamily}
                        // value={checkAllFamily ? permissionOptions.map(option => option.value) : []}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Asset'} name={'Asset'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleAsset}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Expense'} name={'Expense'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleLease}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Collection'} name={'Collection'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleLease}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Manage'} name={'Manage'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleLease}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Fund'} name={'fund'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleLease}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Chit Fund'} name={'chit_fund'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleLease}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Fund Lease'} name={'fund_lease'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleLease}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Authority'} name={'authority'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleLease}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'User'} name={'user'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleLease}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Death'} name={'Death'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleLease}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Sangam'} name={'Sangam'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleLease}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Rental'} name={'Rental'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleLease}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Festival'} name={'Festival'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleLease}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Sub - Tarif'} name={'sub_tarif'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleLease}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Tax'} name={'tax'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleLease}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8} >
                    <CustomCheckBox label={'Interest'} name={'interest'} />
                </Col>
                <Col span={24} md={16}>
                    <Flex spacebetween={'true'} >
                        <Checkbox.Group
                            options={permissionOptions}
                            onChange={handleLease}
                        />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <CustomCheckBox label={'Fam Add'} name={'fam_add'} />
                    <CustomCheckBox label={'Fam Edit'} name={'fam_edit'} />
                    <CustomCheckBox label={'Fam Del'} name={'fam_del'} />
                </Col>

                <Col span={24} md={24} style={{ marginTop: '20px' }}>
                    <CustomCheckBox label={'Collection'} name={'Collection'} onChange={handleCollection} />
                </Col>

                <Col span={24} md={8}>
                    <CustomCheckBox label={'Fund'} name={'fund'} />
                    <CustomCheckBox label={'Festival'} name={'festival'} />
                    <CustomCheckBox label={'Tax'} name={'tax'} />
                </Col>

                <Col span={24} md={8}>
                    <CustomCheckBox label={'Rent'} name={'rent'} />
                    <CustomCheckBox label={'Management Interest'} name={'management_interest'} />
                    <CustomCheckBox label={'Lease'} name={'lease'} />
                </Col>

                <Col span={24} md={8}>
                    <CustomCheckBox label={'Chit Interest'} name={'chit_interest'} />
                    <CustomCheckBox label={'Sub - Tariff'} name={'sub_tariff'} />
                    <CustomCheckBox label={'Balance'} name={'balance'} />

                </Col> */}

                {/* <br />.......
                <Checkbox label={'Select All'} onChange={handleAllClick} checked={allChecked} name={'demoooo'} />
                <CustomCheckBox name='fam_add' checked={famAddChecked} onChange={handleFamAdd}>
                    Family Add
                </CustomCheckBox>
                <Checkbox label={'Balance'} name={'fam_edit'} checked={famEditChecked} onChange={handleFamEdit} />
                <Checkbox label={'Balance'} name={'fam_del'} checked={famDelChecked} onChange={handleFamDel} />
                <br />.......lll */}

                {/* <CheckboxGroupWithCheckAll options={options} onChange={handleCheckboxChange} /> */}

                <Col span={24} md={24}>
                    <CustomInput label={'Role Name'} name={'Role_name'}
                        rules={[
                            {
                                required: true,
                                message: 'Please Enter Role Name !',
                            }
                        ]}
                    />
                </Col>

                <Col span={24} md={24}>
                    <StyledHeading>
                        <p>Permission</p>
                    </StyledHeading>
                </Col>

                <Col span={24} md={24}>
                    <Flex center={'true'} gap={'30px'}>
                        <CustomCheckBox2 label={'Dashboard'} name={'dashboard'} />
                        <CustomCheckBox2 label={'Balance Sheet View'} name={'balance_sheet_view'} />
                    </Flex>
                </Col>

                {/* // Family // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox label={'Family Add'} name='fam_add' checked={famAddChecked} onChange={handleFamAdd} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox label={'Family Edit'} name={'fam_edit'} checked={famEditChecked} onChange={handleFamEdit} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox label={'Family Delete'} name={'fam_del'} checked={famDelChecked} onChange={handleFamDel} />
                    </Flex>
                </Col>

                {/* // Asset // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Asset Add'} name={'asset_add'} checked={famEditChecked} onChange={handleFamEdit} />
                    </Flex>
                </Col>


                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Asset Edit'} name={'asset_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Asset Delete'} name={'asset_del'} />
                    </Flex>
                </Col>

                {/* // Expense //  */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Expense Add'} name={'expense_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Expense Edit'} name={'expense_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Expense Del'} name={'expense_del'} />
                    </Flex>
                </Col>

                {/* // Collection // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Collection Add'} name={'collection_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Collection Edit'} name={'collection_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Collection Del'} name={'collection_del'} />
                    </Flex>
                </Col>

                {/* // Manage // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Manage Add'} name={'manage_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Manage Edit'} name={'manage_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Manage Del'} name={'manage_del'} />
                    </Flex>
                </Col>

                {/* // Fund // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Fund Add'} name={'fund_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Fund Edit'} name={'fund_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Fund Del'} name={'fund_del'} />
                    </Flex>
                </Col>

                {/* // Chit - Fund // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Chit-Fund Add'} name={'chit_fund_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Chit-Fund Edit'} name={'chit_fund_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Chit-Fund Del'} name={'chit_fund_del'} />
                    </Flex>
                </Col>

                {/* // Fund - Lease // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Fund-Lease Add'} name={'fund_lease_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Fund-Lease Edit'} name={'fund_lease_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Fund-Lease Del'} name={'fund_lease_del'} />
                    </Flex>
                </Col>

                {/* // Authority  // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Authority Add'} name={'authority_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Authority Edit'} name={'authority_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Authority Del'} name={'authority_del'} />
                    </Flex>
                </Col>

                {/* // User // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'User Add'} name={'user_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'User Edit'} name={'user_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'User Del'} name={'user_del'} />
                    </Flex>
                </Col>

                {/* // Death // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Death Add'} name={'death_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Death Edit'} name={'death_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Death Del'} name={'death_del'} />
                    </Flex>
                </Col>

                {/* // Sangam // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Sangam Add'} name={'sangam_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Sangam Edit'} name={'sangam_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Sangam Del'} name={'sangam_del'} />
                    </Flex>
                </Col>

                {/* // Rental // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Rental Add'} name={'rental_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Rental Edit'} name={'rental_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Rental Del'} name={'rental_del'} />
                    </Flex>
                </Col>

                {/* // Festival // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Festival Add'} name={'festival_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Festival Edit'} name={'festival_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Festival Del'} name={'festival_del'} />
                    </Flex>
                </Col>

                {/* // Sub - Tarif // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Sub - Tariff'} name={'sub_tarif_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Sub - Tarif Edit'} name={'sub_tarif_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Sub - Tarif Del'} name={'sub_tarif_del'} />
                    </Flex>
                </Col>

                {/* // Tax // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Tax Add'} name={'tax_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Tax Edit'} name={'tax_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Tax Del'} name={'tax_del'} />
                    </Flex>
                </Col>


                {/* // Interest // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Interest Add'} name={'interest_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Interest Edit'} name={'interest_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Interest Del'} name={'interest_del'} />
                    </Flex>
                </Col>

                {/* // Interest // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Interest Add'} name={'interest_add'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Interest Edit'} name={'interest_edit'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Interest Del'} name={'interest_del'} />
                    </Flex>
                </Col>

                <Col span={24} md={12}>
                    {/* <Flex spaceevenly={'true'}> */}
                        <p style={{ color: 'brown' }}>Collection :</p>
                        {/* <CustomCheckBox2 label={'Check All'} name={'checked_all_collection'} onChange={handlecheckAllCollection} checked={allCollectionChecked} /> */}
                    {/* </Flex> */}
                </Col>

                <Col span={24} md={12}>

                </Col>

                {/* // Collection // */}

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Fund'} name={'fund'} onChange={handleFund} checked={fundChecked} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Festival'} name={'festival'} onChange={handleFestival} checked={festivalChecked} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Tax'} name={'tax'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Rent'} name={'rent'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Lease'} name={'lease'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Management Interest'} name={'management_interest'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'} >
                        <CustomCheckBox2 label={'Chit - Interest'} name={'chit_interest'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Sub - Tariff'} name={'sub_tariff'} />
                    </Flex>
                </Col>

                <Col span={24} md={8}>
                    <Flex center={'true'}>
                        <CustomCheckBox2 label={'Balance'} name={'balance'} />
                    </Flex>
                </Col>

            </CustomRow>

            <Flex center gap={'20px'} style={{ margin: '30px' }}>
            {record ? (
            <>
              <Button.Success text={"Update"} htmlType={"submit"} />
              <Button.Danger text={"Cancel"} onClick={() => CloseEditForm()}
              />
            </>
          ) : (
            <>
              <Button.Danger text={"save"} htmlType={'submit'} />
              <Button.Success text={"Reset"} onClick={() => onReset()} />
            </>)}

                {/* <Button.Danger text={'Save'} htmlType={'submit'} />
                <Button.Success text={'Cancel'} onClick={onReset} /> */}

            </Flex>

        </Form>
    )
}