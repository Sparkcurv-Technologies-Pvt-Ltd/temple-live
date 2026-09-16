
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Checkbox as AntdCheckbox, Form } from 'antd'
import { THEME } from '@theme/index'
import { Styles } from '@components/form/CommonProperties'

const StyledCheckbox = styled(AntdCheckbox)`
  & .ant-checkbox .ant-checkbox-inner {
    width: 19px;
    height: 17px;
    border-radius:50%;
    border:2px solid ${THEME.primary};
    &:hover {
      background: ${THEME.primary};
    }
  }

  & .ant-checkbox .ant-checkbox-inner:after {
    inset-inline-start: 25%;
    border: 2px solid black;
    border-left: 0;
    border-top: 0;
    top: 43%;
    width: 5.7142857142857135px;
    height: 11.142857px;
    border-width: 0px 3px 3px 0px;
  }

  .ant-checkbox .ant-checkbox-inner::after {
    inset-inline-start: 25%;
    border-right-color: white;
    border-bottom-color: white;
}

  &.ant-checkbox-wrapper {
    align-items: center;
    height: 100%;
  }

  & .ant-checkbox-checked .ant-checkbox-inner {
    background-color: ${THEME.primary};
    border-color: ${THEME.primary};
  }
  
  .ant-checkbox + span {
    padding-left: 12px;
  }
  &.ant-checkbox-wrapper:not(.ant-checkbox-wrapper-disabled):hover .ant-checkbox-checked:not(.ant-checkbox-disabled) .ant-checkbox-inner {
    background-color: ${THEME.primary};
    border-color: transparent;
}
`
const LabelWrapper = styled.div`
  font-size:${Styles.LableSize};
  font-weight:${Styles.LableWeight};
  color:${Styles.LableColor};
`

const CustomCheckBox = ({disabled,onChange, label, checked,rules, name, color,  ...rest }) => {
  const [isChecked, setIsChecked] = useState(true);

  useEffect(() => {
    if (checked) {
      setIsChecked(true)
    } else{
      setIsChecked(false)
    }
  }, [checked])

  const handleChange = (checked, extraProps) => {
    if (!disabled) {
      setIsChecked(checked);
      onChange(checked, extraProps);
    }

    // console.log(checked,extraProps);
  };
   return (
    <Form.Item name={name} valuePropName="checked">
      <StyledCheckbox
        color={color}
        onChange={(checked, extraProps) => handleChange(checked, extraProps)} rules={rules} checked={isChecked} disabled={disabled}
        {...rest}
      >
        <LabelWrapper>{label}</LabelWrapper>
      </StyledCheckbox>
    </Form.Item>
  )
}

export default CustomCheckBox