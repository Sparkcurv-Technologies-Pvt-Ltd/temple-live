import {
  Button,
} from "@components/form";
import CustomFilterTable from "@components/form/CustomFilterTable";
import {
  CommonLoading,
  CustomCardView,
  CustomModal,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoPrint } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AllNoramlLeaseTable, getFundLease, getFundLeaseStatus, getFundLeasenormaltable, getNoramlLeaseTableStatus, selectFundLeaseDetails } from "../../FundSlice";
import { Col } from "antd";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";
import { useReactToPrint } from "react-to-print";
import dayjs from "dayjs";
import { CommonManagePrintName, PrintHolder, PrintShowData } from "@modules/ComManagePrintDetails/CommonManagePrint";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import { APIURLS } from "@request/apiUrls/urls";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import { toast } from "react-toastify";
import request from "@request/request";
import { FundLeaseForm } from "@modules/Fund/FundLease/Partials/FundLease";
import { FundLeaseSettlement } from "@modules/Fund/FundLease/Partials/FundleaseSettlement";
import AddNormalFundLease from "@modules/Fund/FundLease/NormalFundLease/Partials/AddNormalFundLease";
import { NormalFundLeaseSettlement } from "@modules/Fund/FundLease/NormalFundLease/Partials/NormalFundLeaseSettlement";


const ViewProfileFundLease = ({ leaseDetails, GetViewProfileFundLease }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const componentRef = useRef();
  const [dataSource, setDataSource] = useState([]);
  const [LeaseFind, setLeaseFind] = useState("FundLease")
  const [trigger, setTrigger] = useState(0);

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

  const close = () => {
    handleOk();
  };
  useEffect(() => {
    dispatch(getFundLease());
    dispatch(getFundLeasenormaltable());
  }, []);

  const AllFindLeaseDetails = useSelector(selectFundLeaseDetails);
  const AllFindLeaseDStatus = useSelector(getFundLeaseStatus);
  // ====== Normal lease table ===========

  const AllDetailsNoramlLeaseTable = useSelector(AllNoramlLeaseTable);
  const NoramlLeaseTableStatus = useSelector(getNoramlLeaseTableStatus);


  const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
  const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
  const FundPermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

  useEffect(() => {
    setDataSource(leaseDetails);
  }, [leaseDetails]);
  // ============= lease Option  =========
  const leaseOption = [
    {
      label: 'Fund Lease', value: 'FundLease'
    },
    {
      label: 'Normal Fund Lease', value: 'NormalFundLease'
    },
  ]

  const handleLeaseSelectChange = (value) => {
    setLeaseFind(value)
  }

  const ViewFundLeaseClick = (record) => {
    navigate(`/view_fund_lease_member/${record.id}`);
  };

  const handleLeaseGet = () => {
    handleOk();
    GetViewProfileFundLease();
    // dispatch(getFundLease());
  };

  // ========  Edit FundLease Modal ==========

  const UpdateFundLeaseModal = (record) => {
    setModelwith(800);
    setTrigger(trigger + 1);
    setModalContent(
      <FundLeaseForm
        closee={close}
        fundleaseRecord={record}
        leaseTrigger={trigger}
        handleLeaseGet={handleLeaseGet}
      />
    );
    showModal();
  };

  const SettlementFundLeaseModal = (record) => {
    setModelwith(600);
    setTrigger(trigger + 1);
    setModalContent(
      <FundLeaseSettlement
        closee={close}
        settlementRecord={record}
        leaseTrigger={trigger}
        handleLeaseGet={handleLeaseGet}
      />
    );
    showModal();
  };

  // ========  Edit Normal FundLease Modal ==========

  const UpdateNormalFundLeaseModal = (record) => {
    setModelwith(800);
    setTrigger(trigger + 1);
    setModalContent(
      <AddNormalFundLease closee={close}
        normalfundleaseMainRecord={record}
        // normalMainRecord={record}
        leaseTrigger={trigger}
        handleLeaseGet={handleLeaseGet} />
    );
    showModal();
  }

  const SettlementNormalFundLeaseModal = (record) => {
    setModelwith(700);
    setTrigger(trigger + 1);
    setModalContent(
      <NormalFundLeaseSettlement
        closee={close}
        settlementRecord={record}
        leaseTrigger={trigger}
        handleLeaseGet={handleLeaseGet}
      />
    );
    showModal();
  }
  //--------------Fund lease Delete --------------
  const DeleteFundLease = async (record) => {
    await request
      .delete(`${APIURLS.PUT_FUND_LEASE}/${record?.id}/`, record)
      .then(function (response) {
        if (response.status === 226) {
          toast.warn(response.data?.Message);
        }
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        dispatch(getFundLease());
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };
  //--------------Normal Fund lease Delete --------------

  const DeleteNormalFundLease = async (record) => {
    await request
      .delete(`${APIURLS.PUT_FUND_LEASE}/${record?.id}/`, record)
      .then(function (response) {
        if (response.status === 226) {
          toast.warn(response.data?.Message);
        }
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        dispatch(getFundLeasenormaltable());
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };
  //-----------
  const TableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
      key: '1',
    },
    {
      title: "Lease Date",
      dataIndex: "lease_date",
      key: '2',

    },
    {
      title: "Fund Name",
      dataIndex: "fund_name",
      key: '3',
    },
    {
      title: "Fund Type",
      dataIndex: "fund_type",
      key: '4',
    },
    {
      title: "Fund Lease Amt",
      dataIndex: "fund_lease_amount",
      key: '5',
    },
    {
      title: "Commission Amt",
      dataIndex: "commission_amount",
      key: '5',
    },
    {
      title: "Final Lease Amt",
      dataIndex: "final_lease_amount",
      key: '5',
    },
    {
      title: "From Date",
      dataIndex: "from_date",
      key: '2',

    },
    {
      title: "To Date",
      dataIndex: "to_date",
      key: '2',

    },
    {
      title: "Fund Count",
      dataIndex: "fund_count",
      key: '6',
    },
    {
      title: "Member Count",
      dataIndex: "members_count",
      key: '7',
    },

  ];

  let content;

  if (AllFindLeaseDStatus === 'loading') {
    content = <CommonLoading />
  } else if (AllFindLeaseDStatus === 'succeeded') {
    const rowKey = (dataSource) => dataSource?.id;
    content = <CustomFilterTable columns={TableColumn} data={dataSource} rowKey={rowKey} />
  } else if (AllFindLeaseDStatus === 'failed') {
    const rowKey = (dataSource) => dataSource?.id;
    content = <CustomFilterTable columns={TableColumn} data={dataSource} rowKey={rowKey} />
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const CurrentDate = dayjs().format('DD-MM-YYYY')


  const TableColumnPrint = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Lease Date",
      dataIndex: "lease_date",

    },
    {
      title: "Fund Name",
      dataIndex: "fund_name",
    },
    {
      title: "Fund Type",
      dataIndex: "fund_type",
    },
    {
      title: "Fund Lease Amt",
      dataIndex: "fund_lease_amount",
    },
    {
      title: "Com. Amt",
      dataIndex: "commission_amount",
    },
    {
      title: "Final Lease Amt",
      dataIndex: "final_lease_amount",
    },
    // {
    //   title: "From Date",
    //   dataIndex: "from_date",
    // },
    // {
    //   title: "To Date",
    //   dataIndex: "to_date",
    // },
    {
      title: "Fund Count",
      dataIndex: "fund_count",
    },
    // {
    //   title: "Member Count",
    //   dataIndex: "members_count",
    // },
  ];

  const NormalLeaseTableColumnPrint = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
      key: '1',
    },
    {
      title: "Lease Date",
      dataIndex: "lease_date",
      key: '2',

    },
    {
      title: "Fund Name",
      dataIndex: "fund_name",
      key: '3',
    },
    {
      title: "Fund Type",
      dataIndex: "fund_type",
      key: '4',
    },
    {
      title: "Fund Lease Amt",
      dataIndex: "fund_lease_amount",
      key: '5',
    },
    {
      title: "Com. Amt",
      dataIndex: "commission_amount",
      key: '5',
    },
    {
      title: "Final Lease Amt",
      dataIndex: "final_lease_amount",
      key: '5',
    },
    // {
    //   title: "From Date",
    //   dataIndex: "from_date",
    //   key: '2',
    // },
    // {
    //   title: "To Date",
    //   dataIndex: "to_date",
    //   key: '2',
    // },
    {
      title: "Fund Count",
      dataIndex: "fund_count",
      key: '6',
    },
    // {
    //   title: "Member Count",
    //   dataIndex: "members_count",
    //   key: '7',
    // },
  ]

  return (
    <CustomCardView>
      <CustomRow>
        <Col span={24} md={16}>
          <CustomPageTitle Heading={"View Fund Lease"} />
        </Col>
      </CustomRow><br />

      {content}

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
          <h3 style={{ textAlign: 'center' }}>Fund Lease Details</h3><br />
          {LeaseFind === 'FundLease' ?
            <CustomStandardTable columns={TableColumnPrint} data={dataSource || []} pagination={false} /> :
            <CustomStandardTable columns={NormalLeaseTableColumnPrint} data={AllDetailsNoramlLeaseTable || []} pagination={false} />}
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
    </CustomCardView >
  );
};

export default ViewProfileFundLease;
