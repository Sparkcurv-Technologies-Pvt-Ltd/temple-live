import {
  CustomInput,
  CustomInputNumber,
  CustomRadioButton,
  CustomSelect,
  CustomTextArea,
} from "@components/form";
import { CustomRow } from "@components/others";
import { Col, Form } from "antd";
import React, { useEffect, useState } from "react";
import { StyledAdd } from "../../style";
import {
  getMembersDetails,
} from "@modules/FamilyDetails/FamilySlice";
import { useDispatch } from "react-redux";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";
import { CustomPageFormTitle2 } from "@components/others/CustomPageTitle";
import { toast } from "react-toastify";

export const FundAddTable = ({
  trigger,
  SetDynamicTable,
  EditNomineeRecord,
  FormExternalClose,
  SetDynamicEditTable,
  fixedCountData,
  dynamicTableData,
  fixedCount,

}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [nomineeRadio, setNomineeRadio] = useState([]);
  const [nomineePersonType, setNomineePersonType] = useState([]);
  const [personType, setPersonType] = useState(null);
  const [member, setMember] = useState([])  // use  member
  const [nomineeMember, setNomineeMember] = useState([])  // use nominee member
  const [addedMemberIds, setAddedMemberIds] = useState([]);


  useEffect(() => {
    form.resetFields();
  }, [trigger]);

  useEffect(() => {
    dispatch(getMembersDetails());
  }, []);

  useEffect(() => {
    if (EditNomineeRecord) {
      setNominee();
    }
  }, [EditNomineeRecord, trigger]);

  const setNominee = () => {
    form.setFieldsValue(EditNomineeRecord);
    setPersonType(EditNomineeRecord?.person_type);
    setNomineeRadio(EditNomineeRecord?.nominee_apply)
    setNomineePersonType(EditNomineeRecord?.nominee_person_type)
  };

  useEffect(() => {
    GetMembers()
    GetNomineeMembers()
  }, [])

  const GetMembers = async (data) => {
    await request
      .get(APIURLS.GET_AUTHORITY_MEMBER, data)
      .then(function (response) {
        setMember(response.data);
        return response.data;
      })
      .catch(function (error) {
      });
  };
  const GetNomineeMembers = async (data) => {
    await request
      .get(APIURLS.GET_FUND_NOMINEE_MEMBER, data)
      .then(function (response) {
        setNomineeMember(response.data);
        return response.data;
      })
      .catch(function (error) {
      });
  };


  const FamOptions = member?.map((item) => ({
    label: item?.member_name,
    value: item?.member_id,
  }));

  const NomineeMemberOptions = nomineeMember?.map((item) => ({
    label: item?.member_name,
    value: item?.member2_id,
  }));

  const handleMember = (value) => {
    const AllMemberOptions = member?.find(
      (item) => item?.member_id === value
    );
    form.setFieldsValue({
      member_name: AllMemberOptions?.member_name,
      fund_member: AllMemberOptions?.member_id,
      member_no: AllMemberOptions?.member_no,
      address: AllMemberOptions?.address,
      mobile_no: AllMemberOptions?.member_mobile_number,
      email: AllMemberOptions?.member_email,
    });

  };

  const handleNomineeName = (value) => {
    const AllNomineeOptions = nomineeMember?.find(
      (item) => item?.member2_id === value
    );
    form.setFieldsValue({
      nominee_member_name: AllNomineeOptions?.member_name,
      nominee_member: AllNomineeOptions?.member2_id,
      nominee_member_no: AllNomineeOptions?.member_no,
      nominee_address: AllNomineeOptions?.address,
      nominee_mobile_no: AllNomineeOptions?.member_mobile_number,
    });
  };

  const PersonTypeOptions = [
    {
      title: "Member",
      value: "Member",
    },
    {
      title: "Others",
      value: "Other",
    },
  ];

  const handlePersonType = (e) => {
    setPersonType(e);
    form.resetFields(['member_id', 'member_name', 'member_no', 'mobile_no', 'email', 'address']);
  };

  const NomineeRadioOptions = [
    {
      label: "Yes",
      value: true,
    },
    {
      label: "No",
      value: false,
    },
  ];

  const nomineepersonoption = [
    {
      label: "Member",
      value: "Member",
    },
    {
      label: "Others",
      value: "Other",
    },
  ];
  //----------- Nominee Fn ----------------

  const handleNominee = (e) => {
    setNomineeRadio(e.target.value);
    if (nomineeRadio === "No") {
      setNomineePersonType([]);
    }
  };
  //----------- Nominee Type Fn ----------------
  const handleNomineePersonType = (e) => {
    setNomineePersonType(e);
  };
  const onFinish = (data) => {

    if (fixedCountData?.fund_type === "Fund 21") {
      if (dynamicTableData?.length >= 20) {
        toast.warn("The Number of Person must be not greater than  20!");
        return;
      }
    }
    if (fixedCountData?.fund_type === "Fund 20") {

      if (dynamicTableData?.length >= 19) {
        toast.warn("The Number of Person must be not greater than 19!");
        return;
      }
    }
    if (fixedCountData?.fund_type === "Normal") {
      if (dynamicTableData?.length >= fixedCount) {
        toast.warn("The Number of Person must be not greater than  fixed fund count!");
        return;
      }
    }
    if (EditNomineeRecord) {
      if (data?.mobile_no && /^[6-9]\d{9}$/.test(data.mobile_no)) {
        SetDynamicEditTable(data);
        FormExternalClose()
      }
      else {
        toast.info("Please Recheck the Mob Number, you have entered ")
      }
    } else {
      if (data?.mobile_no && /^[6-9]\d{9}$/.test(data.mobile_no)) {
        SetDynamicTable(data)
        form.resetFields();
      }
      else {
        toast.info("Please Recheck the Mob Number, you have entered ")

      }
    }

    setAddedMemberIds([...addedMemberIds, data?.member_id, data?.member2_id]);
  };
  const onFinishFailed = (errorInfo) => {
    toast.warn("Please fill in all the required details !");
  };

  const onSubmit = () => {
    form.submit();
  };

  return (
    <Form
      name="FundTable"
      form={form}
      labelCol={{
        span: 24,
      }}
      wrapperCol={{
        span: 24,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <CustomRow space={[24, 24]}>
        <Col span={24} md={24}>
          <CustomPageFormTitle2 Heading={"Member"} />
        </Col>
        <Col span={24} md={12}>
          <CustomSelect
            label={"Person Type"}
            name={"person_type"}
            options={PersonTypeOptions}
            onChange={handlePersonType}
            rules={[
              {
                required: true,
                message: "Please Select Person Type !",
              },
            ]}
          />
          <CustomInput name={'key'} display={'none'} />
        </Col>

        {personType && personType === "Member" ? (
          <>
            <Col span={24} md={8}>
              <CustomSelect
                label={"Add Member"}
                name={"member_id"}
                placeholder={"Choose"}
                options={FamOptions}
                onChange={handleMember}
                rules={[
                  {
                    required: true,
                    message: "Please Select Member!",
                  },
                ]}
              />
              <CustomInput name={'member_name'} display={'none'} />
              <CustomInput name={"fund_member"} display={'none'} />
            </Col>
            <Col span={24} md={4}>
              <CustomInput
                label={"Member No"}
                name={"member_no"}
                maxLength={10}
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                placeholder={"Member No"}
                disabled={true}
              />
            </Col>
            <Col span={24} md={12}>
              <CustomInputNumber
                label={"Mobile Number"}
                name={"mobile_no"}
                maxLength={10}
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                rules={[
                  {
                    required: true,
                    message: "Please Enter Mobile Number !",
                  },
                ]}
              />
            </Col>

            <Col span={24} md={12}>
              <CustomInput
                label={"Email"}
                name={"email"}
                type={"email"}
              // rules={[
              //   {
              //     required: true,
              //     message: "Please Enter Email !",
              //   },
              // ]}
              />
            </Col>

            <Col span={24} md={12}>
              <CustomTextArea
                label={"Address"}
                name={"address"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter Address !",
                  },
                ]}
              />
            </Col>
          </>
        ) : null}

        {personType && personType === "Other" ? (
          <>
            <Col span={24} md={12}>
              <CustomInput
                label={"Name"}
                name={"member_name"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter Name !",
                  },
                ]}
              />
            </Col>

            {/* <Col span={24} md={12}>
              <CustomInputNumber
                label={"Member Fund Count"}
                name={"member_fund_count"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter Member Fund Count !",
                  },
                ]}
              />
            </Col> */}

            <Col span={24} md={12}>
              <CustomInputNumber
                label={"Mobile Number"}
                name={"mobile_no"}
                maxLength={10}
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                rules={[
                  {
                    required: true,
                    message: "Please Enter Mobile Number !",
                  },
                ]}
              />
            </Col>

            <Col span={24} md={12}>
              <CustomInput
                label={"Email"}
                name={"email"}
                type={"email"}
              // rules={[
              //   {
              //     required: true,
              //     message: "Please Enter Email !",
              //   },
              // ]}
              />
            </Col>

            <Col span={24} md={12}>
              <CustomTextArea
                label={"Address"}
                name={"address"}
                rules={[
                  {
                    required: true,
                    message: "Please Enter Address !",
                  },
                ]}
              />
            </Col>
          </>
        ) : null}

        <Col span={24} md={12}>
          <CustomRadioButton
            label={"Nominee"}
            name={"nominee_apply"}
            data={NomineeRadioOptions}
            onChange={handleNominee}
            rules={[
              {
                required: true,
                message: "Please Choose Anyone !",
              },
            ]}
          />
        </Col>

        {nomineeRadio === true ? (
          <>
            <Col span={24} md={12}>
              <CustomSelect
                label={"Nominee Person Type"}
                name={"nominee_person_type"}
                placeholder={"Choose"}
                options={nomineepersonoption}
                onChange={handleNomineePersonType}
                rules={[
                  {
                    required: true,
                    message: "Please Enter Person Type !",
                  },
                ]}
              />
            </Col>
            {nomineePersonType === "Member" ? (
              <>
                <Col span={24} md={8}>
                  <CustomSelect
                    label={"Nominee Person"}
                    name={"member2_id"}
                    options={NomineeMemberOptions}
                    onChange={handleNomineeName}
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Person Type !",
                      },
                    ]}
                  />
                  <CustomInput name={'nominee_member_name'} display={'none'} />
                  <CustomInput name={"nominee_member"} display={'none'} />
                </Col>
                <Col span={24} md={4}>
                  <CustomInput
                    label={"Member No"}
                    name={"nominee_member_no"}
                    placeholder={"Member No"}
                    disabled={true}
                  />
                </Col>

                <Col span={24} md={12}>
                  <CustomInputNumber
                    label={"Mobile Number"}
                    name={"nominee_mobile_no"}
                    maxLength={10}
                    onKeyPress={(event) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Mobile Number !",
                      },
                    ]}
                  />
                </Col>

                <Col span={24} md={12}>
                  <CustomInputNumber
                    label={"Cheque No (Optional)"}
                    name={"cheque_no"}
                  />
                </Col>

                <Col span={24} md={12}>
                  <CustomTextArea
                    label={"Address"}
                    name={"nominee_address"}
                    //  disabled={true}
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Address !",
                      },
                    ]}
                  />
                </Col>
              </>
            ) : null}
            {nomineePersonType === "Other" ? (
              <>
                <Col span={24} md={12}>
                  <CustomInput
                    label={"Nominee Person"}
                    name={"nominee_member_name"}
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Nominee Person !",
                      },
                    ]}
                  />
                </Col>

                <Col span={24} md={12}>
                  <CustomInputNumber
                    label={"Mobile Number"}
                    name={"nominee_mobile_no"}
                    maxLength={10}
                    onKeyPress={(event) => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Mobile Number !",
                      },
                    ]}
                  />
                </Col>

                <Col span={24} md={12}>
                  <CustomInputNumber
                    label={"Cheque No (Optional)"}
                    name={"cheque_no"}
                  />
                </Col>

                <Col span={24} md={12}>
                  <CustomTextArea
                    label={"Address"}
                    name={"nominee_address"}
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Address !",
                      },
                    ]}
                  />
                </Col>
              </>
            ) : null}
          </>
        ) : null}

        <Col span={24} md={24}>
          {EditNomineeRecord ? (
            <StyledAdd onClick={onSubmit} style={{ cursor: 'pointer' }}>
              <h3>Update</h3>{" "}
            </StyledAdd>
            // <Button.Danger text={"Update"} htmlType={"submit"} />
          ) : (
            <StyledAdd onClick={onSubmit} style={{ cursor: 'pointer' }}>
              <h3>Add</h3>{" "}
            </StyledAdd>
          )}
        </Col>
      </CustomRow>
    </Form>
  );
};
