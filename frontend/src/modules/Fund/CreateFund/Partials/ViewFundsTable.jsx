import { SvgIcons } from "@assets/Svg";
import {
  Button,
  CustomInput,
} from "@components/form";
import {
  CommonLoading,
  CustomCardView,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoPrint } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  getCreatedFund,
  getCreatedFundError,
  getCreatedFundStatus,
  selectCreatedFundDetails,
} from "../../FundSlice";
import { APIURLS } from "@request/apiUrls/urls";
import CustomPopconfirm from "@components/others/CustomPopConfirm";
import successHandler from "@request/successHandler";
import request from "@request/request";
import errorHandler from "@request/errorHandler";
import { CustomModal } from "@components/others";
import FundsView from "./ViewFoundsmodal";
import { CreateFund } from "./CreateFund";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import { TableIconHolder } from "@components/common/Styled";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";
import { userRolesConfig } from "@router/config/roles";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import { PrintShowData, PrintHolder, CommonManagePrintName } from "@modules/ComManagePrintDetails/CommonManagePrint";
import dayjs from "dayjs";
import Label from "@components/form/Label";

const ViewFund = () => {

  const dispatch = useDispatch();

  const componentRef = useRef();

  const [dataSource, setDataSource] = useState([]);
  const [trigger, setTrigger] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelwith, setModelwith] = useState(0);
  const [modalTitle, setModalTitle] = useState();
  const [modalContent, setModalContent] = useState(null);

  const [searchTexts, setSearchTexts] = useState([]); //---------Seach Bar 1--------

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const close = () => {
    handleOk();
  };

  useEffect(() => {
    dispatch(getCreatedFund());
  }, []);

  const AllCreatedFundDetails = useSelector(selectCreatedFundDetails);
  const AllCreatedFundStatus = useSelector(getCreatedFundStatus);
  const AllCreatedFundError = useSelector(getCreatedFundError);

  const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
  const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
  const FundPermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

  useEffect(() => {
    setDataSource(AllCreatedFundDetails);
  }, [AllCreatedFundDetails]);

  const handleSearchs = (value) => {
    setSearchTexts(value);
  };

  const FundViews = (record) => {
    setModelwith(500);
    setModalTitle("Funds View");
    setModalContent(<FundsView closee={close} viewfundlist={record} />);
    showModal();
  };

  const Updatefund = (record) => {
    setModelwith(600);
    setTrigger(trigger + 1);
    setModalTitle("")
    setModalContent(
      <CreateFund
        closee={close}
        updatefundlist={record}
        fundtrigger={trigger}
      />
    );
    showModal();
  };

  const DeleteFunds = async (record) => {
    await request
      .delete(`${APIURLS.DELETE_FUND_DETAils}${record?.id}/`, record)
      .then(function (response) {
        if (response.status === 226) {
          toast.warn(response.data?.Message)
        }
        else {
          successHandler(response, {
            notifyOnSuccess: true,
            notifyOnFailed: true,
            msg: "success",
            type: "success",
          });
          dispatch(getCreatedFund());
        }
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  const TableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "date",
    },
    {
      title: "Fund Name",
      dataIndex: "fund_name",
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record.fund_name).toLowerCase().includes(value.toLowerCase()) ||
          String(record.fund_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
    },
    {
      title: "End Date",
      dataIndex: "end_date",
    },
    {
      title: "Fund Type",
      dataIndex: "fund_type",
    },
    {
      title: "Fund No",
      dataIndex: "fund_no",
    },
    {
      title: "Action",
      render: (text, record, index) => {
        return (
          <Flex gap={"20px"} center={"true"}>
            {superUsers || role === userRolesConfig.ADMIN || FundPermission?.Fund_list?.View ? (
              <Tooltip title="View">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => {
                    FundViews(record);
                  }}
                >
                  <img src={SvgIcons.Eye} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>) : null}
            {superUsers || role === userRolesConfig.ADMIN || FundPermission?.Fund_list?.Edit ? (
              <Tooltip title="Edit">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => {
                    Updatefund(record);
                  }}
                >
                  <img src={SvgIcons.Edit} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>) : null}
            {superUsers || role === userRolesConfig.ADMIN || FundPermission?.Fund_list?.Delete ? (
              <CustomPopconfirm
                title="Confirmation"
                description="Are You Sure About Removing This Asset Detail ?"
                okText="Yes"
                cancelText="No"
                confirm={() => DeleteFunds(record)}
              >
                <img src={SvgIcons.Delete} style={{ cursor: "pointer" }} />
              </CustomPopconfirm>) : null}
          </Flex>
        );
      },
    },
  ];

  let content;

  if (AllCreatedFundStatus === "loading") {
    content = <CommonLoading />;
  } else if (AllCreatedFundStatus === "succeeded") {
    const rowKey = (dataSource) => dataSource.id;
    content = (
      <CustomStandardTable
        columns={TableColumn}
        data={dataSource}
        rowKey={rowKey}
      />
    );
  } else if (AllCreatedFundStatus === "failed") {
    content = <h2>{AllCreatedFundError} </h2>;
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const TableColumnPrint = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "date",
    },
    {
      title: "Fund Name",
      dataIndex: "fund_name",
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
    },
    {
      title: "End Date",
      dataIndex: "end_date",
    },
    {
      title: "Fund Type",
      dataIndex: "fund_type",
    },
    {
      title: "Fund No",
      dataIndex: "fund_no",
    },
  ];

  const CurrentDate = dayjs().format('DD-MM-YYYY')

  return (
    <div>
      <CustomCardView>

        <CustomRow space={[12, 12]}>
          <Col span={24} md={24}>
            <CustomPageTitle Heading={"View Funds"} />
            <Flex end={true} aligncenter={true}>
              <Label>Search by Fund Name :&nbsp;</Label>
              <CustomInput
                value={searchTexts}
                placeholder="Search"
                onSearch={handleSearchs}
                onChange={(e) => handleSearchs(e.target.value)}
              />
            </Flex>
          </Col>
          <Col span={24} md={24}>
            {content}
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
            <h5 style={{ textAlign: 'end', marginRight: '20px' }}>Date :{CurrentDate} </h5><br />
            <h3 style={{ textAlign: 'center' }}>Create Fund Details</h3><br />
            <CustomStandardTable columns={TableColumnPrint} data={dataSource || []} pagination={false} />
          </PrintShowData>
        </PrintHolder>

      </CustomCardView>
      <CustomModal
        isVisible={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        width={modelwith}
        modalTitle={modalTitle}
        modalContent={modalContent}
      />
    </div>
  );
};

export default ViewFund;
