import { CustomRow, Flex } from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Badge, Col, Tooltip } from "antd";
import React, { Fragment, useEffect, useState } from "react";
import { StyledHeading } from "../style";
import styled from "styled-components";
import DummyMember from "@assets/images/Sampling.png";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAncestor,
  getFamilyGroupDetails,
  selectFamilyGroupDetails,
} from "../FamilySlice";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@components/form";
import { MdElderly } from "react-icons/md";
import { toast } from "react-toastify";
import request from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";

export const CardHeadDetails = styled.div`
  background-color: #fff;
  padding: 30px 50px;
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  & h3 {
    font-size: 20px;
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
const ViewFamilyDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [disabled, setDisabled] = useState(false);
  const [ancestorData,setAncestorData] = useState([])

  useEffect(() => {
    dispatch(getFamilyGroupDetails());
    dispatch(getAncestor());
    GetAncestor();
  }, []);

  const FamilyGroupDetails = useSelector(selectFamilyGroupDetails);
  const FamilyDetailsView = FamilyGroupDetails?.filter((fam) => fam?.id == id);
  const FamilyGroup = FamilyDetailsView?.map((ite) => ite.family).flat();


const GetAncestor = async () => {
    await request
        .get(`${APIURLS.GET_LINK_FAMILY_ANCESTOR}/${id}/`)
        .then(function (response) {
          setAncestorData(response?.data)
            return response.data;
        })
        .catch(function (error) {
        });
};


  const handleAncestorNavigate = () => {
    if (ancestorData?.family?.length > 0) {
      navigate(`/ancestor_view/${id}`);
      setDisabled(false)
    }
    else {
      setDisabled(true)
      toast.warn('No family details available !');
    }
  };

  return (
    <Fragment>
      <CustomRow space={[12, 12]}>
        <Col span={24} md={12}>
          <CustomPageTitle Heading={"View Family Details"} width={100} />
        </Col>
        <Col span={24} md={12}>
          <Flex end={true}><Tooltip title={"Ancestor"}><Button.Primary text={<MdElderly />} disabled={disabled} onClick={handleAncestorNavigate} /></Tooltip></Flex>
        </Col>
        <Col span={24} md={12}>
          <StyledHeading style={{ marginTop: "15px", fontSize: "20px" }}>
            <p>Family Head Details :</p>
          </StyledHeading>
        </Col>
        <Col span={24} md={24}>
          <CardHeadDetails>
            {FamilyGroup?.map((fam, index) => (
              <div key={index}>
                {fam?.member_relation_ship === "FATHER" ? (
                  <>
                    <h2>
                      Member No&nbsp;:&nbsp;&nbsp;
                      {fam?.member_no}
                    </h2>
                    <br />
                    <CustomRow>
                      <Col span={24} md={18}>
                        <CustomRow space={[12, 12]}>
                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}>Name</h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h4
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                              }}
                            >
                              {fam?.member_name}
                            </h4>
                          </Col>
                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}>
                              Relation Ship
                            </h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h4
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                                color: "blue",
                                fontSize: "17px",
                              }}
                            >
                              {fam?.member_relation_ship}
                            </h4>
                          </Col>

                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}>
                              Date of Birth
                            </h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h4
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                              }}
                            >
                              {fam?.member_dob}
                            </h4>
                          </Col>
                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}>Age</h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h4
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                              }}
                            >
                              {fam?.member_age}
                            </h4>
                          </Col>

                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}> Email ID</h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h4
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                              }}
                            >
                              {fam?.member_email === null ? "_" : fam?.member_email}
                            </h4>
                          </Col>

                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}>
                              {" "}
                              Mobile Number
                            </h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h4
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                              }}
                            >
                              {fam?.member_mobile_number}
                            </h4>
                          </Col>

                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}>
                              {" "}
                              Joining Amount
                            </h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h4
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                              }}
                            >
                              {fam?.member_joining_amt}
                            </h4>
                          </Col>

                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}>
                              {" "}
                              Balance Amount
                            </h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h4
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                              }}
                            >
                              {fam?.member_balance_amt}
                            </h4>
                          </Col>
                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}>Address</h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h4
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                              }}
                            >
                              {FamilyDetailsView[0]?.address}
                            </h4>
                          </Col>
                        </CustomRow>
                      </Col>
                      <Col span={24} md={4}>
                        <Flex center={"true"}>
                          {FamilyGroup?.map((fam, index) => (
                            <div key={index}>
                              {fam.member_relation_ship === "FATHER" && fam?.death ? (
                                <Badge.Ribbon text="Late" color="volcano">
                                  {fam.member_relation_ship === "FATHER" ? (
                                    fam?.member_photo ? (
                                      <div
                                        style={{
                                          width: "200px",
                                          height: "200px",
                                          overflow: "hidden",
                                        }}
                                      >
                                        <img
                                          src={fam?.member_photo}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div
                                        style={{
                                          width: "200px",
                                          height: "200px",
                                          overflow: "hidden",
                                        }}
                                      >
                                        <img
                                          src={DummyMember}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                          }}
                                        />
                                      </div>
                                    )
                                  ) : null}
                                </Badge.Ribbon>
                              ) : (
                                <>
                                  {fam.member_relation_ship === "FATHER" ? (
                                    fam?.member_photo ? (
                                      <div
                                        style={{
                                          width: "200px",
                                          height: "200px",
                                          overflow: "hidden",
                                        }}
                                      >
                                        <img
                                          src={fam?.member_photo}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div
                                        style={{
                                          width: "200px",
                                          height: "200px",
                                          overflow: "hidden",
                                        }}
                                      >
                                        <img
                                          src={DummyMember}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                          }}
                                        />
                                      </div>
                                    )
                                  ) : null}
                                </>
                              )}
                            </div>
                          ))}
                        </Flex>
                      </Col>
                    </CustomRow>
                  </>
                ) : null}
              </div>
            ))}
          </CardHeadDetails>
        </Col>

        <Col span={24} md={24}></Col>

        <Col span={24} md={24}>
          <StyledHeading style={{ marginTop: "15px", fontSize: "20px" }}>
            <p>Family Members Details</p>
          </StyledHeading>
          <br />
          <CustomRow space={[12, 12]}>
            {FamilyGroup?.map(
              (fam, index) =>
                fam?.member_relation_ship !== "FATHER" && (
                  <Col key={index} span={24} md={12}>
                    <CardHeadDetails>
                      <Flex center>
                        {fam?.death ? (
                          <Badge.Ribbon text="Late" color="volcano">
                            {fam?.member_photo ? (
                              <div
                                style={{
                                  width: "200px",
                                  height: "200px",

                                  overflow: "hidden",
                                }}
                              >
                                <img
                                  src={fam?.member_photo}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                  }}
                                  alt="Member Photo"
                                />
                              </div>
                            ) : (
                              <div
                                style={{
                                  width: "200px",
                                  height: "200px",
                                  overflow: "hidden",
                                }}
                              >
                                <img
                                  src={DummyMember}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                  }}
                                  alt="Member Photo"
                                />
                              </div>
                            )}
                          </Badge.Ribbon>
                        ) : fam?.member_photo ? (
                          <div
                            style={{
                              width: "200px",
                              height: "200px",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={fam?.member_photo}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                              alt="Member Photo"
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: "200px",
                              height: "200px",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={DummyMember}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                              alt="Member Photo"
                            />
                          </div>
                        )}
                      </Flex>
                      <br />
                      <h3 style={{ textAlign: "center" }}>
                        Member No: {fam?.member_no}
                      </h3>
                      <div style={{ marginTop: "15px" }}>
                        <CustomRow
                          space={[8, 8]}
                          style={{ marginTop: "110px" }}
                        >
                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}>Name</h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h5
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                              }}
                            >
                              {fam?.member_name}
                            </h5>
                          </Col>
                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}>
                              Relation Ship
                            </h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h4
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                                color: "blue",
                                fontSize: "17px",
                              }}
                            >
                              {fam?.member_relation_ship}
                            </h4>
                          </Col>

                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}>
                              Date of Birth
                            </h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h5
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                              }}
                            >
                              {fam?.member_dob}
                            </h5>
                          </Col>

                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}>Age</h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h5
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                              }}
                            >
                              {fam?.member_age}
                            </h5>
                          </Col>

                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}> Email ID</h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h5
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                              }}
                            >
                              {fam?.member_email === null ? "_" : fam?.member_email}
                            </h5>
                          </Col>

                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}>
                              {" "}
                              Mobile Number
                            </h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h5
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                              }}
                            >
                              {fam?.member_mobile_number}
                            </h5>
                          </Col>

                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}>
                              {" "}
                              Joining Amount
                            </h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h5
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                              }}
                            >
                              {fam?.member_joining_amt}
                            </h5>
                          </Col>

                          <Col
                            span={12}
                            md={12}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h3 style={{ fontWeight: "normal" }}>
                              {" "}
                              Balance Amount
                            </h3>
                            <span style={{ fontSize: "15px" }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h5
                              style={{
                                paddingLeft: "5px",
                                fontWeight: "normal",
                              }}
                            >
                              {fam?.member_balance_amt}
                            </h5>
                          </Col>

                          {/* <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <h3 style={{ fontWeight: 'normal' }}> Relationship</h3>
                                                <span style={{ fontSize: '15px', }}>:</span>
                                            </Col> */}
                          {/* <Col span={12} md={12}>
                                                <h5 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{fam?.member_relation_ship}</h5>
                                            </Col> */}
                        </CustomRow>
                      </div>
                    </CardHeadDetails>
                  </Col>
                )
            )}
          </CustomRow>
        </Col>
      </CustomRow>
    </Fragment>
  );
};

export default ViewFamilyDetails;
