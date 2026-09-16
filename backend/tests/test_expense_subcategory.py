"""
Tests for the new expense_subcategory field on ADDExpenseDetails and its
integration into the Chit Fund and Temple Balance Sheets.
"""
import os
import datetime
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://fd32960a-5552-41c8-bee2-e9a5572be60a.preview.emergentagent.com").rstrip("/")

LOGIN_EMAIL = "admin@gmail.com"
LOGIN_PASSWORD = "Admin@123"

TODAY = datetime.date.today().isoformat()


@pytest.fixture(scope="module")
def jwt_token():
    r = requests.post(f"{BASE_URL}/api/user/login", json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    tok = data.get("jwt")
    assert tok
    return tok


@pytest.fixture(scope="module")
def headers(jwt_token):
    return {"Authorization": jwt_token, "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def ref_ids(headers):
    """Return valid (category_id, expense_id) from the DB."""
    cats = requests.get(f"{BASE_URL}/api/expense/add_expen_categry/", headers=headers).json()
    names = requests.get(f"{BASE_URL}/api/expense/add_expen_names/", headers=headers).json()
    return {"category": cats[0]["id"], "expense": names[0]["id"], "category_name": cats[0]["category_name"], "expense_name": names[0]["expense_name"]}


@pytest.fixture(scope="module")
def created_ids(headers, ref_ids):
    """State bag shared across tests in this module.
    Also cleans up any pre-existing test rows for TODAY at setup and teardown."""
    def cleanup():
        # Delete any rows we created for today via the API
        try:
            listing = requests.get(f"{BASE_URL}/api/expense/add_expen_details/", headers=headers).json()
            for row in listing:
                if row.get("date") == TODAY and row.get("expense_subcategory") in (
                    "Chit Fund Expense", "Temple Expense"
                ) and float(row.get("expense_amt", 0)) in (500.0, 300.0):
                    rid = row.get("id")
                    if rid:
                        requests.delete(
                            f"{BASE_URL}/api/expense/edit_expen_details/{rid}/",
                            headers=headers,
                        )
        except Exception as e:
            print(f"Cleanup warning: {e}")

    cleanup()
    yield {"chit_fund_expense_id": None, "temple_expense_id": None}
    cleanup()


# ---------- ADDExpense POST tests ----------

class TestExpensePost:
    def test_post_chit_fund_expense(self, headers, ref_ids, created_ids):
        payload = {
            "expense_subcategory": "Chit Fund Expense",
            "category": ref_ids["category"],
            "category_name": ref_ids["category_name"],
            "expense": ref_ids["expense"],
            "expense_name": ref_ids["expense_name"],
            "expense_amt": 500,
            "payment_mode": "Offline",
            "transaction_type": "Cash",
            "date": TODAY,
        }
        r = requests.post(f"{BASE_URL}/api/expense/add_expen_details/", json=payload, headers=headers)
        assert r.status_code == 201, f"Failed create chit fund expense: {r.status_code} {r.text}"
        data = r.json()
        assert data.get("expense_subcategory") == "Chit Fund Expense"
        assert float(data.get("expense_amt")) == 500
        created_ids["chit_fund_expense_id"] = data.get("id")

    def test_post_temple_expense(self, headers, ref_ids, created_ids):
        payload = {
            "expense_subcategory": "Temple Expense",
            "category": ref_ids["category"],
            "category_name": ref_ids["category_name"],
            "expense": ref_ids["expense"],
            "expense_name": ref_ids["expense_name"],
            "expense_amt": 300,
            "payment_mode": "Offline",
            "transaction_type": "Cash",
            "date": TODAY,
        }
        r = requests.post(f"{BASE_URL}/api/expense/add_expen_details/", json=payload, headers=headers)
        assert r.status_code == 201, f"Failed create temple expense: {r.status_code} {r.text}"
        data = r.json()
        assert data.get("expense_subcategory") == "Temple Expense"
        assert float(data.get("expense_amt")) == 300
        created_ids["temple_expense_id"] = data.get("id")

    def test_post_invalid_subcategory(self, headers, ref_ids):
        payload = {
            "expense_subcategory": "Invalid",
            "category": ref_ids["category"],
            "category_name": ref_ids["category_name"],
            "expense": ref_ids["expense"],
            "expense_name": ref_ids["expense_name"],
            "expense_amt": 1,
            "payment_mode": "Offline",
            "transaction_type": "Cash",
            "date": TODAY,
        }
        r = requests.post(f"{BASE_URL}/api/expense/add_expen_details/", json=payload, headers=headers)
        assert r.status_code == 400, f"Expected 400, got {r.status_code} {r.text}"
        body_text = r.text.lower()
        assert "is not a valid choice" in body_text, f"Expected 'is not a valid choice' error, got: {r.text}"

    def test_get_expense_list_includes_subcategory(self, headers, created_ids):
        r = requests.get(f"{BASE_URL}/api/expense/add_expen_details/", headers=headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # Every row must have the expense_subcategory key
        for row in data[:20]:
            assert "expense_subcategory" in row, f"Missing expense_subcategory key on row: {row}"
        # Find our two created rows
        ids_present = {row.get("id") for row in data}
        assert created_ids["chit_fund_expense_id"] in ids_present
        assert created_ids["temple_expense_id"] in ids_present
        for row in data:
            if row.get("id") == created_ids["chit_fund_expense_id"]:
                assert row.get("expense_subcategory") == "Chit Fund Expense"
            if row.get("id") == created_ids["temple_expense_id"]:
                assert row.get("expense_subcategory") == "Temple Expense"


# ---------- Chit Fund Balance Sheet tests ----------

class TestChitFundBalanceSheet:
    def test_custom_date_range(self, headers, created_ids):
        # Ensure prior tests seeded the data
        assert created_ids["chit_fund_expense_id"] is not None, "Chit fund expense not created in prior test"
        r = requests.post(
            f"{BASE_URL}/api/balancesheet/balancesheet_chitfundview/",
            json={"range_type": "custom_date_range", "start_date": TODAY, "end_date": TODAY},
            headers=headers,
        )
        assert r.status_code == 201, f"Chit fund balancesheet failed: {r.status_code} {r.text}"
        data = r.json()
        debit = data.get("Debit", {})
        assert "Chit_Fund_Expense" in debit, f"Chit_Fund_Expense missing in Debit. Keys={list(debit.keys())}"
        cfe = debit["Chit_Fund_Expense"]
        assert float(cfe.get("total_amount")) == 500, f"Expected 500, got {cfe.get('total_amount')}"
        assert float(data.get("total_debit_amount", 0)) >= 500

        # Must NOT contain the 300 temple expense
        response_str = str(data)
        # Rough sanity: 300 must not appear as a Debit Chit item detail
        for det in cfe.get("details", []):
            assert float(det.get("amount")) != 300, "Temple 300 expense leaked into chit fund debit details"

    def test_custom_date(self, headers, created_ids):
        r = requests.post(
            f"{BASE_URL}/api/balancesheet/balancesheet_chitfundview/",
            json={"range_type": "custom_date", "start_date": TODAY},
            headers=headers,
        )
        assert r.status_code == 201, f"Chit fund balancesheet (custom_date) failed: {r.status_code} {r.text}"
        data = r.json()
        debit = data.get("Debit", {})
        assert "Chit_Fund_Expense" in debit, f"Chit_Fund_Expense missing. Keys={list(debit.keys())}"
        assert float(debit["Chit_Fund_Expense"]["total_amount"]) == 500


# ---------- Temple Balance Sheet tests ----------

class TestTempleBalanceSheet:
    def test_temple_excludes_chit_fund(self, headers, created_ids):
        r = requests.post(
            f"{BASE_URL}/api/balancesheet/balancesheet_view/",
            json={"range_type": "custom_date_range", "start_date": TODAY, "end_date": TODAY},
            headers=headers,
        )
        assert r.status_code == 201, f"Temple balancesheet failed: {r.status_code} {r.text}"
        data = r.json()
        debit = data.get("Debit", {})
        assert "expense" in debit, f"Debit.expense missing. Debit keys={list(debit.keys())}"
        expense_block = debit["expense"]

        # cash_amount should include the 300 temple expense (payment_mode Offline/Cash, no bank)
        # It must NOT include the 500 chit fund expense.
        cash_amount = float(expense_block.get("cash_amount", 0) or 0)
        bank_amount = float(expense_block.get("bank_amount", 0) or 0)

        # Temple 300 should be in cash_amount; Chit fund 500 must NOT be aggregated.
        assert cash_amount == 300, f"Expected temple cash_amount 300, got {cash_amount}. Block={expense_block}"
        assert bank_amount == 0, f"Expected 0 bank_amount, got {bank_amount}"

        # Sanity: chit-fund 500 must not appear in any detail row amount
        for cat_row in expense_block.get("expense_details", []):
            for det in cat_row.get("details", []):
                assert float(det.get("amount", 0)) != 500, f"Chit fund 500 leaked into temple detail: {det}"

    def test_legacy_null_subcategory_still_appears(self, headers):
        """Regression: expenses with expense_subcategory=NULL (legacy 100 rows)
        must still appear in the Temple Balance Sheet."""
        # Date 2025-04-27 has 5 legacy NULL-subcategory expenses summing to 54550
        r = requests.post(
            f"{BASE_URL}/api/balancesheet/balancesheet_view/",
            json={"range_type": "custom_date_range", "start_date": "2025-04-27", "end_date": "2025-04-27"},
            headers=headers,
        )
        assert r.status_code == 201, f"Legacy date balancesheet failed: {r.status_code} {r.text}"
        data = r.json()
        expense_block = data.get("Debit", {}).get("expense", {})
        cash_amount = float(expense_block.get("cash_amount", 0) or 0)
        # The 5 legacy NULL rows: 18940+5400+7510+15000+7700 = 54550
        assert cash_amount == 54550, f"Expected legacy NULL rows totalling 54550, got {cash_amount}. Block={expense_block}"
