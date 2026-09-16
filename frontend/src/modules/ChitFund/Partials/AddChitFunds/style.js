import { Card } from "antd"
import styled from "styled-components"

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
export const StyledRemoveBtn = styled.div`
display: flex;
text-align:center;
justify-content:center;
cursor:pointer;
background: none;

&:hover {
    transform: scale(1.1); 
}
`;

export const StyledProfilePic = styled.div`
    
    width: 78px;
    height: 72px;
    border-radius: 5px;
    border: 1px dashed #A4A4A4;
    background: #FFF;
`
    ;

export const BondContainer = styled.div`
    padding: 20px;
    background-color: #fff;
    .Container{
        padding: 20px;
        border: 1px double #777;
        border-width: 5px;
        border-style: double;
          
        .top_Heading {
          font-size: 18px;
          text-align: center;
          font-weight: 700;
          text-decoration: underline;
          margin: 20px 0px;
        }
        .templeAddress{
            text-align: center;
            & h1{ font-size:14px; text-decoration: underline; }
            & h2{ font-size:11px;
                margin-top:-10px;
             }
        }

        .investor_details {
            margin: 40px 0;
            & h4 {
                font-size: 14px;
                font-weight: 500;
                margin-bottom:5px
            }
            
        }
        .header{
            display: flex;
            justify-content:space-between;
            .left-image{
                & img{
                    width:100px;
                    height: 130px;
                }
            }
            .right-image{
                & img{
                    width:100px;
                    height: 130px;
                }
            }
            @media screen and (max-width:767px){
                flex-direction:column;

                .left-image{
                & img{
                    margin: auto;
                    display: flex;
                    justify-content:center;
                 }
                
               }

               .right-image{
                & img{
                    margin: auto;
                    display: flex;
                    justify-content:center;
                 }
                
               }
                
            }
        }
            
    }
    @media screen and (max-width:767px){
        padding:0;
    }

     .print-span-24 {
    width: 100%;
  }
`
export const PrintHolder = styled.div`
    padding: 10px;
    @media print{     
        /* display: block; */
        page-break-before: always;
      /* margin: auto; */
      /* margin: 50px; */
      /* width:100%; */
      margin:auto;
      .header {
        padding : 20px 0 20px 0;
        margin-bottom:20px;
        overflow :auto;
        }
    .Container{
       bottom:0;
       width:100%;
    }

        .footer{
          /* position: fixed;  */
    bottom: 0;
    /* left: 0; */
    /* right: 0;  */
    /* display: block; */
    /* padding: 10px 0; */
    /* border-top: 2px solid #0095c8; */
    /* text-align: center; */
           /* width:100%; */
    }
    }
    



`

