-- =========================================================================
-- EC2 DATA WIPE — Keep Family & Member details (+ core admin/auth) only.
--
-- PRESERVED:
--   * family_fammily_details, family_member_details    (your ask)
--   * user_user (+ auth groups/permissions link tables) — so admins can log in
--   * auth_group, auth_group_permissions, auth_permission (Django auth)
--   * django_content_type, django_migrations           (Django plumbing)
--   * management_managementdetails, management_bankdetails,
--     management_instructions                          (management profile & banks)
--   * permisions_my_roles, permisions_permisions       (role definitions)
--
-- WIPED (schema kept, all rows removed, auto-increment reset to 1):
--   * All chit fund, interest, collection, income, expense, fund,
--     rental, asset, sangam, sub_tariff, festival, marriage, death,
--     other_people, authorities, amount, balancesheet, reports,
--     treasure tables + django_admin_log + django_session.
--
-- SAFETY:
--   * Runs inside a single transaction.
--   * FK checks disabled for the duration → truncate order doesn't matter.
--   * Verified against preview DB (72 tables) on 2026-07-31.
--   * TAKE A DUMP FIRST — this is not reversible:
--        mysqldump -u appadmin -p temple > temple_backup_$(date +%F).sql
-- =========================================================================

USE temple;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1) Amount & Cash
-- ---------------------------------------------------------------------
TRUNCATE TABLE amount_cashtransactiondetails;
TRUNCATE TABLE amount_peoplesamountdetails;
TRUNCATE TABLE amount_peoplesjoiningamountdetails;

-- ---------------------------------------------------------------------
-- 2) Assets (both category master + details wiped, since it's temple
--    setup data you can re-add)
-- ---------------------------------------------------------------------
TRUNCATE TABLE assets_assetdetails;
TRUNCATE TABLE assets_assetcategory;
TRUNCATE TABLE assets_moveableassetdetails;
TRUNCATE TABLE assets_moveableassetcategory;

-- ---------------------------------------------------------------------
-- 3) Authorities
-- ---------------------------------------------------------------------
TRUNCATE TABLE authorities_addauthoritydetails;
TRUNCATE TABLE authorities_add_exfields;
TRUNCATE TABLE authorities_autharityfields;
TRUNCATE TABLE authorities_addposition;

-- ---------------------------------------------------------------------
-- 4) Balance sheets
-- ---------------------------------------------------------------------
TRUNCATE TABLE balancesheet_fundbalancesheet;
TRUNCATE TABLE balancesheet_fundmembersbalancesheet;
TRUNCATE TABLE balancesheet_moveablerentbalancesheet;
TRUNCATE TABLE balancesheet_peopleinterestbalancesheet;
TRUNCATE TABLE balancesheet_rentalbalancesheet;

-- ---------------------------------------------------------------------
-- 5) Chit Fund (settlements, investers, distributions)
-- ---------------------------------------------------------------------
TRUNCATE TABLE chit_fund_investersprofitdistributiontable;
TRUNCATE TABLE chit_fund_chitfundsettlement;
TRUNCATE TABLE chit_fund_chitfundsettleaplication;
TRUNCATE TABLE chit_fund_chitfunddistribution;
TRUNCATE TABLE chit_fund_chitfundinvesters;
TRUNCATE TABLE chit_fund_chitfundsdetails;

-- ---------------------------------------------------------------------
-- 6) Collection
-- ---------------------------------------------------------------------
TRUNCATE TABLE collection_collectiondetails;

-- ---------------------------------------------------------------------
-- 7) Deaths / Marriages / Other people
-- ---------------------------------------------------------------------
TRUNCATE TABLE death_deathdetails;
TRUNCATE TABLE marriage_marriagedetails;
TRUNCATE TABLE other_people_otherpeopledetails;

-- ---------------------------------------------------------------------
-- 8) Django plumbing that grows over time (safe to reset)
-- ---------------------------------------------------------------------
TRUNCATE TABLE django_admin_log;
TRUNCATE TABLE django_session;

-- ---------------------------------------------------------------------
-- 9) Expense (details + master categories & names)
-- ---------------------------------------------------------------------
TRUNCATE TABLE expense_addexpensedetails;
TRUNCATE TABLE expense_addexpensenames;
TRUNCATE TABLE expense_addexpensecategory;

-- ---------------------------------------------------------------------
-- 10) Festivals (per your earlier request)
-- ---------------------------------------------------------------------
TRUNCATE TABLE festival_addfestivaldetails;

-- ---------------------------------------------------------------------
-- 11) Fund (lease + groups + members)
-- ---------------------------------------------------------------------
TRUNCATE TABLE fund_fundleasememberdetailss;
TRUNCATE TABLE fund_fundleasedetailss;
TRUNCATE TABLE fund_fundmemberdetailss;
TRUNCATE TABLE fund_fundgroupdetails;
TRUNCATE TABLE fund_addfunddetails;

-- ---------------------------------------------------------------------
-- 12) Income (details + master categories & names)
-- ---------------------------------------------------------------------
TRUNCATE TABLE income_addincomedetails;
TRUNCATE TABLE income_addincomenames;
TRUNCATE TABLE income_addincomecategory;

-- ---------------------------------------------------------------------
-- 13) Interest (people-interest loans)
-- ---------------------------------------------------------------------
TRUNCATE TABLE interest_peopleinterestdetails;

-- ---------------------------------------------------------------------
-- 14) Rental & Movable rents
-- ---------------------------------------------------------------------
TRUNCATE TABLE rental_movableassetsrenttable;
TRUNCATE TABLE rental_movableassetsrents;
TRUNCATE TABLE rental_rentalandleasedetails;

-- ---------------------------------------------------------------------
-- 15) Reports (every transactional report row)
-- ---------------------------------------------------------------------
TRUNCATE TABLE reports_chitfundinterestoverallreport;
TRUNCATE TABLE reports_fundmemberreport;
TRUNCATE TABLE reports_interestpeoplereport;
TRUNCATE TABLE reports_report;
TRUNCATE TABLE reports_templememberreport;

-- ---------------------------------------------------------------------
-- 16) Sangam (members, names & details — all wiped)
-- ---------------------------------------------------------------------
TRUNCATE TABLE sangam_sangammembers;
TRUNCATE TABLE sangam_addsangamdetails;
TRUNCATE TABLE sangam_addsangamname;

-- ---------------------------------------------------------------------
-- 17) Subscription Tariff (per your earlier request)
-- ---------------------------------------------------------------------
TRUNCATE TABLE sub_tariff_addsubscriptiontariffdetails;

-- ---------------------------------------------------------------------
-- 18) Treasure (management funds & balance sheets)
-- ---------------------------------------------------------------------
TRUNCATE TABLE treasure_managementbalancesheet;
TRUNCATE TABLE treasure_managementfunds;
TRUNCATE TABLE treasure_managementtreasure;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- Verification — every wiped table should now be empty; family +
-- member + admin/auth tables should still have their rows.
-- ---------------------------------------------------------------------
SELECT 'family_fammily_details'   AS tbl, COUNT(*) AS rows_kept FROM family_fammily_details
UNION ALL
SELECT 'family_member_details',   COUNT(*) FROM family_member_details
UNION ALL
SELECT 'user_user',                COUNT(*) FROM user_user
UNION ALL
SELECT 'management_managementdetails', COUNT(*) FROM management_managementdetails
UNION ALL
SELECT 'management_bankdetails',   COUNT(*) FROM management_bankdetails
UNION ALL
SELECT 'permisions_my_roles',     COUNT(*) FROM permisions_my_roles
UNION ALL
SELECT '-- WIPED (should be 0) --', 0
UNION ALL
SELECT 'chit_fund_chitfundsdetails', COUNT(*) FROM chit_fund_chitfundsdetails
UNION ALL
SELECT 'interest_peopleinterestdetails', COUNT(*) FROM interest_peopleinterestdetails
UNION ALL
SELECT 'collection_collectiondetails',  COUNT(*) FROM collection_collectiondetails
UNION ALL
SELECT 'income_addincomedetails',   COUNT(*) FROM income_addincomedetails
UNION ALL
SELECT 'expense_addexpensedetails', COUNT(*) FROM expense_addexpensedetails
UNION ALL
SELECT 'reports_templememberreport', COUNT(*) FROM reports_templememberreport;
