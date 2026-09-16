"""
Regression test for the "Management share also gets redistribution" fix.

Business rule (from user):
    When an investor exits a chit fund, their share_count must be
    redistributed to the remaining shareholders — which includes the
    Management (typically 1 share) as well as the remaining active
    investors — proportional to their current holdings.  Nothing may
    vanish; total_share_count stays consistent with its two components.

We exercise `add_chit_fund_settlement_application_details` end-to-end via
the API.
"""
import os
import sys
import django
import pytest

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
def test_management_share_included_in_redistribution():
    fund = ChitFundsDetails.objects.first()
    assert fund is not None, "seed data missing"

    initial_mgmt = int(fund.management_share_count or 0)
    initial_invs_count = int(fund.investers_share_count or 0)
    initial_total = int(fund.total_share_count or 0)
    assert initial_total == initial_mgmt + initial_invs_count

    exiting = (
        ChitFundInvesters.objects
        .filter(chitt_fund=fund, settled=False, action=True)
        .order_by("-share_count")
        .first()
    )
    assert exiting is not None
    exit_shares = int(exiting.share_count or 0)
    assert exit_shares > 0

    remaining_before = list(
        ChitFundInvesters.objects
        .filter(chitt_fund=fund, settled=False, action=True)
        .exclude(id=exiting.id)
    )
    baseline = {i.id: int(i.share_count or 0) for i in remaining_before}
    remaining_before_total = sum(baseline.values())
    denom = initial_mgmt + remaining_before_total
    assert denom > 0

    client = Client(HTTP_HOST="testserver")
    jwt = _login(client)

    resp = client.post(
        "/api/chit_fund/add_chit_fund_settlement_application_details/",
        data={
            "chitt_fund": fund.id,
            "investers": exiting.id,
            "settlement_date": "2030-02-10",
        },
        content_type="application/json",
        HTTP_AUTHORIZATION=jwt,
    )
    assert resp.status_code == 201, resp.content

    fund.refresh_from_db()
    new_mgmt = int(fund.management_share_count or 0)
    new_invs = int(fund.investers_share_count or 0)

    # 1. Management share_count is >= its original value (never loses).
    assert new_mgmt >= initial_mgmt, (
        f"management_share_count regressed: {initial_mgmt} -> {new_mgmt}"
    )

    # 2. When mgmt has a nonzero share, and exit_shares are large enough to
    #    give it at least the proportional slice, mgmt actually GAINS shares.
    expected_mgmt_bonus_floor = (exit_shares * initial_mgmt) // denom
    assert new_mgmt >= initial_mgmt + expected_mgmt_bonus_floor, (
        f"management_share_count did not receive its proportional bonus: "
        f"expected >= {initial_mgmt + expected_mgmt_bonus_floor}, got {new_mgmt}"
    )

    # 3. total_share_count == management + investers (invariant).
    assert int(fund.total_share_count or 0) == new_mgmt + new_invs

    # 4. Exiting investor's share is fully consumed (no leftover in pool).
    exiting.refresh_from_db()
    assert exiting.action is False

    # 5. Sum of remaining shares (mgmt + all active investors) equals the
    #    original total minus the exiting investor's share_count (nothing
    #    vanishes and nothing is created).
    remaining_after_total = sum(
        int(i.share_count or 0)
        for i in ChitFundInvesters.objects.filter(
            chitt_fund=fund, settled=False, action=True
        ).exclude(id=exiting.id)
    )
    mgmt_bonus = new_mgmt - initial_mgmt
    investor_bonus = remaining_after_total - remaining_before_total
    assert mgmt_bonus + investor_bonus == exit_shares, (
        f"lost/created shares: mgmt_bonus={mgmt_bonus}, "
        f"investor_bonus={investor_bonus}, exit_shares={exit_shares}"
    )


@pytest.mark.django_db(transaction=True)
def test_total_share_count_stays_consistent():
    """After redistribution, `total_share_count` MUST equal
    `management_share_count + investers_share_count`."""
    fund = ChitFundsDetails.objects.first()
    fund.refresh_from_db()
    assert int(fund.total_share_count or 0) == (
        int(fund.management_share_count or 0)
        + int(fund.investers_share_count or 0)
    )
