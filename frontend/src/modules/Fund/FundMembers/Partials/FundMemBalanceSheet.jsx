import { CustomStandardTable } from "@components/form/CustomStandardTable";
import React, { Fragment, useEffect } from "react";
import { useState } from "react";

const FundMemBalanceSheet = ({ balsheetRecord }) => {

const [dataSource,setDataSource] = useState([])

useEffect(()=>{
  setDataSource(balsheetRecord);
},[balsheetRecord])

  const TabPaidHistory = [
    {
        title: 'Sl No',
        render: (value, item, index) => index + 1,
    },
    {
        title: 'Date',
        dataIndex: 'reportdate',
    },
    {
        title: 'Particulars',
        dataIndex: 'type_choice'
    },
    {
        title: 'Credit',
        dataIndex: 'credit_amt'
    },
    {
        title: 'Debit',
        dataIndex: 'debit_amt'
    },
    {
        title: 'Balance',
        dataIndex: 'balance_amt'
    },

]
  return (
    <Fragment>
     <CustomStandardTable columns={TabPaidHistory} data={dataSource} />
    </Fragment>
  );
};

export default FundMemBalanceSheet;
