import React from "react";
import styled from "styled-components";
import { Button, Col, Form, Spin } from "antd";
import { CustomRow } from "@components/others";
import { CustomInput, CustomInputPassword } from "@components/form";
import { LoadingOutlined } from "@ant-design/icons";

const StyledButton = styled(Button)`
  width: 100%;
  height: 44px !important;
  border-radius: 8px !important;
  background: linear-gradient(135deg, #800000 0%, #5A0000 100%) !important;
  border: none !important;
  font-weight: 700 !important;
  font-size: 15px !important;
  letter-spacing: 0.03em !important;
  color: #fff !important;
  box-shadow: 0 4px 16px rgba(128,0,0,0.35) !important;
  transition: all 0.2s ease !important;
  margin-top: 8px;

  &:hover {
    background: linear-gradient(135deg, #a31c1c 0%, #800000 100%) !important;
    box-shadow: 0 6px 20px rgba(128,0,0,0.45) !important;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0px);
  }
`

const LabelStyle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;

  .ant-form-item-label > label {
    font-weight: 600 !important;
    color: #334155 !important;
    font-size: 13px !important;
  }
`

const SignInForm = ({ handleSignIn, isLoading }) => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    handleSignIn(values);
  };

  return (
    <Form
      onFinish={onFinish}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      autoComplete="off"
      form={form}
    >
      <CustomRow space={[0, 16]}>
        <Col span={24}>
          <CustomInput
            name="email"
            type="email"
            label="Email Address"
            rules={[{ required: true, message: "Email is required" }]}
          />
        </Col>
        <Col span={24}>
          <CustomInputPassword
            name="password"
            label="Password"
            rules={[{ required: true, message: "Password is required" }]}
          />
        </Col>
        <Col span={24} style={{ marginTop: 8 }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 44 }}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: '#800000' }} spin />} />
            </div>
          ) : (
            <StyledButton htmlType="submit" data-testid="signin-submit-btn">
              Sign In
            </StyledButton>
          )}
        </Col>
      </CustomRow>
    </Form>
  );
};

export default SignInForm;
