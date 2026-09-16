import { Button, CustomAddSelect, CustomInput, CustomInputNumber, CustomInputPassword, CustomSelect, CustomTextArea } from '@components/form'
import { CustomCardView, CustomModal, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Form } from 'antd'
import React, { useEffect, useState } from 'react'
import { FaLock } from 'react-icons/fa'
import { BsFillPersonFill } from 'react-icons/bs'
import { RiMailFill } from 'react-icons/ri'
import { IoLocationOutline } from 'react-icons/io5'
import { FaPhone } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux'
import { getMembersDetails, selectMemberDetails } from '@modules/FamilyDetails/FamilySlice'
import { GetUser, getRole, selectRoleDetails } from '../UserSlice'
import request from '@request/request'
import { APIURLS } from '@request/apiUrls/urls'
import successHandler from '@request/successHandler'
import errorHandler from '@request/errorHandler'
import { toast } from 'react-toastify'
import AddUserPermission from './AddUserPermission'

const AddUsers = ({ closee, updateUserList, Usertrigger }) => {

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [trigger, setTrigger] = useState(0);
  const [roleTrigger, setRoleTrigger] = useState(0);
  const [userType, setUserType] = useState([]);
  const [selectedRole, setSelectedRole] = useState([]);
  const [selectedMember, setSelectedMember] = useState([]);

  // ======  Modal Open ========
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ======  Modal Title and Content ========
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState(null);

  // ----------  Form Reset UseState ---------
  const [modelwith, setModelwith] = useState(0);


  const UserTypeOptions = [
    {
      label: 'Member',
      value: 'Member'
    },
    {
      label: 'Other',
      value: 'Other'
    }
  ]

  const genderoptions = [
    {
      label: 'Male',
      value: 'Male'
    },
    {
      label: 'Female',
      value: 'Female'
    },
  ]

  useEffect(() => {
    form.resetFields()
  }, [trigger])

  useEffect(() => {
    dispatch(getRole())
  }, [])

  useEffect(() => {
    dispatch(getMembersDetails())
  }, [])

  const AllRoleDetails = useSelector(selectRoleDetails);
  const AllMemberDetails = useSelector(selectMemberDetails);

  const RoleOptions = AllRoleDetails?.map((role) => ({ label: role?.Role_name, value: role?.id }))
  const MemberOptions = AllMemberDetails?.map((mem) => ({ label: mem?.member_name, value: mem?.id }))

//--------- Role name ----------------------------

  const handleRole = (value) => {
    const selectedRoleName = AllRoleDetails?.find((roleval) => roleval?.id === value)
    setSelectedRole(selectedRoleName)
    setRoleTrigger(roleTrigger + 1)
  }
//------------ Handle member ----------------------

  const handleMember = (mem) => {
    const selectedMemberName = AllMemberDetails?.find((memval) => memval?.id === mem)
    setSelectedMember(selectedMemberName?.member?.member_no)
  }
//------------------

  useEffect(() => {
    form.setFieldsValue({ role_name: selectedRole?.Role_name })
    form.setFieldsValue({ my_role: selectedRole?.id })

  }, [selectedRole])

  useEffect(() => {
    form.setFieldsValue({ member_no: selectedMember })
  }, [selectedMember])

  // update

  useEffect(() => {
    if (updateUserList) {
      setupdateUserList()
    }     
  }, [updateUserList, Usertrigger])


  const setupdateUserList = () => {
    form.setFieldsValue(updateUserList)
    form.setFieldsValue({ my_role: updateUserList?.my_role })
    form.setFieldsValue({ my_role: updateUserList?.my_role })
    setUserType(updateUserList?.user_native_type)
  }

  // ===== Modal Functions Start =====

  const showModal = () => {
    setIsModalOpen(true);
  };

  const ResetTrigger = () => {
    setTrigger(trigger + 1)
  }
  const handleOk = () => {
    setIsModalOpen(false);
    ResetTrigger()
  };

  const CloseForm = () => {
    handleOk()
  }

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleUserType = (e) => {
    setUserType(e)
  }

  const ChooseRole = () => {
    setModelwith(800)
    setTrigger(trigger + 1)
    setModalTitle("Choose Role");
    setModalContent(<AddUserPermission key={trigger} triggerr={trigger} FormClose={CloseForm} />);
    showModal();
  }

  const onReset = () => {
    form.resetFields()
  }

  const AddUsers = async (data) => {
    await request.post(`${APIURLS.POST_USER}`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: 'User Details Added Successfully',
          type: 'success',
        })
        form.resetFields()
        return response.data;
      })
      .catch(function (error) {
        if(error.response.status === 406){
          toast.error(error.response.data.message);
        }
        else if(error.response.status === 400){
          toast.error(error.response.data?.email[0]);
        }
        else{
          return errorHandler(error);
        }
      })
  }

  const updatuserList = async (data) => {
    await request
      .patch(`${APIURLS.PUT_USER}${updateUserList?.id}`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "User Details Updated Successfully",
          type: "info",
        });
        form.resetFields();
        closee();
        dispatch(GetUser());

        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 400){
          toast.warn(error.response.data.mobile_number[0])
        }
        else if(error.response.status === 400){
          toast.error(error.response.data?.email[0]);
        }
      });
  };

  const onFinish = (data) => {

    let Record = {
      user_native_type: data?.user_native_type,
      role_name: data?.role_name,
      my_role:data?.my_role,
      othersname: data?.othersname,
      email: data?.email,
      mobile_number: data?.mobile_number,
      gender: data?.gender,
      address: data?.address,
      name: data?.name,
      password: data?.password,
      member_no:data?.member_no,
      person_email:data?.person_email,
      member: data?.member,
    }
    let memberRecord = {
      role_name: data?.role_name,
      user_native_type: data?.user_native_type,
      email: data?.email,
      password: data?.password,
      member: data?.member,
      member_no:data?.member_no,
      name: data?.name,
      my_role:data?.my_role,
    }
    if (updateUserList || updateUserList?.memberRecord) {
      updatuserList(Record);

    } else if (userType === 'Member') {
      AddUsers(memberRecord);
    }
    else {
      AddUsers(Record);
    }

  }
  const onFinishFailed = () => {
    toast.warn("Please fill in all the required details !");
  }

  return (
    <Form
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      name='addusers'
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}>
      <CustomCardView>
        <CustomRow space={[12, 12]} >
          {updateUserList ? null : (
            <Col span={24} md={24}>
              <CustomPageTitle Heading={'Create User'} />
            </Col>

          )}
          <Col span={24} md={12} >
            <CustomSelect label={'User Type'} name={'user_native_type'} options={UserTypeOptions} placeholder={'Select'} onChange={handleUserType}
              rules={[
                {
                  required: true,
                  message: 'Please Select User Type !',
                }
              ]}
            />
          </Col>
          <Col span={24} md={12} >
            {updateUserList ? (
              <>
                <CustomSelect label={'Choose Role'} name={'role_name'} options={RoleOptions} onChange={handleRole}
                  rules={[
                    {
                      required: true,
                      message: 'Please Select Role !',
                    }
                  ]}
                />
                <CustomInput name={'my_role'} display={'none'} />
              </>
            ) : (
              <>
                <CustomAddSelect label={'Choose Role'} name={'role_name'} options={RoleOptions} onButtonClick={ChooseRole} onChange={handleRole}
                  rules={[
                    {
                      required: true,
                      message: 'Please Select Role !',
                    }
                  ]}
                />
                <CustomInput name={'my_role'} display={'none'}   />
              </>
            )}

          </Col>
          {
            userType === 'Member' ? (<>
              <Col span={24} md={12} >
                <CustomSelect label={'Choose Member'} name={'member'} options={MemberOptions} onChange={handleMember}
                  rules={[
                    {
                      required: true,
                      message: 'Please Select User Type !',
                    }
                  ]}
                />
                <CustomInput name={'member_no'}  display={'none'}  />
              </Col>
              <Col span={24} md={12}></Col>
            </>) : null
          }
          {
            userType === 'Other' ? (<>
              <Col span={24} md={8} >
                <CustomInput label={'Name'} name={'othersname'} suffix={<BsFillPersonFill />}
                  rules={[
                    {
                      required: true,
                      message: 'Please Enter Name !',
                    }
                  ]}
                />
              </Col>
              <Col span={24} md={8} >
                <CustomInput label={'Email ID'} name={'person_email'} type={'email'} suffix={<RiMailFill />}
                  rules={[
                    {
                      required: true,
                      message: 'Please Enter Email ID !',
                    }
                  ]}
                />
              </Col>
              <Col span={24} md={8} >
                <CustomInputNumber label={'Mobile Number'} name={'mobile_number'} suffix={<FaPhone />}
                  maxLength={10}
                  minLength={10}
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                  rules={[
                    {
                      required: true,
                      message: 'Please Enter Mobile Number !',
                    }
                  ]}
                />
              </Col>
              <Col span={24} md={8} >
                <CustomSelect label={'Gender'} name={'gender'} options={genderoptions}
                  rules={[
                    {
                      required: true,
                      message: 'Please Enter Gender !',
                    }
                  ]}
                />
              </Col>
              <Col span={24} md={8} >
                <CustomTextArea label={'Address'} name={'address'} suffix={<IoLocationOutline />}
                  rules={[
                    {
                      required: true,
                      message: 'Please Enter Address !',
                    }
                  ]}
                />
              </Col>
              <Col span={24} md={8}>
              </Col>
            </>) : null
          }

          <Col span={24} md={24}>
            <p style={{ color: 'red' }}>Credentials :</p>
          </Col>

          <Col span={24} md={8} >
            <CustomInput label={'User Name'} name={'name'} suffix={<BsFillPersonFill />}
              rules={[
                {
                  required: true,
                  message: 'Please Enter User Name !',
                }
              ]}
            />
          </Col>
          <Col span={24} md={8} >
            <CustomInput label={'Login Email ID'} name={'email'} type={'email'} suffix={<RiMailFill />}
              rules={[
                {
                  required: true,
                  message: 'Please Enter Login Email ID !',
                }
              ]}
            />
          </Col>
          <Col span={24} md={8} >
            <CustomInputPassword label={'Password'} name={'password'} suffix={<FaLock />}
              // rules={[
              //   {
              //     required: true,
              //     message: 'Please Enter Password !',
              //   }
              // ]}
            />
          </Col>
        </CustomRow>
        <Flex center={'true'} gap={'20px'} style={{ marginTop: '20px' }}>

          {updateUserList ? (
            <>
              <Button.Success text={"Update"} htmlType={"submit"} />
              <Button.Danger text={"Cancel"} onClick={() => closee()} />
            </>
          ) : (
            <>
              <Button.Danger text={"Submit"} htmlType={"submit"} />
              <Button.Success text={"Reset"} onClick={() => onReset()} />
            </>
          )}

          {/* <Button.Danger text={'Submit'} htmlType={'submit'} />
          <Button.Success text={'Cancel'} onClick={onReset} /> */}
        </Flex>
      </CustomCardView>
      <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={modelwith} modalTitle={modalTitle} modalContent={modalContent} />
    </Form >
  )
}

export default AddUsers