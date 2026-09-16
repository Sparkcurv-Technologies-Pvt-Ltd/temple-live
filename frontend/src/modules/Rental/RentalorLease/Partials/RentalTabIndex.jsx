import { CustomTabs } from "@components/form/CustomTabs";
import { CustomCardView, CustomRow } from "@components/others";
import MovableMainPage from "@modules/Rental/MovableRental/Partials/MovableMainPage";
import { Col } from "antd";
import React from "react";
import RentalorLease from "./RentalorLease";

export const RentalTabIndex = () => {
  const TabOptions = [
    {
      key: "1",
      label: "Rental / Lease",
      children: <RentalorLease />,
    },
    {
      key: "2",
      label: "Movable Rental",
      children: <MovableMainPage />,
    },
  ];

  return (
    <div>
      <CustomCardView>
        <CustomRow>
          <Col span={24} md={24}>
            <CustomTabs tabs={TabOptions} />
          </Col>
        </CustomRow>
      </CustomCardView>
    </div>
  );
};
