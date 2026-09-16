// import { Select, Button } from 'antd';
import { Fragment, useState } from 'react';
import { Select as AntdSelect, Form } from 'antd'
import styled from 'styled-components'
import { PlusCircleOutlined } from '@ant-design/icons'
import { THEME } from '@theme/index';
import Label from '@components/form/Label';
import Button from '@components/form/CustomButton';
import { Styles } from '@components/form/CommonProperties'

const { Item } = Form
const { Option } = AntdSelect;

const StyledItem = styled(Item)`
  > div {
    width: 100%;
    text-align: left;
    /* align-items:center; */
  }
  border-radius: 8px;
  margin-bottom: -5px !important;
`
const AntdSelectStyle = styled(AntdSelect)`
margin-bottom:5px;

height: ${props => (props.height ? props.height : '50px')};
border-radius: 8px;
box-shadow: none;
border-color: ${props => (props.error ? 'red' : '#8056F7')};

:focus {
  border-color: ${THEME.primary};
  box-shadow: none;
}

&.ant-select-single.ant-select-show-arrow 
  .ant-select-selection-placeholder  {
    font-size:${Styles.InputPlaceholderSize};
    font-weight:${Styles.InputPlaceholderWeight};
    color:${Styles.InputPlaceholderColor};
  }
  
& .ant-select-selector {
    height:100% !important;
    border: 1px solid #d9d9d9 !important;
    color: rgb(14 13 13) !important;
    & input{
    height:100% !important;
    /* border: 1px solid ${THEME.primary}; */

    }
  }
  &.ant-input[disabled] {
    /* color: ${THEME.black}; */
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
  }
  & .ant-select-selection-item{
    margin:auto;
    font-size:${Styles.InputSize};
    font-weight:${Styles.InputWeight};
    color:${Styles.InputColor};
  }
  & .ant-select-selection-placeholder { 
    margin:auto;
  }
`

const CustomDropSelect = ({
    initialValue,
    label,
    type,
    name,
    buttonLabel,
    onButtonClick,
    rules,
    onChange,
    placeholder,
    required,
    disabled,
    options,
    width,
    minWidth,
    height,
    onSearch,
    searchText,
    notFoundContent,
    value,
    showSearch,
    marginRight,
    labelStyle,
    defaultValue,
    optional,
    noStyle = undefined,
    ...rest
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleButtonClick = () => {
        setIsDropdownOpen(false);
        onButtonClick();
    };

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
            <AntdSelectStyle
                placeholder={placeholder}
                showSearch={showSearch}
                value={searchText}
                onChange={onChange}
                onSearch={onSearch}
                disabled={disabled}
                defaultValue={defaultValue}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                dropdownRender={(menu) => (
                    <div>
                        <div style={{ padding: '8px 12px' }}>
                            <Button style={{ border: `1px solid ${THEME.PRIMARY}`, width: '100%', color: `${THEME.PRIMARY}`, }} onClick={handleButtonClick}>
                                <PlusCircleOutlined /> {buttonLabel}
                            </Button>
                        </div>
                        {menu}
                    </div>
                )}
                open={isDropdownOpen}
                onDropdownVisibleChange={(open) => setIsDropdownOpen(open)}
                {...rest}
            >
                {options.map((option) => (
                    <Option key={option.value} value={option.value}>
                        {option.label}
                    </Option>
                ))}
            </AntdSelectStyle>
        </StyledItem>
    )
}

export default CustomDropSelect