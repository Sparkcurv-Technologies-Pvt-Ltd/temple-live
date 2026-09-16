/* eslint-disable */
import React, { useState } from 'react'
import { Radio as AntdRadio, Form } from 'antd'
import styled from 'styled-components'
import { THEME } from '@theme/index'

const StyledRadioss = styled.div`
    .ant-form-item .ant-form-item-label >label {
        font-size: 20px !important;
    }
`

const StyledRadio = styled(AntdRadio)`
  /* width: 100%; */
  font-weight: normal;
  
  & span{
    font-size:16px;
    font-weight:400;
  }
  
  .ant-radio-input:focus + .ant-radio-inner {
    box-shadow: none !important;
  }
  &.ant-radio-wrapper .ant-radio-inner {
    border-radius: 50%;
    background: #EEE;
    border-color:#EEE;
    width: 19px;
    height: 17px;
  }
  &.ant-radio-wrapper .ant-radio-checked .ant-radio-inner {
    border-color: ${THEME.primary};
    background-color: ${THEME.primary};
    }
    &.ant-radio-wrapper .ant-radio-inner::after {
        top: 43%;
        inset-inline-start: 21.5%;
        display: table;
        width: 5.7142857142857135px;
        height: 11.142857px;
        border-width: 0px 3px 3px !important;
        border: 2px solid #000;
        border-right-color: rgb(255 255 255);
        border-bottom-color: rgb(255 254 254);
        border-top: 0;
        border-inline-start: 0;
        transform: rotate(45deg) scale(0) translate(-50%,-50%);
        opacity: 0;
        margin-block-start: 0;
        margin-inline-start: 0;
        background-color: transparent;
        content: "";
        border-radius:0;
    }

    &.ant-radio-wrapper .ant-radio-checked .ant-radio-inner::after {
        opacity: 1;
    transform: rotate(45deg) scale(1) translate(-50%,-50%);
    transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
    }
    
`

const CustomRadioButton = ({ onChange, data, rules, name, disabled, label, ...rest }) => {

    // const [checked, setChecked] = useState(data[0].value)

    const handleOnChange = (e) => {
        onChange(e)
        // setChecked(e.target.value)
    }

    return (
        <StyledRadioss>
            <Form.Item name={name} rules={rules} label={label}>
                <StyledRadio.Group disabled={disabled} onChange={handleOnChange}  >
                    {data.map((radio) => (
                        <StyledRadio key={radio.value} value={radio.value}>
                            <span>
                                {radio.label}
                            </span>
                        </StyledRadio>
                    ))}
                </StyledRadio.Group>
            </Form.Item>
        </StyledRadioss>
    )
}

export default CustomRadioButton