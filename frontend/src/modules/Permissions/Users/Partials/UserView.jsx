import { CustomRow } from '@components/others';
import { CustomPageFormTitle, CustomPageTitle } from '@components/others/CustomPageTitle';
import { Col } from 'antd';
import React from 'react'
import styled from 'styled-components';

const Totalstyle = styled.div`
  padding: 0px 24px 24px 25px !important;
`;
export const UserView = (viewUserlist) => {
    return (
        <Totalstyle>
            <div>
                <CustomRow>
                    <Col span={24} md={24}>
                        <CustomPageTitle Heading={'User List View'} />
                    </Col>
                    <CustomRow>
                        
                        <Col span={24} md={24}>
                             <CustomPageFormTitle Heading={"user Role Details :"}/>
                        </Col>
                        <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                            <h3 style={{ fontWeight: 'normal' }}>User Name</h3>
                            <span style={{ fontSize: '15px' }}>:</span>
                        </Col>
                        <Col span={12} md={12}>
                            <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{viewUserlist?.viewUserlist?.name}</h3>
                        </Col>
                        <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                            <h3 style={{ fontWeight: 'normal' }}>Email</h3>
                            <span style={{ fontSize: '15px' }}>:</span>
                        </Col>
                        <Col span={12} md={12}>
                            <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{viewUserlist?.viewUserlist?.email}</h3>
                        </Col>
                        <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                            <h3 style={{ fontWeight: 'normal' }}>Roll Name</h3>
                            <span style={{ fontSize: '15px' }}>:</span>
                        </Col>
                        <Col span={12} md={12}>
                            <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{viewUserlist?.viewUserlist?.role_name}</h3>
                        </Col>
                        <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                            <h3 style={{ fontWeight: 'normal' }}>Native Type</h3>
                            <span style={{ fontSize: '15px' }}>:</span>
                        </Col>
                        <Col span={12} md={12}>
                            <h3 style={{ paddingLeft: '5px', fontWeight: 'normal',color:'blue' }}>{viewUserlist?.viewUserlist?.user_native_type}</h3>
                        </Col>
                        {viewUserlist?.viewUserlist?.user_native_type === 'Member' ? null :
                            <>
                             <Col span={12} md={24} style={{margin:'15px 0px'}} >
                                <CustomPageFormTitle Heading={"user Personal Details :"}/>
                             </Col>
                                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                    <h3 style={{ fontWeight: 'normal' }}>Name</h3>
                                    <span style={{ fontSize: '15px' }}>:</span>
                                </Col>
                                <Col span={12} md={12}>
                                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{viewUserlist?.viewUserlist?.othersname}</h3>
                                </Col>

                                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                    <h3 style={{ fontWeight: 'normal' }}>Personal Email ID</h3>
                                    <span style={{ fontSize: '15px' }}>:</span>
                                </Col>
                                <Col span={12} md={12}>
                                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{viewUserlist?.viewUserlist?.person_email}</h3>
                                </Col>
                                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                    <h3 style={{ fontWeight: 'normal' }}>Mobile Number</h3>
                                    <span style={{ fontSize: '15px' }}>:</span>
                                </Col>
                                <Col span={12} md={12}>
                                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{viewUserlist?.viewUserlist?.mobile_number}</h3>
                                </Col>
                                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                    <h3 style={{ fontWeight: 'normal' }}>Gender</h3>
                                    <span style={{ fontSize: '15px' }}>:</span>
                                </Col>
                                <Col span={12} md={12}>
                                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{viewUserlist?.viewUserlist?.gender}</h3>
                                </Col>
                                <Col span={12} md={12} style={{ display: 'flex', justifyContent: 'space-between', }}>
                                    <h3 style={{ fontWeight: 'normal' }}>Address</h3>
                                    <span style={{ fontSize: '15px' }}>:</span>
                                </Col>
                                <Col span={12} md={12}>
                                    <h3 style={{ paddingLeft: '5px', fontWeight: 'normal' }}>{viewUserlist?.viewUserlist?.address}</h3>
                                </Col>

                            </>}

                    </CustomRow>
                </CustomRow>
            </div>
        </Totalstyle>
    )
}
