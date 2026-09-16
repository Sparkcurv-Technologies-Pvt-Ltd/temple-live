import React, { useState, useEffect } from "react";
import { Layout, Tabs } from "antd";
import styled from "styled-components";
import { CustomCardView } from "@components/others";
import { ViewFestivalReports } from "./FestivalReports/Partials/ViewFestivalReports";
import { ViewDeathReports } from "./Death/Partials/ViewDeathReports";
import { ViewSubscriptionTariffReports } from "./SubscriptionTariff/Partials/ViewSubsTariffReports";
import { ViewMarriageReports } from "./MarriageReports/Partials/ViewMarriageReports";
import ViewCollectionReports from "./CollectionReports/Partials/ViewCollectionReports";
import { ViewBankStatementReports } from "./BankStatementReports/Partials/ViewBankStatementReports";
import { ViewCashTransferReports } from "./CashTransferReports/Partials/ViewCashTransReports";
import ViewMemberBalanceReports from "./MemberBalanceReports/Partials/ViewMemberBalanceReports";
import { ViewChitInterestReports } from "./ChitInterestReports/Partials/ViewChitInterestReports";


const { Content } = Layout;
const { TabPane } = Tabs;

export const AllReports = () => {
  const [tabPosition, setTabPosition] = useState("top");
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setTabPosition("top");
      } else {
        setTabPosition("left");
      }
    };

    // Initial check when the component mounts
    handleResize();

    // Listen for window resize events
    window.addEventListener("resize", handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const TabHeader = styled(Tabs)`
    :where(.css-dev-only-do-not-override-190m0jy).ant-tabs
      > .ant-tabs-nav
      .ant-tabs-nav-list,
    :where(.css-dev-only-do-not-override-190m0jy).ant-tabs
      > div
      > .ant-tabs-nav
      .ant-tabs-nav-list {
      position: relative;
      display: flex;
      transition: opacity 0.3s;
      margin-top: 56px;
    }
  `;

  return (
    <Layout>
      <Content style={{ margin: "24px 16px", padding: 0 }}>
        <CustomCardView>
          <TabHeader
            tabPosition={tabPosition}
            activeKey={activeTab}
            onChange={handleTabChange}
          >
            <TabPane tab="Festival " key="1">
              <ViewFestivalReports />
            </TabPane>
            <TabPane tab="Death Tariff " key="2">
              <ViewDeathReports/>
            </TabPane>
            <TabPane tab="Marriage" key="3">
              <ViewMarriageReports/>
            </TabPane>
            <TabPane tab="Subscription Tariff " key="4">
              <ViewSubscriptionTariffReports/>
            </TabPane>
            <TabPane tab="Collection" key="5">
              <ViewCollectionReports/>
            </TabPane>
            <TabPane tab="Bank Statement" key="6">
              <ViewBankStatementReports/>
            </TabPane>
            <TabPane tab="Cash Transfer" key="7">
              <ViewCashTransferReports/>
            </TabPane>
            <TabPane tab="Member Balance Details" key="8">
              <ViewMemberBalanceReports/>
            </TabPane>
            <TabPane tab="Interest" key="9">
              <ViewChitInterestReports/>
            </TabPane>
          </TabHeader>
        </CustomCardView>
      </Content>
    </Layout>
  );
};
