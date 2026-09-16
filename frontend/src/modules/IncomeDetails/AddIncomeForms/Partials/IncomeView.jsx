import { CustomRow } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col } from 'antd'
import React from 'react'
import styled from 'styled-components';

export const Totalstyle = styled.div`
  padding: 0px 24px 24px 35px !important;
  & h2 {
    color: #010101;
    font-weight: 900;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  & h3 {
    color: #646464;
    font-weight: 800;
    height: 100%;
    margin: auto;
    font-size: 17px;
    margin-top: 6px;
  }
  .Viewtextstyle {
    margin: auto;
    height: 100%;
    font-weight: 900;
    font-size: 12px;
  }
`;

export const IncomeViews = ({ record }) => {
  return (
    <Totalstyle>
      {/* <div> */}
      <CustomRow>
        <Col span={24} md={24}>
          <CustomPageTitle Heading={'Income View'} />
        </Col>
        <Col span={24} md={24}>
          <CustomRow>
            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
              <h2 style={{ fontWeight: 'normal' }}>Income Date</h2>
            </Col>
            <Col span={2} md={1}><h3>:</h3></Col>
            <Col span={10} md={10}>
              <h3 style={{ paddingLeft: '5px' }}>{record?.date}</h3>
            </Col>
            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
              <h2 style={{ fontWeight: 'normal' }}>Subcategory</h2>
            </Col>
            <Col span={2} md={1}><h3>:</h3></Col>
            <Col span={10} md={10}>
              <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.income_subcategory}</h3>
            </Col>
            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
              <h2 style={{ fontWeight: 'normal' }}>Income Category</h2>
            </Col>
            <Col span={2} md={1}><h3>:</h3></Col>
            <Col span={10} md={10}>
              <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.category_name}</h3>
            </Col>
            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
              <h2 style={{ fontWeight: 'normal' }}>Income Name</h2>
            </Col>
            <Col span={2} md={1}><h3>:</h3></Col>
            <Col span={10} md={10}>
              <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.income_name}</h3>
            </Col>
            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
              <h2 style={{ fontWeight: 'normal' }}>Income Amount</h2>
            </Col>
            <Col span={2} md={1}><h3>:</h3></Col>
            <Col span={10} md={10}>
              <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.income_amt}</h3>
            </Col>

            {/* <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
              <h2 style={{ fontWeight: 'normal' }}>Income Type</h2>
            </Col>
            <Col span={2} md={1}><h3>:</h3></Col>
            <Col span={10} md={10}>
              <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.income_type}</h3>
            </Col>
            {record?.income_type === "Offering" && <>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h2 style={{ fontWeight: 'normal' }}>Offering Type</h2>
              </Col>
              <Col span={2} md={1}><h3>:</h3></Col>
              <Col span={10} md={10}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.offering_type}</h3>
              </Col>
            </>}
            {record?.offering_type === "Festival" && <>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h2 style={{ fontWeight: 'normal' }}>Festival Name</h2>
              </Col>
              <Col span={2} md={1}><h3>:</h3></Col>
              <Col span={10} md={10}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.festival_name}</h3>
              </Col>
            </>}
            {record?.income_type === "Donation" && <>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h2 style={{ fontWeight: 'normal' }}>Giver Native</h2>
              </Col>
              <Col span={2} md={1}><h3>:</h3></Col>
              <Col span={10} md={10}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.giver_native}</h3>
              </Col>
            </>}
            {record?.giver_native === "Native" && <>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h2 style={{ fontWeight: 'normal' }}>Member Name</h2>
              </Col>
              <Col span={2} md={1}><h3>:</h3></Col>
              <Col span={10} md={10}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.member_name}</h3>
              </Col>
            </>}
            {record?.giver_native === "Others" && <>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h2 style={{ fontWeight: 'normal' }}>Giver Name</h2>
              </Col>
              <Col span={2} md={1}><h3>:</h3></Col>
              <Col span={10} md={10}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.name}</h3>
              </Col>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h2 style={{ fontWeight: 'normal' }}>Giver Address</h2>
              </Col>
              <Col span={2} md={1}><h3>:</h3></Col>
              <Col span={10} md={10}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.address}</h3>
              </Col>
            </>}
            {record?.income_type === "Sangam" && <>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h2 style={{ fontWeight: 'normal' }}>Giver Native</h2>
              </Col>
              <Col span={2} md={1}><h3>:</h3></Col>
              <Col span={10} md={10}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.sangam_name}</h3>
              </Col>
            </>} */}
            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
              <h2 style={{ fontWeight: 'normal' }}>Payment Mode</h2>
            </Col>
            <Col span={2} md={1}><h3>:</h3></Col>
            <Col span={10} md={10}>
              <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.payment_mode}</h3>
            </Col>
            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
              <h2 style={{ fontWeight: 'normal' }}>Transaction Type</h2>
            </Col>
            <Col span={2} md={1}><h3>:</h3></Col>
            <Col span={10} md={10}>
              <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.transaction_type}</h3>
            </Col>

            {record?.transaction_type === 'Bank' ?
              <>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h2 style={{ fontWeight: 'normal' }}>Bank name</h2>
                </Col>
                <Col span={2} md={1}><h3>:</h3></Col>
                <Col span={10} md={10}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.bank_name}</h3>
                </Col>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h2 style={{ fontWeight: 'normal' }}>Bank Pay</h2>
                </Col>
                <Col span={2} md={1}><h3>:</h3></Col>
                <Col span={10} md={10}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.bank_pay}</h3>
                </Col>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h2 style={{ fontWeight: 'normal' }}>Transaction No</h2>
                </Col>
                <Col span={2} md={1}><h3>:</h3></Col>
                <Col span={10} md={10}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.transaction_no}</h3>
                </Col>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h2 style={{ fontWeight: 'normal' }}>Transaction Date</h2>
                </Col>
                <Col span={2} md={1}><h3>:</h3></Col>
                <Col span={10} md={10}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.transaction_date}</h3>
                </Col>
              </>
              : record?.transaction_type === 'UPI' ?
                <>
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h2 style={{ fontWeight: 'normal' }}>UPI ID</h2>
                  </Col>
                  <Col span={2} md={1}><h3>:</h3></Col>
                  <Col span={10} md={10}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.upi_id}</h3>
                  </Col>
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h2 style={{ fontWeight: 'normal' }}>Transaction Date</h2>
                  </Col>
                  <Col span={2} md={1}><h3>:</h3></Col>
                  <Col span={10} md={10}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.transaction_date}</h3>
                  </Col>
                  {/* <h4>UPI ID: <span>{record?.upi_id}</span></h4>
                  <h4>Transaction Date: <span>{record?.transaction_date}</span></h4> */}
                </> : record?.transaction_type === 'Cheque' ?
                  <>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h2 style={{ fontWeight: 'normal' }}>Cheque Number</h2>
                    </Col>
                    <Col span={2} md={1}><h3>:</h3></Col>
                    <Col span={10} md={10}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.transaction_no}</h3>
                    </Col>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h2 style={{ fontWeight: 'normal' }}>Transaction Date</h2>
                    </Col>
                    <Col span={2} md={1}><h3>:</h3></Col>
                    <Col span={10} md={10}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.transaction_date}</h3>
                    </Col>
                    {/* <h4>Cheque Number: <span>{record?.cheque_no}</span></h4>
                    <h4>Transaction Date: <span>{record?.transaction_date}</span></h4> */}
                  </>
                  : null
            }

            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
              <h2 style={{ fontWeight: 'normal' }}>Comments</h2>
            </Col>
            <Col span={2} md={1}><h3>:</h3></Col>
            <Col span={10} md={10}>
              <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{record?.comments}</h3>
            </Col>
          </CustomRow>

        </Col>
      </CustomRow>
      {/* </div> */}
    </Totalstyle>
  )
}
