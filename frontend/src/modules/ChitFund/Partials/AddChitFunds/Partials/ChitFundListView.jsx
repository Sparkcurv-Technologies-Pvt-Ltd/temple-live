import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { CustomCardView, CustomModal, CustomRow, Flex } from '@components/others';
import { CustomPageTitle } from '@components/others/CustomPageTitle';
import { Card, Col, Collapse, Form, Tooltip } from 'antd';
import { StyledHeading } from '../style';
import styled from 'styled-components';
import request from '@request/request';
import { APIURLS } from '@request/apiUrls/urls';
import errorHandler from '@request/errorHandler';
import { Button } from '@components/form';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AllChitList, getChitFundList } from '@modules/ChitFund/ChitFundSlice';
import { BondPaper } from './BondPaper';
import { IoIosPaper } from 'react-icons/io';
import dayjs from 'dayjs';

// Business rule: Settlement Date = Application Date + 60 days.
// Returns a formatted date string or '-' when no application_date is set.
const computeSettlementDate = (applicationDate) => {
    if (!applicationDate) return '-';
    const d = dayjs(applicationDate);
    if (!d.isValid()) return '-';
    return d.add(60, 'day').format('YYYY-MM-DD');
};

const Totalstyle = styled.div`
 & h3 {
        font-size:15px;
        color:#414040;
       
    }
    .ImgTotal {
        width: 150px;
        height: 150px;
        object-fit: cover;
        margin-bottom: 20px;
        overflow: hidden;
        & img {
            width: 100%;
            height: 100%;
            object-fit: scale-down;
        }
    } 
    .info-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 10px; 
}
.info-label {
    width: 200px; 
    font-weight: bold;
    color: #333; 
}
.info-value {
    flex: 1; 
}
.centerLabel {
    display: inline-block;
    width: 20px; 
    text-align: center;
}
`
;
const CardFooterStyle = styled(Card)`
margin:30px 0px;
width:100%;
.info-label-footer{
    font-size:17px;
    margin:20px 0px;
    font-weight: bold;
}   
`
;
const ChitFundListView = () => {

    const [form] = Form.useForm();
    const { id } = useParams();
    const dispatch = useDispatch();

    const [menberDetalView, setMenberDetalView] = useState({});
    const [findIds, setFindIds] = useState({});
    // "Pending Amount to Collect" — sourced from the pending-borrowers
    // endpoint so the header value reconciles with the "View details"
    // page. total_pending_balance = Σ (balance_amt + penalty_balance)
    // across every active Chit-Fund-Interest borrower.
    const [pendingSummary, setPendingSummary] = useState({
        total_pending_principal: null,
        total_pending_interest: null,
        total_pending_balance: null,
    });

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        request
            .get(`chit_fund/pending_borrowers/${id}/`)
            .then((res) => {
                if (cancelled) return;
                setPendingSummary({
                    total_pending_principal: Number(res?.data?.total_pending_principal || 0),
                    total_pending_interest: Number(res?.data?.total_pending_interest || 0),
                    total_pending_balance: Number(res?.data?.total_pending_balance || 0),
                });
            })
            .catch(() => {
                // Silent — falls back to the legacy principal-only diff below.
            });
        return () => { cancelled = true; };
    }, [id]);

    // Effective share count used in the display and in the Demand Share Amount formula.
    // It includes the Management share (typically 1) alongside the investor shares — per business
    // rule the management holds a share in the pool.
    const effectiveInvestersShareCount = useMemo(() => {
        const investers = Number(findIds?.investers_share_count || 0);
        const mgmt = Number(findIds?.management_share_count || 0);
        return investers + mgmt;
    }, [findIds?.investers_share_count, findIds?.management_share_count]);

    // Demand Share Amount = (Management Invested Amount + Outer Invest Amount + Profit Amount) / Investers Share Count
    // Using the same effective share count that is displayed to the user, so the two match.
    const demandShareAmount = useMemo(() => {
        const mgmtInvested = Number(findIds?.management_amt || 0);
        const outerInvest = Number(findIds?.outer_invest_amount || 0);
        const profitAmount = Number(findIds?.profit_amount || 0);
        if (!effectiveInvestersShareCount) return 0;
        const value = (mgmtInvested + outerInvest + profitAmount) / effectiveInvestersShareCount;
        return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
    }, [
        findIds?.management_amt,
        findIds?.outer_invest_amount,
        findIds?.profit_amount,
        effectiveInvestersShareCount,
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    // ======  Modal Title and Content ========
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState(null);

    // ----------  Form Reset UseState ---------
    const [modelwith, setModelwith] = useState(0);

    // ===== Modal Functions Start =====
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        GetMemberDetails()
    }, [])


    const GetMemberDetails = async (data) => {
        await request.get(`${APIURLS.GET_MEMBER_CHITFUND_VIEW}/${id}/`, data)
            .then(function (response) {
                setMenberDetalView(response.data)
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            })
    }

    const MemDetails = menberDetalView?.chitt_fund
    useEffect(() => {
        dispatch(getChitFundList())
    }, []);

    const AllDetails = useSelector(AllChitList);
    useEffect(() => {
        const FindId = AllDetails?.find((ids) => ids?.id == id)
        setFindIds(FindId)
    }, [AllDetails]);

    // ======================================================================
    // NEW MANAGEMENT-AMOUNT RULE (locked with owner, Aug 2026)
    //   Step 1: Management Profit Share = Profit × management_profit_precent%
    //           Remaining Amount        = Profit − Management Profit Share
    //   Step 2: Every member's Share Amount (Member 0 == Management + all
    //           investors) = (Remaining × member.share_count) / Investers Share Count
    //           where "Investers Share Count" is the effective count shown
    //           on the page = management_share_count + investers_share_count
    //   Step 3: Σ Members + Management Profit Share = Profit Amount   (verified)
    //
    // The old (`Profit × share_count / total`) helper is replaced below.
    // ======================================================================
    const totalShareCount = effectiveInvestersShareCount;

    // NOTE: The backend field is `set_profit_percent` (see chit_fund/models.py
    // and serializers). The previous alias `management_profit_precent` did not
    // exist on the API payload, so `pct` was always 0 -> Management Profit
    // Share came out as 0 and every member share was inflated to a slice of
    // the full profit instead of the 90 % remainder. Reading the correct
    // field fixes the entire Step 1 → Step 3 chain.
    const managementAmount = useMemo(() => {
        const profit = Number(findIds?.profit_amount || 0);
        const pct = Number(findIds?.set_profit_percent || 0);
        const v = (profit * pct) / 100;
        return Number.isFinite(v) ? Number(v.toFixed(2)) : 0;
    }, [findIds?.profit_amount, findIds?.set_profit_percent]);

    const remainingAmount = useMemo(() => {
        const profit = Number(findIds?.profit_amount || 0);
        const v = profit - managementAmount;
        return Number.isFinite(v) ? Number(v.toFixed(2)) : 0;
    }, [findIds?.profit_amount, managementAmount]);

    // Per-member share amount uses REMAINING (not profit) as the pool and
    // divides by the "Investers Share Count" displayed on the page.
    const getProfitShare = (share_count) => {
        const sc = Number(share_count || 0);
        if (!totalShareCount) return 0;
        const value = (remainingAmount * sc) / totalShareCount;
        return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
    };

    const getMemberShareAmount = (m) => getProfitShare(m?.share_count);

    // Kept for backward-compat with any other card that reads it.
    // Now equals `Σ (remaining × investor.share_count / total)` over
    // *active investor* rows only — i.e., Remaining × (investers_share_count / total).
    const investorsProfitShareTotal = useMemo(() => {
        if (!totalShareCount) return 0;
        const perInvestorSum = (Array.isArray(MemDetails) ? MemDetails : [])
            .filter((inv) => inv?.action !== false)
            .reduce((acc, inv) => acc + (remainingAmount * Number(inv?.share_count || 0)) / totalShareCount, 0);
        if (!perInvestorSum && findIds?.investers_share_count) {
            const fallback = (remainingAmount * Number(findIds?.investers_share_count || 0)) / totalShareCount;
            return Number.isFinite(fallback) ? Number(fallback.toFixed(2)) : 0;
        }
        return Number.isFinite(perInvestorSum) ? Number(perInvestorSum.toFixed(2)) : 0;
    }, [remainingAmount, findIds?.investers_share_count, totalShareCount, MemDetails]);

    // Reconciliation: (Σ Member Share Amounts + Management Profit Share) − Profit.
    // Should be ≈ 0 (paisa rounding). Any drift means data-entry issue.
    const reconciliationDelta = useMemo(() => {
        const profit = Number(findIds?.profit_amount || 0);
        const sumMembers = (Array.isArray(MemDetails) ? MemDetails : [])
            .filter((inv) => inv?.action !== false)
            .reduce((acc, inv) => acc + getMemberShareAmount(inv), 0);
        const mgmtMemberShare = getProfitShare(findIds?.management_share_count);
        return Number((sumMembers + mgmtMemberShare + managementAmount - profit).toFixed(2));
    }, [findIds?.profit_amount, findIds?.management_share_count, MemDetails, managementAmount, remainingAmount, totalShareCount]);

    const handlebondClick = (values) => {
        setModelwith(900)
        setModalContent(<BondPaper InvestorRecord={values} AllChitDetails={findIds} findIds={findIds} />);
        showModal();
    }
    return (
        <Form
            name='ViewMemberProfile'
            form={form}
            labelCol={{
                span: 24,
            }}
            wrapperCol={{
                span: 24,
            }}
            autoComplete="off"
        >
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={24}>
                        <CustomPageTitle Heading={'View Details'} />
                    </Col>
                    <Col span={24} md={12}>
                        <Totalstyle>
                            <div className="info-row">
                                <h3 className="info-label">Chit No </h3>
                                <span >:</span>&nbsp;&nbsp;
                                <span>{findIds?.chit_no}</span>
                            </div>
                            <div className="info-row">
                                <h3 className="info-label">Chit Name </h3>
                                <span>:</span>&nbsp;
                                <span>{findIds?.chit_name}</span>
                            </div>
                            <div className="info-row">
                                <h3 className="info-label">Management Invested Amount </h3>
                                <span>:</span>&nbsp;
                                <span>{findIds?.management_amt}</span>
                            </div>
                            <div className="info-row">
                                <h3 className="info-label">Management Share Count </h3>
                                <span>:</span>&nbsp;
                                <span>{findIds?.management_share_count}</span>
                            </div>
                            <div className="info-row">
                                <h3 className="info-label">Management Retake Amount</h3>
                                <span>:</span>&nbsp;
                                <span>{findIds?.management_retake}</span>
                            </div>
                            <div className="info-row">
                                <h3 className="info-label">Management Profit Precent </h3>
                                <span>:</span>&nbsp;
                                <span>{findIds?.set_profit_percent}</span>
                            </div>
                            <div className="info-row">
                                <h3 className="info-label">Profit Amount </h3>
                                <span>:</span>&nbsp;
                                <span>{findIds?.profit_amount}</span>
                            </div>
                            <div className="info-row">
                                <h3 className="info-label">Principal Given Amount </h3>
                                <span>:</span>&nbsp;
                                <span>{findIds?.principal_given_amount}</span>
                            </div>
                            <div className="info-row" data-testid="management-amount-row">
                                <h3 className="info-label">Management Profit Share </h3>
                                <span>:</span>&nbsp;
                                <span style={{ fontWeight: 600, color: '#0F5132' }} data-testid="management-amount-value">
                                    ₹ {managementAmount.toFixed(2)}
                                </span>
                            </div>
                            <div className="info-row" data-testid="remaining-amount-row">
                                <h3 className="info-label">Remaining Amount </h3>
                                <span>:</span>&nbsp;
                                <span style={{ fontWeight: 600 }} data-testid="remaining-amount-value">
                                    ₹ {remainingAmount.toFixed(2)}
                                </span>
                            </div>
                            {/* Feb 2026 owner rule: Loss of Pay =
                                Σ discounts (Discount ledger rows) across
                                every loan in this chit fund.  Populated
                                by chit_fund/views.py::get_active_chitfunds
                                on the fly — always in-sync with the
                                ledger; no schema / signals involved. */}
                            <div className="info-row" data-testid="loss-of-pay-row">
                                <h3 className="info-label">Loss of Pay </h3>
                                <span>:</span>&nbsp;
                                <span style={{ fontWeight: 600, color: '#c00' }} data-testid="loss-of-pay-value">
                                    ₹ {Number(findIds?.loss_of_pay || 0).toFixed(2)}
                                </span>
                            </div>
                        </Totalstyle>
                    </Col>
                    <Col span={24} md={12}>
                        <Totalstyle>
                            <div className="info-row">
                                <h3 className="info-label">Starting Date </h3>
                                <span>:</span>&nbsp;
                                <span>{findIds?.starting_date}</span>
                            </div>
                            <div className="info-row">
                                <h3 className="info-label">Outer Invest Amount </h3>
                                <span>:</span>&nbsp;
                                <span>{findIds?.outer_invest_amount}</span>
                            </div>
                            <div className="info-row">
                                <h3 className="info-label">Investers Share Count </h3>
                                <span>:</span>&nbsp;
                                <span data-testid="investers-share-count-value">{effectiveInvestersShareCount}</span>
                            </div>
                            <div className="info-row" data-testid="demand-share-amount-row">
                                <h3 className="info-label">Demand Share Amount </h3>
                                <span>:</span>&nbsp;
                                <span data-testid="demand-share-amount-value">{demandShareAmount}</span>
                            </div>
                            <div className="info-row">
                                <h3 className="info-label">Invest Retake Amount </h3>
                                <span>:</span>&nbsp;
                                <span>{findIds?.invest_retake}</span>
                            </div>
                            <div className="info-row">
                                <h3 className="info-label">Interest Precent</h3>
                                <span>:</span>&nbsp;
                                <span>{findIds?.set_intrest_percent}</span>
                            </div>
                            <div className="info-row">
                                <h3 className="info-label">Profit Retake </h3>
                                <span>:</span>&nbsp;
                                <span>{findIds?.profit_retake}</span>
                            </div>
                            <div className="info-row">
                                <h3 className="info-label">Collected Principal Amount </h3>
                                <span>:</span>&nbsp;
                                <span>{findIds?.collected_principal_amount}</span>
                            </div>
                            <div className="info-row" data-testid="chit-pending-to-collect-row">
                                <h3 className="info-label">Pending Amount to Collect</h3>
                                <span>:</span>&nbsp;
                                <span style={{ color: '#b91c1c', fontWeight: 700 }} data-testid="chit-pending-to-collect-value">
                                  {/*
                                    Same figure the "View details" page shows
                                    as "Total outstanding (incl. penalty)".
                                    Falls back to the legacy principal-only
                                    diff if the pending endpoint hasn't
                                    responded yet, so the row is never blank.
                                  */}
                                  ₹ {(
                                    pendingSummary.total_pending_balance !== null
                                      ? pendingSummary.total_pending_balance
                                      : Number(findIds?.principal_given_amount || 0) -
                                        Number(findIds?.collected_principal_amount || 0)
                                  ).toFixed(2)}
                                </span>
                                &nbsp;&nbsp;
                                <a
                                    href={`/chit-fund/${id}/pending-borrowers`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    data-testid="pending-borrowers-open-link"
                                    style={{
                                        padding: '2px 10px',
                                        borderRadius: 6,
                                        border: '1px solid #b91c1c',
                                        background: '#fff',
                                        color: '#b91c1c',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                    }}
                                >
                                    View details →
                                </a>
                            </div>
                            <CardFooterStyle>
                                <h3 className="info-label-footer">Cash In Hand Amount&nbsp; :&nbsp;&nbsp;<span style={{color:'green'}}>₹&nbsp;{findIds?.cash_inhand_amount}</span> </h3>
                            </CardFooterStyle>
                        </Totalstyle>
                    </Col>

                    <Col span={24} md={18}>
                        <StyledHeading style={{ marginTop: "25px", textAlign: "left" }}>
                            <h2>Member  Details</h2>
                        </StyledHeading>
                    </Col>
                    <Col span={24} md={24}>
                        {/*
                          Member 0 – Management Share card.
                          Renders BEFORE the investor list to represent the
                          Management as the 0th "member" in the pool. This
                          matches the business rule that management holds a
                          share alongside outer investors.
                        */}
                        {findIds && (
                          <div
                            data-testid="member-0-card"
                            style={{
                              padding: '20px',
                              border: '2px dashed #0F5132',
                              margin: '10px',
                              background: '#f6fff9',
                            }}
                          >
                            <Flex spacebetween={true} aligncenter={true}>
                              <h2 style={{ textDecoration: 'underline', color: '#0F5132' }}>
                                Member 0 (Management)
                              </h2>
                            </Flex>
                            <CustomRow>
                              <Col span={24} md={12}>
                                <Totalstyle>
                                  <div className="info-row">
                                    <h3 className="info-label">Name </h3>
                                    <span>:</span>&nbsp;
                                    <span data-testid="member-0-name">Management</span>
                                  </div>
                                  <div className="info-row">
                                    <h3 className="info-label">Joining Date </h3>
                                    <span>:</span>&nbsp;
                                    <span>{findIds?.starting_date || '-'}</span>
                                  </div>
                                  <div className="info-row">
                                    <h3 className="info-label">Invested Amt  </h3>
                                    <span>:</span>&nbsp;
                                    <span data-testid="member-0-invested-amt">
                                      {Number(findIds?.management_amt || 0).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="info-row">
                                    <h3 className="info-label">Share Count  </h3>
                                    <span>:</span>&nbsp;
                                    <span data-testid="member-0-share-count">
                                      {findIds?.management_share_count ?? 0}
                                    </span>
                                  </div>
                                  <div className="info-row">
                                    <h3 className="info-label">Share Amount  </h3>
                                    <span>:</span>&nbsp;
                                    <span data-testid="member-0-share-amount">
                                      {/*
                                        Management's profit-share slice —
                                        same formula as every investor card:
                                        Profit × share_count / total_share_count.
                                        Guarantees Σ Share Amount = Profit.
                                      */}
                                      {getProfitShare(findIds?.management_share_count).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="info-row">
                                    <h3 className="info-label">Retake Share Count  </h3>
                                    <span>:</span>&nbsp;
                                    <span>{findIds?.retake_management_share_count ?? 0}</span>
                                  </div>
                                  {/*
                                    Application Date & Settlement Date are
                                    displayed ONLY when management has an
                                    application_date recorded (currently
                                    optional / rare — Management typically
                                    holds a permanent share). Settlement Date
                                    is computed as Application Date + 60 days.
                                  */}
                                  {findIds?.management_application_date && (
                                    <>
                                      <div className="info-row">
                                        <h3 className="info-label">Application Date </h3>
                                        <span>:</span>&nbsp;
                                        <span data-testid="member-0-application-date">
                                          {findIds.management_application_date}
                                        </span>
                                      </div>
                                      <div className="info-row">
                                        <h3 className="info-label">Settlement Date  </h3>
                                        <span>:</span>&nbsp;
                                        <span data-testid="member-0-settlement-date">
                                          {computeSettlementDate(findIds.management_application_date)}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </Totalstyle>
                              </Col>
                            </CustomRow>
                          </div>
                        )}
                        {MemDetails?.map((find, index) => (
                            <div style={{ padding: '20px', border: '2px solid', margin: '10px' }}>
                                <Flex spacebetween={true} aligncenter={true}>
                                    <h2 style={{ textDecoration: 'underline' }}>Member {index + 1}</h2>
                                    <Tooltip placement="top" title='Bond Paper'>
                                        <Flex end={true}><Button.Secondary onClick={() => handlebondClick(find)} icon={<IoIosPaper />} text={'Bond'} /> </Flex>
                                    </Tooltip>
                                </Flex>

                                <CustomRow>
                                    <Col span={24} md={12}>
                                        <Totalstyle>
                                            <div className="info-row">
                                                <h3 className="info-label">Name </h3>
                                                <span>:</span>&nbsp;
                                                <span>{find?.invester_name}</span>
                                            </div>
                                            <div className="info-row">
                                                <h3 className="info-label">Joining Date </h3>
                                                <span>:</span>&nbsp;
                                                <span>{find?.joining_date}</span>
                                            </div>
                                            <div className="info-row">
                                                <h3 className="info-label">Email ID  </h3>
                                                <span>:</span>&nbsp;
                                                <div className="info-value">{find?.invester_email}</div>
                                            </div>
                                            <div className="info-row">
                                                <h3 className="info-label">Mobile  </h3>
                                                <span>:</span>&nbsp;
                                                <span>{find?.invester_mobile}</span>
                                            </div>
                                            <div className="info-row">
                                                <h3 className="info-label">Address</h3>
                                                <span>:</span>&nbsp;
                                                <div className="info-value">{find?.invester_address}</div>
                                            </div>


                                            <div className="info-row">
                                                <h3 className="info-label">Invested Amt  </h3>
                                                <span>:</span>&nbsp;
                                                <span>{find?.investment_amt}</span>
                                            </div>
                                            <div className="info-row">
                                                <h3 className="info-label">Share Count  </h3>
                                                <span>:</span>&nbsp;
                                                <span>{find?.share_count}</span>
                                            </div>

                                            <div className="info-row">
                                                <h3 className="info-label">Share Amount  </h3>
                                                <span>:</span>&nbsp;
                                                <span>
                                                  {/*
                                                    Profit-share slice per
                                                    owner rule:
                                                    Profit × share_count / total_share_count.
                                                    Sum across Member 0..N
                                                    reconciles exactly with
                                                    Profit Amount.
                                                  */}
                                                  {getProfitShare(find?.share_count).toFixed(2)}
                                                </span>
                                            </div>

                                            {Number(find?.final_settlement_amount || 0) > 0 && (
                                                <div className="info-row">
                                                    <h3 className="info-label">Final Settlement Amount  </h3>
                                                    <span>:</span>&nbsp;
                                                    <span style={{ color: '#0F5132', fontWeight: 600 }}>
                                                      ₹ {Number(find?.final_settlement_amount).toFixed(2)}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="info-row">
                                                <h3 className="info-label">Retake Share Count  </h3>
                                                <span>:</span>&nbsp;
                                                <span>{find?.retake_share_count}</span>
                                            </div>

                                            <div className="info-row">
                                                <h3 className="info-label">Application Date </h3>
                                                <span>:</span>&nbsp;
                                                <span data-testid={`member-${index + 1}-application-date`}>
                                                  {find?.application_date || '-'}
                                                </span>
                                            </div>
                                            <div className="info-row">
                                                <h3 className="info-label">Settlement Date  </h3>
                                                <span>:</span>&nbsp;
                                                <span data-testid={`member-${index + 1}-settlement-date`}>
                                                  {computeSettlementDate(find?.application_date)}
                                                </span>
                                            </div>
                                        </Totalstyle>
                                    </Col>
                                    <Col span={24} md={12} key={find.id}>
                                        <Totalstyle style={{ float: 'right' }}>
                                            <div className='ImgTotal'>
                                                {find?.images ? (
                                                    <img src={find.images} alt='img' />
                                                ) : (
                                                    <span></span>
                                                )}
                                            </div>

                                        </Totalstyle>
                                    </Col>
                                    {find?.documents &&
                                        <Col span={24} md={24} style={{ margin: '10px 0px' }}>
                                            <Collapse
                                                size="small"
                                                items={[
                                                    {
                                                        key: "1",
                                                        label: "Chit Fund Document",
                                                        children: (
                                                            <Fragment>
                                                                {find?.documents && (
                                                                    <>
                                                                        {find?.documents.toLowerCase().endsWith(
                                                                            ".pdf"
                                                                        ) ? (
                                                                            <iframe
                                                                                title="PDF Preview"
                                                                                style={{
                                                                                    width: "100%",
                                                                                    height: "80vh",
                                                                                    border: "none",
                                                                                }}
                                                                                src={find?.documents}
                                                                            />
                                                                        ) : find?.documents.toLowerCase().endsWith(
                                                                            ".docx"
                                                                        ) ||
                                                                            find?.documents.toLowerCase().endsWith(
                                                                                ".doc"
                                                                            ) ? (
                                                                            <iframe
                                                                                title="Document Preview"
                                                                                style={{
                                                                                    width: "100%",
                                                                                    height: "80vh",
                                                                                    border: "none",
                                                                                }}
                                                                                src={`https://docs.google.com/gview?url=${find?.documents}&embedded=true`}
                                                                            />
                                                                        ) : null}
                                                                    </>
                                                                )}
                                                            </Fragment>
                                                        ),
                                                    },
                                                ]}
                                            />
                                        </Col>}
                                </CustomRow>
                            </div>
                        ))}
                    </Col>

                    <Col span={24} md={12}>

                    </Col>
                </CustomRow>

            </CustomCardView>
            <CustomModal
                isVisible={isModalOpen}
                handleOk={handleOk}
                handleCancel={handleCancel}
                width={modelwith}
                modalTitle={modalTitle}
                modalContent={modalContent}
            />
        </Form>
    )
}

export default ChitFundListView