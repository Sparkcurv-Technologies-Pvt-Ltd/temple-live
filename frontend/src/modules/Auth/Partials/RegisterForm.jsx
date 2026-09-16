import React, { Fragment } from 'react'
import styled from 'styled-components'
import { Button, Col, Form, Input } from 'antd'
import { CustomRow, Flex } from '@components/others'
import { CustomInput, CustomInputPassword } from '@components/form'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { MdEmail } from 'react-icons/md'
import { SvgIcons } from '@assets/Svg'
import { THEME } from '@theme/index'
import { useNavigate } from 'react-router-dom'


const FragmentStyle = styled.div`
  & svg {
    color: black;
  }
`
const StyledLogo = styled.div`
  
color: #900;
`
const StyledButton = styled(Button)`
 display: flex;
 width: 95%;
 border-radius: 5px;
background: #900;
box-shadow: 4px 4px 20px 0px rgba(153, 0, 0, 0.25);
align-items: center;
text-align: center;
justify-content: center;
padding: 20px  !important;
margin-top: 30px;

& p{
  color: white;

}
`

export const Wrapper = styled.div`
  height: 100vh;
  width: 100%;
  margin:auto;
  display:grid;
  background: #FFF5F5;;
`

const SignInCard = styled.div`
  background-color: #fff;
  backdrop-filter:blur(1px);
  padding: 40px 32px;
  max-width: 450px;
  width: 100%;
  margin: auto;
  /* height: 50%; */
  border-radius: 20px;
  box-shadow: 4px 4px 20px 0px #F3BC2E40;
`
const RegisterForm = ({ handleSignIn }) => {

  const [form] = Form.useForm();
  const navigate = useNavigate()

  const TakeToSignIn =()=>{
    navigate('/signin')
  }

  const onFinish = values => {
    handleSignIn(values)
    // form.resetFields();
  }

  return (
    <FragmentStyle>
      <Wrapper column>
        <SignInCard>
          <Form onFinish={onFinish}
            labelCol={{
              span: 24,
            }}
            autoComplete='off'
            wrapperCol={{
              span: 24,
            }}
            form={form}>

            <CustomRow space={[24, 24]}>
              <Col span={24} md={24}>
                <Flex center={'true'}>
                  <img src={SvgIcons.Logoimg} />
                  <StyledLogo>
                    <h1>Temple</h1>
                  </StyledLogo>
                </Flex>
              </Col>
              <Col span={24} md={24}>
                <Flex center={'true'}>
                  <h2>Sign Up</h2>
                </Flex>
              </Col>
              <Col span={24}>
                <CustomInput
                  name="email"
                  label={'Email '}
                />
              </Col>

              <Col span={24}>
                <CustomInputPassword
                  name="password"
                  label={'Password'}
                />
              </Col>

              <Col span={24}>
                <CustomInputPassword
                  name="confirm_password"
                  label={'Confirm Password'}
                />
              </Col>

            </CustomRow>
            <Flex center={'true'} gap={'20px'} margin={'20px 0'}>
              <StyledButton htmlType='submit'>
                <p>Create User</p>
              </StyledButton>
            </Flex>
            <Flex center={'true'}>
            <p>Already Have An Account ? <span style={{ color: "#990000" }} onClick={TakeToSignIn}>Sign In</span></p>
            </Flex>
          </Form>
        </SignInCard>
      </Wrapper>
    </FragmentStyle>
  )
}

export default RegisterForm
