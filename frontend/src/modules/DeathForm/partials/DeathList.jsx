import { SvgIcons } from "@assets/Svg";
import {
  Button,
  CustomInput,
  CustomTag,
} from "@components/form";
import {
  CommonLoading,
  CustomCardView,
  CustomModal,
  CustomPopConfirm,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col, Tooltip } from "antd";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoPrint } from "react-icons/io5";
import { TableIconHolder } from "@components/common/Styled";
import { useDispatch, useSelector } from "react-redux";
import {
  getDeathList,
  getDeathlistError,
  getDeathliststatus,
  selectDeathDetaillist,
} from "../DeathSlice";
import DeathProfile from "@modules/DeathForm/partials/DeathProfile.jsx";
import DeathForm from "./DeathForm";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import Label from "@components/form/Label";
import { toast } from "react-toastify";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";
import { userRolesConfig } from "@router/config/roles";
import { useReactToPrint } from "react-to-print";
import styled from "styled-components";
import { CommonManagePrintName } from "@modules/ComManagePrintDetails/CommonManagePrint";

const PrintHolder = styled.div`
    padding: 10px 15px;
    @media print{     
      .PrintShowDatadd {
        display: block;
        page-break-before: always;
        border: 1px solid;
      }
      margin: 50px;
      width:100%;
      margin:auto;
    }
`

const PrintShowData = styled.div`
  display: none;
`


const DeathDetailList = () => {

  const dispatch = useDispatch();
  const componentRef = useRef();

  const [selectalldeathlist, setSelectAllDeathlist] = useState([]);
  const [trigger, setTrigger] = useState(0);
  const [filer, setFiler] = useState({});
  const [searchTexts, setSearchTexts] = useState([]); //---------Seach Bar 1--------
  const [search2Texts, setSearch2Texts] = useState([]); //---------Seach Bar 2--------

  const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
  const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
  const DeathListPermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelwith, setModelwith] = useState(0);
  const [modalTitle, setModalTitle] = useState();
  const [modalContent, setModalContent] = useState(null);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleSearchs = (value) => {
    setSearchTexts(value);
  };

  const handle2Search = (value) => {
    setSearch2Texts(value);
  };

  const handleSelect = (value) => {
    setFiler(value);
    setSearchTexts([]);
    setSearch2Texts([]);
  };

  useEffect(() => {
    dispatch(getDeathList());
  }, []);

  const DeathDetailslist = useSelector(selectDeathDetaillist);
  const SelectDeathlistStatus = useSelector(getDeathliststatus);
  const selectDeathlistError = useSelector(getDeathlistError);

  useEffect(() => {
    setSelectAllDeathlist(DeathDetailslist);
  }, [DeathDetailslist]);

  const ViewDeathList = (record) => {
    setModelwith(800);
    setModalContent(<DeathProfile record={record} />);
    showModal();
  };
  const close = () => {
    handleOk();
    dispatch(getDeathList());
  };

  const editDeathList = (record) => {
    setModelwith(800);
    setTrigger(trigger + 1);
    setModalContent(
      <DeathForm closee={close} updatedeath={record} deathtrigger={trigger} />
    );
    showModal();
  };

  const DeleteDeath = async (data) => {
    await request
      .delete(`${APIURLS.DELETE_DEATHFORMDETAILS}${data?.death?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        dispatch(getDeathList());
        return response.data;
      })
      .catch(function (error) {
        if (error.response) {
          const { status, data } = error.response;

          if (status === 302 && data?.message) {
            toast.error(data.message);
          } else {
            errorHandler(error);
          }
        } else {
          console.error(error);
        }
      });
  };

  const TableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Date",
      render: (record) => {
        return <>{record?.death?.date}</>;
      },
    },
    {
      title: "Family ID",
      dataIndex: "family_no",
    },
    {
      title: "Member Name",
      render: (text, record) => record.death?.member_name,
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record.death?.member_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.death?.member_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Death No",
      render: (deathday) => {
        return <>{deathday?.death?.death_no}</>;
      },
    },
    {
      title: "Death Date",
      render: (deathday) => {
        return <>{deathday?.death?.death_date}</>;
      },
    },
    {
      title: "Status",
      render: (record) => {
        return (
          <>{record?.death?.old_death ?
            <CustomTag title={'Not Tariff'} color={"red"} />
            : <CustomTag title={'Tariff'} color={"blue"} />}

          </>
        )
      },
    },
    {
      title: "Action",
      render: (text, record, index) => {
        return (
          <Flex gap={"20px"} center={"true"}>
            {superUsers || role === userRolesConfig.ADMIN || DeathListPermission?.Death?.View ? (
              <Tooltip title="View">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => ViewDeathList(record)}
                >
                  <img src={SvgIcons.Eye} style={{ cursor: 'pointer' }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN || DeathListPermission?.Death?.Edit ? (
              <Tooltip title="Edit">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => editDeathList(record)}
                >
                  <img src={SvgIcons.Edit} style={{ cursor: 'pointer' }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN || DeathListPermission?.Death?.Delete ? (
              <CustomPopConfirm
                title="confirmation"
                description="Are you sure you want to remove this Death detail?"
                okText="Yes"
                cancelText="No"
                confirm={() => DeleteDeath(record)}
              >
                <Tooltip title="Delete">
                  <img src={SvgIcons.Delete} style={{ cursor: 'pointer' }} />
                </Tooltip>
              </CustomPopConfirm>
            ) : null}
          </Flex>
        );
      },
    },
  ];

  const TableColumnPrint = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Date",
      render: (record) => {
        return <>{record?.death?.date}</>;
      },
    },
    {
      title: "Family ID",
      dataIndex: "family_no",
    },
    {
      title: "Member Name",
      render: (text, record) => record.death?.member_name,
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record.death?.member_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.death?.member_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Death No",
      render: (deathday) => {
        return <>{deathday?.death?.death_no}</>;
      },
    },
    {
      title: "Death Date",
      render: (deathday) => {
        return <>{deathday?.death?.death_date}</>;
      },
    },
    {
      title: "Status",
      render: (record) => {
        return (
          <>{record?.death?.old_death ?
            <CustomTag title={'Not Tariff'} color={"red"} />
            : <CustomTag title={'Tariff'} color={"yellow"} />}

          </>
        )
      },
    },
  ];

  let content;

  if (SelectDeathlistStatus === "loading") {
    content = <CommonLoading />;
  } else if (SelectDeathlistStatus === "succeeded") {
    const rowKey = (selectalldeathlist) => selectalldeathlist?.death.id;
    content = (
      <CustomStandardTable
        columns={TableColumn}
        data={selectalldeathlist}
        rowKey={rowKey}
      />
    );
  } else if (SelectDeathlistStatus === "failed") {
    content = <h2>{selectDeathlistError} </h2>;
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <Fragment>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={12}>
            <CustomPageTitle Heading={"Death Detail List"} />
          </Col>
          <Col span={24} md={12}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              <Label style={{ marginRight: "20px" }}>
                Search by Death Name :
              </Label>
              <CustomInput
                value={searchTexts}
                placeholder="Search"
                onChange={(e) => handleSearchs(e.target.value)}
              />
            </div>
          </Col>
          <Col span={24} md={24}>
            {content}
          </Col>
        </CustomRow>
        <Flex flexend={"right"} style={{ marginTop: "10px" }}>
          <a href="https://web.whatsapp.com/" target="blank">
            <Button.Primary text={"Share"} icon={<FaWhatsapp />} />
          </a>
          <Button.Secondary text={"Print"} icon={<IoPrint />} onClick={handlePrint} />
        </Flex>
      </CustomCardView>

      <PrintHolder ref={componentRef}>
        <PrintShowData className="PrintShowDatadd">
          <CommonManagePrintName />
          <h3 style={{ textAlign: 'center' }}>Death Details</h3><br />
          <CustomStandardTable columns={TableColumnPrint} data={selectalldeathlist} pagination={false} />
        </PrintShowData>
      </PrintHolder>

      <CustomModal
        isVisible={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        width={modelwith}
        modalTitle={modalTitle}
        modalContent={modalContent}
      />
    </Fragment>
  );
};

export default DeathDetailList;

