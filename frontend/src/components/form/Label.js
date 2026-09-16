import { THEME } from '@theme/index'
import styled from 'styled-components'
import { Styles } from '@components/form/CommonProperties'

const Label = styled.span`
  position: relative;
  color: ${Styles.LableColor} !important;
  font-weight: ${Styles.LableWeight};
  font-size: ${Styles.LableSize};
  text-transform: capitalize;
  letter-spacing: 0.01em;
  ${props => props.labelStyle || ''}
  ${props =>
        props.required &&
        `&::after {
      content: '';
      border-radius: 50%;
      height: 4px;
      width: 4px;
      position: absolute;
      top: 8px;
      margin-left:5px;
      padding-left:2px;
  }`}
  
  span {
    font-weight: 400;
  }
`
export default Label
