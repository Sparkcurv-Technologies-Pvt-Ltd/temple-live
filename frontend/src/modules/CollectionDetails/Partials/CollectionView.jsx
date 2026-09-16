import { SvgIcons } from '@assets/Svg';
import { CustomRow, Flex } from '@components/others';
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import { Col } from 'antd';
import React, { Fragment } from 'react'
import styled from 'styled-components';

const Totalstyle = styled.div`
  padding: 0px 24px 24px 25px !important;
`;

const CollectionViewDetails = ({ CollectionRecord }) => {

  const CollectionType = CollectionRecord?.collection_category;
  const TotalChitMangementAmt = parseFloat(CollectionRecord?.amount) + parseFloat(CollectionRecord?.interst_amount) + parseFloat(CollectionRecord?.penalty_amount);
  return (
    <Totalstyle>
      <Fragment>
        <CustomRow>
          <Col span={24} md={10}>
            <CustomPageTitle Heading={'Collection List View'} />
          </Col>
          <Col span={24} md={4}>
            <img src={SvgIcons.Money} />
          </Col>
          <Col span={24} md={10}>
            <h3 style={{ fontWeight: 'large', color: "#000" }}>Collection No :<span style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.collaction_no}</span></h3>
          </Col>
        </CustomRow>
        {(CollectionType === "Rent" || CollectionType === "Lease") &&
          <CustomRow>
            <Col span={24} md={18}>
              <CustomRow>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Pay Date</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
                <Col span={12} md={12}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>
                    {CollectionRecord?.pay_date}</h3>
                </Col>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Collection Category</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>

                <Col span={12} md={12}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.collection_category}</h3>
                </Col>
                {CollectionRecord?.collection_category === "Rent" &&
                  <>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Rent Name</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.rent_name}</h3>
                    </Col>
                  </>
                }
                {CollectionRecord?.collection_category === "Lease" &&
                  <>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Lease Name</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.lease_name}</h3>
                    </Col>
                  </>
                }
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Amount</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
                <Col span={12} md={12}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>₹&nbsp;{CollectionRecord?.amount}</h3>
                </Col>
                {CollectionRecord?.payment_mode === "Online" &&
                  <>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Payment Mode</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.payment_mode}</h3>
                    </Col>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Transaction Type</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>

                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.transaction_type}</h3>
                    </Col>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Bank Name</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.bank_name}</h3>
                    </Col>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Transaction No</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.trans_no}</h3>
                    </Col>

                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Transaction Date</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.transaction_date}</h3>
                    </Col>
                  </>
                }
                {CollectionRecord?.payment_mode === "Offline" &&
                  <>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Payment Mode</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.payment_mode}</h3>
                    </Col>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Transaction Type</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>

                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.transaction_type}</h3>
                    </Col>
                    {CollectionRecord?.transaction_type === "Cheque" &&
                      <>
                        <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                          <h3 style={{ fontWeight: 'large', color: "#000" }}>Cheque No</h3>
                          <span style={{ fontSize: '15px' }}>:</span>
                        </Col>

                        <Col span={12} md={12}>
                          <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.trans_no}</h3>
                        </Col>
                        <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                          <h3 style={{ fontWeight: 'large', color: "#000" }}>Transaction Date</h3>
                          <span style={{ fontSize: '15px' }}>:</span>
                        </Col>
                        <Col span={12} md={12}>
                          <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.transaction_date}</h3>
                        </Col>
                      </>
                    }
                  </>
                }
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Comments</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
                <Col span={12} md={12}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.comments}</h3>
                </Col>
              </CustomRow>
            </Col>
          </CustomRow>
        }
        {(CollectionType === "Marriage" || CollectionType === "Festival" ||
          CollectionType === "Death Tariff" || CollectionType === "Balance" ||
          CollectionType === "Subscription Tariff" || CollectionType === "Moveable Rent") &&
          <CustomRow>

            <Col span={24} md={18}>
              <CustomRow>
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Pay Date</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
                <Col span={12} md={12}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>
                    {CollectionRecord?.pay_date}</h3>
                </Col>

                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Collection Category</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
                <Col span={12} md={12}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.collection_category}</h3>
                </Col>
                {CollectionRecord?.collection_category === "Marriage" &&
                  <>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Marriage Member Name</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.marriage_name}</h3>
                    </Col>
                  </>
                }
                {CollectionRecord?.collection_category === "Festival" &&
                  <>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Festival Name</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.festival_name}</h3>
                    </Col>
                  </>
                }
                {CollectionRecord?.collection_category === "Death Tariff" &&
                  <>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Death Tariff Name</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.death_name}</h3>
                    </Col>
                  </>
                }
                {CollectionRecord?.collection_category === "Balance" &&
                  <>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Balance Name</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.balance_name}</h3>
                    </Col>
                  </>
                }
                {CollectionRecord?.collection_category === "Moveable Rent" &&
                  <>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Moveable Rent Name</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.moveable_rent_name}</h3>
                    </Col>
                  </>
                }
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Member Name</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
                <Col span={12} md={12}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.member_name}</h3>
                </Col>
                {CollectionRecord?.collection_category === "Subscription Tariff" && <>

                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'large', color: "#000" }}>Sub Tariff Amt</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>
                  <Col span={12} md={12}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>
                      ₹&nbsp;{CollectionRecord?.present ? CollectionRecord?.amount : CollectionRecord?.absent_amt}
                    </h3>
                  </Col>
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'bold', color: "#000" }}>Exception Amount</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>
                  <Col span={12} md={12}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>₹&nbsp;{CollectionRecord?.exception_amt}</h3>
                  </Col>
                </>
                }
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Amount</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
                <Col span={12} md={12}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>₹&nbsp;{CollectionRecord?.amount}</h3>
                </Col>
                {CollectionRecord?.collection_category === "Subscription Tariff" && <>
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'large', color: "#000" }}>Sub Tariff No</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>
                  <Col span={12} md={12}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.sub_tariff_no}</h3>
                  </Col>
                </>}
                {CollectionRecord?.payment_mode === "Online" &&
                  <>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Payment Mode</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.payment_mode}</h3>
                    </Col>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Transaction Type</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>

                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.transaction_type}</h3>
                    </Col>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Bank Name</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.bank_name}</h3>
                    </Col>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Transaction No</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.trans_no}</h3>
                    </Col>

                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Transaction Date</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.transaction_date}</h3>
                    </Col>
                  </>
                }
                {CollectionRecord?.payment_mode === "Offline" &&
                  <>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Payment Mode</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.payment_mode}</h3>
                    </Col>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Transaction Type</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>

                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.transaction_type}</h3>
                    </Col>
                    {CollectionRecord?.transaction_type === "Cheque" &&
                      <>
                        <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                          <h3 style={{ fontWeight: 'large', color: "#000" }}>Transaction Date</h3>
                          <span style={{ fontSize: '15px' }}>:</span>
                        </Col>
                        <Col span={12} md={12}>
                          <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.transaction_date}</h3>
                        </Col>
                      </>
                    }
                  </>
                }
                {CollectionRecord?.collection_category === "Moveable Rent" &&
                  <>
                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                      <h3 style={{ fontWeight: 'large', color: "#000" }}>Moveable Asset Payment</h3>
                      <span style={{ fontSize: '15px' }}>:</span>
                    </Col>
                    <Col span={12} md={12}>
                      <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.moveable_asset_payment}</h3>
                    </Col>
                  </>
                }
                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                  <h3 style={{ fontWeight: 'large', color: "#000" }}>Comments</h3>
                  <span style={{ fontSize: '15px' }}>:</span>
                </Col>
                <Col span={12} md={12}>
                  <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.comments}</h3>
                </Col>
              </CustomRow>
            </Col>
          </CustomRow>
        }
        <CustomRow>
          <Col span={24} md={18}>
            <CustomRow>
              {(CollectionRecord?.collection_category === "Chit Interest" || CollectionRecord?.collection_category === "Management Interest" ||
                CollectionRecord?.collection_category === "Fund") &&
                <>
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'large', color: "#000" }}>Pay date</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>
                  <Col span={12} md={12}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.pay_date}</h3>
                  </Col>
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'large', color: "#000" }}>Collection Category</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>
                  <Col span={12} md={12}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.collection_category}</h3>
                  </Col>
                  {CollectionRecord?.collection_category === "Chit Interest" &&
                    <>
                      <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'large', color: "#000" }}>Chit Name</h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                      </Col>
                      <Col span={12} md={12}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.chit_name}</h3>
                      </Col>
                    </>}
                  {CollectionRecord?.collection_category === "Fund" &&
                    <>
                      <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'large', color: "#000" }}>Fund Name</h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                      </Col>
                      <Col span={12} md={12}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.fund_name}</h3>
                      </Col>
                    </>}
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'large', color: "#000" }}>Person Name</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>
                  <Col span={12} md={12}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.member_name}</h3>
                  </Col>
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'large', color: "#000" }}>Mobile Number</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>
                  <Col span={12} md={12}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.mobile_number}</h3>
                  </Col>
                  {CollectionRecord?.collection_category !== "Fund" &&
                    <>
                      <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <h3 style={{ fontWeight: 'large', color: "#000" }}>Interest Category</h3>
                        <span style={{ fontSize: '15px' }}>:</span>
                      </Col>
                      <Col span={12} md={12}>
                        <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.interest_category}</h3>
                      </Col>
                    </>}
                  {CollectionRecord?.collection_category !== "Fund" &&
                    <>
                      {CollectionRecord?.interest_category === "Interest" &&
                        <>
                          <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                            <h3 style={{ fontWeight: 'large', color: "#000" }}>Interest Amount</h3>
                            <span style={{ fontSize: '15px' }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>₹&nbsp;{CollectionRecord?.interst_amount}</h3>
                          </Col>

                          <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                            <h3 style={{ fontWeight: 'large', color: "#000" }}>Penalty Amount</h3>
                            <span style={{ fontSize: '15px' }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>₹&nbsp;{CollectionRecord?.penalty_amount}</h3>
                          </Col>
                        </>}
                      {CollectionRecord?.interest_category === "Interest with capital" &&
                        <>
                          <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                            <h3 style={{ fontWeight: 'large', color: "#000" }}>Interest Amount</h3>
                            <span style={{ fontSize: '15px' }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>₹&nbsp;{CollectionRecord?.interst_amount}</h3>
                          </Col>
                        </>
                      }
                      {CollectionRecord?.interest_category === "Installment Interest" &&
                        <>
                          <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                            <h3 style={{ fontWeight: 'large', color: "#000" }}>Penalty Amount</h3>
                            <span style={{ fontSize: '15px' }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>₹&nbsp;{CollectionRecord?.penalty_amount}</h3>
                          </Col>
                          <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                            <h3 style={{ fontWeight: 'large', color: "#000" }}>No of Count Install</h3>
                            <span style={{ fontSize: '15px' }}>:</span>
                          </Col>
                          <Col span={12} md={12}>
                            <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.no_count_install}</h3>
                          </Col>

                        </>}
                    </>
                  }
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'large', color: "#000" }}>Amount</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>
                  <Col span={12} md={12}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>₹&nbsp;{(CollectionRecord?.collection_category === "Chit Interest" || CollectionRecord?.collection_category === "Management Interest") ? TotalChitMangementAmt : CollectionRecord?.amount}</h3>
                  </Col>
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'large', color: "#000" }}>Discount Amount</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>
                  <Col span={12} md={12}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>₹&nbsp;{CollectionRecord?.discount_amount}</h3>
                  </Col>
                  <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                    <h3 style={{ fontWeight: 'large', color: "#000" }}>Comments</h3>
                    <span style={{ fontSize: '15px' }}>:</span>
                  </Col>
                  <Col span={12} md={12}>
                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color: "#696969" }}>{CollectionRecord?.comments}</h3>
                  </Col>
                </>
              }
            </CustomRow>
          </Col>
        </CustomRow>
      </Fragment>
    </Totalstyle>
  )
}
export default CollectionViewDetails
