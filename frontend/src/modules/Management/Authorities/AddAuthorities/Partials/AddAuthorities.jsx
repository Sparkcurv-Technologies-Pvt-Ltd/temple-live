import {
  Button,
  CustomAddSelect,
  CustomDatePicker,
  CustomInput,
  CustomSelect,
  CustomTextArea,
} from "@components/form";
import {
  CustomCardView,
  CustomModal,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col, Form } from "antd";
import React, { useEffect, useState } from "react";
import { MdCancel } from "react-icons/md";
import {
  AddDesignationModals,
  AddFieldModals,
} from "./AuthorityFormModals.jsx";

import request from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  getAuthorityExtraField,
  selectAuthorityExtraDetails,
} from "@modules/Management/ManagementSlice.jsx";
import { toast } from "react-toastify";

const AddAuthorities = ({
  viewAuthortyRecord,
  handleGetAutorities,
  AuthorityTrigger,
}) => {

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [selectedFieldNames, setSelectedFieldNames] = useState([]);  // Use Extra Field Select Option
  const [trigger, setTrigger] = useState(0);
  const [member, setMember] = useState([]);
  const [designation, setDesignation] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // ======  Modal Open ========
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ======  Modal Title and Content ========
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState(null);

  // ----------  Form Reset UseState ---------
  const [modelwith, setModelwith] = useState(0);

  // ===== Modal Functions Start =====

  const showModal = () => {
    setIsModalOpen(true);
  };

  const ResetTrigger = () => {
    setTrigger(trigger + 1);
  };
  const handleOk = () => {
    setIsModalOpen(false);
    ResetTrigger();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const FormClose = () => {
    handleOk();
  };
  //=======

  //  ExtraFields List =============
  const AllExtrafieldsDetails = useSelector(selectAuthorityExtraDetails);

  //----------- Authority Extra Filed Get -----------------
  useEffect(() => {
    dispatch(getAuthorityExtraField());
  }, []);

  //---------- Designation and Authority Members Get---------
  useEffect(() => {
    GetDesignations();
    GetAuthorityMembers();
  }, []);

  //-------------
  const GetDesignations = async (data) => {
    await request
      .get(APIURLS.POST_GET_AUTHORITY_POSTION, data)
      .then(function (response) {
        setDesignation(response.data);
        return response.data;
      })
      .catch(function (error) {
        // return errorHandler(error);
      });
  };
  const GetAuthorityMembers = async (data) => {
    await request
      .get(APIURLS.GET_AUTHORITY_MEMBER, data)
      .then(function (response) {
        setMember(response.data);
        return response.data;
      })
      .catch(function (error) {
        // return errorHandler(error);
      });
  };

  useEffect(() => {
    if (viewAuthortyRecord) {
      form.setFieldsValue(viewAuthortyRecord);
      // const FromDate = new Date(viewAuthortyRecord?.from_date);
      // const ToDate = new Date(viewAuthortyRecord?.to_date);

      const FromDates = dayjs(viewAuthortyRecord?.from_date, 'YYYY-MM-DD')
      const ToDates = dayjs(viewAuthortyRecord?.to_date, 'YYYY-MM-DD')

      { viewAuthortyRecord.from_date && 
          form.setFieldsValue({ from_date: FromDates })
          
       }
       { viewAuthortyRecord.to_date && 
       form.setFieldsValue({ to_date: ToDates })
       }

      form.setFieldsValue({
        // from_date: dayjs(FromDate),
        // to_date: dayjs(ToDate),

        id: viewAuthortyRecord?.desgnation,
        member_id: viewAuthortyRecord?.member,
        member: viewAuthortyRecord?.member_name,
        desgnation: viewAuthortyRecord?.position_name,
      });
    }
  }, [viewAuthortyRecord, AuthorityTrigger]);

  const MemberOptions = member?.map((mem) => ({
    label: mem?.member_name,
    value: mem?.member_id,
  }));

  //==== Designation Options==========

  const DesignationOptions = designation?.map((posi) => ({
    label: posi.position_name,
    value: posi.id,
  }));

  // Exra fields Options ==============

  const ExtraFieldsOptions = AllExtrafieldsDetails?.map((extra) => ({
    label: extra.name,
    value: extra.name,
  }));

  //------- From Date Fn---------------
  const onChangeFrom = (date) => {
    setFromDate(date);
  };
  //------- To Date Fn---------------
  const onChangeTo = (date) => {
    setToDate(date);
  };

  //---------- Member Fn ----------------
  const handleMember = (value) => {
    const FindMember = member?.find((fin) => fin?.member_id === value);
    form.setFieldsValue({ member_no: FindMember?.member_no });
    form.setFieldsValue({ member: FindMember?.member_name });
  };
  //---------- Designation/Postion Fn ---------

  const handleDesignations = (value) => {
    const FindPostions = designation?.find((fin) => fin.id === value);
    form.setFieldsValue({ position_name: FindPostions?.position_name });
  };

  //---------- Extra Field Get Fuctions------------

  const handleExtraGet = () => {
    dispatch(getAuthorityExtraField());
    handleOk();
  };
  const addModal = () => {
    setModelwith(500);
    setModalTitle("Add Field");
    setModalContent(<AddFieldModals handleExtraGet={handleExtraGet} />);
    showModal();
  };
  const handlechange = (value, name) => {
    const isItemAlreadyAdded = selectedFieldNames.includes(value);

    if (isItemAlreadyAdded) {
      form.setFieldsValue({ [name]: "" });
    } else {
      setSelectedFieldNames([...selectedFieldNames, value]);
    }
  };
  //------------------------------------------------

  const AddNewDesignation = () => {
    setModelwith(500);
    setTrigger(trigger + 1);
    setModalTitle("Add Designation");
    setModalContent(
      <AddDesignationModals
        FormClose={FormClose}
        trigger={trigger}
        GetDesignations={GetDesignations}
      />
    );
    showModal();
  };

  const onReset = () => {
    form.resetFields();
  };

  const AddAuthority = async (data) => {
    await request
      .post(APIURLS.POST_ADD_AUTHORITY, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        form.resetFields();
        // console.log(response,'eeeeee');
        return response.data;
      })
      .catch(function (error) {
        if(error.response.status === 406){
          toast.error(error.response.data.message);
        }
        else{
          return errorHandler(error);
        }
      });
  };
  const UpdateAuthority = async (data) => {
    await request
      .put(`${APIURLS.PUT_AUTHORITY_DETAILS}/${viewAuthortyRecord?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "info",
        });
        form.resetFields();
        handleGetAutorities();
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
        return errorHandler(error);
      });
  };

  const onFinish = (values) => {
    const Newvalues ={...values,from_date:fromDate,to_date: toDate}
    const record = {
      from_date: Newvalues?.from_date || viewAuthortyRecord?.from_date,
      to_date: Newvalues?.to_date || viewAuthortyRecord?.to_date,
      position_name: Newvalues?.position_name,
      desgnation: Newvalues?.id,
      member: Newvalues?.member_id,
      member_name: Newvalues?.member,
      member_no: Newvalues?.member_no,
      comments: Newvalues?.comments,
      atharity: Newvalues?.atharity,
    };
    if (viewAuthortyRecord) {
      UpdateAuthority(record);
    } else {
      AddAuthority(record);
    }
  };

  const onFinishFailed = () => {
    toast.warn("Please fill in all the required details !");
  };

  return (
    <Form
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      // initialValues={{ atharity: [{}] }}
    >
      <CustomCardView>
        {viewAuthortyRecord ? <CustomPageTitle Heading={"Update Authorities"} /> : (
          <CustomPageTitle Heading={"Add Authorities"} />
        )}
        <CustomRow space={[12, 12]}>
          <Col span={24} md={12}>
            <CustomAddSelect
              label={"Designation / Position"}
              name={"id"}
              options={DesignationOptions}
              onButtonClick={AddNewDesignation}
              onChange={handleDesignations}
              rules={[
                {
                    required: true,
                    message: 'Please Select Designation/Position!',
                }
            ]}
            />
            <CustomInput name={"position_name"} display={"none"} />
          </Col>

          <Col span={24} md={12}>
            <CustomSelect
              label={"Choose Member"}
              name={"member_id"}
              options={MemberOptions}
              onChange={handleMember}
              rules={[
                {
                    required: true,
                    message: 'Please Select Member Name!',
                }
            ]}
            />
            <CustomInput name={"member"} display={"none"} />
            <CustomInput name={"member_no"} display={"none"} />
          </Col>

          <Col span={24} md={12}>
            <CustomDatePicker
              label={"From Date"}
              name={"from_date"}
              onChange={onChangeFrom}
              rules={[
                {
                    required: true,
                    message: 'Please Choose a From Date!',
                }
            ]}
            />
          </Col>

          <Col span={24} md={12}>
            <CustomDatePicker
              label={"To Date"}
              name={"to_date"}
              onChange={onChangeTo}
              rules={[
                {
                    required: true,
                    message: 'Please Choose a To Date!',
                }
            ]}
            />
          </Col>

          <Col span={24} md={12}>
            <CustomTextArea label={"Comments"} name={"comments"} />
          </Col>

          <Col span={24} md={12}></Col>
          <Col span={24} md={20}>
            <Form.List name="atharity">
              {(fields, { add, remove }) => (
                <>
                  <CustomRow gutter={[12, 12]}>
                    <Col span={24} md={12}>
                      <Form.Item style={{ margin: "20px 10px" }}>
                        <Flex>
                          <Button.Success
                            text={"+"}
                            onClick={() => addModal()}
                          />
                          <Button.Danger
                            text={"Add Field"}
                            onClick={() => add()}
                          >
                            Add
                          </Button.Danger>
                        </Flex>
                      </Form.Item>
                    </Col>
                  </CustomRow>
                  {fields.map(({ key, name, ...restField }) => (
                    <CustomRow space={[24, 24]}>
                      <Col span={24} md={10}>
                        <CustomSelect
                          placeholder={"Select"}
                          options={ExtraFieldsOptions}
                          name={[name, "name"]}
                          onChange={(selectedValue) =>
                            handlechange(selectedValue, [name, "name"])
                          }
                          // rules={[
                          //   {
                          //     required: true,
                          //     message: "This is required field!",
                          //   },
                          // ]}
                        />
                      </Col>
                      <Col span={20} md={10}>
                        <CustomInput
                          placeholder={"Value"}
                          name={[name, "valuess"]}
                          // rules={[
                          //   {
                          //     required: true,
                          //     message: "This is required field!",
                          //   },
                          // ]}
                        />
                      </Col>
                      <Col span={4} md={4} style={{ marginTop: "-25px" }}>
                        {/* {fields.length > 1 && ( */}
                          <MdCancel
                            style={{
                              fontSize: "25px",
                              color: "#ADADAD",
                              cursor: "pointer",
                              margin: "31px 10px",
                            }}
                            onClick={() => remove(name)}
                          />
                        {/* )} */}
                      </Col>
                    </CustomRow>
                  ))}
                </>
              )}
            </Form.List>
          </Col>
        </CustomRow>
        <Flex center={"true"} gap={"20px"}>
          {viewAuthortyRecord ? (
            <>
              <Button.Danger text={"Update"} htmlType={"submit"} />
              <Button.Success text={"Cancel"} onClick={handleGetAutorities} />
            </>
          ) : (
            <>
              <Button.Danger text={"Submit"} htmlType={"submit"} />
              <Button.Success text={"Reset"} onClick={onReset} />
            </>
          )}
        </Flex>
      </CustomCardView>
      <CustomModal
        isVisible={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        width={modelwith}
        modalTitle={modalTitle}
        modalContent={modalContent}
      />
    </Form>
  );
};

export default AddAuthorities;
