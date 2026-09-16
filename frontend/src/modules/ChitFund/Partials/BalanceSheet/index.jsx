import React, { Fragment } from 'react'
import { SheetPage } from './Partials/SheetPage'
import { CustomCardView } from '@components/others'

const ChitFundBalanceSheet = () => {
    return (
        <Fragment>
            <CustomCardView>
                <SheetPage />
            </CustomCardView>
        </Fragment>
    )
}

export default ChitFundBalanceSheet