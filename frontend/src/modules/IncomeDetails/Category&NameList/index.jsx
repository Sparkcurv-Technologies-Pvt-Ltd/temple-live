import React, { Fragment } from "react";
import CategoryListView from "@modules/IncomeDetails/Category&NameList/Partials/CategoryList";
import { CustomTabs } from "@components/form/CustomTabs";
import { CustomCardView, CustomRow } from "@components/others";
import { Col } from "antd";
import IncomeNameList from "@modules/IncomeDetails/Category&NameList/Partials/IncomeNameList";

export const IncomeCategoryAndName = () => {

  const TabOptions = [
    {
      key: "1",
      label: "Income Category",
      children: <CategoryListView />,
    },
    {
      key: "2",
      label: "Income Name",
      children: <IncomeNameList />,
    },
  ];
  return (
    <Fragment>
      <CustomCardView>
        <CustomRow>
          <Col span={24} md={24}>
            <CustomTabs tabs={TabOptions} />
          </Col>
        </CustomRow>
      </CustomCardView>
    </Fragment>
  );
};
