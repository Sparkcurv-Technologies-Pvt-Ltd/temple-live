import { Button, CustomInput, CustomInputNumber, CustomRadioButton, CustomSelect, CustomTable, CustomTextArea } from '@components/form'
import { CustomCardView, CustomModal, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Form, Spin } from 'antd'
import React, { Fragment, useEffect, useState } from 'react'
import { AddMemberDetails } from './AddMemberDetails'
import { SvgIcons } from '@assets/Svg'
import request from '@request/request'
import { APIURLS } from '@request/apiUrls/urls'
import successHandler from '@request/successHandler'
import errorHandler from '@request/errorHandler'
import { useDispatch, useSelector } from 'react-redux'
import { getFamilyDetails, getFamilyGroupDetails, selectFamilyDetails } from '../FamilySlice'
import { StyledRemoveBtn } from '../style'
import { AiFillPlusCircle } from 'react-icons/ai'
import CustomPopconfirm from '@components/others/CustomPopConfirm'
import { toast } from 'react-toastify'
import DummyUser from '@assets/images/DummyUser.jpg'


export const AddFamilyDetails = ({ trigger, familyrecord, updatetrigger, CloseFormm }) => {

  const [form] = Form.useForm()
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const [radioBtncheck, setRadioBtncheck] = useState('')
  const [isloading, setIsloading] = useState(false)
  const [findAnces, setFindAnces] = useState({})
  const [findAncesTrigger, setFindAncesTrigger] = useState(0)

    // For Showing on Table 
    const [dynamicTableData, setDynamicTableData] = useState([])

    const dispatch = useDispatch()
    const [familyDetails, setFamilyDetails] = useState([])

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

  const CloseForm = () => {
    handleOk()
  }

  const handleOk = () => {
    setIsModalOpen(false);
    // ResetTrigger()
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    form.resetFields();
  }, [trigger, updatetrigger])

  const updateFamilyMember = (record, rowKey) => {
    setUpdateTrigger(updateTrigger + 1)
    setModelwith(700)
    setModalTitle("Update Family Members");
    setModalContent(<AddMemberDetails memberrecord={record}
      SetDynamicEditTable={SetDynamicEditTable} CloseForm={CloseForm} familyrecord={familyrecord}
      index={rowKey} updateTrigger={updateTrigger} setRadioBtncheck={setRadioBtncheck} radioBtncheck={radioBtncheck} />);
    showModal();
  }

  // =============  Dynamic Table Data



  useEffect(() => {
    dispatch(getFamilyDetails())
  }, [])

  const AllFamilyDetails = useSelector(selectFamilyDetails)

  useEffect(() => {
    setFamilyDetails(AllFamilyDetails)
  }, [AllFamilyDetails, findAncesTrigger])

  // const AncestorsOptions = familyDetails?.map((anc) => ({ label: anc.family_no, value: anc.id }))
  const AncestorsOptions = familyDetails?.map((anc) => ({
    label: `${anc.family_no}/${anc.head_member_name}`,
    value: anc.id
  }));

  useEffect(() => {
    if (findAnces) {
      const ancestorName = findAnces.family_no && findAnces.head_member_name
        ? `${findAnces.family_no}/${findAnces.head_member_name}`
        : '';

      form.setFieldsValue({
        ancestor_detail: ancestorName,
        ancestor: findAnces.id
      });
    }
  }, [findAnces, findAncesTrigger])

  const handleAnces = (value) => {
    const FindAncestor = familyDetails?.find((acId) => acId?.id === value)
    setFindAnces(FindAncestor)
    setFindAncesTrigger(findAncesTrigger + 1)
    if(familyrecord){
      GetAncestorFind(value)

    }
    
  }
  const GetAncestorFind = async (value) => {
    await request
      .get(`${APIURLS.GET_ANCESTER_EDIT}/${value}/`, value)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  useEffect(() => {
    form.setFieldsValue(familyrecord)
  }, [familyrecord, updatetrigger])

  useEffect(() => {
    // if (familyrecord?.family) {
      const tableData = familyrecord?.family.map((value, index) => ({
        ...value,
        key: index
      }));

      setDynamicTableData(tableData);
    // }
  }, [familyrecord, updatetrigger]);

  const RadioOptions = [
    {
      label: 'EXISTING',
      value: 'EXCISTING'
    },
    {
      label: 'NEW',
      value: 'NEW'
    },
  ]


  const nativeoptions = [
    {
      label: 'NATIVE',
      value: 'NATIVE'
    },
    {
      label: 'OTHERS',
      value: 'OTHERS'
    }
  ]

  const MemberTableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: 'Member Name',
      dataIndex: 'member_name'
    },
    {
      title: 'Relationship',
      dataIndex: 'member_relation_ship'
    },
    {
      title: 'Member Photo',
      render: (record) => {
        // console.log(record.member_photo,'kkkkk');
        return (
          <Flex center={'true'}>
            {record.member_photo ?
             <img src={record.member_photo} alt='' width={100} style={{ objectFit: 'cover' }} />
             :<img src={DummyUser} alt='' width={100} style={{ objectFit: 'cover' }}/>
            } 
          </Flex>
        )
      }
    },
    {
      title: 'Action',
      render: (text,record, index,) => {
        // console.log(record,'QWeeeeee');
        const rowKey = record.key;
        return (
          <Flex gap={'true'} center={'true'}>
           <StyledRemoveBtn>
                <AiFillPlusCircle style={{ fontSize: '23px', marginRight: '10px', color: 'blue' }} onClick={() => updateFamilyMember(record, rowKey)} />
              </StyledRemoveBtn>
            
            <CustomPopconfirm
              title="Confirmation"
              description="Are you absolutely certain about removing this added detail?"
              okText="Yes"
              cancelText="No"
              confirm={() => RowRemove(rowKey)}
            >
              <img src={SvgIcons.Remove} style={{cursor:"pointer"}}/>
            </CustomPopconfirm>
          </Flex>
        )

      }
    }
  ]

  const onReset = () => {
    form.resetFields();
  }

  // ---------- SET VALUE TO DYNAMIC DATA ------

  const SetDynamicTable = (value) => {
    setDynamicTableData((prev) => {
      if (!Array.isArray(prev)) {
        // If prev is not an array, create a new array with the current and new value
        return [{ ...value, key: 0 }];
      }

      // If prev is an array, create a new array with the previous elements and the new value
      // return [...prev, value];
      const maxKey = Math.max(...prev.map(item => item.key), 0);
      // console.log(maxKey, 'maxKey');
      return [...prev, { ...value, key: maxKey + 1 }];
    });


  }

  const SetDynamicEditTable = (value) => {
// console.log(value,'value');
    setDynamicTableData((prev) => {

      if (!Array.isArray(prev)) {
        // If prev is not an array, create a new array with the current and new value
        return [{ ...value, key: 0 }];
      }

      const rowIndexToUpdate = dynamicTableData.findIndex((item) => item.key === value.key);


      if (rowIndexToUpdate !== -1) {
        // Create a copy of the previous array
        const updatedDynamicTable = [...prev];

        // Update the values for the row at the specified index
        updatedDynamicTable[rowIndexToUpdate] = { ...value };

        return updatedDynamicTable;
      }


      // Find the index of the row to update based on the key

      // If the row doesn't exist, simply add it to the end of the array
      const maxKey = Math.max(...prev.map((item) => item.key), 0);
      return [...prev, { ...value, key: maxKey + 1 }];
    });
    // }
  };
// console.log(dynamicTableData,'dynamicTableData');
  const RowRemove = (rowKey) => {
    const newArr = dynamicTableData?.filter(item => item.key !== rowKey);
    setDynamicTableData(newArr);

  }

  const onChangeRadio = (e) => {
    setRadioBtncheck(e.target.value)

    if(e.target.value === 'NEW'){
      form.resetFields(['member_balance_amt'])

    }
    if(e.target.value === 'EXCISTING'){
      form.resetFields(['member_joining_amt'])
    }


  }

  const AddFamily = async (data) => {
    setIsloading(true)
    await request.post(`${APIURLS.POST_ADD_FAMILY}`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: 'Family Details Added Successfully ! ',
          type: 'success',
        })
        dispatch(getFamilyGroupDetails())
        dispatch(getFamilyDetails())
        form.resetFields()
        setDynamicTableData([])
        setIsloading(false)
        setRadioBtncheck('')
        if(response.status === 203){
          setIsloading(false)
          toast.warn(response.data.Message)
        }
        return response.data;

      })
      .catch(function (error) {
        setIsloading(false)
        if (error.response.status == 401) {
          toast.error(error.response.data?.Message)
        }   if (error.response.status === 400) {
          if (error?.response?.data?.family) {
              const familyArray = error?.response?.data?.family;
              let secondFamilyMember = null;
      
              for (let i = 0; i < familyArray.length; i++) {
                  if (familyArray[i].hasOwnProperty("member_dob") || 
                      familyArray[i].hasOwnProperty("non_field_errors") ||
                      familyArray[i].hasOwnProperty("member_joining_amt") || 
                      familyArray[i].hasOwnProperty("member_mobile_number")) {
                      secondFamilyMember = familyArray[i];
                      break;
                  }
              }
              if (secondFamilyMember) {
                  if (secondFamilyMember.member_dob && secondFamilyMember.member_dob.length > 0) {
                      toast.error(secondFamilyMember.member_dob[0]);
                  } else if (secondFamilyMember.non_field_errors && secondFamilyMember.non_field_errors.length > 0) {
                      toast.error(secondFamilyMember.non_field_errors[0]);
                  } else if (secondFamilyMember.member_joining_amt && secondFamilyMember.member_joining_amt.length > 0) {
                      toast.error(secondFamilyMember.member_joining_amt[0]);
                  } else if (secondFamilyMember.member_mobile_number && secondFamilyMember.member_mobile_number.length > 0) {
                      toast.error(secondFamilyMember.member_mobile_number[0]);
                  } else {
                      toast.error("Unknown error occurred");
                  }
              }
              else{
                toast.error(familyArray[0]);
              }
          }
      }

        else if(error.response.status === 302){
          toast.error(error.response.data.Message);
        }
        else if(error.response.status === 406){
          toast.error(error.response.data.message);
        }
        else {
          errorHandler(error);
        }
        // return errorHandler({error?response.data?.family[0]?.member_email});

      })
  }

  const UpdateFamily = async (data) => {
    setIsloading(true)
    await request.put(`${APIURLS.PUT_PATCH_FAMILY_GROUP}${familyrecord?.id}/`, data)
      .then(function (response) {
        if (response.status === 201) {
          successHandler(response, {
            notifyOnSuccess: true,
            notifyOnFailed: true,
            msg: 'Family Details Updated Successfully ! ',
            type: 'info',
          })
          dispatch(getFamilyGroupDetails())
          CloseFormm()
          form.resetFields()
          setDynamicTableData([])
          setIsloading(false)
        }
        if(response.status === 203){
          setIsloading(false)
          toast.warn(response.data.Message)
        }
        return response.data;
      })
      .catch(function (error) {
        setIsloading(false)
        if(error.response.status === 302){
          toast.error(error.response.data.Message);
        }
        if (error.response.status === 400) {
          if (error?.response?.data?.family) {
              const familyArray = error?.response?.data?.family;
              let secondFamilyMember = null;
              for (let i = 0; i < familyArray.length; i++) {
                  if (familyArray[i].hasOwnProperty("member_dob") || 
                      familyArray[i].hasOwnProperty("non_field_errors") ||
                      familyArray[i].hasOwnProperty("member_joining_amt") || 
                      familyArray[i].hasOwnProperty("member_mobile_number")) {
                      secondFamilyMember = familyArray[i];
                      break;
                  }
              }
              if (secondFamilyMember) {
                  if (secondFamilyMember.member_dob && secondFamilyMember.member_dob.length > 0) {
                      toast.error(secondFamilyMember.member_dob[0]);
                  } else if (secondFamilyMember.non_field_errors && secondFamilyMember.non_field_errors.length > 0) {
                      toast.error(secondFamilyMember.non_field_errors[0]);
                  } else if (secondFamilyMember.member_joining_amt && secondFamilyMember.member_joining_amt.length > 0) {
                      toast.error(secondFamilyMember.member_joining_amt[0]);
                  } else if (secondFamilyMember.member_mobile_number && secondFamilyMember.member_mobile_number.length > 0) {
                      toast.error(secondFamilyMember.member_mobile_number[0]);
                  }
                   else {
                      toast.error("Unknown error occurred");
                  }
              }
              else{
                toast.error(familyArray[0]);
              }
          }
      }
        else{
          errorHandler(error);
         
        }
      })
  }
  
  const onFinish = (data) => {
    if (familyrecord) {
      const FamDetails = { ...data, member_detail: dynamicTableData }
      const formData = new FormData();
      formData.append('head_member_type', FamDetails?.head_member_type);
      formData.append('ancestor', FamDetails?.ancestor || null);
      formData.append('head_native_type', FamDetails?.head_native_type);
      formData.append(`years_of_living`, FamDetails.years_of_living || null);
      formData.append(`address`, FamDetails.address);
      formData.append(`field_count`, FamDetails?.member_detail.length)

      FamDetails?.member_detail.forEach((element, index) => {
        formData.append(`family[${index + 1}][member_name]`, element?.member_name || null)
        formData.append(`family[${index + 1}][member_relation_ship]`, element?.member_relation_ship || null)
        formData.append(`family[${index + 1}][member_mobile_number]`, element?.member_mobile_number || null)
        formData.append(`family[${index + 1}][member_email]`, element?.member_email || null)
        formData.append(`family[${index + 1}][member_joining_amt]`, element?.member_joining_amt || 0)
        formData.append(`family[${index + 1}][member_balance_amt]`, element?.member_balance_amt || 0)
        formData.append(`family[${index + 1}][member_dob]`, element?.member_dob || null)
        formData.append(`family[${index + 1}][id]`, element?.id || null)

        formData.append(`family[${index + 1}][death]`, element?.death)
        formData.append(`family[${index + 1}][death_date]`, element?.death_date || null)

    //     if (element?.image_send_value && element?.image_send_value.length > 0) {
    //       if(element?.member_photo === ""){
    //         console.log('dontsend');
    //       }else{
    //         formData.append(`family[${index + 1}][member_photo]`, element.image_send_value[0].originFileObj);
    //       }
    //     }
        
     
    //   else if
    //   (element?.image_send_value && element?.image_send_value.length === 0) {
 
    //       formData.append(`family[${index + 1}][photo_status]`, "false");

          
    // }
  
    if (element?.member_photo?.length === 0) {
      formData.append(`family[${index + 1}][photo_status]`, "false");
    } else if (element?.image_send_value && element?.image_send_value.length > 0) {
      formData.append(`family[${index + 1}][member_photo]`, element.image_send_value[0].originFileObj);
    }
    
        else {
          console.log('No Pic Selected');
        }
        if (element.member_detail) {
          formData.append("field_count", element.member_detail.length);
        }
        else {
          console.log('check');
        }

        console.log([...formData.entries()], 'updateFamily');
      })
      UpdateFamily(formData)
    }
    else {
      const FamDetails = { ...data, member_detail: dynamicTableData }

      const formData = new FormData();
      formData.append('head_member_type', FamDetails?.head_member_type);
      formData.append('ancestor', FamDetails?.ancestor || null);
      formData.append('head_native_type', FamDetails?.head_native_type);
      formData.append(`years_of_living`, FamDetails.years_of_living || null);
      formData.append(`address`, FamDetails.address);
      formData.append(`field_count`, FamDetails?.member_detail.length)

      FamDetails?.member_detail.forEach((element, index) => {
        formData.append(`family[${index + 1}][member_name]`, element?.member_name || null)
        formData.append(`family[${index + 1}][member_relation_ship]`, element?.member_relation_ship || null)
        formData.append(`family[${index + 1}][member_mobile_number]`, element?.member_mobile_number || null)
        formData.append(`family[${index + 1}][member_email]`, element?.member_email || null)
        formData.append(`family[${index + 1}][member_joining_amt]`, element?.member_joining_amt || 0)
        formData.append(`family[${index + 1}][member_balance_amt]`, element?.member_balance_amt || 0)
        formData.append(`family[${index + 1}][member_dob]`, element?.member_dob || null)
        formData.append(`family[${index + 1}][id]`, element?.id || null)
        // if(element?.image_send_value[0]?.originFileObj){
        //   formData.append(`family[${index + 1}][member_photo]`, element?.image_send_value[0]?.originFileObj || [])
        // }
        // else{
        //   console.log('member photo no send');
        // }
        if (element?.member_photo && element.member_photo.length > 0) {
          // element.member_photo.forEach((file) => {
            formData.append(`family[${index + 1}][member_photo]`, element?.image_send_value[0]?.originFileObj);
        
        } else {
          console.error("No images selected");
        }
        formData.append(`family[${index + 1}][death]`, element?.death)
        formData.append(`family[${index + 1}][death_date]`, element?.death_date || null)

        // console.log([...formData.entries()], 'addddddddddd');
      })

      AddFamily(formData)
    }

  };

  const onFinishFailed = (errorInfo) => {
    toast.warn("Please fill in all the required details !");
  };

  const onSubmit = () => {
    form.submit();
  }

  return (
    <Fragment>
      <CustomCardView>
        <Form
          name='AddFamilyForm'
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

          <CustomRow space={[12, 12]}>
            <Col span={24} md={24}>
              {familyrecord ? <CustomPageTitle Heading={'Update Details'} /> :
                <CustomPageTitle Heading={'Family Details'} />}
            </Col>
            <Col span={24} md={24}>
              <Flex flexend={'right'}>
                <CustomRadioButton data={RadioOptions} onChange={onChangeRadio} name={'head_member_type'}
                  rules={[
                    {
                      required: true,
                      message: "Please choose either 'existing' or 'new'!",
                    }
                  ]}
                />
              </Flex>
            </Col>
            <Col span={24} md={12}>
              <CustomSelect label={'Link Ancestor'} name={'ancestor_detail'} placeholder={'Select Ancestor'}
                options={AncestorsOptions} onChange={handleAnces} 
                // rules={[
                //   {
                //     required: true,
                //     message: 'Required !',
                //   }
                // ]} 
                />
              <CustomInput name={'ancestor'} display={'none'} />
            </Col>
            <Col span={24} md={12}>
              <CustomSelect label={'Native Type'} name={'head_native_type'} options={nativeoptions}
                rules={[
                  {
                    required: true,
                    message: 'Please Enter Native Type !',
                  }
                ]}
              />
            </Col>
            <Col span={24} md={12}>
              <CustomInputNumber label={'Years of Living'} name={'years_of_living'}
                // rules={[
                //   {
                //     required: true,
                //     message: 'Please Enter Years of Living !',
                //   }
                // ]}
              />
            </Col>
            <Col span={24} md={12}>
              <CustomTextArea label={'Address'} name={'address'}
                rules={[
                  {
                    required: true,
                    message: 'Please Enter Address !',
                  }
                ]}
              />
            </Col>
          </CustomRow>
        </Form>

        <AddMemberDetails familyrecord={familyrecord} SetDynamicTable={SetDynamicTable} updatetriggermember={updatetrigger} radioBtncheck={radioBtncheck} setRadioBtncheck={setRadioBtncheck}/>

        <Col span={24} md={24}>
          <CustomTable columns={MemberTableColumn} data={dynamicTableData} />
        </Col>
        {isloading ?
          <Flex center gap={'20px'} style={{ margin: '30px' }}><Spin /></Flex> :
          <Flex center gap={'20px'} style={{ margin: '30px' }}>
            {familyrecord ? <Button.Danger text={'Update'} onClick={onSubmit} /> : <Button.Danger text={'Submit'} onClick={onSubmit} />}
            {familyrecord ? <Button.Success text={'Cancel'} onClick={CloseFormm} /> : <Button.Success text={'Reset'} onClick={onReset} />}

          </Flex>
        }
      </CustomCardView>
      <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={modelwith} modalTitle={modalTitle} modalContent={modalContent} />
    </Fragment>
  )
}
