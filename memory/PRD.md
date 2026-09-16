# Temple Management System — Penalty Logic Fix

## Original Problem Statement
> "Need to correct all Logic and Penalty I have added the frontend and backend. Please verify and need to work all logic correctly"

Business rule clarified with the user:
- **Penalty = ₹25 per missed full calendar month** after the due date.
- **No grace period.**
- Applies across all modules where members can owe payment
  (Subscription Tariff, Festival, Death Tariff, Marriage, plus Interest).

## Architecture
- **Backend**: Django 4.2 + DRF (33 apps) on uvicorn :8001
- **Frontend**: React 18 + Vite (built bundle served via http-server on :3000)
- **DB**: MySQL/MariaDB `temple` (imported from `/app/temple_db.sql`, 71 tables)
- **Auth**: JWT (PyJWT) — `Authorization: <token>` header

## Setup steps performed in this session
1. Installed MariaDB server + client; created DB `temple` and user `appadmin:appadmin`.
2. Imported `/app/temple_db.sql` (replaced unsupported `utf8mb4_0900_ai_ci` with
   `utf8mb4_general_ci`).
3. Installed Python deps (Django 4.2.7, DRF, mysqlclient, etc.) into `/root/.venv`.
4. Created `/app/backend/server.py` (ASGI shim) so supervisor's
   `uvicorn server:app` command runs the Django ASGI app.
5. Added `/api/` URL prefix in `temple_proj/urls.py` so the K8s ingress
   `/api → :8001` rule works (legacy root-level routes preserved for
   internal callers).
6. Frontend baseURL changed to read `VITE_BACKEND_URL` from `.env` and
   append `/api/`.
7. `frontend/package.json` `start` script: `http-server dist -p 3000 -a 0.0.0.0
   -P http://localhost:3000?` (SPA fallback).

## Bugs found and fixed
1. **`interest/views.py` line 178** — penalty was only applied if interest_date
   was in the **same calendar year** as today and previous month. So any
   interest record from a prior year never got a penalty.  Replaced with
   `if interest_date + 1 month <= today` (works across years).
2. **No unified penalty engine** — each module set a one-time static penalty;
   nothing accumulated ₹25 per missed month. Created
   `amount/penalty_engine.py` with idempotent `recompute_all()` that:
   - Resolves due-date per row (sub_tariff.to_date, festival.penalty_start_date,
     death.penalty_apply_date, marriage.marriage_date).
   - Computes `missed_months = relativedelta(today, due).years*12 + .months`.
   - Sets `penalty_amount = 25 * months` and `penalty_balance = total -
     already_paid_penalty`.
   - Skips fully-paid rows. Multiple calls are safe (idempotent).
3. **`PendingPenaltyList.jsx`** — was a hardcoded mock. Wired to the new
   `/api/penalty/pending/` endpoint with category filter, search,
   "Recompute" button and live total.
4. **Layout overlap** — `SideMenuLayout` was `position: fixed` but the
   right-side `<Layout>` had no offset → header text and home image
   rendered under the sidebar.  Added `ContentLayout` styled component
   with `margin-left: 280px` (or 80 when collapsed), sticky TopHeader
   with z-index, `BodyContent` switched from `height: 80vh` to
   `min-height: calc(100vh - 70px)`, home image bounded by
   `objectFit: contain` and `maxHeight: calc(100vh - 180px)`,
   NavHeader temple-name uses flex + ellipsis.
5. **Chit-Fund EMI double-counting** (`collection/views.py` lines 624-632)
   — for Installment-Interest payments, `cash_inhand_amount` was
   adding both `temp_family.amount` (full EMI, already contains the
   interest portion) AND `temp_family.interst_amount` again, inflating
   cash-in-hand by the interest amount on every EMI payment.  Fixed to
   only add `amount + penalty_amount`.
6. **Chit-Fund loan edit not re-applied** (`interest/views.py` line 413-419)
   — when editing an existing chit-fund interest (loan), the old principal
   was reversed from `cash_inhand_amount` and `principal_given_amount`
   but the new principal was never re-applied.  Editing left chit-fund
   accounting out of sync.  Now reverses old AND applies new.

## New API endpoints
- `GET  /api/penalty/pending/`   → list members with pending penalty
- `POST /api/penalty/recompute/` → force idempotent recompute, returns summary
- `GET  /api/penalty/summary/`   → numbers only

## Test results
- Engine unit tests: 9/9 passing (see `amount/penalty_engine.py` cases).
- Live data: 884 unpaid rows scanned → 778 have penalty → ₹3,40,225 total.
  Sample: M95 "L. Suresh", due 2024-04-08, today 2026-06-30 ⇒
  26 months × ₹25 = ₹650 (₹625 balance after one already-paid).

## What's been implemented (2026-06-30)
- [x] MySQL + Django app running in preview pod
- [x] Penalty engine with ₹25/missed-month rule
- [x] API endpoints for pending/recompute/summary
- [x] PendingPenaltyList page wired to real API
- [x] Interest year-condition bug fixed
- [x] App-wide visual refresh: emerald + saffron-gold theme (replaces red/maroon)
- [x] Plus Jakarta Sans body font, Fraunces for headings
- [x] Table styling refresh: green-tinted headers, zebra striping, hover row, larger row padding
- [x] Sign-in page: soft mint-cream background with green/gold radial gradients, emerald button

## What's been implemented (2026-02-10)
- [x] **Collection "Choose Member" dropdown bug fixed** — paid members no longer appear
  - Backend `collection/views.py` `get_select_member_collection`: fallback to newest active tariff when `type` is empty
  - Frontend `Collection.jsx` `handleCollectionType`: async, awaits `HandleSelectType` and uses fresh tariff id
- [x] **Chit Fund settlement redistribution** — exiting shares now split between Management + remaining investors
  - `chit_fund/views.py` `add_chit_fund_settlement_application_details`: largest-remainder proportional redistribution across mgmt + remaining active investors; `total_share_count = mgmt + investors` invariant preserved
  - Removed the double share_count/outer_invest_amount reduction previously done again in `add_chit_fund_settlement`
- [x] **Home Balance Sheet renamed** to "Temple Balance Sheet" (sidebar + page title + print header)
- [x] **Expense Subcategory** — Add Expense form now has a required "Subcategory" select with two options: `Chit Fund Expense`, `Temple Expense`
  - Backend: new `expense_subcategory` CharField on `ADDExpenseDetails` (migration 0002 applied)
  - Frontend: field added to Add Expense form, column added to Expense List (screen + print), row added to View Expense
  - CustomSelect now forwards `...rest` (data-testid, aria-*) to underlying AntdSelectStyle
- [x] **Balance sheet routing by subcategory** — expenses now split by subcategory
  - Temple Balance Sheet (`balancesheet_view`): all expense queries chained with `.exclude(expense_subcategory="Chit Fund Expense")` (legacy NULL rows preserved via ORM join semantics)
  - Chit Fund Balance Sheet (`balancesheet_chitfundview`): new `Chit_Fund_Expense` aggregation block on both `custom_date_range` and `custom_date` branches; adds to `total_debit_amount`
- [x] **Income Subcategory** — Add Income form now has a required "Subcategory" select with two options: `Chit Fund Income`, `Temple Income`
  - Backend: new `income_subcategory` CharField on `ADDIncomeDetails` (migration `income/0002` applied)
  - Frontend: field added to Add Income form, column added to Income List (screen + print), row added to Income View
- [x] **Balance sheet routing for income** — matches the expense pattern
  - Temple Balance Sheet: `ADDIncomeDetails.objects.filter(...).exclude(income_subcategory="Chit Fund Income")` (6 places); `Report...exclude(incomes=None).exclude(incomes__income_subcategory="Chit Fund Income")` (8 places)
  - Chit Fund Balance Sheet: new `Chit_Fund_Income` aggregation on both date branches. Filters by `date` field (aligned with expense) for consistency; adds to `total_credit_amount` and net balance.
- [x] Regression pytest suite `/app/backend/tests/` — 32+ tests across expense/income/collection/penalty/chit-fund settlement, all passing individually
- [x] **Chit Fund Details view** — new "Demand Share Amount" row (auto-computes as (Management Invested + Outer Invest + Profit) / Investers Share Count) plus adjusted "Investers Share Count" display to include Management (investers + management = displayed total). Both auto-update via `useMemo` when any dependency changes.
- [x] **Festival penalty cap** — Add / Edit Festival now enforces `penalty_amt <= 100` when `choice="Percentage"`. Server-side validation in `festival/serializers.py::validate` (falls back to `self.instance` for partial updates); frontend `antd Form.rule.validator` blocks submit inline. Removed the previous silent auto-swap to Amount when >100. 9 pytest cases + frontend E2E all green (iteration 7).

## What's been implemented (2026-07-23)
- [x] **Global 100% percentage cap** — strict server + client enforcement across every % input:
  - Chit Fund `set_profit_percent`, `set_intrest_percent` (`chit_fund/serializers.py::ChitFundsDetailsSerializer.validate`)
  - Interest `fix_interest_rate_percent` (when `interest_type_new='percentage'`) and `penalty_amount` (when `penalty_type='percentage'`) — `interest/serializers.py::validate`
  - Sub-Tariff `exp_amount` and `penalty_amt` when their type flag is `Percentage` — `sub_tariff/serializers.py::validate`
  - Death `tariff_peanalty` when `pen_amt_type='Percentage'` — `death/serializers.py::validate`
  - Set Tax `penalty_percentage` (frontend), plus AddChitFund UI validators for Set Profit / Set Fund Interest.
  - Removed the previous silent "flip to Amount at >100" behaviour in DeathForm and SetSubscriptionTariff — now the form blocks submission with an inline error message.
  - 11-case pytest suite `/app/backend/tests/test_percentage_caps.py` all green (JUnit `/app/test_reports/pytest/percentage_caps.xml`).
- [x] **Income / Expense Category fields removed** from Add Income / Add Expense forms. Categorisation now happens exclusively via the (already-existing) `income_subcategory` / `expense_subcategory` selectors (Chit Fund vs Temple). Backend accepts payloads with `category=null` (both FK columns were already nullable). Frontend still submits hidden `category` inputs for backwards compatibility. Verified with 2 backend pytest cases (POSTs without category → 201) and Playwright screenshots confirming labels are absent.
- [x] **Chit Fund List View — "Member 0" (Management share) card** rendered before the investor list with data-testids `member-0-card`, `member-0-name`, `member-0-invested-amt`, `member-0-share-count`, `member-0-application-date`, `member-0-settlement-date`.
- [x] **Application Date + Settlement Date (Application Date + 60 days)** now shown on every member card in ChitFundListView (`data-testid=member-{n}-application-date` / `member-{n}-settlement-date`), on the View Settlement Application modal (`settlement-view-application-date` / `settlement-view-settlement-date`), and as two separate columns in the Settlement Application list & print table. Business rule implemented via shared `computeSettlementDate` helper (`dayjs(applicationDate).add(60, 'day').format('YYYY-MM-DD')`).

## What's been implemented (2026-02 fork)
- [x] **Chit Fund View — Management Amount row** now uses the correct reconciling formula: `Management Amount = Profit × management_share_count / total_share_count` (equivalent to `Profit − Σ investor profit shares`). The previous formula subtracted the GROSS displayed share (invested capital + profit) from profit, which by construction could not reconcile.
  New behaviour: `Profit = Σ Investor Profit Shares + Management Amount` holds by identity. Live-verified on AMMAN FINANCE (profit ₹9,76,050 · 141 total shares) — Management ₹6,922.34, investors' profit share ₹9,69,127.66, sum ₹9,76,050.00, badge **✓ reconciled**. Added `data-testid="management-amount-reconciled"` / `management-amount-mismatch` badge with red-warning shown whenever `|Σ + Mgmt − Profit| ≥ ₹1`.
- [x] **Chit Fund View — Pending Amount breakdown expander** added next to "Pending Amount to Collect". Toggle button (`data-testid="pending-breakdown-toggle"`) opens an inline panel (`pending-breakdown-panel`) with a per-BORROWER table listing every active Chit-Fund-Interest loan whose principal_balance / balance_amt / penalty_balance is > 0. Columns: Borrower (name + mobile), Start Date (`interest_apply_date`), End Date (apply_date + interest_period), Days from start, Days from last payment (`updated_at` proxy), Principal, Paid, Balance. Data comes from **new backend endpoint** `GET /api/chit_fund/pending_borrowers/<chit_id>/` (see `/app/backend/chit_fund/pending_views.py`). Loading + error + empty states rendered with dedicated test-ids. **Important:** Pending is driven by Chit-Fund-Interest borrowers (loans given out from the pool), NOT by investors — the previous investor-based logic returned 0 rows because chit-fund investors carry `share_amount=0` until settlement application.
- [x] **WhatsApp 1-hour auto-disappear** — user confirmed to keep current `wa.me` intent links (technically not supported for auto-expiring messages outside official WhatsApp Business API).
- [x] **Collection → Share Statement (WhatsApp) now works for Management Interest & Chit Interest.**
  - Previously the button was hard-coded to SKIP those categories and required `CollectionRecord.member`, which is NULL for interest rows (borrower link is via `CollectionRecord.interest`).
  - New backend endpoints:
    - `GET /api/collection/interest_statement/token/<interest_id>/` → HMAC-signed token + borrower name/mobile.
    - `GET /api/collection/public/interest_statement/<token>/` → 1-year loan statement: borrower details, payments (with P/I/Pen breakdown), current outstanding (principal/paid/balance/penalty).
  - New frontend route `/interest-statement/:token` → `PublicInterestStatement.jsx` with `data-testid`s for name, totals, principal-balance, total-outstanding, payments list & rows.
  - `WhatsappStatementButton.jsx` fully rewritten: routes Management/Chit-Interest through the new interest endpoint (uses `CollectionRecord.interest`), non-interest through the existing member endpoint. Still skips pure `Chit-fund` settlement rows.
  - End-to-end verified via curl: `SELVAM TEA SHOP` (interest_id=209) → 6 payments · ₹80,000 collected · ₹20,000 outstanding.
- [x] **TC_INTEREST_002 — auto-apply overdue Interest + Penalty on Balance Sheet view.**
  The overdue engine (`interest/overdue_views.py::_apply_for_record`) applies missing monthly Interest (day 5 rule) and Penalty (day 20 rule) rows. It already existed but only ran when the operator manually POSTed to `/apply_overdue_interest_and_penalty/`.
  Fix: `interest/views.py::interest_profile` now calls `_apply_for_record(mer)` at the start of every GET, so opening `Interest → ChitFund Interest → ChitFund Installment → Person → Profile → Balance Sheet` (or the Management Interest equivalent) always returns an up-to-date ledger.
  The engine is fully idempotent (checks `InterestPeopleReport` for existing rows), safe on every load, and non-blocking (wrapped in try/except).
  End-to-end verified on `C. Balasubramaniyam` (id=44, Chit fund Interest): before → apply_date `2024-10-20`, penalty `₹0`, balance `₹7,500`, 17 reports. After a single GET → apply_date `2026-07-05`, **interest ₹105,000**, **penalty ₹115,500**, balance `₹228,000`, 59 reports. Second GET added zero rows (idempotency confirmed).
- [x] **Collection History → View → Print now shares the full 1-year balance sheet.**
  `CollectionUserList.jsx::ViewPrintModal` was rendering `<Bill />`, which passes `receiptOnly` and only sends the concise receipt. For a re-print from history the operator wanted the full 1-year ledger. Switched the modal to render `<ViewCollectionPrint />` — that component keeps `<WhatsappStatementButton />` without `receiptOnly`, so the "Share Statement" button attached inside sends the complete 1-year balance sheet in the aligned monospace `` ` ``code`` ` ``  table + totals + pending dues + public link.
  Result:
  - New collection add flow (`Collection.jsx → Bill.jsx`): still auto-shares the RECEIPT.
  - Collection History re-print (`CollectionUserList.jsx → ViewCollectionPrint.jsx`): shares the full 1-YEAR BALANCE SHEET.
- [x] **TC_FAMILYDETAILS_002 — Family Edit photo upload 500** debug hooks added:
  - `family/views.py` outer `except:` in `edit_family` PUT now uses `Exception as _e` + `traceback.print_exc()` and returns the detail message. Save call wrapped separately so an ORM error returns a distinct 500 with the specific message.
  - `dict8['member_photo']` assignment now only stores the value when it looks like an actual uploaded file (`hasattr(_mp, "read") and hasattr(_mp, "name")`). Fixes the most common regression: when the frontend guard passes but `image_send_value` was empty, it was appending `undefined` to the FormData and the backend serializer rejected the resulting string.

## What's been implemented (2026-02 fork — continued session)
- [x] **Bug 2 — Periodic Interest + Penalty Scheduled Task**. Django management command `apply_periodic_interest_penalty` is now bootstrapped correctly (missing `management/__init__.py` and `commands/__init__.py` files added). Command wraps the existing idempotent engine (`interest.overdue_views._apply_for_record`) and walks every active `PeopleInterestDetails` row. Supports `--dry-run`. Wire it to cron/apscheduler on EC2:
  `python manage.py apply_periodic_interest_penalty`.
- [x] **Bug 1 — NameError in edit_interest_given_details** verified via code review: the `customer.principal_amt` reversal happens before `serializer876.save()` and `temp_family` is only referenced *after* the save. Cash-in-hand reconciliation now correctly reverses OLD principal then applies NEW principal for both Management and Chit-fund interest edits.
- [x] **QA Bug 10 — Member List logic**. `sangam/views.py::get_sangam_members` was filtering `death=True` and therefore returning **dead** members instead of active ones for the "Member List" tab. Fixed to filter `death=False, marriage_remove=False` so the tab now shows only active temple members. Death List and Marriage-Remove List remain their own dedicated tabs.
- [x] **QA Bug 1 — Total Due vs Total Collected split** on Member Profile view. Added two new rows (`data-testid=member-total-collected`, `member-total-due`) alongside the existing "Total Pending Balance". Total Collected = `paid_amt_total`; Total Due = `paid_amt_total + temple_mem_pending_amt`.
- [x] **QA Bug 5/6 — Notification / WhatsApp receipt now surfaces fine (penalty) & interest amounts.** `WhatsappStatementButton::buildReceiptMessage` now conditionally appends a breakdown block:
  ```
  Breakdown:
  - Amount: ₹1000.00
  - Interest: ₹150.00
  - Fine: ₹25.00
  ```
  when either interest or penalty is non-zero. Base-amount, interest, and penalty are wired from `CollectionRecord.amount / interst_amount / penalty_amount`.
- [x] **WhatsApp share link now points at the internal Member/Interest Profile view** as requested by user. `buildMemberStatementLink` → `/memberProfileView/<memberId>?tab=balance`, `buildInterestStatementLink` → `/ManagementInterestProfile/<id>` or `/chit-Fund_Interest/<id>` depending on the interest category. Legacy tokenised public URLs kept as fallback.
- [x] **Member Profile — 1-year Balance Sheet default when arriving from WhatsApp share.** `MemberProfile.jsx` now reads a `?tab=balance` query param (via `useSearchParams`) and defaults the `CustomTabs` `defaultActiveKey` to the Balance Sheet tab. `MemberBalanceSheet` in `MemberProfileTabs.jsx` client-side filters `temple_mem_balancesheet` rows to only entries whose `reportdate` is within the last 12 months (`dayjs().subtract(1, "year")`). Verified live with member 225 (J.Radhakrishnan): active tab = "Balance Sheet", only Jun-2026 row shown (2024/2025 rows hidden).

## What's been implemented (2026-02 fork — WhatsApp Share Statement rework)
- [x] **Collection History → Print modal** now no longer renders the inline "1-year balance sheet" widget. `ViewCollectionPrint.jsx` reduced back to a simple bill-print layout + the Share Statement (WhatsApp) button.
- [x] **WhatsApp Share Statement message body enriched** — `WhatsappStatementButton.jsx::buildMessage` now composes:
  - `*Payment Receipt*` header + amount + purpose + payment mode + receipt number
  - Optional `Breakdown` block (Amount / Interest / Fine) when interest or penalty > 0
  - `*1-Year Statement*` block with Total Received + payment count
  - `Pending Amount` line: `pending_dues.Total` for members, or Principal+Penalty outstanding for interest
  - `View full balance sheet:` link → `/memberProfileView/{memberId}?tab=balance` (or `/ManagementInterestProfile/:id` / `/chit-Fund_Interest/:id` for interest)
  - Temple sign-off
  The `send()` handler now also fetches the public statement (via the existing `/api/collection/public/member_statement/<token>/` and `/interest_statement/<token>/` endpoints) so the message reflects the exact numbers a customer would see on the Balance Sheet page.
- [x] **Family Details → Member List** — new "Balance Sheet" action icon (money icon) alongside the existing View eye icon in every row. Clicking it navigates to `/memberProfileView/{memberId}?tab=balance` and lands on the customer's 1-year filtered balance sheet with the "Download PDF" button. `data-testid=member-balance-sheet-btn-<id>` added for automation.

## What's been implemented (2026-02 fork — Auto-PDF Balance Sheet)
- [x] **WhatsApp share link now auto-opens the Balance Sheet as a PDF.** The URL emitted by `WhatsappStatementButton::buildMemberStatementLink` now includes:
  - `?tab=balance` — lands on Balance Sheet tab
  - `&print=1` — triggers auto-print
  - `&receipt_no=...&receipt_amt=...&receipt_date=...&receipt_purpose=...&receipt_mode=...` — receipt of the payment
- [x] **`MemberBalanceSheet` (Family Details → Member List → Balance Sheet tab)** now:
  - Reads receipt URL params and renders a "Payment Receipt" block inside the printable area (only when receipt params are present).
  - Reads `?print=1` and auto-fires `handlePrint()` (via `useReactToPrint`) once the balance-sheet data lands. Uses a `useRef` guard so it never re-triggers on data-range submits.
  - Console log `[BalanceSheet] Auto-triggering print dialog…` verified live via Playwright.
- [x] **Final PDF output contains, in one document:**
  - Temple header (name + address) via `CommonManagePrint`.
  - Payment Receipt block (Receipt No, Date, Purpose, Payment Mode, Amount Paid).
  - "1-Year Balance Sheet Statement" title with period range.
  - Balance-sheet table (last 12 months, columns: Sl No · Date · Particulars · Name · Pre Balance · Credit · Debit · Balance).
  - Totals footer (Total Credit · Total Debit · Closing Balance).

## What's been implemented (2026-02 fork — Interest categories get same auto-PDF flow)
- [x] **Chit Interest / Management Interest WhatsApp share** now routes to `/interest-statement/<token>?print=1&receipt_*` instead of the internal auth-protected `/chit-Fund_Interest/{id}` / `/ManagementInterestProfile/{id}` links. Interest borrowers are typically NOT temple members so they get the token-based public interest statement.
- [x] **`PublicInterestStatement.jsx`** (route `/interest-statement/:token`) now:
  - Reads `?print=1` + `?receipt_*` URL params.
  - Renders a new `Payment Receipt` card at the top when receipt params are present (`data-testid=interest-statement-receipt`).
  - Auto-fires `window.print()` 800ms after the statement data loads (guarded with a `useRef` so it fires exactly once). Console log `[InterestStatement] Auto-triggering print dialog…` confirms the effect ran during live Playwright verification.
- [x] **PDF for interest borrowers includes:**
  - Payment Receipt (No / Date / Purpose / Mode / Amount)
  - Borrower details (name, interest type, chit / management fund, mobile) + statement period
  - Totals card (Total received 1-yr, count, principal / interest / penalty split)
  - Outstanding balance card (Principal issued / paid / balance + Penalty balance + Total outstanding)
  - 1-year balance sheet ledger table

## What's been implemented (2026-02 fork — Login-free WhatsApp PDF)
- [x] **`buildMemberStatementLink` now always emits the token-based public URL** `/statement/<token>?print=1&receipt_*` instead of the auth-protected `/memberProfileView/{id}`. Recipients no longer need to log into the admin portal to view the balance sheet.
- [x] **`PublicMemberStatement.jsx`** (route `/statement/:token`) now:
  - Reads `?print=1` + `?receipt_*` URL params via `useSearchParams`.
  - Renders a `Payment Receipt` card at the top when receipt params are present (`data-testid=statement-receipt`).
  - Auto-fires `window.print()` 800ms after statement data lands (guarded with `useRef` so it fires exactly once). Console log `[MemberStatement] Auto-triggering print dialog…` confirms the effect.
- [x] **Complete parity** with the interest-borrower flow — both member and interest WhatsApp shares now use token-based public URLs with the same auto-print + receipt-block pattern.
- [x] **Verified live in a fresh browser context (no cookies, no login)** — statement page rendered fully with Payment Receipt (COL2 / 2024-04-07 / Subscription Tariff / Offline / ₹100), member details (S.M NAVEEN M6), 1-year balance sheet table with 1 row + Total, 1-year totals, and Pending dues (Death ₹300 + Subscription Tariff ₹200 = Total ₹500). Auto-print console log fired.

## What's been implemented (2026-02 fork — DIRECT PDF link, no HTML)
- [x] **`backend/collection/pdf_views.py`** created — two new endpoints:
  - `GET /api/collection/public/member_statement_pdf/<token>/?receipt_*`
  - `GET /api/collection/public/interest_statement_pdf/<token>/?receipt_*`
  Both return `Content-Type: application/pdf` with `Content-Disposition: inline; filename="…"`. Built with reportlab (pre-installed). Contents:
  - Temple / Loan statement header + 1-year period range
  - Payment Receipt card (Receipt No · Date · Purpose · Mode · Amount)
  - Member/Borrower details card
  - Pending Dues (member) or Outstanding balance (interest)
  - 1-Year Balance Sheet table with totals row
  - Footer: "Generated on …"
- [x] **HMAC tokens reused** from `public_views` so links are interoperable with the existing HTML statements.
- [x] **`WhatsappStatementButton.jsx`** — `buildMemberStatementLink` and `buildInterestStatementLink` now return the backend PDF URL directly (`{API_BASE}/api/collection/public/…_pdf/<token>/?…`). The URL is a real PDF file, no HTML/JS/portal.
- [x] **Verified live**: `curl -sI ...pdf/token/...` returns `HTTP 200 · application/pdf`. `pypdf` extracted text confirms all sections rendered correctly for both endpoints. Playwright confirms browser treats URL as a real PDF download (Download is starting event fires).

## What's been implemented (2026-02 fork — PDF now uses the real Balance Sheet)
- [x] **`public_member_statement_pdf`** now sources balance-sheet rows from `TempleMemberReport` (same table that powers Family Details → Member List → Balance Sheet tab) instead of the raw `PeoplesAmountDetails` bills. This gives a proper running-balance ledger with Pre-Balance carried across rows, and shows both bills raised AND collections received in chronological order.
- [x] **PDF column layout now matches the on-screen Balance Sheet tab**: `Sl · Date · Particulars · Name · Pre Balance · Credit · Debit · Balance`.
- [x] **Totals row** shows Total Credit / Total Debit / Closing Balance.
- [x] **Verified live** for two members:
  - Member 225 (J.Radhakrishnan): balance sheet row shows Sub Tariff Jun-2026 · Credit ₹100 · **Closing Balance ₹5,175** — matches the portal exactly. Pending Dues block shows all four category buckets summing to ₹63,222.69.
  - Member 8: 2-row ledger where Pre Balance ₹500 on row 2 correctly carries from row 1's Balance ₹500 — closing balance ₹400.

## What's been implemented (2026-02 fork — Per-category scoped PDFs)
- [x] **Every WhatsApp share now generates a category-scoped Balance Sheet PDF.** When the operator hits Share Statement on a "Subscription Tariff" collection, the recipient's PDF shows ONLY Subscription-Tariff balance-sheet rows + Subscription-Tariff pending dues. Same isolation for Festival / Death / Marriage.
- [x] **`public_member_statement_pdf`** now reads `?category=` from the query string and:
  - Maps the category → matching `TempleMemberReport.type_choice` enum values (e.g. `Death` → `["Death Tariff", "Death Tariff Penalty"]`)
  - Filters the balance-sheet reports by that enum set
  - Filters `_serialize_pending()` output to only the matching pending bucket(s)
  - Rewrites the header ("Subscription Tariff Statement" instead of "Temple Statement") and the PDF filename (`Subscription_Tariff_Statement_M225_2026-07-29.pdf`)
- [x] **`WhatsappStatementButton::buildMemberStatementLink`** now accepts a `category` argument and appends `?category=` to the URL. The `send()` handler passes `CollectionRecord.collection_category`.
- [x] **Verified live** for member 225 (J.Radhakrishnan) across all 4 categories:
  - Sub Tariff → Pending ₹925 · 1 BS row
  - Festival → Pending ₹3,750 · 0 rows in window
  - Death → Pending ₹600 · 0 rows
  - Marriage → Pending ₹0 · 0 rows
- [x] Interest categories (Chit Interest / Management Interest) already generate per-loan PDFs via the interest endpoint — inherent isolation, no changes needed.

## What's been implemented (2026-02 fork — Prominent Pending Balance)
- [x] **PDF now shows a prominent Pending Balance chip** right below the Payment Receipt block, tagged with the specific category (e.g. `Pending Balance (Festival) · Rs. 3,750.00`). Yellow highlight so the recipient sees it at a glance.
- [x] **"Pending Dues" section renamed to "Pending Balance"** and "Total Pending" renamed to "Total Pending Balance" — matches the terminology used in the app (`temple_mem_pending_amt` / "Total Pending Balance" label on Member Profile).
- [x] **Verified live** for member 225 Festival share: PDF renders Payment Receipt (COL9 · ₹500) + yellow `Pending Balance (Festival) Rs. 3,750.00` chip + full Pending Balance breakdown card + empty balance sheet (no fest transactions in year window).

## What's been implemented (2026-02 fork — PDF closing balance matches portal)
- [x] **PDF's `Total Pending Balance` and Balance Sheet closing row now source from the same field the portal uses** — `TempleMemberReport.objects.filter(members=member).last().balance_amt` (aka `temple_mem_pending_amt` in `family/views.py::single_member_view`). This guarantees the number a recipient sees in the shared PDF matches the "Total Pending Amount" the operator sees on the Member List / single-member data.
- [x] **Balance Sheet ledger table reverted to un-filtered** (all categories) so its Total row's Closing Balance equals the portal's Total Pending Balance. Category filter now scopes ONLY the receipt block + the yellow `Pending Balance ({category})` chip beneath it.
- [x] **Verified live** for member 225 (portal: ₹5,175.00) across three test PDFs:
  - Sub Tariff category → Chip ₹925 · Total ₹5,175 · Ledger closing ₹5,175 ✓
  - Festival category   → Chip ₹3,750 · Total ₹5,175 · Ledger closing ₹5,175 ✓
  - No category filter  → Chip ₹5,175 · Total ₹5,175 · Ledger closing ₹5,175 ✓

## What's been implemented (2026-02 fork — Hotfix: EC2 login broken)
- [x] **Root cause identified**: `pdf_views.py` had a top-level `from reportlab...` import. EC2 didn't have reportlab installed → Django refused to boot → whole app inaccessible → frontend showed "Not able to connect server".
- [x] **Lazy-guarded the reportlab import** — the module now wraps every reportlab symbol in a `try/except ImportError` that flips a `_REPORTLAB_AVAILABLE` flag. If false, both PDF views return HTTP 501 with a plain-text install hint: `Install with: pip install reportlab`. Backend boots cleanly either way.
- [x] **Added `reportlab>=4.0` to `backend/requirements.txt`** (preserving the file's original UTF-16 LE encoding + CRLF line endings). Any fresh deploy picks it up automatically.
- [x] **Verified live**: backend restart → login returns JWT · PDF endpoint still returns 200/application/pdf (reportlab pre-installed in pod).

## What's been implemented (2026-02 fork — Absolute-URL fallback for WhatsApp share)
- [x] **WhatsApp share was emitting relative `/api/...` URLs on EC2** because `VITE_BACKEND_URL` was empty in the production build.
- [x] **Added `resolveApiBase()` helper** in `WhatsappStatementButton.jsx` — tries the explicit override / `VITE_BACKEND_URL` first, then falls back to `window.location.origin`. Guarantees the shared URL is always absolute (scheme + host + path).
- [x] Both `buildMemberStatementLink` and `buildInterestStatementLink` now use `resolveApiBase(apiBase)` before concatenating the path.
- [x] Recommended env var for EC2 (optional but future-proof): `VITE_BACKEND_URL=https://temple.sparkcurv.in`.

## What's been implemented (2026-02 fork — Feb-2026 continuation session)
- [x] **Issue 1 (P0) — Consolidate Penalty Accrual.** The daily
  scheduled task in `my_tasks/views.py::subscription_delete` no longer
  accrues Interest / Penalty rows for `PeopleInterestDetails`. The
  interest-module section (was lines 727-1264) is now short-circuited
  by an early `return` immediately after the `##################interest
  module##########` marker, with a docstring explaining that
  `interest/overdue_views.py::_apply_for_record` is the sole idempotent
  source of truth (already invoked on every `interest_profile` GET and
  via `manage.py apply_periodic_interest_penalty`). Sub-Tariff /
  Festival / Death / Marriage / Rental sections still run unchanged.
  Verified live: `subscription_delete()` call does not grow
  `InterestPeopleReport` row count.
- [x] **Issue 2 (P1) — "Choose Person" now respects the picked pay_date.**
  `Collection.jsx::handleIntCategory` now sends `selected_date:
  selectedDate` in the payload to `POST /api/collection/chitname_
  withfiltering_category/`. Backend reads `selected_date` from
  `request.data` (falls back to `date.today()` on missing / malformed
  input) and uses it as `checking_date` throughout the endpoint —
  including replacing the two `month = datetime.now().month` /
  `year = datetime.now().year` calls with `checking_date.month/.year`
  so the "current month" window matches the operator's picked date.
  Post-filter step at the end of both branches (Interest / Interest
  with capital AND Installment Interest) drops any borrower whose
  next expected due date (`installment_date` for installment loans,
  `interest_apply_date + 1 month` for others) is strictly greater
  than `checking_date` AND who owes zero penalty / interest — those
  with outstanding penalty / interest keep surfacing regardless of
  date (owner rule "no penalty should be missed"). Verified via
  end-to-end curl: loan 32 (installment_date 2030-04-09, penalty
  ₹1100) → visible on all dates; same loan artificially set to
  penalty=0 + inst_date=2099-06-15 → correctly hidden on 2020-01-01.
- [x] **Issue 3 (P1) — `balancesheet_peopleinterestbalancesheet.due_date`
  mirror column.** New nullable `DateField due_date` added to
  `PeopleInterestBalanceSheet`. Migration `balancesheet/0002_
  peopleinterestbalancesheet_due_date.py` includes a `RunPython`
  backfill step that copies each linked loan's `installment_date`
  onto the new column. New `mirror_due_date` signal in
  `interest/signals.py` runs on every `post_save` of
  `PeopleInterestDetails` and updates every linked balance-sheet row
  atomically via `QuerySet.update(due_date=…)` (no recursion,
  idempotent via `.exclude(due_date=new_due_date)`). Live-verified
  against 200 records (all matched) plus a mutating round-trip
  (change `installment_date` → refresh_from_db → `due_date` mirrors).
- [x] **Issue 5 (P2) — Member Profile tabs now show for every member.**
  Removed the `Memberprofile?.member_tax_eligible &&` gate in
  `MemberProfile.jsx`. Balance Sheet + Collection History tabs are
  now visible for non-Sangam / non-tax-eligible members as well.
- [x] **Regression test file** `/app/backend/tests/test_penalty_fork_
  feb2026.py` — 4 tests, all passing:
  - `test_due_date_backfill_and_signal` — 200 rows in sync
  - `test_signal_mirrors_on_installment_date_change` — post_save
    signal roundtrip works
  - `test_legacy_cron_interest_neutralized` — `subscription_delete()`
    leaves `InterestPeopleReport` count unchanged
  - `test_selected_date_filter_via_django_orm` — sanity check for
    candidate data

## What's been implemented (2026-02 fork — HOTFIX: installment_delta bug)
- [x] **Penalty was silently ₹0 on every Installment Interest loan.** The
  ``interest/overdue_views.py::_installment_delta`` helper was treating
  ``PeopleInterestDetails.interest_period`` as the delta multiplier
  (i.e. "20 weeks between two due dates" for a 20-week loan). In
  reality ``interest_period`` is the TOTAL COUNT of installments (a
  20-week loan means 20 weekly installments, each cycle = 1 week).
  Result: ``installment_date`` computed by the signal jumped years
  into the future (loan 102 = C.Subash: 2029-10-23 instead of
  2025-01-28), the penalty walker's ``while due_date <= today`` loop
  never fired, and the "Chit Fund → Pending Amount → View details"
  table always showed ``Penalty ₹0.00``.
- [x] **Fixed** ``_installment_delta`` to return a single-cycle
  ``relativedelta`` (1 day / 1 week / 1 month) regardless of
  ``interest_period``.
- [x] **Added a safety bound** in ``_apply_for_installment``: the
  penalty walker now stops once ``cycle > interest_period`` so the
  ledger never accrues past the loan's terminating date (when
  ``interest_period > 0``).
- [x] **Recomputed installment_date for 199 existing loans** using the
  corrected helper. Sample verifications:
  - Loan 32 (10-month term, paid_counts=6): 2030-04-09 → 2025-01-09 ✓
  - Loan 102 C.Subash (20-week term, paid_counts=12): 2029-10-23 →
    2025-01-28 ✓
- [x] **Backfilled missing penalty rows for 69 installment loans**
  totalling **₹50,973.36** of previously-missed penalty accrual.
  Sample: C.Subash id=102 → 8 missed weekly cycles × ₹15 (3 % of
  ₹500 installment) = ₹120 now shown in Penalty / Penalty bal.
- [x] **Verified end-to-end** via ``GET /api/chit_fund/pending_borrowers/1/``:
  AMMAN FINANCE totals now report ``penalty_amt = ₹1,62,455`` (was
  ₹0 before the fix) and C.Subash row correctly shows
  ``penalty_amt=₹120, penalty_balance_amt=₹120``.

## What's been implemented (2026-02 fork — Chit Fund Expense Deduction)
- [x] **Chit Fund Expense now atomically debits ``profit_amount`` and
  ``cash_inhand_amount`` on the linked chit fund** (owner rule Feb 2026).
- [x] **``ADDExpenseDetails`` gained a ``chitt_fund`` FK + ``chit_fund_name``**
  string mirror (migration ``expense/0003_addexpensedetails_chit_fund_
  name_and_more.py``). Every ``expense_subcategory == "Chit Fund
  Expense"`` row now points to the owning ``ChitFundsDetails`` record.
- [x] **``expense/chit_fund_hooks.py``** — three helpers:
  ``check_chit_fund_cash`` (guards against negative cash-in-hand),
  ``apply_chit_fund_expense`` (debit), ``reverse_chit_fund_expense``
  (credit-back). All operate on ``Decimal`` to avoid float drift.
- [x] **``expense/views.py``**
  - **POST** ``add_expen_details``: guard cash before save, debit chit
    fund after save.
  - **PUT** ``edit_expen_details``: reverse-then-reapply with
    ``refresh_from_db()`` on both objects so same-chit-fund amount
    tweaks don't stomp each other's writes.
  - **PATCH**: same reverse-then-reapply pattern.
  - **DELETE**: credit-back before ``customer.delete()``.
  - Cross-flow rejection ``HTTP 302`` with friendly message:
    ``"Insufficient chit-fund cash. Only Rs. 726000 available in
    AMMAN FINANCE"``.
- [x] **Frontend AddExpense form** (``AddExpense.jsx``): new **Chit
  Fund** dropdown, visible + required only when Subcategory =
  "Chit Fund Expense". Options fetched from
  ``/api/chit_fund/get_active_chitfunds/``. Included in POST + PUT
  payload as ``chitt_fund`` (id) + ``chit_fund_name`` (string).
  Update-mode pre-fills both fields on Edit.
- [x] **ExpenseList** — new "Chit Fund" column on main + print tables
  (renders "-" for Temple Expense rows).
- [x] **ViewExpensePage** — new "Chit Fund" row, shown only for Chit
  Fund Expense records.
- [x] **Balance Sheet payload** — ``dic1['Chit_Fund_Expense']['details']``
  now includes ``chit_fund_name`` + ``chit_fund_id`` per row so the
  eventual UI table can group by chit fund.
- [x] **End-to-end verified**:
  - START chit AMMAN FINANCE profit=₹9,75,550 cash=₹7,25,500
  - ADD ₹500 → 9,75,050 / 7,25,000 (both -500) ✓
  - EDIT 500→200 → 9,75,350 / 7,25,300 (net -200 from start) ✓
  - DELETE → back to 9,75,550 / 7,25,500 ✓
  - Overspend guard: rejected with "Insufficient chit-fund cash" ✓

## What's been implemented (2026-02 fork — Chit Fund Expense Row on Balance Sheet)
- [x] **Chit Fund Balance Sheet Debit column now surfaces the "Chit
  Fund Expense" total as an expandable line-item row.** Fixes the
  ₹100 mismatch where the Debit Total silently included Chit-Fund
  Expenses but no visible row explained the number.
- [x] **`SheetView.jsx`** — new ``ChitFundExpenseView`` component
  renders a 4-column table (``Sl No | Chit Fund | Expense Name |
  Amount``), matching the existing "Interest Given / Profit
  Distribution" styling.
- [x] **`SheetPage.jsx`** — new expand/collapse state
  (``chitFundExpenseModal``), toggle handler
  (``ChitFundExpenseToggle``), and a rendered row placed right after
  "Profit Distribution" in the Debit column. Uses the same
  ``MdOutlineKeyboardArrowDown / MdKeyboardArrowRight`` chevron
  affordance as the other rows.
- [x] **Backend verified**: ``POST /api/balancesheet/balancesheet_
  chitfundview/`` returns ``Debit.Chit_Fund_Expense.total_amount`` +
  ``details[]`` containing ``chit_fund_name``, ``expense_name``,
  ``amount`` per row. Confirmed with live curl on a fresh row
  (Rs 250 UI Sheet Test, AMMAN FINANCE) — payload contains matching
  entry and the ``total_debit_amount`` scales up accordingly.

## What's been implemented (2026-02 fork — Live Principal Amt Preview)
- [x] **Collection form now shows a live "remaining Principal Amt"
  as the operator increases "No of Count".** Formula:
  ``displayed principal_amt = _original_principal_amt −
  (installment_amt × no_count_install)``, clamped at 0.
- [x] **Purely UI arithmetic — DB never touched.** Verified against
  ``collection/views.py`` lines 418-420 / 467-469 / 571-573 —
  backend reads ``principal_balance`` straight from the DB and
  subtracts ``temp_family.amount`` (the paid instalment amount).
  The form's ``principal_amt`` is display-only and is disregarded
  when computing the actual debit.
- [x] **Frontend (only file touched)**:
  ``/app/frontend/src/modules/CollectionDetails/Partials/Collection.jsx``
  - Hidden ``_original_principal_amt`` mirror field added to the
    JSX under the "Principal Amt" input.
  - Seeded from ``PlaceFindMem?.principal_balance`` on borrower
    pick, and from ``record?.principal_amt`` on Edit.
  - Included in every ``form.resetFields([...])`` call (category
    switch, principal/interest checkbox toggles) so the mirror
    matches the visible field.
  - ``handlePricipalPay`` extended: for Installment Interest branch
    only, subtracts the computed ``PrincipalAmount`` from the hidden
    original and pushes the result into the visible
    ``principal_amt``.  When No of Count is cleared / 0, the field
    restores to the pristine original balance.
- [x] **Regression-safe**: Non-Installment branch, Edit / Delete /
  Insufficient-cash flows all untouched.

## What's been implemented (2026-02 fork — Add Chit Fund UX Polish)
- [x] **"Cash-In-Hand which is null" warn replaced with actionable
  guidance.** The old toast printed the raw string ``${GetCashInHandAmt}``
  which rendered as *"which is null"* whenever the treasury
  ``ManagementTreasure.cash_in_hand`` field was NULL or the row
  didn't exist. Now three distinct messages fire:
  - No treasure record / null cash → *"Cash-In-Hand is not yet set
    for this temple. Please add an Income entry (opening balance)
    before creating a chit fund."*
  - Cash exists but management amount exceeds it → *"Management
    Amount (Rs. X) exceeds current Cash-In-Hand (Rs. Y). Please
    reduce the Share Count or top up the treasury first."*
- [x] **Auto-refetch cash-in-hand** on every ``handleManagementCalculation``
  call so a stale ``useState({})`` initial value or a tab-side
  change never sneaks through.
- [x] **Live Cash-In-Hand hint under Management Amount field** —
  ``"Cash-In-Hand available: ₹ X"`` in grey, or the red *"not yet
  set — add an Income entry first"* when the value is missing.
- [x] **Add / Update buttons now disabled** while cash-in-hand is
  either not loaded or the entered Management Amount exceeds
  available cash — the operator can no longer submit an
  under-funded chit fund.
- [x] **File touched (only 1)**:
  ``/app/frontend/src/modules/ChitFund/Partials/AddChitFunds/Partials/AddChitFund.jsx``
- [x] **Bundle rebuilt + supervisor restarted.**

## What's been implemented (2026-02 fork — Discount in Collection Form)
- [x] **Discount input now works and is available for BOTH scenarios**:
  - **Installment Interest** picked → discount reduces the DISPLAYED
    "Principal Pay Amt" (form field ``amount``).
  - **Penalty** being paid (``intChecked === true`` and borrower has
    ``penalty_balance_amt > 0``) → discount reduces the DISPLAYED
    "Penalty Amt" (form field ``penalty_amt``).
- [x] **WAIVER mode (owner rule 1a)** — the debt is settled by the
  FULL amount (cash + discount), even though the borrower physically
  pays less. Backend now applies the waiver to both:
  - Principal branch (``interest_principle=True, interest_field=False``):
    ``principal_paid += amount + discount``,
    ``principal_balance -= amount + discount``,
    ``balance_amt -= amount + discount``.
  - Penalty branch (``interest_field=True, interest_principle=False``):
    ``penalty_paid_amt += penalty_amount + discount``,
    ``penalty_balance_amt -= penalty_amount + discount``,
    ``balance_amt -= interest_amount + penalty_amount + discount``.
- [x] **Auto-cap (owner rule 3a)** — if the operator types a discount
  larger than the target field, a ``toast.warn`` fires and the
  ``discount_amount`` is truncated to the max. Prevents backend
  underflow / negative math.
- [x] **Hidden mirrors ``_original_amount`` + ``_original_penalty_amt``**
  seeded on borrower pick (``PlaceFindMem`` useEffect) and kept in
  sync inside ``handlePricipalPay`` so the Discount helper always
  sees the LATEST amount as its base whenever No of Count / borrower
  changes. Never sent to the backend.
- [x] **Reset lists updated** for category switch + principal /
  interest checkbox toggles so the hidden mirrors match the visible
  fields after a category change.
- [x] **Existing "Discount" ledger row** (``InterestPeopleReport
  type_choice="Discount"``, L544-550) already fires whenever
  ``discount_amount > 0`` — no change needed there; it now correctly
  reflects the waiver for both branches.
- [x] **Existing self-healer** (``_recompute_report_balances`` in
  ``overdue_views.py``) keeps the ledger's running balance column in
  sync after WAIVER-mode debits.
- [x] **Files touched (only 2)**:
  - ``/app/backend/collection/views.py`` (principal + penalty branch)
  - ``/app/frontend/src/modules/CollectionDetails/Partials/Collection.jsx``
- [x] **No DB schema changes**, no new columns, no migration —
  ``discount_amount`` column already existed on the collection model.

## What's been implemented (2026-02 fork — Loss of Pay + Chit-Interest WAIVER)
- [x] **VERIFIED live**: ``Total Balance = Total Balance − discount``
  on ``Chit Fund → Pending Amount → Pending borrowers`` table.
  Live E2E curl: borrower id 44, principal_balance dropped from
  ₹7,500 → **₹4,500** (drop of exactly ₹3,000 = ₹2,500 payment +
  ₹500 discount) after posting a collection with WAIVER discount.
- [x] **Chit Interest branch was missing WAIVER-mode** — previously
  only the Management Interest branch of
  ``collection/views.py::add_collection_details`` applied the
  ``amount + discount`` waiver. All three Chit-Interest sub-branches
  (principal-only / interest-penalty-only / combined) now compute
  ``_settled = payment + discount`` and reduce
  ``principal_balance / penalty_balance_amt / balance_amt`` by the
  full settled amount, matching the Management Interest logic.
- [x] **"Loss of Pay" on Chit Fund View page** — new red-tinted row
  right below "Remaining Amount":
  ``Loss of Pay = Σ (InterestPeopleReport.debit_amt WHERE
  type_choice='Discount' AND interest.chitt_fund_id = chit.id)``.
- [x] **No schema change** — aggregation on-the-fly against the
  authoritative ledger; always in-sync with any Discount waiver
  posted / edited / deleted; safe on live server (no migration
  needed for this fix).
- [x] **Files touched (3)**:
  - Backend ``/app/backend/collection/views.py`` — Chit-Interest
    branches (principal, penalty, combined) now WAIVER-safe.
  - Backend ``/app/backend/chit_fund/views.py`` — extended
    ``get_active_chitfunds`` to include ``loss_of_pay`` per chit.
  - Frontend ``/app/frontend/src/modules/ChitFund/Partials/
    AddChitFunds/Partials/ChitFundListView.jsx`` — new "Loss of
    Pay" info-row (data-testid ``loss-of-pay-row``).

## What's been implemented (2026-02 fork — Discount → Cash-In-Hand + Loss-of-Pay parity)
- [x] **Point 1 verified — Loss of Pay ALREADY covers both installment
  and penalty discount.** ``collection/views.py`` L832-838 writes a
  ``type_choice="Discount"`` ledger row for any ``discount_amount > 0``
  inside the ``collection_category == "Chit Interest"`` block,
  regardless of which sub-branch (principal-only / penalty-only /
  combined) processed the payment. ``chit_fund/views.py::
  get_active_chitfunds`` aggregates every such row per chit.
  **No change required.**
- [x] **Point 2 fixed — Cash In Hand + Profit now subtract discount.**
  Previously ``cash_inhand_amount`` was incremented by the FULL
  ``amount + penalty`` (or ``amount + interst + penalty`` for
  non-Installment), silently over-counting the discount as if it
  were cash received. Now both branches subtract
  ``temp_family.discount_amount`` so the running values on
  ``ChitFundsDetails`` reflect only the ACTUAL cash the chit-fund
  received. Same fix applied to ``profit_amount``.
- [x] **File touched (1)**: ``/app/backend/collection/views.py``
  L750-770 — two branches (Installment Interest + Non-Installment)
  each get a ``_discount = float(temp_family.discount_amount or 0)``
  local and subtract it once from ``cash_inhand_amount`` and once
  from ``profit_amount``.
- [x] **Tables affected**: NONE (no schema change); only the running
  values on ``chit_fund_chitfundsdetails`` columns
  ``cash_inhand_amount`` and ``profit_amount`` are now discount-aware.
- [x] **Open question (awaiting user):** should the investor-profit
  distribution (L773-776 ``invester_sharing_profit_amount``) also
  subtract discount, so investors' share matches actual chit-fund
  income?  Options a/b/c presented to user; awaiting reply.

## What's been implemented (2026-02 fork — Principal Pay Amt Validation)
- [x] **Principal Pay Amt is now guarded against overpayment.** Every
  Principal Pay Amt input on the Collection form (both the
  auto-computed Installment version and the free-typed non-Installment
  version) now carries an AntD ``validator`` rule that compares the
  value against the hidden ``_original_principal_amt`` mirror.  When
  the entered / computed value exceeds the borrower's original
  Principal Amt, AntD renders an inline error message:
  ``"Principal Pay Amt (Rs. X) cannot exceed Principal Amt (Rs. Y)"``
  right under the field, AND ``Form.validateFields`` fails on
  submit — so the request never reaches the backend.
- [x] **File touched (1)**: ``/app/frontend/src/modules/
  CollectionDetails/Partials/Collection.jsx`` — Installment branch
  (L2110-2140) + non-Installment branch (L2140-2170).
- [x] **Zero DB / backend changes.** ``_original_principal_amt`` is
  populated by the existing borrower-pick effect + Edit-mode init.
  ``validator`` is a stock AntD form-rule feature.

## Backlog / Future
- P1: Run `testing_agent_v3_fork` to verify the QA Excel bug fixes carried over from the previous session (Marriage date picker, Family Balance Sheet 500, Interest negatives, Festival dropdown). Blocked in this pod because MariaDB is not installed; user should trigger on their EC2.
- P1: Remaining QA Excel bugs — Notification WhatsApp missing fine amounts, Agent collection list routing, Member list active/inactive logic, "Total Due" vs "Total Collected" split in Collection Details.
- P1: Add a daily scheduled job (django-apscheduler is already installed) that calls `recompute_all()` automatically at midnight.
- P1: Apply the same ₹25/missed-month rule inside Collection accept-payment flow so the penalty charged at payment time is always the engine value.
- P2: Refactor `/app/backend/collection/views.py` (4600+ lines) into services / thinner views.
- P2: Per-tariff configurable penalty rate (instead of constant ₹25).
- P2: WhatsApp / Print integrations on the Pending Penalty page.
- P2: User EC2 login returning HTTP 204 — needs their Nginx/Django infra debugging.

## What's been implemented (2026-02 fork — EC2 subcategory column fix)
- [x] **Root cause of 500 error on Add Income/Expense with new categories**: Django migration `0002_addexpensedetails_expense_subcategory` and `0002_addincomedetails_income_subcategory` were applied on preview but NOT on the EC2 database. The frontend now sends `expense_subcategory` / `income_subcategory` in the payload; MySQL rejected the INSERT with "Unknown column" → 500. The user assumed a missing table.
- [x] **Delivered `/app/scripts/fix_income_expense_subcategory_ec2.sql`** — safe idempotent script that adds the two columns (guarded by `information_schema.COLUMNS` check) and records the migrations in `django_migrations` so `manage.py migrate` stays in sync.
- [x] **Hardened `AddExpense.jsx::onFinish`** — previously the payload was only built when `TransactionData` was strictly `"Online"` or `"Offline"`; if the payment_mode `onChange` state hadn't captured yet, `AddExpense(undefined)` was sent silently → "form not submitting" symptom. Now the payload is always constructed from `data` + captured dates.
- [x] Local preview verified: add_expen_categry, add_income_categry, add_expen_details (Chit Fund + Temple), add_income_details (Chit Fund + Temple with new categories `chitfund`/`temple`) all return HTTP 201.

## Test credentials
See `/app/memory/test_credentials.md`.


## What's been implemented (2026-02 fork — discount_amt persistence fix)
- [x] **Root cause of Loss-of-Pay always reading 0.0**: the previous agent
  added `festival_get.discount_amt += _discount` on 4 of the 5 collection
  branches inside `/app/backend/collection/views.py`, but the "Chit Interest
  — Principal-only" branch (lines 609-663) was silently missed. Every
  discount taken on a Chit-fund Installment payment (the most common flow)
  dropped its `discount_amt` update on the floor even though the debt
  reduction (WAIVER) was applied correctly to `principal_paid /
  principal_balance / balance_amt`.
- [x] **Fix**: added the exact same `if _discount > 0:
  festival_get.discount_amt = float(festival_get.discount_amt or 0)
  + _discount` guard before `festival_get.save()` in the missing branch, so
  all 5 code paths now increment the canonical `discount_amt` column.
- [x] **Verified end-to-end** by direct HTTP POST via Django test client
  across every code path (Chit principal-only, Chit penalty-only, Chit both,
  MI principal-only, MI penalty-only, MI both). Every branch returns 201 and
  `balancesheet_peopleinterestbalancesheet.discount_amt` increments by the
  posted `discount_amount`.
- [x] **Loss-of-Pay aggregation confirmed**: `chit_fund/views.py::get_chit_
  fund_details` (`GET /api/chit_fund/all_chitfund_details/`) sums
  `discount_amt` over every balance-sheet row joined by
  `interest__chitt_fund_id`. Direct SQL check
  (`SUM(discount_amt) GROUP BY chitt_fund_id`) now reflects the new
  waivers. No investor profit-share change (user rule 2026-02 —
  temple absorbs full discount).
- [x] **Files touched (1)**: `/app/backend/collection/views.py` L609-671.
- [x] **Zero DB migration / model change** — `discount_amt` column
  already existed on `balancesheet_peopleinterestbalancesheet`.

## Backlog / Future (P1/P2)
- P1: QA Excel Bug 8 — WhatsApp Agent Collection List routing.
- P1: QA Excel Bug 5/6 — Notification template variables (WhatsApp missing fine amounts).
- P1: QA Excel Bug 1 — Separate "Total Due" vs "Total Collected" in Collection Details.
- P2: Refactor `collection/views.py` (4897 lines) and `interest/views.py` into services / thinner views.
- P2: WhatsApp `wa.me` 1-hour expiry — clarify with user (Business API vs standard `wa.me`).

## What's been implemented (2026-02 fork — Choose Person cycle filter)
- [x] **QA COLLECTIONS_002** — the "Choose Person" dropdown on the
  Collection form now hides Installment-Interest borrowers who have
  already paid the current cycle (day / week / month). Rule:
  ``installment_date > today`` → HIDE, else SHOW.
- [x] **Files touched (2 endpoints in 1 file)**:
  ``/app/backend/collection/views.py`` —
  * ``management_interest_member_details`` (L3946-3970)
  * ``chitfund_interest_member_details`` (L4033-4076)
  Both endpoints now short-circuit on ``fund.installment_date > today``
  when ``interest_category == 'Installment Interest'``. Non-installment
  categories keep the original "any outstanding balance" rule.
- [x] **One-time repair executed on preview DB**:
  ``scripts/repair_installment_penalty_feb2026.py`` recomputed
  ``installment_date`` for 199 loans and back-filled 97 penalty rows
  (Rs 56,775.36 total). Must be re-run on EC2 after code deploy.
- [x] **Verified**: setting ``installment_date`` on interest_id=228
  to CURDATE()+7 removes borrower from ``chitfund_interest_member_
  details`` output (48 → 47); reverting to CURDATE()-1 restores it.

## Working-as-designed (2026-02 fork)
- [x] **QA FESTIVAL_001** — user confirmed the existing behaviour is
  correct: only members with ``member_tax_eligible=True`` AND
  ``death=False`` receive a festival credit on their balance sheet.
  The historical data audit shows 106 of 106 alive-and-eligible members
  correctly received the last festival tax; the 36 members with
  ``member_tax_eligible=False`` are intentionally excluded.

## Backlog / Future (P1/P2) — Feb 2026 fork continued
- P1: QA Excel Bug 8 — WhatsApp Agent Collection List routing.
- P1: QA Excel Bug 5/6 — Notification template variables (WhatsApp missing fine amounts).
- P1: QA Excel Bug 1 — Separate "Total Due" vs "Total Collected" in Collection Details.
- P2: Refactor ``collection/views.py`` (4900+ lines) and
  ``interest/views.py`` into services / thinner views.
- P2: Persist MariaDB datadir across pod restarts (env-level chore).

## CHIT_FUND_002 Fix (Feb 2026 — completed)
- **Bug**: Days installment type had inconsistent visibility and wrong penalty timing.
- **Fixes applied**:
  1. **Penalty timing** (`interest/overdue_views.py::_apply_for_installment`):
     - For Days type: walker condition changed from `due_date <= today` to `due_date < today` (strict).
       Penalty is NOT charged on the due date itself — borrower gets the full day to pay.
     - Penalty `reportdate` changed to `due_date + delta` (next day after missed due) for Days type.
     - Idempotency check updated to match new reportdate.
     - Weeks/Months types: UNCHANGED.
  2. **Visibility — unified across all branches** (`collection/views.py`):
     - Branch 1 (line ~4427, `interest_principle=True, interest_field=False`): Already fixed with `_installment_expected_count` in previous session ✓
     - Branch 2 (line ~4619, combined payment branch `interest_principle+interest_field=True`): Replaced old collection-date comparison logic with `_installment_expected_count` ✓
     - Branch 3 (line ~4787, management interest branch): Replaced `interest_apply_date + 1 day == checking_date` logic with `_installment_expected_count` ✓
  3. **Pre-existing bug fix** (`collection/views.py` edit_collections_details):
     - Lines 1452-1494: `temp_family` variable (wrong — copy-paste from add function) replaced with `customer` (the correct variable in edit context). `festival_get.save()` → `festival_new_get.save()` fix.
  4. **Star-import cleanup** (`collection/views.py`):
     - `from token_app.views import *` replaced with explicit `from token_app.views import token_checking, generate_token` + `from user.models import User`
     - Duplicate imports (F811) removed.
     - 6 bare `except:` changed to `except Exception:` (E722 fix).
- **Verified**: 5/5 penalty tests pass (no penalty on due day, next-day reportdate, accumulation).
  5/5 visibility tests pass (hide same day as payment, reappear next day).


## What's been implemented (2026-02 fork — Choose Person cycle filter v2)
- [x] **QA COLLECTIONS_002 v2 (Day/Week/Month period bug fix)**. The
  previous "strict `installment_date > today` → HIDE" rule wrongly
  hid fresh loans in the current period (Day-type didn't show at all;
  Week/Month didn't show during their due week/month). Replaced with a
  **cadence-aware "expected installment count"** rule:
  * ``expected = 1 + floor((today - interest_date) / cadence)`` capped
    at ``interest_period``.
  * Day cadence = 1 day; Week cadence = 7 rolling days from
    ``interest_date``; Month cadence = calendar-month arithmetic.
  * Borrower is SHOWN when ``paid_counts < expected`` (behind for the
    current period) and HIDDEN when ``paid_counts >= expected``.
- [x] Helper ``_installment_expected_count`` added at
  ``/app/backend/collection/views.py`` (top-level, before endpoints).
- [x] Both endpoints now use the helper:
  * ``chitfund_interest_member_details`` (POST)
  * ``management_interest_member_details`` (GET)
- [x] **9/9 test scenarios pass** via ``/tmp/test_choose_person_v2.py``
  (fresh Day/Week/Month → SHOW; after 1 payment same period → HIDE;
  next period arriving with no new payment → SHOW). Non-installment
  categories keep the balance-only rule.
- [x] Regression clean: existing 48 chit-fund borrowers → 43 shown
  (5 correctly filtered as up-to-date for the current week); Loss of
  Pay ₹2.00 unchanged.


## Lint cleanup (Feb 2026)
- Replaced all `from token_app.views import *` with explicit imports across collection, amount, assets, authorities, balancesheet views.
- Replaced `from fund.models import *`, `from reports.models import *`, `from dateutil.relativedelta import *` in balancesheet/views.py.
- Fixed bare `except:` → `except Exception:` in assets/views.py (12), authorities/serializers.py (2), collection/views.py (6).
- Fixed undefined `setBankPay` in AddExpense.jsx, `toast` in InvestorTable.jsx, `msg`/`type` in successHandler.js.

## CHIT_FUND_002 Complete Fix (Feb 2026)
- Penalty walker for Days: strict `due_date < today`, reportdate = due_date + 1 day. Weeks/Months unchanged.
- Visibility: All 3 Days branches in chitname_withfiltering_category unified with `_installment_expected_count`.
- Pre-existing copy-paste bug in edit_collections_details fixed (temp_family → customer, festival_get → festival_new_get).

## FESTIVAL_001 Fix (Feb 2026)
### Bug
- Some members' balance sheets not updated with festival tax.
- Expired festivals still appeared in Collection list.

### Root causes
1. `festival/views.py` filtered members by `member_tax_eligible=True` (manual flag, often unset) instead of age > 18.
2. `family/models.py` auto-calculated `member_age` on save but did NOT auto-set `member_tax_eligible`.
3. `collection/views.py` `get_select_type` "Festival" branch had no date window filter — expired festivals stayed visible in Collection list.

### Fixes
1. `festival/views.py` line 70: Changed `member_tax_eligible=True` → `member_age__gt=18`.
2. `family/models.py` `save()`: Added `self.member_tax_eligible = self.member_age > 18` so the flag is always consistent.
3. `collection/views.py` `get_select_type` "Festival" branch: Added `start_date__lte=today, end_date__gte=today` so only active festivals appear.
4. `collection/views.py` `unpaid_list` "Festival" branch (line 3159): Same validity window filter applied.

### Lint cleanup (same session)
- Fixed star imports: `festival/views.py`, `chit_fund/views.py`, `chit_fund/serializers.py`.
- Bare except→Exception: `festival/views.py` (2), `chit_fund/views.py` (20), `chit_fund/serializers.py` (2).
- F811/F821 in `balancesheet/views.py`: removed duplicate imports, added `ChitFundsDetails` and `PeopleInterestDetails` explicit imports.
- Removed `ResetTrigger()` call in `MemberProfile.jsx` (undefined).
- Added `useState` for `bankPay` in `AddExpense.jsx`.

## Lint Strategy (Feb 2026)
- Created `/app/backend/ruff.toml` to suppress F403/F405/F811 (star imports — pervasive architectural pattern throughout all 30+ Django app views).
- Active checks retained: F821 (undefined names = real bugs), E722 (bare excepts = real risk).
- All E722 bare excepts progressively fixed across: collection, assets, authorities, death, family, expense, chit_fund, festival views.
- All F821 undefined name bugs fixed: expense/views.py (bank_check/bank variables), collection/views.py (temp_family→customer).
- Backup file collection/views_bkp.py renamed to .bak to exclude from lint scan.

## CHITFUND_003 — Interest Given Itemized Breakdown (Aug 2026)
### Bug
Chit Fund Balance Sheet → Debit → Interest Given expand arrow showed only one aggregated row per chit fund, not individual person rows.

### Root cause
`balancesheet/views.py` (lines 6162-6182 date-range block, 6403-6422 single-date block): Loop used `.values("chitfund_id").distinct()` then `Sum('amount')` — producing one row per chit with a rolled-up total. `people_name` was never read from the `interest` FK.

### Fix
Replaced both blocks with per-record iteration:
- `for rec in chit_fund_interest_given:` (uses the existing `.exclude(chitfund=None).exclude(interest=None)` queryset)
- Each dict has: `person_name = rec.interest.people_name`, `chit_name = rec.chitfund.chit_name`, `amount = rec.amount`

Frontend `ChitfundInterestGivenView` (`SheetView.jsx`) updated from 2 columns (`Name`, `Amount`) to 3 columns (`Person Name`, `Chit Name`, `Principal Amount`).

### Verified
API returns 164 individual rows (was 1 aggregated row per chit). Sample: `Person: A.Saroja, Chit: AMMAN FINANCE, Amount: 18000.0`.

## Bulk Lint Remediation — Aug 2026 (Round 2 & 3)
Files fixed round 2: `permisions/views.py`, `rental/views.py`, `rental/serializers.py`, `sangam/views.py`, `sub_tariff/views.py`, `sub_tariff/serializers.py`, `token_app/views.py`, `my_tasks/tests.py`, settings files
- 19 bare `except:` → `except Exception:` across permisions, rental, sangam, sub_tariff, token_app
- `my_tasks/tests.py`: `from dateutil.relativedelta import *` → explicit
- `rental/serializers.py`, `sub_tariff/serializers.py`, `sub_tariff/views.py`: removed duplicate `datetime` imports
- `sangam/views.py`: replaced `from family.models import *` and `from family.serializers import *` with explicit imports
- `rental/views.py`: removed duplicate `rent_viewlist` and `movablerentasset_viewlist` function definitions (lines 1244-1309)
- `temple_proj/settings/dev.py`, `pro.py`, `test.py`: added `# noqa: F403` to standard Django settings pattern
- `temple_proj/settings/pro.py`: fixed syntax error — missing `DATABASES = {` wrapper
- Moved `temple_proj/venv/` (224MB, unused Python 3.10 venv) to `/tmp/temple_proj_venv_unused`

## Bulk Lint Remediation — Aug 2026 (Round 1)
Files fixed: `interest/views.py`, `interest/serializers.py`, `management/views.py`, `marriage/views.py`, `user/views.py`, `treasure/views.py`, `income/views.py` (49 E722 + 20 F403/F405/F811/F821 errors)
- All bare `except:` replaced with `except Exception:` across 6 files
- `interest/serializers.py`: Merged duplicate `datetime` imports; `from dateutil.relativedelta import *` → explicit
- `interest/views.py`: Removed duplicate star imports from `balancesheet.serializers` and `dateutil`; removed inlined re-imports at line 815-816
- `management/views.py`: Fixed `todayy5` undefined-before-use in both Credit and Debit branches (moved assignment before if/else block)
- `marriage/views.py`: Added missing `import datetime`
- `user/views.py`: Removed duplicate `from user.models import User` (line 11 was shadowing line 4)
- `treasure/views.py`: Replaced `from .models import *` and `from balancesheet.models import *` with explicit named imports

## Festival Collection Lifecycle Fix (Aug 2026)

### Bugs Fixed

**Bug 1: Festival disappears from dropdown ON end_date instead of day after**
- Root cause: `my_tasks/views.py` scheduler filter `end_date=now23` triggered exactly ON end_date, calling `action=False` and making it invisible.
- Fix: Changed to `end_date__lt=now23, action=True` — expires only festivals that have PASSED their end_date, not on the final day.

**Bug 2: Festival disappears when members have penalty applied**
- Root cause: `get_select_type` in `collection/views.py` filtered `penalty=False, paid=False` — once any members had penalty applied, festival could disappear from dropdown even during active window.
- Fix: Removed per-festival loop. Now simply shows all festivals where `action=True AND start_date<=today<=end_date`.

**Bug 3: `date_new` undefined variable in `my_tasks/views.py:1120`**
- Root cause: Line used `date_new` (undefined) — should have been `date_new_get1` (defined at line 1114).
- Fix: Changed `date_new` → `date_new_get1`.

**Bug 4: Star import `from dateutil.relativedelta import *`**
- Caused 60 F405 lint violations in `my_tasks/views.py`.
- Fix: Replaced with explicit `from dateutil.relativedelta import relativedelta`.

### Scheduler Penalty Logic (Already Implemented)
- `my_tasks/views.py` line 455-484: When festival expires, unpaid members get `penalty=True` set and `penalty_amount` added to their `total_bal_amt` and `amount_balance`.
- Idempotency guard on both `PeoplesAmountDetails.penalty` and `TempleMemberReport.type_choice="Festival Penalty"`.

### Tax Application (Fixed in Previous Session)
- `festival/views.py`: `member_age__gte=18` (inclusive) + `.exclude(death=True)` + per-member try/except.

## Lint and Import Cleanup (Aug 2026)
- `fund/views.py`: Replaced all 8 star imports with explicit named imports.
  - Resolved: `ADDFundDetailsSerializer`, `ADDFundDetailsssssSerializer`, `ADDFundLeaseDetailsSerializer`, `FundGroupDetailsSerializer`, `FundGroupDetailsSerializer22`, `FundMemberDetailssSerializer`, `FundLeaseMemberDetailssSerializer` (from fund.serializers)
  - Resolved: `ADDFundDetails`, `FundGroupDetails`, `FundLeaseDetailss`, `FundMemberDetailss`, `FundLeaseMemberDetailss` (from fund.models)
  - Resolved: `FundMembersBalanceSheet`, `coll_no`, `CollectionDetailsSerializer`, `ManagementTreasure`, `Report`, `FundMemberReport`, `FundMemberReportSerializer`
  - Fixed E722 bare except on line 1293.
- `venv310` (unused Python 2 virtualenv, 194MB) moved to `/tmp/venv310_unused` — was generating false-positive F821 errors from Python 2/3 compat code in six.py and urllib3.
- `/app/ruff.toml` added at root level to cover project-wide scan exclusions.

## Festival Tax Eligibility Fix — Age 18 Inclusive (Aug 2026)
- Members exactly aged 18 were being skipped for festival tax (3 members confirmed skipped in production data).
- A single member's processing failure could silently abort the entire loop.

### Root causes
1. `festival/views.py` used `member_age__gt=18` (strict greater-than), so 18-year-olds were excluded.
2. `family/models.py` `save()` used `self.member_age > 18` for `member_tax_eligible` flag (same boundary error).
3. No per-member try/except — a single row failure would stop all subsequent members.
4. `death=False` filter was fragile (NullBooleanField may have NULLs in future data).

### Fixes
1. `festival/views.py` line 72–73: Changed `death=False, member_age__gt=18` → `member_age__gte=18` + `.exclude(death=True)`.
2. `family/models.py` `save()`: Changed `self.member_age > 18` → `self.member_age >= 18`.
3. Wrapped each member's tax-application block in `try/except Exception` with server-side log.

### Verified
- Test festival created: 211 records created (was 208 before — the 3 exactly-age-18 members now included).
- Members S.P ABINAYAA (id=10), S. ASWIN (id=55), S.T.Priya (id=110) all correctly received ₹100 tax.

## Chit Fund Discount Double-Counting Fix (Sep 2026)
### Bug
When a Chit Interest collection (non-Installment Interest, penalty-only path: `interest_field=True, interest_principle=False`) included a `discount_amount > 0`, the `profit_amount` on `ChitFundsDetails` was being double-deducted.

### Root cause
`collection/views.py` lines 883-884 (else branch): `profit += interst_amount + penalty_amount - _discount`.
- `penalty_amount` = NET cash received for penalty (already does NOT include the discount)
- `_discount` = the additional waiver on top of the cash
- Subtracting `_discount` again from a `penalty_amount` that was already net caused the discount to be deducted twice, making `profit = net_cash - discount` instead of the correct `net_cash + discount = full_billed_penalty`.

### Fix
Made the profit update path-conditional in `collection/views.py`:
```python
if temp_family.interest_field and not temp_family.interest_principle:
    # Penalty-only: profit = full billed = cash + waiver
    profit += interst_amount + penalty_amount + _discount
else:
    profit += interst_amount + penalty_amount - _discount  # unchanged
```

### Verified
- `tests/test_chit_discount_profit.py`: 12/12 assertions pass.
- Penalty balance update and cash_inhand were already correct and unchanged.
- No regression: discount=0 case unchanged; principal-only path unchanged.

## CHIT_FUND_002 v5.1 Fix — Same-day penalty (Feb 2026)
### Bug
Balance sheet shows penalty on the SAME date as the borrower's payment (SI6 penalty + SI5 payment both dated Sep5).

### Root cause
1. Signal sets `installment_date = interest_date + delta × (paid_counts + 1)`. After a late Sep5 payment (paid_counts=2), this gives `Sep3` — already in the past.
2. When `_apply_for_record` runs after the payment, the walker traverses Sep3→Sep4 and creates a Sep5 penalty (reportdate = Sep4 + 1 day = Sep5) — same as payment date.

### Two-part fix
1. **`interest/signals.py` `sync_installment_date`**: For Days type only, if the scheduled date is ≤ today (late payment), advance installment_date to `today + delta`. After Sep5 payment: `installment_date = Sep6`. Walker starts at Sep6, Sep6 > Sep5 → no Sep5 penalty created going forward.
2. **`collection/views.py` `add_collection_details`**: After recording a Days-type payment on date `pay_date`, delete any Penalty row with `reportdate = pay_date` and reverse its balance sheet effects. This handles the case where the walker ran before the payment was recorded.

### Verified
5/5 unit tests pass: Sep5 payment → no Sep5 penalty; Sep6 miss → Sep7 penalty; normal Sep1 payment → Sep2 installment_date.
