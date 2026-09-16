import { CustomRow } from '@components/others';
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import { IMG_BASE_URL } from '@request/request';
import { Col, Collapse } from 'antd';
import React, { Fragment } from 'react'
import styled from 'styled-components';

const Totalstyle = styled.div`
  padding: 0px 24px 24px 25px !important;
`;

const RentalorLeaseView = ({ viewRentalorleaselist }) => {

  const RentalDocument = viewRentalorleaselist?.documents?.replace(IMG_BASE_URL, "")

  return (
    <Totalstyle>
      <Fragment>
        <CustomRow>
          <Col span={24} md={12}>
            <CustomPageTitle Heading={'Rental / Lease List View'} />
          </Col>
          <Col span={24} md={12} style={{ margin: '5px 0px' }}>
            <h3 style={{ fontWeight: 'large', color: "#000" }}>R&L No :&nbsp;<span style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>
              {viewRentalorleaselist?.lease_rent_no}</span></h3>
          </Col>
          <Col span={24} md={18}>
            <CustomRow>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>Date</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.date}</h3>
              </Col>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>Type</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>
                  {viewRentalorleaselist?.rent ? "Rent" : "Lease"}</h3>
              </Col>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>asset name</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.asset_name}</h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>Asset Category</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.asset_category_name}</h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>Tenat Name</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.tenat_name}</h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>Tenat Mobile</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.tenat_mobile}</h3>
              </Col>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>Tenat Email</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>
                  {viewRentalorleaselist?.tenat_email !== null ? viewRentalorleaselist?.tenat_email : '     _'}</h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>Tenat Address</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.tenat_address}</h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>Start Date</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.start_date}</h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>End Date</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.end_date}</h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>Rent pay Type</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.rent_pay_type}</h3>
              </Col>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color: "#000" }}>Rent Amt</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.rent_amt}</h3>
              </Col>
              {viewRentalorleaselist?.rent && <>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Initial Advance Amt</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
                <Col span={12} md={12}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.initial_advance_amt}</h3>
                </Col>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Payment Mode</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
                <Col span={10} md={10}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.payment_mode}</h3>
                </Col>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Transaction Type</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
              </>
              }
              <Col span={10} md={10}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.transaction_type}</h3>
              </Col>

              {viewRentalorleaselist?.transaction_type === 'Bank' ?
                <>
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'large', color: "#000" }}>Bank name</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>

                  <Col span={10} md={10}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.bank_name}</h3>
                  </Col>
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'large', color: "#000" }}>Bank Pay</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>

                  <Col span={10} md={10}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.bank_pay}</h3>
                  </Col>
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'large', color: "#000" }}>Transaction No</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>

                  <Col span={10} md={10}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.trans_no}</h3>
                  </Col>
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'large', color: "#000" }}>Transaction Date</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>

                  <Col span={10} md={10}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.transaction_date}</h3>
                  </Col>
                </>
                : viewRentalorleaselist?.transaction_type === 'UPI' ?
                  <>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>UPI ID</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>

                    <Col span={10} md={10}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.upi_id}</h3>
                    </Col>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Transaction Date</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>

                    <Col span={10} md={10}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.transaction_date}</h3>
                    </Col>
                  </> : viewRentalorleaselist?.transaction_type === 'Cheque' ?
                    <>
                      <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'large', color: "#000" }}>Cheque Number</h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                      </Col>

                      <Col span={10} md={10}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.trans_no}</h3>
                      </Col>
                      <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'large', color: "#000" }}>Transaction Date</h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                      </Col>

                      <Col span={10} md={10}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.transaction_date}</h3>
                      </Col>
                    </>
                    : null
              }

              {viewRentalorleaselist?.rent && <>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Increase Time Period</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
                <Col span={12} md={12}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.increase_time_period !== null ? viewRentalorleaselist?.increase_time_period : "_"}&nbsp;
                    {viewRentalorleaselist?.increase_time_period_choice}</h3>
                </Col>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Increment Amt</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
                <Col span={12} md={12}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{viewRentalorleaselist?.increment_amt_prcnt}</h3>
                </Col>
              </>}
            </CustomRow>
          </Col>
          <Col span={24} md={6}>
            <img src={viewRentalorleaselist?.viewRentalorleaselist?.documents} alt="" width={100}
              style={{ borderRadius: "10%", objectFit: "cover", display: "block", marginRight: "auto", marginLeft: "auto", width: "100%" }} />
            <br /><br />
            <img src={viewRentalorleaselist?.viewRentalorleaselist?.images} alt="" width={100}
              style={{ borderRadius: "10%", objectFit: "cover", display: "block", marginRight: "auto", marginLeft: "auto", width: "100%" }} />
          </Col>
          {RentalDocument &&
            <Col span={24} md={24} style={{ marginTop: '20px' }}>
              <Collapse
                size="small"
                items={[
                  {
                    key: "1",
                    label: "Rent/Lease Document",
                    children: (
                      <Fragment>
                        {RentalDocument && (
                          <>
                            {RentalDocument.toLowerCase().endsWith(
                              ".pdf"
                            ) ? (
                              <iframe
                                title="PDF Preview"
                                style={{
                                  width: "100%",
                                  height: "80vh",
                                  border: "none",
                                }}
                                src={RentalDocument}
                              />
                            ) : RentalDocument.toLowerCase().endsWith(
                              ".docx"
                            ) ||
                              RentalDocument.toLowerCase().endsWith(
                                ".doc"
                              ) ? (
                              <iframe
                                title="Document Preview"
                                style={{
                                  width: "100%",
                                  height: "80vh",
                                  border: "none",
                                }}
                                src={`https://docs.google.com/gview?url=${RentalDocument}&embedded=true`}
                              />
                            ) : null}
                          </>
                        )}
                      </Fragment>
                    ),
                  },
                ]}
              />
            </Col>}

        </CustomRow>
      </Fragment>
    </Totalstyle>
  )
}

export default RentalorLeaseView
