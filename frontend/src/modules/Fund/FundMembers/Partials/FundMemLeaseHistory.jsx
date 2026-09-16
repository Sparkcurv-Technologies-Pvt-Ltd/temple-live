import { TableStyle } from "@components/others/Style";
import React, { Fragment, useEffect } from "react";
import { useState } from "react";


const FundMemLeaseHistory = ({ historyDetails }) => {

  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    setDataSource(historyDetails);
  }, [historyDetails]);

  return (
    <Fragment>
      <TableStyle>
        <table>
          <thead>
            <tr>
              <th>Lease Date</th>
              <th>Particulars</th>
              <th>Fund Amount</th>
              <th>Fund Lease Amt</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{historyDetails?.lease_date}</td>
              <td>{historyDetails?.fund_name}</td>
              <td>{historyDetails?.fund_amount}</td>
              <td>{historyDetails?.fund_lease_amount}</td>
            </tr>
          </tbody>
        </table>
      </TableStyle>
    </Fragment>
  );
};

export default FundMemLeaseHistory;
