import { CustomTabs } from '@components/form/CustomTabs'
import { CustomCardView } from '@components/others'
import React from 'react'
import { AssetCategoryList } from './Partials/AssetCategoryList'
import { MovableCategoryList } from './MoveableAssest/Partials/MovableCategoryList'

export const CategoryIndex = () => {

    const TabOptions = [
        {
            key: "1",
            label: "Asset Category",
            children: <AssetCategoryList />
        },
        {
            key: "2",
            label: "Movable Asset Category",
            children: <MovableCategoryList />
        },

    ]

    return (
        <CustomCardView>
            <CustomTabs tabs={TabOptions} />
        </CustomCardView>
    )
}
