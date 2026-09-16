import React, { Fragment, useState } from 'react'
import { CustomSwitch } from '@components/form'
import { AdminTable } from './Partials/AdminTable'
import UsersList from '../Users/Partials/UsersList'

export const UsersTable = () => {

    const [selected, setSelected] = useState('')

    const handleSelect = (values) => {
        setSelected(values)
    }
    return (
        <Fragment>
            <div style={{ margin: '30px 0' }}>
                <CustomSwitch leftLabel={'User'} rightLabel={'Admin'} onChange={handleSelect} />
            </div>

            {selected === true ?
                <>
                    <AdminTable />

                </> :
                <>
                    <UsersList />
                </>
            }

        </Fragment>
    )
}
