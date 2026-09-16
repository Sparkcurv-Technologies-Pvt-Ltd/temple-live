import { CustomCardView, CustomRow, Flex } from '@components/others'
import { CustomPageFormTitle, CustomPageTitle } from '@components/others/CustomPageTitle'
import { Card, Col } from 'antd'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { GrMoney } from "react-icons/gr";
import { GiTakeMyMoney } from 'react-icons/gi'
import Bgline from '../../../Images/linebg.svg'
import dayjs from 'dayjs'
import request from '@request/request'
import { APIURLS } from '@request/apiUrls/urls'
import { CustomStandardTable } from '@components/form/CustomStandardTable'
import DummyMember from "@assets/images/Sampling.png";


const FragmentStyle = styled.div`
    .BoxDesign {
        gap: 10px;
        padding: 30px;
        border-radius: 8px;
        color: #fff;
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 0.5px;
        background-image: url(${Bgline});
        background-position: center;
        background-size: cover;
        transition: background-color 0.3s;
    }
`;

export const InvestorOverAllDetails = () => {

    const [data, setData] = useState({})


    const DataItems = [
        {
            title: 'Invested Amt',
            backgroundColor: '#2D3748',
            icon: <GrMoney />,
            amount: data?.investment_amount || 0
        },
        {
            title: 'Share Count',
            backgroundColor: '#4A5568',
            icon: <GiTakeMyMoney />,
            amount: data?.share_count || 0
        },
        {
            title: 'Share Amt',
            backgroundColor: '#718096',
            icon: <GiTakeMyMoney />,
            amount: data?.share_amount || 0
        },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await request.get(APIURLS.INVESTOR_DASHBOARD_GET);
                setData(response.data);
            } catch (error) {
                console.error('Error fetching investor data:', error);
            }
        };
        fetchData();
    }, []);


    const TableColumn = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: "Date",
            dataIndex: "created_at",
            render: (created_at) => {
              return created_at ? new Date(created_at).toLocaleDateString() : ""; // Convert date to local date format
            },
          },
        {
            title: 'Share Amount',
            dataIndex: 'share_amount'
        },
    ]


    const currentDate = dayjs().format('YYYY-MM-DD');

    const TableData = data?.sharing || [];

    return (
        <FragmentStyle>
            <CustomCardView>
                <CustomPageTitle Heading="Invester Details" />
                <Flex end={true} style={{ margin: '20px 0px', color: '#545454' }}>
                    <h3>Date:&nbsp;&nbsp;{currentDate}</h3>
                </Flex>
                <CustomRow space={[12, 12]}>
                    {DataItems.map((item, index) => (
                        <Col span={24} md={8} key={index}>
                            <Flex  alignCenter={true} className='BoxDesign' style={{ backgroundColor: item.backgroundColor }}>
                                <div>{item.icon}&nbsp;&nbsp;<span style={{fontSize:'17px'}}>{item.title}</span></div>
                                <div>₹ {item.amount}</div>
                            </Flex>
                        </Col>
                    ))}
                </CustomRow><br />

                <CustomRow space={[12, 24]}>
                    <Col span={24} md={24}>
                        <CustomPageFormTitle Heading={'Invester Profile'} />
                    </Col>
                    <Col span={24} md={8} style={{ margin: '40px 0px' }}>
                        <Flex center={true}>
                            {data?.profile?.images !== null ?
                             <div
                             style={{
                               width: "100px",
                               height: "100px",
                               overflow: "hidden"
                             }}
                           >
                                <img src={data?.profile?.images} style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain"
                                }} />
                                </div>
                                :
                                <div
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        overflow: "hidden"
                                    }}
                                >
                                    <img
                                        src={DummyMember}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain"
                                        }}
                                    />
                                </div>}
                        </Flex>
                    </Col>
                    <Col span={24} md={8} style={{ margin: '20px 0px', color: '#545454' }}>
                        <Card>
                            <Flex margin={'10px 0px'}>
                                <p style={{color:'#545454',fontWeight:'500'}}>Joining Date:&nbsp;&nbsp;{data?.joining_date}</p>
                            </Flex>
                            <Flex margin={'10px 0px'}>
                                <p style={{color:'#545454',fontWeight:'500'}}>Retake Share Count :&nbsp;&nbsp;<span>{data?.profile?.retake_share_count}</span></p>
                            </Flex>
                            <Flex margin={'10px 0px'}>
                                <p style={{color:'#545454',fontWeight:'500'}}>Final Settlement Amt:&nbsp;&nbsp;<span>{data?.profile?.final_settlement_amount}</span></p>
                            </Flex>
                        </Card>
                    </Col>
                    <Col span={24} md={8} style={{ margin: '20px 0px', color: '#545454' }}>
                        <Card>
                            <Flex >
                                <p style={{color:'#545454',fontWeight:'500'}}>Invester Email:&nbsp;&nbsp;{data?.profile?.invester_email}</p>
                            </Flex>
                            <Flex margin={'10px 0px'}>
                                <p style={{color:'#545454',fontWeight:'500'}}>Invester Mobile:&nbsp;&nbsp;{data?.profile?.invester_mobile}</p>
                            </Flex>
                            <Flex margin={'10px 0px'}>
                                <p style={{color:'#545454',fontWeight:'500'}}>Invester Address:&nbsp;&nbsp;{data?.profile?.invester_address}</p>
                            </Flex>
                        </Card>
                    </Col>
                </CustomRow>

                <h2 style={{fontSize:'18px'}}>Profit Sharing Details :-</h2><br />
                <CustomStandardTable columns={TableColumn} data={TableData} />
            </CustomCardView>
        </FragmentStyle>
    );
};
