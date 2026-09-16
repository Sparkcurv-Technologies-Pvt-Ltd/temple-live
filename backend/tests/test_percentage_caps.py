"""
Percentage-cap regression tests across all serializers that must reject
percentages > 100 when their type flag is set to 'Percentage'.

Also validates: expense/income POST works WITHOUT 'category' / 'category_name'.

Backend contract:
- Login: POST /api/user/login  -> body.jwt (raw, no Bearer)
- Auth: send jwt as raw Authorization header value.
"""
import os
import datetime
import pytest
import requests

BASE_URL = (
    os.environ.get("REACT_APP_BACKEND_URL")
    or os.environ.get("VITE_BACKEND_URL")
    or "https://fd32960a-5552-41c8-bee2-e9a5572be60a.preview.emergentagent.com"
).rstrip("/")

LOGIN_URL = f"{BASE_URL}/api/user/login"


@pytest.fixture(scope="module")
def headers():
    r = requests.post(
        LOGIN_URL,
        json={"email": "admin@gmail.com", "password": "Admin@123"},
        timeout=15,
    )
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    jwt = r.json().get("jwt")
    assert jwt, f"no jwt: {r.text}"
    return {"Authorization": jwt, "Content-Type": "application/json"}


def _first_error_msg(body, key):
    """Return first error string for a serializer key or ''."""
    if not isinstance(body, dict):
        return ""
    v = body.get(key)
    if isinstance(v, list) and v:
        return str(v[0])
    return str(v) if v is not None else ""


# ---------------------------------------------------------------------------
# 1) CHIT FUND: set_profit_percent, set_intrest_percent caps
# ---------------------------------------------------------------------------
class TestChitFundPercentageCap:
    """POST /api/chit_fund/add_chit_fund/ — cap set_profit_percent & set_intrest_percent."""

    URL = None

    @classmethod
    def setup_class(cls):
        cls.URL = f"{BASE_URL}/api/chit_fund/add_chit_fund/"

    def _payload(self, set_profit=10, set_intr=10):
        today = datetime.date.today().isoformat()
        # The view expects flattened chit[N][...] keys + field_count.
        return {
            "chit_name": "TEST_CapChit",
            "starting_date": today,
            "management_amt": "0",
            "management_share_count": "0",
            "fixed_chitfund_amount": "0",
            "set_profit_percent": set_profit,
            "set_intrest_percent": set_intr,
            "field_count": "1",
            "chit[1][invester_member]": "",
            "chit[1][invester_type]": "Member",
            "chit[1][invester_name]": "TEST_Investor",
            "chit[1][invester_address]": "TEST_addr",
            "chit[1][invester_email]": "test_cap@example.com",
            "chit[1][invester_mobile]": "9999999999",
            "chit[1][investment_amt]": "1000",
            "chit[1][share_count]": "1",
        }

    def test_profit_101_rejected(self, headers):
        r = requests.post(self.URL, json=self._payload(set_profit=101), headers=headers, timeout=15)
        assert r.status_code == 400, f"expected 400 got {r.status_code}: {r.text}"
        body = r.json()
        assert "set_profit_percent" in body, f"key missing: {body}"
        assert "cannot exceed 100" in _first_error_msg(body, "set_profit_percent").lower()

    def test_interest_150_rejected(self, headers):
        r = requests.post(self.URL, json=self._payload(set_intr=150), headers=headers, timeout=15)
        assert r.status_code == 400, f"expected 400 got {r.status_code}: {r.text}"
        body = r.json()
        assert "set_intrest_percent" in body, f"key missing: {body}"
        assert "cannot exceed 100" in _first_error_msg(body, "set_intrest_percent").lower()

    def test_profit_100_boundary_ok(self, headers):
        r = requests.post(self.URL, json=self._payload(set_profit=100, set_intr=100),
                          headers=headers, timeout=20)
        # Success is 201 (or 200); other 2xx are also acceptable so long as it's not the 400 cap.
        assert r.status_code in (200, 201), f"expected 2xx got {r.status_code}: {r.text}"
        # cleanup best-effort
        try:
            cid = r.json().get("id")
            if cid:
                requests.delete(
                    f"{BASE_URL}/api/chit_fund/edit_chit_fund/{cid}/",
                    headers=headers, timeout=10,
                )
        except Exception:
            pass


# ---------------------------------------------------------------------------
# 2) INTEREST: penalty_amount / fix_interest_rate_percent caps
# ---------------------------------------------------------------------------
class TestInterestPercentageCap:
    """POST /api/interest/add_interest_given_details/ — percentage caps."""

    URL = None

    @classmethod
    def setup_class(cls):
        cls.URL = f"{BASE_URL}/api/interest/add_interest_given_details/"

    def _base(self):
        today = datetime.date.today()
        return {
            "interest_date": today.isoformat(),
            "interest_type": "Management Interest",
            "interest_category": "Interest",
            "people_type": "Member",
            "people_name": "TEST_person",
            "people_address": "TEST_addr",
            "people_email": "test@example.com",
            "people_mobile": "9999999999",
            "principal_amt": "1000",
            "interest_amt": "10",
            "interest_period": "1",
            "interest_period_type": "Month",
            "installment_amt": "0",
            "action": True,
        }

    def test_penalty_101_percentage_rejected(self, headers):
        payload = self._base()
        payload.update({
            "penalty_type": "percentage",
            "penalty_amount": 101,
        })
        r = requests.post(self.URL, json=payload, headers=headers, timeout=15)
        assert r.status_code == 400, f"expected 400 got {r.status_code}: {r.text}"
        assert "penalty_amount" in r.json(), r.text

    def test_penalty_50_percentage_accepted_by_validator(self, headers):
        """Penalty=50 must NOT be rejected by percentage-cap validator."""
        payload = self._base()
        payload.update({
            "penalty_type": "percentage",
            "penalty_amount": 50,
        })
        r = requests.post(self.URL, json=payload, headers=headers, timeout=15)
        # 201 = created; 226 = "Insufficient cash" – both prove cap did NOT fire.
        # If it's 400 with penalty_amount key -> that would be the regression.
        if r.status_code == 400:
            body = r.json()
            assert "penalty_amount" not in body, (
                f"Regression: penalty_amount capped at 50 (<100). body={body}"
            )
        else:
            assert r.status_code in (200, 201, 226), f"unexpected: {r.status_code} {r.text}"

    def test_fix_interest_rate_101_rejected(self, headers):
        payload = self._base()
        payload.update({
            "interest_type_new": "percentage",
            "fix_interest_rate_percent": 101,
        })
        r = requests.post(self.URL, json=payload, headers=headers, timeout=15)
        assert r.status_code == 400, f"expected 400 got {r.status_code}: {r.text}"
        assert "fix_interest_rate_percent" in r.json(), r.text


# ---------------------------------------------------------------------------
# 3) SUB TARIFF penalty percentage cap
# ---------------------------------------------------------------------------
class TestSubTariffPercentageCap:
    """POST /api/sub_tariff/add_tariff_details/ — penalty_amt cap when %."""

    URL = None

    @classmethod
    def setup_class(cls):
        cls.URL = f"{BASE_URL}/api/sub_tariff/add_tariff_details/"

    def _payload(self, pen=200):
        today = datetime.date.today()
        return {
            "date": today.isoformat(),
            "from_date": (today + datetime.timedelta(days=1)).isoformat(),
            "to_date": (today + datetime.timedelta(days=30)).isoformat(),
            "tariff_amount": 100,
            "exp_amount_type": "Amount",
            "exp_amount": 10,
            "penalty_amount_type": "Percentage",
            "penalty_amt": pen,
            "action": True,
        }

    def test_penalty_200_percentage_rejected(self, headers):
        r = requests.post(self.URL, json=self._payload(200), headers=headers, timeout=15)
        # If an active tariff already exists the endpoint returns 406 BEFORE serializer runs.
        # In that case we accept and skip — we cannot exercise the cap.
        if r.status_code == 406:
            pytest.skip(f"Active tariff exists in DB; cap path unreachable: {r.text}")
        assert r.status_code == 400, f"expected 400 got {r.status_code}: {r.text}"
        assert "penalty_amt" in r.json(), r.text


# ---------------------------------------------------------------------------
# 4) DEATH: tariff_peanalty cap when Percentage
# ---------------------------------------------------------------------------
class TestDeathPercentageCap:
    """POST /api/death/add_death_details/ — tariff_peanalty cap when %."""

    URL = None

    @classmethod
    def setup_class(cls):
        cls.URL = f"{BASE_URL}/api/death/add_death_details/"

    def _payload(self, pen=250):
        today = datetime.date.today()
        return {
            "death_no": "",
            "death_date": (today - datetime.timedelta(days=1)).isoformat(),
            "penalty_apply_date": (today + datetime.timedelta(days=5)).isoformat(),
            "death_name": "TEST_dead",
            "pen_amt_type": "Percentage",
            "tariff_peanalty": pen,
            "action": True,
        }

    def test_tariff_penalty_250_rejected(self, headers):
        r = requests.post(self.URL, json=self._payload(250), headers=headers, timeout=15)
        assert r.status_code == 400, f"expected 400 got {r.status_code}: {r.text}"
        body = r.json()
        assert "tariff_peanalty" in body, f"key missing: {body}"


# ---------------------------------------------------------------------------
# 5) FESTIVAL regression – 101% Percentage still rejected
# ---------------------------------------------------------------------------
class TestFestivalPercentageCapRegression:
    """POST /api/festival/add_festival_details/ — regression."""

    URL = None

    @classmethod
    def setup_class(cls):
        cls.URL = f"{BASE_URL}/api/festival/add_festival_details/"

    def test_penalty_101_percentage_rejected(self, headers):
        today = datetime.date.today()
        payload = {
            "festival_name": "TEST_RegP101",
            "choice": "Percentage",
            "penalty_amt": 101,
            "tax_per_head": 100,
            "amount": 100,
            "date": today.isoformat(),
            "start_date": (today + datetime.timedelta(days=2)).isoformat(),
            "end_date": (today + datetime.timedelta(days=5)).isoformat(),
            "action": True,
        }
        r = requests.post(self.URL, json=payload, headers=headers, timeout=15)
        assert r.status_code == 400, f"expected 400 got {r.status_code}: {r.text}"
        assert "penalty_amt" in r.json(), r.text


# ---------------------------------------------------------------------------
# 6) EXPENSE: POST without category / category_name
# ---------------------------------------------------------------------------
class TestExpenseWithoutCategory:
    URL = None

    @classmethod
    def setup_class(cls):
        cls.URL = f"{BASE_URL}/api/expense/add_expen_details/"

    def test_post_without_category_ok(self, headers):
        today = datetime.date.today().isoformat()
        payload = {
            "expense_subcategory": "Temple Expense",
            "expense_name": "TEST_expense_no_cat",
            "expense_amt": "10",
            "date": today,
            "payment_mode": "Offline",
            "transaction_type": "Cash",
            "action": True,
        }
        r = requests.post(self.URL, json=payload, headers=headers, timeout=15)
        # 201 Created is the pass case
        assert r.status_code == 201, f"expected 201 got {r.status_code}: {r.text}"
        body = r.json()
        assert body.get("category") in (None, "", 0)
        # cleanup
        eid = body.get("id")
        if eid:
            try:
                requests.delete(f"{BASE_URL}/api/expense/edit_expen_details/{eid}/",
                                headers=headers, timeout=10)
            except Exception:
                pass


# ---------------------------------------------------------------------------
# 7) INCOME: POST without category / category_name
# ---------------------------------------------------------------------------
class TestIncomeWithoutCategory:
    URL = None

    @classmethod
    def setup_class(cls):
        cls.URL = f"{BASE_URL}/api/income/add_income_details/"

    def test_post_without_category_ok(self, headers):
        today = datetime.date.today().isoformat()
        payload = {
            "income_subcategory": "Temple Income",
            "income_name": "TEST_income_no_cat",
            "income_amt": "10",
            "date": today,
            "payment_mode": "Offline",
            "transaction_type": "Cash",
            "action": True,
        }
        r = requests.post(self.URL, json=payload, headers=headers, timeout=15)
        assert r.status_code == 201, f"expected 201 got {r.status_code}: {r.text}"
        body = r.json()
        assert body.get("category") in (None, "", 0)
        # cleanup
        iid = body.get("id")
        if iid:
            try:
                requests.delete(f"{BASE_URL}/api/income/edit_income_details/{iid}/",
                                headers=headers, timeout=10)
            except Exception:
                pass
