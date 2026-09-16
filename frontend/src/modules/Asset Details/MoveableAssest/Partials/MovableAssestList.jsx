import { SvgIcons } from "@assets/Svg";
import { Button, CustomInput, CustomSelect } from "@components/form";
import {
  CommonLoading,
  CustomCardView,
  CustomModal,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoPrint } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import CustomPopconfirm from "@components/others/CustomPopConfirm";
import request from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";
import errorHandler from "@request/errorHandler";
import successHandler from "@request/successHandler";
import { TableIconHolder } from "@components/common/Styled";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import {
  getAssetError,
  getAssetStatus,
  getMovableAsset,
  selectMovableDetails,
} from "@modules/Asset Details/AssetSlice";
import MovableAssestView from "./MovableAssestView";
import { AddMovableAssest } from "./AddMovableAssest";
import { toast } from "react-toastify";
import { userRolesConfig } from "@router/config/roles";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";
import styled from "styled-components";
import { useReactToPrint } from "react-to-print";
import { CommonManagePrintName } from "@modules/ComManagePrintDetails/CommonManagePrint";


const PrintHolder = styled.div`
    padding: 10px 15px;
    @media print{     
      .PrintShowDatadd {
        display: block;
        page-break-before: always;
        border: 1px solid;
      };
      margin: 50px;
      width:100%;
      margin:auto;
    }
`

const PrintShowData = styled.div`
  display: none;
`


const MovableAssestList = () => {

  const dispatch = useDispatch();
  const componentRef = useRef();
  const [movabledata, setMovabledata] = useState([]);
  const [trigger, setTrigger] = useState(0);

  // ======  Modal Open ========
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modelwith, setModelwith] = useState(0);
  const [modalTitle, setModalTitle] = useState();
  const [modalContent, setModalContent] = useState(null);

  const [filer, setFiler] = useState({});
  const [searchTexts, setSearchTexts] = useState([]); //---------Seach Bar 1--------
  const [search2Texts, setSearch2Texts] = useState([]); //---------Seach Bar 2--------

  const role = useSelector(selectCurrentUserRole); //>>>>>>>>>>>>>> Role >>>>>>>>>>>//
  const superUsers = useSelector(selectCurrentSuperUser); //>>>>>>>>>>>>>> Super User >>>>>>>>>>>//
  const MoveableAssetDetailspermission = useSelector(selectAllPermissions); //>>>>>>>>>>>>>> Permission >>>>>>>>>>>//

  const showModal = () => {
    setIsModalOpen(true);
  };

  const close = () => {
    handleOk();
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const SelectOption = [
    {
      label: "Category Name",
      value: "category",
    },
    {
      label: "Asset Name",
      value: "asset",
    },
  ];

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
    dispatch(getMovableAsset());
  }, []);

  const SelectAllMovableAsset = useSelector(selectMovableDetails);
  const SelectAllMovableAssetStatus = useSelector(getAssetStatus);
  const SelectAllMovableAssetError = useSelector(getAssetError);

  useEffect(() => {
    setMovabledata(SelectAllMovableAsset);
  }, [SelectAllMovableAsset]);

  const UpdateMovableAssets = (record) => {
    setModelwith(700);
    setTrigger(trigger + 1);
    setModalContent(
      <AddMovableAssest
        closeee={close}
        updatemovable={record}
        updatemovabletrigger={trigger}
      />
    );
    showModal();
  };

  const AssetViews = (record) => {
    setModelwith(700);
    setTrigger(trigger + 1);
    setModalContent(<MovableAssestView viewmovable={record} />);
    showModal();
  };

  const TableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Category Name",
      // dataIndex: 'category_name'
      render: (text, record) => record?.category_name,
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record?.category_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record?.category_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Asset Name",
      // dataIndex: 'asset_name'
      render: (text, record) => record?.asset_name,
      filteredValue: search2Texts ? [search2Texts] : null,
      onFilter: (value, record) => {
        return (
          String(record?.asset_name)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record?.asset_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Total Qty",
      dataIndex: "total_qty",
    },
    {
      title: "Available Qty",
      dataIndex: "avilable_qty",
    },
    {
      title: "Rent Qty",
      dataIndex: "rent_qty",
    },
    {
      title: "Sale Amount",
      dataIndex: "per_sale_amt",
    },
    {
      title: "Details",
      dataIndex: "details",
    },
    {
      title: "Action",
      render: (text, record, index) => {
        return (
          <Flex gap={"20px"} center={"true"}>
            {superUsers || role === userRolesConfig.ADMIN || MoveableAssetDetailspermission?.Assets?.View ? (
              <Tooltip title="View">
                <TableIconHolder size={"28px"} onClick={() => AssetViews(record)}>
                  <img src={SvgIcons.Eye} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN || MoveableAssetDetailspermission?.Assets?.Edit ? (
              <Tooltip title="Edit">
                <TableIconHolder
                  size={"28px"}
                  onClick={() => UpdateMovableAssets(record)}
                >
                  <img src={SvgIcons.Edit} style={{ cursor: "pointer" }} />
                </TableIconHolder>
              </Tooltip>
            ) : null}
            {superUsers || role === userRolesConfig.ADMIN || MoveableAssetDetailspermission?.Assets?.Delete ? (
              <CustomPopconfirm
                title="Confirmation"
                description="Are you sure you want to remove this Moveable Asset detail?"
                okText="Yes"
                cancelText="No"
                confirm={() => DeleteMovableAsset(record)}
              >
                <Tooltip title="Delete">
                  <img src={SvgIcons.Delete} style={{ cursor: "pointer" }} />
                </Tooltip>
              </CustomPopconfirm>
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
      title: "Category Name",
      dataIndex: 'category_name'
    },
    {
      title: "Asset Name",
      dataIndex: 'asset_name'
    },
    {
      title: "Total Qty",
      dataIndex: "total_qty",
    },
    {
      title: "Available Qty",
      dataIndex: "avilable_qty",
    },
    {
      title: "Rent Qty",
      dataIndex: "rent_qty",
    },
    {
      title: "Sale Amount",
      dataIndex: "per_sale_amt",
    },
    {
      title: "Details",
      dataIndex: "details",
    },
  ]

  let content;

  if (SelectAllMovableAssetStatus === "loading") {
    content = <CommonLoading />;
  } else if (SelectAllMovableAssetStatus === "succeeded") {
    const rowKey = (dataSource) => dataSource.id;
    content = (
      <CustomStandardTable
        columns={TableColumn}
        data={movabledata}
        rowKey={rowKey}
      />
    );
  } else if (SelectAllMovableAssetStatus === "failed") {
    content = <h2>{SelectAllMovableAssetError} </h2>;
  }

  const DeleteMovableAsset = async (record) => {
    await request
      .delete(`${APIURLS.DELETE_MOVABLEASSET_DETAILS}${record?.id}/`, record)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "success",
          type: "success",
        });
        dispatch(getMovableAsset());
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
        }
      });
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });


  return (
    <div>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={8}>
            <CustomPageTitle Heading={"Movable Asset List"} />
          </Col>
          <Col span={24} md={10}>
            <CustomSelect
              label={"Search Here :"}
              options={SelectOption}
              onChange={handleSelect}
            />
          </Col>
          <Col span={24} md={6}>
            {filer === "category" ? (
              <CustomInput
                value={searchTexts}
                placeholder="Category Name"
                onChange={(e) => handleSearchs(e.target.value)}
              />
            ) : (
              <CustomInput
                value={search2Texts}
                placeholder="Asset Name"
                onChange={(e) => handle2Search(e.target.value)}
              />
            )}
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

        <PrintHolder ref={componentRef}>
          <PrintShowData className="PrintShowDatadd">
            <CommonManagePrintName />
            <h3 style={{ textAlign: 'center' }}>Movable Asset Details</h3><br />
            <CustomStandardTable columns={TableColumnPrint} data={movabledata} pagination={false} />
          </PrintShowData>
        </PrintHolder>

      </CustomCardView>

      <CustomModal
        isVisible={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        width={modelwith}
        modalTitle={modalTitle}
        modalContent={modalContent}
      />
    </div>
  );
};

export default MovableAssestList;
