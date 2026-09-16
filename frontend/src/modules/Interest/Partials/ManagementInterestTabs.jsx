import React, { Fragment, useEffect, useState } from 'react'
import { CustomStandardTable } from '@components/form/CustomStandardTable'

export const InterestTabPaymentHistory = ({ManagementProfile}) => {

    const [dataSource, setDataSource] = useState([]);
console.log(dataSource,'dataSource');
    useEffect(() => {
        setDataSource(ManagementProfile || []);
    }, [ManagementProfile]);
    
    const TabPaymentHistory = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Date',
            dataIndex: 'transaction_date'
        },
        {
            title: 'Particulars',
            dataIndex: 'collection_category'
        },
        {
            title: 'Amount',
            render:(record)=> {return(parseFloat(record?.interst_amount)+parseFloat(record?.amount)) }
        },

    ]

    return (
        <Fragment>
            <CustomStandardTable columns={TabPaymentHistory} data={dataSource} />
        </Fragment>
    );
}

export const InterestTabSheet = ({ManagementProfile}) => {
    const [dataSource, setDataSource] = useState([]);

    useEffect(() => {
        setDataSource(ManagementProfile || []);
    }, [ManagementProfile])

    const TabSheet = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Date',
            dataIndex: 'reportdate',
            key: 'reportdate',
            render: (reportdate) => {
                const date = new Date(reportdate);
                return date.toLocaleDateString();
            },
        },
        {
            title: 'Type Choice',
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
            dataIndex: 'balance_amt',
            // Clamp any negative running balance to 0 for display only.
            // A negative value means the borrower over-paid vs. the ledger's
            // running total; per owner rule the customer-facing sheet must
            // never show negatives (same policy as the 1-Year PDF Balance
            // Sheet). Underlying `balance_amt` in the DB is untouched.
            render: (value) => {
                const n = Number(value ?? 0);
                if (!Number.isFinite(n) || n < 0) return '0.00';
                return n.toFixed(2);
            },
        },

    ]

    return (
        <Fragment>
            <CustomStandardTable columns={TabSheet} data={dataSource} />
        </Fragment>

    )
}