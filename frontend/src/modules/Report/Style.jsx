import { Card } from "antd";
import styled from "styled-components";

export const Filter = styled.div`
  display: flex;
  align-items: center;
  /* cursor: pointer; */
  padding: 10px;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 5px 0;

  & svg {
    font-size: 25px;
  }
`;

export const MoveSlider = styled.div`
  position: relative;
  background: ${(props) => (props.showdetailsons ? "#f8f8f8" : "white")};
  width: 100%;
  height: ${(props) => (props.showdetailsons ? "100%" : "0")};
  overflow: hidden;
  border-radius: 10px;
  border: white 1px;
  top: ${(props) => (props.showdetailsons ? "0" : "-100px")};
  transition: all 0.5s;
`;

export const HeadingStyle = styled.div`
  display:none;
  width:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  flex-direction:column;
  & h1{
      font-size:20px;
      text-align:center;
  }
  & h2{
      font-size:13px;
      text-align:center;
  } 
  & h3{
      margin: 20px 0px;
      font-size:18px;
      text-align:center;
  } 
  
`

export const StyledCard = styled.div`
  /* margin-top: 20px; */
  border-radius: 10px;
  /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); */
  border:2px solid grey;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
  /* align-items:center;
  justify-content:center; */

  @media screen and (min-width:462px){
    .TotalAlign{
        align-items:center;
    }
  }

  & h2 {
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }
  
  & p {
    font-size: 16px;
    color: #444;
  }
 
  .AmountStyle{
    text-align: end;
    font-size: 17px;
    & p{
        text-align: end;
    }
    .TotalAmtStyle{
        margin:10px 0px;
        font-size: 17px;
        font-weight: 600 !important;
        padding-top:10px;
        color:green !important;
        .lineplace {
          display: flex;
          justify-content: end;
          & hr{
            width: 40%; 
          }
        }
        
    }
    
    
  }
  .HeadingStyles{
    display: flex;
    justify-content:space-around;
    background:grey;
    padding:15px;
    justify-content:center;
    align-items:center;
    text-align: center;
  }
  & h3 {
    font-size:18px;
    font-weight:400;
  };
  & h4 {
    /* margin-bottom: 20px; */
    font-size: 20px;
    color:#fff;

  };
  .BorderAP {
    border: 1px solid #c2c1c1 !important;
  };
  .BorderRi {
    border-right: 2px solid #c2c1c1;
  };
  .BorderLe {
    border-left: 1px solid #c2c1c1;
  };
`;

export const SectionHeading = styled.h3`
  font-size: 25px;
  font-weight: bold;
  color: #555;
`;

export const PrintHolder = styled.div`
 
  @media print{   
    padding: 10px 15px;  
    margin: 50px;
    .TotalAmtStyle {
      border: 0px;
    }
   .PrintShowDatadd {
    display: block;
    page-break-before: always;
    /* border: 1px solid; */
    @page {
      margin-top: 10px; 
    };
    .lineplace {
      display: flex;
      justify-content: end;
      & hr{
        width: 40%; 
      }
    }

   };

   @media (orientation: portrait) {
      .MobileLablestyle {
        visibility: hidden !important;
        display: none !important;
      }
      
      .DeskLabelStyle {
        visibility: visible !important;
        .TotalLabelStyle{
         padding: 0px 20px !important;
        }
      }
    };

    @media (orientation: landscape) {
      .MobileLablestyle {
        visibility: visible !important;
      }
      
      .DeskLabelStyle {
        display: none !important;
      }
    };

  width:100%;
  margin:auto;
  }

  .TotalLabelStyle{
    & h2{
        font-weight:700;
        font-size:20px;
        color:blue;
      }
  }
  
  .TotalAmtStyle{

    font-size: 15px;
    font-weight: 600 !important;
    padding-top:10px;
    color:green !important;
    display:flex;
    justify-content: space-between;
    border-top: 1px solid #c2c1c1 !important;
    border-bottom: 1px solid #c2c1c1 !important;
    /* .BorderRi { */
    border: 2px solid #c2c1c1;
  /* }; */
    .lineplace {
      display: flex;
      justify-content: end;
      & hr{
        width: 40%; 
      }
    }
  }

  .DeskLabelStyle {
    visibility: hidden;
  }

  .MobileLablestyle {
    visibility: visible;
    .TotalLabelStyle{
      padding: 0px 20px;
    }
  }

  @media screen and (max-width: 767px) {
    
    .DeskLabelStyle {
      visibility: visible;
      .TotalLabelStyle{
       padding: 0px 20px !important;
      }
    }
    .MobileLablestyle {
      visibility: hidden;
      display: none;
    }
  };
  
`
  ;
export const PrintShowData = styled.div`
  display: none;
 
`
  ;
export const CreditStyle = styled.div`
  padding:10px 20px;
  line-height:30px;
.AmtLabel{
  display:flex;
  justify-content: space-between;
}
.Rolename {
  font-weight: 700;
  text-transform: capitalize;

  & span {
 color: #850404 !important;
  }
}
.footerAmtStyle{
  margin:50px 0px;
  .footerAmt{
    display: flex;
    justify-content: end;
    & h2{
      font-size:18px;
      font-weight:500px;
    }
    & h1{
      color:green; font-size:18px;
    }
  }
}
  /* @media screen and (max-width:546px){
    .AmtLabel{

      flex-direction:column;
    }
  } */

`
  ;

  export const CardStyle = styled.div`
  .Headerdetail{
    margin: 40px 0;
            & h4 {
                font-size: 14px;
                font-weight: 500;
                margin-bottom:5px
                color:#545454 !important;
            }
  }
  `;