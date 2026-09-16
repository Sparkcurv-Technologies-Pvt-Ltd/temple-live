import { CustomStandardTable } from '@components/form/CustomStandardTable';
import React, { useState } from 'react'

export const FestivalMemberView = ({ record }) => {

    const CreditDetails = record?.Credit?.festival

    const memberDetails = CreditDetails?.map((ite) => ite.member_details).flat()
    const ColumnTable = [
        {
            title: 'Sl No',
            render: (value, item, index) => index + 1,
        },
        {
            title: 'member name',
            dataIndex: 'member_name'
        },
        {
            title: 'member No',
            dataIndex: 'member_no'
        },
        {
            title: 'member name',
            dataIndex: 'member_name'
        },
    ]

    return (
        <div>
            <CustomStandardTable columns={ColumnTable} />
        </div>
    )
}
