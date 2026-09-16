import { Fragment } from 'react';
import { Select as AntdSelect, Form } from 'antd';
import Label from '@components/form/Label';
import styled from 'styled-components';
import Button from '@components/form/CustomButton';
import { PlusCircleOutlined } from '@ant-design/icons';
import { THEME } from '@theme/index';
import { SvgIcons } from '@assets/Svg';
import { Styles } from '@components/form/CommonProperties'
import { FaPlusCircle } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";

const { Item } = Form;
const { Option } = AntdSelect;

const StyledItem = styled(Item)`
  width:100%;
  border-radius: 0.4rem;
  margin-bottom: 0px !important;
  font-size:${Styles.InputSize};
  font-weight:${Styles.InputWeight};

  > div {
    width: 100%;
    text-align: left;
  }

  & .ant-form-item-label {
    display:block;
    width:100%;
    text-align:start;
  }
`

const ButtonContainerHolder = styled.div`
  background:'green';
  margin-top: 10px;
  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    border-top-left-radius: 0.4rem !important;
      border-bottom-left-radius:0.4rem !important;
      border-top-right-radius: 0px !important;
      border-bottom-right-radius: 0px !important;
      background: #fff !important;
;
  }
  .ant-select:not(.ant-select-customize-input) .ant-select-selector:hover{
    border-color: #D9D9D9 !important;
  }
  .ant-btn-default:not(:disabled):not(.ant-btn-disabled):hover {
    border-color: #D9D9D9 !important;
  }
`
const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width:100%;
  margin-bottom:5px;
  margin-top:5px;
`;
const AntdSelectStyle = styled(AntdSelect)`
  margin-bottom: 5px;
  border-top-left-radius: 6px;
  height: ${props => (props.height ? props.height : Styles.Height)};
  box-shadow: none;
  border-color: ${props => (props.error ? 'red' : '#D9D9D9')};
  

  .ant-select-single .ant-select-selector {
      box-sizing: border-box;
      margin: 0;
      padding: 2;
      color: rgba(0, 0, 0, 0.88);
      font-size:${Styles.InputSize};
      line-height: 1.5714285714285714;
      list-style: none;
      display: flex;
      /* border-radius: 6px; */
      border-top-left-radius: 0.4rem !important;
      border-bottom-left-radius:0.4rem !important;
      border-top-right-radius: 0px !important;
      border-bottom-right-radius: 0px !important;
  }
  
  &.ant-select-single.ant-select-show-arrow 
  .ant-select-selection-placeholder  {
    font-size:${Styles.InputPlaceholderSize};
    font-weight:${Styles.InputPlaceholderWeight};
    color:${Styles.InputPlaceholderColor};
  }
  :focus {
    border-color: #E9E9E9;
    box-shadow: none;
  }
  :hover {
    /* border-color: #E9E9E9; */
  }
  & .ant-select-selector {
    height: 100% !important;
    & input {
      height: 100% !important;
    }
  }
  &.ant-input[disabled] {
    color: #545454;
    font-size:${Styles.InputSize};
    font-weight:${Styles.InputWeight};
    text-align: left;
    border: 1px solid #D9D9D9;
  }
  & .ant-select-selection-item {
    margin: auto;
    font-size:${Styles.InputSize};
    font-weight:${Styles.InputWeight};
    color:${Styles.InputColor};
  }
  & .ant-select-selection-placeholder {
    margin: auto;
  }
`

const PlusIcon = styled.div`
  & svg {
    background-color: ${THEME.primary};
    color: #fff;
    border-radius: 50%;
    margin-top: 4px;
  }
`

const CustomAddSelect = ({
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
  return (
    <ButtonContainerHolder>
      {
        label && (
          <Fragment>
            <Label required={required} labelStyle={labelStyle}>
              {label} <span>{optional}</span>
            </Label>
          </Fragment>)
      }

      <ButtonContainer>
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
        // label={
        //   label && (
        //     <Fragment>
        //       <Label required={required} labelStyle={labelStyle}>
        //         {label} <span>{optional}</span>
        //       </Label>
        //     </Fragment>
        //   )
        // }
        >
          <AntdSelectStyle
            notFoundContent={notFoundContent}
            placeholder={placeholder}
            showSearch={true}
            value={value}
            disabled={disabled}
            onChange={onChange}
            suffixIcon={<img src={SvgIcons.DownArrow} style={{ pointerEvents: 'none' }} />}
            name={name}
            defaultValue={defaultValue}
            optionFilterProp="children"
            filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
            filterSort={(optionA, optionB) =>
              (optionA?.children ?? '').toLowerCase().localeCompare((optionB?.children ?? '').toLowerCase())
            }
          >
            {options.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </AntdSelectStyle>
        </StyledItem>
        <Button
          style={{
            height: Styles.Height,
            backgroundColor: '#EEEEEE',
            color: '#0958D9',
            borderTopRightRadius: '0.4rem',
            borderBottomRightRadius: '0.4rem',
            borderTopLeftRadius: '0px',
            borderBottomLeftRadius: '0px',
          }}
          // disabled={disabled || isSelectDisabled}
          onClick={onButtonClick}
        >
          {/* <PlusIcon>
                <PlusCircleOutlined />
              </PlusIcon> */}
          <FaPlusCircle
            style={{
              // fontSize: "20px", 
              color: "#990000",
              width:"25px",
              height:"20px",
              marginTop: "6",
            }}
          />
        </Button>
      </ButtonContainer>
    </ButtonContainerHolder>
  );
};

export default CustomAddSelect