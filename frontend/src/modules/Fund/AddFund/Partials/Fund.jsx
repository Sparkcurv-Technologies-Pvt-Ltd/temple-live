import {
  Button,
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
import { Col, Form, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { FundAddTable } from "./FundAddTable";
import { SvgIcons } from "@assets/Svg";
import { useDispatch, useSelector } from "react-redux";
import {
  getChooseFundGroup,
  getFundList,
  selectFundGroup,
} from "../../FundSlice";
import dayjs from "dayjs";
import {
  getMembersDetails,
  selectMemberDetails,
} from "@modules/FamilyDetails/FamilySlice";
import request from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import { toast } from "react-toastify";
import CustomPopconfirm from "@components/others/CustomPopConfirm";

export const Fund = ({ RecordData, CloseModal, FundTrigger }) => {

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [personType, setPersonType] = useState([]);
  const [fromDate, setFromDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [dynamicTableData, setDynamicTableData] = useState([]);

  const [fixedCount, setFixedCount] = useState(0);
  const [trigger, setTrigger] = useState(0);
  const [fixedCountData, setFixedCountData] = useState({});
  const [isloading, setIsloading] = useState(false);

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

  // ------ Table Record Data Place IN Form

  useEffect(() => {
    if (RecordData) {
      const FromDate = new Date(RecordData?.from_date);
      const toDate = new Date(RecordData?.to_date);
      const dateFormat = "YYYY/MM/DD";
      const MemberDOB = dayjs(FromDate).format(dateFormat);
      const TODateDOB = dayjs(toDate).format(dateFormat);

      form.setFieldsValue(RecordData);
      form.setFieldsValue({
        from_date: dayjs(MemberDOB, dateFormat),
        to_date: dayjs(TODateDOB, dateFormat),
        // member_photo: initialImageValue,
      });
      setFixedCountData(RecordData)
      setFixedCount(RecordData?.fixed_fund_count)
      form.setFieldsValue({ tax_per_head: RecordData?.per_head_collection_amount });
    }
  }, [RecordData, FundTrigger]);

  // ------ Table Record Data Place IN Form  ending.....

  useEffect(() => {
    dispatch(getChooseFundGroup());
    dispatch(getMembersDetails());
  }, []);

  useEffect(() => {
    if (RecordData?.fund_group) {
      const tableData = RecordData?.fund_group?.map((value, index) => ({
        ...value,
        key: index,
      }));
      setDynamicTableData(tableData);
    }
  }, [form, RecordData, FundTrigger]);

  const AllFundGroup = useSelector(selectFundGroup);
  const AllFamilyMember = useSelector(selectMemberDetails);


  const FundOptions = AllFundGroup?.map((item) => ({
    label: `${item?.fund_name}   (${item?.fund_type})`,
    value: item?.id,
  }));
  const handleFundChange = (value) => {
    const AllFundOptions = AllFundGroup?.find((item) => item?.id === value);

    setFromDate(AllFundOptions?.start_date);
    setToDate(AllFundOptions?.end_date);
    const startDate = dayjs(AllFundOptions.start_date);
    const toDate = dayjs(AllFundOptions.end_date);

    setFixedCountData(AllFundOptions);

    form.setFieldsValue({
      from_date: startDate,
      to_date: toDate,
      fund_name: AllFundOptions?.fund_name,
      fund: AllFundOptions?.id,
      fund_type: AllFundOptions?.fund_type,
      fixed_fund_count: AllFundOptions?.fund_count,
      month_count: AllFundOptions?.month_count,

    });

    form.resetFields(["fixed_fund_amount", "tax_per_head"])

    setDynamicTableData([]);

  };

  //head member
  const HeadOptions = AllFamilyMember?.map((item) => ({
    label: item?.member_name,
    value: item?.id,
  }));

  const handleHead = (value) => {
    const AllHeadOptions = AllFamilyMember?.find(
      (item) => item?.id === value
    );
    form.setFieldsValue({
      head_name: AllHeadOptions?.member_name,
      head_member_no: AllHeadOptions?.member_no,
    });
  };

  const handleSecretry = (value) => {
    const AllHeadOptions = AllFamilyMember?.find(
      (item) => item?.id === value
    );
    form.setFieldsValue({
      secretrary_name: AllHeadOptions?.member_name,
      secretrary_member_no: AllHeadOptions?.member_no,
    });
  };

  const handleTreasury = (value) => {
    const AllHeadOptions = AllFamilyMember?.find(
      (item) => item?.id === value
    );
    form.setFieldsValue({
      treasury_name: AllHeadOptions?.member_name,
      treasury_member_no: AllHeadOptions?.member_no,
    });
  };
  const handleFundFixedAmt = (value) => {
    const FundFixedAmt = parseFloat(value);
    const FundFixedCount = parseFloat(form.getFieldValue("fixed_fund_count"));
    const TaxPerAmt = Math.round((FundFixedAmt / FundFixedCount) * 100) / 100;

    form.setFieldsValue({ tax_per_head: TaxPerAmt || 0 });
  }
  const handleFixedFundCount = (e) => {
    setFixedCount(e)

    const FundFixedCount = parseFloat(e);
    const FundFixedAmt = parseFloat(form.getFieldValue("fixed_fund_amount"));
    const TaxPerAmt = Math.round((FundFixedAmt / FundFixedCount) * 100) / 100;

    form.setFieldsValue({ tax_per_head: TaxPerAmt || 0 });
    // form.resetFields(['tax_per_head'])
  }

  // ---------- SET VALUE TO DYNAMIC DATA ------

  const SetDynamicTable = (value) => {
    setDynamicTableData((prev) => {
      if (!Array.isArray(prev)) {
        return [{ ...value, key: 0 }];
      }
      const maxKey = Math.max(...prev.map((item) => item.key), 0);
      return [...prev, { ...value, key: maxKey + 1 }];
    });
  };

  const SetDynamicEditTable = (value) => {
    setDynamicTableData((prev) => {
      if (!Array.isArray(prev)) {
        return [{ ...value, key: 0 }];
      }

      const rowIndexToUpdate = dynamicTableData.findIndex(
        (item) => item.key === value.key
      );

      if (rowIndexToUpdate !== -1) {
        const updatedDynamicTable = [...prev];
        updatedDynamicTable[rowIndexToUpdate] = { ...value };
        return updatedDynamicTable;
      }
      const maxKey = Math.max(...prev.map((item) => item.key), 0);
      return [...prev, { ...value, key: maxKey + 1 }];
    });
    // }
  };

  const EditRow = (record) => {
    setTrigger(trigger + 1);
    setModelwith(800);
    setModalTitle("Edit Nominee");
    setModalContent(
      <FundAddTable
        EditNomineeRecord={record}
        FormExternalClose={FormExternalClose}
        trigger={trigger}
        SetDynamicEditTable={SetDynamicEditTable}
        fixedCount={fixedCount}
        fixedCountData={fixedCountData}
      />
    );
    showModal();
  };

  const RowRemove = (rowKey) => {
    const newArr = dynamicTableData?.filter(item => item.key !== rowKey);
    setDynamicTableData(newArr);

    const totalAmount = newArr.reduce((acc, item) => {
      return acc + item.total_amt;
    }, 0);
  };

  const onReset = () => {
    form.resetFields();
  };
  const AddFundDetails = async (data) => {
    setIsloading(true);
    await request
      .post(APIURLS.POST_FUND_DETAILS, data)
      .then(function (response) {
        if (response.status === 226) {
          toast.warn(response.data?.Message);
        }
        else {
          successHandler(response, {
            notifyOnSuccess: true,
            notifyOnFailed: true,
            msg: "success",
            type: "success",
          });

          setDynamicTableData([]);
          dispatch(getChooseFundGroup());
          form.resetFields();
        }
        setIsloading(false);
        return response.data;
      })
      .catch(function (error) {
        setIsloading(false);
        if (error.response.status === 400) {
          toast.error(error.response.data?.fund[0]);
        } else {
          return errorHandler(error);
        }
      });
  };

  const EditFundDetails = async (data) => {
    setIsloading(true)
    await request
      .put(`${APIURLS.EDIT_FUND_GROUP}/${RecordData?.id}/`, data)
      .then(function (response) {

        if (response.status === 226) {
          toast.warn(response.data?.Message);
        }
        else {
          successHandler(response, {
            notifyOnSuccess: true,
            notifyOnFailed: true,
            msg: "success",
            type: "info",
          });
          if (CloseModal) {
            CloseModal();
          }
          setDynamicTableData([]);
          dispatch(getFundList());
          dispatch(getChooseFundGroup());
          form.resetFields();
        }
        setIsloading(false);
        return response.data;
      })
      .catch(function (error) {
        setIsloading(false);
        if (error.response.status === 400) {
          toast.error(error.response.data?.fund[0]);
        } else {
          return errorHandler(error);
        }
      });
  };

  const onFinish = (data) => {
    // if (dynamicTableData?.length < 20) {
    //   toast.warn("Member Count Not less than 20!");
    //   return;
    // }

    if (fixedCountData?.fund_type === "Fund 21") {
      if (dynamicTableData?.length < 20) {
        toast.warn("The Number of Person must be not less than  20!");
        return;
      }
    }
    if (fixedCountData?.fund_type === "Fund 20") {
      if (dynamicTableData?.length < 19) {
        toast.warn("The Number of Person must be not less than  19!");
        return;
      }
    }
    if (fixedCountData?.fund_type === "Normal") {
      if (dynamicTableData?.length < data?.fixed_fund_count) {
        toast.warn("The Number of Person must be not less than fixed fund count!");
        return;
      }
    }
    const newValue = {
      ...data,
      from_date: fromDate,
      to_date: toDate,
      member_count: dynamicTableData.length,
      fund_group: dynamicTableData,
    };

    if (RecordData) {
      EditFundDetails(newValue);
    } else {
      AddFundDetails(newValue);
    }
  };

  const onFinishFailed = (errorInfo) => {
    toast.error("Please Fill the Details!");
  };


  const MemberTableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Member No",
      dataIndex: "member_no",
      render: (data) => {
        return data && data.length ? <p>{data}</p> : "-";
      }
    },
    {
      title: "Member Name",
      dataIndex: "member_name",
    },
    // {
    //   title: "Member Fund Count",
    //   dataIndex: "member_fund_count",
    // },
    {
      title: "Mobile Number",
      dataIndex: "mobile_no",
    },
    {
      title: "Email ID",
      dataIndex: "email",
      render:(data)=>{
        return data ? data :'--'
    }
    },
    {
      title: "Address",
      dataIndex: "address",
    },
    {
      title: "Action",
      render: (text, record, index) => {
        const rowKey = record.key;
        return (
          <Flex gap={"20px"} center={"true"}>
            <img
              src={SvgIcons.Edit}
              onClick={() => EditRow(record)}
              style={{ cursor: "pointer" }}
            />

            <CustomPopconfirm
              title="Confirmation"
              description="Are You Sure About Removing this group Detail ?"
              okText="Yes"
              cancelText="No"
              confirm={() => RowRemove(rowKey)}
            >
              <img src={SvgIcons.Remove} style={{ cursor: "pointer" }} />
            </CustomPopconfirm>
          </Flex>
        );
      },
    },
  ];

  return (
    <Form
      name="Fund"
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
      <CustomCardView>
        <CustomRow space={[24, 24]}>
          <Col span={24} md={24}>
            <CustomPageTitle Heading={"Funds"} />
          </Col>

          <Col span={24} md={12}>
            <CustomSelect
              label={"Choose Funds"}
              name={"fund_name"}
              options={FundOptions}
              onChange={handleFundChange}
              rules={[
                {
                  required: true,
                  message: "Please Enter Fund Name !",
                },
              ]}
            />
            <CustomInput name={"fund"} display={"none"} />
          </Col>

          <Col span={24} md={6}>
            <CustomDatePicker
              label={"From"}
              name={"from_date"}
              disabled={"true"}
              rules={[
                {
                  required: true,
                  message: "Please Select From Date !",
                },
              ]}
            />
          </Col>

          <Col span={24} md={6}>
            <CustomDatePicker
              label={"To"}
              name={"to_date"}
              disabled={"true"}
              rules={[
                {
                  required: true,
                  message: "Please Select To Date !",
                },
              ]}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomInput label={'Fund Type'} name={"fund_type"} disabled />
          </Col>
          <Col span={24} md={8}>
            <CustomSelect
              label={"Choose Head"}
              name={"head_member"}
              options={HeadOptions}
              onChange={handleHead}
              // rules={[
              //   {
              //     required: true,
              //     message: "Please Select a Head Name !",
              //   },
              // ]}
            />
            <CustomInput name={"head_name"} display={"none"} />
          </Col>

          <Col span={24} md={4}>
            <CustomInput
              label={"Member No"}
              name={"head_member_no"}
              placeholder={"Member No"}
              disabled={true}
            />
          </Col>
          <Col span={24} md={8}>
            <CustomSelect
              label={"Choose Secretary"}
              name={"secretrary_member"}
              options={HeadOptions}
              onChange={handleSecretry}
              // rules={[
              //   {
              //     required: true,
              //     message: "Please Select Secretary !",
              //   },
              // ]}
            />
            <CustomInput name={"secretrary_name"} display={'none'} />
          </Col>
          <Col span={24} md={4}>
            <CustomInput
              label={"Member No"}
              name={"secretrary_member_no"}
              placeholder={"Member No"}
              disabled={true}
            />
          </Col>
          <Col span={24} md={8}>
            <CustomSelect
              label={"Choose Treasury"}
              name={"treasury_member"}
              options={HeadOptions}
              onChange={handleTreasury}
              // rules={[
              //   {
              //     required: true,
              //     message: "Please Select Treasury !",
              //   },
              // ]}
            />
            <CustomInput name={"treasury_name"} display={"none"} />
          </Col>
          <Col span={24} md={4}>
            <CustomInput
              label={"Member No"}
              name={"treasury_member_no"}
              placeholder={"Member No"}
              disabled={true}
            />
          </Col>
          {fixedCountData?.fund_type !== "Normal" &&
            <Col span={24} md={12}>
              <CustomInputNumber
                label={"Month Count"}
                name={"month_count"}
                disabled={true}
              />
            </Col>}
          <Col span={24} md={12}>
            <CustomInputNumber
              label={"Fixed Fund Count"}
              name={"fixed_fund_count"}
              disabled={fixedCountData?.fund_type === "Normal" ? false : true}
              onChange={handleFixedFundCount}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomInputNumber
              label={"Fixed Fund Amount"}
              name={"fixed_fund_amount"}
              suffix={"₹"}
              disabled={RecordData && true}
              onChange={handleFundFixedAmt}
              rules={[
                {
                  required: true,
                  message: "Please Enter Fixed Fund Amount !",
                },
              ]}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomInput
              label={"Tax Per Head Amt"}
              name={"tax_per_head"}
              placeholder={"Tax Per Head Amt"}
              disabled={true}
            />
          </Col>
          <Col span={24} md={24}>
            <FundAddTable
              SetDynamicTable={SetDynamicTable}
              personType={personType}
              fixedCountData={fixedCountData}
              dynamicTableData={dynamicTableData}
              fixedCount={fixedCount}
            />
          </Col>
          <Col span={24} md={24}>
            <CustomTable columns={MemberTableColumn} data={dynamicTableData} />
          </Col>
        </CustomRow>

        {isloading ?
          <Flex center gap={'20px'} style={{ margin: '30px' }}><Spin /></Flex>
          : <>
            {RecordData ? (
              <Flex center={true} gap={"20px"} style={{ margin: "30px" }}>
                <Button.Danger text={"Update"} htmlType={"submit"} />
                <Button.Success text={"Cancel"} onClick={() => CloseModal()} />
              </Flex>
            ) : (
              <Flex center gap={"20px"} style={{ margin: "30px" }}>
                <Button.Danger text={"Submit"} htmlType={"submit"} />
                <Button.Success text={"Reset"} onClick={onReset} />
              </Flex>
            )}
          </>}
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