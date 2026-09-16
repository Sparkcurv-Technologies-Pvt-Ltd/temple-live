import { CustomStandardTable } from '@components/form/CustomStandardTable';
import { CustomRow, Flex } from '@components/others';
import { Col } from 'antd';
import React, { Fragment } from 'react'

export const FestivalMemberView = ({ festivalDataModal }) => {

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Name',
            dataIndex: 'name'
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount'
        },
        {
            title: 'Pay Type',
            dataIndex: 'payment_type'
        }
    ]

    const formatIndianNumber = (number) => {
        const strNumber = number?.toString();
        const length = strNumber?.length;
        if (length <= 3) {
            return strNumber;
        }
        const lastThreeDigits = strNumber?.substring(length - 3);
        const mainPart = strNumber?.substring(0, length - 3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
        return `${mainPart},${lastThreeDigits}`;
    };

    return (
        <Fragment>
            {festivalDataModal?.map((item, index) => (
                <div key={index}>
                      <h3 style={{ color: '#990000', fontSize: '15px' }}>{item?.name}</h3>
                    <CustomStandardTable columns={ColumnTable} data={item?.member_details} pagination={false} />
                    <CustomRow>
                        <Col span={15} md={15}><span style={{ color: '#df0606', fontSize: '15px', fontWeight: 600 }}>Bank : </span><span>{formatIndianNumber(item.bank_amount)}</span></Col>
                        <Col span={2} md={2}>-</Col>
                        <Col span={7} md={7}><Flex end={true} aligncenter={true}>
                            <span style={{ color: '#df0606', fontSize: '15px', fontWeight: 600 }}>Cash :&nbsp;</span><span>{formatIndianNumber(item.cash_amount)}</span></Flex></Col>
                    </CustomRow>
                </div>
            ))}

        </Fragment>
    )
}

export const BalanceFestivalMemberView = ({ record }) => {

    const CreditDetails = record?.balance?.festival

    const memberDetails = CreditDetails?.map((ite) => ite.member_details).flat() || 0

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Name',
            dataIndex: 'name'
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount'
        },
        {
            title: 'Pay Type',
            dataIndex: 'payment_type'
        }
    ]

    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={memberDetails} pagination={false} />
        </div>
    )
}

export const TariffMemberView = ({ tarifTabModal }) => {

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Name',
            dataIndex: 'name'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
        {
            title: 'Pay Type',
            dataIndex: 'payment_type'
        }
    ]

    const formatIndianNumber = (number) => {
        const strNumber = number?.toString();
        const length = strNumber?.length;
        if (length <= 3) {
            return strNumber;
        }
        const lastThreeDigits = strNumber?.substring(length - 3);
        const mainPart = strNumber?.substring(0, length - 3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
        return `${mainPart},${lastThreeDigits}`;
    };

    return (
        <Fragment>
            {tarifTabModal?.map((item, index) => (
                <div key={index}>
                      <h3 style={{ color: '#990000', fontSize: '15px' }}>{item?.name}</h3>
                    <CustomStandardTable columns={ColumnTable} data={item?.member_details} pagination={false} />
                    <CustomRow>
                        <Col span={15} md={15}><span style={{ color: '#df0606', fontSize: '15px', fontWeight: 600 }}>Bank : </span><span>{formatIndianNumber(item.bank_amount)}</span></Col>
                        <Col span={2} md={2}>-</Col>
                        <Col span={7} md={7}><Flex end={true} aligncenter={true}>
                            <span style={{ color: '#df0606', fontSize: '15px', fontWeight: 600 }}>Cash :&nbsp;</span><span>{formatIndianNumber(item.cash_amount)}</span></Flex></Col>
                    </CustomRow>
                </div>
            ))}
        </Fragment>
    )
}

export const BalanceTariffMemberView = ({ record }) => {

    const CreditDetails = record?.balance?.tariff
    const memberDetails = CreditDetails?.map((ite) => ite.member_details).flat() || 0

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Name',
            dataIndex: 'name'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
        {
            title: 'Pay Type',
            dataIndex: 'payment_type'
        }
    ]

    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={memberDetails} pagination={false} />
        </div>
    )
}

export const IncomeMemberView = ({ incomModal }) => {

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Income Name',
            dataIndex: 'name'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
        {
            title: 'Pay Type',
            dataIndex: 'payment_type'
        }
    ]

    return (
        <div>
            {incomModal?.map((item, index) => (
                <div key={index}>
                      <h3 style={{ color: '#990000', fontSize: '15px' }}>{item?.name}</h3>
                    <CustomStandardTable columns={ColumnTable} data={item?.details} pagination={false} />
                </div>
            ))}
        </div>
    )
}

export const DeathMemberView = ({ deathtabModal }) => {

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Member Name',
            dataIndex: 'name'
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount'
        },
        // {
        //     title: 'Mobile Number',
        //     dataIndex: 'mobile_number'
        // },
        {
            title: 'Pay Type',
            dataIndex: 'payment_type'
        }
    ]

    const formatIndianNumber = (number) => {
        const strNumber = number?.toString();
        const length = strNumber?.length;
        if (length <= 3) {
            return strNumber;
        }
        const lastThreeDigits = strNumber?.substring(length - 3);
        const mainPart = strNumber?.substring(0, length - 3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
        return `${mainPart},${lastThreeDigits}`;
    };

    return (
        <Fragment>
            {deathtabModal?.map((item, index) => (
                <div key={index}>
                     <h3 style={{ color: '#990000', fontSize: '15px' }}>{item?.name}</h3>
                    <CustomStandardTable columns={ColumnTable} data={item?.member_details} pagination={false} />
                    <CustomRow>
                        <Col span={15} md={15}><span style={{ color: '#df0606', fontSize: '15px', fontWeight: 600 }}>Bank : </span><span>{formatIndianNumber(item.bank_amount)}</span></Col>
                        <Col span={2} md={2}>-</Col>
                        <Col span={7} md={7}><Flex end={true} aligncenter={true}>
                            <span style={{ color: '#df0606', fontSize: '15px', fontWeight: 600 }}>Cash :&nbsp;</span><span>{formatIndianNumber(item.cash_amount)}</span></Flex></Col>
                    </CustomRow>
                </div>
            ))}

        </Fragment>
    )
}

export const BalancePaymentMemberView = ({ record }) => {

    const CreditDetails = record?.balance?.member_details || []
    // const memberDetails = CreditDetails?.map((ite) => ite.member_details).flat() || 0
    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Name',
            dataIndex: 'member_name'
        },
        {
            title: 'Amt',
            dataIndex: 'amount'
        },
        {
            title: 'No',
            dataIndex: 'member_no'
        },
        {
            title: 'Phn.No',
            dataIndex: 'mobile_number'
        }
    ]

    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={CreditDetails} pagination={false} />
        </div>
    )
}

export const MarriageMemberView = ({ record }) => {

    const CreditDetails = record?.Credit?.marriage?.marriage_details || []

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Member Name',
            dataIndex: 'name'
        },
        {
            title: 'Total Amt',
            dataIndex: 'total_amount'
        },
        {
            title: 'Pay Type',
            dataIndex: 'payment_type'
        }
    ]

    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={CreditDetails} pagination={false} />
        </div>
    )
}

export const MemberJoiningView = ({ record }) => {

    const CreditDetails = record?.Credit?.member_joining?.member_joining_details || []
    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Name',
            dataIndex: 'name'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
        {
            title: 'Pay Type',
            dataIndex: 'payment_type'
        }
    ]

    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={CreditDetails} pagination={false} />
        </div>
    )
}

export const RentLeaseMemberView = ({ record }) => {

    const CreditDetails = record?.Credit?.other_incomes?.rent_details || []

    // const memberDetails = CreditDetails?.map((ite) => ite.member_details).flat() || 0

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Rent No',
            dataIndex: 'rent_no'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
        {
            title: 'Pay Type',
            dataIndex: 'payment_type'
        }
    ]

    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={CreditDetails} pagination={false} />
        </div>
    )
}

export const ExpenseMemberView = ({ expensedataModal }) => {

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Expense Name',
            dataIndex: 'name'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
        {
            title: 'Pay Type',
            dataIndex: 'payment_type'
        }
    ]

    return (
        <div>
            {expensedataModal?.map((item, index) => (
                <div key={index}>
                    <h3 style={{ color: '#990000', fontSize: '15px' }}>{item?.name}</h3>
                    <CustomStandardTable columns={ColumnTable} data={item?.details} pagination={false} />
                </div>
            ))}
            {/* <CustomStandardTable columns={ColumnTable} data={expensedataModal} pagination={false} /> */}
        </div>
    )
}

export const OtherExpenseMemberView = ({ record }) => {

    const CreditDetails = record?.Debit?.other_expense?.rent_details || []

    // const memberDetails = CreditDetails?.map((ite) => ite.member_details).flat() || 0

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Rent No',
            dataIndex: 'rent_no'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
        {
            title: 'Pay Type',
            dataIndex: 'payment_type'
        }
    ]

    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={CreditDetails} pagination={false} />
        </div>
    )
}

export const BankLoanView = ({ bankloannModal }) => {

    const tabledetails = bankloannModal?.Credit?.loan_income?.bank_details

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Bank Name',
            dataIndex: 'bank_name'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
    ]
    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={tabledetails} pagination={false} />
        </div>
    )

}

export const BankrepayLoanView = ({ bankloannModal }) => {

    const tabledetails = bankloannModal?.Debit?.loan_repayment?.bank_details

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Bank Name',
            dataIndex: 'bank_name'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
    ]
    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={tabledetails} pagination={false} />
        </div>
    )

}

export const ChitfundTabView = ({ chitfundModals }) => {

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Fund Name',
            dataIndex: 'name'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
    ]

    return (
        <Fragment>
            {chitfundModals?.map((item, index) => (
                <div key={index}>
                    <h3 style={{ color: '#990000', fontSize: '15px' }}>{item?.chitfund_name}</h3>
                    <CustomStandardTable columns={ColumnTable} data={item?.details} pagination={false} />
                </div>
            ))}
        </Fragment>
    )
}

export const InterestPrincipalView = ({ InterPrincipalModal }) => {

    const tabledetails = InterPrincipalModal?.Debit?.Interest_Principal_amount?.details

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Interest Name',
            dataIndex: 'interest_name'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
    ]
    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={tabledetails} pagination={false} />
        </div>
    )

}

export const BorrowIncmView = ({ borrowIncomesDetails }) => {

    const tabledetails = borrowIncomesDetails?.Credit?.borrow_income?.member_details

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Member Name',
            dataIndex: 'member_name'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
        {
            title: 'Pay Type',
            dataIndex: 'payment_type'
        },
    ]
    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={tabledetails} pagination={false} />
        </div>
    )

}

export const ChitfundProfitView = ({ chitfundProfitdetails }) => {

    const tabledetails = chitfundProfitdetails?.Credit?.Chit_fund_Profit?.details

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Member Name',
            dataIndex: 'name'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
    ]

    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={tabledetails} pagination={false} />
        </div>
    )

}
export const InterestCollectionView = ({ interestcollectionDetails }) => {

    const tabledetails = interestcollectionDetails?.Credit?.Interest_Collection?.details

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Int No',
            dataIndex: 'interest_name'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
    ]

    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={tabledetails} pagination={false} />
        </div>
    )

}

export const BorrowPaidView = ({ datas }) => {

    const tabledetails = datas?.borrowpaid_amount?.member_details

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Name',
            dataIndex: 'member_name'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
        {
            title: 'Pay Type',
            dataIndex: 'payment_type'
        },

    ]
    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={tabledetails} pagination={false} />
        </div>
    )

}



