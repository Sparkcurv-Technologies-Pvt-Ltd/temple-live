-- =========================================================================
-- EC2 FIX: Normalise every active Chit-Fund-Interest loan to
--          Penalty = 3 % of Interest balance (percentage type).
--
-- Old loans were saved with the previous default (often 10 %). The
-- Add/Edit form now defaults to 3 %, but existing rows carry their
-- original rate — so their penalty_balance_amt was compounding at the
-- wrong rate.
--
-- Idempotent — safe to run multiple times.
-- After running this, execute the periodic accrual once:
--     python manage.py apply_periodic_interest_penalty
-- =========================================================================

USE temple;

UPDATE interest_peopleinterestdetails
   SET penalty_amount = 3.00,
       penalty_type   = 'percentage'
 WHERE action = 1
   AND interest_type = 'Chit fund Interest';

-- Verify
SELECT
    COUNT(*)                                       AS rows_now_at_3pct,
    MIN(penalty_amount)                            AS min_rate,
    MAX(penalty_amount)                            AS max_rate
FROM interest_peopleinterestdetails
WHERE action = 1
  AND interest_type = 'Chit fund Interest';
-- Expected: min_rate = max_rate = 3.00
