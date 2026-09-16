import { CustomRow } from '@components/others'
import { Col } from 'antd'
import React from 'react'
import styled from 'styled-components'

const TotalStyle = styled.div`
  & h4 {
    padding: 10px 20px;
    & span {
      margin-left: 5px;
      color: #838383;
    }
  }
`

const FundsView = ({ viewfundlist }) => {

  return (
    <TotalStyle>
      <CustomRow>
        <Col span={24} md={12}>
          <h4>Date: <span>{viewfundlist?.date}</span></h4>
          <h4>Fund Name: <span>{viewfundlist?.fund_name}</span></h4>
        </Col>
        <Col span={24} md={12}>
          <h4>Start Date: <span>{viewfundlist?.start_date}</span></h4>
          <h4>End Date: <span>{viewfundlist?.end_date}</span></h4>
          <h4>Fund Type: <span>{viewfundlist?.fund_type}</span></h4>
        </Col>
      </CustomRow>
    </TotalStyle>
  )
}

export default FundsView
