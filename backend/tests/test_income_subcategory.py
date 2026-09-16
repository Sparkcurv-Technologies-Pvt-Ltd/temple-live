"""
Tests for the new income_subcategory field on ADDIncomeDetails and its
integration into the Chit Fund and Temple Balance Sheets.
Mirrors test_expense_subcategory.py.
"""
import os
import datetime
import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://fd32960a-5552-41c8-bee2-e9a5572be60a.preview.emergentagent.com",
).rstrip("/")

LOGIN_EMAIL = "admin@gmail.com"
LOGIN_PASSWORD = "Admin@123"

TODAY = datetime.date.today().isoformat()


@pytest.fixture(scope="module")
def jwt_token():
    r = requests.post(
        f"{BASE_URL}/api/user/login",
        json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD},
    )
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    tok = r.json().get("jwt")
    assert tok
    return tok


@pytest.fixture(scope="module")
def headers(jwt_token):
    return {"Authorization": jwt_token, "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def ref_ids(headers):
    """Return valid (category_id, income_id) from the DB."""
    cats = requests.get(
        f"{BASE_URL}/api/income/add_income_categry/", headers=headers
    ).json()
    names = requests.get(
        f"{BASE_URL}/api/income/add_income_names/", headers=headers
    ).json()
    return {
        "category": cats[0]["id"],
        "income": names[0]["id"],
        "category_name": cats[0]["category_name"],
        "income_name": names[0]["income_name"],
    }


@pytest.fixture(scope="module")
def created_ids(headers, ref_ids):
    """Clean up any pre-existing test rows for TODAY at setup/teardown."""

    def cleanup():
        try:
            listing = requests.get(
                f"{BASE_URL}/api/income/add_income_details/", headers=headers
            ).json()
            for row in listing:
                if row.get("income_subcategory") in (
                    "Chit Fund Income",
                    "Temple Income",
                ) and float(row.get("income_amt", 0)) in (700.0, 400.0):
                    # Use created_at date since income filtering uses created_at
                    ca = row.get("created_at", "")
                    if ca.startswith(TODAY):
                        rid = row.get("id")
                        if rid:
                            requests.delete(
                                f"{BASE_URL}/api/income/edit_income_details/{rid}/",
                                headers=headers,
                            )
        except Exception as e:
            print(f"Cleanup warning: {e}")

    cleanup()
    yield {"chit_fund_income_id": None, "temple_income_id": None}
    cleanup()


# ---------- ADDIncome POST tests ----------


class TestIncomePost:
    def test_post_chit_fund_income(self, headers, ref_ids, created_ids):
        payload = {
            "income_subcategory": "Chit Fund Income",
            "category": ref_ids["category"],
            "category_name": ref_ids["category_name"],
            "income": ref_ids["income"],
            "income_name": ref_ids["income_name"],
            "income_amt": 700,
            "income_type": "Others",
            "payment_mode": "Offline",
            "transaction_type": "Cash",
            "date": TODAY,
        }
        r = requests.post(
            f"{BASE_URL}/api/income/add_income_details/",
            json=payload,
            headers=headers,
        )
        assert r.status_code == 201, f"Create chit fund income failed: {r.status_code} {r.text}"
        data = r.json()
        assert data.get("income_subcategory") == "Chit Fund Income"
        assert float(data.get("income_amt")) == 700
        created_ids["chit_fund_income_id"] = data.get("id")

    def test_post_temple_income(self, headers, ref_ids, created_ids):
        payload = {
            "income_subcategory": "Temple Income",
            "category": ref_ids["category"],
            "category_name": ref_ids["category_name"],
            "income": ref_ids["income"],
            "income_name": ref_ids["income_name"],
            "income_amt": 400,
            "income_type": "Others",
            "payment_mode": "Offline",
            "transaction_type": "Cash",
            "date": TODAY,
        }
        r = requests.post(
            f"{BASE_URL}/api/income/add_income_details/",
            json=payload,
            headers=headers,
        )
        assert r.status_code == 201, f"Create temple income failed: {r.status_code} {r.text}"
        data = r.json()
        assert data.get("income_subcategory") == "Temple Income"
        assert float(data.get("income_amt")) == 400
        created_ids["temple_income_id"] = data.get("id")

    def test_post_invalid_subcategory(self, headers, ref_ids):
        payload = {
            "income_subcategory": "Invalid",
            "category": ref_ids["category"],
            "category_name": ref_ids["category_name"],
            "income": ref_ids["income"],
            "income_name": ref_ids["income_name"],
            "income_amt": 1,
            "income_type": "Others",
            "payment_mode": "Offline",
            "transaction_type": "Cash",
            "date": TODAY,
        }
        r = requests.post(
            f"{BASE_URL}/api/income/add_income_details/",
            json=payload,
            headers=headers,
        )
        assert r.status_code == 400, f"Expected 400, got {r.status_code} {r.text}"
        body_text = r.text.lower()
        assert "is not a valid choice" in body_text, f"Expected 'is not a valid choice', got: {r.text}"

    def test_get_income_list_includes_subcategory(self, headers, created_ids):
        r = requests.get(
            f"{BASE_URL}/api/income/add_income_details/", headers=headers
        )
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        for row in data[:20]:
            assert "income_subcategory" in row, f"Missing income_subcategory key on row: {row}"
        ids_present = {row.get("id") for row in data}
        assert created_ids["chit_fund_income_id"] in ids_present
        assert created_ids["temple_income_id"] in ids_present
        for row in data:
            if row.get("id") == created_ids["chit_fund_income_id"]:
                assert row.get("income_subcategory") == "Chit Fund Income"
            if row.get("id") == created_ids["temple_income_id"]:
                assert row.get("income_subcategory") == "Temple Income"


# ---------- Chit Fund Balance Sheet tests ----------


class TestChitFundBalanceSheet:
    def test_custom_date_range(self, headers, created_ids):
        assert created_ids["chit_fund_income_id"] is not None, "Chit fund income not created in prior test"
        r = requests.post(
            f"{BASE_URL}/api/balancesheet/balancesheet_chitfundview/",
            json={"range_type": "custom_date_range", "start_date": TODAY, "end_date": TODAY},
            headers=headers,
        )
        assert r.status_code == 201, f"Chit fund BS failed: {r.status_code} {r.text}"
        data = r.json()
        credit = data.get("Credit", {})
        assert "Chit_Fund_Income" in credit, f"Chit_Fund_Income missing in Credit. Keys={list(credit.keys())}"
        cfi = credit["Chit_Fund_Income"]
        assert float(cfi.get("total_amount")) == 700, f"Expected 700, got {cfi.get('total_amount')}"
        assert float(data.get("total_credit_amount", 0)) >= 700

        # Temple 400 must NOT be in chit-fund income details
        for det in cfi.get("details", []):
            assert float(det.get("amount")) != 400, "Temple 400 income leaked into chit fund credit details"

    def test_custom_date(self, headers, created_ids):
        r = requests.post(
            f"{BASE_URL}/api/balancesheet/balancesheet_chitfundview/",
            json={"range_type": "custom_date", "start_date": TODAY},
            headers=headers,
        )
        assert r.status_code == 201, f"Chit fund BS (custom_date) failed: {r.status_code} {r.text}"
        data = r.json()
        credit = data.get("Credit", {})
        assert "Chit_Fund_Income" in credit, f"Chit_Fund_Income missing. Keys={list(credit.keys())}"
        assert float(credit["Chit_Fund_Income"]["total_amount"]) == 700


# ---------- Temple Balance Sheet tests ----------


class TestTempleBalanceSheet:
    def test_temple_excludes_chit_fund_income(self, headers, created_ids):
        r = requests.post(
            f"{BASE_URL}/api/balancesheet/balancesheet_view/",
            json={"range_type": "custom_date_range", "start_date": TODAY, "end_date": TODAY},
            headers=headers,
        )
        assert r.status_code == 201, f"Temple BS failed: {r.status_code} {r.text}"
        data = r.json()
        credit = data.get("Credit", {})
        assert "income" in credit, f"Credit.income missing. Credit keys={list(credit.keys())}"
        income_block = credit["income"]

        cash_amount = float(income_block.get("cash_amount", 0) or 0)
        bank_amount = float(income_block.get("bank_amount", 0) or 0)

        # Temple 400 should be in cash_amount; Chit fund 700 must NOT be aggregated.
        assert cash_amount == 400, f"Expected temple cash_amount 400, got {cash_amount}. Block={income_block}"
        assert bank_amount == 0, f"Expected 0 bank_amount, got {bank_amount}"

        # Chit fund 700 must not appear in detail rows
        for cat_row in income_block.get("income_details", []):
            for det in cat_row.get("details", []):
                assert float(det.get("amount", 0)) != 700, f"Chit fund 700 leaked into temple detail: {det}"

    def test_legacy_null_subcategory_still_appears(self, headers):
        """Regression: incomes with income_subcategory=NULL (legacy 36 rows)
        must still appear in the Temple Balance Sheet.
        Date 2024-04-07 has 6 legacy NULL-subcategory cash income rows summing to 26193."""
        r = requests.post(
            f"{BASE_URL}/api/balancesheet/balancesheet_view/",
            json={"range_type": "custom_date_range", "start_date": "2024-04-07", "end_date": "2024-04-07"},
            headers=headers,
        )
        assert r.status_code == 201, f"Legacy date BS failed: {r.status_code} {r.text}"
        data = r.json()
        income_block = data.get("Credit", {}).get("income", {})
        cash_amount = float(income_block.get("cash_amount", 0) or 0)
        assert cash_amount == 26193, f"Expected legacy NULL rows total 26193, got {cash_amount}. Block={income_block}"
