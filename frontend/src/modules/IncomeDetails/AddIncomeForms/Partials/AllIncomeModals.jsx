import { Button, CustomInput } from "@components/form";
import { CustomRow, Flex } from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { APIURLS } from "@request/apiUrls/urls";
import errorHandler from "@request/errorHandler";
import request from "@request/request";
import successHandler from "@request/successHandler";
import { Col, Form } from "antd";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { getIncomeCategory, getIncomeName } from "../../IncomeSlice";

export const AddIncomeCategoryModal = ({
  formname,
  CloseForm,
  Expensetrigr,
  IncomeCategoryRecord,
  incomeCategoryTrigger,
  handleOk
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    form.resetFields();
  }, [Expensetrigr]);

  useEffect(() => {
    if (IncomeCategoryRecord) {
      form.setFieldsValue(IncomeCategoryRecord);
    }
  }, [IncomeCategoryRecord, incomeCategoryTrigger]);

  const onReset = () => {
    form.resetFields();
  };

  const AddIncomeCategory = async (data) => {
    await request
      .post(`${APIURLS.POST_GET_INCOMECATEGORY}`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Income Category Added Successfully !",
          type: "success",
        });
        if (CloseForm) {
          CloseForm();
        }
        dispatch(getIncomeCategory());
        return response.data;
      })
      .catch(function (error) {
        if (error.response?.status === 302) {
          toast.warn(error.response?.data?.message);
        } else {
          return errorHandler(error);
        }
      });
  };
  const UpdateIncomeCategory = async (data) => {
    await request
      .put(`${APIURLS.PUT_PATCH_INCOMECATEGORY}/${IncomeCategoryRecord?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Income Category Added Successfully !",
          type: "success",
        });
        if (handleOk) {
          handleOk();
        }
        dispatch(getIncomeCategory());
        return response.data;
      })
      .catch(function (error) {
        if (error.response?.status === 302) {
          toast.warn(error.response?.data?.message);
        } else {
          return errorHandler(error);
        }
      });
  };
  const onFinish = (data) => {
    if (IncomeCategoryRecord) {
      UpdateIncomeCategory(data);
    } else {
      AddIncomeCategory(data);
    }
  };

  const onFinishFailed = (errorInfo) => {
    toast.warn("Please fill in all the required details !");
  };

  return (
    <Form
      name={formname}
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
          {IncomeCategoryRecord ? (
            <CustomPageTitle Heading={"Update Income Category"} />
          ) : (
            <CustomPageTitle Heading={"Add Income Category"} />
          )}
        </Col>
        <Col span={24} md={24}>
          <CustomInput
            label={"Income Category"}
            name={"category_name"}
            rules={[
              {
                required: true,
                message: "Please Select Income Category !",
              },
            ]}
          />
        </Col>
      </CustomRow>

      <Flex center gap={"20px"} style={{ margin: "30px" }}>
        {IncomeCategoryRecord ?<>
          <Button.Danger text={"Update"} htmlType={"submit"} />
        <Button.Success text={"Cancel"} onClick={() => handleOk()} />
        </>:
        <>
        <Button.Danger text={"Add"} htmlType={"submit"} />
        <Button.Success text={"Cancel"} onClick={() => CloseForm()} />
        </>
        }
      </Flex>
    </Form>
  );
};

export const AddIncomeNameModal = ({
  formname,
  CloseFormm,
  Expensetrigr,
  IncomeNameRecord,
  incomeNameTrigger,
  handleOk,
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    form.resetFields();
  }, [Expensetrigr]);

  useEffect(() => {
    if (IncomeNameRecord) {
      form.setFieldsValue(IncomeNameRecord);
    }
  }, [IncomeNameRecord, incomeNameTrigger]);

  const onReset = () => {
    form.resetFields();
  };
  const AddIncomeName = async (data) => {
    await request
      .post(`${APIURLS.POST_GET_INCOMENAME}`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Income Name Added Successfully !",
          type: "success",
        });
        if (CloseFormm) {
          CloseFormm();
        }
        dispatch(getIncomeName());
        return response.data;
      })
      .catch(function (error) {
        if (error.response?.status === 302) {
          toast.warn(error.response?.data?.message);
        } else {
          return errorHandler(error);
        }
      });
  };

  const UpdateIncomeName = async (data) => {
    await request
      .put(`${APIURLS.PUT_PATCH_INCOMEName}/${IncomeNameRecord?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Income Name Added Successfully !",
          type: "success",
        });
        if (handleOk) {
          handleOk();
        }
        dispatch(getIncomeName());
        return response.data;
      })
      .catch(function (error) {
        if (error.response?.status === 302) {
          toast.warn(error.response?.data?.message);
        } else {
          return errorHandler(error);
        }
      });
  };

  const onFinish = (data) => {
    if(IncomeNameRecord){
      UpdateIncomeName(data)
    }
    else{
      AddIncomeName(data);

    }
  };

  const onFinishFailed = (errorInfo) => {
    toast.warn("Please fill in all the required details !");
  };

  return (
    <Form
      name={formname}
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
          {IncomeNameRecord ?<CustomPageTitle Heading={"Update Income Name"} />
          :<CustomPageTitle Heading={"Add Income Name"} />}
        </Col>
        <Col span={24} md={24}>
          <CustomInput
            label={"Income Name"}
            name={"income_name"}
            rules={[
              {
                required: true,
                message: "Please Select Income Name !",
              },
            ]}
          />
        </Col>
      </CustomRow>
      <Flex center gap={"20px"} style={{ margin: "30px" }}>
        {IncomeNameRecord ?
         <>
           <Button.Danger text={"Update"} htmlType={"submit"} />
        <Button.Success text={"Cancel"} onClick={() => handleOk()} />
        </>:<>
        <Button.Danger text={"Add"} htmlType={"submit"} />
        <Button.Success text={"Cancel"} onClick={() => CloseFormm()} />
        </>
        }
        
      </Flex>
    </Form>
  );
};
