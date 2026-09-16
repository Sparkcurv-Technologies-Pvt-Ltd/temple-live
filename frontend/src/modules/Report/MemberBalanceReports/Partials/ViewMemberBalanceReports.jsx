import { SvgIcons } from "@assets/Svg";
import {
  Button,
  CustomInput,
} from "@components/form";
import {
  CommonLoading,
  CustomCardView,
  CustomModal,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoPrint } from "react-icons/io5";
import { useDispatch } from "react-redux";
import request from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";
import errorHandler from "@request/errorHandler";
import { CustomStandardTable } from "@components/form/CustomStandardTable";
import Label from "@components/form/Label";
import { useReactToPrint } from "react-to-print";
import styled from "styled-components";
import { CommonManagePrintName } from "@modules/ComManagePrintDetails/CommonManagePrint";
import dayjs from "dayjs";


const PrintHolder = styled.div`
  padding: 10px 15px;
  @media print {
    .PrintShowDatadd {
      display: block;
      page-break-before: always;
      border: 1px solid;
    }
    margin: 50px;
    width: 100%;
    margin: auto;
  }
`;
export const formatIndianNumber = (number) => {
  // Convert number to string
  let strNumber = number?.toString();

  // Check for decimal in the number
  let decimalPart = '';
  if (strNumber.includes('.')) {
    [strNumber, decimalPart] = strNumber.split('.');
    decimalPart = '.' + decimalPart; // prepend '.' to keep the decimal part
  }
  const length = strNumber.length;
  if (length <= 3) {
    return strNumber + decimalPart;
  }
  const lastThreeDigits = strNumber.substring(length - 3);
  const mainPart = strNumber.substring(0, length - 3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  return `${mainPart},${lastThreeDigits}${decimalPart}`;
};

const ViewMemberBalanceReports = () => {

  const dispatch = useDispatch();
  const componentRef = useRef();
  
  const [trigger, setTrigger] = useState(0);
  const [dataSource, setDataSource] = useState([]);

  // ======  Modal Open ========
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modelwith, setModelwith] = useState(0);

  const [modalTitle, setModalTitle] = useState();

  const [modalContent, setModalContent] = useState(null);
  const [searchTexts, setSearchTexts] = useState([]); //---------Seach Bar 1--------

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

  const FormExternalClose = () => {
    handleOk();
  };

  //--------- Member Balance Report Details Post------------------

  useEffect(() => {
    HandleBalanceCollect()
  }, []);

  const HandleBalanceCollect = async () => {
    const BalanceValues = {
      category: 'Balance',
    };
    await request
      .post(APIURLS.BALANCE_COLLECTIONS, BalanceValues)
      .then(function (response) {
        setDataSource(response.data)
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  const TableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: "Member No",
      render: (record) => {
        return <span>{record?.list?.member_no}</span>;
      }
    },
    {
      title: "Member Name",
      render: (text, record) => {
        const colorStyle = record?.list?.death ? { color: 'red' } : {}; 
        return <span style={colorStyle}>{record?.list?.member_name}</span>;
      },
      filteredValue: searchTexts ? [searchTexts] : null,
      onFilter: (value, record) => {
        return (
          String(record?.list?.member_name).toLowerCase().includes(value.toLowerCase()) ||
          String(record?.list?.member_name).includes(value.toUpperCase())
        );
      },
    },
    {
      title: "Mobile No",
      render:(record)=>{
       return record?.list?.member_mobile_number
      }
    },
     
    {
      title: "Balance Amount",
      render:(record)=>{
        return <span> ₹ {formatIndianNumber(record?.amount)}&nbsp;</span> 
       }
    },
   
  ];

  const currentDate = dayjs().format('YYYY-MM-DD');

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <div>
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={12}>
            <CustomPageTitle Heading={"Member Balance Reports"} />
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
                Search by Member Name :
              </Label>
              <CustomInput
                value={searchTexts}
                placeholder="Search"
                onChange={(e) => handleSearchs(e.target.value)}
              />
            </div>
          </Col>
          <Col span={24} md={24}>

            <PrintHolder ref={componentRef}>
              <PrintShowData className="PrintShowDatadd">
                <CommonManagePrintName />
                <h3 style={{ textAlign: 'center' }}>Member Balance Details</h3><br />
                <Flex spacebetween={true} aligncenter={true}>
                  <div style={{ margin: '0 10px' }}></div>
                  <div>
                    <h5 style={{ marginRight: '10px' }}><span>Print Date</span> : {currentDate} </h5>
                  </div>
                 </Flex>
                <CustomStandardTable columns={TableColumn} data={dataSource} pagination={false} />
              </PrintShowData>
            </PrintHolder>
            <CustomStandardTable columns={TableColumn} data={dataSource} />
          </Col>
        </CustomRow>
        <Flex flexend={"right"} style={{ marginTop: "10px" }}>
          <a href="https://web.whatsapp.com/" target="blank">
            <Button.Primary text={"Share"} icon={<FaWhatsapp />} />
          </a>
          <Button.Secondary text={"Print"} icon={<IoPrint />} onClick={handlePrint} />
        </Flex>
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

export default ViewMemberBalanceReports;



const PrintShowData = styled.div`
  display: none;
`