import {
  Button,
  CustomDatePicker,
  CustomInput,
  CustomInputNumber,
  CustomTable,
  CustomTextArea,
} from "@components/form";
import { CustomTabs } from "@components/form/CustomTabs";
import {
  CustomCardView,
  CustomModal,
  CustomRow,
  Flex,
} from "@components/others";
import {
  CustomPageFormSubTitle,
  CustomPageFormTitle,
  CustomPageTitle,
} from "@components/others/CustomPageTitle";
import { Col, Form } from "antd";
import React, { Fragment, useEffect, useState } from "react";
// import { MemberBalanceSheet, MemberChitFundList, MemberHistoryofPenalty, MemberInterestHistory, MemberPaidHistory, MemberPendingAmount } from './fundDetailsTabs'
import request, { IMG_BASE_URL } from "@request/request";
import { useParams } from "react-router-dom";
import { APIURLS } from "@request/apiUrls/urls";
import successHandler from "@request/successHandler";
import styled from "styled-components";
import { FaCameraRotate } from "react-icons/fa6";
import { StyledHeading, StyledTabSelected } from "@modules/Fund/style";
import { useDispatch, useSelector } from "react-redux";
import {
  getFundList,
  selectFundDetails,
} from "@modules/Fund/FundSlice";
import BalanceSheet from "./BalanceSheet";
import FundLeaseHistory from "./FundLeaseHistory";
import ViewFundMembers from "@modules/Fund/FundMembers/Partials/ViewFundMembers";
import FundLease from "@modules/Fund/FundLease";
import ViewProfileFundLease from "./ViewProfileFundLease";

const CardStyle = styled.div`
  border: 2px solid #990000;
  /* background-color: #fff; */
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 10px 20px;
  margin: 10px 10px;
  & h3 {
    margin: 10px 0;
    & span {
      color: #929292;
      margin-left: 4px;
    }
  }
`;
const ResponsiveCustomRow = styled(CustomRow)`
  @media (max-width: 768px) {
    flex-direction: column; /* Change direction to column for smaller screens */
  }
`;

const ResponsiveCol = styled(Col)`
  @media (max-width: 768px) {
    width: 100%; /* Set width to 100% for smaller screens */
  }
`;

const ViewfundDetails = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const dispatch = useDispatch();

  const [fundDetails, setFoundDetails] = useState([]);
  const [leaseDetails, setLeaseDetails] = useState([]);

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

  useEffect(() => {
    dispatch(getFundList());
  }, []);

  const AllFundList = useSelector(selectFundDetails);
  const FindFundDetails = AllFundList?.find((fun) => fun.id == id);

  useEffect(() => {
    setFoundDetails(FindFundDetails);
  }, [FindFundDetails]);

  const openModal = (record) => {
    setModelwith(400);
    setModalContent(<ImageView Imgrecord={record} />);
    showModal();
  };
  useEffect(() => {
    GetViewProfileFundLease()
  }, [])

  const GetViewProfileFundLease = async () => {
    await request.get(`${APIURLS.VIEWPROFILE_FUND_LEASE_BASEDON_MEMBER}/${id}/`)
      .then(function (response) {
        successHandler(response, {
          type: 'success'
        })
        setLeaseDetails(response.data)
        return response.data;
      })
      .catch(function (error) {
      })
  }
  const ImageView = ({ Imgrecord }) => {
    return (
      <>
        <CustomPageTitle Heading={"Profile Picture"} />
        <br />
        <img src={Imgrecord} width={"100%"} height={"100%"} />
      </>
    );
  };
  const MemberDetails = "";

  const ViewFundTabs = [
    {
      key: "1",
      label: "View Fund Members",
      children: (
        <ViewFundMembers fundmembersDetails={FindFundDetails?.fund_group} />
      ),
    },
    {
      key: "2",
      label: "View Fund Lease",
      children: <ViewProfileFundLease leaseDetails={leaseDetails} GetViewProfileFundLease={GetViewProfileFundLease} />,
    },
  ];

  const TabOptions = [
    {
      key: "1",
      label: "Balance Sheet",
      children: <BalanceSheet />,
    },
    {
      key: "2",
      label: "Fund LeaseHistory",
      children: <FundLeaseHistory />,
    },
  ];

  const SheetClick = () => {
    <StyledTabSelected />;
  };



  // const mem

  const handleAddFundLeaseModal = () => {
    setModelwith(700);
    setModalContent(<FundLease />);
    showModal();
  };

  return (
    <Fragment>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={24} style={{ marginBottom: '-80px' }}>
            <CustomPageTitle Heading={"Fund Details"} />
          </Col>
          <Col span={24} md={24} >
            <Flex end={true} gap={'20px'} style={{ marginLeft: '15px', lineHeight: '50px' }}>
              <h3 style={{ fontweight: '400' }}>
                From Date :&nbsp;&nbsp; <span style={{ fontweight: '400', color: '#545454' }}>{fundDetails?.from_date}</span>
              </h3>
            </Flex>
            <Flex end={true} gap={'20px'} style={{ marginLeft: '15px' }}>
              <h3>
                To Date:&nbsp;&nbsp; <span style={{ fontweight: '400', color: '#545454' }}>{fundDetails?.to_date}</span>
              </h3>
            </Flex>
          </Col>
          <Col span={24} md={24}>
            <CustomRow>
              <Col span={24} md={8} >
                <h3 style={{ color: 'red', margin: '0px 15px' }}>Fund Details :</h3>
                <CardStyle>
                  <h3>
                    Fund Name : <span>{fundDetails?.fund_name}</span>
                  </h3>
                  <h3>
                    Fund Type : <span>{fundDetails?.fund_type}</span>
                  </h3>
                  {/* <h3>
                    From Date : <span>{fundDetails?.from_date}</span>
                  </h3>
                  <h3>
                    To Date: <span>{fundDetails?.to_date}</span>
                  </h3> */}
                  {fundDetails?.fund_type !== "Normal" && <>
                    <h3>
                      Month Count : <span>{fundDetails?.month_count}</span>
                    </h3>
                    <h3>
                      Total Fund Count:
                      <span>{fundDetails?.total_fund_count}</span>{" "}
                    </h3>
                  </>}
                  <h3>
                    Fund Available Amt: <span>{fundDetails?.cash_available_amount}</span>
                  </h3>
                </CardStyle>
              </Col>
              <Col span={24} md={8}>
                <h3 style={{ color: 'red', margin: '0px 15px' }}>Head Details :</h3>
                <CardStyle>
                  <h3>
                    Head Name: <span> {fundDetails?.head_name}</span>
                  </h3>
                  <h3>
                    Head Member No: <span> {fundDetails?.head_member_no}</span>
                  </h3>
                  <h3>
                    Fixed Fund Count:{" "}
                    <span> {fundDetails?.fixed_fund_count}</span>
                  </h3>
                  <h3>
                    Fixed Fund Amount:{" "}
                    <span> {fundDetails?.fixed_fund_amount}</span>
                  </h3>
                  <h3>
                    Per Head Amount:{" "}
                    <span> {fundDetails?.per_head_collection_amount}</span>
                  </h3>
                </CardStyle>
              </Col>
              <Col span={24} md={8}>
                <h3 style={{ color: 'red', margin: '0px 15px' }}>Secretrary/Treasury Details :</h3>
                <CardStyle>
                  <h3>
                    Secretrary Name:{" "}
                    <span> {fundDetails?.secretrary_name}</span>
                  </h3>
                  <h3>
                    Secretary Member No:{" "}
                    <span> {fundDetails?.secretrary_member_no}</span>
                  </h3>
                  <h3>
                    Treasury Name: <span> {fundDetails?.treasury_name}</span>
                  </h3>
                  <h3>
                    Treasury Member No:{" "}
                    <span> {fundDetails?.treasury_member_no}</span>
                  </h3>
                  <h3>
                    {" "}
                    <span> </span>
                  </h3>
                </CardStyle>
              </Col>
            </CustomRow>
          </Col>
          <Col span={24} md={24}>
            <CustomTabs tabs={ViewFundTabs} />
          </Col>

          {/* <Col span={24} md={24}>
            <CustomTabs tabs={TabOptions} />
          </Col> */}

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
    </Fragment>
  );
};

export default ViewfundDetails;
