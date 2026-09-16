import { CustomRow } from '@components/others';
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import { Col } from 'antd';
import React, { Fragment } from 'react'
import styled from 'styled-components';

const Totalstyle = styled.div`
  padding: 0px 24px 24px 35px !important;

  & h2 {
    color: #010101;
    font-weight: 900;
  }
  & h3 {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    color: #646464;
    /* font-weight: 800; */
    /* height: 100%; */
    /* margin: auto; */
    font-size: 20px;
    /* margin-top: 6px; */
  }
`;

const FestivalView = ({ viewfestivallist }) => {

  return (
    <Totalstyle>
      <Fragment>
        <CustomRow>
          <Col span={24} md={12}>
            <CustomPageTitle Heading={'Festival List'} />
          </Col>
          <Col span={24} md={12} style={{ margin: '5px 0px' }}>
            <h3 style={{ fontWeight: 'large', color: "#000" }}>Festival No :<span style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>
              {viewfestivallist?.festival_no}</span></h3>
          </Col>
          <Col span={24} md={24}>
            <CustomRow>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>Date</h3>
                <span style={{ fontSize: '19px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewfestivallist?.date}</h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>Festival Name</h3>
                <span style={{ fontSize: '19px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewfestivallist?.festival_name}</h3>
              </Col>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>Tax Per Head</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewfestivallist?.tax_per_head}</h3>
              </Col>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>Start Date</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewfestivallist?.start_date}</h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>End Date</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewfestivallist?.end_date}</h3>
              </Col>

              {/* <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
            <h3  style={{ fontWeight: 'large', color:"#000" }}>Opening Balance</h3>
            <span style={{ fontSize: '15px' }}>:</span>
          </Col>
          <Col span={12} md={12}>
            <h3 style={{ paddingLeft: '5px' ,fontWeight: 'normal'}}>{viewfestivallist?.opening_balance}</h3>
          </Col> */}
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>Penalty Type</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewfestivallist?.choice}</h3>
              </Col>

              {viewfestivallist?.choice === "Percentage" && <>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Penalty %</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
                <Col span={12} md={12}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewfestivallist?.penalty_amt}</h3>
                </Col>
              </>}
              {viewfestivallist?.choice === "Amount" && <>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Penalty ₹</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
                <Col span={12} md={12}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewfestivallist?.penalty_amt}</h3>
                </Col>
              </>}


           </CustomRow>

        <h4></h4>
      </Col>
      <Col span={24} md={6}>

      </Col>
    </CustomRow>
    </Fragment>
    </Totalstyle>
  )
}
export default FestivalView


