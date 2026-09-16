import { SvgIcons } from "@assets/Svg";
import {
  Button,
  CustomInput,
  CustomSelect,
  CustomTable,
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
import React, { Fragment, useRef, useState } from "react";
import { useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoPrint } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  getExpense,
  getExpenseError,
  getExpenseStatus,
  selectExpenseDetails,
} from "@modules/ExpenseDetails/ExpenseSlice";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import { TableIconHolder } from "@components/common/Styled";
import { AddExpenseForm } from "@modules/ExpenseDetails/AddExpense/Partials/AddExpense";
import CustomPopconfirm from "@components/others/CustomPopConfirm";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import ViewExpensePage from "@modules/ExpenseDetails/AddExpense/Partials/ViewExpensePage";
import { toast } from "react-toastify";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";
import { userRolesConfig } from "@router/config/roles";
import styled from "styled-components";
import { useReactToPrint } from "react-to-print";
import { CommonManagePrintName } from "@modules/ComManagePrintDetails/CommonManagePrint";

const PrintHolder = styled.div`
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

const PrintShowData = styled.div`
  display: none;
`

const ExpenseList = () => {

  const dispatch = useDispatch();
  const componentRef = useRef();
  const [trigger, setTrigger] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [searchTexts, setSearchTexts] = useState([]); //---------Seach Bar 1--------
  const [search2Texts, setSearch2Texts] = useState([]); //---------Seach Bar 2--------
  const [filer, setFiler] = useState({});

  const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
  const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
  const ExpenseListPermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

  // ======  Modal Open ========
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

  const CloseForm = () => {
    handleOk();
  };

  useEffect(() => {
    dispatch(getExpense());
  }, []);

  const AllExpense = useSelector(selectExpenseDetails);
  const AllExpenseStatus = useSelector(getExpenseStatus);
  const AllExpenseError = useSelector(getExpenseError);

  useEffect(() => {
    setDataSource(AllExpense);
  }, [AllExpense]);

  const UpdateForm = () => {
    dispatch(getExpense());
    CloseForm();
  };

  const handleEdit = (record) => {
    setTrigger(trigger + 1);
    setModelwith(800);
    setModalTitle("");
    setModalContent(
      <AddExpenseForm
        UpdateRecord={record}
        HandleClose={CloseForm}
        UpdateForm={UpdateForm}
        Expensetrigr={trigger}
      />
    );
    showModal();
  };

  const handleView = (record) => {
    setModelwith(800);
    setModalTitle("");
    setModalContent(
      <ViewExpensePage
        ViewRecord={record}
        HandleClose={CloseForm}
        UpdateForm={UpdateForm}
      />
    );
    showModal();
  };

  const handleDelete = async (record) => {
    await request
      .delete(`${APIURLS.DELETE_EXPENSE}/${record?.id}/`, record)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        dispatch(getExpense());
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 302) {
          toast.warn(error.response?.data?.message);
        } else {
          return errorHandler(error);
        }
      });
  };

  const filteroption = [
    {
      label: "Expense Category",
      value: "ExpenseCategory",
    },
    {
      label: "Expense Name",
      value: "ExpenseName",
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

  const TableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Subcategory",
      dataIndex: "expense_subcategory",
      width: 160,
    },
    {
      title: "Expense Category",
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
      // Feb 2026 owner rule: expose the chit-fund tag on the list so
      // operators can spot which chit fund every Chit-Fund-Expense hit.
      title: "Chit Fund",
      dataIndex: "chit_fund_name",
      width: 140,
      render: (val, rec) =>
        rec?.expense_subcategory === "Chit Fund Expense" ? (val || "-") : "-",
    },
    {
      title: "Date",
      dataIndex: "date",
      width: 120,
    },
    {
      title: "Expense Name",
      dataIndex: "expense_name",
      filteredValue: search2Texts ? [search2Texts] : null,
      onFilter: (value, record) => {
        return (
          String(record.expense_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.expense_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Expense Amount",
      dataIndex: "expense_amt",
    },
    {
      title: "Transaction Type",
      dataIndex: "transaction_type",
    },
    {
      title: "Action",
      render: (text, record, index) => {
        return (
          <Flex gap={"20px"} center={"true"}>
            {superUsers || role === userRolesConfig.ADMIN || ExpenseListPermission?.Expense?.View ? (
              <Tooltip title="View">
                <TableIconHolder size={"28px"} onClick={() => handleView(record)}>
                  <img src={SvgIcons.Eye} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN || ExpenseListPermission?.Expense?.Edit ? (
              <Tooltip title="Edit">
                <TableIconHolder size={"28px"} onClick={() => handleEdit(record)}>
                  <img src={SvgIcons.Edit} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN || ExpenseListPermission?.Expense?.Delete ? (
              <CustomPopconfirm
                title="Confirmation"
                description="Are you sure you want to remove this Expense detail?"
                okText="Yes"
                cancelText="No"
                confirm={() => handleDelete(record)}
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
      dataIndex: "expense_subcategory",
    },
    {
      title: "Expense Category",
      dataIndex: "category_name",
    },
    {
      title: "Chit Fund",
      dataIndex: "chit_fund_name",
      render: (val, rec) =>
        rec?.expense_subcategory === "Chit Fund Expense" ? (val || "-") : "-",
    },
    {
      title: "Date",
      dataIndex: "date",
    },
    {
      title: "Expense Name",
      dataIndex: "expense_name",
    },
    {
      title: "Expense Amount",
      dataIndex: "expense_amt",
    },
    {
      title: "Transaction Type",
      dataIndex: "transaction_type",
    },
  ]

  let content;

  if (AllExpenseStatus === "loading") {
    content = <CommonLoading />;
  } else if (AllExpenseStatus === "succeeded") {
    const rowKey = (dataSource) => dataSource.id;
    content = (
      <CustomStandardTable
        columns={TableColumn}
        data={dataSource}
        rowKey={rowKey}
      />
    );
  } else if (AllExpenseStatus === "failed") {
    content = <h2>{AllExpenseError} </h2>;
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });


  return (
    <Fragment>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={12}>
            <CustomPageTitle Heading={"Expense List"} />
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
                {filer === "ExpenseCategory" ? (
                  <CustomInput
                    value={searchTexts}
                    placeholder="Search Expense Category"
                    // onSearch={handleSearchs}
                    onChange={(e) => handleSearchs(e.target.value)}
                  />
                ) : (
                  <CustomInput
                    value={search2Texts}
                    placeholder="Search Expense Name"
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
            <h3 style={{ textAlign: 'center' }}>Expense Details</h3><br />
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
      </CustomCardView>
    </Fragment>
  );
};

export default ExpenseList;
