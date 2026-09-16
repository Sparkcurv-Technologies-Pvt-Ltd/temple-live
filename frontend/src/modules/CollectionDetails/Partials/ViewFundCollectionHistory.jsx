import {
  Button,
  CustomInput,
  CustomSelect,
  CustomTable,
} from "@components/form";
import { CustomCardView, CustomRow, Flex } from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col } from "antd";
import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoPrint } from "react-icons/io5";

const ViewFundCollectionHistory = () => {
  const filteroption = [
    {
      label: "filter",
      value: "filter",
    },
  ];

  const TableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Fund Member Name",
      dataIndex: "family_idd",
    },
    {
      title: "Paid Date",
      dataIndex: "status",
    },
    {
      title: "Payment Mode",
      dataIndex: "genderr",
    },
    {
      title: "Amount",
      dataIndex: "amount",
    },
  ];

  const dataSource = [
    {
      key: "1",
      date: "07/12/2023",
      family_id: "110",
      member_name: "Maapilai",
      gender: "Male",
      marriage_date: "17/12/2023",
    },
  ];
  return (
    <div>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={12}>
            <CustomPageTitle
              Heading={"View Fund Collection History"}
              width={"100%"}
            />
          </Col>
          <Col span={24} md={6}>
            <CustomSelect
              label={"Filter"}
              options={filteroption}
              name={"filter"}
            />
          </Col>
          <Col span={24} md={6}>
            <CustomInput label={"Value"} name={"value"} disabled={"true"} />
          </Col>
          <Col span={24} md={24}>
            <CustomTable columns={TableColumn} data={dataSource} />
          </Col>
        </CustomRow>
        <Flex flexend={"right"} style={{ marginTop: "10px" }}>
          <Button.Primary text={"Share"} icon={<FaWhatsapp />} />
          <Button.Secondary text={"Print"} icon={<IoPrint />} />
        </Flex>
      </CustomCardView>
    </div>
  );
};

export default ViewFundCollectionHistory;
