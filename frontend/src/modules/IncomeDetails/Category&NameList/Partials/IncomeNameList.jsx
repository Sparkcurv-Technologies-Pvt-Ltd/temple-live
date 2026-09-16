import { SvgIcons } from "@assets/Svg";
import { Button, CustomInput } from "@components/form";
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
import { useDispatch, useSelector } from "react-redux";
import {
  getIncomeName,
  getIncomeNameStatus,
  selectIncomeNameDetails,
} from "../../IncomeSlice";
import CustomPopconfirm from "@components/others/CustomPopConfirm";
import request from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import { TableIconHolder } from "@components/common/Styled";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";
import { userRolesConfig } from "@router/config/roles";
import { useReactToPrint } from "react-to-print";
import styled from "styled-components";
import { AddIncomeNameModal } from "@modules/IncomeDetails/AddIncomeForms/Partials/AllIncomeModals";

const PrintHolder = styled.div`
    padding: 10px 15px;
    @media print{     
      .PrintShowDatadd {
        display: block;
        page-break-before: always;
      };
      margin: 50px;
      width:100%;
      margin:auto;
    }
`

const PrintShowData = styled.div`
  display: none;
`

const IncomeNameList = () => {

  const dispatch = useDispatch();
  const componentRef = useRef();

  const [dataSource, setDataSource] = useState([]);
  const [trigger, setTrigger] = useState(0);
  const [search2Texts, setSearch2Texts] = useState([]); //---------Seach Bar 2--------

  const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
  const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
  const IncomeListPermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

  // ======  Modal Open ========
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

  const FormExternalClose = () => {
    handleOk();
  };

  useEffect(() => {
    dispatch(getIncomeName());
  }, []);

  const AllIncomeNameDetails = useSelector(selectIncomeNameDetails);
  const IncomeNameDetails = useSelector(getIncomeNameStatus);

  useEffect(() => {
    setDataSource(AllIncomeNameDetails);
  }, [AllIncomeNameDetails]);

  const EditIncomeName = (record) => {
    setModelwith(500);
    setTrigger(trigger + 1);
    // setModalTitle("Update Income Details");
    setModalContent(
      <AddIncomeNameModal
        FormExternalClose={FormExternalClose}
        IncomeNameRecord={record}
        incomeNameTrigger={trigger}
        handleOk={handleOk}
      />
    );
    showModal();
  };

  const DeleteIncomeName = async (data) => {
    await request
      .delete(`${APIURLS.PUT_PATCH_INCOMEName}/${data?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        dispatch(getIncomeName());
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handle2Search = (value) => {
    setSearch2Texts(value);
  };


  const TableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Income Name",
      dataIndex: "income_name",
      filteredValue: search2Texts ? [search2Texts] : null,
      onFilter: (value, record) => {
        return (
          String(record.income_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.income_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Action",
      render: (text, record, index) => {
        return (
          <Flex gap={"20px"} center={"true"}>
            {superUsers || role === userRolesConfig.ADMIN || IncomeListPermission?.Income?.Edit ? (
              <Tooltip title="Edit">
                <TableIconHolder size={"28px"} onClick={() => EditIncomeName(record)}>
                  <img src={SvgIcons.Edit} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN || IncomeListPermission?.Income?.Delete ? (
              <CustomPopconfirm
                title="Confirmation"
                description="Are you sure you want to remove this income detail?"
                okText="Yes"
                cancelText="No"
                confirm={() => DeleteIncomeName(record)}
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
      title: "Income Name",
      dataIndex: "income_name",
    },
  ]

  let content;

  if (IncomeNameDetails === "loading") {
    content = <CommonLoading />;
  } else if (IncomeNameDetails === "succeeded") {
    const rowKey = (dataSource) => dataSource.id;
    content = (
      <CustomStandardTable
        columns={TableColumn}
        data={dataSource}
        rowKey={rowKey}
      />
    );
  } else if (IncomeNameDetails === "failed") {
    const rowKey = (dataSource) => dataSource.id;
    content = (
      <CustomStandardTable
        columns={TableColumn}
        data={dataSource}
        rowKey={rowKey}
      />
    );
  }

  return (
    <Fragment>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={12}>
            <CustomPageTitle Heading={"Income Name List"} />
          </Col>
              <Col span={24} md={12}>
              <Flex aligncenter={true} gap={"15px"}>
              <p>Filter By Income Name :&nbsp;</p>
                  <CustomInput
                    value={search2Texts}
                    placeholder="Search Income Name"
                    // onSearch={handle2Search}
                    onChange={(e) => handle2Search(e.target.value)}
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
            <h1 style={{ textAlign: 'center' }}>Income Name Details</h1><br />
            <CustomStandardTable columns={TableColumnPrint} data={dataSource} pagination={false} />
          </PrintShowData>
        </PrintHolder>

      </CustomCardView>
      <CustomModal isVisible={isModalOpen}
        handleOk={handleOk} handleCancel={handleCancel}
        width={modelwith} modalTitle={modalTitle}
        modalContent={modalContent} />
    </Fragment>
  );
};

export default IncomeNameList;
