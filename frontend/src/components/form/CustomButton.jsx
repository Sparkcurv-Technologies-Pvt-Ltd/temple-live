import React from 'react'
import { Button as AntdButton } from 'antd'
import styled, { css } from 'styled-components'
import { THEME } from '@theme/index'
import Flex from '@components/others/Flex'
import { Styles } from '@components/form/CommonProperties'

const BorderStyle = css`
  &:hover {
    border-color: ${THEME.GREY_T_85};
  }
  &:focus {
    border-color: ${THEME.GREY_T_85};
  }
`
const TextContainer = styled.div`
    /* margin-left: ${props => (props.icon ? '7px' : '')}; */
    display: flex;
`

const primarynowButtonStyles = css`
  color:${THEME.white};
  background-color:${THEME.BTN_PRIMART};
  font-size: 16px;
  font-weight:500;
  transition:.4s;

  &:hover {
  background-color:${THEME.BTN_PRIMART_HOVER};
  }
  &:focus {
    /* box-shadow:0 0 0 .2rem (255, 179, 2,.5) */
  }
  &.svg {
    font-size: 20px !important;
  }
`

const secondarynowButtonStyles = css`
  color:${THEME.white};
  background-color:${THEME.BTN_SECONDARY};
  font-size: 16px;
  font-weight:500;
  transition:.4s;
  &:hover {
  background-color:${THEME.BTN_SECONDARY_HOVER};
  }
  &:focus {
    /* box-shadow:0 0 0 .2rem (255, 179, 2,.5) */
  }
  &.svg {
    font-size: 20px !important;
  }
`
const dangerButtonStyles = css`
  color:#fff;
  color:${THEME.danger_2};
  background-color: ${THEME.primary};
  border-color:${THEME.danger_2};
  /* box-shadow: 4px 4px 20px 0px rgba(110, 110, 107, 0.25); */
  box-shadow: 6px 6px 20px 0px rgba(97, 0, 0, 0.25);
  &:hover {
    color:#990000;
    background-color: ${THEME.danger_2};
    border-color: ${THEME.primary};
  }
  &:focus {
    box-shadow:0 0 0 .2rem rgba(220,53,69,.5)
  }
`
const secondaryButtonStyles = css`
  background-color: ${THEME.white};
  color: ${THEME.GREY_PALE};
  box-shadow: 4px 4px 20px 0px rgba(110, 110, 110, 0.25);
  border-color:${THEME.GREY_PALE};
  font-size: 12px;
  height: 40px !important;
  border-radius: 8px !important;

  &:hover {
    background-color: ${THEME.GREY_PALE};
    border-color: ${THEME.white};
    color: ${THEME.white};
  }
  /* &:focus {
    background-color: ${THEME.secondary};
    border-color: ${THEME.primary};
  } */
  & svg{
    height: 18px !important ;
    width: 18px !important
  }

`

const primaryButtonStyles = css`
  color: ${THEME.GREEN_PALE} !important;
  background-color:${THEME.white};
  box-shadow: 4px 4px 20px 0px rgba(3, 134, 0, 0.25);
  border-color: ${THEME.GREEN_PALE};
  font-size: 12px;
  height: 40px !important;
  border-radius: 8px !important;
  &:hover {
    color:${THEME.white} !important;
    background-color: ${THEME.GREEN_PALE} !important;
  }
  &:focus {
    box-shadow:0;
  }
  & svg{
    height: 18px !important ;
    width: 18px !important
  }
`

const viewBtnStyle = css`
  color: ${props => props.fill ? THEME.white : THEME.primary} ;
  box-shadow: 4px 4px 20px 0px rgba(198, 0, 0, 0.20);
  border:2px solid ${THEME.primary};
`
const editBtnStyle = css`
   color: ${THEME.blue} ;
  box-shadow: 4px 4px 20px 0px rgba(0, 50, 229, 0.20);
  border:2px solid ${THEME.blue};
`
const deleteBtnStyle = css`
   color: ${THEME.red} ;
  box-shadow: 4px 4px 20px 0px rgba(198, 0, 0, 0.20);
  border:2px solid ${THEME.red};
`


const primaryOutlineButtonStyles = css`
  padding: 12px 15px !important;
  background-color:${props => props.fill ? props.fill : '#fff'};

  ${props => props.tabview === 'view' && viewBtnStyle};
  ${props => props.tabview === 'edit' && editBtnStyle};
  ${props => props.tabview === 'delete' && deleteBtnStyle};

  &:focus {
    box-shadow:0;
  }
`

const yellowButtonStyles = css`
  color:${THEME.white};
  background-color:${THEME.dark_gold};
  border-color:${THEME.dark_gold};
  box-shadow:${THEME.button_box_shadow};
  font-size:1rem;
  font-weight:600;
  transition:.4s;
  &:hover {
    transform:translateY(-5px);
    box-shadow:${THEME.buttonHover_box_shadow};
  }
  &:focus {
    box-shadow:0 0 0 .2rem (255, 179, 2,.5)
  }
`

const successButtonStyles = css`
  color:#990000;
  border-color:#990000;
  /* box-shadow: 4px 4px 20px 0px rgba(110, 110, 107, 0.25); */
  box-shadow: 6px 6px 20px 0px rgba(97, 0, 0, 0.25);
  &:hover {
    color:#fff;
    background-color: ${THEME.primary};
    border-color: ${THEME.primary};
  }
  &:focus {
    box-shadow:#990000
  }
`

const defaultButtonStyles = css`
  color: #30475e;
`

const PlainButton = styled(AntdButton)`
  color: ${props => (props.type === 'secondary' ? THEME.PRIMARY : '#FFFFFF')};
  border-width:1px;
  display: flex;
  height: ${Styles.BtnHeight};
  align-items: center;
  justify-content: space-between;
  border-radius: 5px;
  font-size:${Styles.BtnSize};
  letter-spacing:1px;
  justify-content: center;
  text-transform:capitalize;
  padding: 0px 15px !important;
  margin: 10px 15px 8px 0px !important;
  font-weight:${Styles.BtnWeight};
  cursor: ${props => props?.disableCursor && 'not-allowed'};
  pointer-events: ${props => (props?.disable ? 'none' : 'auto')};
  ${props => props.type === 'secondary' && secondaryButtonStyles};
  ${props => props.type === 'danger' && dangerButtonStyles};
  ${props => props.type === 'success' && successButtonStyles};
  ${props => props.type === 'default' && defaultButtonStyles};
  ${props => props.type === 'primary' && primaryButtonStyles};
  ${props => props.type === 'yellow' && yellowButtonStyles};
  ${props => props.type === 'primarynow' && primarynowButtonStyles};
  ${props => props.type === 'secondaryNow' && secondarynowButtonStyles};
  ${props => props.type === 'primaryoutline' && primaryOutlineButtonStyles};
  transition: 0.5s;
`
const CircleButton = styled(AntdButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${Styles.BtnHeight};
  padding: 0px 15px !important;
  color: #fff;
  ${BorderStyle}
`

const StyledIconButton = styled(AntdButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: red;
  color: #fff;

  ${BorderStyle}

`

const Button = props => <AntdButton {...props} />

const Primary = ({ text, icon, ...props }) => (
  <PlainButton {...props} type="primary">
    <Flex style={{ alignItems: "center",gap: icon ? '10px' : '' }} >
      {/* {
        props.left && icon
      } */}
      <TextContainer icon={icon ? "true" : "false"}>{text}</TextContainer>
      {/* {
        props.right && icon
      } */}
      {icon}
    </Flex>
  </PlainButton>
)

const PrimaryOutline = ({ text, icon, ...props }) => (
  <PlainButton {...props} type="primaryoutline">
    <Flex style={{ alignItems: "center" }} gap={'10px'}>
      {
        props.left && icon
      }
      <TextContainer icon={icon ? "true" : "false"}>{text}</TextContainer>
      {
        props.right && icon
      }
    </Flex>
  </PlainButton>
)


const PrimaryNow = ({ text, icon, ...props }) => (
  <PlainButton {...props} type="primarynow">
    <Flex style={{ alignItems: "center" }}>
      {icon}
      <TextContainer icon={icon ? "true" : "false"}>{text}</TextContainer>
    </Flex>
  </PlainButton>
)

const SecondaryNow = ({ text, icon, ...props }) => (
  <PlainButton {...props} type="secondaryNow">
    <Flex style={{ alignItems: "center" }}>
      {icon}
      <TextContainer icon={icon ? "true" : "false"}>{text}</TextContainer>
    </Flex>
  </PlainButton>
)

const Yellow = ({ text, icon, ...props }) => (
  <PlainButton {...props} type="yellow">
    <Flex style={{ alignItems: "center" }}>
      {icon}
      <TextContainer icon={icon ? "true" : "false"}>{text}</TextContainer>
    </Flex>
  </PlainButton>
)

const Secondary = ({ text, icon, ...props }) => (
  <PlainButton {...props} type="secondary">
    <Flex style={{ alignItems: "center",gap: icon ? '10px' : ''  }}>
      <TextContainer icon={icon ? "true" : "false"}>{text}</TextContainer>
      {icon}
    </Flex>
  </PlainButton>
)

const Success = ({ text, icon, ...props }) => (
  <PlainButton {...props} type="success">
    <Flex style={{ alignItems: "center" }}>
      {icon}
      <TextContainer icon={icon ? "true" : "false"}>{text}</TextContainer>
    </Flex>
  </PlainButton>
)

const Danger = ({ text, icon, ...props }) => (
  <PlainButton {...props} type="danger">
    <Flex style={{ alignItems: "center" }}>
      {icon}
      <TextContainer icon={icon ? "true" : "false"}>{text}</TextContainer>
    </Flex>
  </PlainButton>
)

const Default = ({ icon, text, onClick, ...rest }) => {
  return (
    <PlainButton onClick={onClick} {...rest} type="default">
      {icon}
      <TextContainer icon={icon ? "true" : "false"}>{text}</TextContainer>
    </PlainButton>
  )
}

const Round = ({ icon, text, onClick, ...rest }) => {
  return (
    <PlainButton type="round" onClick={onClick} {...rest}>
      {icon}
      <TextContainer>{text}</TextContainer>
    </PlainButton>
  )
}

const Circle = ({ icon, onClick, ...rest }) => {
  return (
    <CircleButton type="circle" onClick={onClick} {...rest}>
      {icon}
    </CircleButton>
  )
}

Button.Primary = Primary
Button.PrimaryOutline = PrimaryOutline
Button.Secondary = Secondary
Button.PrimaryNow = PrimaryNow
Button.SecondaryNow = SecondaryNow
Button.Success = Success
Button.Danger = Danger
Button.Default = Default
Button.Round = Round
Button.Circle = Circle
Button.Yellow = Yellow

export default Button
