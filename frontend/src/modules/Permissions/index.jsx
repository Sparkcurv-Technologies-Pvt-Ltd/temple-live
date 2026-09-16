import React, { Fragment, useState } from 'react'
import { CustomSwitch } from '@components/form'
import AddAdmin from './Admin/Partials/AddAdmin'
import AddUsers from './Users/Partials/AddUsers'

export const CreateUsers = () => {

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
                    <AddAdmin />
                </> :
                <>
                    <AddUsers />
                </>
            }

        </Fragment>
    )
}
