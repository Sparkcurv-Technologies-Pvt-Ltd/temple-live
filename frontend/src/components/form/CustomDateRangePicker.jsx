import { DatePicker as AntdDatePicker, Form } from 'antd'
import styled from 'styled-components'
import Label from '@components/form/Label'
import { Fragment, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Styles } from '@components/form/CommonProperties'

const dateFormat = 'YYYY-MM-DD';

const { RangePicker } = AntdDatePicker;
const { Item } = Form

const StyledItem = styled(Item)`
  > div {
    width: 100%;
    text-align: left;
  }

  border-radius: 10px;
  margin-bottom: -5px !important;
`

const AntdDateRangePickerStyle = styled(RangePicker)`
    width:100%;
    height:${Styles.Height};

    &.ant-picker .ant-picker-input >input {
        font-size:${Styles.InputSize};
        font-weight:${Styles.InputWeight};
        color:${Styles.InputColor};
    }
`
const CustomDateRangePicker = ({
    initialValue,
    label,
    type,
    name,
    rules,
    onChange,
    placeholder,
    required,
    disabled,
    width,
    minWidth,
    height,
    value,
    showSearch,
    marginRight,
    labelStyle,
    defaultValue,
    optional,
    format,
    noStyle = undefined,
    ...rest
}) => {

    const [dateRange, setDateRange] = useState([]);

    useEffect(() => {
        if (value) {
            setDateRange(value);
        }
    }, [value]);

    const handleChange = (dates, dateStrings) => {
        const startDate = dayjs(dateStrings[0]);
        const endDate = dayjs(dateStrings[1]);
        const selectrange = {
            start_date: startDate.format(dateFormat),
            end_date: endDate.format(dateFormat)
        }
        const range = startDate.format(dateFormat) + ' - ' + endDate.format(dateFormat);

        setDateRange(dates);
        onChange(selectrange);
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
            <AntdDateRangePickerStyle value={dateRange}
                onChange={handleChange} />
        </StyledItem>
    )
}

export default CustomDateRangePicker

//  ==================  Working with Date Range Picker

// import { CustomDateRangePicker } from '../../../Components/Form/CustomDateRangePicker'
// import dayjs from 'dayjs';

// const [dateRange, setDateRange] = useState([]);

// ==========  Date Range Change =======

//   const handleDateRangeChange = (dates) => {
//     setDateRange(dates);
//   };
//   console.log(dateRange, 'range   ==')


// ======  Setting initial Value  =========

// const rangeValue = [dayjs('2022-01-01'), dayjs('2022-01-07')];


// initialValues={
//     {
//       range:rangeValue,
//     }
//   }

{/* <CustomDateRangePicker
    onChange={handleDateRangeChange}
    value={dateRange}
    label={'Range'}
    name={'range'}
    rules={[{ required: true, message: 'Please enter a number' }]} /> */}