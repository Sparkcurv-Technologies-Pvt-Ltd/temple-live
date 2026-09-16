-- =========================================================================
-- CHIT FUND SETTLEMENT — Recovery / Reset for shares that got
-- redistributed by the old (buggy) settlement logic.
--
-- BUSINESS RULE (fixed 2026-07-30):
--   When an investor applies for settlement, their share_count is
--   subtracted from the pool. Shares are NOT redistributed to remaining
--   investors or to Management.
--
-- Prior to the code fix, applying a settlement redistributed the exiting
-- shares proportionally, so the chit's investers_share_count stayed
-- roughly the same and individual remaining investors received bonus
-- shares. This script provides two safe manual paths to restore state.
-- =========================================================================
--
-- REPLACE the placeholders with your real values:
--   :chit_id            = the ChitFundsDetails.id row you're fixing
--   :exiting_invester_id = ChitFundInvesters.id of the settling person
--                          (e.g. C. Ramasamy Nadar)
--
-- ---------------------------------------------------------------------
-- STEP 1 — Inspect current state
-- ---------------------------------------------------------------------
SELECT
    id, chit_name,
    investers_share_count, management_share_count, total_share_count,
    outer_invest_amount
FROM chit_fund_chitfundsdetails
WHERE id = :chit_id;

SELECT
    id, invester_name, share_count, investment_amt, action, settled
FROM chit_fund_chitfundinvesters
WHERE chitt_fund_id = :chit_id
ORDER BY id;

-- ---------------------------------------------------------------------
-- STEP 2 — Cleanest reset (recommended)
--
-- 2a) Delete the existing settlement application from the UI
--     (Chit Fund → Settlement Applications → Delete Ramasamy's row).
--     The DELETE endpoint (post-fix) restores investers_share_count
--     and outer_invest_amount by the exiting investor's share_count /
--     investment_amt. It cannot un-bonus the previously-redistributed
--     shares because those bonuses were not tracked per investor.
--
-- 2b) Manually zero out the bonus shares that were previously handed
--     to remaining investors and to Management. If you know the
--     original share_count for each investor and the original
--     management_share_count, run:
--
--     UPDATE chit_fund_chitfundinvesters
--        SET share_count = <original>
--        WHERE id = <inv_id>;      -- repeat per affected investor
--
--     UPDATE chit_fund_chitfundsdetails
--        SET management_share_count = <original_mgmt>
--        WHERE id = :chit_id;
--
-- 2c) Re-run the settlement application from the UI. New logic will
--     subtract 20 (or whatever share_count the exiting investor has)
--     from investers_share_count and leave management alone.
--
-- ---------------------------------------------------------------------
-- STEP 3 — Verify final state
-- ---------------------------------------------------------------------
SELECT
    id, chit_name,
    investers_share_count, management_share_count, total_share_count
FROM chit_fund_chitfundsdetails
WHERE id = :chit_id;
-- Expected: total_share_count = management_share_count + investers_share_count
--           investers_share_count reduced by the exiting share_count (20)
