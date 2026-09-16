import React from 'react'
import { Tabs } from 'antd'
import styled from 'styled-components';
import { THEME } from '@theme/index';

const StyledTabs = styled(Tabs)`
    width: 100%;
  .ant-tabs-tab {
    color: #000 ;
    &:hover {
      color: ${THEME.primary}; 
    }
  }
  &.ant-tabs .ant-tabs-ink-bar {
  background-color: ${THEME.white};
  }
  &.ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color:  ${THEME.primary};
  }
  /* border: 2px solid green; */
  .ant-tabs-nav .ant-tabs-nav-wrap{
    /* justify-content: center; */
    /* padding: 10px 0px; */
  }
`;
export const CustomTabs = ({ tabs, defaultActiveKey, activeKey, onChange }) => {

  const { TabPane } = Tabs;

  const handleChange = (e) => {
    if(onChange){
    onChange(e);
    }
  }

  return (
    <StyledTabs activeKey={activeKey} defaultActiveKey={defaultActiveKey} onChange={handleChange} items={tabs}>
      {/* {tabs.map((tab, index) => (
        <TabPane key={index + 1} tab={tab.label}>
          {tab.content}
        </TabPane>
      ))} */}
    </StyledTabs>
  )
}
