import { SvgIcons } from "@assets/Svg";
import { TableIconHolder } from "@components/common/Styled";
import {
  Button,
  CustomInput,
  CustomSelect,
} from "@components/form";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import { CommonLoading, CustomCardView, CustomRow, Flex } from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";
import { userRolesConfig } from "@router/config/roles";
import { Col, Tooltip } from "antd";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoPrint } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getChitCapitalError,
  getChitCapitalStatus,
  getChitFundCapital,
  getChitFundInterest,
  getChitFundIntresetError,
  getChitFundIntresetsStatus,
  getChitInstallMent,
  getChitInstallMentError,
  getChitInstallMentStatus,
  selectChitCapitalDetails,
  selectChitFundIntresetDetails,
  selectChitInstallMentDetails,
} from "../InterestSlice";
import { useReactToPrint } from "react-to-print";
import dayjs from "dayjs";
import { CommonManagePrintName, PrintHolder, PrintShowData } from "@modules/ComManagePrintDetails/CommonManagePrint";
import CustomPopconfirm from "@components/others/CustomPopConfirm";
import request from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";
import { toast } from "react-toastify";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";

const ChitFundInterest = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const componentRef = useRef();
  const [dataSource, setDataSource] = useState([]);
  const [installMent, setInstallMent] = useState([]); //----------- Use Chit-Fund InstallMent
  const [capital, setCapital] = useState([]); //----------- Use Chit-Fund InstallMent
  const [filer, setFiler] = useState({});
  const [interestCategory, setInterestCategory] = useState('Chit_Fund_Interest'); //------ Use Interest Category Options -----
  const [searchTexts, setSearchTexts] = useState([]); //---------Seach Bar 1--------
  const [search2Texts, setSearch2Texts] = useState([]); //---------Seach Bar 2--------

  useEffect(() => {
    dispatch(getChitFundInterest());
    dispatch(getChitInstallMent());
    dispatch(getChitFundCapital());
  }, []);

  const AllChitFundInterest = useSelector(selectChitFundIntresetDetails);
  const AllChitFundInterestStatus = useSelector(getChitFundIntresetsStatus);
  const AllChitFundInterestError = useSelector(getChitFundIntresetError);


  const AllChitFundInstallMent = useSelector(selectChitInstallMentDetails);
  const AllChitFundInstallMentStatus = useSelector(getChitInstallMentStatus);
  const AllChitFundInstallMentError = useSelector(getChitInstallMentError);

  const AllChitFundCapital = useSelector(selectChitCapitalDetails);
  const AllChitFundCapitalStatus = useSelector(getChitCapitalStatus);
  const AllChitFundCapitalError = useSelector(getChitCapitalError);

  const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
  const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
  const ChitIntPermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

  useEffect(() => {
    setDataSource(AllChitFundInterest);
    setInstallMent(AllChitFundInstallMent);
    setCapital(AllChitFundCapital);
  }, [AllChitFundInterest, AllChitFundInstallMent, AllChitFundCapital]);

  const SelectOption = [
    {
      label: "Person Name",
      value: "MemberName",
    },
    {
      label: "Intrest No",
      value: "phone_no",
    },
  ];

  const ProfileOnchange = (record) => {
    navigate(`/chit-Fund_Interest/${record?.id}`);
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

  //============ Interest Type options ===

  const InterestCategoryOptions = [
    {
      label: "Chit Fund Interest",
      value: "Chit_Fund_Interest",
    },
    {
      label: "Chit Fund Installment",
      value: "Chit_Fund_Installment",
    },
    {
      label: "Chit Fund Capital",
      value: "Chit_Fund_Capital",
    },
  ];

  const handleInterestCategory = (value) => {
    setInterestCategory(value);
  };
  const DeleteChitInterestDetails = async (record) => {
    await request
      .delete(`${APIURLS.DELETE_MANAGEMENT_INTEREST}/${record?.id}/`, record)
      .then(function (response) {
      
        if(response?.status === 226){
          toast.warn(response?.data?.msg)
        }
        else{
          successHandler(response, {
            notifyOnSuccess: true,
            notifyOnFailed: true,
            msg: "success",
            type: "success",
          });
          dispatch(getChitFundInterest());
          dispatch(getChitInstallMent());
          dispatch(getChitFundCapital());
        }
        return response.data;
      })
      .catch(function (error) {
        if (error?.response?.status === 302) {
          toast.error(error.response.data?.message)
        } else {
          errorHandler(error);
        }
      });
  };

  const TableColumn = [
    {
      title: "S.No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Intrest No",
      dataIndex: "intrest_no",
      filteredValue: search2Texts ? [search2Texts] : null,
      onFilter: (value, record) => {
        return (
          String(record.intrest_no)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.intrest_no).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Chit Fund Name",
      dataIndex: "chit_name",
    },
    
    {
      title: "Person Name",
      dataIndex: "people_name",
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record.people_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.people_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Principal Amount",
      dataIndex: "principal_amt",
    },
    {
      title: "Interest Amount",
      dataIndex: "interest_amt",
    },
    {
      title: "Action",
      render: (text, record, index) => {
        return (
          <Flex gap={"20px"} center={"true"}>
            {superUsers ||
              role === userRolesConfig.ADMIN ||
              ChitIntPermission?.Interest?.View ? (
              <Tooltip title="Profile">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => ProfileOnchange(record)}
                >
                  <img src={SvgIcons.Person} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>) : null}
            {/* <Tooltip title="Edit">
                        <TableIconHolder size={'28px'} onClick={() => InterestEdit(record)}>
                            <img src={SvgIcons.Edit} style={{cursor:'pointer'}}/>
                        </TableIconHolder>
                    </Tooltip> */}
            {/* <img src={SvgIcons.Edit} onClick={() => EditFundMemberProfile(record)} /> */}

            {superUsers ||
              role === userRolesConfig.ADMIN ||
              ChitIntPermission?.Interest?.Delete ? (
              <CustomPopconfirm
                title="Confirmation"
                description="Are you sure you want to remove this Chit-Interest detail?"
                okText="Yes"
                cancelText="No"
                confirm={() => DeleteChitInterestDetails(record)}
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
      title: "S.No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Chit Fund Name",
      dataIndex: "chit_name",
    },
    {
      title: "Intrest No",
      dataIndex: "intrest_no",
    },
    {
      title: "Person Name",
      dataIndex: "people_name",
    },
    {
      title: "Principal Amount",
      dataIndex: "principal_amt",
    },
    {
      title: "Interest Amount",
      dataIndex: "interest_amt",
    },
  ];

  let content;

  if (AllChitFundInterestStatus === 'loading') {
    content = <CommonLoading />
  } else if (AllChitFundInterestStatus === 'succeeded') {
    const rowKey = (dataSource) => dataSource?.member?.id;
    content = <CustomStandardTable columns={TableColumn} data={dataSource} rowKey={rowKey} />
  } else if (AllChitFundInterestStatus === 'failed') {
    content = <h2>{
      AllChitFundInterestError} </h2>
  }

  let content1;

  if (AllChitFundInstallMentStatus === 'loading') {
    content1 = <CommonLoading />
  } else if (AllChitFundInstallMentStatus === 'succeeded') {
    const rowKey = (installMent) => installMent?.id;
    content1 = <CustomStandardTable columns={TableColumn} data={installMent} rowKey={rowKey} />
  } else if (AllChitFundInstallMentStatus === 'failed') {
    content1 = <h2>{
      AllChitFundInstallMentError} </h2>
  }

  let content2;

  if (AllChitFundCapitalStatus === 'loading') {
    content2 = <CommonLoading />
  } else if (AllChitFundCapitalStatus === 'succeeded') {
    const rowKey = (capital) => capital?.id;
    content2 = <CustomStandardTable columns={TableColumn} data={capital} rowKey={rowKey} />
  } else if (AllChitFundCapitalStatus === 'failed') {
    content2 = <h2>{
      AllChitFundCapitalError} </h2>
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const CurrentDate = dayjs().format('DD-MM-YYYY')


  return (
    <div>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={6}>
            {interestCategory === "Chit_Fund_Interest" && (
              <CustomPageTitle Heading={"Chit-Fund Interest"} />
            )}
            {interestCategory === "Chit_Fund_Installment" && (
              <CustomPageTitle Heading={"Chit-Fund Installment"} />
            )}
            {interestCategory === "Chit_Fund_Capital" && (
              <CustomPageTitle Heading={"Chit-Fund Capital"} />
            )}
          </Col>
          <Col span={24} md={6}>
            <CustomSelect
              placeholder={"Select..."}
              options={InterestCategoryOptions}
              onChange={handleInterestCategory}
              defaultValue={"Chit_Fund_Interest"}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomRow space={[12, 12]}>
              <Col span={24} md={12}>
                <CustomSelect
                  name={"Select"}
                  placeholder={"Select"}
                  options={SelectOption}
                  onChange={handleSelect}
                />
              </Col>
              <Col span={24} md={12}>
                {filer === "MemberName" ? (
                  <CustomInput
                    value={searchTexts}
                    placeholder="Search Name"
                    onSearch={handleSearchs}
                    onChange={(e) => handleSearchs(e.target.value)}
                  />
                ) : (
                  <CustomInput
                    value={search2Texts}
                    placeholder="Search Intrest No"
                    onSearch={handle2Search}
                    onChange={(e) => handle2Search(e.target.value)}
                  />
                )}
              </Col>
            </CustomRow>
          </Col>
          <Col span={24} md={24}>
            {interestCategory === "Chit_Fund_Interest" && (
              content
            )}
            {interestCategory === "Chit_Fund_Installment" && (
              content1
            )}
            {interestCategory === "Chit_Fund_Capital" && (
              content2
            )}
          </Col>
        </CustomRow>

        <Flex flexend={"right"} style={{ marginTop: "10px" }}>
          <CustomPopconfirm
            title="Recompute balance from audit trail?"
            description="Rebuilds every interest record's balance from InterestPeopleReport transactions to heal any drift. Idempotent."
            confirm={async () => {
              try {
                const { data } = await request.post(
                  APIURLS.RECOMPUTE_INTEREST_BALANCE,
                  {}
                );
                toast.success(
                  `Healed drift on ${data?.data?.records_needing_fix || 0} of ${data?.data?.records_scanned || 0} records (₹${data?.data?.total_drift_healed || 0}).`
                );
                dispatch(getChitFundInterest());
              } catch (e) {
                errorHandler(e);
              }
            }}
          >
            <Button.Secondary
              text={"Recompute Balances"}
              data-testid="recompute-chit-interest-balance-btn"
            />
          </CustomPopconfirm>
          <CustomPopconfirm
            title="Apply overdue charges?"
            description="Backfills missed monthly interest and 20th-of-month penalties for every unpaid chit-fund interest record. Idempotent."
            confirm={async () => {
              try {
                const { data } = await request.post(
                  APIURLS.APPLY_OVERDUE_INTEREST,
                  {}
                );
                toast.success(
                  `Applied — Interest: ₹${data?.data?.added_interest_total || 0}, Penalty: ₹${data?.data?.added_penalty_total || 0} across ${data?.data?.records_processed || 0} records.`
                );
                dispatch(getChitFundInterest());
              } catch (e) {
                errorHandler(e);
              }
            }}
          >
            <Button.Primary
              text={"Apply Overdue Charges"}
              data-testid="apply-overdue-chit-interest-btn"
            />
          </CustomPopconfirm>
          <a href="https://web.whatsapp.com/" target="blank">
            <Button.Primary text={"Share"} icon={<FaWhatsapp />} />
          </a>
          <Button.Secondary text={"Print"} icon={<IoPrint />} onClick={handlePrint} />
        </Flex>

        <PrintHolder ref={componentRef}>
          <PrintShowData className="PrintShowDatadd">
            <CommonManagePrintName />
            <h5 style={{ textAlign: 'end', marginRight: '20px' }}>Date :{CurrentDate} </h5><br />
            {interestCategory === "Chit_Fund_Interest" && (
              <>
                <h3 style={{ textAlign: 'center' }}>Chit Fund Interest</h3><br />
                <CustomStandardTable columns={TableColumnPrint} data={dataSource || []} pagination={false} />
              </>
            )}
            {interestCategory === "Chit_Fund_Installment" && (
              <>
                <h3 style={{ textAlign: 'center' }}>Chit Fund Installment</h3><br />
                <CustomStandardTable columns={TableColumnPrint} data={installMent || []} pagination={false} />
              </>
            )}
            {interestCategory === "Chit_Fund_Capital" && (
              <>
                <h3 style={{ textAlign: 'center' }}>Chit Fund Capital</h3><br />
                <CustomStandardTable columns={TableColumnPrint} data={capital || []} pagination={false} />
              </>
            )}

          </PrintShowData>
        </PrintHolder>

      </CustomCardView>
    </div>
  );
};

export default ChitFundInterest;
