"""Backend pytest suite for the Temple Mgmt penalty engine.

Covers:
 - Auth (login) endpoint
 - GET /api/penalty/summary/
 - POST /api/penalty/recompute/  (idempotency)
 - GET /api/penalty/pending/
 - Penalty math (penalty_amount == 25 * missed_months when no prior payment)
 - 401 enforcement when Authorization header is missing
 - Legacy /api/user/admins_view/ sanity check
"""
from __future__ import annotations

import os
import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://fd32960a-5552-41c8-bee2-e9a5572be60a.preview.emergentagent.com",
).rstrip("/")

ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "Admin@123"
EXPECTED_RATE = 25.0


# ---------- fixtures ----------
@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def jwt_token(api_client):
    r = api_client.post(
        f"{BASE_URL}/api/user/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=30,
    )
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text[:300]}"
    data = r.json()
    assert "jwt" in data, f"no jwt in response: {data}"
    assert isinstance(data["jwt"], str) and len(data["jwt"]) > 0
    return data["jwt"]


@pytest.fixture(scope="session")
def auth_headers(jwt_token):
    # token_app.views.token_checking reads request.headers.get('Authorization')
    # and passes raw value to jwt.decode -> NO 'Bearer ' prefix
    return {"Authorization": jwt_token, "Content-Type": "application/json"}


# ---------- 1. Auth ----------
class TestAuth:
    def test_login_returns_jwt(self, api_client):
        r = api_client.post(
            f"{BASE_URL}/api/user/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=30,
        )
        assert r.status_code == 200
        body = r.json()
        assert "jwt" in body
        assert body.get("email") == ADMIN_EMAIL


# ---------- 2. /api/penalty/summary/ ----------
class TestPenaltySummary:
    def test_summary_ok_and_shape(self, api_client, auth_headers):
        r = api_client.get(f"{BASE_URL}/api/penalty/summary/", headers=auth_headers, timeout=60)
        assert r.status_code == 200, r.text[:500]
        data = r.json()
        for key in ("rate_per_month", "scanned", "updated", "with_penalty", "total_pending_penalty"):
            assert key in data, f"missing key {key} in {data}"
        assert data["rate_per_month"] == EXPECTED_RATE
        assert data["total_pending_penalty"] > 0, (
            f"expected >0 pending penalty, got {data['total_pending_penalty']}"
        )

    def test_summary_requires_auth(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/penalty/summary/", timeout=30)
        assert r.status_code == 401, f"expected 401 got {r.status_code} body={r.text[:200]}"


# ---------- 3. /api/penalty/recompute/ ----------
class TestPenaltyRecompute:
    def test_recompute_ok_and_idempotent(self, api_client, auth_headers):
        r1 = api_client.post(f"{BASE_URL}/api/penalty/recompute/", headers=auth_headers, timeout=120)
        assert r1.status_code == 200, r1.text[:500]
        s1 = r1.json()
        assert s1["rate_per_month"] == EXPECTED_RATE
        assert s1["total_pending_penalty"] > 0

        r2 = api_client.post(f"{BASE_URL}/api/penalty/recompute/", headers=auth_headers, timeout=120)
        assert r2.status_code == 200, r2.text[:500]
        s2 = r2.json()
        assert s2["total_pending_penalty"] == s1["total_pending_penalty"], (
            "recompute is NOT idempotent: "
            f"{s1['total_pending_penalty']} -> {s2['total_pending_penalty']}"
        )
        # Second call should not have updated anything new
        assert s2["updated"] == 0, f"second recompute updated {s2['updated']} rows; should be 0"

    def test_recompute_requires_auth(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/penalty/recompute/", timeout=30)
        assert r.status_code == 401, f"expected 401 got {r.status_code}"


# ---------- 4. /api/penalty/pending/ ----------
class TestPenaltyPending:
    def test_pending_ok_and_shape(self, api_client, auth_headers):
        r = api_client.get(f"{BASE_URL}/api/penalty/pending/", headers=auth_headers, timeout=120)
        assert r.status_code == 200, r.text[:500]
        data = r.json()
        assert data["rate_per_month"] == EXPECTED_RATE
        assert data["count"] > 0, "expected at least one pending penalty row"
        assert isinstance(data["results"], list) and len(data["results"]) > 0
        item = data["results"][0]
        for k in (
            "member_id", "member_name", "category", "due_date",
            "missed_months", "penalty_amount", "penalty_balance",
        ):
            assert k in item, f"missing field {k} in item {item}"
        assert isinstance(item["missed_months"], int)
        assert item["penalty_balance"] >= 0

    def test_pending_math_25_per_missed_month(self, api_client, auth_headers):
        r = api_client.get(f"{BASE_URL}/api/penalty/pending/", headers=auth_headers, timeout=120)
        assert r.status_code == 200
        results = r.json()["results"]
        # find first row where penalty_balance == penalty_amount (no prior partial payment)
        candidate = next(
            (x for x in results
             if x["penalty_amount"] > 0
             and abs(x["penalty_balance"] - x["penalty_amount"]) < 1e-6),
            None,
        )
        assert candidate is not None, (
            "no pending row had penalty_balance == penalty_amount; cannot verify math"
        )
        expected = EXPECTED_RATE * candidate["missed_months"]
        assert abs(candidate["penalty_amount"] - expected) < 1e-6, (
            f"penalty math failed: penalty_amount={candidate['penalty_amount']} "
            f"vs 25*{candidate['missed_months']}={expected} item={candidate}"
        )

    def test_pending_rate_stable_across_calls(self, api_client, auth_headers):
        rates = []
        for _ in range(3):
            r = api_client.get(f"{BASE_URL}/api/penalty/pending/", headers=auth_headers, timeout=120)
            assert r.status_code == 200
            rates.append(r.json()["rate_per_month"])
        assert all(x == EXPECTED_RATE for x in rates), f"rate varied: {rates}"

    def test_pending_requires_auth(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/penalty/pending/", timeout=30)
        assert r.status_code == 401, f"expected 401 got {r.status_code}"


# ---------- 5. Legacy endpoint sanity ----------
class TestLegacy:
    def test_admins_view_ok(self, api_client, auth_headers):
        r = api_client.get(f"{BASE_URL}/api/user/admins_view/", headers=auth_headers, timeout=60)
        assert r.status_code == 200, (
            f"legacy /api/user/admins_view/ returned {r.status_code}: {r.text[:300]}"
        )
