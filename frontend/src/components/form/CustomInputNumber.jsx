import React, { Fragment } from 'react'
import Label from '@components/form/Label'
import styled from 'styled-components'
import { InputNumber as AntdInputNumber, Form } from 'antd'
import { Styles } from '@components/form/CommonProperties'

const { Item } = Form

const StyledItem = styled(Item)`
  > div {
    width: 100%;
    text-align: left;
  } 
  border-radius: 0.4rem;
  margin-bottom: 5px !important;
`

const AntdInputNumberStyle = styled(AntdInputNumber)`
  width: 100%;
  height: ${props => (props.height ? props.height : Styles.Height)};
  border-radius: 0.4rem;
  box-shadow: none;
  border-color: ${props => (props.error ? 'red' : '#ced4da')};

  ::placeholder {
    font-size:${Styles.InputPlaceholderSize};
    font-weight:${Styles.InputPlaceholderWeight};
    color:${Styles.InputPlaceholderColor} !important;
  }

  .ant-input:focus,
.ant-input-focused {
    border-color: #57a8e9;
    outline: 0;
    -webkit-box-shadow: 0 0 0 2px rgba(87, 168, 233, .2);
    box-shadow: 0 0 0 2px rgba(87, 168, 233, .2);
}

  :hover {
    border:1px solid #b3d8ff;
  }

  :not(.ant-input-affix-wrapper-disabled):hover {
    border: 1px solid #b3d8ff !important;
  }
 .ant-input-number:hover {
    border-color: transparent !important;
    margin-top: 3px;
}

  .ant-input-affix-wrapper-focused {
    box-shadow: none;
    border-right-width: 0px !important;
  }

  .ant-input-number-prefix {
    color: #dbdbdb;
  }

  .ant-input-number-input {
    font-size:${Styles.InputSize};
    font-weight:${Styles.InputWeight};
    color:${Styles.InputColor};
    height:100%;
  }

  .ant-input-number-handler-wrap {
    opacity: unset;
    border-radius: 0 8px 8px 0;
    padding-top: 4px;
  }

  .ant-input-number-input-wrap{
    height:100%;
  }

  .ant-input-number-handler {
    width: 20px;
    height: 12px;
    color: #989898;
  }

  .ant-input-number-handler-up,
  .ant-input-number-handler-down {
    background: #ededed;
    margin-bottom: 2px;
    border-radius: 3px;
    margin-top: 2px;
  }

  .ant-input-number-handler-up:hover,
  .ant-input-number-handler-down:hover {
    height: 12px !important;
  }

  &.ant-input-number:hover .ant-input-number-handler-wrap{
    opacity: 0 !important;
  }
  
  &.ant-input-number:focus .ant-input-number-handler-wrap{
    opacity: 0 !important;
  }

  .ant-input-number-handler-wrap{
    opacity: 0;
  }

  .ant-input-number-focused .ant-input-number-handler-wrap {
    opacity: 0 !important;
  }

  &.ant-input[disabled] {
    color: #545454;
    font-size:${Styles.InputSize};
    font-weight:${Styles.InputWeight};
    color:${Styles.InputColor};
    text-align: left;
    border: 1px solid #ced4da;
  }
`

const CustomInputNumber = ({
  label,
  type,
  name,
  rules,
  step,
  display,
  onChange,
  addonAfter,
  placeholder,
  required,
  autoFocus,
  disabled,
  readOnly,
  width,
  precision,
  height,
  marginRight,
  labelStyle,
  defaultValue,
  placed,
  minWidth,
  optional,
  min,
  max,
  suffix,
  noStyle = undefined,
  ...rest
}) => {

  return (
    <StyledItem
      style={{
        width: width,
        marginRight: marginRight,
        minWidth: minWidth,
        display: display,
      }}
      rules={rules}
      noStyle={noStyle}
      name={name}
      colon={false}
      required={false}
      label={
        label && (
          <Fragment>
            <Label required={required} labelStyle={labelStyle}>
              {label} <span>{optional}</span>
            </Label>
          </Fragment>
        )
      }
    >
      
          <AntdInputNumberStyle
            {...rest}
            defaultValue={defaultValue}
            placed={placed}
            type={type}
            autoFocus={autoFocus}
            readOnly={readOnly}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            height={height}
            step={step}
            addonAfter={addonAfter}
            suffix={suffix}
            precision={precision}
            min={min}
            max={max}
          />
    </StyledItem>
  )
}

export default CustomInputNumber