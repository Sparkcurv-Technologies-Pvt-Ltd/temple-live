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

export const ViewChitInterestReports = () => {

  const [form] = Form.useForm();
  const componentRef = useRef();
  const dispatch = useDispatch();
  const [isLoadspin, setIsLoadspin] = useState(false)
  const [isLoadspin2, setIsLoadspin2] = useState(false)
  const [dataSource, setDataSource] = useState([]);
  const [showdetailsON, setShowdetailsON] = useState(true);
  const [intShow, setIntShow] = useState(false);
  const [intCategory, setIntCategory] = useState(false)
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
  const [categoryValue, setCategoryValue] = useState([]);   //use Category value state
  const [typeValue, setTypeValue] = useState([]); // using type view for during print

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
  //----Type Options-----------
  const TypeOptions = [
    { label: "Chit fund Interest", value: "Chit fund Interest" },
    { label: "Management Interest", value: "Management Interest" },
    { label: "Date Range", value: "Date Range" },
  ];
  //---------------
  const SearchOptions = [
    { label: "Chit Interest", value: "Chit Interest" },
    { label: "Date Range", value: "Date Range" },
  ];

  //============ Interest options ============

  const categoryOption = [
    {
      label: 'Interest',
      value: 'Interest'
    },
    {
      label: 'Interest with capital',
      value: 'Interest with capital'
    },
    {
      label: 'Installment Interest',
      value: 'Installment Interest'
    }
  ]

  //============ Interest Type options ============

  const IntTypeOptions = [
    {
      label: 'Days',
      value: 'Days'
    },
    {
      label: 'Week',
      value: 'Week'
    },
    {
      label: 'Month',
      value: 'Month'
    }
  ]

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
    form.resetFields(["range", "category"]);
    setDataSource([]);
    setTypeValue(value)

    if (value === "Date Range") {
      setDateRange(true);
      setIntShow(false);

    }
    else {
      setIntShow(true);
      setDateRange(false);
    }
  }

  const handleCategory = (value) => {
    setCategoryValue(value)
    setDataSource([]);
    if (value === "Installment Interest") {
      setIntCategory(true);
    }
    else {
      setIntCategory(false);
    }
    form.resetFields(['interest_period'])
  }

  const handleIntPeriod = ()=>{
    setDataSource([]);
  }

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

  const InterestFilterSearch = (values) => {
    setIsLoadspin(true)
    request.post(`${APIURLS.INTEREST_MEMBER_BALANCE_REPORTS}`, values)
      .then(function (response) {
        setDataSource(response.data);
        if (response.data?.length) {
          toast.success("Interest filter reports successfully loaded.");
        } else {
          toast.warn("No data found for interest list filter reports !");
        }
        setIsLoadspin(false);
      })
      .catch(function (error) {
        toast.error("Failed");
        setIsLoadspin(false)
      });
  };

  const InterestInstallmentFilter = (values) => {
    setIsLoadspin(true)
    request.post(`${APIURLS.INTEREST_MEMBER_BALANCE_Installment_REPORTS}`, values)
      .then(function (response) {
        setDataSource(response.data);
        if (response.data?.length) {
          toast.success("Interest filter reports successfully loaded.");
        } else {
          toast.warn("No data found for interest list filter reports !");
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
    const intrestValues = {
      interest_type: values?.interest_type,
      category: values?.category,
    };
    const intrestInstallmentValues = {
      interest_type: values?.interest_type,
      category: values?.category,
      interest_period: values?.interest_period,
    };
    const DateRangeValues = {
      range: rangeFilterDate,
      category: "Festival",
    };
    if (categoryValue === "Installment Interest") {
      InterestInstallmentFilter(intrestInstallmentValues)
    }
    else {
      InterestFilterSearch(intrestValues);
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
    },
    {
      title: "Int No",
      dataIndex: "interest_no",
    },
    {
      title: "Member Name",
      dataIndex: "member_name",
    },
    {
      title: "Mobile No",
      dataIndex: "mobile_no",
    },
    {
      title: "Balance Amt",
      dataIndex: "balance_amt",
    },
    {
      title: "Penalty Balance Amt",
      dataIndex: "penalty_balance_amt",
    },
   categoryValue !== 'Installment Interest' && {
      title: "Interest Balance Amt",
      dataIndex: "intrest_balance_amt",
    },
   
  ].filter(Boolean);

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
            <CustomPageTitle Heading={"Interest Unpaid Report"} />
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
                <b>Choose </b>&nbsp;&nbsp;
              </Col>
              <Col span={24} md={24} lg={10}>
                <CustomSelect
                  options={TypeOptions}
                  name={"interest_type"}
                  placeholder={"Choose .."}
                  onChange={handleSearchChange}
                  rules={[
                    { required: true, message: "This is required field!" },
                  ]}
                />
              </Col>
              <Col span={24} md={24}>
                {intShow && (
                  <>
                    <CustomRow space={[12, 24]}>
                      <Col span={24} md={24} lg={6}>
                        <b>Choose Category Name</b>&nbsp;&nbsp;
                        <TbArrowsExchange />
                      </Col>

                      <Col span={24} md={24} lg={intCategory ? 6 : 8}>
                        <CustomSelect
                          name={"category"}
                          placeholder={"Select Category "}
                          options={categoryOption}
                          onChange={handleCategory}
                          rules={[
                            { required: true, message: "Please Select a Interest Category !" },
                          ]}
                        />
                      </Col>
                      {intCategory &&
                        <Col span={24} md={24} lg={4}>
                          <CustomSelect
                            name={"interest_period"}
                            placeholder={"Period"}
                            options={IntTypeOptions}
                            onChange={handleIntPeriod}
                            //   onChange={handleCategory}
                            rules={[
                              { required: true, message: "Please Select a Interest Type !" },
                            ]}
                          />
                        </Col>}
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
            <h3>Interest Unpaid Details</h3>
          </HeadingStyle>
          <CustomRow space={[12, 24]}>
            <Col span={24} md={12}>
              <h3>Type &nbsp;:&nbsp;<span style={{ color: '#545454' }}>{typeValue}</span> </h3><br />
              <h3>Category &nbsp;:&nbsp;<span style={{ color: '#545454' }}>{categoryValue}</span> </h3>
            </Col>
            <Col span={24} md={12}>
            </Col>
          </CustomRow><br />
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
