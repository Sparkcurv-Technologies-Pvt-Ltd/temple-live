import React, { Fragment } from 'react'
import { Select as AntdSelect, Form } from 'antd'
import styled from 'styled-components'
import Label from '@components/form/Label'
import { THEME } from '@theme/index'
import { Styles } from '@components/form/CommonProperties'

const { Item } = Form
const { Option } = AntdSelect;

const StyledItem = styled(Item)`
  > div {
    width: 100%;
    text-align: left;
    /* align-items:center; */
  }
  
  border-radius: 10px;
  margin-bottom: -5px !important;
`
const AntdSelectStyle = styled(AntdSelect)`

margin-bottom:5px;
font-weight:600;
height: ${props => (props.height ? props.height : Styles.Height)};
border-radius: 10px;
box-shadow: none;
border-color: ${props => (props.error ? 'red' : '#e9e9e9')};

::placeholder {
  font-size: 16px;
}

:focus {
  border-color: #e9e9e9;
  box-shadow: none;
}

:hover {
  border-color: #e9e9e9;
}

& .ant-select-selector {
    height:100% !important;
    border: 1px solid #d9d9d9 !important;
    border-radius: 5px !important;
    & input{
    height:100% !important;
    }
  }

  &.ant-input[disabled] {
    color: ${THEME.black};
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
  }

  & .ant-select-selection-item{
    margin:auto;
    font-size: 1rem;
    font-weight: 600;
  }

  & .ant-select-selection-placeholder { 
    margin:auto;
  }

  & .ant-select-selection-item {
    margin:5px;
    font-size:${Styles.InputSize};
    font-weight:${Styles.InputWeight};
    color:${Styles.InputColor};
    background: #e6f4ff;
  }

  &.ant-select-multiple.ant-select-lg .ant-select-selection-item {
    color:${Styles.InputColor};
  }

  &.ant-select-multiple.ant-select-lg .ant-select-selection-item-content {
    display: inline-block;
    margin-inline-end: 8px;
    overflow: hidden;
    white-space: pre;
    text-overflow: ellipsis;
    top: 10px;
}

&.ant-select-multiple.ant-select-lg .ant-select-selection-placeholder {
    font-size:${Styles.InputPlaceholderSize};
    font-weight:${Styles.InputPlaceholderWeight};
    color:${Styles.InputPlaceholderColor};
}
`
const CustomMultiSelect = ({
  initialValue,
  label,
  type,
  name,
  rules,
  onChange,
  placeholder,
  required,
  disabled,
  options,
  width,
  minWidth,
  height,
  maxTagCount,
  notFoundContent,
  value,
  showSearch,
  marginRight,
  labelStyle,
  defaultValue,
  optional,
  mode,
  noStyle = undefined,
  ...rest
}) => {
  return (
    <StyledItem
      style={{
        width: width,
        marginRight: marginRight,
        minWidth: minWidth
      }}
      rules={rules}
      noStyle={noStyle}
      name={name}
      colon={false}
      required={false}
      initialValue={initialValue}
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

      <AntdSelectStyle disabled={disabled} mode='multiple' size='large' maxTagCount={maxTagCount} value={value} onChange={onChange} defaultValue={defaultValue} showSearch={showSearch} notFoundContent={notFoundContent} placeholder={placeholder}>
        {options.map((option) => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </AntdSelectStyle>
    </StyledItem>
  )
}

export default CustomMultiSelect