import { CustomRow } from "@components/others";
import { Col, Collapse } from "antd";
import React, { Fragment } from "react";
import styled from "styled-components";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import marriageDummy from "@assets/images/marriageDummy.jpg";
import { FaLocationDot } from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";
import { IMG_BASE_URL } from "@request/request";

const CardHeadDetails = styled.div`
  background-color: #fff;
  padding: 15px;
  /* border-radius: 20px; */
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  & h3 {
    font-size: 15;
    font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
      sans-serif;
    font-weight: 900;
  }
  & h4 {
    color: #877f7f;
    margin-left: 4px;
    font-size: 20px;
    font-weight: 600;
    font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
  }
  & h5 {
    color: #656565;
    margin-left: 4px;
    font-size: 16px;
    font-weight: 600;
    font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
  }
  @media screen and (max-width: 500px) {
    padding: 5px;
  }
`;

const StyledLeft = styled.div`
  display: flex;
  justify-content: center;

  img {
    object-fit: cover;
    width: 60%;
  }
`;

export const MarriagelistView = ({ marriagelists }) => {
  const InvitationDocument = marriagelists?.invitation?.replace(
    IMG_BASE_URL,
    ""
  );
  const MarriageCertificate = marriagelists?.marriage_certificate?.replace(IMG_BASE_URL,"");
  return (
    <Fragment>
      <CustomRow space={[12, 12]}>
              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>
                Marriage No : <span style={{
                    paddingLeft: "5px",
                    fontWeight: "large",
                    color: "#3117f1",
                  }}> {marriagelists?.marriage_no}</span>
                </h3>
              </Col>
        <Col span={24} md={24}>
          <StyledLeft>
            {marriagelists?.marriage_photo?.length > 0 ? (
              <img src={marriagelists?.marriage_photo} alt="" />
            ) : (
              <img src={marriageDummy} alt="" />
            )}
          </StyledLeft>
        </Col>
           
        <Col span={24} md={12} style={{ paddingLeft: "10px" }}>
          <CardHeadDetails>
            <CustomPageTitle Heading={"Groom"} />

            <CustomRow space={[5, 5]}>
              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>
                  Groom Native Type
                </h3>
                <span style={{ fontSize: "15px" }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3
                  style={{
                    paddingLeft: "5px",
                    fontWeight: "large",
                    color: "#696969",
                  }}
                >
                  {marriagelists?.groom_native_type}
                </h3>
              </Col>

              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>
                  Groom Name
                </h3>
                <span style={{ fontSize: "15px" }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3
                  style={{
                    paddingLeft: "5px",
                    fontWeight: "large",
                    color: "#696969",
                  }}
                >
                  {marriagelists?.groom_name}
                </h3>
              </Col>
              {marriagelists?.groom_family_no && (
                <>
                  <Col
                    span={12}
                    md={12}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <h3 style={{ fontWeight: "large", color: "#000" }}>
                      Groom Family No
                    </h3>
                    <span style={{ fontSize: "15px" }}>:</span>
                  </Col>
                  <Col span={12} md={12}>
                    <h3
                      style={{
                        paddingLeft: "5px",
                        fontWeight: "large",
                        color: "#696969",
                      }}
                    >
                      {marriagelists?.groom_family_no}
                    </h3>
                  </Col>
                </>
              )}
              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>
                  Groom Dob
                </h3>
                <span style={{ fontSize: "15px" }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3
                  style={{
                    paddingLeft: "5px",
                    fontWeight: "large",
                    color: "#696969",
                  }}
                >
                  {marriagelists?.groom_dob}
                </h3>
              </Col>

              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>
                  Groom Mobile Number
                </h3>
                <span style={{ fontSize: "15px" }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3
                  style={{
                    paddingLeft: "5px",
                    fontWeight: "large",
                    color: "#696969",
                  }}
                >
                  {marriagelists?.groom_mobile_number}
                </h3>
              </Col>

              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>
                  Groom Marriage Amt
                </h3>
                <span style={{ fontSize: "15px" }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3
                  style={{
                    paddingLeft: "5px",
                    fontWeight: "large",
                    color: "#696969",
                  }}
                >
                  {marriagelists?.groom_marriage_amt}
                </h3>
              </Col>

              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>
                  Groom Address
                </h3>
                <span style={{ fontSize: "15px" }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3
                  style={{
                    paddingLeft: "5px",
                    fontWeight: "large",
                    color: "#696969",
                  }}
                >
                  {marriagelists?.groom_address}
                </h3>
              </Col>
            </CustomRow>
          </CardHeadDetails>
        </Col>
        <Col
          span={24}
          md={12}
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <CardHeadDetails>
            <CustomPageTitle Heading={"Bride"} />

            <CustomRow space={[5, 5]}>
              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>
                  Bride Native Type
                </h3>
                <span style={{ fontSize: "15px" }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3
                  style={{
                    paddingLeft: "5px",
                    fontWeight: "normal",
                    color: "#696969",
                  }}
                >
                  {marriagelists?.bride_native_type}
                </h3>
              </Col>
              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>
                  Bride Name
                </h3>
                <span style={{ fontSize: "15px" }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3
                  style={{
                    paddingLeft: "5px",
                    fontWeight: "normal",
                    color: "#696969",
                  }}
                >
                  {marriagelists?.bride_name}
                </h3>
              </Col>

              {marriagelists?.bride_family_no && (
                <>
                  <Col
                    span={12}
                    md={12}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <h3 style={{ fontWeight: "large", color: "#000" }}>
                      Bride Family No
                    </h3>
                    <span style={{ fontSize: "15px" }}>:</span>
                  </Col>
                  <Col span={12} md={12}>
                    <h3
                      style={{
                        paddingLeft: "5px",
                        fontWeight: "normal",
                        color: "#696969",
                      }}
                    >
                      {marriagelists?.bride_family_no}
                    </h3>
                  </Col>
                </>
              )}
              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>
                  Bride Dob
                </h3>
                <span style={{ fontSize: "15px" }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3
                  style={{
                    paddingLeft: "5px",
                    fontWeight: "normal",
                    color: "#696969",
                  }}
                >
                  {marriagelists?.bride_dob}
                </h3>
              </Col>

              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>
                  Bride Mobile Number
                </h3>
                <span style={{ fontSize: "15px" }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3
                  style={{
                    paddingLeft: "5px",
                    fontWeight: "normal",
                    color: "#696969",
                  }}
                >
                  {marriagelists?.bride_mobile_number}
                </h3>
              </Col>

              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>
                  Bride Marriage Amt
                </h3>
                <span style={{ fontSize: "15px" }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3
                  style={{
                    paddingLeft: "5px",
                    fontWeight: "normal",
                    color: "#696969",
                  }}
                >
                  {marriagelists?.bride_marriage_amt}
                </h3>
              </Col>

              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>
                  Bride Address
                </h3>
                <span style={{ fontSize: "15px" }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3
                  style={{
                    paddingLeft: "5px",
                    fontWeight: "normal",
                    color: "#696969",
                  }}
                >
                  {marriagelists?.bride_address}
                </h3>
              </Col>
            </CustomRow>
          </CardHeadDetails>
        </Col>
        <Col span={24} md={12}>
          <CardHeadDetails>
            <CustomRow space={[12, 12]}>
              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>
                  Marriage Date
                </h3>
                <span style={{ fontSize: "15px" }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3
                  style={{
                    paddingLeft: "5px",
                    fontWeight: "normal",
                    color: "#696969",
                  }}
                >
                  <FaCalendarAlt color="black" />
                  &nbsp;{marriagelists?.marriage_date}
                </h3>
              </Col>

              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>
                  Marriage Place
                </h3>
                <span style={{ fontSize: "15px" }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3
                  style={{
                    paddingLeft: "5px",
                    fontWeight: "normal",
                    color: "#696969",
                  }}
                >
                  <FaLocationDot color="black" />
                  &nbsp;{marriagelists?.marriage_place}
                </h3>
              </Col>
              {MarriageCertificate &&
              <Col span={24} md={24}>
                <Collapse
                  size="small"
                  items={[
                    {
                      key: "1",
                      label: "Marriage Certificate",
                      children: (
                        <Fragment>
                          {MarriageCertificate && (
                            <>
                              {MarriageCertificate.toLowerCase().endsWith(
                                ".pdf"
                              ) ? (
                                <iframe
                                  title="PDF Preview"
                                  style={{
                                    width: "100%",
                                    height: "80vh",
                                    border: "none",
                                  }}
                                  src={MarriageCertificate}
                                />
                              ) : MarriageCertificate.toLowerCase().endsWith(
                                  ".docx"
                                ) ||
                                MarriageCertificate.toLowerCase().endsWith(
                                  ".doc"
                                ) ? (
                                <iframe
                                  title="Document Preview"
                                  style={{
                                    width: "100%",
                                    height: "80vh",
                                    border: "none",
                                  }}
                                  src={`https://docs.google.com/gview?url=${MarriageCertificate}&embedded=true`}
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
          </CardHeadDetails>
        </Col>
        <Col span={24} md={12}>
          <CardHeadDetails>
            <CustomRow space={[12, 12]}>
              <Col
                span={12}
                md={12}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <h3 style={{ fontWeight: "large", color: "#000" }}>Comments</h3>
                <span style={{ fontSize: "15px" }}>:</span>
              </Col>
              <Col span={12} md={12}>
                <h3
                  style={{
                    paddingLeft: "5px",
                    fontWeight: "normal",
                    color: "#696969",
                  }}
                >
                  &nbsp;{marriagelists?.comments}
                </h3>
              </Col>
              {InvitationDocument &&
              <Col span={24} md={24}>
                <Collapse
                  size="small"
                  items={[
                    {
                      key: "1",
                      label: "Marriage Invitation",
                      children: (
                        <Fragment>
                          {InvitationDocument && (
                            <>
                              {InvitationDocument.toLowerCase().endsWith(
                                ".pdf"
                              ) ? (
                                <iframe
                                  title="PDF Preview"
                                  style={{
                                    width: "100%",
                                    height: "80vh",
                                    border: "none",
                                  }}
                                  src={InvitationDocument}
                                />
                              ) : InvitationDocument.toLowerCase().endsWith(
                                  ".docx"
                                ) ||
                                InvitationDocument.toLowerCase().endsWith(
                                  ".doc"
                                ) ? (
                                <iframe
                                  title="Document Preview"
                                  style={{
                                    width: "100%",
                                    height: "80vh",
                                    border: "none",
                                  }}
                                  src={`https://docs.google.com/gview?url=${InvitationDocument}&embedded=true`}
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
          </CardHeadDetails>
        </Col>
      </CustomRow>
    </Fragment>
  );
};
