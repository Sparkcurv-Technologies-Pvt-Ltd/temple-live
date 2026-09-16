import { useCallback, useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import axios from "axios";
import { Button } from "@components/form";

// Collection categories that share a per-interest-loan statement instead of
// the per-Member one. These typically carry a NULL `member` FK but a valid
// `interest` FK, so we resolve them via the borrower's interest record.
const INTEREST_CATEGORIES = new Set(["Chit Interest", "Management Interest"]);

const API_BASE =
  import.meta.env?.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || "";

/**
 * Resolve the origin (scheme + host) of the API when API_BASE is empty.
 * On production EC2 the frontend and backend are usually served from the
 * same host, so `window.location.origin` is the correct fallback. This
 * guarantees the WhatsApp link is always an absolute URL — never a bare
 * `/api/...` path that the recipient's phone can't open.
 */
const resolveApiBase = (override) => {
  const candidate = (override || API_BASE || "").trim();
  if (candidate && /^https?:\/\//i.test(candidate)) {
    return candidate.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return candidate.replace(/\/$/, "");
};

// No row cap — the customer sees the full 1-year ledger. Very large tables
// may hit browser URL-length limits (~8 KB); if that ever happens the fetch
// will still open WhatsApp, just truncated by the OS/browser.

const buildMemberStatementLink = (token, memberId, receipt, apiBase, category) => {
  // Direct-PDF URL — clicking the WhatsApp link opens the PDF file straight
  // in the browser / mobile viewer. No portal login, no HTML page, no JS —
  // just a `Content-Type: application/pdf` response from the backend.
  //
  // `category` scopes the balance sheet to the payment category that just
  // happened (Sub Tariff / Festival / Death / Marriage). Each category
  // shares its own dedicated PDF.
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (receipt) {
    if (receipt.no) params.set("receipt_no", receipt.no);
    if (receipt.amt) params.set("receipt_amt", receipt.amt);
    if (receipt.date) params.set("receipt_date", receipt.date);
    if (receipt.purpose) params.set("receipt_purpose", receipt.purpose);
    if (receipt.mode) params.set("receipt_mode", receipt.mode);
  }
  const qs = params.toString();
  const base = resolveApiBase(apiBase);
  return `${base}/api/collection/public/member_statement_pdf/${token}/${qs ? `?${qs}` : ""}`;
};

const buildInterestStatementLink = (token, interestType, interestId, receipt, apiBase) => {
  // Direct-PDF URL for interest borrowers (same rationale as above).
  const params = new URLSearchParams();
  if (receipt) {
    if (receipt.no) params.set("receipt_no", receipt.no);
    if (receipt.amt) params.set("receipt_amt", receipt.amt);
    if (receipt.date) params.set("receipt_date", receipt.date);
    if (receipt.purpose) params.set("receipt_purpose", receipt.purpose);
    if (receipt.mode) params.set("receipt_mode", receipt.mode);
  }
  const qs = params.toString();
  const base = resolveApiBase(apiBase);
  return `${base}/api/collection/public/interest_statement_pdf/${token}/${qs ? `?${qs}` : ""}`;
};

const pad = (s, n) => {
  const t = String(s ?? "");
  return t.length >= n ? t.slice(0, n) : t + " ".repeat(n - t.length);
};

const padRight = (s, n) => {
  const t = String(s ?? "");
  return t.length >= n ? t.slice(0, n) : " ".repeat(n - t.length) + t;
};

const fmtAmt = (n) => Number(n || 0).toFixed(2);

// Build the accounting-style ledger table (Sl | Date | Particulars | Name |
// Credit | Debit | Balance | Penalty) for the WhatsApp message body. This
// matches the on-page table format the customer sees on the public page.
const buildLedgerTable = (ledger) => {
  if (!ledger || ledger.length === 0) {
    return "```\nNo bill entries in the last 12 months.\n```";
  }
  const header =
    `${pad("#", 3)}| ${pad("Date", 10)}| ${pad("Particulars", 14)}| ${pad("Name", 12)}| ${padRight("Credit", 8)}| ${padRight("Debit", 8)}| ${padRight("Balance", 9)}| ${pad("Pen", 3)}`;
  const sep = "-".repeat(header.length);
  const lines = ledger.map((r) => {
    const dateShort = (r.date || "-").split("-").reverse().join("/");
    return (
      `${pad(String(r.sl_no), 3)}| ${pad(dateShort, 10)}| ${pad((r.particulars || "-").slice(0, 14), 14)}| ` +
      `${pad((r.name || "-").slice(0, 12), 12)}| ${padRight(fmtAmt(r.credit), 8)}| ` +
      `${padRight(fmtAmt(r.debit), 8)}| ${padRight(fmtAmt(r.balance), 9)}| ${pad(r.penalty || "-", 3)}`
    );
  });
  return "```\n" + header + "\n" + sep + "\n" + lines.join("\n") + "\n```";
};

// Build a fixed-width text table (rendered as ```code block``` in WhatsApp so
// columns stay aligned on the recipient's phone). Used for INTEREST loans
// where the ledger isn't per-bill; falls back to the payment history table.
const buildTable = (rows, isInterest) => {
  if (!rows || rows.length === 0) {
    return "```\nNo payments recorded in the last 12 months.\n```";
  }
  const header = `${pad("Date", 10)} | ${pad("Category", 14)} | ${padRight("Amt", 9)} | ${padRight("Pen", 8)} | ${padRight("Running", 10)}`;
  const sep = "-".repeat(header.length);
  const lines = rows.map((c) => {
    const cat = isInterest
      ? c.category === "Management Interest"
        ? "Mgmt Interest"
        : "Chit Interest"
      : c.category || "-";
    return `${pad(c.date || "-", 10)} | ${pad(cat, 14)} | ${padRight(fmtAmt(c.amount), 9)} | ${padRight(fmtAmt(c.penalty_amount), 8)} | ${padRight(fmtAmt(c.running_total), 10)}`;
  });
  return "```\n" + header + "\n" + sep + "\n" + lines.join("\n") + "\n```";
};

const buildMessage = ({
  name,
  paidAmt,
  payDate,
  templeName,
  link,
  purpose,
  collectionNo,
  paymentMode,
  baseAmt,
  interestAmt,
  penaltyAmt,
  statement,
  isInterest,
}) => {
  // Composite "Share Statement" WhatsApp message = receipt + 1-year
  // statement summary + pending amount + link to the customer's Balance
  // Sheet page. Sent from Collection History → Print → Share Statement.

  // ---- Receipt block --------------------------------------------------
  const purposeLine = purpose ? ` for ${purpose}` : "";
  const modeLine = paymentMode ? ` (${paymentMode})` : "";
  const refLine = collectionNo ? `\nReceipt #: ${collectionNo}` : "";
  const receiptLines = [
    `*Payment Receipt*`,
    ``,
    `Dear ${name},`,
    `Thanks for your payment of \u20B9${paidAmt}${purposeLine} on ${payDate}${modeLine}.` +
      refLine,
  ];
  const showBreakdown =
    (Number(interestAmt) || 0) > 0 || (Number(penaltyAmt) || 0) > 0;
  const breakdownLines = showBreakdown
    ? [
        ``,
        `Breakdown:`,
        `- Amount: \u20B9${fmtAmt(baseAmt)}`,
        Number(interestAmt) > 0 ? `- Interest: \u20B9${fmtAmt(interestAmt)}` : null,
        Number(penaltyAmt) > 0 ? `- Fine: \u20B9${fmtAmt(penaltyAmt)}` : null,
      ].filter(Boolean)
    : [];

  // ---- 1-year statement summary --------------------------------------
  const t = statement?.totals || {};
  const statementLines = [
    ``,
    `*1-Year Statement*`,
    `Total Received: \u20B9${fmtAmt(t.amount)} (${t.count || 0} payments)`,
  ];

  // ---- Pending amount -------------------------------------------------
  const pendingLines = [];
  if (isInterest && statement?.outstanding) {
    const outs = statement.outstanding;
    const totalOutstanding =
      Number(outs.balance_amt || 0) + Number(outs.penalty_balance_amt || 0);
    if (totalOutstanding > 0) {
      pendingLines.push(
        `Pending: \u20B9${fmtAmt(totalOutstanding)} ` +
          `(Principal \u20B9${fmtAmt(outs.principal_balance)} + ` +
          `Penalty \u20B9${fmtAmt(outs.penalty_balance_amt)})`
      );
    }
  } else if (!isInterest && statement?.pending_dues?.Total !== undefined) {
    const pendingTotal = Number(statement.pending_dues.Total || 0);
    if (pendingTotal > 0) {
      pendingLines.push(`Pending Amount: \u20B9${fmtAmt(pendingTotal)}`);
    }
  }

  return [
    ...receiptLines,
    ...breakdownLines,
    ...statementLines,
    ...pendingLines,
    ``,
    `View full balance sheet: ${link}`,
    ``,
    `— ${templeName || "our Temple"}`,
  ].join("\n");
};

/**
 * Compose a concise payment-receipt WhatsApp message (TC_COLLECTION_001).
 * No balance sheet, no ledger totals, no public link — just:
 *   thank-you · amount · date · purpose · fine / interest breakdown ·
 *   temple sign-off.
 *
 * QA Bug 5/6 — Fine amount is now surfaced in the receipt whenever a
 * penalty (or interest) is charged so the payer can see the split.
 */
const buildReceiptMessage = ({
  name,
  paidAmt,
  payDate,
  templeName,
  purpose,
  collectionNo,
  paymentMode,
  interestAmt,
  penaltyAmt,
  baseAmt,
}) => {
  const purposeLine = purpose ? ` for ${purpose}` : "";
  const modeLine = paymentMode ? ` (${paymentMode})` : "";
  const refLine = collectionNo ? `\nReceipt #: ${collectionNo}` : "";
  const showBreakdown =
    (Number(interestAmt) || 0) > 0 || (Number(penaltyAmt) || 0) > 0;
  const breakdownLines = showBreakdown
    ? [
        ``,
        `Breakdown:`,
        `- Amount: \u20B9${fmtAmt(baseAmt)}`,
        Number(interestAmt) > 0 ? `- Interest: \u20B9${fmtAmt(interestAmt)}` : null,
        Number(penaltyAmt) > 0 ? `- Fine: \u20B9${fmtAmt(penaltyAmt)}` : null,
      ].filter(Boolean)
    : [];
  return [
    `*Payment Receipt*`,
    ``,
    `Dear ${name},`,
    `Thanks for your payment of \u20B9${paidAmt}${purposeLine} on ${payDate}${modeLine}.` +
      refLine,
    ...breakdownLines,
    ``,
    `— ${templeName || "our Temple"}`,
  ].join("\n");
};

/**
 * "Share Statement" WhatsApp button.
 * - For regular collections: opens the per-Member 1-year statement.
 * - For Management/Chit Interest: opens the per-loan statement.
 * - Message body includes an aligned monospace ledger table (```code```
 *   block) so the recipient sees the balance-sheet directly in chat.
 *
 * Props:
 *   CollectionRecord – the just-saved collection row
 *   templeName        – for the sign-off
 *   autoTrigger       – when true, invokes send() automatically on mount
 *                       (used by Bill after a new collection is added)
 *   receiptOnly       – when true, sends a concise payment-receipt (no
 *                       ledger / no public link). Used from Bill after
 *                       adding a collection so the operator's WhatsApp
 *                       message is a clean receipt (TC_COLLECTION_001).
 *                       Balance-sheet share stays on the Family Details
 *                       → Balance Sheet page.
 */
const WhatsappStatementButton = ({
  CollectionRecord,
  templeName,
  autoTrigger = false,
  receiptOnly = false,
}) => {
  const [loading, setLoading] = useState(false);
  const firedRef = useRef(false);

  const category = CollectionRecord?.collection_category;
  const memberId = CollectionRecord?.member;
  const interestId = CollectionRecord?.interest;
  const isInterest = INTEREST_CATEGORIES.has(category);

  const rawMobile =
    CollectionRecord?.mobile_number || CollectionRecord?.mobile_no || "";

  const canSend = receiptOnly
    ? !!rawMobile && category !== "Chit-fund"
    : category !== "Chit-fund" &&
      ((isInterest && interestId) || (!isInterest && memberId));

  const amount = parseFloat(CollectionRecord?.amount) || 0;
  const interestAmount = parseFloat(CollectionRecord?.interst_amount) || 0;
  const penaltyAmount = parseFloat(CollectionRecord?.penalty_amount) || 0;
  const paidAmt = isInterest ? amount + interestAmount + penaltyAmount : amount;

  const send = useCallback(async () => {
    if (loading || !canSend) return;
    setLoading(true);
    try {
      // Receipt-only fast path (TC_COLLECTION_001): no server round-trip,
      // no ledger, no public link. Just a clean thank-you message with the
      // purpose (festival / subscription month / etc.).
      if (receiptOnly) {
        const phone = String(rawMobile || "").replace(/\D/g, "");
        const waNumber = phone.length === 10 ? `91${phone}` : phone;
        if (waNumber.length < 10) {
          alert(
            "No mobile number is saved for this record. Please update the profile and try again."
          );
          return;
        }
        const purpose =
          CollectionRecord?.festival_name ||
          CollectionRecord?.sub_tariff_name ||
          CollectionRecord?.marriage_name ||
          CollectionRecord?.death_name ||
          CollectionRecord?.collection_category ||
          "";
        const msg = buildReceiptMessage({
          name: CollectionRecord?.member_name || "Customer",
          paidAmt: fmtAmt(paidAmt),
          payDate: CollectionRecord?.pay_date,
          templeName,
          purpose,
          collectionNo: CollectionRecord?.collaction_no,
          paymentMode: CollectionRecord?.payment_mode,
          interestAmt: interestAmount,
          penaltyAmt: penaltyAmount,
          baseAmt: amount,
        });
        const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }

      let link;
      let fallbackName;
      let fallbackMobile;
      let statement = null;
      if (isInterest) {
        const { data: tokenResp } = await axios.get(
          `${API_BASE}/api/collection/interest_statement/token/${interestId}/`
        );
        const purpose =
          CollectionRecord?.festival_name ||
          CollectionRecord?.sub_tariff_name ||
          CollectionRecord?.marriage_name ||
          CollectionRecord?.death_name ||
          CollectionRecord?.collection_category ||
          "";
        link = buildInterestStatementLink(tokenResp.token, category, interestId, {
          no: CollectionRecord?.collaction_no || "",
          amt: fmtAmt(paidAmt),
          date: CollectionRecord?.pay_date || "",
          purpose,
          mode: CollectionRecord?.payment_mode || "",
        });
        fallbackName = tokenResp.name;
        fallbackMobile = tokenResp.mobile;
        try {
          const { data: stmt } = await axios.get(
            `${API_BASE}/api/collection/public/interest_statement/${tokenResp.token}/`
          );
          statement = stmt;
        } catch (_) { /* statement optional */ }
      } else {
        const { data: tokenResp } = await axios.get(
          `${API_BASE}/api/collection/member_statement/token/${memberId}/`
        );
        // Bundle the current receipt details into the URL so the landing
        // page can render Receipt + Balance Sheet in one PDF.
        const purpose =
          CollectionRecord?.festival_name ||
          CollectionRecord?.sub_tariff_name ||
          CollectionRecord?.marriage_name ||
          CollectionRecord?.death_name ||
          CollectionRecord?.collection_category ||
          "";
        link = buildMemberStatementLink(
          tokenResp.token,
          memberId,
          {
            no: CollectionRecord?.collaction_no || "",
            amt: fmtAmt(paidAmt),
            date: CollectionRecord?.pay_date || "",
            purpose,
            mode: CollectionRecord?.payment_mode || "",
          },
          undefined,
          category,
        );
        fallbackName = tokenResp.name;
        fallbackMobile = tokenResp.mobile;
        try {
          const { data: stmt } = await axios.get(
            `${API_BASE}/api/collection/public/member_statement/${tokenResp.token}/`
          );
          statement = stmt;
        } catch (_) { /* statement optional */ }
      }
      const phone = String(rawMobile || fallbackMobile || "").replace(/\D/g, "");
      const waNumber = phone.length === 10 ? `91${phone}` : phone;
      if (waNumber.length < 10) {
        alert(
          "No mobile number is saved for this record. Please update the profile and try again."
        );
        return;
      }
      const name =
        CollectionRecord?.member_name || fallbackName || "Customer";
      const purpose =
        CollectionRecord?.festival_name ||
        CollectionRecord?.sub_tariff_name ||
        CollectionRecord?.marriage_name ||
        CollectionRecord?.death_name ||
        CollectionRecord?.collection_category ||
        "";
      const msg = buildMessage({
        name,
        paidAmt: fmtAmt(paidAmt),
        payDate: CollectionRecord?.pay_date,
        templeName,
        link,
        purpose,
        collectionNo: CollectionRecord?.collaction_no,
        paymentMode: CollectionRecord?.payment_mode,
        baseAmt: amount,
        interestAmt: interestAmount,
        penaltyAmt: penaltyAmount,
        statement,
        isInterest,
      });
      const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      alert("Could not generate the statement link. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    canSend,
    receiptOnly,
    isInterest,
    interestId,
    memberId,
    rawMobile,
    CollectionRecord?.member_name,
    CollectionRecord?.pay_date,
    CollectionRecord?.festival_name,
    CollectionRecord?.sub_tariff_name,
    CollectionRecord?.marriage_name,
    CollectionRecord?.death_name,
    CollectionRecord?.collection_category,
    CollectionRecord?.collaction_no,
    CollectionRecord?.payment_mode,
    paidAmt,
    templeName,
  ]);

  // Auto-trigger once when Bill mounts after a new collection is added.
  useEffect(() => {
    if (!autoTrigger || firedRef.current || !canSend) return;
    firedRef.current = true;
    const t = setTimeout(() => {
      send();
    }, 1200);
    return () => clearTimeout(t);
  }, [autoTrigger, canSend]);

  if (!canSend) return null;

  return (
    <Button.Primary
      text={
        loading ? (
          "Sending..."
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <FaWhatsapp style={{ fontSize: "22px" }} />
            {receiptOnly ? "Share Receipt" : "Share Statement"}
          </span>
        )
      }
      onClick={send}
      data-testid={receiptOnly ? "collection-whatsapp-receipt-btn" : "collection-whatsapp-btn"}
    />
  );
};

export default WhatsappStatementButton;
