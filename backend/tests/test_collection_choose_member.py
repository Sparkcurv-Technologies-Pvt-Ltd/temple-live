"""Backend pytest suite for the Collection "Choose Member" dropdown fix.

Covers `POST /api/collection/get_select_member_collection/`:
 - Subscription Tariff, explicit type=14: must NOT include members whose row
   for sub_tariff_id=14 has paid=1.
 - Subscription Tariff, empty type: backend must fall back to the LATEST
   active tariff (order by -id where action=True) and return unpaid members
   for that tariff only.
 - Regression: Festival (type=1) -> 48 members. Death Tariff (type=42) -> 105
   members.
 - Auth: raw JWT (no Bearer prefix).
"""
from __future__ import annotations

import os
import pytest
import requests
import pymysql

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://fd32960a-5552-41c8-bee2-e9a5572be60a.preview.emergentagent.com",
).rstrip("/")

ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "Admin@123"

ENDPOINT = f"{BASE_URL}/api/collection/get_select_member_collection/"


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
    assert "jwt" in data
    return data["jwt"]


@pytest.fixture(scope="session")
def auth_headers(jwt_token):
    return {"Authorization": jwt_token, "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def db_conn():
    conn = pymysql.connect(
        host="127.0.0.1", user="appadmin", password="appadmin", database="temple",
        cursorclass=pymysql.cursors.DictCursor,
    )
    yield conn
    conn.close()


# ---------- helpers ----------
def _member_ids(resp_json):
    """Extract member ids from response list (tolerant of shape)."""
    ids = []
    if isinstance(resp_json, list):
        for item in resp_json:
            if isinstance(item, dict):
                mid = item.get("id") or item.get("member_id") or item.get("member")
                if isinstance(mid, dict):
                    mid = mid.get("id")
                if mid is not None:
                    ids.append(int(mid))
    return ids


# ---------- 1. Subscription Tariff with explicit type=14 ----------
class TestSubscriptionTariffExplicit:
    def test_paid_members_excluded_for_sub_tariff_14(self, api_client, auth_headers, db_conn):
        payload = {"category": "Subscription Tariff", "type": 14}
        r = api_client.post(ENDPOINT, json=payload, headers=auth_headers, timeout=30)
        assert r.status_code == 200, f"got {r.status_code}: {r.text[:400]}"
        data = r.json()
        assert isinstance(data, list), f"expected list, got: {type(data)} {str(data)[:200]}"
        returned_ids = set(_member_ids(data))

        # DB paid=1 members for sub_tariff 14 - must NOT be in returned list
        with db_conn.cursor() as cur:
            cur.execute(
                "SELECT DISTINCT member_id FROM amount_peoplesamountdetails "
                "WHERE sub_tariff_id=14 AND paid=1"
            )
            paid_ids = {row["member_id"] for row in cur.fetchall()}

        assert paid_ids, "test data precondition: at least 1 paid row expected for sub_tariff=14"
        overlap = paid_ids & returned_ids
        assert not overlap, (
            f"Members {overlap} are marked paid for sub_tariff 14 but still returned "
            f"by Choose Member endpoint"
        )

    def test_string_type_also_works(self, api_client, auth_headers):
        # Endpoint must accept string form too (frontend sometimes sends str)
        payload = {"category": "Subscription Tariff", "type": "14"}
        r = api_client.post(ENDPOINT, json=payload, headers=auth_headers, timeout=30)
        assert r.status_code == 200, f"got {r.status_code}: {r.text[:400]}"
        assert isinstance(r.json(), list)


# ---------- 2. Subscription Tariff empty type -> latest active fallback ----------
class TestSubscriptionTariffEmpty:
    def test_empty_type_falls_back_to_latest_active(self, api_client, auth_headers, db_conn):
        payload = {"category": "Subscription Tariff", "type": ""}
        r = api_client.post(ENDPOINT, json=payload, headers=auth_headers, timeout=30)
        assert r.status_code == 200, f"got {r.status_code}: {r.text[:400]}"
        data = r.json()
        assert isinstance(data, list)
        returned_count = len(data)

        with db_conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM sub_tariff_addsubscriptiontariffdetails "
                "WHERE action=1 ORDER BY id DESC LIMIT 1"
            )
            row = cur.fetchone()
            assert row, "no active subscription tariff in DB"
            latest_id = row["id"]

            cur.execute(
                "SELECT COUNT(DISTINCT member_id) AS c "
                "FROM amount_peoplesamountdetails "
                "WHERE sub_tariff_id=%s AND paid=0",
                (latest_id,),
            )
            expected_count = cur.fetchone()["c"]

        assert returned_count == expected_count, (
            f"latest active sub_tariff id={latest_id}: expected {expected_count} unpaid "
            f"members, endpoint returned {returned_count}"
        )


# ---------- 3. Regression: Festival and Death Tariff ----------
class TestRegression:
    def test_festival_id_1_returns_48(self, api_client, auth_headers):
        r = api_client.post(
            ENDPOINT,
            json={"category": "Festival", "type": 1},
            headers=auth_headers, timeout=30,
        )
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 48, f"Festival id=1 expected 48 members, got {len(data)}"

    def test_death_tariff_id_42_returns_105(self, api_client, auth_headers):
        r = api_client.post(
            ENDPOINT,
            json={"category": "Death Tariff", "type": 42},
            headers=auth_headers, timeout=30,
        )
        assert r.status_code == 200, f"{r.status_code}: {r.text[:300]}"
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 105, f"Death Tariff id=42 expected 105 members, got {len(data)}"


# ---------- 4. Auth ----------
class TestAuth:
    def test_missing_auth_header_is_unauthorized(self, api_client):
        r = api_client.post(
            ENDPOINT,
            json={"category": "Subscription Tariff", "type": 14},
            timeout=30,
        )
        # Either 401 (proper) or 403 (DRF default) - anything but 200
        assert r.status_code in (401, 403), (
            f"expected 401/403 without auth, got {r.status_code}: {r.text[:200]}"
        )
