import React from 'react'
import { Input, Form } from 'antd'
import Label from '@components/form/Label'
import styled from 'styled-components'
import { Styles } from '@components/form/CommonProperties'

const { TextArea } = Input

const StyledItem = styled(Form.Item)`
  > div {
    width: 100%;
    text-align: left;
  }
  border-radius: 0.4rem;
  margin-bottom: 5px !important;
  
  .ant-input{
    font-size:${Styles.InputSize};
    font-weight:${Styles.InputWeight};
    color:${Styles.InputColor};
    border-color: ${props => (props.error ? 'red' : '#d9d9d9')};
    border-radius: 0.4rem;
  }

  & ::placeholder{
    font-size:${Styles.InputPlaceholderSize};
    font-weight:${Styles.InputPlaceholderWeight};
    color:${Styles.InputPlaceholderColor};
  }

  .ant-input:focus,
  .ant-input-focused {
    border-color: #57a8e9;
    outline: 0;
    -webkit-box-shadow: 0 0 0 2px rgba(87,168,233, .2);
    box-shadow: 0 0 0 2px rgba(87,168,233, .2);
  }

  .ant-input[disabled]{
    font-size:${Styles.InputSize};
    font-weight:${Styles.InputWeight};
    color:${Styles.InputColor};
    text-align: left;
    border-color: 1px solid #d9d9d9;
  }

  .ant-input:hover {
    border:1px solid #b3d8ff;
  }
`

const CustomTextArea = ({
  name,
  cols,
  type = 'text',
  placeholder,
  label,
  rules,
  display,
  required,
  disabled,
  rows = 4,
  ...rest
}) => {
  return (
    <StyledItem
      colon={false}
      required={false}
      label={
        label && (
          <Label required={required} showLock={rest.showLock}>
            {label}
          </Label>
        )
      }
      style={{
        display: display,
      }}
      rules={rules}
      name={name}
      {...rest}
    >
      <TextArea
        cols={cols}
        {...rest}
        type={type}
        disabled={disabled}
        rows={rows}
        placeholder={placeholder}
        style={{ resize: 'none' }}
      />
    </StyledItem>
  )
}

export default CustomTextArea