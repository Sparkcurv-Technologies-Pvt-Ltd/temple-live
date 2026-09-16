import { CustomTabs } from '@components/form/CustomTabs'
import { CustomCardView, CustomRow } from '@components/others'
import { Col } from 'antd'
import React, { Fragment, useState } from 'react'
import { AssetDetails } from './Partials/AssetDetails'
import { AddMovableAssest } from './MoveableAssest/Partials/AddMovableAssest'

export const AssestIndex = () => {

    const [trigger, setTrigger] = useState(0)


    const TabOptions = [
        {
            key: "1",
            label: "Add Assest",
            children: <AssetDetails />
        },
        {
            key: "2",
            label: "Movable Assest",
            children: <AddMovableAssest />
        },

    ]



    return (
        <Fragment>
            <CustomCardView>
                <CustomRow >
                    <Col span={24} md={24}>
                        <CustomTabs tabs={TabOptions} />
                    </Col>
                </CustomRow>
            </CustomCardView>
        </Fragment>
    )
}

