import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

const API_BASE =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.REACT_APP_BACKEND_URL ||
  "";

const Wrap = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  color: #0f172a;
  padding: 24px 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
  max-width: 720px;
  margin: 0 auto 16px auto;
`;

const WideCard = styled(Card)`
  max-width: 1100px;
  overflow-x: auto;
`;

const LedgerTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  th, td {
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    text-align: left;
    white-space: nowrap;
  }
  th {
    background: #f8fafc;
    font-weight: 700;
    color: #0f172a;
  }
  tbody tr:nth-child(even) td {
    background: #fafafa;
  }
  td.num { text-align: right; }
`;

const fmtDMY = (iso) => {
  if (!iso) return "-";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  border-bottom: 1px solid #e2e8f0;
  padding: 8px 0;
  font-size: 14px;
  &:last-child { border-bottom: 0; }
`;

const Chip = styled.span`
  display: inline-block;
  padding: 2px 10px;
  background: #ecfdf5;
  color: #065f46;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
`;

const Title = styled.h1`
  font-size: 20px;
  margin: 0 0 4px 0;
  color: #0f5132;
`;

const Muted = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 13px;
`;

const fmt = (n) => `\u20B9 ${Number(n || 0).toFixed(2)}`;

const PublicMemberStatement = () => {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, error: null, data: null });

  // WhatsApp share flow: URL params carry the receipt of the just-made
  // payment + a print=1 flag that auto-triggers the browser Save-as-PDF
  // dialog so the recipient sees Receipt + Balance Sheet as one PDF —
  // WITHOUT needing to log into the temple admin portal.
  const [searchParams] = useSearchParams();
  const autoPrint = searchParams.get("print") === "1";
  const receipt = {
    no: searchParams.get("receipt_no") || "",
    amt: searchParams.get("receipt_amt") || "",
    date: searchParams.get("receipt_date") || "",
    purpose: searchParams.get("receipt_purpose") || "",
    mode: searchParams.get("receipt_mode") || "",
  };
  const hasReceipt = Boolean(receipt.no || receipt.amt);

  const printedRef = useRef(false);
  useEffect(() => {
    if (!autoPrint || printedRef.current) return;
    if (state.loading || state.error) return;
    printedRef.current = true;
    console.log("[MemberStatement] Auto-triggering print dialog…");
    const t = setTimeout(() => window.print(), 800);
    return () => clearTimeout(t);
  }, [autoPrint, state.loading, state.error]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = `${API_BASE}/api/collection/public/member_statement/${token}/`;
        const { data } = await axios.get(url);
        if (!cancelled) setState({ loading: false, error: null, data });
      } catch (err) {
        if (!cancelled)
          setState({
            loading: false,
            error:
              err?.response?.data?.detail ||
              "This statement link is invalid or has expired.",
            data: null,
          });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.loading)
    return (
      <Wrap data-testid="statement-loading">
        <Card>Loading your statement…</Card>
      </Wrap>
    );

  if (state.error)
    return (
      <Wrap data-testid="statement-error">
        <Card>
          <Title>Statement unavailable</Title>
          <Muted>{state.error}</Muted>
        </Card>
      </Wrap>
    );

  const { member, period, collections, totals, pending_dues, ledger, ledger_totals } = state.data;

  return (
    <Wrap data-testid="statement-root">
      {hasReceipt && (
        <Card data-testid="statement-receipt">
          <Title style={{ fontSize: 18 }}>Payment Receipt</Title>
          {receipt.no && (
            <Row>
              <span>Receipt No</span>
              <strong>{receipt.no}</strong>
            </Row>
          )}
          {receipt.date && (
            <Row>
              <span>Date</span>
              <strong>{receipt.date}</strong>
            </Row>
          )}
          {receipt.purpose && (
            <Row>
              <span>Purpose</span>
              <strong>{receipt.purpose}</strong>
            </Row>
          )}
          {receipt.mode && (
            <Row>
              <span>Payment Mode</span>
              <strong>{receipt.mode}</strong>
            </Row>
          )}
          {receipt.amt && (
            <Row>
              <strong>Amount Paid</strong>
              <Chip>{`\u20B9 ${receipt.amt}`}</Chip>
            </Row>
          )}
        </Card>
      )}

      <Card>
        <Title data-testid="statement-member-name">
          {[member.name, member.last_name].filter(Boolean).join(" ")}
        </Title>
        <Muted>
          Member No: {member.member_no || "-"} · Mobile:{" "}
          {member.mobile || "-"}
        </Muted>
        <Muted style={{ marginTop: 6 }}>
          Statement period: {period.from} to {period.to}
        </Muted>
      </Card>

      <WideCard>
        <Title style={{ fontSize: 16, marginBottom: 12 }}>Balance sheet</Title>
        {(!ledger || ledger.length === 0) ? (
          <Muted data-testid="statement-ledger-empty">
            No entries in the last 12 months.
          </Muted>
        ) : (
          <LedgerTable data-testid="statement-ledger-table">
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Date</th>
                <th>Particulars</th>
                <th>Name</th>
                <th className="num">Credit</th>
                <th className="num">Debit</th>
                <th className="num">Balance</th>
                <th>Penalty</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((r) => (
                <tr key={r.sl_no} data-testid={`statement-ledger-row-${r.sl_no}`}>
                  <td>{r.sl_no}</td>
                  <td>{fmtDMY(r.date)}</td>
                  <td>{r.particulars}</td>
                  <td>{r.name}</td>
                  <td className="num">{Number(r.credit).toFixed(2)}</td>
                  <td className="num">{Number(r.debit).toFixed(2)}</td>
                  <td className="num" style={{ fontWeight: r.balance > 0 ? 700 : 400, color: r.balance > 0 ? "#b91c1c" : "#0f172a" }}>
                    {Number(r.balance).toFixed(2)}
                  </td>
                  <td
                    style={{
                      color: r.penalty === "Yes" ? "#0F5132" : "#b91c1c",
                      fontWeight: 700,
                    }}
                  >
                    {r.penalty}
                  </td>
                </tr>
              ))}
              {ledger_totals && (
                <tr data-testid="statement-ledger-totals" style={{ background: "#f1f5f9" }}>
                  <td colSpan={4} style={{ fontWeight: 700, textAlign: "right" }}>Total</td>
                  <td className="num" style={{ fontWeight: 700 }}>
                    {Number(ledger_totals.credit).toFixed(2)}
                  </td>
                  <td className="num" style={{ fontWeight: 700 }}>
                    {Number(ledger_totals.debit).toFixed(2)}
                  </td>
                  <td className="num" style={{ fontWeight: 700, color: "#b91c1c" }}>
                    {Number(ledger_totals.balance).toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </LedgerTable>
        )}
      </WideCard>

      <Card>
        <Row>
          <strong>Total collections received (1 year)</strong>
          <Chip data-testid="statement-total-amount">{fmt(totals.amount)}</Chip>
        </Row>
        <Row>
          <span>Number of payments</span>
          <span data-testid="statement-total-count">{totals.count}</span>
        </Row>
        {(totals.interest ?? 0) > 0 && (
          <Row>
            <span>Interest paid</span>
            <span data-testid="statement-total-interest">{fmt(totals.interest)}</span>
          </Row>
        )}
        {(totals.penalty ?? 0) > 0 && (
          <Row>
            <span>Penalty paid</span>
            <span
              data-testid="statement-total-penalty"
              style={{ color: "#b91c1c", fontWeight: 700 }}
            >
              {fmt(totals.penalty)}
            </span>
          </Row>
        )}
      </Card>

      <Card>
        <Title style={{ fontSize: 16 }}>Pending dues</Title>
        {Object.keys(pending_dues).filter((k) => k !== "Total").length === 0 ? (
          <Muted style={{ marginTop: 12 }} data-testid="statement-no-pending">
            No pending dues.
          </Muted>
        ) : (
          <div style={{ marginTop: 8 }} data-testid="statement-pending-list">
            {Object.entries(pending_dues).map(([k, v]) =>
              k === "Total" ? null : (
                <Row key={k}>
                  <span>{k}</span>
                  <span>{fmt(v)}</span>
                </Row>
              )
            )}
            <Row>
              <strong>Total pending</strong>
              <Chip
                data-testid="statement-pending-total"
                style={{ background: "#fef3c7", color: "#92400e" }}
              >
                {fmt(pending_dues.Total)}
              </Chip>
            </Row>
          </div>
        )}
      </Card>
    </Wrap>
  );
};

export default PublicMemberStatement;
