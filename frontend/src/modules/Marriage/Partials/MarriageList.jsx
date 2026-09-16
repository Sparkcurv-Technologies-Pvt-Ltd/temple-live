import { SvgIcons } from "@assets/Svg";
import { Button, CustomInput, CustomSelect } from "@components/form";
import {
  CommonLoading,
  CustomCardView,
  CustomModal,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col, Tooltip } from "antd";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoPrint } from "react-icons/io5";
import { MarriagelistView } from "./marriagelistView";
import { useDispatch, useSelector } from "react-redux";
import {
  getMarriageStatus,
  getMarriagesError,
  getmarriageDetails,
  selectMarriageDetails,
} from "../MarriageSlice";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import CustomPopconfirm from "@components/others/CustomPopConfirm";
import { TableIconHolder } from "@components/common/Styled";
import Marriage from "./Marriage";
import request from "@request/request";
import errorHandler from "@request/errorHandler";
import successHandler from "@request/successHandler";
import { APIURLS } from "@request/apiUrls/urls";
import {
  selectAllPermissions,
  selectCurrentSuperUser,
  selectCurrentUserRole,
} from "@modules/Auth/authSlice";
import { userRolesConfig } from "@router/config/roles";
import { useReactToPrint } from "react-to-print";
import styled from "styled-components";
import { CommonManagePrintName } from "@modules/ComManagePrintDetails/CommonManagePrint";
import { toast } from "react-toastify";

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

const PrintShowData = styled.div`
  display: none;
`;

const MarriageList = () => {
  const dispatch = useDispatch();
  const componentRef = useRef();

  const [modelwith, setModelwith] = useState(0);
  const [modalTitle, setModalTitle] = useState();
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dataSource, setdataSource] = useState([]);
  const [trigger, setTrigger] = useState(0);

  const [filer, setFiler] = useState({});
  const [searchTexts, setSearchTexts] = useState([]); //---------Seach Bar 1--------
  const [search2Texts, setSearch2Texts] = useState([]); //---------Seach Bar 2--------

  const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
  const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
  const MarriageListPermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const FormExternalClose = () => {
    handleOk();
  };

  useEffect(() => {
    dispatch(getmarriageDetails());
  }, []);

  const AllFamilyDetails = useSelector(selectMarriageDetails);
  const AllFamilyDetailsstatus = useSelector(getMarriageStatus);
  const AllFamilyDetailsError = useSelector(getMarriagesError);

  useEffect(() => {
    setdataSource(AllFamilyDetails);
  }, [AllFamilyDetails]);

  const SelectOption = [
    {
      label: "Groom Name",
      value: "groomName",
    },
    {
      label: "Bride Name",
      value: "brideName",
    },
  ];

  const handleSearchs = (value) => {
    setSearchTexts(value);
  };

  const handle2Search = (value) => {
    setSearch2Texts(value);
  };

  const handleSelect = (value) => {
    setFiler(value);
    setSearchTexts([]);
    setSearch2Texts([]);
  };

  const MarriageList = (record) => {
    setModelwith(1000);
    setTrigger(trigger + 1);
    setModalContent(<MarriagelistView marriagelists={record} />);
    showModal();
  };

  const editMarriageList = (record) => {
    setModelwith(700);
    setTrigger(trigger + 1);
    setModalContent(
      <Marriage
        closee={FormExternalClose}
        updatelist={record}
        marriagetrigger={trigger}
      />
    );
    showModal();
  };

  const DeleteMarriageList = async (record) => {
    await request
      .delete(`${APIURLS.DELETE_MARRIAGE_DETAILS}${record?.id}/`, record)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        dispatch(getmarriageDetails());
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 302) {
          toast.error(error.response.data?.message)
        } else {
          errorHandler(error);
        }
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
      title: "Marriage No",
      dataIndex: "marriage_no",
    },
    {
      title: "Groom Name",
      render: (text, record) => record?.groom_name,
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record?.groom_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record?.groom_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Bride Name",
      render: (text, record) => record?.bride_name,
      filteredValue: search2Texts ? [search2Texts] : null,
      onFilter: (value, record) => {
        return (
          String(record?.bride_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record?.bride_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Marriage Date",
      dataIndex: "marriage_date",
    },
    {
      title: "Action",
      render: (text, record, index) => {
        return (
          <Flex gap={"20px"} center={"true"}>
            {/* <img src={SvgIcons.Eye} onClick={() => {MarriageList(record)}} />
                    <img src={SvgIcons.Edit} /> */}
            {superUsers ||
              role === userRolesConfig.ADMIN ||
              MarriageListPermission?.Marriage?.View ? (
              <Tooltip title="View">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => {
                    MarriageList(record);
                  }}
                >
                  <img src={SvgIcons.Eye} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {superUsers ||
              role === userRolesConfig.ADMIN ||
              MarriageListPermission?.Marriage?.Edit ? (
              <Tooltip title="Edit">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => {
                    editMarriageList(record);
                  }}
                >
                  <img src={SvgIcons.Edit} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {superUsers ||
              role === userRolesConfig.ADMIN ||
              MarriageListPermission?.Marriage?.Delete ? (
              <CustomPopconfirm
                title="Confirmation"
                description="Are you sure you want to remove this Marriage detail?"
                okText="Yes"
                cancelText="No"
                confirm={() => DeleteMarriageList(record)}
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
      title: "Marriage No",
      dataIndex: "marriage_no",
    },
    {
      title: "Groom Name",
      render: (text, record) => record?.groom_name,
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record?.groom_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record?.groom_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Bride Name",
      render: (text, record) => record?.bride_name,
      filteredValue: search2Texts ? [search2Texts] : null,
      onFilter: (value, record) => {
        return (
          String(record?.bride_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record?.bride_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Marriage Date",
      dataIndex: "marriage_date",
    },
  ];


  let content;

  if (AllFamilyDetailsstatus === "loading") {
    content = <CommonLoading />;
  } else if (AllFamilyDetailsstatus === "succeeded") {
    const rowKey = (dataSource) => dataSource.id;
    content = (
      <CustomStandardTable
        columns={TableColumn}
        data={dataSource}
        rowKey={rowKey}
      />
    );
  } else if (AllFamilyDetailsstatus === "failed") {
    content = <h2>{AllFamilyDetailsError} </h2>;
  }

  const rowKey = (dataSource) => dataSource?.id;

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <Fragment>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={8}>
            <CustomPageTitle Heading={"Marriage Detail List"} />
          </Col>
          <Col span={24} md={10}>
            <CustomSelect
              label={"Search by Groom & Bride Name :"}
              options={SelectOption}
              onChange={handleSelect}
            />
          </Col>
          <Col span={24} md={6}>
            {filer === "groomName" ? (
              <CustomInput
                value={searchTexts}
                placeholder="Groom Name"
                onChange={(e) => handleSearchs(e.target.value)}
              />
            ) : (
              <CustomInput
                value={search2Texts}
                placeholder="Bride Name"
                onChange={(e) => handle2Search(e.target.value)}
              />
            )}
          </Col>
          <Col span={24} md={24}>
            {content}
          </Col>
        </CustomRow>
        <Flex flexend={"right"} style={{ marginTop: "10px" }}>
          <a href="https://web.whatsapp.com/" target="blank">
            <Button.Primary text={"Share"} icon={<FaWhatsapp />} />
          </a>
          <Button.Secondary
            text={"Print"}
            icon={<IoPrint />}
            onClick={handlePrint}
          />
        </Flex>

        <PrintHolder ref={componentRef}>
          <PrintShowData className="PrintShowDatadd">
            <CommonManagePrintName />
            <h3 style={{ textAlign: "center" }}>Marriage Details</h3>
            <br />
            <CustomStandardTable
              columns={TableColumnPrint} data={dataSource}
              pagination={false} />
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
    </Fragment>
  );
};

export default MarriageList;
