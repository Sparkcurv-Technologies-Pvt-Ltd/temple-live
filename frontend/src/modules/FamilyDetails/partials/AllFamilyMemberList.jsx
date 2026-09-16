import React from 'react'
import MemberList from './MemberList'
import { CustomTabs } from '@components/form/CustomTabs'

const AllFamilyMemberList = () => {
    const TabOptions = [
        {
            key: "1",
            label: "All Member List",
            children: <MemberList />
        },
        {
            key: "2",
            label: "All Member List",
            children: <MemberList />
        },
    ]
  return (
    <CustomTabs tabs={TabOptions} />
  )
}

export default AllFamilyMemberList