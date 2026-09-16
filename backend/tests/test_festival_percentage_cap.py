"""
Regression tests for the "Percentage penalty cap = 100%" bug fix on the
festival endpoints.

* POST /api/festival/add_festival_details/  (create)
* PUT  /api/festival/edit_festival_details/<pk>/  (edit)

Rules asserted:
- choice='Percentage' with penalty_amt > 100     -> 400, payload.penalty_amt
- choice='Percentage' with penalty_amt == 100    -> 201 (boundary allowed)
- choice='Percentage' with penalty_amt <  100    -> 201
- choice='Percentage' with penalty_amt == 100.5  -> 400 (fractional over-cap)
- choice='Amount' with penalty_amt == 500        -> 201 (Amount is uncapped)
- PUT edit with Percentage/150 on an existing row -> 400 (cap enforced on edit)
"""
import os
import datetime
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback for pytest when the container's env doesn't expose FE var.
    # We prefer failing fast, but read local ingress just in case.
    BASE_URL = "https://fd32960a-5552-41c8-bee2-e9a5572be60a.preview.emergentagent.com"

LOGIN_URL = f"{BASE_URL}/api/user/login"
ADD_URL   = f"{BASE_URL}/api/festival/add_festival_details/"
EDIT_URL  = f"{BASE_URL}/api/festival/edit_festival_details/"


# ---------- fixtures ----------
@pytest.fixture(scope="module")
def token():
    r = requests.post(LOGIN_URL, json={"email": "admin@gmail.com", "password": "Admin@123"})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    jwt = data.get("jwt") or data.get("token") or data.get("access")
    assert jwt, f"no jwt in login response: {data}"
    return jwt


@pytest.fixture(scope="module")
def headers(token):
    # NOTE: raw JWT (no 'Bearer ' prefix) — see /app/memory/test_credentials.md
    return {"Authorization": token, "Content-Type": "application/json"}


def _payload(name, choice, penalty_amt):
    today = datetime.date.today()
    return {
        "festival_name": name,
        "choice": choice,
        "penalty_amt": penalty_amt,
        "tax_per_head": 100,
        "amount": 100,
        "date": today.isoformat(),
        "start_date": (today + datetime.timedelta(days=2)).isoformat(),
        "end_date":   (today + datetime.timedelta(days=5)).isoformat(),
        "action": True,
    }


def _cleanup(headers, festival_id):
    try:
        requests.delete(f"{EDIT_URL}{festival_id}/", headers=headers, timeout=10)
    except Exception:
        pass


# ---------- ADD tests ----------
class TestAddFestivalPercentageCap:
    def test_percentage_101_rejected(self, headers):
        r = requests.post(ADD_URL, json=_payload("TEST_BugP101", "Percentage", 101), headers=headers)
        assert r.status_code == 400, f"expected 400 got {r.status_code}: {r.text}"
        body = r.json()
        assert "penalty_amt" in body, f"missing key penalty_amt in {body}"
        msg = body["penalty_amt"]
        msg_txt = msg[0] if isinstance(msg, list) else str(msg)
        assert "Penalty percentage cannot exceed 100%" in msg_txt, f"unexpected msg: {msg_txt}"

    def test_percentage_200_rejected(self, headers):
        r = requests.post(ADD_URL, json=_payload("TEST_BugP200", "Percentage", 200), headers=headers)
        assert r.status_code == 400
        assert "penalty_amt" in r.json()

    def test_percentage_100_5_rejected(self, headers):
        r = requests.post(ADD_URL, json=_payload("TEST_BugP1005", "Percentage", 100.5), headers=headers)
        assert r.status_code == 400, f"expected 400 got {r.status_code}: {r.text}"
        assert "penalty_amt" in r.json()

    def test_percentage_100_allowed(self, headers):
        r = requests.post(ADD_URL, json=_payload("TEST_BugP100", "Percentage", 100), headers=headers)
        assert r.status_code == 201, f"expected 201 got {r.status_code}: {r.text}"
        body = r.json()
        assert body["choice"] == "Percentage"
        assert float(body["penalty_amt"]) == 100.0
        _cleanup(headers, body["id"])

    def test_percentage_99_allowed(self, headers):
        r = requests.post(ADD_URL, json=_payload("TEST_BugP99", "Percentage", 99), headers=headers)
        assert r.status_code == 201, f"expected 201 got {r.status_code}: {r.text}"
        body = r.json()
        assert float(body["penalty_amt"]) == 99.0
        _cleanup(headers, body["id"])

    def test_percentage_50_allowed(self, headers):
        r = requests.post(ADD_URL, json=_payload("TEST_BugP50", "Percentage", 50), headers=headers)
        assert r.status_code == 201, f"expected 201 got {r.status_code}: {r.text}"
        _cleanup(headers, r.json()["id"])

    def test_amount_500_allowed_uncapped(self, headers):
        r = requests.post(ADD_URL, json=_payload("TEST_BugA500", "Amount", 500), headers=headers)
        assert r.status_code == 201, f"expected 201 got {r.status_code}: {r.text}"
        body = r.json()
        assert body["choice"] == "Amount"
        assert float(body["penalty_amt"]) == 500.0
        _cleanup(headers, body["id"])


# ---------- EDIT tests ----------
class TestEditFestivalPercentageCap:
    def test_edit_percentage_150_rejected(self, headers):
        # First create a valid festival to edit
        create = requests.post(
            ADD_URL, json=_payload("TEST_BugEditP50", "Percentage", 50), headers=headers
        )
        assert create.status_code == 201, f"seed create failed: {create.text}"
        fid = create.json()["id"]

        try:
            bad = _payload("TEST_BugEditP150", "Percentage", 150)
            r = requests.put(f"{EDIT_URL}{fid}/", json=bad, headers=headers)
            assert r.status_code == 400, f"expected 400 got {r.status_code}: {r.text}"
            assert "penalty_amt" in r.json()
        finally:
            _cleanup(headers, fid)

    def test_edit_amount_uncapped_regression(self, headers):
        # Existing 'Amount' festival can still be edited normally (regression).
        create = requests.post(
            ADD_URL, json=_payload("TEST_BugEditAmt", "Amount", 300), headers=headers
        )
        assert create.status_code == 201, f"seed create failed: {create.text}"
        fid = create.json()["id"]

        try:
            good = _payload("TEST_BugEditAmt2", "Amount", 750)
            r = requests.put(f"{EDIT_URL}{fid}/", json=good, headers=headers)
            # 201 is what the view returns on PUT success
            assert r.status_code in (200, 201), f"expected 200/201 got {r.status_code}: {r.text}"
            body = r.json()
            assert body["choice"] == "Amount"
            assert float(body["penalty_amt"]) == 750.0
        finally:
            _cleanup(headers, fid)
