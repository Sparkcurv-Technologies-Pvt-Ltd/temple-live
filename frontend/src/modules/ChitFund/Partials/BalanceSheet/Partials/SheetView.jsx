import { CustomStandardTable } from "@components/form/CustomStandardTable"
import { Fragment, useState } from "react"
import { MdKeyboardArrowRight, MdOutlineKeyboardArrowDown } from 'react-icons/md'

export const ChitfundInvesView = ({ datas }) => {
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
    ]
    return (
        <Fragment>
            {datas?.map((item, index) => (
                <div key={index}>
                    <h4 style={{color:'#990000'}}>{item?.chitfund_name}</h4>
                    <CustomStandardTable columns={ColumnTable} data={item?.details} pagination={false} />
                </div>
            ))}
        </Fragment>
    )
}

export const ChitfundInterestGivenView = ({ datas }) => {

    const ValuesData = datas?.Chit_fund_Interest_Given?.details || []

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Person Name',
            dataIndex: 'person_name',
            render: (val) => val || '-',
        },
        {
            title: 'Chit Name',
            dataIndex: 'chit_name',
            render: (val) => val || '-',
        },
        {
            title: 'Principal Amount',
            dataIndex: 'amount',
        },
    ]

    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={ValuesData} pagination={false} />
        </div>
    )
}

export const CFProfitDistributionView = ({ datas }) => {

    const ValuesData = datas?.Chit_fund_Profit_Distribution?.details || []

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
    ]

    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={ValuesData} pagination={false} />
        </div>
    )
}

// Feb 2026 owner rule: line-item breakdown for the "Chit Fund Expense"
// entry on the Debit column of the Chit-Fund Balance Sheet. Uses the
// same column layout as Interest Given / Profit Distribution so the
// section reads consistently. Backend payload (dic1['Chit_Fund_Expense'])
// already includes `chit_fund_name`, `expense_name`, and `amount` for
// each row.
export const ChitFundExpenseView = ({ datas }) => {

    const ValuesData = datas?.Chit_Fund_Expense?.details || []

    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Chit Fund',
            dataIndex: 'chit_fund_name',
            render: (val) => val || '-',
        },
        {
            title: 'Expense Name',
            dataIndex: 'expense_name'
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
    ]

    return (
        <div>
            <CustomStandardTable columns={ColumnTable} data={ValuesData} pagination={false} />
        </div>
    )
}

// Feb 2026: "From Collection" lists a total per chit fund, but each
// chit fund's total is made up of many individual person-level
// collections (backend now sends these as `member_details` on each
// row — see balancesheet_chitfundview). This mirrors the same
// per-row click-to-expand pattern used for "Chit Fund Investment"
// in SheetPage.jsx, but keeps the expand state local to this
// component since the parent doesn't need to know about it.
export const FromCollectionView = ({ datas }) => {

    const ValuesData = datas?.From_Collection?.details || []
    const [expandedRows, setExpandedRows] = useState([])

    const toggleRow = (name) => {
        setExpandedRows(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        )
    }

    const MemberColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Person Name',
            dataIndex: 'person_name',
            render: (val) => val || '-',
        },
        {
            title: 'Amount',
            dataIndex: 'amount'
        },
    ]

    return (
        <div>
            {ValuesData.map((item, index) => {
                const isOpen = expandedRows.includes(item?.name)
                const hasMembers = (item?.member_details?.length || 0) > 0
                return (
                    <div key={index} style={{ marginBottom: '10px' }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: hasMembers ? 'pointer' : 'default',
                                padding: '6px 0',
                            }}
                            onClick={() => hasMembers && toggleRow(item?.name)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700 }}>{index + 1}.&nbsp;</span>
                                <span style={{ fontWeight: 700 }}>{item?.name}</span>
                                {hasMembers ? (
                                    isOpen
                                        ? <MdOutlineKeyboardArrowDown fontSize={20} />
                                        : <MdKeyboardArrowRight fontSize={20} />
                                ) : null}
                            </div>
                            <div style={{ fontWeight: 700 }}>{item?.amount}</div>
                        </div>
                        {isOpen && hasMembers ? (
                            <CustomStandardTable
                                columns={MemberColumnTable}
                                data={item?.member_details || []}
                                pagination={false}
                            />
                        ) : null}
                    </div>
                )
            })}
        </div>
    )
}