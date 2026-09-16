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
import React, { useEffect, useRef, useState } from "react";
import { BsGrid3X3Gap, BsListUl } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import {
  getDeathMemberError,
  getDeathMemberStatus,
  getDeathMembers,
  getLeaveMembers,
  getLeavingMemberError,
  getLeavingMemberStatus,
  getMarriageMemberError,
  getMarriageMemberStatus,
  getMarriageMembers,
  getMemberError,
  getMemberStatus,
  getMembersDetails,
  selectDeathMemberDetails,
  selectLeavingMemberDetails,
  selectMarriageMemberDetails,
  selectMemberDetails,
  getAllMembers,
  selectAllMemberDetails,
  getAllMemberStatus,
  getAllMemberError,
} from "../FamilySlice";
import { useNavigate } from "react-router-dom";
import { TableIconHolder } from "@components/common/Styled";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import DummyMember from "@assets/images/Sampling.png";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";
import { userRolesConfig } from "@router/config/roles";
import { IoPrint } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import styled from "styled-components";
import { useReactToPrint } from "react-to-print";
import { CommonManagePrintName } from "@modules/ComManagePrintDetails/CommonManagePrint";
import { getAddMembersError, getAddMembersStatus, getSangamAddMembers, SelectAddMembers } from "@modules/Sangam/SangamDetails/SangamSlice";

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

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
  padding: 8px 0;
`

const MemberCard = styled.div`
  background: #fff;
  border: 1px solid #f0e6d3;
  border-radius: 12px;
  padding: 18px 14px 14px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(128,0,0,0.07);
  transition: transform 0.18s, box-shadow 0.18s;
  cursor: pointer;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(128,0,0,0.14);
    border-color: #800000;
  }
`

const MemberAvatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 10px;
  border: 2px solid #C5A059;
  img { width: 100%; height: 100%; object-fit: cover; }
`

const MemberBadge = styled.span`
  background: #fff3e0;
  color: #800000;
  font-size: 11px;
  font-weight: 700;
  border-radius: 20px;
  padding: 2px 10px;
  border: 1px solid #f5c87a;
  display: inline-block;
  margin-bottom: 6px;
`

const MemberName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #2d1a0e;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MemberInfo = styled.div`
  font-size: 11px;
  color: #7a6652;
  margin-bottom: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CardActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f0e6d3;
`

const ViewToggle = styled.div`
  display: flex;
  gap: 4px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
  align-self: center;
`

const ToggleBtn = styled.button`
  background: ${p => p.active ? '#800000' : '#fff'};
  color: ${p => p.active ? '#fff' : '#800000'};
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  transition: background 0.15s;
  &:hover { background: ${p => p.active ? '#800000' : '#f9f0f0'}; }
`

const MemberList = () => {

  const dispatch = useDispatch();
  const componentRef = useRef();
  const navigate = useNavigate();
  const [filer, setFiler] = useState({});

  const [dataSource, setDataSource] = useState([]);
  const [deathMember, setDeathMember] = useState([]);
  const [leavingMember, setLeavingMember] = useState([]);
  const [marriageMember, setMarriageMember] = useState([]);
  const [allTypeMember, setAlltypeMeber] = useState([])

  const [Member, setMember] = useState("All");
  const [searchTexts, setSearchTexts] = useState([]); //---------Seach Bar 1--------
  const [search2Texts, setSearch2Texts] = useState([]); //---------Seach Bar 2--------
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'card'

  // ======  Modal Open ========
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ======  Modal Title and Content ========
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState(null);

  // ----------  Form Reset UseState ---------
  const [modelwith, setModelwith] = useState(0);

  // Role
  const role = useSelector(selectCurrentUserRole);
  // SuperUser
  const superUsers = useSelector(selectCurrentSuperUser);
  // Permissions
  const memberListPermissions = useSelector(selectAllPermissions);

  useEffect(() => {
    dispatch(getSangamAddMembers());
    dispatch(getDeathMembers());
    dispatch(getLeaveMembers());
    dispatch(getMarriageMembers());
    dispatch(getAllMembers())
  }, []);

  const AllMemberDetails = useSelector(SelectAddMembers);
  const AllMembersStatus = useSelector(getAddMembersStatus);
  const AllMemberError = useSelector(getAddMembersError);

  const AllDeathMemberDetails = useSelector(selectDeathMemberDetails);
  const AllDeathMembersStatus = useSelector(getDeathMemberStatus);
  const AllDeathMemberError = useSelector(getDeathMemberError);

  const AllLeavingMemberDetails = useSelector(selectLeavingMemberDetails);
  const AllLeavingMemberStatus = useSelector(getLeavingMemberStatus);
  const AllLeavingMemberError = useSelector(getLeavingMemberError);
  const AllMarriageMemberDetails = useSelector(selectMarriageMemberDetails);
  const AllMarriageMembersStatus = useSelector(getMarriageMemberStatus);
  const AllMarriageMemberError = useSelector(getMarriageMemberError);

  const AllTypeMemberDetails = useSelector(selectAllMemberDetails);
  const AllTypeMembersStatus = useSelector(getAllMemberStatus);
  const AllTypeMemberError = useSelector(getAllMemberError);
  // console.log(AllMarriageMemberDetails,'AllMarriageMemberDetails');
  useEffect(() => {
    setDataSource(AllMemberDetails);
    setDeathMember(AllDeathMemberDetails);
    setLeavingMember(AllLeavingMemberDetails);
    setMarriageMember(AllMarriageMemberDetails);
    setAlltypeMeber(AllTypeMemberDetails)
  }, [
    AllMemberDetails,
    AllDeathMemberDetails,
    AllLeavingMemberDetails,
    AllMarriageMemberDetails,
    AllTypeMemberDetails,
  ]);

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

  const SelectOption = [
    {
      label: "Member Name",
      value: "MemberName",
    },
    {
      label: "Mobile Number",
      value: "phone_no",
    },
  ];

  const SelectMemberOption = [
    {
      label: "Member List",
      value: "memberList",
    },
    {
      label: "Death List",
      value: "deathList",
    },
    // {
    //   label: "Leaving List",
    //   value: "leavingList",
    // },
    {
      label: "Marriage Remove List",
      value: "marriageList",
    },
    {
      label: "All Member List",
      value: "All",
    }
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

  const handleSelectMember = (value) => {
    setMember(value);
  };

  const TableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Member Photo",
      render: (record) => {
        return (
          <Flex center={true}>
            {record?.member?.member_photo ? (
              <img
                src={`${record?.member?.member_photo}`}
                style={{
                  height: "70px",
                  width: "70px",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DummyMember;
                }}
              />
            ) : (
              <img
                src={DummyMember}
                alt=""
                width={100}
                style={{
                  height: "70px",
                  width: "70px",
                  objectFit: "cover",
                }}
              />
            )}
          </Flex>
        );
      },
    },
    {
      title: "Family ID",
      dataIndex: "family_no",
    },
    {
      title: "Member ID",
      render: (record) => {
        return <>{record?.member?.member_no}</>;
      },
    },
    {
      title: "Member Name",
      render: (text, record) => record.member?.member_name,
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record.member?.member_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.member?.member_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Gender",
      render: (record) => {
        return <>{record?.member?.member_gender}</>;
      },
    },
    {
      title: "Mobile Number",
      render: (text, record) => record.member?.member_mobile_number,
      filteredValue: search2Texts ? [search2Texts] : null,
      onFilter: (value, record) => {
        return (
          String(record.member?.member_mobile_number)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.member?.member_mobile_number).includes(
            value.toUpperCase()
          )
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
            {superUsers || role === userRolesConfig.ADMIN || memberListPermissions?.Family?.View ? (
              <Tooltip title="View">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => ViewMemberProfile(record)}
                >
                  <img src={SvgIcons.Eye} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN || memberListPermissions?.Family?.View ? (
              <Tooltip title="Balance Sheet">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => ViewMemberBalanceSheet(record)}
                  data-testid={`member-balance-sheet-btn-${record?.member?.id}`}
                >
                  <img src={SvgIcons.Money} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {/* <img src={SvgIcons.Eye} onClick={() => ViewMemberProfile(record)} /> */}
            {/* <img src={SvgIcons.Edit} onClick={() =>UpdateMemberlist(record) }/> */}
            {/* <img src={SvgIcons.HandMoney} style={{cursor:"pointer"}}  onClick={handleNavigate} /> */}
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
      title: "Member Photo",
      render: (record) => {
        return (
          <Flex center={true}>
            {record?.member?.member_photo ? (
              <img
                src={`${record?.member?.member_photo}`}
                style={{
                  height: "70px",
                  width: "70px",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DummyMember;
                }}
              />
            ) : (
              <img
                src={DummyMember}
                alt=""
                width={100}
                style={{
                  height: "70px",
                  width: "70px",
                  objectFit: "cover",
                }}
              />
            )}
          </Flex>
        );
      },
    },
    {
      title: "Family ID",
      dataIndex: "family_no",
    },
    {
      title: "Member ID",
      render: (record) => {
        return <>{record?.member?.member_no}</>;
      },
    },
    {
      title: "Member Name",
      render: (text, record) => record.member?.member_name,
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record.member?.member_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.member?.member_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Gender",
      render: (record) => {
        return <>{record?.member?.member_gender}</>;
      },
    },
    {
      title: "Mobile Number",
      render: (text, record) => record.member?.member_mobile_number,
      filteredValue: search2Texts ? [search2Texts] : null,
      onFilter: (value, record) => {
        return (
          String(record.member?.member_mobile_number)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.member?.member_mobile_number).includes(
            value.toUpperCase()
          )
        );
      },
    },
    {
      title: "Address",
      dataIndex: "address",
    },
  ]

  const ViewMemberProfile = (record) => {
    navigate(`/memberProfileView/${record?.member?.id}`);
  };

  const ViewMemberBalanceSheet = (record) => {
    navigate(`/memberProfileView/${record?.member?.id}?tab=balance`);
  };

  const FormExternalClose = () => {
    handleOk();
  };

  // ---- Card view renderer ----
  const renderCardGrid = (list) => {
    if (!list || list.length === 0)
      return <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No records found</div>;

    const filtered = list.filter((r) => {
      const name = r.member?.member_name || '';
      const phone = r.member?.member_mobile_number || '';
      const matchName = !searchTexts || name.toLowerCase().includes(String(searchTexts).toLowerCase());
      const matchPhone = !search2Texts || phone.includes(String(search2Texts));
      return matchName && matchPhone;
    });

    return (
      <CardGrid>
        {filtered.map((record) => {
          const mem = record?.member || {};
          return (
            <MemberCard key={mem.id} onClick={() => ViewMemberProfile(record)}>
              <MemberAvatar>
                <img
                  src={mem.member_photo || DummyMember}
                  onError={(e) => { e.target.onerror = null; e.target.src = DummyMember; }}
                  alt="member"
                />
              </MemberAvatar>
              <MemberBadge>{mem.member_no || '—'}</MemberBadge>
              <MemberName>{mem.member_name || '—'}</MemberName>
              <MemberInfo>{mem.member_gender || ''} · Fam: {record.family_no || '—'}</MemberInfo>
              <MemberInfo>{mem.member_mobile_number || '—'}</MemberInfo>
              <MemberInfo style={{ fontSize: '10px' }}>{record.address || ''}</MemberInfo>
              <CardActions>
                {(superUsers || role === userRolesConfig.ADMIN || memberListPermissions?.Family?.View) && (
                  <Tooltip title="View Profile">
                    <TableIconHolder size={"28px"} onClick={(e) => { e.stopPropagation(); ViewMemberProfile(record); }}>
                      <img src={SvgIcons.Eye} style={{ cursor: "pointer" }} />
                    </TableIconHolder>
                  </Tooltip>
                )}
                {(superUsers || role === userRolesConfig.ADMIN || memberListPermissions?.Family?.View) && (
                  <Tooltip title="Balance Sheet">
                    <TableIconHolder size={"28px"} onClick={(e) => { e.stopPropagation(); ViewMemberBalanceSheet(record); }} data-testid={`member-balance-sheet-btn-${mem.id}`}>
                      <img src={SvgIcons.Money} style={{ cursor: "pointer" }} />
                    </TableIconHolder>
                  </Tooltip>
                )}
              </CardActions>
            </MemberCard>
          );
        })}
      </CardGrid>
    );
  };

  let content;

  if (AllMembersStatus === "loading") {
    content = <CommonLoading />;
  } else if (AllMembersStatus === "succeeded") {
    const rowKey = (dataSource) => dataSource?.member?.id;
    content = viewMode === 'card' ? renderCardGrid(dataSource) : (
      <CustomStandardTable
        columns={TableColumn}
        data={dataSource}
        rowKey={rowKey}
      />
    );
  } else if (AllMembersStatus === "failed") {
    content = <h2>{AllMemberError} </h2>;
  }

  let content1;

  if (AllDeathMembersStatus === "loading") {
    content1 = <CommonLoading />;
  } else if (AllDeathMembersStatus === "succeeded") {
    const rowKey = (deathMember) => deathMember?.member?.id;
    content1 = viewMode === 'card' ? renderCardGrid(deathMember) : (
      <CustomStandardTable
        columns={TableColumn}
        data={deathMember}
        rowKey={rowKey}
      />
    );
  } else if (AllDeathMembersStatus === "failed") {
    content1 = <h2>{AllDeathMemberError} </h2>;
  }

  let content2;

  if (AllLeavingMemberStatus === "loading") {
    content2 = <CommonLoading />;
  } else if (AllLeavingMemberStatus === "succeeded") {
    const rowKey = (leavingMember) => leavingMember?.member?.id;
    content2 = viewMode === 'card' ? renderCardGrid(leavingMember) : (
      <CustomStandardTable
        columns={TableColumn}
        data={leavingMember}
        rowKey={rowKey}
      />
    );
  } else if (AllLeavingMemberStatus === "failed") {
    content2 = <h2>{AllLeavingMemberError} </h2>;
  }

  let content3;

  if (AllMarriageMembersStatus === "loading") {
    content3 = <CommonLoading />;
  } else if (AllMarriageMembersStatus === "succeeded") {
    const rowKey = (marriageMember) => marriageMember?.member?.id;
    content3 = viewMode === 'card' ? renderCardGrid(marriageMember) : (
      <CustomStandardTable
        columns={TableColumn}
        data={marriageMember}
        rowKey={rowKey}
      />
    );
  } else if (AllMarriageMembersStatus === "failed") {
    content3 = <h2>{AllMarriageMemberError} </h2>;
  }

  let content4;

  if (AllTypeMembersStatus === "loading") {
    content4 = <CommonLoading />;
  } else if (AllTypeMembersStatus === "succeeded") {
    const rowKey = (allTypeMember) => allTypeMember?.member?.id;
    content4 = viewMode === 'card' ? renderCardGrid(allTypeMember) : (
      <CustomStandardTable
        columns={TableColumn}
        data={allTypeMember}
        rowKey={rowKey}
      />
    );
  } else if (AllTypeMembersStatus === "failed") {
    content4 = <h2>{AllTypeMemberError} </h2>;
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });


  return (
    <div>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={6}>
            {Member === "memberList" && (
              <CustomPageTitle Heading={"Member List"} />
            )}
            {Member === "deathList" && (
              <CustomPageTitle Heading={"Death Member List"} />
            )}
            {/* {Member === "leavingList" && (
              <CustomPageTitle Heading={"Leaving Member List"} />
            )} */}
            {Member === "marriageList" && (
              <CustomPageTitle Heading={"Marriage Member List"} />
            )}
            {Member === "All" && (
              <CustomPageTitle Heading={"All Member List"} />
            )}
          </Col>
          <Col span={24} md={6}>
            <CustomSelect
              name={"SelectMember"}
              placeholder={"Select..."}
              options={SelectMemberOption}
              onChange={handleSelectMember}
              defaultValue={"All"}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomRow space={[12, 12]}>
              <Col span={24} md={10}>
                <CustomSelect
                  name={"Select"}
                  placeholder={"Select"}
                  options={SelectOption}
                  onChange={handleSelect}
                />
              </Col>
              <Col span={24} md={10}>
                {filer === "MemberName" ? (
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
              <Col span={24} md={4} style={{ display: 'flex', alignItems: 'center' }}>
                <ViewToggle>
                  <Tooltip title="Table View">
                    <ToggleBtn active={viewMode === 'table'} onClick={() => setViewMode('table')} data-testid="view-toggle-table">
                      <BsListUl />
                    </ToggleBtn>
                  </Tooltip>
                  <Tooltip title="Card View">
                    <ToggleBtn active={viewMode === 'card'} onClick={() => setViewMode('card')} data-testid="view-toggle-card">
                      <BsGrid3X3Gap />
                    </ToggleBtn>
                  </Tooltip>
                </ViewToggle>
              </Col>
            </CustomRow>
          </Col>
          <Col span={24} md={24}>
            {Member === "memberList" && content}
            {Member === "deathList" && content1}
            {/* {Member === "leavingList" && content2} */}
            {Member === "marriageList" && content3}
            {Member === "All" && content4}
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
            <h3 style={{ textAlign: 'center' }}>Member Details</h3><br />
            {Member === "memberList" ?
              <CustomStandardTable columns={TableColumnPrint}
                data={dataSource}
                pagination={false} /> : Member === "deathList" ?
                <CustomStandardTable columns={TableColumnPrint}
                  data={deathMember}
                  pagination={false} /> 
                  // :
                  //  Member === "leavingList" ?
                  // <CustomStandardTable columns={TableColumnPrint}
                  //   data={leavingMember}
                  //   pagination={false} /> 
                    : Member === "marriageList" ?
                    <CustomStandardTable columns={TableColumnPrint}
                      data={marriageMember}
                      pagination={false} /> : <CustomStandardTable columns={TableColumnPrint}
                        data={allTypeMember} pagination={false} />
            }

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

export default MemberList;
