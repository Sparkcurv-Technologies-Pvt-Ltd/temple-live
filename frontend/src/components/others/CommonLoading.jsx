import { Spin } from 'antd'
import React from 'react'
import styled from 'styled-components';

const TotalStyle = styled.div`
  .ant-spin-lg .ant-spin-dot i {
    width: 88px;
    height: 88px;
  }
  .ant-spin .ant-spin-dot-item{
    background-color: #990000;
  }
`

const CommonLoading = () => {
  return (
    <div style={{ margin: 'auto' }} >
      <TotalStyle style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin
          size="large"
          style={{ color: 'red', fontSize: '120px' }}
        />
      </TotalStyle>
    </div>
  )
}

export default CommonLoading
