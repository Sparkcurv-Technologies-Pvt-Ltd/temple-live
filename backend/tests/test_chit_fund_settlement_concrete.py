"""
Concrete-scenario regression test for the "Management share also gets
redistribution" fix (chit fund id=1, AMMAN FINANCE).

Expected initial state (from /app/temple_db.sql):
    ChitFundsDetails id=1
        management_share_count = 1
        investers_share_count  = 140
        total_share_count      = 141
        outer_invest_amount    = 1400000.00
    Investors on fund 1:
        id=1 N. SUNDAR         share_count=50 invest=500000
        id=2 K. RAMSWAMY NADAR share_count=20 invest=200000
        id=3 M. PARAMASIVAN    share_count=20 invest=200000
        id=4 C.Subash          share_count=20 invest=200000
        id=5 O. SENTHIL KUMAR  share_count=30 invest=300000

Concrete expectations when investor id=1 exits (application step):
    - Management 1 -> 2 (+1)
    - id=2 20 -> 31 (+11)
    - id=3 20 -> 31 (+11)
    - id=4 20 -> 31 (+11)
    - id=5 30 -> 46 (+16)
    - Sum bonuses = 1+11+11+11+16 = 50 (= exiting share_count) ✓
    - total_share_count stays 141
    - outer_invest_amount 1400000 -> 900000
    - invester_share_count 140 -> 139 (loses 50, gains 49 back)

Second step (add_chit_fund_settlement) MUST NOT touch share counts
or outer_invest_amount again — only cash_inhand_amount, profit_amount,
invest_retake, profit_retake, retake_investers_share_count.
"""
import datetime
import os
import subprocess
import sys

import django
import pytest

sys.path.insert(0, "/app/backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "temple_proj.settings.settings")
django.setup()

from django.test import Client  # noqa: E402
from chit_fund.models import (  # noqa: E402
    ChitFundsDetails,
    ChitFundInvesters,
    ChitFundsettleAplication,
    ChitFundSettlement,
)
from user.models import User  # noqa: E402


def _login(client):
    u = User.objects.get(email="admin@gmail.com")
    u.set_password("Admin@123")
    u.is_active = True
    u.is_superuser = True
    u.save()
    resp = client.post(
        "/api/user/login",
        data={"email": "admin@gmail.com", "password": "Admin@123"},
        content_type="application/json",
    )
    assert resp.status_code == 200, resp.content
    return resp.json()["jwt"]


def _reset_db():
    """Restore /app/temple_db.sql (clean baseline)."""
    subprocess.run(
        ["mysql", "-u", "root", "-e",
         "DROP DATABASE temple; CREATE DATABASE temple;"],
        check=True,
    )
    subprocess.run(
        "mysql -u root temple < /app/temple_db.sql",
        shell=True, check=True,
    )


@pytest.fixture(scope="module", autouse=True)
def reset_before_module():
    _reset_db()
    yield
    _reset_db()


def test_concrete_redistribution_after_application():
    """Investor id=1 exits fund 1 via the settlement-application endpoint."""
    client = Client(HTTP_HOST="testserver")
    jwt = _login(client)

    # ---- Pre-state sanity ---------------------------------------------
    fund = ChitFundsDetails.objects.get(id=1)
    assert int(fund.management_share_count) == 1
    assert int(fund.investers_share_count) == 140
    assert int(fund.total_share_count) == 141
    assert float(fund.outer_invest_amount) == 1400000.0

    pre = {i.id: int(i.share_count) for i in
           ChitFundInvesters.objects.filter(chitt_fund=fund)}
    assert pre == {1: 50, 2: 20, 3: 20, 4: 20, 5: 30}

    # ---- ACT: apply for settlement ------------------------------------
    resp = client.post(
        "/api/chit_fund/add_chit_fund_settlement_application_details/",
        data={
            "chitt_fund": 1,
            "investers": 1,
            "settlement_date": "2030-02-10",
        },
        content_type="application/json",
        HTTP_AUTHORIZATION=jwt,
    )
    assert resp.status_code == 201, resp.content

    # ---- Post-state assertions ----------------------------------------
    fund.refresh_from_db()
    assert int(fund.management_share_count) == 2, "mgmt expected 1->2 (+1)"
    assert int(fund.investers_share_count) == 139, "invs expected 140->139"
    assert int(fund.total_share_count) == 141, "total must stay 141"
    assert float(fund.outer_invest_amount) == 900000.0, (
        "outer_invest_amount must drop by 500000 at application step"
    )

    # Individual investors
    post = {
        i.id: (int(i.share_count), bool(i.action), bool(i.settled))
        for i in ChitFundInvesters.objects.filter(chitt_fund=fund)
    }
    assert post[1] == (50, False, False), (
        f"exiting investor: expected share_count preserved, action=False, "
        f"settled=False (settled flips only at final settlement); got {post[1]}"
    )
    assert post[2] == (31, True, False)
    assert post[3] == (31, True, False)
    assert post[4] == (31, True, False)
    assert post[5] == (46, True, False)

    # Sum of bonuses to remaining shareholders (mgmt + invs) == 50
    mgmt_bonus = 2 - 1
    invs_bonus = (31 - 20) + (31 - 20) + (31 - 20) + (46 - 30)
    assert mgmt_bonus + invs_bonus == 50, (
        f"redistribution lost/gained shares: mgmt_bonus={mgmt_bonus}, "
        f"invs_bonus={invs_bonus}"
    )


def test_settlement_does_not_double_reduce_shares_or_invest():
    """After applying, the settlement (final) step must not touch
    share counts or outer_invest_amount again."""
    client = Client(HTTP_HOST="testserver")
    jwt = _login(client)

    fund = ChitFundsDetails.objects.get(id=1)
    app_obj = ChitFundsettleAplication.objects.filter(
        chitt_fund=fund, investers_id=1, action=True
    ).first()
    assert app_obj is not None, "settlement application must exist"

    inv1 = ChitFundInvesters.objects.get(id=1)

    # Ensure the fund has enough cash-in-hand to actually settle this
    # investor (this test is about the redistribution math, not about
    # cash-flow validation). If seed cash is short, top it up locally.
    required = float(inv1.final_settlement_amount or 0)
    if float(fund.cash_inhand_amount) < required:
        fund.cash_inhand_amount = required + 100000
        fund.save()

    # Snapshot values that must NOT change during the final settlement step
    before_total = int(fund.total_share_count)
    before_mgmt = int(fund.management_share_count)
    before_invs = int(fund.investers_share_count)
    before_outer_invest = float(fund.outer_invest_amount)

    # Snapshot values that ARE expected to change
    before_cash = float(fund.cash_inhand_amount)
    before_profit = float(fund.profit_amount)
    before_invest_retake = float(fund.invest_retake or 0)
    before_profit_retake = float(fund.profit_retake or 0)
    before_retake_shares = int(fund.retake_investers_share_count or 0)

    final_amt = float(inv1.final_settlement_amount or 0)
    inv_investment = float(inv1.investment_amt or 0)
    inv_share_amt = float(inv1.share_amount or 0)
    inv_share_count = int(inv1.share_count or 0)

    # ---- ACT: finalise the settlement --------------------------------
    resp = client.post(
        "/api/chit_fund/add_chit_fund_settlement/",
        data={
            "chitt_fund": 1,
            "investers": 1,
            "chitt_settilement": app_obj.id,
            "settlement_date": str(datetime.date.today()),
            "settlement_amount": final_amt,
        },
        content_type="application/json",
        HTTP_AUTHORIZATION=jwt,
    )
    assert resp.status_code == 201, resp.content

    # ---- Assertions --------------------------------------------------
    fund.refresh_from_db()
    # Invariants: share counts and outer_invest must stay identical.
    assert int(fund.total_share_count) == before_total, (
        f"total_share_count changed: {before_total} -> {fund.total_share_count}"
    )
    assert int(fund.management_share_count) == before_mgmt
    assert int(fund.investers_share_count) == before_invs
    assert float(fund.outer_invest_amount) == before_outer_invest, (
        f"outer_invest_amount double-reduced: "
        f"{before_outer_invest} -> {fund.outer_invest_amount}"
    )

    # Things that MUST change
    assert abs(float(fund.cash_inhand_amount)
               - (before_cash - inv_investment - inv_share_amt)) < 0.01
    assert abs(float(fund.profit_amount)
               - (before_profit - inv_share_amt)) < 0.01
    assert abs(float(fund.invest_retake or 0)
               - (before_invest_retake + inv_investment)) < 0.01
    assert abs(float(fund.profit_retake or 0)
               - (before_profit_retake + inv_share_amt)) < 0.01
    assert int(fund.retake_investers_share_count or 0) == (
        before_retake_shares + inv_share_count
    )

    # Investor & application state
    inv1.refresh_from_db()
    assert bool(inv1.settled) is True
    app_obj.refresh_from_db()
    assert bool(app_obj.action) is False


def test_total_share_count_invariant_holds():
    """total = management + investers, always."""
    fund = ChitFundsDetails.objects.get(id=1)
    fund.refresh_from_db()
    assert int(fund.total_share_count) == (
        int(fund.management_share_count) + int(fund.investers_share_count)
    )
