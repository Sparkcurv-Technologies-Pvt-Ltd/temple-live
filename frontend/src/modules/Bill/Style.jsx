import styled from "styled-components"


export const PrintHolder = styled.div`
    padding: 10px 13px 0px 13px;
    @media print{     
        width:100%;
        margin:auto;
    }

    .container{
        /* max-width:400px; */
        display:flex;
        align-items:center;
        justify-content:center;
        gap:10px;
        flex-direction:column;

        .address{
            width:100%;
            display:flex;
            align-items:center;
            justify-content:center;
            gap:8px;
            flex-direction:column;
            & h1{
                font-size:8px;
                text-align:center;
            }
            & h2{
                font-size:6px;
                text-align:center;
            }
            & h3{
                font-size:7px;
                text-align:center;
            }
        }
        .bill_details{
            width:100%;
            display:flex;
            align-items:flex-start;
            justify-content:space-between;
            gap:5px;
            padding:2px 0px;
            line-height:13px;
            margin-bottom: -11px;
            .holder{
                flex:0.5;
           & h4{
                font-size:8px;
            }
            }
           
        }
        .down_holder{
            width:100%;
            line-height:13px;
               & h4{
                font-size:8px;
            } 
            }
        .table_holder{
            width:100%;
            table{
                width:100%;
                border-collapse:collapse;
                border-bottom:1px dashed black;

                thead{
                    border-top:1px dashed black;
                    border-bottom:1px dashed black;
                    padding:3px 0;
                }
                thead tr th,
                tbody tr td{
                    padding:3px 0;
                    text-align:center;
                    font-size:8px;
                }
            }
        }
        .amount_holder{
            width:100%;
            text-align:right;
            h2{
                font-size:8px;
            }
        }
    }
`