import React, { Fragment } from 'react'
import { TimePicker as AntdTimePicker, Form } from 'antd'
import styled from 'styled-components'
import { THEME } from '@theme/index'
import Label from '@components/form/Label'
import { Styles } from '@components/form/CommonProperties'

const { Item } = Form

const StyledItem = styled(Item)`
  > div {
    width: 100%;
    text-align: left;
  }

  border-radius: 10px;
  margin-bottom: 5px !important;
`
const AntdTimePickerStyle = styled(AntdTimePicker)`
        border-color: ${props => (props.error ? 'red' : '#d9d9d9')};
        width: 100%;
        height: ${Styles.Height};

        & ::placeholder{
            font-size:${Styles.InputPlaceholderSize};
            font-weight:${Styles.InputPlaceholderWeight};
            color:${Styles.InputPlaceholderColor};
        }
        &.ant-picker .ant-picker-input,
        &.ant-picker .ant-picker-input >input {
        font-size:${Styles.InputSize};
        font-weight:${Styles.InputWeight};
        color:${Styles.InputColor};
        }
    :focus {
        border-color: 3px solid ${THEME.primary};
        box-shadow: none;
    }
    :hover {
        border-color: 3px solid ${THEME.primary};
    }
    :not(.ant-input-affix-wrapper-disabled):hover {
        border-color: 3px solid ${THEME.primary} !important;
    }
    & .ant-picker:hover {
        border-color: #d9d9d9 !important;
    }
    :where(.css-dev-only-do-not-override-2i2tap).ant-picker-focused.ant-picker {
        border-color: #d9d9d9 !important;
    }
`
const CustomTimePicker = ({
    width,
    marginRight,
    minWidth,
    display,
    rules,
    noStyle = undefined,
    name,
    label,
    required,
    labelStyle,
    optional,
    disabled,
    placeholder,

    use12Hours,


    type,
    step,
    onChange,
    autoFocus,
    readOnly,
    height,
    defaultValue,
    value,
    ...rest
}) => {

    const TimeFormat = "HH:mm A";

    const handleTimeChange = (time, timeString) => {
        onChange(timeString);
    };

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
            <AntdTimePickerStyle
                {...rest}
                type={type}
                use12Hours={use12Hours}
                autoFocus={autoFocus}
                readOnly={readOnly}
                onChange={handleTimeChange}
                value={value}
                placeholder={placeholder}
                disabled={disabled}
                format={TimeFormat}
            />
        </StyledItem>
    )
}

export default CustomTimePicker

// --------------  Time Usage --------------

// =======  Get Selected Time =======
//  const [inTime, setInTime] = useState(null)

// const inTimeChange = (time) => {
//     setInTime(time);
// }


{/* <CustomTimePicker label={'Upload'} name={'Time'} onChange={inTimeChange} rules={[
            {
              required: true,
              message: 'Please Select Time'
            }
          ]}/> */}