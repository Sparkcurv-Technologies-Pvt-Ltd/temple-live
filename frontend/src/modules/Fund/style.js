import { Card } from "antd";
import styled from "styled-components";

export const StyledTabCard = styled(Card)`

box-shadow: 2.634px 2.634px 13.169px 0px rgba(155, 0, 0, 0.15);
border-radius: 6.585px;
margin-top: 20px;

`
export const StyledAdd = styled(Card)`
width: 100px;
height: 50px;
display: flex;
justify-content: center;
align-items: center;
box-shadow: 5px 5px 20px 0px rgba(97, 0, 0, 0.20);
margin-top: 20px;

& h3{
    color: #9B0000;
}

`
export const StyledHeading = styled.div`
    
color: #FF0000;
font-weight: 500;
line-height: normal;

`
export const StyledTabSelected = styled(Card)`

background-color : 'red'

`

