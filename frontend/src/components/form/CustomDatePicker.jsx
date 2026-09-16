import { DatePicker as AntdDatePicker, Form } from 'antd'
import styled from 'styled-components'
import Label from '@components/form/Label'
import { Fragment } from 'react';
import { SvgIcons } from '@assets/Svg';
import { Styles } from '@components/form/CommonProperties'
import { THEME } from '@theme/index';



const dateFormat = 'YYYY-MM-DD';

const { Item } = Form

const StyledItem = styled(Item)`
  > div {
    width: 100%;
    text-align: left;
  }

  border-radius: 0.4rem;
  margin-bottom: 5px !important;

  & .ant-form-item-label {
    display:block;
    width:100%;
    text-align:start;
  }

  & .ant-picker   {
    border: 1px solid #d9d9d9 !important;
    border-radius: 0.4rem;
  } 

  & .ant-form-item-label > label > span {
    font-weight: ${Styles.InputWeight} !important;
    position: relative;
    font-size: ${Styles.InputSize};
    line-height: 1.3;
    letter-spacing: 0.01em;
    color: ${THEME.black} !important;
  }

`
const AntdDatePickerStyle = styled(AntdDatePicker)`
    width:100%;
    height:${Styles.Height};

    ::placeholder {
    font-size: 13px !important;
    font-weight: 700 !important;
  }

  &.ant-picker .ant-picker-input >input {
    font-size:${Styles.InputSize};
    font-weight:${Styles.InputWeight};
    color:${Styles.InputColor};
  }

  :not(.ant-input-affix-wrapper-disabled):hover {
    border:1px solid #b3d8ff !important;
  }

  .ant-input-affix-wrapper-focused {
    box-shadow: none;
    border-right-width: 0px !important;
  }
  :focus {
    border-color: #57a8e9;
    outline: 0;
    -webkit-box-shadow: 0 0 0 2px rgba(87,168,233, .2);
    box-shadow: 0 0 0 2px rgba(87,168,233, .2);
  }

`
const CustomDatePicker = ({
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
  picker,
  noStyle = undefined,
  ...rest
}) => {


  const handleChange = (date, dateString) => {
    // console.log(date, dateString, 'llll')
    // onChange(dayjs(dateString).format('YYYY-MM-DD'));
    onChange(dateString);
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

      <AntdDatePickerStyle placeholder={placeholder} disabled={disabled} suffixIcon={<img src={SvgIcons.Calender} alt='calernder' style={{ pointerEvents: 'none' }} />} name={name} picker={picker} value={value} onChange={handleChange} />

    </StyledItem>
  )

}

export default CustomDatePicker

// ====== Date Format Start   ==========
// const parsedDate = new Date(updateRecordData?.purchase_date);
// const dateFormat = 'YYYY/MM/DD';
// const date = dayjs(parsedDate).format('YYYY/MM/DD')

// form.setFieldsValue({ purchase_date: dayjs(date,dateFormat)})

// ====== Date Format End   ==========


// If you want Initial Value on Date Picker import following code

// import dayjs from 'dayjs';



// ======  Selected Date ========
//   const [selectedDate, setSelectedDate] = useState(null);

// const handleOnChange = (date) => {
//     setSelectedDate(date);
// };

// initialValues={
//     {
//       selected_date:dayjs()
//     }
//   }

// <Col span={24}>
// <CustomDatePicker
//   label={'Selected Date'}
//   name={'selected_date'}
//   onChange={handleOnChange}
//   rules={[
//     {
//       required: true,
//       message: 'Please select Date!',
//     }
//   ]} />
//   <h1>{selectedDate}</h1>
// </Col>



// ==================  Update Date =======

// useEffect(() => {
//     form.setFieldsValue(handlerecords);

//     const personDate = new Date(handlerecords?.person_dob);
//     const partnerDate = new Date(handlerecords?.partner_dob);
//     const dateFormat = 'YYYY/MM/DD';

//     const personFormattedDate = dayjs(personDate).format(dateFormat);
//     const partnerFormattedDate = dayjs(partnerDate).format(dateFormat);

//     form.setFieldsValue({ person_dob: dayjs(personFormattedDate, dateFormat), partner_dob: dayjs(partnerFormattedDate, dateFormat) });
// }, [handlerecords]);