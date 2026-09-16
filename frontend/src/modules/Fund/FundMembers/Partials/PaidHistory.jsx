import { CustomTable } from "@components/form";
import React, { Fragment, useEffect } from "react";
import { useState } from "react";

const PaidHistory = ({ paidHistory }) => {
  const [dataSource, setDataSource] = useState([]);
  useEffect(() => {
    setDataSource(paidHistory);
  }, [paidHistory]);

  const TableColumn = [
    {
      title: 'Sl No',
      render: (value, item, index) => index + 1,
  },
  {
      title: 'Date',
      dataIndex: 'pay_date'
  },
  {
      title: 'Particulars',
      dataIndex: 'collection_category'
  },
  {
      title: 'Transaction Type',
      dataIndex: 'transaction_type'
  },
  {
      title: 'Amount',
      dataIndex: 'amount'
  },
  ];
  return (
    <Fragment>
      <CustomTable columns={TableColumn} data={dataSource} />
    </Fragment>
  );
};

export default PaidHistory;
