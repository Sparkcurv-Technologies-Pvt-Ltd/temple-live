import React from 'react'
import { Tooltip } from 'antd'

export const CustomTableIconHolder = ({icon,title,onClick}) => {
  return (
    <Tooltip placement="top" title={title}>
        <img onClick={onClick} src={icon} alt={title} style={{height:'fit-content'}}/>
    </Tooltip>
  )
}
