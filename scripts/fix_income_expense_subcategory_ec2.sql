-- =========================================================================
-- EC2 FIX: Add missing subcategory columns for Income & Expense Details
-- =========================================================================
-- Issue: "Add new category (chitfund/temple) submits data but returns 500"
--        "Add Expense form not submitting"
-- Root cause: Django migration 0002 (adds expense_subcategory /
--             income_subcategory columns) was applied on preview but NOT
--             on the EC2 database. The frontend now sends these fields,
--             so the INSERT fails with "Unknown column" and returns 500.
--
-- Safe to run multiple times: uses IF NOT EXISTS via information_schema.
-- Run as a user that owns the `temple` schema (e.g. appadmin).
-- =========================================================================

USE temple;

-- -------------------------------------------------------------------------
-- 1) expense_addexpensedetails.expense_subcategory
-- -------------------------------------------------------------------------
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'expense_addexpensedetails'
      AND COLUMN_NAME  = 'expense_subcategory'
);

SET @sql := IF(@col_exists = 0,
    'ALTER TABLE expense_addexpensedetails
        ADD COLUMN expense_subcategory VARCHAR(255) NULL DEFAULT NULL',
    'SELECT ''expense_subcategory column already exists — skipped'' AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- -------------------------------------------------------------------------
-- 2) income_addincomedetails.income_subcategory
-- -------------------------------------------------------------------------
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'income_addincomedetails'
      AND COLUMN_NAME  = 'income_subcategory'
);

SET @sql := IF(@col_exists = 0,
    'ALTER TABLE income_addincomedetails
        ADD COLUMN income_subcategory VARCHAR(255) NULL DEFAULT NULL',
    'SELECT ''income_subcategory column already exists — skipped'' AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- -------------------------------------------------------------------------
-- 3) Register these migrations as applied so `manage.py migrate` won't
--    try to re-run them.
-- -------------------------------------------------------------------------
INSERT INTO django_migrations (app, name, applied)
SELECT 'expense',
       '0002_addexpensedetails_expense_subcategory',
       NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM django_migrations
    WHERE app = 'expense'
      AND name = '0002_addexpensedetails_expense_subcategory'
);

INSERT INTO django_migrations (app, name, applied)
SELECT 'income',
       '0002_addincomedetails_income_subcategory',
       NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM django_migrations
    WHERE app = 'income'
      AND name = '0002_addincomedetails_income_subcategory'
);


-- -------------------------------------------------------------------------
-- 4) Verification — the two columns should now exist.
-- -------------------------------------------------------------------------
SELECT TABLE_NAME, COLUMN_NAME, IS_NULLABLE, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND (
        (TABLE_NAME = 'expense_addexpensedetails' AND COLUMN_NAME = 'expense_subcategory')
     OR (TABLE_NAME = 'income_addincomedetails'   AND COLUMN_NAME = 'income_subcategory')
  );
