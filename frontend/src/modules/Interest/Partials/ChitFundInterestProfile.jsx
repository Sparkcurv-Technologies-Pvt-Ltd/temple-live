import { CustomTabs } from '@components/form/CustomTabs';
import { CustomCardView, CustomModal, CustomRow, Flex } from '@components/others';
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import { APIURLS } from '@request/apiUrls/urls';
import errorHandler from '@request/errorHandler';
import request from '@request/request';
import { Col } from 'antd';
import React, { useEffect, useState } from 'react'
import { FaCameraRotate } from 'react-icons/fa6';
import { useParams } from 'react-router-dom'
import styled from 'styled-components';
import { InterestTabPaymentHistory, InterestTabSheet } from './ManagementInterestTabs';


const Totalstyle = styled.div`
  text-transform: capitalize;
    & h3 {
        margin: 20px 0;
        & span {
            color: #929292;
            margin-left: 4px;
        };
    }
    .HeadingText {
        color: red;
        font-size: 15px;
        font-weight: 800;
    }
`

const ChitFundInterestProfile = () => {

  const { id } = useParams();
  const [ManagementProfile, setManagementProfile] = useState({})

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
    GetFullDetails()
  }, [])

  const GetFullDetails = async (data) => {
    await request.get(`${APIURLS.MANAGEMENT_INTEREST_PROFILE_GET}/${id}/`, data)
      .then(function (response) {
        setManagementProfile(response.data)
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      })
  }

  const TabOptions = [
    {
      key: "1",
      label: "Payment History",
      children: <InterestTabPaymentHistory ManagementProfile={ManagementProfile?.paid_histry} />,
    },
    {
      key: "2",
      label: "Balance Sheet",
      children: <InterestTabSheet ManagementProfile={ManagementProfile?.report_ser} />,
    }
  ]

  const ProfileDetails = ManagementProfile?.profile;
  console.log(ProfileDetails, 'ProfileDetails');
  const openModal = (record) => {
    setModelwith(400)
    setModalContent(<ImageView Imgrecord={record} />);
    showModal();
  }

  const ImageView = ({ Imgrecord }) => {
    return (
      <>
        <CustomPageTitle Heading={'Profile Picture'} />
        <img src={Imgrecord} width={'100%'} height={'100%'} />
      </>
    )
  }

  return (
    <div>
      <CustomCardView>

        <CustomRow space={[12, 12]}>
          <Col span={24} md={24}>
            <CustomPageTitle Heading={`Chit-Fund ${ProfileDetails?.interest_category} Details`} />
          </Col>

          <Col span={24} md={20}>

            {/* <h1>Family No: {ManagementProfile?.profile?.people_name}</h1><br /> */}
            <CustomRow space={[8, 8]}>
              <Col span={24} md={12} lg={8}>
                <Totalstyle>
                  <div className='HeadingText'>Member Details</div>
                  <h3>Member Name : <span>{ProfileDetails?.people_name}</span></h3>
                  <h3>Mobile No : <span>{ProfileDetails?.people_mobile}</span></h3>
                  <h3>Email : <span>{ProfileDetails?.people_email}</span></h3>
                  <h3>Address : <span>{ProfileDetails?.people_address}</span></h3>
                  {ProfileDetails?.interest_category !== "Interest with capital" && <h3>penalty :<span>{ProfileDetails?.penalty_type === "amount" && "₹"}</span> <span>{ProfileDetails?.penalty_amount || 0} {ProfileDetails?.penalty_type === "percentage" && "%"} </span></h3>}
                  <h3>principal amt : <span>{ProfileDetails?.principal_amt || 0} </span></h3>
                </Totalstyle>
              </Col>

              <Col span={24} md={12} lg={8}>
                <Totalstyle> <div className='HeadingText'>Member interest Details</div>
                  <h3>interest Date : <span> {ProfileDetails?.interest_date}</span></h3>
                  <h3>interest No : <span> {ProfileDetails?.intrest_no}</span></h3>
                  <h3>Fixed rate :<span>{ProfileDetails?.interest_type_new === "amount" && "₹"}</span> <span>{ProfileDetails?.fix_interest_rate_percent || 0} {ProfileDetails?.interest_type_new === "percentage" && "%"} </span></h3>
                  <h3>interest type : <span> {ProfileDetails?.interest_type}</span></h3>
                 
                  <h3>interest category : <span>{ProfileDetails?.interest_category}</span></h3>
                  {ProfileDetails?.interest_category === "Installment Interest" && <><h3>interest period :
                    <span> {ProfileDetails?.interest_period}&nbsp;{ProfileDetails?.interest_period_type}</span></h3>
                   </>
                  }
                  <h3>interest amt : <span>{ProfileDetails?.interest_amt || 0}</span></h3>
                  {ProfileDetails?.interest_category === "Installment Interest" &&
                    <h3>Installment amt : <span>{ProfileDetails?.installment_amt || 0}</span></h3>}
                </Totalstyle>
              </Col>
              {ProfileDetails?.nominee_apply === true ?
                <Col span={24} md={12} lg={8}>
                  <Totalstyle>
                    <div className='HeadingText'>nominee Details</div>
                    <h3>member Name : <span> {ProfileDetails?.nominee_member_name}</span></h3>
                    <h3>Mobile no : <span> {ProfileDetails?.nominee_mobile_no}</span></h3>
                    <h3>address : <span> {ProfileDetails?.nominee_address}</span></h3>
                    <h3>Cheque No : <span> {ProfileDetails?.cheque_no}</span></h3>
                  </Totalstyle>
                </Col> : null}
            </CustomRow>
          </Col>
          <Col span={24} md={4}>
            <Flex end style={{
              objectFit: "cover", height: 'auto', position: 'relative'
            }} >
              <img src={`${ProfileDetails?.photo}`}
                style={{
                  border: '3px dotted',
                  padding: '2px', height: '100px', width: '100px'
                }}
                onClick={() => openModal(ProfileDetails?.photo)}
              />
              <FaCameraRotate fontSize='40px' color='red' style={{
                position: 'absolute', bottom: '-3px', right: '-15px', color: '#7c7c7c',
                background: 'white', borderRadius: '20px', padding: '3px',
                border: '1px solid'
              }} onClick={() => openModal(ProfileDetails?.photo)} />
            </Flex>
          </Col>
        </CustomRow>
        <Flex center={'true'}>
          <CustomTabs tabs={TabOptions} defaultActiveKey={'1'} />
        </Flex>
      </CustomCardView>
      <CustomModal isVisible={isModalOpen}
        handleOk={handleOk} handleCancel={handleCancel} width={modelwith}
        modalTitle={modalTitle} modalContent={modalContent} />
    </div>
  )
}

export default ChitFundInterestProfile