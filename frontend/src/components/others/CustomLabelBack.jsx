import React from 'react'
import { BsArrowLeftShort } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { PiCardsBold } from 'react-icons/pi'
const BackBTN = styled.div`
display: flex;
align-items:center;
cursor: pointer;
padding: 5px 0 15px 0;
&.svg {
    font-size: 28px;
    color: #000;
}
& p {
    font-size: 14px;
    color: #000;
    font-weight: 500;
    margin-left: 7px;
}
`
const SVGS = styled.div`
/* border-radius: 10px; */
/* padding: 10px 0px 0px 6px; */
/* background: #fff; */
& svg {
    font-size: 65px;
    border-radius: 10px;
    background: #fff;
    padding: 4px;
    color: #000;
}
`
export const CustomLableBack = ({ LabelName }) => {
    const navigate = useNavigate();
    return (
        <div>
            <BackBTN onClick={() => navigate(-1)} >
                <BsArrowLeftShort style={{ fontSize: '27px' }} />
                <p>{LabelName}</p>
            </BackBTN>
        </div>
    )
}












