"""
Chit-Fund expense accounting helpers (Feb 2026 owner rule).

When an expense is created / edited / deleted with
``expense_subcategory == "Chit Fund Expense"`` and a ``chitt_fund`` FK
populated, we atomically debit or credit the linked
``ChitFundsDetails.profit_amount`` and ``.cash_inhand_amount`` so the
Chit Fund View page always reflects real-time state.

Rules
-----
- Positive amount ⇒ deduct from both fields (Add).
- Zero / None amount ⇒ no-op.
- Reverse-then-reapply pattern for Edit (see ``reverse_chit_fund_expense``
  + ``apply_chit_fund_expense``).
- Delete calls ``reverse_chit_fund_expense`` only.
- Insufficient-cash guard: caller must call ``check_chit_fund_cash``
  BEFORE ``apply_chit_fund_expense`` and short-circuit with a 302
  Response when False.
"""
from __future__ import annotations

from decimal import Decimal


def _to_dec(v) -> Decimal:
    try:
        return Decimal(str(v or 0))
    except Exception:
        return Decimal(0)


def check_chit_fund_cash(chit, amount) -> tuple[bool, str]:
    """Return (ok, message).  ok=False when the chit-fund cash-in-hand
    would go negative after debiting ``amount``. Message is a
    ready-to-return string for the API."""
    if chit is None:
        return True, ""
    amt = _to_dec(amount)
    if amt <= 0:
        return True, ""
    avail = _to_dec(getattr(chit, "cash_inhand_amount", 0))
    if avail < amt:
        return (
            False,
            "Insufficient chit-fund cash. Only Rs. "
            + f"{avail.normalize():f}"
            + " available in "
            + f"{chit.chit_name or ('chit fund #' + str(chit.id))}",
        )
    return True, ""


def apply_chit_fund_expense(chit, amount):
    """Debit ``amount`` from the chit fund's profit + cash-in-hand."""
    if chit is None:
        return
    amt = _to_dec(amount)
    if amt <= 0:
        return
    chit.profit_amount = _to_dec(chit.profit_amount) - amt
    chit.cash_inhand_amount = _to_dec(chit.cash_inhand_amount) - amt
    chit.save(update_fields=["profit_amount", "cash_inhand_amount"])


def reverse_chit_fund_expense(chit, amount):
    """Credit ``amount`` back onto the chit fund's profit + cash-in-hand
    (used on Edit-reverse and Delete)."""
    if chit is None:
        return
    amt = _to_dec(amount)
    if amt <= 0:
        return
    chit.profit_amount = _to_dec(chit.profit_amount) + amt
    chit.cash_inhand_amount = _to_dec(chit.cash_inhand_amount) + amt
    chit.save(update_fields=["profit_amount", "cash_inhand_amount"])
