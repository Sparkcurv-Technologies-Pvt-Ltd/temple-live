import React from 'react'
import { Row as AntdRow } from 'antd'
import styled from 'styled-components'

const StyledRow = styled(AntdRow)`
    margin-left:0 !important;
    margin-right:0 !important;
    align-items:${props => props.center ? 'center' : 'start'};
`;
const CustomRow = ({ space, children, center }) => {

    return (
        <StyledRow gutter={space} center={center} >
            {children}
        </StyledRow>
    )
}

export default CustomRow
