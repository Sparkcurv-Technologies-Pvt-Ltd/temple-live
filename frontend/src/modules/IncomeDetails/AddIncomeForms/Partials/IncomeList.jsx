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
import { useDispatch, useSelector } from "react-redux";
import {
  getIncome,
  getIncomeError,
  getIncomeStatus,
  selectIncomeDetails,
} from "../../IncomeSlice";
import { AddIncomeForm } from "./AddIncome";
import CustomPopconfirm from "@components/others/CustomPopConfirm";
import request from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import { TableIconHolder } from "@components/common/Styled";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import { IncomeViews } from "./IncomeView";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";
import { userRolesConfig } from "@router/config/roles";
import { useReactToPrint } from "react-to-print";
import styled from "styled-components";
import { CommonManagePrintName } from "@modules/ComManagePrintDetails/CommonManagePrint";



const IncomeList = () => {

  const dispatch = useDispatch();
  const componentRef = useRef();

  const [dataSource, setDataSource] = useState([]);
  const [trigger, setTrigger] = useState(0);
  const [searchTexts, setSearchTexts] = useState([]); //---------Seach Bar 1--------
  const [search2Texts, setSearch2Texts] = useState([]); //---------Seach Bar 2--------
  const [filer, setFiler] = useState({});

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
    dispatch(getIncome());
  }, []);

  const AllIncome = useSelector(selectIncomeDetails);
  const IncomeStatus = useSelector(getIncomeStatus);
  const IncomeError = useSelector(getIncomeError);

  useEffect(() => {
    setDataSource(AllIncome);
  }, [AllIncome]);

  const EditIncome = (record) => {
    setModelwith(800);
    setTrigger(trigger + 1);
    // setModalTitle("Update Income Details");
    setModalContent(
      <AddIncomeForm
        FormExternalClose={FormExternalClose}
        updateIncome={record}
        incomeTrigger={trigger}
      />
    );
    showModal();
  };

  const DeleteIncome = async (data) => {
    await request
      .delete(`${APIURLS.DELETE_INCOME_DETAILS}${data?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        dispatch(getIncome());
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  const filteroption = [
    {
      label: "Income Category",
      value: "IncomeCategory",
    },
    {
      label: "Income Name",
      value: "IncomeName",
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
  const ViewincomeList = (record) => {
    setModelwith(500);
    setModalContent(<IncomeViews record={record} />);
    showModal();
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  
  const TableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Subcategory",
      dataIndex: "income_subcategory",
      width: 160,
    },
    {
      title: "Date",
      dataIndex: "date",
    },
    {
      title: "Income Category",
      dataIndex: "category_name",
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record.category_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.category_name).includes(value.toUpperCase())
        );
      },
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
      title: "Income Amount",
      dataIndex: "income_amt",
    },
    {
      title: "Action",
      render: (text, record, index) => {
        return (
          <Flex gap={"20px"} center={"true"}>
            {superUsers || role === userRolesConfig.ADMIN || IncomeListPermission?.Income?.View ? (
              <Tooltip title="View">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => ViewincomeList(record)}
                >
                  <img src={SvgIcons.Eye} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN || IncomeListPermission?.Income?.Edit ? (
              <Tooltip title="Edit">
                <TableIconHolder size={"28px"} onClick={() => EditIncome(record)}>
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
                confirm={() => DeleteIncome(record)}
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
      title: "Subcategory",
      dataIndex: "income_subcategory",
    },
    {
      title: "Date",
      dataIndex: "date",
    },
    {
      title: "Income Category",
      dataIndex: "category_name",
    },
    {
      title: "Income Name",
      dataIndex: "income_name",
    },
    {
      title: "Income Amount",
      dataIndex: "income_amt",
    },
  ]

  let content;

  if (IncomeStatus === "loading") {
    content = <CommonLoading />;
  } else if (IncomeStatus === "succeeded") {
    const rowKey = (dataSource) => dataSource.id;
    content = (
      <CustomStandardTable
        columns={TableColumn}
        data={dataSource}
        rowKey={rowKey}
      />
    );
  } else if (IncomeStatus === "failed") {
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
            <CustomPageTitle Heading={"Income List"} />
          </Col>
          <Col span={24} md={12}>
            <CustomRow space={[12, 12]}>
              <Col span={24} md={12}>
                <CustomSelect
                  name={"Select"}
                  placeholder={"Select"}
                  options={filteroption}
                  onChange={handleSelect}
                />
              </Col>
              <Col span={24} md={12}>
                {filer === "IncomeCategory" ? (
                  <CustomInput
                    value={searchTexts}
                    placeholder="Search Income Category"
                    // onSearch={handleSearchs}
                    onChange={(e) => handleSearchs(e.target.value)}
                  />
                ) : (
                  <CustomInput
                    value={search2Texts}
                    placeholder="Search Income Name"
                    // onSearch={handle2Search}
                    onChange={(e) => handle2Search(e.target.value)}
                  />
                )}
              </Col>
            </CustomRow>
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
            <h3 style={{ textAlign: 'center' }}>Income Details</h3><br />
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

export default IncomeList;


export const PrintHolder = styled.div`
    padding: 10px 15px;
    @media print{     
      .PrintShowDatadd {
        display: block;
        page-break-before: always;
        border: 1px solid;
      };
      margin: 50px;
      width:100%;
      margin:auto;
    }
`

export const PrintShowData = styled.div`
  display: none;
 
`