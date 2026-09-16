import { CustomRow } from '@components/others';
import { getManagement, selectManagementDetails } from '@modules/Management/ManagementSlice'
import { Col } from 'antd';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components';

const CommonManagePrint = ({ ProfileRecord }) => {

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getManagement())
    }, [])

    const AllTempleDetails = useSelector(selectManagementDetails);

    return (
        <PrintPageDtyle>
            <h1>{AllTempleDetails?.temple_name}</h1>
            <p>Address : <span>{AllTempleDetails?.address}</span></p>
            <hr/><br />
            <h3>Member Details :-</h3><br />
            <CustomRow space={[12, 12]} >
                <Col span={24} md={12}><h2>member no :<span>{ProfileRecord?.member_no}</span></h2></Col>
                <Col span={24} md={12}><h2>name :<span>{ProfileRecord?.member_name}</span></h2></Col>
                <Col span={24} md={12}><h2>mobile number :<span>{ProfileRecord?.member_mobile_number}</span></h2></Col>
                <Col span={24} md={12}><h2>age :<span>{ProfileRecord?.member_age}</span></h2></Col>
            </CustomRow>
        </PrintPageDtyle>
    )
}

export default CommonManagePrint


export const PrintPageDtyle = styled.div`
padding: 20px;
& h1 {
    text-align: center;
    margin: 20px 0;
    /* text-decoration: underline; */
};
& p {
    font-size: 15px;
    text-align: center;
    & span {
        color: #777;
        margin-left: 5px;
    }
    margin-bottom: 20px;
}
& h2 {
    color: #000;
    text-transform: capitalize;
    margin-right: 5px;
    font-size: 15px;
    & span {
        color: #777;
        margin-left: 5px;
    }
}
`