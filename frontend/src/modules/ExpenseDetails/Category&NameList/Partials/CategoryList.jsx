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
import CustomPopconfirm from "@components/others/CustomPopConfirm";
import request from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import { TableIconHolder } from "@components/common/Styled";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import {
    selectAllPermissions,
    selectCurrentSuperUser,
    selectCurrentUserRole,
} from "@modules/Auth/authSlice";
import { userRolesConfig } from "@router/config/roles";
import { useReactToPrint } from "react-to-print";
import styled from "styled-components";
import {
    getExpenseCategory, getExpenseCategoryStatus,
    selectExpenseCategoryDetails
} from "@modules/ExpenseDetails/ExpenseSlice";
import { AddExpenseCategoryModal } from "@modules/ExpenseDetails/AddExpense/Partials/AllExpenseModals";

const PrintHolder = styled.div`
  padding: 10px 15px;
  @media print {
    .PrintShowDatadd {
      display: block;
      page-break-before: always;
    }
    margin: 50px;
    width: 100%;
    margin: auto;
  }
`;

const PrintShowData = styled.div`
  display: none;
`;

const ExpenseCategoryListView = () => {

    const dispatch = useDispatch();
    const componentRef = useRef();
    const [dataSource, setDataSource] = useState([]);
    const [trigger, setTrigger] = useState(0);
    const [searchTexts, setSearchTexts] = useState([]); //---------Seach Bar 1--------
    const [search2Texts, setSearch2Texts] = useState([]); //---------Seach Bar 2--------
    const [filer, setFiler] = useState({});

    const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
    const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
    const ExpensePermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

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

    const FormUpdateClose = () => {
        handleOk();
        dispatch(getExpenseCategory());
    };

    useEffect(() => {
        dispatch(getExpenseCategory());
    }, []);

    const AllExpenseCategory = useSelector(selectExpenseCategoryDetails);
    const ExpenseCategoryStatus = useSelector(getExpenseCategoryStatus);

    useEffect(() => {
        setDataSource(AllExpenseCategory);
    }, [AllExpenseCategory]);

    const EditExpenseCategory = (record) => {
        setModelwith(500);
        setTrigger(trigger + 1);
        setModalContent(
            <AddExpenseCategoryModal
                CategoryRecord={record}
                expenseTrigger={trigger}
                FormUpdateClose={FormUpdateClose}
            />
        );
        showModal();
    };

    const DeleteIncomeCategory = async (data) => {
        await request
            .delete(`${APIURLS.UPDATE_EXPENSE_CATEGORY}/${data?.id}/`, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: "success",
                    type: "success",
                });
                dispatch(getExpenseCategory());
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            });
    };

    const handleSearchs = (value) => {
        setSearchTexts(value);
    };

    const TableColumn = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: "Expense category",
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
            title: "Action",
            render: (text, record, index) => {
                return (
                    <Flex gap={"20px"} center={"true"}>
                        {superUsers ||
                            role === userRolesConfig.ADMIN ||
                            ExpensePermission?.Expense?.Edit ? (
                            <Tooltip title="Edit">
                                <TableIconHolder
                                    size={"28px"}
                                    onClick={() => EditExpenseCategory(record)}
                                >
                                    <img src={SvgIcons.Edit} style={{ cursor: "pointer" }} />
                                </TableIconHolder>
                            </Tooltip>
                        ) : null}
                        {superUsers ||
                            role === userRolesConfig.ADMIN ||
                            ExpensePermission?.Expense?.Delete ? (
                            <CustomPopconfirm
                                title="Confirmation"
                                description="Are you sure you want to remove this expense detail?"
                                okText="Yes"
                                cancelText="No"
                                confirm={() => DeleteIncomeCategory(record)}
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
            title: "Expense Category",
            dataIndex: "category_name",
        },
    ];

    let content;

    if (ExpenseCategoryStatus === "loading") {
        content = <CommonLoading />;
    } else if (ExpenseCategoryStatus === "succeeded") {
        const rowKey = (dataSource) => dataSource.id;
        content = (
            <CustomStandardTable
                columns={TableColumn}
                data={dataSource}
                rowKey={rowKey}
            />
        );
    } else if (ExpenseCategoryStatus === "failed") {
        const rowKey = (dataSource) => dataSource.id;
        content = (
            <CustomStandardTable
                columns={TableColumn}
                data={dataSource}
                rowKey={rowKey}
            />
        );
    }

    const ViewincomeList = (record) => {
        setModelwith(500);
        // setModalContent(<IncomeViews record={record} />);
        showModal();
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (
        <Fragment>
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={"Expense Category List"} />
                    </Col>
                    <Col span={24} md={12}>
                        <Flex end aligncenter gap={"15px"}>
                            <p>Filter By Category Name :&nbsp;</p>
                            <CustomInput 
                                value={searchTexts}
                                placeholder="Search"
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
                    <Button.Secondary
                        text={"Print"}
                        icon={<IoPrint />}
                        onClick={handlePrint}
                    />
                </Flex>

                <PrintHolder ref={componentRef}>
                    <PrintShowData className="PrintShowDatadd">
                        <h1 style={{ textAlign: "center" }}>Expense Category Details</h1>
                        <br />
                        <CustomStandardTable
                            columns={TableColumnPrint}
                            data={dataSource}
                            pagination={false}
                        />
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

export default ExpenseCategoryListView;
