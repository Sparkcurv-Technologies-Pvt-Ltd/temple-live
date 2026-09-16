import {
  Button,
  CustomAddSelect,
  CustomDatePicker,
  CustomInput,
  CustomInputNumber,
  CustomSelect,
  CustomTable,
} from "@components/form";
import {
  CustomCardView,
  CustomModal,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col, Form } from "antd";
import React, { Fragment, useEffect, useState } from "react";
import { AddSangamNameModals } from "./SangamModals";
import { AddSangamMembers } from "./AddSangamMembers";
import { SvgIcons } from "@assets/Svg";
import { useDispatch, useSelector } from "react-redux";
import {
  getSangamDetails,
  getSangamName,
  selectSangamName,
} from "../SangamSlice";
import dayjs from "dayjs";
import {
  getMembersDetails,
  selectMemberDetails,
} from "@modules/FamilyDetails/FamilySlice";
import request from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import CustomPopconfirm from "@components/others/CustomPopConfirm";
import { toast } from "react-toastify";



const AddSangamDetails = ({
  FormExternalClosee,
  updateSangam,
  sangamTrigger,
}) => {


  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // =============  Dynamic Table Data

  const [sangamName, setSangamName] = useState();
  const [headList, setHeadList] = useState();
  const [headNo, setHeadNo] = useState();
  const [secretryList, setSecretryList] = useState();
  const [secretryNo, setSecretryNo] = useState();
  const [treasureyList, setTreasureyList] = useState();
  const [treasureyNo, setTreasureyNo] = useState();
  const [startingDate, setStartingDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );

  // For Showing on Table
  const [dynamicTableData, setDynamicTableData] = useState([]);
  const [trigger, setTrigger] = useState(0);

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

  const handleOk = () => {
    setIsModalOpen(false);
    // ResetTrigger();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const FormExternalClose = () => {
    handleCancel();
  };

  useEffect(() => {
    form.resetFields();
  }, []);

  useEffect(() => {
    if (updateSangam) {
      setSangam();
    }
  }, [updateSangam, sangamTrigger]);

  useEffect(() => {
      const tableData = updateSangam?.sangama.map((value, index) => ({
        ...value,
        key: index
      }));

      setDynamicTableData(tableData);
  }, [updateSangam, sangamTrigger]);

  const setSangam = () => {
    const Dated = new Date(updateSangam?.starting_date);
    form.setFieldsValue(updateSangam);

    setSangamName(updateSangam?.name)
    setHeadList(updateSangam?.head_member);
    setSecretryList(updateSangam?.secretry_member);
    setTreasureyList(updateSangam?.treasurey_member);

    setHeadNo(updateSangam?.head_mem_no);
    setSecretryNo(updateSangam?.secretry_mem_no);
    setTreasureyNo(updateSangam?.treasurey_mem_no);
    // setDynamicTableData(updateSangam?.sangama);

    form.setFieldsValue({
      starting_date: dayjs(Dated),
    });
  };

  const handleStartingDate = (date) => {
    setStartingDate(date);
  };

  useEffect(() => {
    dispatch(getSangamName());
    dispatch(getMembersDetails());
  }, []);

  const AllSangamName = useSelector(selectSangamName);
  const AllFamilyMember = useSelector(selectMemberDetails);

  const SangamNameOptions = AllSangamName.map((item) => ({
    label: item.sangam_name,
    value: item.id,
  }));

  const handleNameChange = (value) => {
    const AllNameDetails = AllSangamName.find((item) => item.id === value);
    setSangamName(AllNameDetails.sangam_name);
  };

  useEffect(() => {
    form.setFieldsValue({ name: sangamName });
    form.setFieldsValue({ head_member: headList });
    form.setFieldsValue({ head_mem_no: headNo });
    form.setFieldsValue({ secretry_member: secretryList });
    form.setFieldsValue({ secretry_mem_no: secretryNo });
    form.setFieldsValue({ treasurey_member: treasureyList });
    form.setFieldsValue({ treasurey_mem_no: treasureyNo });
  }, [
    sangamName,
    headList,
    secretryList,
    treasureyList,
    headNo,
    secretryNo,
    treasureyNo,
  ]);

  // memberList

  const memberoptions = AllFamilyMember.map((item) => ({
    label: item.member_name,
    value: item.member_name,
  }));

  const handleHeadChange = (value) => {
    const AllMemberDetails = AllFamilyMember.find(
      (fes) => fes.member_name === value
    );
    setHeadList(AllMemberDetails.id);
    setHeadNo(AllMemberDetails.member_no);
  };

  const handleSecretryChange = (value) => {
    const AllMemberDetails = AllFamilyMember.find(
      (fes) => fes.member_name === value
    );
    setSecretryList(AllMemberDetails.id);
    setSecretryNo(AllMemberDetails.member_no);
  };

  const handleTreasureyChange = (value) => {
    const AllMemberDetails = AllFamilyMember.find(
      (fes) => fes.member_name === value
    );
    setTreasureyList(AllMemberDetails.id);
    setTreasureyNo(AllMemberDetails.member_no);
  };

  // ---------- SET VALUE TO DYNAMIC DATA ------

  const SetDynamicTable = (value) => {
    setDynamicTableData((prev) => {
      if (!Array.isArray(prev)) {
        // If prev is not an array, create a new array with the current and new value
        return [{ ...value, key: 0 }];
      }

      const isAssetNameExists = prev.some((item) => item.member === value.member);

      if (!isAssetNameExists) {
        const maxKey = Math.max(...prev.map((item) => item.key), 0);
        return [...prev, { ...value, key: maxKey + 1 }];
      } else {
        toast.warn("Member name already exists in the table.");
        return prev;
      }
    });
  };

  const RowRemove = (rowKey) => {
    const newArr = dynamicTableData?.filter(item => item.key !== rowKey);
    setDynamicTableData(newArr);
  };

  const TableColumns = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Member No",
      dataIndex: "member_no",
    },
    {
      title: "Member Name",
      dataIndex: "member_name",
    },
    {
      title: "Action",
      render: (text, record, index) => {
        const rowKey = record.key;
        return (
          <Flex gap={"true"} center={"true"}>
            <CustomPopconfirm
              title="Confirmation"
              description="Are you absolutely certain about removing this added detail ?"
              okText="Yes"
              cancelText="No"
              confirm={() => RowRemove(rowKey)}
            >
              <img src={SvgIcons.Remove} style={{cursor:"pointer"}}/>
            </CustomPopconfirm>
          </Flex>
        );
      },
    },
  ];


  const onReset = () => {
    form.resetFields();
  };

  const SangamNameModal = () => {
    setTrigger(trigger + 1);
    setModelwith(500);
    setModalTitle("Add Sangam Name");
    setModalContent(
      <AddSangamNameModals
        FormExternalClose={FormExternalClose}
        trigger={trigger}
      />
    );
    showModal();
  };
  const AddSangam = async (data) => {
    await request
      .post(APIURLS.POST_SANGAM_DETAILS, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        form.resetFields();
        dispatch(getSangamDetails());
        setDynamicTableData([])
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  const EditSangam = async (data) => {
    await request
      .put(`${APIURLS.PUT_SANGAM_DETAILS}${updateSangam?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        FormExternalClosee();
        dispatch(getSangamDetails());
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };
  const onFinish = (values) => {
    const newValue = {
      ...values,
      starting_date: values?.starting_date === null ? '' : dayjs(startingDate).format('YYYY-MM-DD') ? dayjs(values?.starting_date).format('YYYY-MM-DD') : dayjs(values?.starting_date).format('YYYY-MM-DD'),
      sangama: dynamicTableData,
    };
    if (updateSangam) {
      EditSangam(newValue)
    } else {
      AddSangam(newValue);
    }
  };

  const onFinishFailed = () => {
    toast.warn("Please fill in all the required details !");
  };

  const onSubmit = () => {
    form.submit();
  };

  return (
    <Fragment>
      <CustomCardView>
        <Form
          name="AddField"
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
          <CustomRow space={[12, 12]}>
            <Col span={24} md={24}>
             {updateSangam ?<CustomPageTitle Heading={"Update Sangam Details"} />:<CustomPageTitle Heading={"Add Sangam Details"} />} 
            </Col>

            <Col span={24} md={12}>
              <CustomAddSelect
                label={"Sangam Name"}
                name={"sangam_name"}
                onChange={handleNameChange}
                options={SangamNameOptions}
                onButtonClick={SangamNameModal}
                rules={[
                  {
                    required: true,
                    message: "Please Select Sangam Name!",
                  },
                ]}
              />
              <CustomInput name={"name"} display={'none'} />
            </Col>

            <Col span={24} md={12} ></Col>

            <Col span={24} md={12}>
              <CustomDatePicker
                label={"Starting Date"}
                name={"starting_date"}
                onChange={handleStartingDate}
                rules={[
                  {
                    required: true,
                    message: "Please Select Starting Date !",
                  },
                ]}
              />
            </Col>

            <Col span={24} md={12}></Col>

            <Col span={24} md={12}>
              <CustomSelect
                label={"Sangam Head"}
                name={"head_name"}
                placeholder={"Choose Member"}
                onChange={handleHeadChange}
                options={memberoptions}
                rules={[
                  {
                    required: true,
                    message: "Please Select Sangam Head !",
                  },
                ]}
              />
              <CustomInput name={"head_member"} display={"none"} />
            </Col>
            <Col span={24} md={6} style={{ marginTop: "40px" }}>
              <CustomInput placeholder={"Member No"} name={"head_mem_no"} />
            </Col>
            <Col span={24} md={12}>
              <CustomSelect
                label={"Sangam Secretary"}
                placeholder={"Choose Member"}
                name={"secretry_name"}
                onChange={handleSecretryChange}
                options={memberoptions}
                rules={[
                  {
                    required: true,
                    message: "Please Select Starting Date !",
                  },
                ]}
              />
              <CustomInput name={"secretry_member"} display={"none"} />
            </Col>

            <Col span={24} md={6} style={{ marginTop: "40px" }}>
              <CustomInput placeholder={"Member No"} name={"secretry_mem_no"} />
            </Col>

            <Col span={24} md={12}>
              <CustomSelect
                label={"Sangam Treasure"}
                placeholder={"Choose Member"}
                name={"treasurey_name"}
                onChange={handleTreasureyChange}
                options={memberoptions}
                rules={[
                  {
                    required: true,
                    message: "Please Select Sangam Treasure !",
                  },
                ]}
              />
              <CustomInput name={"treasurey_member"} display={"none"} />
            </Col>

            <Col span={24} md={6} style={{ marginTop: "40px" }}>
              <CustomInput placeholder={"Member No"} name={"treasurey_mem_no"} />
            </Col>

            <Col span={24} md={12}>
              <CustomInputNumber
                label={"Opening Balance"}
                name={"opening_balance_amt"}
                rules={[
                  {
                    required: true,
                    message: "Please Select Opening Balance!",
                  },
                ]}
              />
            </Col>

            <Col span={24} md={12}></Col>
          </CustomRow>

        </Form>
        <AddSangamMembers SetDynamicTable={SetDynamicTable} />

        <Col span={24} md={24} style={{ marginTop: "25px" }}>
          <CustomTable columns={TableColumns} data={dynamicTableData}  />
        </Col>



        {/* <Flex center gap={"20px"} style={{ margin: "30px" }}>
          <Button.Danger text={"Submit"} onClick={onSubmit} />
          <Button.Success text={"Cancel"} onClick={onReset} />
        </Flex> */}

        <Flex gap={'20px'} center={"true"} margin={'20px 0'}>
          {updateSangam ? (
            <>
              <Button.Success text={"Update"} htmlType={"submit"} onClick={onSubmit} />
              <Button.Danger text={"Cancel"} onClick={() => FormExternalClosee()} />
            </>
          ) : (
            <>
              <Button.Danger text={"Submit"} htmlType={'submit'} onClick={onSubmit} />
              <Button.Success text={"Reset"} onClick={() => onReset()} />
            </>)}
        </Flex>

        <CustomModal
          isVisible={isModalOpen}
          handleOk={handleOk}
          handleCancel={handleCancel}
          width={modelwith}
          modalTitle={modalTitle}
          modalContent={modalContent}
        />
      </CustomCardView>

    </Fragment>
  );
};

export default AddSangamDetails;
