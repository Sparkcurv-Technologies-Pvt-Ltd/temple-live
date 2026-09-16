import { CustomRow } from '@components/others';
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import { IMG_BASE_URL } from '@request/request';
import { Col, Collapse } from 'antd';
import React, { Fragment } from 'react'
import styled from 'styled-components';

const Totalstyle = styled.div`
  padding: 0px 24px 24px 35px !important;
`;

const AssetView = ({ viewasset }) => {

  const AssetsDocuments =viewasset?.documents?.replace(IMG_BASE_URL,"")

  return (
    <Totalstyle>
      <div>
        <CustomRow>
          <Col span={24} md={24}>
            <CustomPageTitle Heading={'Asset Details'} />
          </Col>
          <Col span={24} md={12}>
            <CustomRow>
              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color:"#000" }}>Asset Name</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewasset?.asset_name}</h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color:"#000" }}>Category Name</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewasset?.category_name}</h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color:"#000" }}>Comments</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewasset?.comments}</h3>
              </Col>

              <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                <h3 style={{ fontWeight: 'large', color:"#000" }}>details</h3>
                <span style={{ fontSize: '15px' }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{viewasset?.details}</h3>
              </Col>

            </CustomRow>


            {/* <h4>Asset Name: {viewasset?.asset_name}</h4> */}
            {/* <h4>Category Name: {viewasset?.category_name}</h4> */}
            {/* <h4>Comments: {viewasset?.comments}</h4>
            <h4>details: {viewasset?.details}</h4> */}

          </Col>
          <Col span={24} md={12}>
            <img src={viewasset?.documents} alt="" width={100} style={{ borderRadius: "8%", objectFit: "cover" }} />
            <img src={viewasset?.images} alt="" width={100} style={{ borderRadius: "8%", objectFit: "cover",marginLeft:"20px" }} />
          </Col>
          {AssetsDocuments &&
              <Col span={24} md={24} style={{margin:'20px 0px'}}>
                <Collapse
                  size="small"
                  items={[
                    {
                      key: "1",
                      label: "Assets Document",
                      children: (
                        <Fragment>
                          {AssetsDocuments && (
                            <>
                              {AssetsDocuments.toLowerCase().endsWith(
                                ".pdf"
                              ) ? (
                                <iframe
                                  title="PDF Preview"
                                  style={{
                                    width: "100%",
                                    height: "80vh",
                                    border: "none",
                                  }}
                                  src={AssetsDocuments}
                                />
                              ) : AssetsDocuments.toLowerCase().endsWith(
                                  ".docx"
                                ) ||
                                AssetsDocuments.toLowerCase().endsWith(
                                  ".doc"
                                ) ? (
                                <iframe
                                  title="Document Preview"
                                  style={{
                                    width: "100%",
                                    height: "80vh",
                                    border: "none",
                                  }}
                                  src={`https://docs.google.com/gview?url=${AssetsDocuments}&embedded=true`}
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
      </div>
    </Totalstyle>
  )
}

export default AssetView