import { CustomRow } from '@components/others';
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import { Col } from 'antd';
import React from 'react'
import styled from 'styled-components';

const Totalstyle = styled.div`
  padding: 0px 24px 24px 35px !important;
`;

const MovableAssestView = ({viewmovable}) => {
  return (
    <Totalstyle>
      <div>
        <CustomRow>
          <Col span={24} md={24}>
            <CustomPageTitle Heading={'Movable Asset Details'} />
          </Col>
          <Col span={24} md={12}>
            <CustomRow>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color:"#000" }}>Asset Name</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}> {viewmovable?.asset_name} </h3>

              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color:"#000" }}>Category Name</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
              <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}> {viewmovable?.category_name} </h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color:"#000" }}>Total Qty</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewmovable?.total_qty}</h3>
              </Col>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color:"#000" }}>Available Qty</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewmovable?.avilable_qty}</h3>
              </Col>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color:"#000" }}>Rent Qty</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewmovable?.rent_qty}</h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color:"#000" }}>Sale Amount</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewmovable?.per_sale_amt}</h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color:"#000" }}>Comments</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewmovable?.comments}</h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color:"#000" }}>details</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewmovable?.details}</h3>
              </Col>

            </CustomRow>

          </Col>
        </CustomRow>
      </div>
    </Totalstyle>
  )
}

export default MovableAssestView