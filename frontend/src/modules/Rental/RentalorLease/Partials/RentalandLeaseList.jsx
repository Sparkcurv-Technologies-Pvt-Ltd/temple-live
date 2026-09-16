import { SvgIcons } from "@assets/Svg";
import {
  Button,
  CustomDatePicker,
  CustomInput,
  CustomRadioButton,
  CustomSelect,
  CustomTag,
} from "@components/form";
import {
  CommonLoading,
  CustomCardView,
  CustomModal,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageFormTitle, CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col, Form, Tooltip } from "antd";
import React, { Fragment, useRef, useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getLeaseThings,
  getLeaseThingsError,
  getLeaseThingsStatus,
  getMoveableThings,
  getMoveableThingsError,
  getMoveableThingsStatus,
  getRentalLease,
  getRentalLeaseError,
  getRentalLeaseStatus,
  getRentalThingError,
  getRentalThingStatus,
  getRentalThings,
  selectLeaseThingsDetails,
  selectMoveableThingsDetails,
  selectRentalLeaseDetails,
  selectRentalThingDetails,
} from "@modules/Rental/RentalorLease/RentalorLeaseSlice";
import RentalorLeaseView from "./RentalorLeaseView";
import CustomPopconfirm from "@components/others/CustomPopConfirm";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import RentalorLease from "./RentalorLease";
import { TableIconHolder } from "@components/common/Styled";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import MovableMainPage from "@modules/Rental/MovableRental/Partials/MovableMainPage";
import { MovableRentalView } from "@modules/Rental/MovableRental/Partials/MovableRentalView";
import { FaRegHandshake, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";
import { TbBusinessplan } from "react-icons/tb";
import { userRolesConfig } from "@router/config/roles";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";
import styled from "styled-components";
import { useReactToPrint } from "react-to-print";
import { IoPrint } from "react-icons/io5";
import CustomFilterTable from "@components/form/CustomFilterTable";
import { CommonManagePrintName } from "@modules/ComManagePrintDetails/CommonManagePrint";
import dayjs from "dayjs";
import { getBankDetails, selectBankDetails } from "@modules/Management/ManagementSlice";
import ViewSettlementPrint from "./ViewSettlementPrint";

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

export const RentalandLeaseList = () => {

  const dispatch = useDispatch();
  const componentRef = useRef();
  const [modelwith, setModelwith] = useState(0);

  const [trigger, setTrigger] = useState(0);

  const [modalTitle, setModalTitle] = useState();
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dataSource, setdataSource] = useState([]);

  const [filer, setFiler] = useState({});
  const [searchTexts, setSearchTexts] = useState([]); //---------Seach Bar 1--------
  const [search2Texts, setSearch2Texts] = useState([]); //---------Seach Bar 2--------

  const [rlm, setRlm] = useState("All");

  const [rentalthinks, setRentalThinks] = useState([]);
  const [leasethinks, setLeaseThinks] = useState([]);
  const [moveablethinks, setMoveableThinks] = useState([]);

  const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
  const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
  const RentalListPermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

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
    dispatch(getMoveableThings());
  };

  useEffect(() => {
    dispatch(getRentalLease());
  }, []);

  useEffect(() => {
    dispatch(getRentalThings());
    dispatch(getLeaseThings());
    dispatch(getMoveableThings());
  }, []);

  const AllRentalLeasedetails = useSelector(selectRentalLeaseDetails);
  const AllRentalLeasestatus = useSelector(getRentalLeaseStatus);
  const AllRentalLeaseError = useSelector(getRentalLeaseError);

  // new
  const AllRentalThingDetails = useSelector(selectRentalThingDetails);
  const AllRentalThingStatus = useSelector(getRentalThingStatus);
  const AllRentalThingError = useSelector(getRentalThingError);

  const AllLeaseThingsDetails = useSelector(selectLeaseThingsDetails);
  const AllLeaseThingsStatus = useSelector(getLeaseThingsStatus);
  const AllLeaseThingsError = useSelector(getLeaseThingsError);

  const AllMoveableThingsDetails = useSelector(selectMoveableThingsDetails);
  const AllMoveableThingsStatus = useSelector(getMoveableThingsStatus);
  const AllMoveableThingsError = useSelector(getMoveableThingsError);

  useEffect(() => {
    setRentalThinks(AllRentalThingDetails);
    setLeaseThinks(AllLeaseThingsDetails);
    setMoveableThinks(AllMoveableThingsDetails);
  }, [AllRentalThingDetails, AllLeaseThingsDetails, AllMoveableThingsDetails]);

  useEffect(() => {
    setdataSource(AllRentalLeasedetails);
  }, [AllRentalLeasedetails]);

  const SelectOption = [
    {
      label: "Category Name",
      value: "category",
    },
    {
      label: "Asset Name",
      value: "asset",
    },
  ];

  const SelectMemberOption = [
    {
      label: "All Rental/Lease List",
      value: "All",
    },
    {
      label: "Rent",
      value: "Rent",
    },
    {
      label: "Lease",
      value: "Lease",
    },
    {
      label: "Movable asset",
      value: "movableasset",
    },
  ];

  const handleSelectRlm = (value) => {
    setRlm(value);
  };

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
  const EditMoveableRentalandLease = (record) => {
    setModelwith(800);
    setTrigger(trigger + 1);
    // setModalTitle("Update RentalandLease");
    setModalContent(
      <MovableMainPage
        closee={close}
        MainMovableReocrd={record}
        MoveRentalorLeasetrigger={trigger}
      />
    );
    showModal();
  };

  const RentalandLeaseView = (record) => {
    setModelwith(700);
    setTrigger(trigger + 1);
    // setModalTitle("Rental / Lease List View");
    setModalContent(<RentalorLeaseView viewRentalorleaselist={record} />);
    showModal();
  };

  const MovableView = (record) => {
    setModelwith(700);
    setTrigger(trigger + 1);
    // setModalTitle("Rental / Lease List View");
    setModalContent(<MovableRentalView viewRentalorleaselist={record} />);
    showModal();
  };
  const EditRentalandLease = (record) => {
    setModelwith(800);
    setTrigger(trigger + 1);
    // setModalTitle("Update RentalandLease");
    setModalContent(
      <RentalorLease
        closee={close}
        updateRentalorLease={record}
        RentalorLeasetrigger={trigger}
      />
    );
    showModal();
  };

  const handlesettlementmodal = (record) => {
    setModelwith(800);
    setTrigger(trigger + 1);
    setModalTitle("");
    setModalContent(
      <SettltmentConfirmDetails recordDtat={record} handleCloseOk={handleOk} />
    );
    showModal();
  };

  const DeleteRentalorLease = async (record) => {
    await request
      .delete(`${APIURLS.DELETRE_RENTAL_LEASE}${record?.id}/`, record)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        dispatch(getRentalLease());
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  const ForceSettlement = async (record) => {
    await request
      .put(`${APIURLS.FORCE_SETTLEMENT_CONFERMATIONS}/${record?.id}/`, record)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        dispatch(getRentalLease());
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 302) {
          toast.error(error.response?.data?.message);
        } else {
          return errorHandler(error);
        }
      });
  };
  const TableColumn = [
    {
      title: "SI No.",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "date",
    },
    {
      title: "R&L No.",
      dataIndex: "lease_rent_no",
    },
    {
      title: "Type",
      render: (text, record) => {
        return (
          <>
            {record?.rent ? (
              <CustomTag title={"Rent"} color="green" />
            ) : (
              <CustomTag title={"Lease"} color="blue" />
            )}
          </>
        );
      },
    },
    {
      title: "Asset Category",
      dataIndex: "asset_category_name",
      render: (text, record) => record?.asset_category_name,
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record?.asset_category_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record?.asset_category_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Asset Name",
      dataIndex: "asset_name",
      render: (text, record) => record?.asset_name,
      filteredValue: search2Texts ? [search2Texts] : null,
      onFilter: (value, record) => {
        return (
          String(record?.asset_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record?.asset_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Tenet Name",
      dataIndex: "tenat_name",
    },
    {
      title: "Person Type",
      dataIndex: "tenat_type",
    },
    {
      title: "Status",
      render: (text, record) => {
        return (
          <>
            {record?.action === false ? (
              <div style={{ color: "red", fontWeight: "bold" }}>Closed</div>
            ) : (
              <div style={{ color: "Green", fontWeight: "bold" }}>Active</div>
            )}
          </>
        );
      },
    },
    {
      title: "Action",
      render: (text, record, index) => {
        return (
          <Flex gap={"10px"} >
            {superUsers || role === userRolesConfig.ADMIN || RentalListPermission?.Rental?.View ? (
              <Tooltip title="View">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => {
                    RentalandLeaseView(record);
                  }}
                >
                  <img src={SvgIcons.Eye} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>) : null}

            {superUsers || role === userRolesConfig.ADMIN || RentalListPermission?.Rental?.Edit ? (
              <Tooltip title="Edit">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => {
                    EditRentalandLease(record);
                  }}
                >
                  <img src={SvgIcons.Edit} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>) : null}
            {superUsers || role === userRolesConfig.ADMIN || RentalListPermission?.Rental?.Delete ? (
              <CustomPopconfirm
                title="Confirmation"
                description="Are you sure about removing this rental and lease detail ?"
                okText="Yes"
                cancelText="No"
                confirm={() => DeleteRentalorLease(record)}
              >
                <Tooltip title="Delete">
                  <img src={SvgIcons.Delete} style={{ cursor: "pointer" }} />
                </Tooltip>
              </CustomPopconfirm>) : null}
            {record?.rent &&
              (record?.advance_return === false ? (
                <Tooltip title="Settlement Confirmation">
                  <TableIconHolder
                    size={"28px"}
                    onClick={() => {
                      handlesettlementmodal(record);
                    }}
                  >
                    <FaRegHandshake
                      style={{ fontSize: "30px", cursor: "pointer" }}
                    />
                  </TableIconHolder>
                </Tooltip>
              ) : (
                <Tooltip title="Settlement Completed">
                  <TableIconHolder size={"28px"}>
                    <FaRegHandshake style={{ fontSize: "30px", color: "blue" }} />
                  </TableIconHolder>
                </Tooltip>
              ))}
            {record?.rent &&
              <CustomPopconfirm
                title="Force Settlement Confirmation"
                description="Are you sure you want to convert force settlement ?"
                okText="Yes"
                cancelText="No"
                confirm={() => ForceSettlement(record)}
              >
                {record?.advance_return === false ? (
                  <Tooltip title="Force Settlement">
                    <TbBusinessplan
                      style={{
                        fontSize: "30px",
                        color: "#ff0852",
                        marginTop: "5px",
                        cursor: "pointer",
                      }}
                    />
                  </Tooltip>
                ) : null}
              </CustomPopconfirm>}
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
      title: "R&L No.",
      dataIndex: "lease_rent_no",
    },
    {
      title: "Type",
      render: (text, record) => {
        return (
          <>
            {record?.rent ? (
              <CustomTag title={"Rent"} color="green" />
            ) : (
              <CustomTag title={"Lease"} color="blue" />
            )}
          </>
        );
      },
    },
    {
      title: "Asset Category",
      dataIndex: "asset_category_name",
    },
    {
      title: "Asset Name",
      dataIndex: 'asset_name',
    },
    {
      title: "Tenet Name",
      dataIndex: "tenat_name",
    },
    {
      title: "Type",
      dataIndex: "tenat_type",
    },
    {
      title: "Status",
      render: (text, record) => {
        return (
          <>
            {record?.action === false ? (
              <div style={{ color: "red", fontWeight: "bold" }}>Closed</div>
            ) : (
              <div style={{ color: "Green", fontWeight: "bold" }}>Active</div>
            )}
          </>
        );
      },
    },
  ]


  const TablemovableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Rent No",
      dataIndex: "rent_no",
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
    },
    {
      title: "Tenet Name",
      dataIndex: "tenat_name",
    },
    {
      title: "Type",
      dataIndex: "tenat_type",
    },
    {
      title: "Total Rent Amount",
      dataIndex: "total_rent_amt",
    },
    {
      title: "Action",
      render: (text, record, index) => {
        return (
          <Flex gap={"20px"} center={"true"}>
            {superUsers || role === userRolesConfig.ADMIN || RentalListPermission?.Rental?.View ? (
              <Tooltip title="View">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => {
                    RentalandLeaseView(record), MovableView(record);
                  }}
                >
                  <img src={SvgIcons.Eye} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN || RentalListPermission?.Rental?.Edit ? (
              <Tooltip title="Edit">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => {
                    EditMoveableRentalandLease(record);
                  }}
                >
                  <img src={SvgIcons.Edit} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN || RentalListPermission?.Rental?.Delete ? (
              <CustomPopconfirm
                title="Confirmation"
                description="Are You Sure About Removing This RentalandLease Detail ?"
                okText="Yes"
                cancelText="No"
                confirm={() => DeleteRentalorLease(record)}
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

  const TableColumnPrintmovable = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Rent No",
      dataIndex: "rent_no",
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
    },
    {
      title: "Tenet Name",
      dataIndex: "tenat_name",
    },
    {
      title: "Type",
      dataIndex: "tenat_type",
    },
    {
      title: "Total Rent Amount",
      dataIndex: "total_rent_amt",
    },

  ];

  let content1;

  if (AllRentalThingStatus === "loading") {
    content1 = <CommonLoading />;
  } else if (AllRentalThingStatus === "succeeded") {
    const rowKey = (dataSource) => dataSource?.member?.id;
    content1 = (
      <CustomStandardTable
        columns={TableColumn}
        data={rentalthinks}
        rowKey={rowKey}
      />
    );
  } else if (AllRentalThingStatus === "failed") {
    content1 = <h2>{AllRentalThingError} </h2>;
  }

  let content2;

  if (AllLeaseThingsStatus === "loading") {
    content2 = <CommonLoading />;
  } else if (AllLeaseThingsStatus === "succeeded") {
    const rowKey = (dataSource) => dataSource?.member?.id;
    content2 = (
      <CustomFilterTable
        columns={TableColumn}
        data={leasethinks}
        rowKey={rowKey}
      />
    );
  } else if (AllLeaseThingsStatus === "failed") {
    content2 = <h2>{AllLeaseThingsError} </h2>;
  }

  let content3;

  if (AllMoveableThingsStatus === "loading") {
    content3 = <CommonLoading />;
  } else if (AllMoveableThingsStatus === "succeeded") {
    const rowKey = (dataSource) => dataSource?.member?.id;
    content3 = (
      <CustomFilterTable
        columns={TablemovableColumn}
        data={moveablethinks}
        rowKey={rowKey}
      />
    );
  } else if (AllMoveableThingsStatus === "failed") {
    content3 = <h2>{AllMoveableThingsError} </h2>;
  }

  let content;
  if (AllRentalLeasestatus === "loading") {
    content = <CommonLoading />;
  } else if (AllRentalLeasestatus === "succeeded") {
    const rowKey = (dataSource) => dataSource.id;
    content = (
      <CustomFilterTable
        columns={TableColumn}
        data={dataSource}
        rowKey={rowKey}
      />
    );
  } else if (AllRentalLeasestatus === "failed") {
    content = <h2>{AllRentalLeaseError} </h2>;
  }

 
  // Settltment Confirm Details Start 

  const SettltmentConfirmDetails = ({ recordDtat, handleCloseOk }) => {

    const [form] = Form.useForm();
    const [paymentMode, setPaymentMode] = useState(null); // use online/offline payment mode show
    const [transactionType, setTransactionType] = useState({});
    const [transactionDate, setTransactionDate] = useState(dayjs().format("YYYY-MM-DD"));  // use  Transaction date
    const [selectedBankDetails, setSelectedBankDetails] = useState([]);
    const [bankPay, setBankPay] = useState({});

    useEffect(() => {
      dispatch(getBankDetails())
    }, [])

    useEffect(() => {
      form.setFieldsValue({ settlement_bank_name: selectedBankDetails });
    }, [selectedBankDetails]);

    const AllBankDetails = useSelector(selectBankDetails);

    useEffect(() => {
      form.setFieldsValue({
        tenat_name: recordDtat?.tenat_name,
        start_date: recordDtat?.start_date,
        end_date: recordDtat?.end_date,
        initial_advance_amt: recordDtat?.initial_advance_amt,
        lease_rent_no: recordDtat?.lease_rent_no,
        advance_settlement_amt: recordDtat?.advance_settlement_amt,
      });
    }, [recordDtat]);


    const RadioOptionsPaymentMode = [
      {
        label: "Online",
        value: "Online",
      },
      {
        label: "Offline",
        value: "Offline",
      },
    ];

    const handlePaymentMode = (e) => {
      setPaymentMode(e);
      setTransactionType({});
      form.resetFields(["settlement_transaction_type"]);
    };

    const bankPayoptions = [
      {
        label: "UPI",
        value: "UPI",
      },
      {
        label: "Net Banking",
        value: "Net Banking",
      },
      {
        label: "NEFT",
        value: "NEFT",
      },
    ];

    const bankoptions = AllBankDetails?.map((bank) => ({
      label: bank?.bank_name,
      value: bank?.id,
    }));

    const label =
      paymentMode === "Online"
        ? "Online Transaction Type"
        : paymentMode === "Offline"
          ? "Offline Transaction Type"
          : null;

    let RadioOptionsTransactionType = [];
    if (paymentMode === "Online") {
      RadioOptionsTransactionType = [
        {
          label: "Bank",
          value: "Bank",
        },
      ];
    } else if (paymentMode === "Offline") {
      RadioOptionsTransactionType = [
        {
          label: "Cash",
          value: "Cash",
        },
      ];
    }

    const handleTransactiontMode = (e) => {
      setTransactionType(e.target.value);

      form.resetFields([
        "settlement_bank_name",
        "settlement_bank_link",
        "settlement_bank_pay",
        "upi_no",
        "cheque_no",
        "settlement_trans_no",
        "settlement_transaction_date",
      ]);
    };

    const handleBankPayOptions = (e) => {
      if (e.target.value === "UPI") {
        setBankPay(e.target.value);
      } else {
        setBankPay(e.target.value);
      }
    };

    const handleBankOptions = (bank) => {
      const SelectedBank = AllBankDetails?.find((val) => val.id === bank);
      setSelectedBankDetails(SelectedBank?.bank_name);
      form.resetFields(["settlement_bank_pay", "settlement_trans_no", "settlement_transaction_date"]);
    };

    const handleTransactionDate = (date) => {
      setTransactionDate(date);
    };

    //================ When Submit Click on Print==========================

    const printOk = async ({ record }) => {
      setModelwith(500)
      setModalContent(<ViewSettlementPrint settlementRecord={record} />);
    };

    const PrintModal = (record) => {
      return (
        <Fragment>
          <h1 style={{ fontSize: '1.2rem' }}>Are you Sure You Want to Print ?</h1>
          <br />
          <Flex gap={'20px'} w_100={"true"} center={"true"} verticallyCenter={true}>
            <Button.Success text={'Print'} onClick={() => printOk(record)} />
            <Button.Danger text={'Cancel'} onClick={handleOk} />
          </Flex>
        </Fragment>
      )
    }
    const handlePrintClick = (record) => {
      setModelwith(400)
      setModalContent(<PrintModal record={record} />);
      showModal();
    }
    //============================

    const handlesettlementPost = async (data) => {
      await request
        .put(`${APIURLS.SETTLEMENT_CONFERMATIONS}/${recordDtat?.id}/`, data)
        .then(function (response) {
          if (response.status === 200) {
            successHandler(response, {
              notifyOnSuccess: true,
              notifyOnFailed: true,
              msg: "success",
              type: "success",
            });
            dispatch(getRentalLease());
            handleCloseOk();
          } else {
            toast.error("Settlement confirmation failed");
          }
          handlePrintClick(response.data);
          return response.data;
        })
        .catch(function (error) {
          if (error.response.status === 302) {
            if (error.response?.data?.message) {
              toast.error(error.response?.data?.message);
            }
          } else {
            return errorHandler(error);
          }
        });
    };

    const onFinish = (value) => {
      const record = { ...value, settlement_transaction_date: transactionDate }
      handlesettlementPost(record);
    };

    return (
      <Form
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        name="settleconfi"
        form={form}
        onFinish={onFinish}
        autoComplete="off"
      >
        <CustomRow space={[12, 12]}>
          <Col span={24} md={24}>
            <CustomPageTitle Heading={"Settlement Confirmation"} />
          </Col>
          <br />
          <Col span={24} md={12}>
            <CustomInput
              name={"lease_rent_no"}
              label={"lease rent no"}
              disabled
            />
          </Col>
          <Col span={24} md={12}>
            <CustomInput name={"tenat_name"} label={"tenat name"} disabled />
          </Col>
          <Col span={24} md={12}>
            <CustomInput name={"start_date"} label={"start date"} disabled />
          </Col>
          <Col span={24} md={12}>
            <CustomInput name={"end_date"} label={"end date"} disabled />
          </Col>
          <Col span={24} md={12}>
            <CustomInput name={"initial_advance_amt"}
              label={"initial advance amt"} disabled />
            <CustomInput name={"advance_settlement_amt"} display={"none"} />
          </Col>
          <Col span={24} md={12}>
            <CustomSelect
              label={"Payment Mode"}
              placeholder={"Select payment Mode"}
              name={"settlement_payment_mode"}
              options={RadioOptionsPaymentMode}
              onChange={handlePaymentMode}
              rules={[
                {
                  required: true,
                  message: "Please Select a Payment Mode !",
                },
              ]}
            />
          </Col>
          {paymentMode && paymentMode?.length &&
            <Col span={24} md={12}>
              <CustomRadioButton
                label={label}
                data={RadioOptionsTransactionType}
                onChange={handleTransactiontMode}
                name={"settlement_transaction_type"}
                rules={[
                  {
                    required: true,
                    message: "Please Choose Anyone !",
                  },
                ]}
              />
            </Col>}
          {paymentMode === "Offline" ? null : (
            <Col span={24} md={12}>
              {transactionType === "Bank" ? (
                <>
                  <CustomPageFormTitle Heading={"Bank Details"} />

                  <CustomSelect
                    label={"Select Bank"}
                    name={"settlement_bank_link"}
                    options={bankoptions}
                    onChange={handleBankOptions}
                    rules={[
                      {
                        required: true,
                        message: "Required !",
                      },
                    ]}
                  />
                  <CustomInput label={'bank'} name={'settlement_bank_link'} display={'none'} />
                  <CustomInput label={'bank'} name={'settlement_bank_name'} display={'none'} />
                  <CustomRadioButton
                    label={"Choose Online Transaction Type"}
                    name={"settlement_bank_pay"}
                    data={bankPayoptions}
                    onChange={handleBankPayOptions}
                    rules={[
                      {
                        required: true,
                        message: "Required !",
                      },
                    ]}
                  />
                  <CustomInput
                    label={"Transaction Number"}
                    name={"settlement_trans_no"}
                    rules={[
                      {
                        required: true,
                        message: "Required !",
                      },
                    ]}
                  />
                  <CustomDatePicker
                    label={"Transaction Date"}
                    name={"settlement_transaction_date"}
                    rules={[
                      {
                        required: true,
                        message: "Required !",
                      },
                    ]}
                    onChange={handleTransactionDate}
                  />
                </>
              ) : null}
            </Col>
          )}
          <Col span={24} md={12}>
            {transactionType === "Cheque" ? (
              <>
                <CustomPageFormTitle Heading={"Cheque Details"} />

                <CustomInput
                  label={"Cheque Number"}
                  name={"settlement_cheque_no"}
                  rules={[
                    {
                      required: true,
                      message: "Required !",
                    },
                  ]}
                />
                <CustomDatePicker
                  label={"Transaction Date"}
                  name={"settlement_transaction_date"}
                  rules={[
                    {
                      required: true,
                      message: "Required !",
                    },
                  ]}
                  onChange={handleTransactionDate}
                />
              </>
            ) : null}
          </Col>


        </CustomRow>
        <br />
        <Flex center gap={"20px"} style={{ margin: "30px" }}>
          <Button.Success text={"Submit"} htmlType={"submit"} />
          <Button.Danger text={"Cancel"} onClick={() => handleCloseOk()} />
        </Flex>
      </Form>
    );
  };

  // Settltment Confirm Details End 

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          {/* <Col span={24} md={7}>
            <CustomPageTitle Heading={'Rental / Lease List'} />
          </Col> */}
          <Col span={24} md={7}>
            {rlm === "Rent" && <CustomPageTitle Heading={"Rent"} />}
            {rlm === "Lease" && <CustomPageTitle Heading={"Lease"} />}
            {rlm === "movableasset" && (
              <CustomPageTitle Heading={"Movable Asset"} />
            )}
            {rlm === "All" && (
              <CustomPageTitle Heading={"All Rental/Lease List"} />
            )}
          </Col>

          <Col span={24} md={6}>
            <CustomSelect
              name={"SelectMember"}
              placeholder={"Select..."}
              options={SelectMemberOption}
              onChange={handleSelectRlm}
              defaultValue={"All"}
            />
          </Col>

          <Col span={24} md={5}>
            <CustomSelect
              placeholder={"Search Here :"}
              options={SelectOption}
              onChange={handleSelect}
            />
          </Col>
          <Col span={24} md={6}>
            {filer === "category" ? (
              <CustomInput value={searchTexts} placeholder="Category Name"
                onChange={(e) => handleSearchs(e.target.value)}
              />
            ) : (
              <CustomInput value={search2Texts} placeholder="Asset Name"
                onChange={(e) => handle2Search(e.target.value)}
              />
            )}
          </Col>

          <Col span={24} md={24}>
            {rlm === "Rent" && content1}
            {rlm === "Lease" && content2}
            {rlm === "movableasset" && content3}
            {rlm === "All" && content}
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
            {rlm === "Rent" ? <>
              <h3 style={{ textAlign: 'center' }}>Rent Details</h3><br />
              <CustomStandardTable columns={TableColumnPrint} data={rentalthinks} pagination={false} />
            </> : rlm === "Lease" ? <>
              <h3 style={{ textAlign: 'center' }}>Lease Details</h3><br />
              <CustomStandardTable columns={TableColumnPrint} data={leasethinks} pagination={false} />
            </> : rlm === "movableasset" ? <>
              <h3 style={{ textAlign: 'center' }}>Movable Asset Details</h3><br />
              <CustomStandardTable columns={TableColumnPrintmovable} data={moveablethinks} pagination={false} />
            </>
              : <>
                <h3 style={{ textAlign: 'center' }}>Rent And Lease Details</h3><br />
                <CustomStandardTable columns={TableColumnPrint} data={dataSource} pagination={false} />
              </>}
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
