#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Safe wipe of balance-sheet + report tables while preserving family / chit
# fund data. Meant to be run on the EC2 testing server.
#
# Usage:
#   export DB_HOST=127.0.0.1 DB_PORT=3306 DB_NAME=temple DB_USER=appadmin MYSQL_PWD=xxxx
#   bash scripts/wipe_bs_reports.sh check     # 1. show FK dependencies
#   bash scripts/wipe_bs_reports.sh dryrun    # 2. row counts only (no delete)
#   bash scripts/wipe_bs_reports.sh backup    # 3. mysqldump backup only
#   bash scripts/wipe_bs_reports.sh delete    # 4. DELETE inside txn -> ROLLBACK by default
#   bash scripts/wipe_bs_reports.sh commit    # 5. DELETE inside txn -> COMMIT for real
#   bash scripts/wipe_bs_reports.sh restore <backup.sql.gz>   # 6. restore from a backup
#
# Notes:
# * Requires: mysql, mysqldump, gzip
# * Never resets AUTO_INCREMENT.
# * Uses DELETE (not TRUNCATE) so the operation is inside a MySQL transaction.
# * Uses SET FOREIGN_KEY_CHECKS = 0/1 only for the DELETE step.
# ---------------------------------------------------------------------------

set -euo pipefail

: "${DB_HOST:?set DB_HOST}"
: "${DB_PORT:?set DB_PORT}"
: "${DB_NAME:?set DB_NAME}"
: "${DB_USER:?set DB_USER}"
: "${MYSQL_PWD:?set MYSQL_PWD (mysql reads this env var, avoids leaking password on the CLI)}"

WIPE_TABLES=(
  balancesheet_fundbalancesheet
  balancesheet_fundmembersbalancesheet
  balancesheet_moveablerentbalancesheet
  balancesheet_peopleinterestbalancesheet
  balancesheet_rentalbalancesheet
  reports_chitfundinterestoverallreport
  reports_fundmemberreport
  reports_interestpeoplereport
  reports_report
  reports_templememberreport
)

PRESERVE_TABLES=(
  family_fammily_details
  family_member_details
  chit_fund_chitfundinvesters
  chit_fund_chitfundsdetails
)

mysql_client() {
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" -t "$@"
}

case "${1:-}" in

  check)
    echo "==> Foreign-key constraints referencing tables in the wipe list:"
    mysql_client <<SQL
SELECT
    kcu.TABLE_NAME               AS child_table,
    kcu.COLUMN_NAME              AS child_column,
    kcu.CONSTRAINT_NAME          AS fk_name,
    kcu.REFERENCED_TABLE_NAME    AS parent_table,
    kcu.REFERENCED_COLUMN_NAME   AS parent_column
FROM information_schema.KEY_COLUMN_USAGE kcu
WHERE kcu.CONSTRAINT_SCHEMA = '${DB_NAME}'
  AND kcu.REFERENCED_TABLE_NAME IN (
$(printf "        '%s',\n" "${WIPE_TABLES[@]}" | sed '$s/,$//')
      )
ORDER BY parent_table, child_table;
SQL
    echo
    echo "==> If any child_table is a family_* / chit_fund_* row, STOP and review before deleting."
    ;;

  dryrun)
    echo "==> DRY RUN — row counts that WOULD be deleted:"
    {
      first=1
      for t in "${WIPE_TABLES[@]}"; do
        if [[ $first -eq 1 ]]; then
          echo "SELECT '$t' AS table_name, COUNT(*) AS rows_that_would_be_deleted FROM $t"
          first=0
        else
          echo "UNION ALL SELECT '$t', COUNT(*) FROM $t"
        fi
      done
      echo ";"
    } | mysql_client
    ;;

  backup)
    mkdir -p ~/db_backups
    STAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP=~/db_backups/wipe_bs_reports_${STAMP}.sql.gz
    echo "==> Dumping affected tables to $BACKUP …"
    mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" \
        --single-transaction --routines --triggers \
        --add-drop-table --extended-insert \
        "$DB_NAME" "${WIPE_TABLES[@]}" \
        | gzip -c > "$BACKUP"
    echo "==> Backup written: $BACKUP  ($(du -h "$BACKUP" | cut -f1))"
    ;;

  delete|commit)
    if [[ "${1}" == "commit" ]]; then
      FINAL_STMT="COMMIT;"
      MODE_LABEL="COMMIT — real delete"
    else
      FINAL_STMT="ROLLBACK;"
      MODE_LABEL="ROLLBACK — verification pass, nothing kept"
    fi
    echo "==> Running wipe in $MODE_LABEL mode"
    {
      echo "START TRANSACTION;"
      echo "SET FOREIGN_KEY_CHECKS = 0;"
      # BEFORE counts
      first=1
      for t in "${WIPE_TABLES[@]}"; do
        if [[ $first -eq 1 ]]; then
          echo "SELECT 'BEFORE' AS phase, '$t' AS t, COUNT(*) AS n FROM $t"; first=0
        else
          echo "UNION ALL SELECT 'BEFORE','$t',COUNT(*) FROM $t"
        fi
      done
      echo ";"
      # Actual deletes
      for t in "${WIPE_TABLES[@]}"; do
        echo "DELETE FROM $t;"
      done
      # AFTER counts (should all be 0)
      first=1
      for t in "${WIPE_TABLES[@]}"; do
        if [[ $first -eq 1 ]]; then
          echo "SELECT 'AFTER' AS phase, '$t' AS t, COUNT(*) AS n FROM $t"; first=0
        else
          echo "UNION ALL SELECT 'AFTER','$t',COUNT(*) FROM $t"
        fi
      done
      echo ";"
      # PRESERVED counts (should be unchanged)
      first=1
      for t in "${PRESERVE_TABLES[@]}"; do
        if [[ $first -eq 1 ]]; then
          echo "SELECT 'PRESERVED' AS phase, '$t' AS t, COUNT(*) AS n FROM $t"; first=0
        else
          echo "UNION ALL SELECT 'PRESERVED','$t',COUNT(*) FROM $t"
        fi
      done
      echo ";"
      echo "SET FOREIGN_KEY_CHECKS = 1;"
      echo "$FINAL_STMT"
    } | mysql_client
    ;;

  restore)
    BACKUP="${2:-}"
    [[ -f "$BACKUP" ]] || { echo "Missing backup file: $BACKUP"; exit 1; }
    echo "==> Restoring $BACKUP into $DB_NAME"
    gunzip -c "$BACKUP" | mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME"
    echo "==> Restore done."
    ;;

  *)
    cat <<HELP
Usage:  $0 <check|dryrun|backup|delete|commit|restore <file.sql.gz>>

Recommended order on a live server:
  1. $0 check          # inspect foreign keys — anything pointing at family/chit_fund? STOP.
  2. $0 dryrun         # note the row counts
  3. $0 backup         # take mysqldump backup of ONLY the affected tables
  4. $0 delete         # runs DELETEs inside a transaction, then ROLLS BACK (safe verification)
  5. review the output — AFTER counts must be 0, PRESERVED counts unchanged
  6. $0 commit         # for real this time — same DELETE inside a transaction, ends with COMMIT
HELP
    exit 1
    ;;
esac
