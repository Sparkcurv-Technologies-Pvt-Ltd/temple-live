import React, { useEffect, useState } from "react";
import {
  Button,
  CustomDatePicker,
  CustomInput,
  CustomInputNumber,
  CustomSelect,
} from "@components/form";
import { CustomCardView, CustomRow, Flex } from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col, Form } from "antd";
import request from "@request/request";
import errorHandler from "@request/errorHandler";
import successHandler from "@request/successHandler";
import { APIURLS } from "@request/apiUrls/urls";
import dayjs from "dayjs";
import { getFestival } from "../FestivalSlice";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";

export const AddFestival = ({
  updatefestivallist,
  closee,
  festivaltrigger,
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [balance, setbalance] = useState([]);
  const [penalty, setpenalty] = useState("Percentage");
  const [disablePenalty,setDisablePenalty] = useState(false);


  const handleStartDate = (date) => {
    setStartDate(date);
  };

  const handleEndDate = (date) => {
    setEndDate(date);
  };

  const onReset = () => {
    form.resetFields();
  };
  useEffect(() => {
    if (updatefestivallist) {
      SetFestivalDetails();
      setpenalty(updatefestivallist?.choice)
    }
  }, [updatefestivallist, festivaltrigger]);

  
  const SetFestivalDetails = () => {
    const dateFormat = "YYYY-MM-DD";

    const festivaldate = new Date(updatefestivallist?.date);
    const fdate = dayjs(festivaldate).format(dateFormat);
    setDate(fdate);

    const festivalstartdate = new Date(updatefestivallist?.start_date);
    const startdate = dayjs(festivalstartdate).format(dateFormat);
    setStartDate(startdate);

    const festivalenddate = new Date(updatefestivallist?.end_date);
    const enddate = dayjs(festivalenddate).format(dateFormat);
    setEndDate(enddate);

    form.setFieldsValue(updatefestivallist);
    form.setFieldsValue({
      date: dayjs(fdate, dateFormat),
      start_date: dayjs(startdate, dateFormat),
      end_date: dayjs(enddate, dateFormat),
    });
  };
  const festivalDate = (fedate) => {
    setDate(fedate);
  };

  //----Penalty Options----------

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
//---------------- Handle Penalty Type-------------

  const handlepenaltyType = (data) => {
    setpenalty(data);
  };
  //---------- --- Handle Penalty onChange---------
  // Kept as a no-op onChange handler; the antd form rule validator enforces
  // the 100% cap on submit.  (Any legacy state toggling is now dead.)
  const handlePenalty = () => {
    setDisablePenalty(false);
  }
//-------------------
  const AddFestival = async (data) => {
    try {
      const response = await request.post(`${APIURLS.POST_FESTIVAL}`, data);
      if (response.status === 201) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Festival Details Added Successfully !",
          type: "success",
        });
        form.resetFields();
        dispatch(getFestival());
      } else {
        toast.error("Add Failed");
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        if (error.response.data?.end_date) {
          toast.error(error.response.data?.end_date[0]);
        }
        if (error.response.data?.start_date) {
          toast.error(error.response.data?.start_date[0]);
        }
        if (error.response.data?.non_field_errors) {
          toast.error(error.response.data?.non_field_errors[0]);
        }
      } else if (error.response && error.response.status === 303) {
        toast.error(error.response.data?.message);
      } else {
        toast.error("Add Failed");
        // return errorHandler(error);
      }
    }
  };

  const UpdateFestival = async (data) => {
    await request
      .put(`${APIURLS.PUT_FESTIVAL}${updatefestivallist?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Festival Details Updated Successfully",
          type: "info",
        });
        form.resetFields();
        dispatch(getFestival());
        closee();
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 400) {
          if (error.response.data?.end_date) {
            toast.error(error.response.data?.end_date[0]);
          }
          if (error.response.data?.start_date) {
            toast.error(error.response.data?.start_date[0]);
          }
          if (error.response.data?.non_field_errors) {
            toast.error(error.response.data?.non_field_errors[0]);
          }
        } else if (error.response.status === 303) {
          toast.error(error.response.data?.message);
        } else if (error.response.status === 302) {
          toast.error(error.response.data?.message);
        } else {
          return errorHandler(error);
        }
      });
  };

  const onFinish = (data) => {
    const newData = {
      ...data,
      date: date,
      start_date: startDate,
      end_date: endDate,
      choice: penalty,
    };

    if (updatefestivallist) {
      UpdateFestival(newData);
    } else {
      AddFestival(newData);
    }
  };

  const onFinishFailed = (errorInfo) => {
    toast.warn("Please fill in all the required details !");
  };

  const SelectSide = (
    <CustomSelect
      name={"choice"}
     width={"70px"}
      options={optionpanalty}
      initialValue={penalty}
      disabled={disablePenalty}
      onChange={handlepenaltyType}
      rules={[
        {
          required: true,
          message: "Required !",
        },
      ]}
    />
  );

  return (
    <Form
      name="AddFestival"
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
      autoComplete="off">
        
      <CustomCardView>
        <CustomRow space={[24, 24]}>
          <Col span={24} md={12}>
            {updatefestivallist ? (
              <CustomPageTitle Heading={"Update Festival Detail"} />
            ) : (
              <CustomPageTitle Heading={"Add Festival Details"} />
            )}
          </Col>
          <Col span={24} md={12}>
            <Flex flexend={"right"}>
              <CustomDatePicker
                name={"date"}
                onChange={festivalDate}
                disabled={true}
              />
            </Flex>
          </Col>
          <Col span={24} md={12}>
            <CustomInput
              label={"Festival Name"}
              name={"festival_name"}
              rules={[
                {
                  required: true,
                  message: "Please Enter a Festival Name!",
                },
              ]}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomInputNumber
              label={"Tax / Head"}
              name={"tax_per_head"}
              suffix={"₹"}
              rules={[
                {
                  required: true,
                  message: "Please Enter a Tax/Head!",
                },
              ]}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomDatePicker
              label={"Start Date"}
              name={"start_date"}
              onChange={handleStartDate}
              rules={[
                { required: true, message: "Please Choose a Start Date!" },
              ]}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomDatePicker
              label={"End Date"}
              name={"end_date"}
              onChange={handleEndDate}
              rules={[
                { required: true, message: "Please Choose  a End Date!" },
              ]}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomInputNumber
              addonAfter={SelectSide}
              label={"Penalty"}
              name={"penalty_amt"}
              onChange={handlePenalty}
              rules={[
                {
                  required: true,
                  message: "Please Enter a Penalty!",
                },
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
            />
          </Col>
        </CustomRow>
        <Flex gap={"20px"} center={"true"} margin={"20px 0"}>
          {updatefestivallist ? (
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
        </Flex>
      </CustomCardView>
    </Form>
  );
};
