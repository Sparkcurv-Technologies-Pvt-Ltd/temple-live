"""Regression tests for the chit-fund recompute-cash-inhand endpoint.

Endpoint: /api/chit_fund/recompute_cash_inhand/<pk>/  (GET & POST)

Covers:
  * dry_run does NOT mutate DB
  * non-dry-run updates DB to computed value
  * second call is idempotent (delta_applied == 0)
  * unknown pk -> 404
  * unauthenticated request rejected

Uses live preview DB & backend. Restores the original stored value at the
end so the preview DB is left untouched.
"""

import os
import subprocess
from decimal import Decimal

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://fd32960a-5552-41c8-bee2-e9a5572be60a.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "Admin@123"

CHIT_FUND_ID = 1  # AMMAN FINANCE — seeded on preview

# Credit / debit sets — must mirror the endpoint implementation
CASH_CREDIT_CHOICES = {"Investment", "Interest", "Profit", "Principal Pay", "Addition"}
CASH_DEBIT_CHOICES = {"Distribution", "Reduction", "Principal Given"}


def _db_cash_inhand(pk: int) -> Decimal:
    """Read the stored cash_inhand_amount directly from MariaDB via the mysql CLI."""
    out = subprocess.check_output(
        [
            "mysql", "-u", "root", "-N", "-B", "temple",
            "-e", f"SELECT cash_inhand_amount FROM chit_fund_chitfundsdetails WHERE id={pk};",
        ],
        stderr=subprocess.STDOUT,
    ).decode().strip()
    assert out, f"No row found for chit fund id={pk}"
    return Decimal(out)


def _db_set_cash_inhand(pk: int, value: Decimal):
    subprocess.check_call(
        [
            "mysql", "-u", "root", "temple",
            "-e", f"UPDATE chit_fund_chitfundsdetails SET cash_inhand_amount={value} WHERE id={pk};",
        ]
    )


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def jwt_token(api_client):
    r = api_client.post(
        f"{BASE_URL}/api/user/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=30,
    )
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text[:300]}"
    token = r.json().get("jwt")
    assert token, f"login response missing jwt: {r.text[:300]}"
    return token


@pytest.fixture(scope="module")
def auth_headers(jwt_token):
    # NOTE: this app uses a raw JWT (no 'Bearer ' prefix)
    return {"Authorization": jwt_token}


@pytest.fixture(scope="module", autouse=True)
def _restore_cash_inhand_after_module():
    """Snapshot cash_inhand_amount before the module runs and restore after."""
    original = _db_cash_inhand(CHIT_FUND_ID)
    yield
    _db_set_cash_inhand(CHIT_FUND_ID, original)


# ---------------------------------------------------------------------------
# 1. dry_run -> does NOT mutate DB
# ---------------------------------------------------------------------------
class TestDryRun:
    def test_dry_run_response_shape(self, api_client, auth_headers):
        r = api_client.get(
            f"{BASE_URL}/api/chit_fund/recompute_cash_inhand/{CHIT_FUND_ID}/?dry_run=1",
            headers=auth_headers, timeout=60,
        )
        assert r.status_code == 200, r.text[:400]
        body = r.json()

        # top-level keys
        for k in ("chit_fund_id", "chit_name", "stored_cash_inhand",
                  "recomputed_cash_inhand", "delta_applied", "dry_run",
                  "components"):
            assert k in body, f"missing key {k} in response: {body}"

        assert body["chit_fund_id"] == CHIT_FUND_ID
        assert body["dry_run"] is True
        # delta must be zero when dry_run
        assert Decimal(body["delta_applied"]) == Decimal("0"), body

        # components keys
        comp = body["components"]
        for k in ("management_amt", "credit_total", "debit_total",
                  "credit_breakdown", "debit_breakdown", "report_row_count"):
            assert k in comp, f"missing components.{k}: {comp}"
        assert isinstance(comp["credit_breakdown"], dict)
        assert isinstance(comp["debit_breakdown"], dict)
        assert isinstance(comp["report_row_count"], int)

        # formula: recomputed == mgmt + credit - debit
        mgmt = Decimal(comp["management_amt"])
        credit = Decimal(comp["credit_total"])
        debit = Decimal(comp["debit_total"])
        assert Decimal(body["recomputed_cash_inhand"]) == mgmt + credit - debit

        # breakdown keys must all be in the whitelisted choice sets
        for choice in comp["credit_breakdown"].keys():
            assert choice in CASH_CREDIT_CHOICES, choice
        for choice in comp["debit_breakdown"].keys():
            assert choice in CASH_DEBIT_CHOICES, choice

    def test_dry_run_does_not_mutate_db(self, api_client, auth_headers):
        before = _db_cash_inhand(CHIT_FUND_ID)
        r = api_client.get(
            f"{BASE_URL}/api/chit_fund/recompute_cash_inhand/{CHIT_FUND_ID}/?dry_run=1",
            headers=auth_headers, timeout=60,
        )
        assert r.status_code == 200
        after = _db_cash_inhand(CHIT_FUND_ID)
        assert before == after, f"dry_run mutated DB: {before} -> {after}"
        # response's stored_cash_inhand should match live DB value
        assert Decimal(r.json()["stored_cash_inhand"]) == before


# ---------------------------------------------------------------------------
# 2. Non-dry-run -> writes recomputed to DB, then idempotent
# ---------------------------------------------------------------------------
class TestPersistAndIdempotent:
    def test_post_persists_and_is_idempotent(self, api_client, auth_headers):
        # First call — may apply a non-zero delta
        stored_before = _db_cash_inhand(CHIT_FUND_ID)
        r1 = api_client.post(
            f"{BASE_URL}/api/chit_fund/recompute_cash_inhand/{CHIT_FUND_ID}/",
            headers=auth_headers, timeout=60,
        )
        assert r1.status_code == 200, r1.text[:400]
        b1 = r1.json()
        assert b1["dry_run"] is False
        recomputed = Decimal(b1["recomputed_cash_inhand"])
        assert Decimal(b1["stored_cash_inhand"]) == stored_before
        assert Decimal(b1["delta_applied"]) == recomputed - stored_before

        # DB must now reflect the recomputed value
        assert _db_cash_inhand(CHIT_FUND_ID) == recomputed, (
            "DB cash_inhand not updated after non-dry_run POST"
        )

        # Second call — should be a no-op (idempotent)
        r2 = api_client.post(
            f"{BASE_URL}/api/chit_fund/recompute_cash_inhand/{CHIT_FUND_ID}/",
            headers=auth_headers, timeout=60,
        )
        assert r2.status_code == 200, r2.text[:400]
        b2 = r2.json()
        assert Decimal(b2["stored_cash_inhand"]) == recomputed
        assert Decimal(b2["recomputed_cash_inhand"]) == recomputed
        assert Decimal(b2["delta_applied"]) == Decimal("0"), (
            f"expected delta 0 on idempotent call, got {b2['delta_applied']}"
        )

    def test_dry_run_in_json_body(self, api_client, auth_headers):
        """dry_run also accepted via JSON body."""
        r = api_client.post(
            f"{BASE_URL}/api/chit_fund/recompute_cash_inhand/{CHIT_FUND_ID}/",
            headers=auth_headers,
            json={"dry_run": True},
            timeout=60,
        )
        assert r.status_code == 200, r.text[:400]
        body = r.json()
        assert body["dry_run"] is True
        assert Decimal(body["delta_applied"]) == Decimal("0")


# ---------------------------------------------------------------------------
# 3. Error cases
# ---------------------------------------------------------------------------
class TestErrorCases:
    def test_unknown_pk_returns_404(self, api_client, auth_headers):
        r = api_client.post(
            f"{BASE_URL}/api/chit_fund/recompute_cash_inhand/9999999/",
            headers=auth_headers, timeout=30,
        )
        assert r.status_code == 404, r.text[:400]
        assert r.json() == {"message": "Chit fund not found"}

    def test_unauthenticated_rejected(self, api_client):
        r = api_client.post(
            f"{BASE_URL}/api/chit_fund/recompute_cash_inhand/{CHIT_FUND_ID}/",
            timeout=30,
        )
        # Spec asks for 401, but this app-wide token_checking raises
        # DRF AuthenticationFailed which returns 403 unless the view
        # wraps it (like penalty_views._require_auth does). Accept
        # either 401 or 403 to guard against auth bypass, but flag 403
        # as a minor consistency issue in the test report.
        assert r.status_code in (401, 403), (
            f"expected 401/403 got {r.status_code} body={r.text[:200]}"
        )


# ---------------------------------------------------------------------------
# 4. Formula sanity — recompute again from raw report rows via SQL
# ---------------------------------------------------------------------------
class TestFormulaAgainstSQL:
    def test_recomputed_matches_sql_aggregation(self, api_client, auth_headers):
        # Ask the endpoint for the recomputed value (dry_run)
        r = api_client.get(
            f"{BASE_URL}/api/chit_fund/recompute_cash_inhand/{CHIT_FUND_ID}/?dry_run=1",
            headers=auth_headers, timeout=60,
        )
        body = r.json()
        mgmt = Decimal(body["components"]["management_amt"])

        # Reproduce the aggregation directly in SQL
        credit_sql = (
            "SELECT COALESCE(SUM(amount),0) FROM reports_chitfundinterestoverallreport "
            f"WHERE chitfund_id={CHIT_FUND_ID} AND income_choice IN "
            "('Investment','Interest','Profit','Principal Pay','Addition');"
        )
        debit_sql = (
            "SELECT COALESCE(SUM(amount),0) FROM reports_chitfundinterestoverallreport "
            f"WHERE chitfund_id={CHIT_FUND_ID} AND income_choice IN "
            "('Distribution','Reduction','Principal Given');"
        )
        credit = Decimal(
            subprocess.check_output(
                ["mysql", "-u", "root", "-N", "-B", "temple", "-e", credit_sql]
            ).decode().strip()
        )
        debit = Decimal(
            subprocess.check_output(
                ["mysql", "-u", "root", "-N", "-B", "temple", "-e", debit_sql]
            ).decode().strip()
        )
        expected = mgmt + credit - debit
        assert Decimal(body["recomputed_cash_inhand"]) == expected, (
            f"endpoint recomputed={body['recomputed_cash_inhand']} but "
            f"SQL says mgmt({mgmt}) + credit({credit}) - debit({debit}) = {expected}"
        )
