import React from 'react'
import { Col, notification, Row } from 'antd'
import { MiniPopUpPara, MiniPopUpWrapper } from '@components/common/Styled'
// import { Link } from 'react-router-dom'              >>>  FUTURE USE

const OpenNotification = props => {

  const ShowNotification = props => {
    return (
      <MiniPopUpWrapper>
        <Row gutter={[12, 12]}>
          <Col span={18}>
            <MiniPopUpPara>
              {props.msg}
            </MiniPopUpPara>
          </Col>
        </Row>
      </MiniPopUpWrapper>
    )
  }

  notification.open({
    description: ShowNotification(props),
    duration: 2,
    type:props.type,
    placement: 'topRight',
    onClick: () => {
      console.log('Notification Clicked!')
    },
  })
}

export default OpenNotification

// Usage  

// const sendingItem = {
//     item: item,
//     info: add,
//     infoEnd: end,
//   }
//   OpenNotification(sendingItem)