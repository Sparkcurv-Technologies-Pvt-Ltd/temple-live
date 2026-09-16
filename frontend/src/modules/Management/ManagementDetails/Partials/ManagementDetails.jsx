import {
  Button,
  CustomInput,
  CustomInputNumber,
  CustomSelect,
  CustomTextArea,
  CustomUpload,
} from "@components/form";
import { CustomCardView, CustomRow, Flex } from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { selectCurrentUserRole } from "@modules/Auth/authSlice";
import {
  getManagement,
  selectManagementDetails,
} from "@modules/Management/ManagementSlice";
import { APIURLS } from "@request/apiUrls/urls";
import errorHandler from "@request/errorHandler"; 
import request, { IMG_BASE_URL } from "@request/request";
import successHandler from "@request/successHandler";
import { userRolesConfig } from "@router/config/roles";
import { Col, Form, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";


const AddManagementForm = () => {

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [managementDetails, setManagementDetails] = useState({});
  const [initialImageValue, setImageInitialValue] = useState([]);
  const [initialDocumentValue, setDocumentInitialValue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [button, setButton] = useState("Submit");

  const [balance, setbalance] = useState([]);
  const [bankBalance, setBankBalance] = useState([]);
  const [balanceType, setBalanceType] = useState([]);
  const [bankBalanceType, setBankBalanceType] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const role = useSelector(selectCurrentUserRole) //------User Role------------

  useEffect(() => {
    dispatch(getManagement());
  }, []);

  const AllManagementDetails = useSelector(selectManagementDetails);

  useEffect(() => {
    setManagementDetails(AllManagementDetails);
  }, [AllManagementDetails, updateTrigger]);

  useEffect(() => {
    if (managementDetails) {
      SetManagementDetails();
      setbalance(managementDetails?.opening_balance_type);
      setBankBalance(managementDetails?.bank_opening_balance_type);
    }
  }, [managementDetails, updateTrigger]);

  const SetManagementDetails = () => {
    form.setFieldsValue(managementDetails);
    form.setFieldsValue({ images: initialImageValue });
    form.setFieldsValue({ documents: initialDocumentValue });
  };

  useEffect(() => {
    if (managementDetails?.images?.length > 0) {
      setImageInitialValue([
        {
          uid: "1",
          name: "uploaded image",
          status: "done",
          url: `${IMG_BASE_URL}${managementDetails?.images}`,
        },
      ]);
    } else {
      setImageInitialValue([]);
    }
  }, [managementDetails, updateTrigger]);

  useEffect(() => {
    if (managementDetails?.documents?.length > 0) {
      setDocumentInitialValue([
        {
          uid: "1",
          name: "uploaded document",
          status: "done",
          url: `${IMG_BASE_URL}${managementDetails?.documents}`,
        },
      ]);
    } else {
      setDocumentInitialValue([]);
    }
  }, [managementDetails]);

  useEffect(() => {
    if (
      managementDetails?.temple_name &&
      managementDetails?.temple_name.length > 0
    ) {
      setButton("Update");
    } else {
      setButton("Submit");
    }
  }, [managementDetails]);

  //-------------- Handle Open Balance Type---------------
  const handleOpenBlanceType = (value) => {
    setBalanceType(value)
  }

  //-------------- Handle  Open Bank-Balance Type---------------
  const handleBankOpenBalanceType = (value) => {
    setBankBalanceType(value)
  }
  //---------------Handle Open Balance OnChange Function-------------------
  const handlebalance = (data) => {
    setbalance(data);
  }
  //---------------Handle Open Bank-Balance OnChange Function-------------------
  const handleBankBalance = (data) => {
    setBankBalance(data);
  }
  //-------------------------------------------
  const onReset = () => {
    form.resetFields();
  };
  //-------------------------------

  const AddManagementDetails = async (data) => {
    setIsLoading(true);
    await request
      .post(`${APIURLS.POST_MANAGEMENT_DETAILS}`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Management Details Added Successfully",
          type: "success",
        });
        dispatch(getManagement());
        setIsLoading(false);
        return response.data;
      })
      .catch(function (error) {
        setIsLoading(false);
        if (error.response.status === 400) {
          if (error.response.data?.tax_age) {
            toast.error(error.response.data?.tax_age[0])
          } else {
            toast.error("Can't be added")
          }
        } else {
          errorHandler(error);
        }

      });
  };

  const UpdateManagementDetails = async (data, id) => {
    setIsLoading(true);
    await request
      .put(`${APIURLS.PUT_MANAGEMENT_DETAILS}/${id}/`, data, config)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Management Profile Updated Successfully",
          type: "info",
        });
        setIsLoading(false);
        dispatch(getManagement());
        setUpdateTrigger((updateTrigger) => updateTrigger + 1)
        return response.data;
      })
      .catch(function (error) {
        setIsLoading(false);
        setUpdateTrigger((updateTrigger) => updateTrigger + 1)
        if (error.response.status === 400) {
          if (error.response.data?.tax_age) {
            toast.error(error.response.data?.tax_age[0])
          } else {
            toast.error("Can't be added")
          }
        } else {
          errorHandler(error);
        }
      });
  };

  const onFinish = (values) => {
    if (
      managementDetails?.temple_name &&
      managementDetails?.temple_name.length > 0
    ) {
      const formData = new FormData();

      formData.append("temple_name", values?.temple_name);
      formData.append("tax_age", values?.tax_age);
      formData.append("opening_balance", values?.opening_balance || 0);
      formData.append("opening_balance_type", values?.opening_balance_type || null);
      formData.append("address", values?.address);
      formData.append("comments", values?.comments);

      if (values?.images.length === 0) {
        formData.append("images_status", "false");
      } else if (!values?.images[0]?.url) {
        formData.append("images", values?.images[0].originFileObj);
      }

      if (values?.documents.length === 0) {
        formData.append("documents_status", "false");
      } else if (!values?.documents[0]?.url) {
        formData.append("documents", values?.documents[0].originFileObj);
      }
      formData.append("field_count", values.management.length);
      if (values.management && values)
        if (values?.management) {
          values.management.forEach((field, index) => {
            //   if (field.field_name !== null && field.field_value !== null) {
            formData.append(
              `management[${index + 1}][bank_name]`,
              field.bank_name
            );
            formData.append(
              `management[${index + 1}][account_no]`,
              field.account_no
            );
            formData.append(`management[${index + 1}][ifsc]`, field.ifsc);
            formData.append(
              `management[${index + 1}][account_holder_name]`,
              field.account_holder_name
            );
            formData.append(
              `management[${index + 1}][branch_name]`,
              field.branch_name
            );
            formData.append(
              `management[${index + 1}][bank_opening_balance_amt]`,
              field.bank_opening_balance_amt || 0
            );
            formData.append(
              `management[${index + 1}][bank_opening_balance_type]`,
              field.bank_opening_balance_type || null
            );
            if (field.id) {
              formData.append(
                `management[${index + 1}][id]`,
                field.id
              );
            }

          });
        }
      //    else {
      //     console.log("jjjjjjjjkkkkk");
      //   }
      // console.log([...formData.entries()], "updateeeemanagement");
      UpdateManagementDetails(formData, managementDetails?.id);
    } else {
      const formData = new FormData();

      formData.append("temple_name", values?.temple_name);
      formData.append("tax_age", values?.tax_age);
      formData.append("opening_balance", values?.opening_balance || 0);
      formData.append("opening_balance_type", values?.opening_balance_type);
      formData.append("address", values?.address);
      formData.append("comments", values?.comments);

      if (values?.images && values.images.length > 0) {
        values.images.forEach((file) => {
          formData.append(`images`, file.originFileObj);
        });
      } else {
        console.error("No images selected");
      }

      if (values?.documents && values.documents.length > 0) {
        values.documents.forEach((file) => {
          formData.append(`documents`, file.originFileObj);
        });
      } else {
        console.error("No images selected");
      }
      formData.append("field_count", values.management.length);
      if (values.management && values)
        if (values?.management) {
          values.management.forEach((field, index) => {
            formData.append(
              `management[${index + 1}][bank_name]`,
              field.bank_name
            );
            formData.append(
              `management[${index + 1}][account_no]`,
              field.account_no
            );
            formData.append(`management[${index + 1}][ifsc]`, field.ifsc);
            formData.append(
              `management[${index + 1}][account_holder_name]`,
              field.account_holder_name
            );
            formData.append(
              `management[${index + 1}][branch_name]`,
              field.branch_name
            );
            formData.append(
              `management[${index + 1}][bank_opening_balance_amt]`,
              field.bank_opening_balance_amt || 0
            );
            formData.append(
              `management[${index + 1}][bank_opening_balance_type]`,
              field.bank_opening_balance_type || null
            );
          });
        }

      // console.log([...formData.entries()], "addmanagementtt");
      AddManagementDetails(formData);
    }
  };

  const onFinishFailed = () => {
    toast.warn("Please fill in all the required details !");
  };

  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  let OpenBalanceOption = [];

  if (balance === 0) {
    form.resetFields(['opening_balance_type'])
    OpenBalanceOption = [
      {
        label: "Credit",
        value: "",
      },
      {
        label: "Debit",
        value: "",
      },

    ];
  } else {
    OpenBalanceOption = [
      {
        label: "Credit",
        value: "Credit",
      },
      {
        label: "Debit",
        value: "Debit",
      },
    ];
  }

  let OpenBankBalanceOption = [];

  if (bankBalance === 0) {
    form.resetFields(['bank_opening_balance_type'])
    OpenBankBalanceOption = [
      {
        label: "Credit",
        value: "",
      },
      {
        label: "Debit",
        value: "",
      },

    ];
  } else {
    OpenBankBalanceOption = [
      {
        label: "Credit",
        value: "Credit",
      },
      // {
      //   label: "Debit",
      //   value: "Debit",
      // },
    ];
  }
  const SelectSide = (
    <CustomSelect
      options={OpenBalanceOption}
      name={"opening_balance_type"}
      width={"120px"}
      value={balanceType}
      onChange={handleOpenBlanceType}
      disabled={role === userRolesConfig.USER || balance === 0 || balance === null}
      rules={balance > 0 ? [
        {
          required: true,
          message: "Required",
        },
      ] : null}

    />
  );

  return (
    <Form
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      name="managementdetails"
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >

      <CustomCardView>

        <CustomPageTitle Heading={"Management Detail"} />
        <br />
        <CustomRow space={[12, 12]}>
          <Col span={24} md={12}>
            <CustomInput
              label={"Temple / Name"}
              name={"temple_name"}
              rules={[
                {
                  required: true,
                  message: "Please Enter a Temple Name",
                },
              ]}
              disabled={role === userRolesConfig.USER}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomInputNumber
              label={"Tax Applicable Age"}
              name={"tax_age"}
              rules={[
                {
                  required: true,
                  message: "Please Enter a Tax Age",
                },
              ]}
              disabled={role === userRolesConfig.USER}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomInputNumber
              label={"Opening Balance Amt"}
              addonAfter={SelectSide}
              name={"opening_balance"}
              onChange={handlebalance}
              disabled={role === userRolesConfig.USER}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomTextArea label={"Address"} name={"address"}
              disabled={role === userRolesConfig.USER}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomTextArea label={"Comments"} name={"comments"}
              disabled={role === userRolesConfig.USER}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomUpload
              label={"Image"}
              name={"images"}
              form={form}
              maxCount={1}
              initialValue={initialImageValue}
              accept='.png,.jpeg,.jpg'
              disabled={role === userRolesConfig.USER}
            />
            <CustomUpload
              label={"Document"}
              name={"documents"}
              form={form}
              maxCount={1}
              initialValue={initialDocumentValue}
              accept=".pdf,.doc,.docx"
              disabled={role === userRolesConfig.USER}
            />
          </Col>
          <Col span={24} md={24}>
            <CustomPageTitle Heading={"Bank Details"} />
          </Col>
          <Col span={24} md={24}>
                       {managementDetails && <h3 style={{fontSize:'15px',color:'blue'}}>The bank details cannot be edited, as a cash transaction is involved !.</h3>}
                    </Col>
          <Form.List name="management">
            {(fields, { add, remove }) => (
              <>
                {role === userRolesConfig.USER ? null : (
                  <CustomRow gutter={[24, 24]}>
                    <Col span={24} md={12}>
                      <Form.Item style={{ margin: "20px 10px" }}>
                        <Button.Danger text={"+ Add Bank"} onClick={() => add()}>
                          Add
                        </Button.Danger>
                      </Form.Item>
                    </Col>
                  </CustomRow>
                )}
                {fields.map(({ key, name, ...restField }, index) => (
                  <CustomRow space={[24, 24]} key={key || index}>
                    <Col span={24} md={24}>
                      <Flex aligncenter={true}>
                        <div>
                          <h3>{index + 1} )&nbsp;</h3>
                        </div>
                        {/* <CustomPageFormTitle Heading={"Bank Details"}/> */}
                        <div><h3 style={{ color: 'rgb(255, 77, 0)' }}>Bank Details</h3></div>
                      </Flex>
                    </Col>
                    <Col span={24} md={12}>
                      <CustomInput
                        label={"Bank Name"}
                        name={[name, "bank_name"]}
                        disabled={role === userRolesConfig.USER}
                        rules={[
                          { required: index === fields.length - 1, message: 'Bank name is required' }
                        ]}
                      />
                    </Col>
                    {role === userRolesConfig.USER ? null : (
                      <Col span={4} md={12} style={{ marginTop: "27px" }}>
                        <Button.Danger text={"-"} onClick={() => remove(name)} />
                      </Col>
                    )}
                    <Col span={24} md={12}>
                      <CustomInputNumber
                        label={"Account Number"}
                        name={[name, "account_no"]}
                        disabled={role === userRolesConfig.USER}
                        rules={[
                          { required: index === fields.length - 1, message: 'Account number is required' }
                        ]}
                      />
                    </Col>
                    <Col span={24} md={12}>
                      <CustomInput
                        label={"IFSC Code"}
                        name={[name, "ifsc"]}
                        disabled={role === userRolesConfig.USER}
                        rules={[
                          { required: index === fields.length - 1, message: 'IFSC code is required' }
                        ]}
                      />
                    </Col>
                    <Col span={24} md={12}>
                      <CustomInput
                        label={"Account Holder Name"}
                        name={[name, "account_holder_name"]}
                        disabled={role === userRolesConfig.USER}
                        rules={[
                          { required: index === fields.length - 1, message: 'Account holder name is required' }
                        ]}
                      />
                    </Col>
                    <Col span={24} md={12}>
                      <CustomInput
                        label={"Branch Name"}
                        name={[name, "branch_name"]}
                        disabled={role === userRolesConfig.USER}
                        rules={[
                          { required: index === fields.length - 1, message: 'Branch name is required' }
                        ]}
                      />
                      <CustomInput name={[name, 'id']} display={'none'} />
                    </Col>
                    <Col span={24} md={12}>
                      <CustomInputNumber
                        label={"Bank Opening Balance Amt"}
                        name={[name, "bank_opening_balance_amt"]}
                        disabled={role === userRolesConfig.USER}
                        onChange={handleBankBalance}
                        addonAfter={
                          <CustomSelect
                            options={OpenBankBalanceOption}
                            name={[name, "bank_opening_balance_type"]}
                            width={"120px"}
                            value={bankBalanceType}
                            onChange={handleBankOpenBalanceType}
                            disabled={role === userRolesConfig.USER || bankBalance === 0 || bankBalance === null}
                            rules={bankBalance > 0 ? [
                              {
                                required: true,
                                message: "Required",
                              },
                            ] : null}

                          />
                        }
                        rules={[
                          { required: index === fields.length - 1, message: 'Bank Opening Balance Amt is required' }
                        ]}
                      />
                    </Col>
                  </CustomRow>
                ))}
              </>
            )}
          </Form.List>
        </CustomRow>
        {role === userRolesConfig.USER ? null : (
          <>
            <Flex center={"true"} gap={"20px"} style={{ marginTop: "30px" }}>
              {isLoading ? <Spin /> :
                <>
                  {" "}
                  {button === "Submit" && (
                    <Button.Danger text={"Submit"} htmlType={"submit"} />
                  )}
                  {button === "Submit" && (
                    <Button.Success text={"Cancel"} onClick={() => onReset()} />
                  )}
                  {button === "Update" && (
                    <Button.Danger text={"Update"} htmlType={"submit"} />
                  )}
                </>
              }
            </Flex>
          </>
        )}
      </CustomCardView>
    </Form>
  );
};

export default AddManagementForm;