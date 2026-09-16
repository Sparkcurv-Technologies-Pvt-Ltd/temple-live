import { Button, Card } from "antd"
import styled from "styled-components"

export const StyledAdd = styled(Button)`
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

export const StyledRemoveBtn = styled.div`
display: flex;
text-align:center;
justify-content:center;
cursor:pointer;
background: none;

&:hover {
    
    transform: scale(1.1); /* Zoom in effect */
  
}

`;

export const StyledProfilePic = styled.div`
    
    width: 78px;
    height: 72px;
    border-radius: 5px;
    border: 1px dashed #A4A4A4;
    background: #FFF;

`
