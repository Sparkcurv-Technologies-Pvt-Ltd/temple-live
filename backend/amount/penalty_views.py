"""Penalty API views.

Endpoints
---------
GET  /api/penalty/pending/        -> list every member with pending penalty
                                     (idempotent recompute under the hood)
POST /api/penalty/recompute/      -> force recompute and return summary
GET  /api/penalty/summary/        -> summary numbers only (no item list)
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed

from token_app.views import token_checking
from management.models import ManagementDetails
from amount.models import PeoplesAmountDetails
from amount.penalty_engine import recompute_all, PENALTY_PER_MONTH


def _require_auth(request):
    try:
        rejin = token_checking(request)
    except AuthenticationFailed:
        return None, Response(
            {"message": "Not Authorized"}, status=status.HTTP_401_UNAUTHORIZED
        )
    if not rejin or (hasattr(rejin, "is_active") and not rejin.is_active):
        return None, Response(
            {"message": "Not Authorized"}, status=status.HTTP_401_UNAUTHORIZED
        )
    return rejin, None


def _management(request):
    mgmt = ManagementDetails.objects.first()
    if not mgmt:
        return None, Response(
            {"message": "First Add Management Profile details"},
            status=status.HTTP_406_NOT_ACCEPTABLE,
        )
    return mgmt, None


def _serialize_item(p: PeoplesAmountDetails, missed_months: int):
    member = p.member
    return {
        "id": p.id,
        "member_id": getattr(member, "id", None),
        "member_no": getattr(member, "member_no", None) or getattr(member, "id", None),
        "member_name": getattr(member, "member_name", None),
        "category": p.name,
        "due_date": _due_date(p).isoformat() if _due_date(p) else None,
        "missed_months": missed_months,
        "penalty_amount": float(p.penalty_amount or 0),
        "penalty_balance": float(p.penalty_balance or 0),
        "base_amount": float(p.amount or 0),
        "amount_balance": float(p.total_bal_amt or 0),
        "paid": bool(p.paid),
        "penalty_flag": bool(p.penalty),
    }


def _due_date(p):
    from amount.penalty_engine import _due_date_for_amount
    return _due_date_for_amount(p)


@api_view(["GET"])
def pending_penalty_list(request):
    rejin, err = _require_auth(request)
    if err:
        return err
    mgmt, err = _management(request)
    if err:
        return err

    summary = recompute_all(management_profile=mgmt)

    # Build the response list freshly from DB (recompute_all already saved updates)
    qs = (
        PeoplesAmountDetails.objects.filter(
            management_profile=mgmt, paid=False, penalty=True
        )
        .select_related("sub_tariff", "festival", "death", "marriage", "member")
    )

    from amount.penalty_engine import missed_months as _missed
    from datetime import date as _date
    today = _date.today()

    data = []
    for p in qs:
        due = _due_date(p)
        data.append(_serialize_item(p, _missed(due, today) if due else 0))

    return Response(
        {
            "rate_per_month": float(PENALTY_PER_MONTH),
            "total_pending_penalty": summary["total_pending_penalty"],
            "scanned": summary["scanned"],
            "updated": summary["updated"],
            "count": len(data),
            "results": data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def recompute_penalties(request):
    rejin, err = _require_auth(request)
    if err:
        return err
    mgmt, err = _management(request)
    if err:
        return err
    summary = recompute_all(management_profile=mgmt)
    return Response(summary, status=status.HTTP_200_OK)


@api_view(["GET"])
def penalty_summary(request):
    rejin, err = _require_auth(request)
    if err:
        return err
    mgmt, err = _management(request)
    if err:
        return err
    summary = recompute_all(management_profile=mgmt)
    summary.pop("items", None)
    return Response(summary, status=status.HTTP_200_OK)
