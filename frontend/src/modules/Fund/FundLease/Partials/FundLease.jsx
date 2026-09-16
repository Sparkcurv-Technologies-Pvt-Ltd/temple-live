import {
  Button,
  CustomDatePicker,
  CustomInput,
  CustomInputNumber,
  CustomSelect,
} from "@components/form";
import { CustomCardView, CustomRow, Flex } from "@components/others";
import {
  CustomPageTitle,
} from "@components/others/CustomPageTitle";
import { APIURLS } from "@request/apiUrls/urls";
import errorHandler from "@request/errorHandler";
import request from "@request/request";
import successHandler from "@request/successHandler";
import { Col, Form, Spin } from "antd";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";

export const FundLeaseForm = ({ fundleaseRecord, leaseTrigger, handleLeaseGet }) => {

  const [form] = Form.useForm();

  const [fundLease, setFundLease] = useState([]);
  const [leaseDate, setLeaseDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [fundDetails, setFundDetails] = useState([]);
  const [isloading, setIsloading] = useState(false);
  const [maxValue, setMaxValue] = useState();
  const [fundValue, setFundValue] = useState(0)

  // ===== Modal Functions End =====

  useEffect(() => {
    GetFoundLeaseDetails();
    form.setFieldsValue({ lease_date: dayjs() })
  }, []);

  const GetFoundLeaseDetails = async (data) => {
    request
      .get(APIURLS.GET_FUND_LEASE)
      .then(function (response) {
        setFundLease(response.data);
        return response.data;
      })
      .catch(function (error) {
      });
  };

  useEffect(() => {

    if (fundleaseRecord) {
      const dateFormat = 'YYYY-MM-DD';

      const LeaseDateFormat = new Date(fundleaseRecord?.lease_date);
      const LeaseDate = dayjs(LeaseDateFormat).format(dateFormat);

      form.setFieldsValue(fundleaseRecord)
      form.setFieldsValue({
        lease_date: dayjs(LeaseDate, dateFormat),
      })
      setLeaseDate(LeaseDate)
      form.setFieldsValue({ fund_mem: fundleaseRecord?.flease?.[0]?.person_name })
      form.setFieldsValue({ person_name: fundleaseRecord?.flease?.[0]?.fund_mem })
      form.setFieldsValue({ fund_count: fundleaseRecord?.fund_count })

    }
  }, [fundleaseRecord, leaseTrigger]);

  useEffect(() => {
    if (fundleaseRecord) {
      const FindFundLease = fundLease?.find((funl) => funl.id === fundleaseRecord?.fund_group);
      setFundDetails(FindFundLease);

    }
  }, [fundleaseRecord, fundLease])
  //===========Fund lease Options =====================//

  const FundLeaseOptions = fundLease?.map((item) => ({
    label: item?.fund_name,
    value: item?.id,
  }));

  //============= Tenat Person Options =================//

  const Tenatoptions = fundDetails?.fund_group?.map((ten) => ({
    label: ten?.member_name,
    value: ten?.id
  }))

//-------------- Handle Choose fund on change -----------------
  const handleFund = (value) => {
    const FindFundLease = fundLease?.find((funl) => funl.id === value);
    form.setFieldsValue({ fund_name: FindFundLease?.fund_name });
    form.setFieldsValue({ fund_type: FindFundLease?.fund_type });
    form.setFieldsValue({ members_count: FindFundLease?.members_count });
    form.setFieldsValue({ fund_count: FindFundLease?.fixed_fund_count });
    {
      (FindFundLease?.fund_type === 'Fund 20' || FindFundLease?.fund_type === 'Fund 21') ?
        form.setFieldsValue({ fund_amount: FindFundLease?.cash_available_amount }) :
        form.setFieldsValue({ fund_amount: FindFundLease?.fixed_fund_amount });
    }
    
    form.setFieldsValue({ from_date: FindFundLease?.from_date });

    form.setFieldsValue({ to_date: FindFundLease?.to_date });
    form.setFieldsValue({
      per_head_collection_amount: FindFundLease?.per_head_collection_amount,
    });
    setFundDetails(FindFundLease);
    calculatePerHeadCollectionAmount();
    setFundValue(fundValue + 1)
    form.resetFields(['fund_mem','fund_lease_amount','final_lease_amount'])
  };

  const handleFundLeaseChange = () => {
    calculatePerHeadCollectionAmount();
  };

  const handleCommissionAmountChange = () => {
    calculatePerHeadCollectionAmount();
  };

  const calculatePerHeadCollectionAmount = () => {
    const fundLeaseAmount = parseFloat(form.getFieldValue("fund_lease_amount")) || 0;
    const commissionAmount = parseFloat(form.getFieldValue("commission_amount")) || 0;
    const fundCount = parseFloat(form.getFieldValue("fund_count")) || 1;

    const FundAmt = parseFloat(form.getFieldValue("fund_amount"));
    const FundleaseAmt = parseFloat(form.getFieldValue("fund_lease_amount"));
    const FundType = form.getFieldsValue("fund_type")


    const FinalLeaseAmt = fundLeaseAmount + commissionAmount;

    form.setFieldsValue({ final_lease_amount: FinalLeaseAmt });

    const perHeadCollectionAmount = FinalLeaseAmt / fundCount;
    form.setFieldsValue({
      per_head_collection_amount: perHeadCollectionAmount,
    });
// console.log(FundType,'FundType');
    if(fundDetails?.fund_type === "Fund 20"){
      if (FundleaseAmt > FundAmt) {
        toast.warn('Fund lease amount not greater than fund amount !');
        setMaxValue(FundAmt);
      }
    // }
    else{
      setMaxValue("")
    }
  }

   
  };

  const handleTenat = (value) => {
    const FundGroupFind = fundLease?.map((item) => item.fund_group).flat();
    const foundGroup = FundGroupFind.find((ten) => ten.id === value);
    form.setFieldsValue({ person_name: foundGroup?.member_name });
  };

  const onReset = () => {
    form.resetFields();
  };
  const onhandleClose = () => {
    handleLeaseGet()
  }

  const AddFundLease = async (data) => {
    setIsloading(true);
    try {
      const response = await request.post(APIURLS.POST_GET_FUND_LEASE, data);
      if (response.status === 226) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: `${response.data?.Message}`,
          type: "warning",
        });
      } else {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Successfully Submited",
          type: "success",
        });
      }
      GetFoundLeaseDetails();
      form.resetFields();
      setIsloading(false);
      form.setFieldsValue({ lease_date: dayjs() });
      return response.data;
    } catch (error) {
      setIsloading(false);
      return errorHandler(error);
    }
  };

  const EditFundLease = async (data) => {
    setIsloading(true);
    await request
      .put(`${APIURLS.PUT_FUND_LEASE}/${fundleaseRecord?.id}/`, data)
      .then(function (response) {
        if (response.status === 226) {
          toast.warn(response.data?.Message);
        }
        else{
          successHandler(response, {
            notifyOnSuccess: true,
            notifyOnFailed: true,
            msg: "success",
            type: "info",
          });
          handleLeaseGet();
        }
        setIsloading(false);
        return response.data;
      })
      .catch(function (error) {
        setIsloading(false);
        return errorHandler(error);
      });
  };

  
  const onFinish = (data) => {
    const { fund_mem, fund_name, person_name, per_head_collection_amount, ...rest } = data;

    const newValue = {
      ...rest,
      lease_date: leaseDate,
      per_head_collection_amount: parseFloat(per_head_collection_amount).toFixed(2),
      fund_name: data?.fund_name,
      fund_mem: data?.fund_mem,
      flease: [
        {
          fund_mem: data?.fund_mem,
          person_name: data?.person_name,
          fund_name,
          per_head_collection_amount: parseFloat(per_head_collection_amount).toFixed(2),
          lease_amount:data?.fund_lease_amount,
        }
      ]
    };
    const newEditValue = {
      ...rest,
      lease_date: leaseDate,
      per_head_collection_amount: parseFloat(per_head_collection_amount).toFixed(2),
      fund_name: data?.fund_name,
      fund_mem: data?.fund_mem,
      flease: [
        {
          fund_mem: data?.person_name,
          person_name: data?.fund_mem,
          fund_name,
          per_head_collection_amount: parseFloat(per_head_collection_amount).toFixed(2),
          lease_amount:data?.fund_lease_amount,
        }
      ]
    };

    const Values = fundValue ? newValue : newEditValue;

    if (fundleaseRecord) {
      EditFundLease(Values);
    } else {
      AddFundLease(newValue);
    }
  };
  const onFinishFailed = () => {
    toast.warn("Please fill in all the required details !");
  };
  return (
    <Form
      form={form}
      labelCol={{
        span: 24,
      }}
      wrapperCol={{
        span: 24,
      }}
      initialValues={{ lease_date: dayjs() }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={12}>
            {fundleaseRecord ? <CustomPageTitle Heading={"Update Fund Lease"} /> : <CustomPageTitle Heading={"Fund Lease"} />}
          </Col>
          <Col span={24} md={12}>
            <Flex flexend={"right"} gap={"20px"}>
              <p style={{ marginTop: "10px" }}>Lease Date</p>
              <CustomDatePicker
                name={"lease_date"}
                disabled
                rules={[
                  {
                    required: true,
                    message: "Please Select Date !",
                  },
                ]}
              />
            </Flex>
          </Col>

          <Col span={24} md={12}>
            <CustomSelect
              options={FundLeaseOptions}
              name={"fund_group"}
              label={"Choose Fund"}
              onChange={handleFund}
              rules={[
                {
                  required: true,
                  message: "Please enter details!",
                },
              ]}
            />
            <CustomInput name={"fund_name"} display={"none"} />
          </Col>
          <Col span={24} md={12}>
            <CustomSelect
              options={Tenatoptions || []}
              label={"Tenant Person"}
              name={"fund_mem"}
              onChange={handleTenat}
              rules={[
                {
                  required: true,
                  message: "Please Select Tenat Person!",
                },
              ]}
            />
            <CustomInput name={"person_name"} display={"none"} />
          </Col>
          <Col span={24} md={6}>
            <CustomInput label={"From Date"} name={"from_date"} disabled />
          </Col>
          <Col span={24} md={6}>
            <CustomInput label={"To Date"} name={"to_date"} disabled />
          </Col>

          <Col span={24} md={12}>
            <CustomInput label={"Fund Type"} name={"fund_type"} disabled />
          </Col>
          <Col span={24} md={12}>
            <CustomInput
              label={"Member Count"}
              name={"members_count"}
              disabled
            />
          </Col>
          {fundDetails?.fund_type !== "Fund 21" &&
          <Col span={24} md={6}>
            <CustomInput
              label={"Fund Available Amount"}
              name={"fund_amount"}
              disabled
            />
          </Col>}
          <Col span={24} md={fundDetails?.fund_type === "Fund 20" ? 6:12}>
            <CustomInputNumber
              label={"Fund Lease Amount"}
              name={"fund_lease_amount"}
              suffix={"₹"}
              max={maxValue}
              onChange={handleFundLeaseChange}
            />
          </Col>
          {fundDetails?.fund_type !== "Fund 21" &&
            <Col span={24} md={12}>
              <CustomInputNumber
                label={"Commission Amount"}
                name={"commission_amount"}
                suffix={"₹"}
                onChange={handleCommissionAmountChange}
              />
            </Col>}
          <Col span={24} md={12}>
            <CustomInputNumber
              label={"Final Amount"}
              name={"final_lease_amount"}
              suffix={"₹"}
              disabled
            />
          </Col>
          <Col span={24} md={12}>
            <CustomInput label={"Fund Count"} name={"fund_count"} disabled />
          </Col>
          <Col span={24} md={12}>
            <CustomInputNumber
              disabled
              label={"Per Head Amount"}
              name={"per_head_collection_amount"}
              precision={2}
              suffix={"₹"}
            />
          </Col>
        </CustomRow>
        {isloading ?
          <Flex center gap={'20px'} style={{ margin: '30px' }}><Spin /></Flex>
          :
          <Flex gap={"20px"} center={"true"} margin={"20px 0"}>
            {fundleaseRecord ?
              <>
                <Button.Danger text={"Update"} htmlType={"submit"} />
                <Button.Success text={"Cancel"} onClick={() => onhandleClose()} />
              </>
              : <>
                <Button.Danger text={"Submit"} htmlType={"submit"} />
                <Button.Success text={"Reset"} onClick={() => onReset()} />
              </>
            }
          </Flex>}
      </CustomCardView>
    </Form>
  );
};
