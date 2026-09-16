import { Fragment, useEffect, useRef, useState } from "react";
import { AiFillPrinter } from "react-icons/ai";
import { useReactToPrint } from "react-to-print";
import { useDispatch, useSelector } from "react-redux";
import { getManagement, selectManagementDetails } from "@modules/Management/ManagementSlice";
import { PrintWrapper } from "@components/common/Styled";
import { PrintHolder } from "@modules/Bill/Style";
import { Button } from "@components/form";
import { Flex } from "@components/others";

const ViewSettlementPrint = ({ settlementRecord }) => {

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
                />
            </Flex>
            <PrintWrapper>
                <PrintHolder ref={componentRef}>
                    <div className="container">
                        <div className="address">
                            <h1>{templeData?.temple_name}</h1>
                            <h2>{templeData?.address}</h2>
                            <h3>Settlement Details</h3>
                        </div>
                        <div className="bill_details">
                            <div className="holder">
                                <h4>Bill&nbsp;to: &nbsp;{settlementRecord?.tenat_name}</h4>
                                <h4>Mob No: &nbsp;{settlementRecord?.tenat_mobile}</h4>
                            </div>
                            <div className="holder">
                                <h4>Bill No :&nbsp;{settlementRecord?.collaction_no} </h4>
                                <h4>Time : {times || afterTime}</h4>
                                <h4>Start Date: {settlementRecord?.start_date}</h4>
                                <h4>End Date: {settlementRecord?.end_date}</h4>
                                <h4>
                                    Bill&nbsp;by:&nbsp;
                                    {settlementRecord?.bill_by_name}
                                </h4>
                            </div>
                        </div>
                        <div className="table_holder">
                            <table>
                                <thead>
                                    <tr>
                                        <th>S. No</th>
                                        <th>Particulars</th>
                                        <th>Rent No</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>{settlementRecord?.asset_name}</td>
                                        <td>{settlementRecord?.lease_rent_no}</td>
                                        <td>{settlementRecord?.advance_settlement_amt}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="amount_holder">
                            <h2>Amount: ₹&nbsp;{settlementRecord?.advance_settlement_amt}</h2>
                        </div>
                    </div>
                </PrintHolder>
            </PrintWrapper>
        </Fragment>
    );
};
export default ViewSettlementPrint;
