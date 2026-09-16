import React, { Fragment, useEffect, useRef, useState } from "react";
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
import { SvgIcons } from "@assets/Svg";
import { FaWhatsapp } from "react-icons/fa";
import { IoPrint } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  getFestival,
  getFestivalError,
  getFestivalStatus,
  selectFestivalDetails,
} from "../FestivalSlice";
import FestivalView from "../../Festival/Partials/FestivalView";
import CustomPopconfirm from "@components/others/CustomPopConfirm";
import request from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import { AddFestival } from "./AddFestival";
import { TableIconHolder } from "@components/common/Styled";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import Label from "@components/form/Label";
import { userRolesConfig } from "@router/config/roles";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";
import { useReactToPrint } from "react-to-print";
import styled from "styled-components";
import { CommonManagePrintName } from "@modules/ComManagePrintDetails/CommonManagePrint";

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

export const FestivalList = () => {

  const dispatch = useDispatch();
  const componentRef = useRef();
  const [dataSource, setDataSource] = useState([]);

  const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
  const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
  const FestivalListPermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

  const [trigger, setTrigger] = useState(0);
  const [searchTexts, setSearchTexts] = useState([]); //---------Seach Bar 1--------

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelwith, setModelwith] = useState(0);
  const [modalTitle, setModalTitle] = useState();
  const [modalContent, setModalContent] = useState(null);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    dispatch(getFestival());
  }, []);

  const closefestivel = () => {
    handleOk();
  };

  const AllFrstivalDetails = useSelector(selectFestivalDetails);
  const AllFestivalStatus = useSelector(getFestivalStatus);
  const AllFestivalError = useSelector(getFestivalError);

  useEffect(() => {
    setDataSource(AllFrstivalDetails);
  }, [AllFrstivalDetails]);

  const handleSearchs = (value) => {
    setSearchTexts(value);
  };

  const FestivallistView = (record) => {
    setModelwith(550);
    setTrigger(trigger + 1);
    // setModalTitle("festivallistview");
    setModalContent(<FestivalView viewfestivallist={record} />);
    showModal();
  };

  const Updatefestival = (record) => {
    setModelwith(700);
    setTrigger(trigger + 1);
    setModalContent(
      <AddFestival
        closee={closefestivel}
        updatefestivallist={record}
        festivaltrigger={trigger}
      />
    );
    showModal();
  };

  const DeleteFestival = async (record) => {
    await request
      .delete(`${APIURLS.DLETE_FESTIVAL}${record?.id}/`, record)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        dispatch(getFestival());
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const MemberTableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "date",
    },
    {
      title: "Festival No",
      dataIndex: "festival_no",
    },
    {
      title: "Festival Name",
      render: (text, record) => record.festival_name,
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record.festival_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.festival_name).includes(value.toUpperCase())
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
      title: "Per Head Amt",
      dataIndex: "tax_per_head",
    },
    {
      title: "Actions",
      render: (record, i) => {
        return (
          <Flex center={"true"} gap={"10px"}>
            {superUsers || role === userRolesConfig.ADMIN || FestivalListPermission?.Festival_list?.View ? (
              <Tooltip title="View">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => FestivallistView(record)}
                >
                  <img src={SvgIcons.Eye} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN || FestivalListPermission?.Festival_list?.Edit ? (
              <Tooltip title="Edit">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => Updatefestival(record)}
                >
                  <img src={SvgIcons.Edit} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN || FestivalListPermission?.Festival_list?.Delete ? (
              <CustomPopconfirm
                title="Confirmation"
                description="Are you sure you want to remove this Festival detail ?"
                okText="Yes"
                cancelText="No"
                confirm={() => DeleteFestival(record)}
              >
                <Tooltip title="Delete">
                  <img src={SvgIcons.Delete} style={{ cursor: "pointer" }} />
                </Tooltip>
              </CustomPopconfirm>
            ) : null}
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
      dataIndex: "date",
    },
    {
      title: "Festival No",
      dataIndex: "festival_no",
    },
    {
      title: "Festival Name",
      render: (text, record) => record.festival_name,
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record.festival_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.festival_name).includes(value.toUpperCase())
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
      title: "Per family",
      dataIndex: "tax_per_head",
    },
  ]

  let content;

  if (AllFestivalStatus === "loading") {
    content = <CommonLoading />;
  } else if (AllFestivalStatus === "succeeded") {
    const rowKey = (dataSource) => dataSource.id;
    content = (
      <CustomStandardTable
        columns={MemberTableColumn}
        data={dataSource}
        rowKey={rowKey}
      />
    );
  } else if (AllFestivalStatus === "failed") {
    content = <h2>{AllFestivalError} </h2>;
  }


  return (
    <Fragment>
      <CustomCardView>
        <CustomRow space={[24, 24]}>
          <Col span={24} md={12}>
            <CustomPageTitle Heading={"Festival List"} />
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
                Search by Festival Name :
              </Label>
              <CustomInput
                value={searchTexts}
                placeholder="Search"
                onChange={(e) => handleSearchs(e.target.value)}
              />
            </div>
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
      </CustomCardView>
      <PrintHolder ref={componentRef}>
        <PrintShowData className="PrintShowDatadd">
          <CommonManagePrintName />
          <h3 style={{ textAlign: 'center' }}>Festival Details</h3><br />
          <CustomStandardTable columns={TableColumnPrint} data={dataSource} pagination={false} />
        </PrintShowData>
      </PrintHolder>

      <CustomModal
        isVisible={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        width={modelwith}
        modalTitle={modalTitle}
        modalContent={modalContent}
      />
    </Fragment>
  );
};

export default FestivalList;
