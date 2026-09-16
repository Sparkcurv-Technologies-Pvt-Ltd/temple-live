import { PrintWrapper } from "@components/common/Styled";
import { Button } from "@components/form";
import { Flex } from "@components/others";
import { Fragment, useEffect, useRef, useState } from "react";
import { AiFillPrinter } from "react-icons/ai";
import { useReactToPrint } from "react-to-print";
import {
  getManagement,
  selectManagementDetails,
} from "../Management/ManagementSlice";
import { useDispatch, useSelector } from "react-redux";
import { PrintHolder } from "./Style";
import WhatsappStatementButton from "@modules/CollectionDetails/Partials/WhatsappStatementButton";

const Bill = ({ CollectionRecord }) => {

  const dispatch = useDispatch();

  const componentRef = useRef();

  const [templeData, setTempleData] = useState([]);
  const [times, setTimes] = useState("");
  const [afterTime, setAfterTime] = useState("");
  const AllManagementDetails = useSelector(selectManagementDetails);

  const date = new Date();
  const showTime =
    date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

  useEffect(() => {
    setTimes(showTime)
  }, [showTime])

  useEffect(() => {
    dispatch(getManagement());
  }, []);

  useEffect(() => {
    setTempleData(AllManagementDetails);
  }, [AllManagementDetails]);

  const amount = parseFloat(CollectionRecord?.amount) || 0;
  const interestAmount = parseFloat(CollectionRecord?.interst_amount) || 0;
  const penaltyAmount = parseFloat(CollectionRecord?.penalty_amount) || 0;

  const TotalChitManagementAmt = amount + interestAmount + penaltyAmount;


  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      const date = new Date();
      const newTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      setAfterTime(newTime);
    },
  });

  return (
    <Fragment>
      <Flex margin={"20px"} gap={"10px"}>
        <Button.Primary
          text={<AiFillPrinter style={{ fontSize: "30px" }} />}
          onClick={handlePrint}
          data-testid="bill-print-btn"
        />
        <WhatsappStatementButton
          CollectionRecord={CollectionRecord}
          templeName={templeData?.temple_name}
          autoTrigger
        />
      </Flex>
      <PrintWrapper>
        <PrintHolder ref={componentRef}>
          <div className="container">
            <div className="address">
              <h1>{templeData?.temple_name}</h1>
              <h2>{templeData?.address}</h2>
              {/* <h2>Ph.no: 854345666</h2> */}
            </div>
            <div className="bill_details">
              <div className="holder">
                <h4>Date: {CollectionRecord?.pay_date}</h4>
                <h4>Bill No :&nbsp;{CollectionRecord?.collaction_no} </h4>
              </div>
              <div className="holder">
                <h4>Time : {times || afterTime}</h4>
                <h4>
                  Bill&nbsp;by:&nbsp;
                  {CollectionRecord?.bill_by_name}
                </h4>
              </div>
             
            </div>
            <div className="down_holder">
                <h4>Bill&nbsp;to: &nbsp;{CollectionRecord?.member_name}</h4>
                <h4>Mob No: &nbsp;{CollectionRecord?.mobile_number || CollectionRecord?.mobile_no}</h4>
              </div>
            <div className="table_holder">
              <table>
                <thead>
                  <tr>
                    <th>S. No</th>
                    <th>Particulars</th>
                    {CollectionRecord?.collection_category !== "Management Interest" && <th>Name</th>}
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1.</td>
                    <td>{CollectionRecord?.collection_category}</td>
                    {CollectionRecord?.collection_category === "Festival" && <td>{CollectionRecord?.festival_name}</td>}
                    {CollectionRecord?.collection_category === "Marriage" && <td>{CollectionRecord?.marriage_name}</td>}
                    {CollectionRecord?.collection_category === "Death Tariff" && <td>{CollectionRecord?.death_name}</td>}
                    {CollectionRecord?.collection_category === "Subscription Tariff" && <td>{CollectionRecord?.sub_tariff_no}</td>}
                    {CollectionRecord?.collection_category === "Rent" && <td>{CollectionRecord?.rent_name}</td>}
                    {CollectionRecord?.collection_category === "Lease" && <td>{CollectionRecord?.lease_name}</td>}
                    {CollectionRecord?.collection_category === "Moveable Rent" && <td>{CollectionRecord?.moveable_rent_name}</td>}
                    {CollectionRecord?.collection_category === "Balance" && <td>{CollectionRecord?.balance_name}</td>}
                    {CollectionRecord?.collection_category === "Fund" && <td>{CollectionRecord?.fund_name}</td>}
                    {CollectionRecord?.collection_category === "Chit Interest" && <td>{CollectionRecord?.chit_name}</td>}

                    <td>{(CollectionRecord?.collection_category === "Chit Interest" || CollectionRecord?.collection_category === "Management Interest") ? TotalChitManagementAmt : CollectionRecord?.amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="amount_holder">
              <h2>Amount: ₹&nbsp;{(CollectionRecord?.collection_category === "Chit Interest" || CollectionRecord?.collection_category === "Management Interest") ? TotalChitManagementAmt : CollectionRecord?.amount}</h2>
            </div>
          </div>
        </PrintHolder>
      </PrintWrapper>
    </Fragment>
  );
};
export default Bill;
