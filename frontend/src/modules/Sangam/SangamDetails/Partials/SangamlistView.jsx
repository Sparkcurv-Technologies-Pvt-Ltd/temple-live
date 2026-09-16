import { CustomRow, Flex } from '@components/others'
import { CustomPageFormTitle2, CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col } from 'antd'
import React from 'react'
import styled from 'styled-components';

const Totalstyle = styled.div`
  padding: 0px 24px 24px 35px !important;
`;

export const SangamlistView = ({ record }) => {
    return (
        <Totalstyle>
            <div>
                <CustomRow>
                    <Col span={24} md={24}>
                        <CustomPageTitle Heading={'Sangam List View'} />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomRow>
                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color:"#000" }}>Sangam Name</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{record?.name}</h3>
                            </Col>

                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color:"#000" }}>Starting Date</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{record?.starting_date}</h3>
                            </Col>

                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color:"#000" }}>Sangam Head</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{record?.head_name}</h3>
                            </Col>

                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color:"#000" }}>Member No</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{record?.head_mem_no}</h3>
                            </Col>

                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color:"#000" }}>Sangam Secretary</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{record?.secretry_name}</h3>
                            </Col>

                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color:"#000" }}>Member No</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{record?.secretry_mem_no}</h3>
                            </Col>

                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color:"#000" }}>Sangam Treasure</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{record?.treasurey_name}</h3>
                            </Col>

                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color:"#000" }}>Member No</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{record?.treasurey_mem_no}</h3>
                            </Col>

                            <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                <h3 style={{ fontWeight: 'large', color:"#000" }}>Opening Balance</h3>
                                <span style={{ fontSize: '15px' }}>:</span>
                            </Col>
                            <Col span={12} md={12}>
                                <h3 style={{ paddingLeft: '5px', fontWeight: 'normal', color:"#696969" }}>{record?.opening_balance_amt}</h3>
                            </Col>
                        </CustomRow>
                        {/* <h4>Sangam Name: {record?.name}</h4> */}
                        {/* <h4>Starting Date: {record?.starting_date}</h4> */}
                        {/* <h4>Sangam Head: {record?.head_name}</h4> */}
                        {/* <h4>Member No: {record?.head_mem_no}</h4>
                <h4>Sangam Secretary: {record?.secretry_name}</h4> */}
                        {/* <h4>Member No: {record?.secretry_mem_no}</h4>
                <h4>Sangam Treasure: {record?.treasurey_name}</h4> */}
                        {/* <h4>Member No: {record?.treasurey_mem_no}</h4>
                <h4>Opening Balance: {record?.opening_balance_amt}</h4> */}
                    </Col>
                    <Col span={24} md={12}>
                        <Flex center={'true'}>
                            <CustomPageFormTitle2 Heading={'Sangam Members:'} />
                        </Flex>
                        <br />
                        {record?.sangama.map((fam, index) => (
                            <div key={fam?.id}>
                                <Flex center={'true'}>

                                    <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                        <h3 style={{ fontWeight: 'large', color:"#000" }}>{fam?.member_name}</h3>
                                        <span style={{ fontSize: '15px' }}>:</span>
                                        <h3 style={{ paddingLeft: '0px', fontWeight: 'normal', color:"#696969" }}>[ {fam?.member_no} ]</h3>
                                    </Col>

                                    <h4>  </h4>

                                </Flex>
                            </div>

                        ))}
                    </Col>
                    {/* <h4>{record?.sangama?.member_name}</h4> */}


                </CustomRow>
            </div>
        </Totalstyle>
    )
}
