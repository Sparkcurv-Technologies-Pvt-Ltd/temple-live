import { Button, CustomDateRangePicker, CustomSelect } from "@components/form";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import { CustomModal, CustomRow, Flex } from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Filter, HeadingStyle, MoveSlider, PrintHolder, PrintShowData } from "@modules/Report/Style";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";
import { Col, Form, Spin } from "antd";
import dayjs from "dayjs";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { TbArrowsExchange } from "react-icons/tb";
import { toast } from "react-toastify";
import { BiFilterAlt } from "react-icons/bi";
import { IoPrint } from "react-icons/io5";
import { useReactToPrint } from "react-to-print";
import { getManagement, selectManagementDetails } from "@modules/Management/ManagementSlice";
import { useDispatch, useSelector } from "react-redux";
import { formatIndianNumber } from "@modules/Report/MemberBalanceReports/Partials/ViewMemberBalanceReports";

export const ViewFestivalReports = () => {

  const [form] = Form.useForm();
  const componentRef = useRef();
  const dispatch = useDispatch();
  const [isLoadspin, setIsLoadspin] = useState(false)
  const [isLoadspin2, setIsLoadspin2] = useState(false)
  const [dataSource, setDataSource] = useState([]);
  const [showdetailsON, setShowdetailsON] = useState(true);
  const [festivalShow, setFestivalShow] = useState(false);
  const [dateRange, setDateRange] = useState(false);
  const [rangeFilterDate, setRangeFilterDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [festivalData, setFestivalData] = useState([]);
  // ======  Modal Open ========
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalWidth, setModalWidth] = useState(0);
  // ======  Modal Title and Content ========
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState(null);

  // ----------  Form Reset UseState ---------
  const [formReset, setFormReset] = useState(0);

  // ===== Modal Functions Start =====

  const handleOk = () => {
    setIsModalOpen(false);
    FormRest();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    FormRest();
  };

  const FormRest = () => {
    setFormReset(formReset + 1);
  };
  //---------------- Management Details --------------------
  useEffect(() => {
    dispatch(getManagement());
  }, []);

  const AllManagementDetails = useSelector(selectManagementDetails);
  //================= Date filter Date range fn============

  const handleDateRangeChange = (date) => {
    setRangeFilterDate(date);
  };

  //---------------
  const SearchOptions = [
    { label: "Festival", value: "Festival" },
    { label: "Date Range", value: "Date Range" },
  ];

  //============ Festival options ============

  const FestivalOptions = festivalData?.map((fest) => ({
    label: fest?.festival_name,
    value: fest?.id,
  }));

  //=====================================================
  const PostSearchType = (values) => {
    request
      .post(`${APIURLS.CATEGORY_FILTER_REPORTS}`, values)
      .then(function (response) {
        setFestivalData(response.data);
      })
      .catch(function (error) {
        toast.error("Failed");
      });
  };

  const handleSearchChange = (value) => {
    form.resetFields(["range", "festival_name"]);
    setDataSource([]);

    if (value === "Festival") {
      setFestivalShow(true);
      setDateRange(false);

      const categoryValues = {
        category: value,
      };
      PostSearchType(categoryValues);
    } else if (value === "Date Range") {
      setDateRange(true);
      setFestivalShow(false);
    } else {
      setFestivalShow(false);
      setDateRange(false);
    }
  };

  const DateSearch = (values) => {
    setIsLoadspin2(true)
    request.post(`${APIURLS.TYPE_DATE_FILTER_REPORTS}`, values)
      .then(function (response) {
        setDataSource(response.data?.amount);
        if (response.data?.amount?.length) {
          toast.success(
            "Festival report filtered by date successfully retrieved."
          );
        } else {
          toast.warn("No festival report data found for the selected date !");
        }
        setIsLoadspin2(false)
      })
      .catch(function (error) {
        toast.error("Failed");
        setIsLoadspin2(false)
      });
  };

  const FestivalSearch = (values) => {
    setIsLoadspin(true)
    request.post(`${APIURLS.TYPE_LIST_FILTER_REPORTS}`, values)
      .then(function (response) {
        setDataSource(response.data?.amount);
        if (response.data?.amount?.length) {
          toast.success("Festival list filter reports successfully loaded.");
        } else {
          toast.warn("No data found for festival list filter reports !");
        }
        setIsLoadspin(false)
      })
      .catch(function (error) {
        toast.error("Failed");
        setIsLoadspin(false)
      });
  };

  const handleChange = () => {
    setShowdetailsON(true);
  };

  //==========Handle Print =================
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  //=================

  const onFinish = (values) => {
    const festiValues = {
      type: values?.festival_name,
      category: values?.category,
    };
    const DateRangeValues = {
      range: rangeFilterDate,
      category: "Festival",
    };

    if (festivalShow) {
      FestivalSearch(festiValues);
    } else {
      DateSearch(DateRangeValues);
    }
  };
  const onFinishFailed = (errorInfo) => {
    toast.warn("Please fill in all the required details !");
  };

  const columns = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (date) => {
        return date ? new Date(date).toLocaleDateString() : ""; // Convert date to local date format
      },
    },
    {
      title: "Festival No",
      dataIndex: "name_type_no",
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
      title: "Mobile No",
      dataIndex: "mobile_number",
    },
    {
      title: "Total Balance Amt",
      render:(record)=>{
        return <span> ₹ {formatIndianNumber(record?.total_bal_amt)}&nbsp;</span> 
       }
    },
  ];

  return (
    <Fragment>
      <Form
        form={form}
        labelCol={{
          span: 24,
        }}
        wrapperCol={{
          span: 24,
        }}
        initialValues={{
          from_date: dayjs(),
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <CustomRow space={[24, 24]}>
          <Col span={24} md={12}>
            <CustomPageTitle Heading={"Festival Unpaid Report"} />
          </Col>
          <Col span={24} md={12}>
            <Flex end={true}>
              <Button.Secondary text={"Print"} icon={<IoPrint />} onClick={handlePrint} />
            </Flex>
          </Col>
          <Col span={24} md={5}>
            <Filter onClick={handleChange}>
              <BiFilterAlt />
              &nbsp;&nbsp;Filter
            </Filter>
          </Col>
        </CustomRow>
        <MoveSlider showdetailsons={showdetailsON ? "true" : undefined}>
          <CustomRow
            space={[24, 24]}
            style={{ marginTop: "20px", flexWrap: "wrap" }}>
            <>
              <Col span={24} md={24} lg={6} style={{ marginTop: "10px" }}>
                <b>Choose Search Type</b>&nbsp;&nbsp;
              </Col>
              <Col span={24} md={24} lg={10}>
                <CustomSelect
                  options={SearchOptions}
                  name={"category"}
                  placeholder={"Please Select Search Type"}
                  onChange={handleSearchChange}
                  rules={[
                    { required: true, message: "Please Select a Search Type" },
                  ]}
                />
              </Col>
              <Col span={24} md={24}>
                {festivalShow && (
                  <>
                    <CustomRow space={[12, 24]}>
                      <Col span={24} md={24} lg={6}>
                        <b>Choose Festival Name</b>&nbsp;&nbsp;
                        <TbArrowsExchange />
                      </Col>

                      <Col span={24} md={24} lg={8}>
                        <CustomSelect
                          name={"festival_name"}
                          placeholder={"Please Select Festival Name"}
                          options={FestivalOptions}
                          rules={[
                            { required: true, message: "Please Select a Festival Name !" },
                          ]}
                        />
                      </Col>
                      <Col span={24} md={24} lg={6}>
                        <Flex aligncenter={true} style={{ marginTop: "-8px" }}>
                          {isLoadspin ? <Spin style={{ marginTop: '15px' }} /> :
                            <Button.Primary text={"Submit"} htmlType={"submit"} />
                          }
                        </Flex>
                      </Col>
                    </CustomRow>
                  </>
                )}

                {dateRange ? (
                  <CustomRow space={[12, 24]}>
                    <Col span={24} md={24} lg={6}>
                      <b>Choose Date Range</b>&nbsp;&nbsp;
                      <TbArrowsExchange />
                    </Col>

                    <Col span={24} md={24} lg={8}>
                      <CustomDateRangePicker
                        onChange={handleDateRangeChange}
                        name={"range"}
                        value={rangeFilterDate}
                        rules={[
                          {
                            required: true,
                            message: "Please Choose a Date Range !",
                          },
                        ]}
                      />
                    </Col>
                    <Col span={24} md={24} lg={4}>
                      <Flex aligncenter={true} style={{ marginTop: "-8px" }}>
                        {isLoadspin2 ? <Spin style={{ marginTop: '15px' }} /> :
                          <Button.Primary text={"Submit"} htmlType={"submit"} />
                        }
                      </Flex>
                    </Col>
                  </CustomRow>
                ) : null}
              </Col>
            </>
          </CustomRow>
        </MoveSlider>
      </Form>
      <PrintHolder ref={componentRef}>
        <PrintShowData className="PrintShowDatadd">
          <HeadingStyle>
            <h1>{AllManagementDetails?.temple_name}</h1>
            <h2>{AllManagementDetails?.address}</h2>
            <h3>Festival Unpaid Details</h3>
          </HeadingStyle>
          <CustomStandardTable columns={columns} data={dataSource} pagination={false} />
        </PrintShowData>
      </PrintHolder>
      <CustomStandardTable columns={columns} data={dataSource} />
      <CustomModal
        isVisible={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        width={modalWidth}
        modalTitle={modalTitle}
        modalContent={modalContent}
      />
    </Fragment>
  );
};
