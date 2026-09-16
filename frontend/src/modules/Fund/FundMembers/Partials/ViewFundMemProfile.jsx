import { CustomTabs } from '@components/form/CustomTabs'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { APIURLS } from '@request/apiUrls/urls'
import request from '@request/request'
import { Col } from 'antd'
import React, { Fragment, useEffect } from 'react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import FundMemBalanceSheet from './FundMemBalanceSheet'
import FundMemLeaseHistory from './FundMemLeaseHistory'
import PaidHistory from './PaidHistory'

const Totalstyle = styled.div`
    & h3 {
        margin: 10px 0;
        & span {
            color: #929292;
            margin-left: 4px;
        }
    }
`
  const ViewFundMemProfile= () => {

    const {id} = useParams()
    const [memberDetails,setMemberDetails] = useState([])
    const [balHistory,setBalHistory] = useState([])
    const [historyDetails,setHistoryDetails] = useState([])
    const [paidHistory,setPaidHistory] = useState([])


    useEffect(() => {
        GetFoundgroupMember()
    }, [])
    
    const GetFoundgroupMember = async (record) => {
        request
          .get(`${APIURLS.GET_FUNDGROUP_MEMBER}/${id}/`)
          .then(function (response) {
            setMemberDetails(response.data?.profile)
            setBalHistory(response.data?.balance_sheet)
            setHistoryDetails(response.data?.lease_histry)
            setPaidHistory(response.data?.paid_histry)
            return response.data;
          })
          .catch(function (error) {
          });
      };
    const TabOptions =[
        {
            key: "1",
            label: "Balance Sheet",
            children: <FundMemBalanceSheet balsheetRecord={balHistory}/>
        },
        {
            key: "2",
            label: "Fund Lease History",
            children: <FundMemLeaseHistory historyDetails={historyDetails}/>
        },  
        {
            key: "3",
            label: "Payment History",
            children: <PaidHistory paidHistory={paidHistory}/>
        },  
    ]
  return (
    <Fragment>
    <CustomCardView>
        <CustomRow space={[12, 12]}>
            <Col span={24} md={24}>
                <CustomPageTitle Heading={'Fund Member Profile'} />
            </Col>
            <Col span={24} md={24}>
                <CustomRow>
                    <Col span={24} md={14}>
                        <Totalstyle>
                            <h3>Member Name : <span>{memberDetails?.member_name}</span></h3>
                            <h3>Address: <span>{memberDetails?.address}</span></h3>
                            <h3>Mobile Number : <span>{memberDetails?.mobile_no}</span></h3>
                            <h3>Email : <span>{memberDetails?.email}</span></h3>
                        </Totalstyle>
                    </Col>
                    <Col span={24} md={10}>
                        <Totalstyle>
                            <h3>Member No: <span> {memberDetails?.member_no}</span></h3>
                        </Totalstyle>
                    </Col>
                </CustomRow>
            </Col>

            <Col span={24} md={24}>
                <CustomTabs tabs={TabOptions} />
            </Col>
        </CustomRow>

    </CustomCardView>
  
</Fragment>
  )
}

export default ViewFundMemProfile