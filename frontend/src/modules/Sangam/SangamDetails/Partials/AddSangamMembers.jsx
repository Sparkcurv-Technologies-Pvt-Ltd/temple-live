import { Button, CustomInput, CustomSelect } from "@components/form";
import { CustomCardView, CustomRow } from "@components/others";
import { CustomPageFormTitle } from "@components/others/CustomPageTitle";
import {
  getMembersDetails,
  selectMemberDetails,
} from "@modules/FamilyDetails/FamilySlice";
import { StyledAdd } from "@modules/Fund/style";
import { Col, Form } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getSangamAddMembers, SelectAddMembers } from "../SangamSlice";

export const AddSangamMembers = ({ trigger, SetDynamicTable }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [memberId, setMemberId] = useState();

  useEffect(() => {
    form.resetFields();
  }, [trigger]);

  useEffect(() => {
    dispatch(getSangamAddMembers());
  }, []);

  const AllFamilyMember = useSelector(SelectAddMembers);

  const memberoptions = AllFamilyMember?.map((item) => ({
    label: item?.member?.member_name,
    value: item?.member?.id,
  }));

  const handleChange = (value) => {
    const AllMemberDetails = AllFamilyMember.find(
      (mem) => mem?.member?.id === value
    );
    setMemberId(AllMemberDetails);
  };

  useEffect(() => {
    form.setFieldsValue({
      member_name: memberId?.member?.member_name,
      member_no: memberId?.member?.member_no,
    });
  }, [memberId]);

  const onFinish = (data) => {
    SetDynamicTable(data)
    form.resetFields()
  };

  const onFinishFailed = (errorInfo) => {
    toast.warn("Please fill in all the required details !");
  };

  const onSubmit = () => {
    form.submit();
  }

  return (
    <Form
      name="AddMemberForm"
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
      <CustomRow space={[12, 12]}>
        <Col span={24} md={24}>
          <CustomPageFormTitle Heading={"Add Sangam Member"} />
        </Col>

        <Col span={24} md={12}>
          <CustomSelect
            placeholder={"Choose Member"}
            name={"member"}
            options={memberoptions || []}
            onChange={handleChange}
            rules={[
              {
                required: true,
                message: "Please Select Member Name !",
              },
            ]}
          />
          <CustomInput name={"member_name"} display={'none'} />
          <CustomInput name={"member_no"} display={'none'} />
        </Col>
        <Col span={24} md={24}>
          <StyledAdd text={'Add'} onClick={onSubmit} style={{cursor:'pointer'}}><h3>Add</h3> </StyledAdd>
          {/* <Button.Success text={'Add'} onClick={onSubmit} /> */}
        </Col>
      </CustomRow>
    </Form>
  );
};
