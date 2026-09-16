import React, { Fragment } from 'react'
import { Input as AntdInput, Form } from 'antd'
import styled from 'styled-components'
import Label from '@components/form/Label'
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
const AntdInputStyle = styled(AntdInput)`
  height: ${props => (props.height ? props.height : Styles.Height)};
  border-radius: 0.4rem;
  box-shadow: none;
  border-color: ${props => (props.error ? 'red' : '#d9d9d9')};

  ::placeholder{
    font-size:${Styles.InputPlaceholderSize};
    font-weight:${Styles.InputPlaceholderWeight};
    color:${Styles.InputPlaceholderColor};
    font-family:${Styles. Inputfontfamily} ;
  }

  :focus {
    border-color: #57a8e9;
    outline: 0;
    -webkit-box-shadow: 0 0 0 2px rgba(87,168,233, .2);
    box-shadow: 0 0 0 2px rgba(87,168,233, .2);
  }

  :hover {
    border:1px solid #b3d8ff;
  }

  :not(.ant-input-affix-wrapper-disabled):hover {
    border:1px solid #b3d8ff !important;
  }

  .ant-input-affix-wrapper-focused {
    box-shadow: none;
    border-right-width: 0px !important;
  }

  &.ant-input{
    font-family:${Styles. Inputfontfamily} ;
    font-size:${Styles.InputSize};
    font-weight:${Styles.InputWeight};
    color:${Styles.InputColor};
    padding: 8px 11px !important;
    color: #000000;
  }

  &.ant-input[disabled] {
    font-family:${Styles. Inputfontfamily} ;
    font-size:${Styles.InputSize};
    font-weight:${Styles.InputWeight};
    color:${Styles.InputColor};
    text-align: left;
    border: 1px solid #d9d9d9;
  }
  &.ant-input-affix-wrapper-disabled .ant-input[disabled] {
    color:${Styles.InputColor} !important;
  }
`
const CustomInput = ({
  label,
  type,
  name,
  rules,
  step,
  onChange,
  placeholder,
  display,
  required,
  autoFocus,
  disabled,
  readOnly,
  width,
  height,
  marginRight,
  labelStyle,
  defaultValue,
  minWidth,
  value,
  optional,
  initialValue,
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

      <AntdInputStyle
        {...rest}
        defaultValue={defaultValue}
        type={type}
        autoFocus={autoFocus}
        readOnly={readOnly}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        height={height}
        step={step}
      />

    </StyledItem>

  )
}

export default CustomInput;