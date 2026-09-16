import { CustomTabs } from "@components/form/CustomTabs";
import { CustomCardView, CustomRow } from "@components/others";
import { Col } from "antd";
import React, { Fragment } from "react";
import ExpenseCategoryListView from "./Partials/CategoryList";
import ExpenseNameList from "./Partials/NameList";

export const ExpenseCategoryAndNameList = () => {

    const TabOptions = [
        {
            key: "1",
            label: "Expense Category",
            children: <ExpenseCategoryListView />,
        },
        {
            key: "2",
            label: "Expense Name",
            children: <ExpenseNameList />,
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
