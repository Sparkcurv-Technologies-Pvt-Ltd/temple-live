import { THEME } from "@theme/index";
import styled from "styled-components";

export const ViewLabel = styled.h3`
  color: ${THEME.GREEN_DARK};
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 1px;
`;

export const ViewLabelData = styled.h3`
  color: ${THEME.primary};
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
`;

export const TableIconHolder = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 5px;

  & svg {
    font-size: ${(props) => props.size || "15px"};
    color: ${(props) => props.color || "black"};
    cursor: pointer;
  }
`;
export const TableStyle = styled.div`
  padding: 0px 20px;
  overflow-x: auto !important;
  & table thead tr th {
    padding: 22px;
    font-weight: 800;
    font-size:14px;
    letter-spacing: 1px;
  }

  & table tbody tr td {
    font-size: 14px !important;
    padding: 5px;
  }

  @media print {
  }
  table {
    width: 100%;
    height: 200px;
    border-collapse: collapse;
    /* padding: 2px; */
    margin-bottom: 20px !important;
    border: 2px solid #656565;
  }

  th {
    border-bottom: 1px solid black;
    border: 2px solid #656565;
    color: #000;
  }

  td {
    text-align: center;
    border: 2px solid #656565;
  }
`;
