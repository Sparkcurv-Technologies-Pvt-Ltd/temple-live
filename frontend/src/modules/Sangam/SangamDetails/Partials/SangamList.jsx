import { SvgIcons } from "@assets/Svg";
import {
  Button,
  CustomInput,
} from "@components/form";
import {
  CommonLoading,
  CustomCardView,
  CustomModal,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoPrint } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { getSangamDetails, getSangamDetailsStatus, selectSangamDetails } from "../SangamSlice";
import AddSangamDetails from "./AddSangamDetails";
import request from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import CustomPopconfirm from "@components/others/CustomPopConfirm";
import { SangamlistView } from "./SangamlistView";
import { TableIconHolder } from "@components/common/Styled";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import Label from "@components/form/Label";
import { useReactToPrint } from "react-to-print";
import styled from "styled-components";
import { CommonManagePrintName } from "@modules/ComManagePrintDetails/CommonManagePrint";
import dayjs from "dayjs";
import { userRolesConfig } from "@router/config/roles";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";

const PrintHolder = styled.div`
  padding: 10px 15px;
  @media print {
    .PrintShowDatadd {
      display: block;
      page-break-before: always;
      border: 1px solid;
    }
    margin: 50px;
    width: 100%;
    margin: auto;
  }
`;

const SangamList = () => {

  const dispatch = useDispatch();
  const componentRef = useRef();
  const [trigger, setTrigger] = useState(0);
  const [dataSource, setDataSource] = useState([]);

  // ======  Modal Open ========
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

  const handleSearchs = (value) => {
    setSearchTexts(value);
  };

  const FormExternalClose = () => {
    handleOk();
  };

  useEffect(() => {
    dispatch(getSangamDetails());
  }, []);

  const AllSangamDetails = useSelector(selectSangamDetails);
  const AllSangamstatus = useSelector(getSangamDetailsStatus);

  const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
  const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
  const SangamPermissions = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

  useEffect(() => {
    setDataSource(AllSangamDetails);
  }, [AllSangamDetails]);

  const filteroption = [
    {
      label: "Sangam Name",
      value: "sangamName",
    },
    {
      label: "Date",
      value: "date",
    },
  ];

  const EditSangamDetails = (record) => {
    setModelwith(800);
    setTrigger(trigger + 1);
    // setModalTitle("Update Sangam Details");
    setModalContent(
      <AddSangamDetails
        FormExternalClosee={FormExternalClose}
        updateSangam={record}
        sangamTrigger={trigger}
      />
    );
    showModal();
  };

  const DeleteSangam = async (data) => {
    await request
      .delete(`${APIURLS.DELETE_SANGAM_DETAILS}${data?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        dispatch(getSangamDetails());
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
      title: "Sangam Name",
      render: (text, record) => record?.name,
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record?.name).toLowerCase().includes(value.toLowerCase()) ||
          String(record?.name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Sangam Start Date",
      dataIndex: "starting_date",
    },
    {
      title: "Opening Balance",
      dataIndex: "opening_balance_amt",
    },
    {
      title: "Action",
      render: (text, record, index) => {
        return (
          <Flex gap={"20px"} center={"true"}>
             {superUsers ||
                            role === userRolesConfig.ADMIN ||
                            SangamPermissions?.Sangam?.View ? (
            <Tooltip title="View">
              <TableIconHolder
                size={"28px"}
                onClick={() => ViewsangamList(record)}
              >
                <img src={SvgIcons.Eye} style={{cursor:'pointer'}} />
              </TableIconHolder>
            </Tooltip>):null}
            {superUsers ||
                            role === userRolesConfig.ADMIN ||
                            SangamPermissions?.Sangam?.Edit ? (
            <Tooltip title="Edit">
              <TableIconHolder
                size={"28px"}
                onClick={() => EditSangamDetails(record)}
              >
                <img src={SvgIcons.Edit} style={{cursor:'pointer'}}/>
              </TableIconHolder>
            </Tooltip>):null}

            {superUsers ||
                            role === userRolesConfig.ADMIN ||
                            SangamPermissions?.Sangam?.Delete ? (
            <CustomPopconfirm
              title="Confirmation"
              description="Are you sure about removing this Sangam detail?"
              okText="Yes"
              cancelText="No"
              confirm={() => DeleteSangam(record)}
            >
              <img src={SvgIcons.Delete} style={{cursor:'pointer'}}/>
            </CustomPopconfirm>):null}
          </Flex>
        );
      },
    },
  ];

  let content;

  if (AllSangamstatus === 'loading') {
    content = <CommonLoading />
  } else if (AllSangamstatus === 'succeeded') {
    const rowKey = (dataSource) => dataSource.id;
    content = <CustomStandardTable columns={TableColumn} data={dataSource} rowKey={rowKey} />
  } else if (AllSangamstatus === 'failed') {
    const rowKey = (dataSource) => dataSource.id;
    content = <CustomStandardTable columns={TableColumn} data={dataSource} rowKey={rowKey} />
  }

  const TableColumnPrint = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Sangam Name",
      render: (text, record) => record?.name,
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record?.name).toLowerCase().includes(value.toLowerCase()) ||
          String(record?.name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Sangam Start Date",
      dataIndex: "starting_date",
    },
    {
      title: "Opening Balance",
      dataIndex: "opening_balance_amt",
    },
  ];


  const ViewsangamList = (record) => {
    setModelwith(800);
    setModalContent(<SangamlistView record={record} />);
    showModal();
  };

  const currentDate = dayjs().format('YYYY-MM-DD');

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={12}>
            <CustomPageTitle Heading={"Sangam List"} />
          </Col>
          <Col span={24} md={12}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              <Label style={{ marginRight: "20px" }}>
                Search by Sangam Name :
              </Label>
              <CustomInput
                value={searchTexts}
                placeholder="Search"
                onChange={(e) => handleSearchs(e.target.value)}
              />
            </div>
          </Col>
          <Col span={24} md={24}>

            <PrintHolder ref={componentRef}>
              <PrintShowData className="PrintShowDatadd">
                <CommonManagePrintName />
                <h3 style={{ textAlign: 'center' }}>Sangam List</h3><br />
                <Flex spacebetween={true} aligncenter={true}>
                  <div style={{ margin: '0 10px' }}></div>
                  <div>
                    <h5 style={{ marginRight: '10px' }}><span>Print Date</span> : {currentDate} </h5>
                  </div>
                </Flex>
                <CustomStandardTable columns={TableColumnPrint} data={dataSource} pagination={false} />
              </PrintShowData>
            </PrintHolder>
            {content}
          </Col>
        </CustomRow>
        <Flex flexend={"right"} style={{ marginTop: "10px" }}>
          <a href="https://web.whatsapp.com/" target="blank">
            <Button.Primary text={"Share"} icon={<FaWhatsapp />} />
          </a>
          <Button.Secondary text={"Print"} icon={<IoPrint />} onClick={handlePrint} />
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
    </div>
  );
};

export default SangamList;



const PrintShowData = styled.div`
  display: none;
`