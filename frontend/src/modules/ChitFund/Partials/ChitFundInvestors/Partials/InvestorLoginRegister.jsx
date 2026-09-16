import { Button, CustomInput, CustomInputPassword, CustomSelect } from '@components/form'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { APIURLS } from '@request/apiUrls/urls'
import errorHandler from '@request/errorHandler'
import request from '@request/request'
import successHandler from '@request/successHandler'
import { Col, Form } from 'antd'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export const InvestorLoginRegister = () => {

  const [form] = Form.useForm();
  const [getData, setGetData] = useState([])
  const [FundIdFind, setFundIdFind] = useState({})
  const [FundIdFindTrigger, setFundIdFindTrigger] = useState(0)
  const [InvestorFind, setInvestorFind] = useState({})
  const [InvestorTriggerFind, setInvestorTriggerFind] = useState(0)


  useEffect(() => {
    GetInvestor()
  }, [FundIdFindTrigger])

  const GetInvestor = async (data) => {
    await request.get(APIURLS.INVESTOR__APPLICTION_SELECT_GET, data)
      .then(function (response) {
        setGetData(response.data)
        return response.data;
      })
      .catch(function (error) {
        // console.log(error.response, 'jjj error');
      })
  }

  const chitfundoptions = getData?.map((fund) => ({
    label: fund?.chit_fund?.chit_name, value: fund?.chit_fund?.id
  }))

  useEffect(() => {
    form.setFieldsValue({
      chit_fund: FundIdFind?.chit_fund?.id,
      chit_fund_name: FundIdFind?.chit_fund?.chit_name
    })
  }, [FundIdFind, FundIdFindTrigger])

  const handleChooseFund = (value) => {
    const FindIDD = getData?.find((fId) => fId?.chit_fund?.id === value)
    setFundIdFind(FindIDD)
    setFundIdFindTrigger(FundIdFindTrigger + 1)
    form.resetFields(['chit_fund_investor_name']);
  }

  // investor Functions 

  const investersoptions = FundIdFind?.investers?.map((fund) => ({
    label: fund?.invester_name, value: fund?.id
  }))

  useEffect(() => {
    form.setFieldsValue({
      chit_fund_investor: InvestorFind?.id,
      chit_fund_investor_name: InvestorFind?.invester_name, name: InvestorFind?.invester_name,
    })
  }, [InvestorFind, InvestorTriggerFind])

  const handleInvester = (value) => {
    const FindInvestorID = FundIdFind?.investers?.find((fin) => fin?.id === value)
    setInvestorFind(FindInvestorID)
    setInvestorTriggerFind(InvestorTriggerFind + 1)
  }

  const AddInvesterRegister = async (data) => {
    await request.post(APIURLS.INVESTOR_LOGIN_REGISTER_CHIT, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: 'success',
          type: 'success',
        })
        form.resetFields();
        setInvestorFind({})
        setFundIdFind({})
        form.setFieldsValue({ 'chit_fund_investor_name': null })
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
        if (error.response.status === 400) {
          if (error.response.data?.email) {
            toast.error(error.response.data?.email[0])
          }
        } else { errorHandler(error); }
      })
  }


  const onFinish = (data) => {
    AddInvesterRegister(data)
  }

  const onFinishFailed = (errorInfo) => {
    toast.warn("Please fill in all the required details !");
  };

  const onReset = () => {
    form.resetFields();
  }

  return (
    <Form
      name='Investorsregister'
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
      <CustomCardView>
        <CustomPageTitle Heading={'Investor Login Register'} />
        <CustomRow space={[24, 24]}>
          <Col span={24} md={12}>
            <CustomSelect label={'Choose Chit Fund'} name={'chit_fund_name'}
              options={chitfundoptions} onChange={handleChooseFund}
              rules={[
                {
                  required: true,
                  message: 'Please Select Chit Fund !',
                }
              ]} />
            <CustomInput name={'chit_fund'} display={'none'} />
            <CustomInput name={'name'} display={'none'} />
          </Col>
          <Col span={24} md={12}>
            <CustomSelect label={'Choose Investor'} name={'chit_fund_investor_name'}
              options={investersoptions || []} onChange={handleInvester}
              rules={[
                {
                  required: true,
                  message: 'Please Select investor !',
                }
              ]} />
            <CustomInput name={'chit_fund_investor'} display={'none'} />
          </Col>
          <Col span={24} md={12}>
            <CustomInput label={'Email'} name={'email'} type={'email'}
              rules={[
                {
                  required: true,
                  message: 'Please Enter Email ID !',
                }
              ]}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomInputPassword label={'Password'} name={'password'} type={'password'}
              rules={[
                {
                  required: true,
                  message: 'Please Enter Password !',
                }
              ]}
            />
          </Col>
        </CustomRow>

        <Flex center gap={'20px'} style={{ margin: '30px' }}>
          <Button.Danger text={'Submit'} htmlType={'submit'} />
          <Button.Success text={'Reset'} onClick={onReset} />
        </Flex>

      </CustomCardView>
    </Form>
  )
}
