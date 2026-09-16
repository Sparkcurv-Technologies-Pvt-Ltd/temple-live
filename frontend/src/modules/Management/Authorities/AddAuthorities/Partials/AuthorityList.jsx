import { SvgIcons } from "@assets/Svg";
import {
  CustomTag,
} from "@components/form";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import {
  CommonLoading,
  CustomCardView,
  CustomModal,
  CustomPopConfirm,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import {
  getAuthorityDetails,
  getAuthorityDetailsError,
  getAuthorityDetailsStatus,
  selectAuthorityDetails,
} from "@modules/Management/ManagementSlice";
import { APIURLS } from "@request/apiUrls/urls";
import errorHandler from "@request/errorHandler";
import request from "@request/request";
import { Col, Tooltip } from "antd";
import React, { Fragment, useEffect, useState } from "react";
import { FaUserCheck } from "react-icons/fa";
import { TbUserCancel } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import AddAuthorities from "./AddAuthorities";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";
import { userRolesConfig } from "@router/config/roles";
import { toast } from "react-toastify";

const AuthorityList = () => {

  const [dataSource, setDataSource] = useState([]);
  const [trigger, setTrigger] = useState(0);

  const dispatch = useDispatch();
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

  // Role
  const role = useSelector(selectCurrentUserRole);
  // SuperUser
  const superUsers = useSelector(selectCurrentSuperUser);
  // Permissions
  const authorityPermissions = useSelector(selectAllPermissions);
  useEffect(() => {
    dispatch(getAuthorityDetails());
  }, []);

  const AllAuthority = useSelector(selectAuthorityDetails);
  const AuthorityStatus = useSelector(getAuthorityDetailsStatus);
  const AuthorityError = useSelector(getAuthorityDetailsError);

  useEffect(() => {
    setDataSource(AllAuthority);
  }, [AllAuthority]);

  const handleGetAutorities = () => {
    dispatch(getAuthorityDetails());
    handleOk();
  };
  const handleAutorityModal = (record) => {
    setModelwith(700);
    setTrigger(trigger + 1);
    setModalContent(
      <AddAuthorities
        viewAuthortyRecord={record}
        AuthorityTrigger={trigger}
        handleGetAutorities={handleGetAutorities}
      />
    );
    showModal();
  };

  const StatusChange = async (record, data) => {
    // console.log(record, "record");
  
    try {
      if (record.status === "Active") {
        const response = await request.patch(
          `${APIURLS.PATCH_RESIGN_AUTHORITY}/${record?.id}/`,
          data
        );
        // successHandler(response, {
        //   notifyOnSuccess: true,
        //   notifyOnFailed: true,
        //   msg: "success",
        //   type: "success",
        // });
        toast.info("Authority resigned successfully");
        //  console.log(response,'response');
        dispatch(getAuthorityDetails());
  
        return response.data;
      } else {
        const response = await request.patch(
          `${APIURLS.PATCH_REJOIN_AUTHORITY}/${record?.id}/`,
          data
        );
        // successHandler(response, {
        //   notifyOnSuccess: true,
        //   notifyOnFailed: true,
        //   msg: "success",
        //   type: "success",
        // });
        toast.info("Authority rejoined successfully")
        dispatch(getAuthorityDetails());
        // console.log(response,'response');
        return response.data;
      }
    } catch (error) {
      console.log(error);
      return errorHandler(error);
    }
  };
  

  const TableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Authorities Name",
      dataIndex: "member_name",
    },
    {
      title: "Member ID",
      dataIndex: "member_no",
    },
    {
      title: "Position",
      dataIndex: "position_name",
    },
    {
      title: "From Date",
      dataIndex: "from_date",
    },
    {
      title: "To Date",
      dataIndex: "to_date",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text, record, index) => {
        return (
          <Fragment>
            <Flex center={"true"}>
              {record?.status === "Active" ? (
                <CustomTag
                  bordered={"true"}
                  color={"success"}
                  title={"Active"}
                />
              ) : (
                <CustomTag
                  bordered={"true"}
                  color={"error"}
                  title={"In-Active"}
                />
              )}
            </Flex>
          </Fragment>
        );
      },
    },
    {
      title: "Action",
      render: (text, record, index) => {
        return (
          <Flex gap={"20px"} center={"true"}>
            {superUsers || role === userRolesConfig.ADMIN || authorityPermissions?.Authority?.Edit ? (
              <Tooltip title={"Edit"}>
                <img
                  src={SvgIcons.Edit}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleAutorityModal(record)}
                />
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN  ? (

              <CustomPopConfirm
                title={
                  record.status === "Active"
                    ? "Resign the Authority"
                    : "Rejoin the Authority"
                }
                description={
                  record.status === "Active"
                    ? "Are you sure to Resign this Authority?"
                    : "Are you sure to Rejoin this Authority?"
                }
                confirm={() => StatusChange(record)}
              >
                <Tooltip
                  placement="top"
                  title={record.status === "Active" ? "Rejoin" : "Resign"}
                >
                  {record.status === "Active" ? (
                    <FaUserCheck size={24} style={{ color: 'green', cursor: 'pointer' }} />
                  ) : (
                    <TbUserCancel size={24} style={{ color: 'red', cursor: 'pointer' }} />
                  )}
                </Tooltip>
              </CustomPopConfirm>
            ) : null}
          </Flex>
        );
      },
    },
  ];
  let content;

  if (AuthorityStatus === 'loading') {
    content = <CommonLoading />
  } else if (AuthorityStatus === 'succeeded') {
    const rowKey = (dataSource) => dataSource?.id;
    content = <CustomStandardTable columns={TableColumn} data={dataSource} rowKey={rowKey} />
  } else if (AuthorityStatus === 'failed') {
    content = <h2>{
      AuthorityError} </h2>
  }
  return (
    <div>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={12}>
            <CustomPageTitle Heading={"Authorities List"} />
          </Col>
          <Col span={24} md={24}>
            {content}
          </Col>
        </CustomRow>
        <CustomModal
          isVisible={isModalOpen}
          handleOk={handleOk}
          handleCancel={handleCancel}
          width={modelwith}
          modalTitle={modalTitle}
          modalContent={modalContent}
        />
      </CustomCardView>
    </div>
  );
};

export default AuthorityList;
