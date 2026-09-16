import { CustomTabs } from '@components/form/CustomTabs'
import { CustomCardView, CustomModal, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Form } from 'antd'
import React, { Fragment, useEffect, useState } from 'react'
import { MemberBalanceReport, MemberBalanceSheet, MemberPaidHistory } from './MemberProfileTabs'
import { StyledHeading } from '../style'
import request from '@request/request'
import { useParams, useSearchParams } from 'react-router-dom'
import { APIURLS } from '@request/apiUrls/urls'
import successHandler from '@request/successHandler'
import styled from 'styled-components'
import { FaCameraRotate } from 'react-icons/fa6'
import DummyMember from '@assets/images/Sampling.png'
import MemberListProfilePrint from './TabPrintPages/MemberListProfilePrint'
import { Button } from '@components/form'
import { FcPrint } from "react-icons/fc";

const Totalstyle = styled.div`
    & h3 {
        margin: 10px 0;
        & span {
            color: #929292;
            margin-left: 4px;
        }
    };
`

const MemberProfile = () => {

    const [form] = Form.useForm()
    const { id } = useParams()
    // WhatsApp share links come in as /memberProfileView/:id?tab=balance so
    // the balance sheet opens straight away without the user hunting for the
    // right tab. Default remains the Report tab for regular navigation.
    const [searchParams] = useSearchParams()
    const initialTabKey = searchParams.get('tab') === 'balance' ? '3' : '1'

    const [MemberDetails, setMemberDetails] = useState({})
    const [isModalOpen, setIsModalOpen] = useState(false);
    // ======  Modal Title and Content ========
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState(null);

    // ----------  Form Reset UseState ---------
    const [modelwith, setModelwith] = useState(0);

    // ===== Modal Functions Start =====
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const openModal = (record) => {
        setModelwith(400)
        setModalContent(<ImageView Imgrecord={record} />);
        showModal();
    }

    //================ When Submit Click on Print==========================

    const printOk = async () => {
        setModelwith(500)
        setModalContent(<MemberListProfilePrint MemberprofileData={Memberprofile} MemberDetails={MemberDetails} />);
    };

    const PrintModal = () => {
        return (
            <Fragment>
                <h1 style={{ fontSize: '1.2rem' }}>Are you Sure You Want to Print ?</h1>
                <br />
                <Flex gap={'20px'} w_100={"true"} center={"true"} verticallyCenter={true}>
                    <Button.Success text={'Print'} onClick={() => printOk()} />
                    <Button.Danger text={'Cancel'} onClick={handleOk} />
                </Flex>
            </Fragment>
        )
    }
    const handlePrintClick = () => {
        setModelwith(400)
        setModalContent(<PrintModal />);
        showModal();
    }
    //============================
    const ImageView = ({ Imgrecord }) => {
        return (
            <>
                <CustomPageTitle Heading={'Profile Picture'} /><br />

                {Imgrecord ? <img src={Imgrecord} width={'100%'} height={'100%'} />
                    : <img src={DummyMember} width={'100%'} height={'100%'} />
                }

            </>
        )
    }

    const Memberprofile = MemberDetails?.profile;

    const TabOptions = [
        {
            key: "1",
            label: "Report",
            children: <MemberBalanceReport datas={MemberDetails} />
        },
        {
            key: "2",
            label: "Paid History",
            children: <MemberPaidHistory datas={MemberDetails} />
        },
        {
            key: "3",
            label: "Balance Sheet",
            children: <MemberBalanceSheet datas={MemberDetails} />
        },
    ]

    useEffect(() => {
        GetDetailsMember()
    }, [])

    const GetDetailsMember = async () => {
        await request.get(`${APIURLS.GET_MEMBER_PROFILE_LIST}/${id}/`)
            .then(function (response) {
                successHandler(response, {
                    type: 'success'
                })
                setMemberDetails(response.data)
                return response.data;
            })
            .catch(function (error) {
                console.log(error.response, 'errors');
            })
    }

    return (
        <Form
            name='ViewMemberProfile'
            form={form}
            labelCol={{
                span: 24,
            }}
            wrapperCol={{
                span: 24,
            }}
            autoComplete="off"
        >
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={24}>
                        <CustomPageTitle Heading={'View Member Details'} />
                    </Col>
                    <Col span={24} md={16}>
                        <StyledHeading style={{ marginTop: "25px", textAlign: "left" }}>
                            <h2>Member  Details</h2>
                        </StyledHeading><br />
                        <h1>Family No: {MemberDetails?.family_no}</h1><br />
                        <CustomRow>
                            <Col span={24} md={12}>
                                <Totalstyle>
                                    <h3>Member No : <span>{Memberprofile?.member_no}</span></h3>
                                    <h3>Name : <span>{Memberprofile?.member_name}</span></h3>
                                    <h3>Date of Birth : <span>{Memberprofile?.member_dob}</span></h3>
                                    <h3>Age: <span>{Memberprofile?.member_age}</span></h3>
                                    <h3>Email ID : <span>{Memberprofile?.member_email}</span></h3>
                                    <h3>Gender : <span>{Memberprofile?.member_gender}</span></h3>
                                </Totalstyle>
                            </Col>
                            <Col span={24} md={12}>
                                <Totalstyle>
                                    <h3>Mobile Number : <span> {Memberprofile?.member_mobile_number}</span></h3>
                                    <h3>Address: <span> {MemberDetails?.address}</span></h3>
                                    {/* <h3>D.O.B : <span> {Memberprofile?.member_dob}</span></h3> */}
                                    <h3>Joining Amount : <span> {Memberprofile?.member_joining_amt}</span>&nbsp;{Memberprofile?.member_joining_amt > 0 && <span style={{ cursor: 'pointer'}} onClick={handlePrintClick}><FcPrint size={25} /></span>}</h3>
                                    {/* <h3>Opening Balance Amount : <span>{Memberprofile?.member_balance_amt}</span></h3> */}
                                    {/* QA Bug 1 — separate "Total Due" and "Total Collected"
                                        so operators can quickly reconcile a member's
                                        historical dues against payments received. */}
                                    <h3 data-testid="member-total-collected">
                                        Total Collected :
                                        <span>
                                            &nbsp;₹&nbsp;
                                            {Number(MemberDetails?.paid_amt_total || 0).toFixed(2)}
                                        </span>
                                    </h3>
                                    <h3 data-testid="member-total-due">
                                        Total Due :
                                        <span>
                                            &nbsp;₹&nbsp;
                                            {(
                                                Number(MemberDetails?.paid_amt_total || 0) +
                                                Number(MemberDetails?.temple_mem_pending_amt || 0)
                                            ).toFixed(2)}
                                        </span>
                                    </h3>
                                    <h3>Total Pending Balance : <span>₹&nbsp;{MemberDetails?.temple_mem_pending_amt}</span></h3>
                                </Totalstyle>
                            </Col>
                        </CustomRow>
                    </Col>
                    <Col span={24} md={8}>
                        <ImgMobileRes>
                            <Flex end style={{
                                objectFit: "cover", height: 'auto',
                                position: 'relative'
                            }} className='ImgMobileRes'>
                                {Memberprofile?.member_photo ?
                                    <img src={`${Memberprofile?.member_photo}`}
                                        // width={100} height={100}
                                        style={{
                                            border: '3px dotted',
                                            padding: '2px', height: '170px', width: '170px'
                                        }}
                                        onClick={() => openModal(Memberprofile?.member_photo)}
                                    />
                                    : <img src={DummyMember} style={{
                                        border: '3px dotted',
                                        padding: '2px', height: '170px', width: '170px'
                                    }} />
                                }
                                <FaCameraRotate fontSize='40px' color='red' style={{
                                    position: 'absolute', bottom: '-3px', right: '-15px', color: '#7c7c7c',
                                    background: 'white', borderRadius: '20px', padding: '3px',
                                    border: '1px solid'
                                }} onClick={() => openModal(Memberprofile?.member_photo)} />
                                {/* ${IMG_BASE_URL} */}
                            </Flex>
                        </ImgMobileRes>
                    </Col>
                    {/* Owner rule (Feb 2026): Tabs (Balance Sheet /
                        Collection History / etc.) must be visible for
                        every member profile, not only Sangam / tax-
                        eligible members.  Non-Sangam members also
                        accrue balances that admins need to inspect. */}
                    <Col span={24} md={24}>
                        <CustomTabs tabs={TabOptions} defaultActiveKey={initialTabKey} />
                    </Col>
                </CustomRow>

            </CustomCardView>
            <CustomModal
                isVisible={isModalOpen}
                handleOk={handleOk}
                handleCancel={handleCancel}
                width={modelwith}
                modalTitle={modalTitle}
                modalContent={modalContent}
            />
        </Form>
    )
}

export default MemberProfile

const ImgMobileRes = styled.div`
    .ImgMobileRes {
        margin-right: 100px;
        @media screen and (max-width: 700px){
            margin-right: 20px;
        }
    }
`