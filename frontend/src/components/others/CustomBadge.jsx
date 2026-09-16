import { THEME } from '@theme/index'
import { Badge as AntdBadge } from 'antd'
import React from 'react'
import styled from 'styled-components'

const CustomBadge = ({ dot, icon }) => {
    return (

        <StyledBadge dot={dot}>
            {icon}
        </StyledBadge>
    )
}

export default CustomBadge

const StyledBadge = styled(AntdBadge)`
    width:32px;
    height:32px;
    /* background:${THEME.primary_color_gray2}; */
    border-radius:6px;
    transition: 0.5s;
    display:flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    /* &:hover svg path{
        color:${THEME.white};
    } */
`       
