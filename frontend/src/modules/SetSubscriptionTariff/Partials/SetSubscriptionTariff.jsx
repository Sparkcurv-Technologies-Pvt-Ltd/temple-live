import React, { useEffect, useState } from "react";
import {
  Button,
  CustomDatePicker,
  CustomInputNumber,
  CustomSelect,
} from "@components/form";
import { CustomCardView, CustomRow, Flex } from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col, Form } from "antd";
import dayjs from "dayjs";
import request from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";
import errorHandler from "@request/errorHandler";
import successHandler from "@request/successHandler";
import { getSubscriptionTariff } from "../SubscriptionTariffSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export const SetSubscriptionTariff = ({
  updateSubscriptionTariff,
  subscriptiontrigger,
  FormExternalClose,
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [fromDate, setFromDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));

  const [tyeamt, setTyeamt] = useState("Percentage");
  const [penalty, setpenalty] = useState("Percentage");
  const [disableException,setDisableException] = useState(false);
  const [disablePenalty,setDisablePenalty] = useState(false);

// console.log(updateSubscriptionTariff,'updateSubscriptionTariff');
  useEffect(() => {
    if (updateSubscriptionTariff) {
      setSubscription();
    }
  }, [updateSubscriptionTariff, subscriptiontrigger]);

  const optionexcept = [
    {
      label: "%",
      value: "Percentage",
    },
    {
      label: "₹",
      value: "Amount",
    },
  ];

  const optionpanalty = [
    {
      label: "%",
      value: "Percentage",
    },
    {
      label: "₹",
      value: "Amount",
    },
  ];

  const setSubscription = () => {
    const Dated = new Date(updateSubscriptionTariff?.date);
    const FromDate = new Date(updateSubscriptionTariff?.from_date);
    const ToDate = new Date(updateSubscriptionTariff?.to_date);
    const dateFormat = "YYYY-MM-DD";

    const FromDated = dayjs(FromDate).format(dateFormat);
    setFromDate(FromDated)
    const ToDated = dayjs(ToDate).format(dateFormat);
    setToDate(ToDated)

    form.setFieldsValue(updateSubscriptionTariff);
    form.setFieldsValue({
      date: dayjs(Dated),
      from_date: dayjs(FromDate),
      to_date: dayjs(ToDate),
    });
    setTyeamt(updateSubscriptionTariff?.exp_amount_type)
    setpenalty(updateSubscriptionTariff?.penalty_amount_type)

   //--------------   Exception ----------------------------

    // Legacy records may already contain a value >100. In that case fall back
    // to "Amount" mode so the user can view the raw number, but the strict
    // Percentage cap (validator below) blocks any further save >100%.
    if(updateSubscriptionTariff?.exp_amount > 100 && updateSubscriptionTariff?.exp_amount_type === "Percentage"){
      form.setFieldsValue({exp_amount_type:"Amount"})
      setDisableException(true)
    }
    else{
      setDisableException(false)
    }
    //----------------- Penalty -------------------------------

    if(updateSubscriptionTariff?.penalty_amt > 100 && updateSubscriptionTariff?.penalty_amount_type === "Percentage"){
      form.setFieldsValue({penalty_amount_type:"Amount"})
      setDisablePenalty(true)
    }
    else{
      setDisablePenalty(false)
    }

     //------------------------------
  };
//-------- Handle Default Date-----------------

  const handleDate = (date) => {
    setSelectedDate(date);
  };
//-----------Handle From Date--------------------
  const handleFromDate = (date) => {
    setFromDate(date);
  };
//-----------Handle To Date------------------------
  const handleToDate = (date) => {
    setToDate(date);
  };
//------------Handle Exception Amt Type ---------

  const handleExceptionType = (value) => {
    setTyeamt(value);
  };
//------------Handle Penalty Amt Type -----------
  const handlepenalty = (value) => {
    setpenalty(value);
  };
//----------------Handle Exception -------------

  const handleException =(value)=>{
    // Strict cap: percentages must not exceed 100 %. The Ant Form
    // validator (attached below in the JSX) rejects submission when the
    // Percentage mode is used with value > 100. We no longer silently
    // flip the type to "Amount".
    setDisableException(false)
  }
  //----------------Handle Penalty -------------

  const handlePenalty = (value)=>{
    setDisablePenalty(false)
  }
//--------------------------------------------------

  const AddSubscriptionTariff = async (data) => {
    await request
      .post(`${APIURLS.POST_SUBSCRIPTIONTARIFF}`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "SubscriptionTariff Added Successfully",
          type: "success",
        });
        form.resetFields();
        dispatch(getSubscriptionTariff());
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 400) {
          if (error.response.data?.non_field_errors) {
            toast.error(error.response.data?.non_field_errors[0]);
          }
          if (error.response.data?.from_date) {
            toast.error(error.response.data?.from_date[0]);
          }
          if (error.response.data?.to_date) {
            toast.error(error.response.data?.to_date[0]);
          }
        } else if (error.response.status === 406) {
          toast.error(error.response.data?.message);
        } 
         else if (error.response.status === 302) {
          toast.error(error.response.data?.message);
        }
        else {
          return errorHandler(error);
        }
      });
  };

  const EditSubscriptionTariff = async (data) => {
    await request.put(`${APIURLS.PUT_SUBSCRIPTIONTARIFF}${updateSubscriptionTariff?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "SubscriptionTariff Updated Successfully",
          type: "success",
        });
        FormExternalClose();
        dispatch(getSubscriptionTariff());
        // return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 400) {
          if (error.response.data?.non_field_errors) {
            toast.error(error.response.data?.non_field_errors[0]);
          }
          if (error.response.data?.from_date) {
            toast.error(error.response.data?.from_date[0]);
          }
          if (error.response.data?.to_date) {
            toast.error(error.response.data?.to_date[0]);
          }
        } else if (error.response.status === 406) {
          toast.error(error.response.data?.message);
        }
        else if (error.response.status === 302) {
          toast.error(error.response.data?.message);
        }
         else {
          return errorHandler(error);
        }
      });
  };
  
  const onFinish = (values) => {
    const newValue = {
      ...values,
      date: selectedDate,
      from_date: fromDate,
      to_date: toDate,
    };
    newValue.penalty_amt = newValue.penalty_amt || 0;
    const formData = new FormData();
    if (updateSubscriptionTariff) {
      // const formData = new FormData();
      EditSubscriptionTariff(newValue);
      formData.append('date', selectedDate);
      formData.append('from_date', fromDate);
      formData.append('to_date', toDate);
      formData.append("exp_amount_type", tyeamt);
      formData.append("penalty_amount_type", penalty);
      formData.append("penalty_amt", newValue.penalty_amt); // Use the updated value
    } else {
      formData.append('date', selectedDate);
      formData.append('from_date', fromDate);
      formData.append('to_date', toDate);
      formData.append("exp_amount_type", tyeamt);
      formData.append("penalty_amount_type", penalty);
      formData.append("penalty_amt", newValue.penalty_amt); // Use the Added value
      AddSubscriptionTariff(newValue);
    }
  };

  const onFinishFailed = () => {
    toast.warn("Please fill in all the required details !");
  };

  const SelectSide = (
    <CustomSelect
      options={optionexcept}
      initialValue={tyeamt}
      disabled={disableException}
      name={"exp_amount_type"}
      width={"70px"}
      onChange={handleExceptionType}
    />
  );

  const SelectSidetwo = (
    <CustomSelect
      options={optionpanalty}
      initialValue={penalty}
      disabled={disablePenalty}
      name={"penalty_amount_type"}
      width={"70px"}
      onChange={handlepenalty}
    />
  );

  const onReset = () => {
    form.resetFields();
  };

  return (
    <Form
      name="AddIncome"
      form={form}
      labelCol={{
        span: 24,
      }}
      wrapperCol={{
        span: 24,
      }}
      initialValues={{ date: dayjs() }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <CustomCardView>
        <CustomRow space={[24, 24]}>
          <Col span={24} md={12}>
            <CustomPageTitle Heading={"Set Subscription Tariff"} />
          </Col>

          <Col span={24} md={12}>
            <Flex flexend={"right"}>
              <CustomDatePicker label={"Date"} name={"date"}
                onChange={handleDate} disabled={true} />
            </Flex>
          </Col>

          <Col span={24} md={12}>
            <CustomInputNumber
              label={"Subscription Tariff Amount"}
              name={"tariff_amount"} suffix={"₹"}
              rules={[{ required: true, message: "Required !" }]} />
          </Col>

          <Col span={12} md={6}>
            <CustomDatePicker
              label={"From"} name={"from_date"}
              onChange={handleFromDate} rules={[{ required: true, message: "Required !" }]} />
          </Col>

          <Col span={12} md={6}>
            <CustomDatePicker
              label={"To"} name={"to_date"}
              onChange={handleToDate} rules={[{ required: true, message: "Required !" }]} />
          </Col>

          <Col span={24} md={12}>
            <CustomInputNumber
              addonAfter={SelectSide} label={"Exception"}
              name={"exp_amount"} rules={[
                { required: true, message: "Required !" },
                {
                  validator: (_, value) => {
                    if (
                      tyeamt === "Percentage" &&
                      value !== undefined &&
                      value !== null &&
                      Number(value) > 100
                    ) {
                      return Promise.reject(
                        new Error("Exception percentage cannot exceed 100%")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              onChange={handleException}
              />
          </Col>
          <Col span={24} md={12}>
            <CustomInputNumber
              addonAfter={SelectSidetwo} label={"Penalty"}
              name={"penalty_amt"} rules={[
                { required: true, message: "Required !" },
                {
                  validator: (_, value) => {
                    if (
                      penalty === "Percentage" &&
                      value !== undefined &&
                      value !== null &&
                      Number(value) > 100
                    ) {
                      return Promise.reject(
                        new Error("Penalty percentage cannot exceed 100%")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              onChange={handlePenalty} 
              />
          </Col>

        </CustomRow>

        <Flex gap={"20px"} center={"true"} margin={"20px 0"}>
          {updateSubscriptionTariff ? (
            <>
              <Button.Success text={"Update"} htmlType={"submit"} />
              <Button.Danger
                text={"Cancel"}
                onClick={() => FormExternalClose()}
              />
            </>
          ) : (
            <>
              <Button.Success text={"Submit"} htmlType={"submit"} />
              <Button.Danger text={"Reset"} onClick={() => onReset()} />
            </>
          )}
          {/* <Button.Danger text={'Submit'} htmlType={'submit'} />
                    <Button.Success text={'cancel'} onClick={() => onReset()} /> */}
        </Flex>
      </CustomCardView>
    </Form>
  );
};
