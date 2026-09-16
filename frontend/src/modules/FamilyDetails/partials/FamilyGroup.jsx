import { SvgIcons } from "@assets/Svg";
import {
  CustomInput,
  CustomSelect,
} from "@components/form";
import {
  CommonLoading,
  CustomCardView,
  CustomModal,
  CustomPopConfirm,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col, Tooltip } from "antd";
import React, { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFamilyGroupDetails,
  getFamilyGroupError,
  getFamilyGroupStatus,
  selectFamilyGroupDetails,
} from "../FamilySlice";
import { useNavigate } from "react-router-dom";
import { AddFamilyDetails } from "./AddFamilyDetails";
import ViewFamilyDetails from "./ViewFamilyDetails";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { THEME } from "@theme/index";
import request from "@request/request";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import { APIURLS } from "@request/apiUrls/urls";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";
import { userRolesConfig } from "@router/config/roles";
import Ancestorview from "./Ancestorview";

const FamilyGroup = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState([]);

  const [searchTexts, setSearchTexts] = useState([]); //---------Seach Bar 1--------
  const [search2Texts, setSearch2Texts] = useState([]); //---------Seach Bar 2--------
  const [filer, setFiler] = useState({});

  // ======  Modal Open ========
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ======  Modal Title and Content ========
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState(null);
  const [trigger, setTrigger] = useState(0);

  // ----------  Form Reset UseState ---------
  const [modelwith, setModelwith] = useState(0);

  // ===== Modal Functions Start =====
  const showModal = () => {
    setIsModalOpen(true);
  };

  const ResetTrigger = () => {
    setTrigger(trigger + 1);
  };

  const CloseForm = () => {
    handleOk();
  };

  const handleOk = () => {
    setIsModalOpen(false);
    ResetTrigger();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const updateFamilyGroup = (record) => {
    setModelwith(800);
    setTrigger(trigger + 1);
    setModalTitle("");
    setModalContent(
      <AddFamilyDetails
        updatetrigger={trigger}
        familyrecord={record}
        CloseFormm={CloseForm}
      />
    );
    showModal();
  };


  // Role
  const role = useSelector(selectCurrentUserRole)
  // SuperUser
  const superUsers = useSelector(selectCurrentSuperUser)
  // Permissions
  const familyGroupPermissions = useSelector(selectAllPermissions)

  useEffect(() => {
    dispatch(getFamilyGroupDetails());
  }, []);

  const FamilyGroupDetails = useSelector(selectFamilyGroupDetails);
  const FamilyGroupStatus = useSelector(getFamilyGroupStatus);
  const FamilyGroupError = useSelector(getFamilyGroupError);

  const HeadDetails = FamilyGroupDetails?.map((head) => head?.head);

  useEffect(() => {
    setDataSource(FamilyGroupDetails);
  }, [FamilyGroupDetails]);

  const filteroption = [
    {
      label: "Member Name",
      value: "membername",
    },
    {
      label: "Mobile Number",
      value: "number",
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
  const viewFamilyGroup = (record) => {
    setModelwith(900);
    setModalTitle("");
    setModalContent(
      <ViewFamilyDetails viewfamilyrecord={record} CloseForm={CloseForm} />
    );
    showModal();
  };
  const handleNavigate =(record)=>{
    navigate(`/view_family_details/${record?.id}`)

  }
  const ViewAncestorDetails = (record) => {
    setModelwith(900);
    setModalTitle("");
    setModalContent(
      <Ancestorview />
    );
    showModal();
  };

  const DeleteFamilyGroup = async (data) => {
    await request
      .delete(`${APIURLS.PUT_PATCH_FAMILY_GROUP}${data?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        dispatch(getFamilyGroupDetails());
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  const columns = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Family No",
      dataIndex: "family_no",
    },

    {
      title: "Family Head Name",
      render: (record) => {
        const father = record?.family?.find(
          (fam) => fam.member_relation_ship === "FATHER"
        );
        return <>{father && <div>{father.member_name}</div>}</>;
      },
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        const father = record?.family?.find(
          (fam) => fam.member_relation_ship === "FATHER"
        );
        return (
          father &&
          (String(father.member_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
            String(father.member_name).includes(value.toUpperCase()))
        );
      },
    },
    {
      title: "Family Members Count",
      dataIndex: "members_count",
    },
    {
      title: "Death Members",
      dataIndex: "death_members_count",
    },
    {
      title: "Mobile Number",
      render: (record) => {
        const father = record?.family?.find(
          (fam) => fam.member_relation_ship === "FATHER"
        );
        return <>{father && <div>{father.member_mobile_number}</div>}</>;
      },
      filteredValue: search2Texts ? [search2Texts] : null,
      onFilter: (value, record) => {
        const father = record?.family?.find(
          (fam) => fam.member_relation_ship === "FATHER"
        );
        return (
          father &&
          (String(father.member_mobile_number)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
            String(father.member_mobile_number).includes(value.toUpperCase()))
        );
      },
    },
    {
      title: "Address",
      dataIndex: "address",
    },
    {
      title: "Action",
      render: (text, record, index) => {
        return (
          <Flex gap={"20px"} center={"true"}>
            {superUsers || role === userRolesConfig.ADMIN || familyGroupPermissions?.Family?.View ? (
              <Tooltip title={"View"}>
                <AiOutlineUsergroupAdd
                  size={28}
                  color={THEME.PRIMARY}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleNavigate(record)}
                />
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN || familyGroupPermissions?.Family?.Edit ? (
              <Tooltip title={"Edit"}>
                <img
                  src={SvgIcons.Edit}
                  style={{ cursor: "pointer" }}
                  onClick={() => updateFamilyGroup(record)}
                />
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN || familyGroupPermissions?.Family?.Delete ? (
              <CustomPopConfirm
                title="confirmation"
                description="Are you sure about removing this Family Group!"
                okText="Yes"
                cancelText="No"
                confirm={() => DeleteFamilyGroup(record)}
              >
                <Tooltip title={"Delete"}>
                  <img src={SvgIcons.Delete} style={{ cursor: "pointer" }} />
                </Tooltip>
              </CustomPopConfirm>
            ) : null}
          </Flex>
        );
      },
    },
  ];

  let content;

  if (FamilyGroupStatus === "loading") {
    content = <CommonLoading />;
  } else if (FamilyGroupStatus === "succeeded") {
    const rowKey = (dataSource) => dataSource.id;
    content = (
      <CustomStandardTable
        columns={columns}
        data={dataSource}
        rowKey={rowKey}
      />
    );
  } else if (FamilyGroupStatus === "failed") {
    content = <h2 >{FamilyGroupError} </h2>;
    
  }

  return (
    <div>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={12}>
            <CustomPageTitle Heading={"Family Group"} />
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
                {filer === "membername" ? (
                  <CustomInput
                    value={searchTexts}
                    placeholder="Search Name"
                    // onSearch={handleSearchs}
                    onChange={(e) => handleSearchs(e.target.value)}
                  />
                ) : (
                  <CustomInput
                    value={search2Texts}
                    placeholder="Search Contact"
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

export default FamilyGroup;
