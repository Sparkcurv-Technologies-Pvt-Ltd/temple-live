import { CustomRow } from '@components/others';
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import { IMG_BASE_URL } from '@request/request';
import { Col, Collapse, Flex } from 'antd';
import React, { Fragment } from 'react'
import styled from 'styled-components';

export const Totalstyle = styled.div`
  padding: 0px 24px 24px 35px !important;
  & h2 {
    color: #010101;
    font-weight: 600;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  .Viewtextstyle {
    margin: auto;
    height: 100%;
    font-weight: 500;
    font-size: 12px;
  }
`;


const DeathProfile = ({ record }) => {

  const DeathDocument = record?.death?.documents?.replace(IMG_BASE_URL, "")

  return (
    <Totalstyle>
      <CustomRow space={[24, 24]}>
        <Col span={24} md={24}>
          <CustomPageTitle Heading={'Death List'} />
        </Col>
        <Col span={24} md={12} style={{ margin: '5px 0px' }}>
          <h3 style={{ fontWeight: 'large', color: "#000" }}>Death No :<span style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{record?.death?.death_no}</span></h3>
        </Col>
        <Col span={24} md={15}>
          <CustomRow>
            {record?.death?.old_death === false && <>
              <Col span={12} md={12}>
                <h2 style={{ fontWeight: 'normal' }}>Family Number</h2>
              </Col>
              <Col span={2} md={2}><span style={{ fontSize: '20px' }}>:</span></Col>
              <Col span={10} md={10} className='Viewtextstyle' >
                <h2 style={{ paddingLeft: '5px' }}>{record?.family_no}</h2>
              </Col>

              <Col span={12} md={12}>
                <h2 style={{ fontWeight: 'normal' }}>Member Name</h2>
              </Col>
              <Col span={2} md={2}><span style={{ fontSize: '20px' }}>:</span></Col>
              <Col span={10} md={10} className='Viewtextstyle'>
                <h2 style={{ paddingLeft: '5px' }}>{record?.death?.member_name}</h2>
              </Col>

            </>}
            <Col span={12} md={12}>
              <h2 style={{ fontWeight: 'normal' }}>Death Date</h2>
            </Col>
            <Col span={2} md={2}><span style={{ fontSize: '20px' }}>:</span></Col>
            <Col span={10} md={10} className='Viewtextstyle'>
              <h2 style={{ paddingLeft: '5px' }}>{record?.death?.death_date}</h2>
            </Col>
            {record?.death?.old_death === false && <>
              <Col span={12} md={12}>
                <h2 style={{ fontWeight: 'normal' }}>Death Tariff Amt</h2>
              </Col>
              <Col span={2} md={2}><span style={{ fontSize: '20px' }}>:</span></Col>
              <Col span={10} md={10} className='Viewtextstyle'>
                <h2 style={{ paddingLeft: '5px' }}>{record?.death?.death_tariff_amt}</h2>
              </Col>

              <Col span={12} md={12}>
                <h2 style={{ fontWeight: 'normal' }}>Penalty Date</h2>
              </Col>
              <Col span={2} md={2}><span style={{ fontSize: '20px' }}>:</span></Col>
              <Col span={10} md={10} className='Viewtextstyle'>
                <h2 style={{ paddingLeft: '5px' }}>{record?.death?.penalty_apply_date}</h2>
              </Col>

              <Col span={12} md={12}>
                <h2 style={{ fontWeight: 'normal' }}>Tariff Penalty</h2>
              </Col>
              <Col span={2} md={2}><span style={{ fontSize: '20px' }}>:</span></Col>
              <Col span={10} md={10} className='Viewtextstyle'>
                <h2 style={{ paddingLeft: '5px' }}>{record?.death?.tariff_peanalty}</h2>
              </Col>

              <Col span={12} md={12}>
                <h2 style={{ fontWeight: 'normal' }}>Penalty Amt Type </h2>
              </Col>
              <Col span={2} md={2}><span style={{ fontSize: '20px' }}>:</span></Col>
              <Col span={10} md={10} className='Viewtextstyle'>
                <h2 style={{ paddingLeft: '5px' }}>{record?.death?.pen_amt_type}</h2>
              </Col>

              {/* <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ fontWeight: 'normal' }}>Death Amt</h3>
                            <span style={{ fontSize: '15px' }}>:</span>
                        </Col>
                        <Col span={12} md={12}>
                            <h3 style={{ paddingLeft: '5px' ,fontWeight: 'normal'}}>{record?.death?.death_amt}</h3>
                        </Col>

                        <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ fontWeight: 'normal' }}>Amount Details </h3>
                            <span style={{ fontSize: '15px' }}>:</span>
                        </Col> */}
              {/* <Col span={12} md={12}>
                            <h3 style={{ paddingLeft: '5px' ,fontWeight: 'normal'}}>{record?.death?.amount_details}</h3>
                        </Col> */}


              <Col span={12} md={12}>
                <h2 style={{ fontWeight: 'normal' }}>Comments </h2>
              </Col>
              <Col span={2} md={2}><span style={{ fontSize: '20px' }}>:</span></Col>
              <Col span={10} md={10} className='Viewtextstyle'>
                <h2 style={{ paddingLeft: '5px' }}>{record?.death?.comments}</h2>
              </Col>
            </>
            }

          </CustomRow>
          {/* <div style={{display:'flex',justifyContent:'space-between'}}><h3>Member Name: </h3><h3>{record?.death?.member_name}</h3></div>
                <div style={{display:'flex',justifyContent:'space-between'}}><h3>Death Date: </h3><h3>{record?.death?.death_date}</h3></div>
                <div style={{display:'flex',justifyContent:'space-between'}}><h3>Death Amt: </h3><h3>{record?.death?.death_amt}</h3></div>
                <div style={{display:'flex',justifyContent:'space-between'}}> <h3>Amount Details: </h3><h3>{record?.death?.amount_details}</h3></div>
                <div style={{display:'flex',justifyContent:'space-between'}}><h3>Comments:</h3><h3> {record?.death?.comments}</h3></div> */}

        </Col>

        <Col span={24} md={12}>
          <img src={record?.death?.documents} alt="" width={100}
            style={{ borderRadius: "5%", objectFit: "cover", display: "block", marginRight: "auto", marginLeft: "auto", width: "30%" }} />
          <br />

          <img src={record?.death?.photo} alt="" width={100}
            style={{ borderRadius: "5%", objectFit: "cover", display: "block", marginRight: "auto", marginLeft: "auto", width: "30%" }} />
        </Col>
        {DeathDocument &&
          <Col span={24} md={24} style={{ margin: '20px 0px' }}>
            <Collapse
              size="small"
              items={[
                {
                  key: "1",
                  label: "Death Details Document",
                  children: (
                    <Fragment>
                      {DeathDocument && (
                        <>
                          {DeathDocument.toLowerCase().endsWith(
                            ".pdf"
                          ) ? (
                            <iframe
                              title="PDF Preview"
                              style={{
                                width: "100%",
                                height: "80vh",
                                border: "none",
                              }}
                              src={DeathDocument}
                            />
                          ) : DeathDocument.toLowerCase().endsWith(
                            ".docx"
                          ) ||
                            DeathDocument.toLowerCase().endsWith(
                              ".doc"
                            ) ? (
                            <iframe
                              title="Document Preview"
                              style={{
                                width: "100%",
                                height: "80vh",
                                border: "none",
                              }}
                              src={`https://docs.google.com/gview?url=${DeathDocument}&embedded=true`}
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
    </Totalstyle>
  )
}

export default DeathProfile