"""
Regression test for chit-fund settlement applications.

Business rule (owner-confirmed, current code in
`chit_fund/views.py::add_chit_fund_settlement_application_details`):
    When an investor exits a chit fund, their shares LEAVE the pool.
    They are NOT redistributed to Management or the remaining investors.
      * investers_share_count drops by exactly the exiting share_count
      * management_share_count is unchanged
      * remaining investors' share_count is unchanged
      * total_share_count == management_share_count + investers_share_count

WARNING: this test WRITES to the configured database (creates a settlement
application and resets the admin@gmail.com password). It is skipped unless
TEMPLE_ALLOW_DB_TESTS=1 is set. NEVER run it against the live database.
"""
import os
import sys
import django
import pytest

if os.environ.get("TEMPLE_ALLOW_DB_TESTS") != "1":
    pytest.skip(
        "writes to the database; set TEMPLE_ALLOW_DB_TESTS=1 on a dev/test DB only",
        allow_module_level=True,
    )

sys.path.insert(0, "/app/backend")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "temple_proj.settings.settings")
django.setup()

from django.test import Client  # noqa: E402
from chit_fund.models import ChitFundsDetails, ChitFundInvesters  # noqa: E402
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


@pytest.mark.django_db(transaction=True)
def test_exiting_shares_leave_the_pool():
    fund = ChitFundsDetails.objects.first()
    assert fund is not None, "seed data missing"

    initial_mgmt = int(fund.management_share_count or 0)
    initial_invs = int(fund.investers_share_count or 0)
    assert int(fund.total_share_count or 0) == initial_mgmt + initial_invs

    exiting = (
        ChitFundInvesters.objects
        .filter(chitt_fund=fund, settled=False, action=True)
        .order_by("-share_count")
        .first()
    )
    assert exiting is not None
    exit_shares = int(exiting.share_count or 0)
    assert exit_shares > 0

    others_before = {
        i.id: int(i.share_count or 0)
        for i in ChitFundInvesters.objects
        .filter(chitt_fund=fund, settled=False, action=True)
        .exclude(id=exiting.id)
    }

    client = Client(HTTP_HOST="testserver")
    jwt = _login(client)
    resp = client.post(
        "/api/chit_fund/add_chit_fund_settlement_application_details/",
        data={"chitt_fund": fund.id, "investers": exiting.id, "settlement_date": "2030-02-10"},
        content_type="application/json",
        HTTP_AUTHORIZATION=jwt,
    )
    assert resp.status_code == 201, resp.content

    fund.refresh_from_db()
    exiting.refresh_from_db()
    assert exiting.action is False

    assert int(fund.management_share_count or 0) == initial_mgmt, "management shares must not change"
    assert int(fund.investers_share_count or 0) == initial_invs - exit_shares
    assert int(fund.total_share_count or 0) == (
        int(fund.management_share_count or 0) + int(fund.investers_share_count or 0)
    )

    others_after = {
        i.id: int(i.share_count or 0)
        for i in ChitFundInvesters.objects.filter(id__in=others_before.keys())
    }
    assert others_after == others_before, "remaining investors' shares must not change"


@pytest.mark.django_db(transaction=True)
def test_total_share_count_stays_consistent():
    """`total_share_count` MUST equal management + investers share counts."""
    fund = ChitFundsDetails.objects.first()
    fund.refresh_from_db()
    assert int(fund.total_share_count or 0) == (
        int(fund.management_share_count or 0)
        + int(fund.investers_share_count or 0)
    )
