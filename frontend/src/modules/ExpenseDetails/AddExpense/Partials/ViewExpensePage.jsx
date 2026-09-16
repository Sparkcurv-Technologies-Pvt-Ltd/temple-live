import { CustomRow } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col } from 'antd'
import React from 'react'
import styled from 'styled-components'

const TotalStyle = styled.div`
.box {
    background-color: #edecec;
    margin-top: 20px;
    padding: 10px;
}
  & h4 {
    padding: 10px 20px;
    & span {
      margin-left: 5px;
      color: #838383;
    }
  }
`
const ViewExpensePage = ({ ViewRecord }) => {

    console.log(ViewRecord, 'ViewRecord');

    return (
        <TotalStyle>
            <CustomPageTitle Heading={'View Details'} />
            <div className='box'>
                <CustomRow >
                    <Col span={24} md={12}>

                        <h4>Subcategory: <span>{ViewRecord?.expense_subcategory}</span></h4>
                        <h4>Category Name: <span>{ViewRecord?.category_name}</span></h4>
                        {ViewRecord?.expense_subcategory === "Chit Fund Expense" && (
                          <h4>Chit Fund: <span>{ViewRecord?.chit_fund_name || "-"}</span></h4>
                        )}
                        <h4>Date: <span>{ViewRecord?.date}</span></h4>
                        <h4>Expense Name: <span>{ViewRecord?.expense_name}</span></h4>
                        <h4>Expense Amt: <span>{ViewRecord?.expense_amt}</span></h4>
                        {/* <h4>Expense From: <span>{ViewRecord?.expense_from}</span></h4> */}
                        {ViewRecord?.expense_from === "Festival" &&
                           <h4>Festival Name: <span>{ViewRecord?.festival_name}</span></h4>
                        }
                          {ViewRecord?.expense_from === "Others" &&
                           <h4>Others Name: <span>{ViewRecord?.others_name}</span></h4>
                        }

                    </Col>
                    <Col span={24} md={12}>
                    <h4>Payment Mode: <span>{ViewRecord?.payment_mode}</span></h4>
                        <hr style={{ width: '30%', margin: 'auto', color: 'red' }} />
                        <h4>Transaction Type: <span>{ViewRecord?.transaction_type}</span></h4>
                        {ViewRecord?.transaction_type === 'Bank' ?
                            <>
                                <h4>Bank name: <span>{ViewRecord?.bank_name}</span></h4>
                                <h4>Bank name: <span>{ViewRecord?.bank_pay}</span></h4>
                                <h4>Transaction No: <span>{ViewRecord?.transaction_no}</span></h4>
                                <h4>Transaction Date: <span>{ViewRecord?.transaction_date}</span></h4>
                            </>
                            : ViewRecord?.transaction_type === 'UPI' ?
                                <>
                                    <h4>UPI ID: <span>{ViewRecord?.upi_id}</span></h4>
                                    <h4>Transaction Date: <span>{ViewRecord?.transaction_date}</span></h4>
                                </> : ViewRecord?.transaction_type === 'Cheque' ?
                                    <>
                                        <h4>Cheque Number: <span>{ViewRecord?.transaction_no}</span></h4>
                                        <h4>Transaction Date: <span>{ViewRecord?.transaction_date}</span></h4>
                                    </>
                                    : null
                        }
                         <h4>Comments: <span>{ViewRecord?.comments}</span></h4>
                    </Col>
                </CustomRow>
            </div>
        </TotalStyle>
    )
}

export default ViewExpensePage