import { CustomStandardTable } from '@components/form/CustomStandardTable';
import { CustomRow } from '@components/others';
import { CustomPageFormTitle, CustomPageTitle } from '@components/others/CustomPageTitle';
import { Col } from 'antd';
import React, { Fragment, useEffect } from 'react'
import { useState } from 'react';
import styled from 'styled-components';


const Totalstyle = styled.div`
  padding: 0px 24px 24px 25px !important;
`;

export const MovableRentalView = ({viewRentalorleaselist}) => {

    const [dataSource,setDataSource] = useState([])

    useEffect(() => {
        setDataSource(viewRentalorleaselist?.movable_rent)
    }, [viewRentalorleaselist])
    

    const columns = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
          },
          {
            title: "Asset Category",
            dataIndex: "asset_category_name",
          },
          {
            title: "Asset Name",
            dataIndex: "asset_name",
          },
          {
            title: "Quantity",
            dataIndex: "qnty",
          },
          {
            title: "Sale Amt",
            dataIndex: "sale_amt",
          },
          {
            title: "Total Amt",
            dataIndex: "total_amt",
          },
    ]
    return (
        <Totalstyle>
            <Fragment>
                <CustomRow>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'Movable Rental View'} />
                    </Col>
                    <Col span={24} md={12} style={{margin:'5px 0px'}}>
                       <h3 style={{ fontWeight: 'large', color:"#000" }}>Rent No:&nbsp;<span style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969"}}>
                       {viewRentalorleaselist?.rent_no}</span></h3>
                       </Col>
                    <Col span={24} md={22}>
                        <CustomRow>
                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color: "#000" }}>Date</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.date}</h3>
                            </Col>
                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color: "#000" }}>Tenat Name</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.tenat_name}</h3>
                            </Col>
                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color: "#000" }}>Tenat Type</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.tenat_type}</h3>
                            </Col>
                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color: "#000" }}>Tenat Number</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.tenat_mobile}</h3>
                            </Col>
                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color: "#000" }}>Tenat Address</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.tenat_address}</h3>
                            </Col>
                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color: "#000" }}>Total Rent Amt</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.total_rent_amt}</h3>
                            </Col>
                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color: "#000" }}>Advance Amt</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.advance_amt}</h3>
                            </Col>

                                      
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
              <h3 style={{ fontWeight: 'large', color:"#000" }}>Payment Mode</h3>
              <span style={{ fontSize: '15px' }}>:</span>
            </Col>
            <Col span={10} md={10}>
              <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewRentalorleaselist?.payment_mode}</h3>
            </Col>
            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
              <h3 style={{ fontWeight: 'large', color:"#000" }}>Transaction Type</h3>
              <span style={{ fontSize: '15px' }}>:</span>
            </Col>
            <Col span={10} md={10}>
              <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewRentalorleaselist?.transaction_type}</h3>
            </Col>

            {viewRentalorleaselist?.transaction_type === 'Bank' ?
              <>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color:"#000" }}>Bank name</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
  
                <Col span={10} md={10}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewRentalorleaselist?.bank_name}</h3>
                </Col>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color:"#000" }}>Bank Pay</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
  
                <Col span={10} md={10}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewRentalorleaselist?.bank_pay}</h3>
                </Col>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color:"#000" }}>Transaction No</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
  
                <Col span={10} md={10}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewRentalorleaselist?.trans_no}</h3>
                </Col>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color:"#000" }}>Transaction Date</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
  
                <Col span={10} md={10}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewRentalorleaselist?.transaction_date}</h3>
                </Col>
              </>
              : viewRentalorleaselist?.transaction_type === 'UPI' ?
                <>
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'large', color:"#000" }}>UPI ID</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>
    
                  <Col span={10} md={10}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewRentalorleaselist?.upi_id}</h3>
                  </Col>
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'large', color:"#000" }}>Transaction Date</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>
    
                  <Col span={10} md={10}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewRentalorleaselist?.transaction_date}</h3>
                  </Col>
                </> : viewRentalorleaselist?.transaction_type === 'Cheque' ?
                  <>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color:"#000" }}>Cheque Number</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
      
                    <Col span={10} md={10}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewRentalorleaselist?.trans_no}</h3>
                    </Col>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color:"#000" }}>Transaction Date</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
      
                    <Col span={10} md={10}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewRentalorleaselist?.transaction_date}</h3>
                    </Col>
                  </>
                  : null
            }

                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color: "#000" }}>comments</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.comments}</h3>
                            </Col>
                            <Col span={24} md={24} style={{marginTop:'10px'}}>
                                <CustomPageFormTitle Heading={'Rent Details :'}/>
                            </Col>
                            <Col span={12} md={24}>
                               <CustomStandardTable columns={columns}  data={dataSource}/>
                            </Col>
                        </CustomRow>
                    </Col>
                </CustomRow>
            </Fragment>

        </Totalstyle>
    )
}
