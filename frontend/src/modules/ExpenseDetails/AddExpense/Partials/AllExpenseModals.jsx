import { Button, CustomInput } from "@components/form";
import { CustomRow, Flex } from "@components/others";
import { APIURLS } from "@request/apiUrls/urls";
import errorHandler from "@request/errorHandler";
import request from "@request/request";
import successHandler from "@request/successHandler";
import { Col, Form } from "antd";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getExpenseCategory, getExpenseName } from "../../ExpenseSlice";
import { toast } from "react-toastify";

export const AddExpenseCategoryModal = ({
  formname,
  CloseForm,
  Expensetrigr,
  CategoryRecord,
  expenseTrigger,
  FormUpdateClose
}) => {

  const [form] = Form.useForm();
  const dispatch = useDispatch();


  console.log(CategoryRecord, 'CategoryRecord');

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(CategoryRecord);
  }, [CategoryRecord, Expensetrigr, expenseTrigger]);

  const onFinish = (data) => {
    if (CategoryRecord) {
      UpdateExpenseCategory(data)
    } else {
      AddExpenseCategory(data);
    }
  };

  const onFinishFailed = (errorInfo) => {
    toast.warn("Please fill in all the required details !");
  };

  const AddExpenseCategory = async (data) => {
    await request
      .post(`${APIURLS.POST_EXPENSE_CATEGORY}`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Expense Category Added Successfully !",
          type: "success",
        });
        if (CloseForm) {
          CloseForm();
        }
        dispatch(getExpenseCategory());
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 302) {
          toast.warn(error.response?.data?.message);
        } else {
          return errorHandler(error);
        }
      });
  };

  const UpdateExpenseCategory = async (data) => {
    await request.put(`${APIURLS.UPDATE_EXPENSE_CATEGORY}/${CategoryRecord?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Expense Category Update Successfully !",
          type: "success",
        });
        if (FormUpdateClose) {
          FormUpdateClose();
        }
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
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
          <CustomInput
            label={"Expense Category"}
            name={"category_name"}
            rules={[
              {
                required: true,
                message: "Please Select Expense Category !",
              },
            ]}
          />
        </Col>
      </CustomRow>
      {CategoryRecord ? <Flex center gap={"20px"} style={{ margin: "30px" }}>
        <Button.Danger text={"Update"} htmlType={"submit"} />
        <Button.Success text={"Cancel"} onClick={() => FormUpdateClose()} />
      </Flex> :
        <Flex center gap={"20px"} style={{ margin: "30px" }}>
          <Button.Danger text={"Add"} htmlType={"submit"} />
          <Button.Success text={"Cancel"} onClick={() => CloseForm()} />
        </Flex>
      }
    </Form>
  );
};

export const AddExpenseNameModal = ({ formname, CloseFormm, Expensetrigr,
  ExpenseNameRecord, FormUpdateClose, ExpenseNameTrigger }) => {

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(ExpenseNameRecord);
  }, [ExpenseNameRecord, ExpenseNameTrigger, Expensetrigr]);

  const onFinish = (data) => {
    if (ExpenseNameRecord) {
      UpdateExpenseName(data)
    } else {
      AddExpenseName(data);
    }
  };

  const onFinishFailed = (errorInfo) => {
    toast.warn("Please fill in all the required details !");
  };

  const AddExpenseName = async (data) => {
    await request
      .post(`${APIURLS.POST_EXPENSE_NAME}`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Expense Name Added Successfully !",
          type: "success",
        });
        if (CloseFormm) {
          CloseFormm();
        }
        dispatch(getExpenseName());
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 302) {
          toast.warn(error.response?.data?.message);
        } else {
          return errorHandler(error);
        }
      });
  };

  const UpdateExpenseName = async (data) => {
    await request.put(`${APIURLS.UPDATE_EXPENSE_NAME}/${ExpenseNameRecord?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Expense Name update Successfully !",
          type: "success",
        });
        if (FormUpdateClose) {
          FormUpdateClose();
        }
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 302) {
          toast.warn(error.response?.data?.message);
        } else {
          return errorHandler(error);
        }
      });
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
          <CustomInput
            label={"Expense Name"}
            name={"expense_name"}
            rules={[
              {
                required: true,
                message: "Please Select Expense Name !",
              },
            ]}
          />
        </Col>
      </CustomRow>
      {ExpenseNameRecord ?
        <Flex center gap={"20px"} style={{ margin: "30px" }}>
          <Button.Danger text={"Update"} htmlType={"submit"} />
          <Button.Success text={"Cancel"} onClick={() => FormUpdateClose()} />
        </Flex> :
        <Flex center gap={"20px"} style={{ margin: "30px" }}>
          <Button.Danger text={"Add"} htmlType={"submit"} />
          <Button.Success text={"Cancel"} onClick={() => CloseFormm()} />
        </Flex>
      }
    </Form>
  );
};
