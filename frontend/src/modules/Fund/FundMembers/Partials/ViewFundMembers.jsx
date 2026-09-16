import { CustomTable } from "@components/form";
import { Flex } from "@components/others";
import React, { Fragment, useEffect } from "react";
import { useState } from "react";
import { FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ViewFundMembers = ({ fundmembersDetails }) => {
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState([]);
  useEffect(() => {
    setDataSource(fundmembersDetails);
  }, [fundmembersDetails]);

  const ViewMemberClick = (record) => {
    navigate(`/view_fund_member_details/${record?.id}`);
  };
  const TableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "MemberName",
      dataIndex: "member_name",
    },
    {
      title: "Member No",
      dataIndex: 'member_no',
      render: (text) => {
          return (
              <p>{text !== null ? text : '_'}</p>
          );
      }
  },
  
    {
      title: "Action",
      render: (text, record, index) => {
        return (
          <Flex gap={"20px"} center={"true"}>
            <FaUsers
              size={28}
              onClick={() => ViewMemberClick(record)}
              style={{ cursor: "pointer", color: "grey" }}
            />
          </Flex>
        );
      },
    },
  ];
  return (
    <Fragment>
      <CustomTable columns={TableColumn} data={dataSource} />
    </Fragment>
  );
};

export default ViewFundMembers;
