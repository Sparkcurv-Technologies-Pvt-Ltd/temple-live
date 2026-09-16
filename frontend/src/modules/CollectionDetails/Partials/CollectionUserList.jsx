import React, { Fragment, useEffect, useRef, useState } from "react";
import { SvgIcons } from "@assets/Svg";
import { Button, CustomDateRangePicker, CustomSelect } from "@components/form";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import {
  CommonLoading,
  CustomCardView,
  CustomModal,
  CustomPopConfirm,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col, Form, Tabs, Tooltip } from "antd";
import {
  getCollectionList,
  getCollectionListError,
  getCollectionListStatus,
  getCollectionUserBased,
  getCollectionUserBasedError,
  getCollectionUserBasedStatus,
  getCollectionUserList,
  selectCollectionListDetails,
  selectCollectionUserBasedDetails,
  selectUserlistDetails,
} from "../CollectionDetailsSlice";
import { useDispatch, useSelector } from "react-redux";
import { MdLocalPrintshop } from "react-icons/md";
import CollectionViewDetails from "./CollectionView";
import ViewCollectionPrint from "./ViewCollectionPrint";
import Bill from "@modules/Bill/Bill";
import request from "@request/request";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import { APIURLS } from "@request/apiUrls/urls";
import { FaWhatsapp } from "react-icons/fa";
import { IoPrint } from "react-icons/io5";
import dayjs from "dayjs";
import {
  selectCurrentSuperUser,
  selectCurrentUserRole,
} from "@modules/Auth/authSlice";
import { userRolesConfig } from "@router/config/roles";
import styled from "styled-components";
import { useReactToPrint } from "react-to-print";
import { CommonManagePrintName } from "@modules/ComManagePrintDetails/CommonManagePrint";
import { toast } from "react-toastify";

const PrintHolder = styled.div`
    padding: 10px 15px;
    @media print{     
      .PrintShowDatadd {
        display: block;
        page-break-before: always;
        border: 1px solid;
      }
      margin: 50px;
      width:100%;
      margin:auto;
    }
`

const PrintShowData = styled.div`
  display: none;
`

export const CollectionUserList = () => {

  const [form] = Form.useForm();
  const componentRef = useRef();
  const dispatch = useDispatch();

  const [dataSource, setDataSource] = useState([]);
  const [width, setWidth] = useState(0);
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [datePick, setDatePick] = useState(dayjs().format("YYYY-MM-DD"));
  const ResetTrigger = () => {
    form.resetFields();
  };

  const CHIT_CATEGORIES = ['Chit Interest', 'Chit Fund'];
  const chitData  = dataSource.filter(r => CHIT_CATEGORIES.includes(r.collection_category));
  const otherData = dataSource.filter(r => !CHIT_CATEGORIES.includes(r.collection_category));

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    ResetTrigger();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    dispatch(getCollectionList());
    dispatch(getCollectionUserBased());
    dispatch(getCollectionUserList());
  }, []);
  //------------ Collection List---------------

  const AllCollectionDetails = useSelector(selectCollectionListDetails);
  const AllCollectionsStatus = useSelector(getCollectionListStatus);
  const AllCollectionsError = useSelector(getCollectionListError);

  //------------ Collection User based List---------

  const AllCollectionUserbasedDetails = useSelector(selectCollectionUserBasedDetails);
  const AllCollectionUserbasedsStatus = useSelector(getCollectionUserBasedStatus);
  const AllCollectionUserbasedsError = useSelector(getCollectionUserBasedError);

  //--------------------- user List Details--------------------
  const AllUserlistDetails = useSelector(selectUserlistDetails);

  const role = useSelector(selectCurrentUserRole); // Role
  const superUsers = useSelector(selectCurrentSuperUser); // SuperUser

  useEffect(() => {
    if (role === userRolesConfig.ADMIN) {
      setDataSource(AllCollectionDetails);
    } else {
      setDataSource(AllCollectionUserbasedDetails);
    }
  }, [AllCollectionDetails, AllCollectionUserbasedDetails]);
  //-------------------- User Options -------------------------------------//
  const uselist = AllUserlistDetails?.user?.map((items) => ({
    label: items?.name,
    value: items?.id,
  }));
  //------------ Date range Filter onChange------------------------
  const handleDatepicker = (value) => {
    setDatePick(value);
  };
  //---------------------------
  const ViewPrintModal = (record) => {
    setWidth(500);
    // Collection HISTORY → View → Print. Use ViewCollectionPrint so the
    // WhatsApp "Share Statement" button attached inside sends the FULL
    // 1-year balance sheet (not the receipt-only mode used by `Bill` when
    // adding a fresh collection).
    setModalContent(<ViewCollectionPrint CollectionRecord={record} />);
    showModal();
  };

  const ViewCollectionListModal = (record) => {
    setWidth(700);
    setModalContent(<CollectionViewDetails CollectionRecord={record} />);
    showModal();
  };

  const DeleteCollectionList = async (data) => {
    await request
      .delete(`${APIURLS.COLLECTION_EDIT_DELETE}/${data?.id}/`, data)
      .then(function (response) {
        if (response.status === 226) {
          toast.warn(response.data?.msg)
        } else {
          successHandler(response, {
            notifyOnSuccess: true,
            notifyOnFailed: true,
            msg: "success",
            type: "success",
          });
          dispatch(getCollectionList());
          dispatch(getCollectionUserBased());
          dispatch(getCollectionUserList());
        }
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  const CollectionDate = async (data) => {
    setLoading(true);
    await request
      .post(APIURLS.COLLECTION_USER_DATE, data)
      .then(function (response) {
        // form.resetFields();
        // setRangeType([]);
        setDataSource(response.data);

        if (response.data?.length) {
          toast.success(
            "Collection Details filtered by date successfully retrieved."
          );
        } else {
          toast.warn(
            "No Collection Details data found for the selected date !"
          );
        }
        setLoading(false);
        return response.data;
      })
      .catch(function (error) {
        setLoading(false);
        return errorHandler(error);
      });
  };

  const CollectionUserbasedDate = async (data) => {
    setLoading(true);
    await request
      .post(APIURLS.COLLECTION_USERBASED_DETAILS, data)
      .then(function (response) {
        // form.resetFields();
        // setRangeType([]);
        setDataSource(response.data);
        if (response.data?.length) {
          toast.success(
            "Collection Details filtered by date successfully retrieved."
          );
        } else {
          toast.warn(
            "No Collection Details data found for the selected date !"
          );
        }
        setLoading(false);
        return response.data;
      })
      .catch(function (error) {
        setLoading(false);
        return errorHandler(error);
      });
  };

  const onFinish = (value) => {
    const result = { ...value, datePick };
    let NewValue = {
      user_id: result?.user_id,
      range: {
        start_date: result?.datePick?.start_date,
        end_date: result?.datePick?.end_date,
      },
    };
    if (superUsers || role === userRolesConfig.ADMIN) {
      CollectionDate(NewValue);
    }
    else {
      CollectionUserbasedDate(NewValue);
    }
    // console.log(NewValue, "submitvalue");
  };


  const TableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "pay_date",
    },
    {
      title: "Collection No",
      dataIndex: "collaction_no",
      render: (text) => {
        return (
          <p style={{ color: 'blue' }}>{text}</p>
        );
      }
    },
    {
      title: "Category",
      dataIndex: "collection_category",
      render: (text) => {
        return (
          <p style={{ color: '#d18b0a' }}>{text}</p>
        );
      }
    },
    {
      title: "Person Name",
      dataIndex: "member_name",
    },
    {
      title: "Mobile",
      dataIndex: "mobile_number",
      render: (text) => {
        return (
          <p style={{ textAlign: 'center' }}>{text !== null ? text : '_'}</p>
        );
      }
    },
    {
      title: "Amount",
      render: (text) => {
        const Amount = parseFloat(text?.amount) || 0;
        const InterestAmt = parseFloat(text?.interst_amount) || 0;

        // Collection amounts must always be shown as positive – a negative
        // value here is a data anomaly (e.g. from a reversal script) and
        // showing a "-500" for a valid collection confuses operators.
        const TotalAmount = Math.abs(Amount + InterestAmt);
        return (
          <p style={{ color: 'green' }} data-testid="collection-row-amount">₹&nbsp;{TotalAmount}</p>
        );
      }
    },
    {
      title: "Action",
      render: (text, record, index) => {
        return (
          <Flex gap={"20px"} >
            <Tooltip title={"View"}>
              <img
                src={SvgIcons.Eye}
                onClick={() => ViewCollectionListModal(record)}
                style={{ cursor: "pointer" }}
              />
            </Tooltip>
            <Tooltip title={"Print"}>
              <MdLocalPrintshop
                text={"Print"}
                size={28}
                style={{ cursor: "pointer" }}
                onClick={() => ViewPrintModal(record)}
              />
            </Tooltip>
            {(role !== userRolesConfig.USER && record?.collection_category !== "Balance") &&
              <CustomPopConfirm
                title="confirmation"
                description="Are you sure about removing this CollectionList!"
                okText="Yes"
                cancelText="No"
                confirm={() => DeleteCollectionList(record)}
              >
                <Tooltip title={"Delete"}>
                  <img src={SvgIcons.Delete} style={{ cursor: "pointer" }} />
                </Tooltip>
              </CustomPopConfirm>}
          </Flex>
        );
      },
    },
  ];

  const TableColumnPrint = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "pay_date",
    },
    {
      title: "Collection No",
      dataIndex: "collaction_no",
    },
    {
      title: "Category",
      dataIndex: "collection_category",
    },
    {
      title: "Person Name",
      dataIndex: "member_name",
    },
    {
      title: "Mobile",
      dataIndex: "mobile_number",
      render: (text) => {
        return (
          <p style={{ textAlign: 'center' }}>{text !== null ? text : '_'}</p>
        );
      }
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (text) => {
        return (
          <p>₹&nbsp;{text}</p>
        );
      }
    },
  ];

  let content;
  if (AllCollectionsStatus === "loading") {
    content = <CommonLoading />;
  } else if (AllCollectionsStatus === "succeeded") {
    const rowKey = (record) => record.id;
    content = (
      <CustomStandardTable
        columns={TableColumn}
        data={dataSource}
        rowKey={rowKey}
      />
    );
  } else if (AllCollectionsStatus === "failed") {
    content = <h2>{AllCollectionsError} </h2>;
  }

  let content1;
  if (AllCollectionUserbasedsStatus === "loading") {
    content1 = <CommonLoading />;
  } else if (AllCollectionUserbasedsStatus === "succeeded") {
    const rowKey = (record) => record.id;
    content1 = (
      <CustomStandardTable
        columns={TableColumn}
        data={dataSource}
        rowKey={rowKey}
      />
    );
  } else if (AllCollectionUserbasedsStatus === "failed") {
    content1 = <h2>{AllCollectionUserbasedsError} </h2>;
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <Fragment>
      <CustomCardView>
        <CustomRow space={[12, 24]}>
          <Col span={24} md={24}>
            <CustomPageTitle Heading={"Collection History"} />
          </Col>
        </CustomRow>
        <Form form={form} labelCol={{
          span: 24,
        }}
          wrapperCol={{
            span: 24,
          }} onFinish={onFinish}>
          <CustomRow space={[12, 24]}>
            {superUsers || role === userRolesConfig.ADMIN ? (
              <Col span={24} md={8}>
                <CustomSelect label={'Users'} name={"user_id"} options={uselist || []} placeholder={'Select'}
                  rules={[
                    { required: true, message: "Please Select a User !" },
                  ]}
                />
              </Col>
            ) : null}
            <Col span={24} md={10}>
              <CustomDateRangePicker label={'Choose From To Date'} name={"range"} onChange={handleDatepicker}
              // rules={[
              //   {
              //     required: true,
              //     message: "Please choose a 'From' and 'To' date!",
              //   },
              // ]}
              />
            </Col>
            <Col span={24} md={4}>
              <Flex gap={"10px"} style={{ margin: '27px' }}>
                <Button.Danger type="danger" htmlType={"submit"} text={"Submit"} loading={loading} />
              </Flex>
            </Col>
          </CustomRow>
        </Form>
        <CustomRow>
          <Col span={24} md={24}>
            <Tabs
              defaultActiveKey="other"
              items={[
                {
                  key: 'other',
                  label: 'Collection',
                  children: (
                    <CustomStandardTable
                      columns={TableColumn}
                      data={otherData}
                      rowKey={(record) => record.id}
                    />
                  ),
                },
                {
                  key: 'chit',
                  label: 'Chit Fund Collection',
                  children: (
                    <CustomStandardTable
                      columns={TableColumn}
                      data={chitData}
                      rowKey={(record) => record.id}
                    />
                  ),
                },
              ]}
            />
          </Col>
        </CustomRow>

        <Flex flexend={"right"} style={{ marginTop: "10px" }}>
          <a href="https://web.whatsapp.com/" target="blank">
            <Button.Primary text={"Share"} icon={<FaWhatsapp />} />
          </a>
          <Button.Secondary text={"Print"} icon={<IoPrint />} onClick={handlePrint} />
        </Flex>

        <PrintHolder ref={componentRef}>
          <PrintShowData className="PrintShowDatadd">
            <CommonManagePrintName />
            <h3 style={{ textAlign: 'center' }}>Collection List Details</h3><br />
            <CustomStandardTable columns={TableColumnPrint} data={dataSource} pagination={false} />
          </PrintShowData>
        </PrintHolder>
      </CustomCardView>

      <CustomModal
        isVisible={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        width={width}
        // modalTitle={modalTitle}
        modalContent={modalContent}
      />
    </Fragment>
  );
};
