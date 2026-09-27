from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from token_app.views import token_checking
from treasure.models import ManagementBalanceSheet, ManagementTreasure
from chit_fund.models import ChitFundsDetails
from interest.models import PeopleInterestDetails
from family.models import Member_Details
from reports.models import Report
from amount.models import CashTransactionDetails

from .models import ManagementDetails, BankDetails, Instructions, OpeningBalanceAdjustment
from .serializers import ManagementDetailsSerializer, BankDetailsSerializer, InstructionSerializer


CREDIT = 'Credit'
DEBIT = 'Debit'
ZERO = Decimal('0')
EMPTY_VALUES = (None, '', 'null')


# ---------------------------------------------------------------------------
# Common helpers
# ---------------------------------------------------------------------------

def D(value):
    """Convert any amount (str / float / Decimal / None) to Decimal safely."""
    if value in EMPTY_VALUES:
        return ZERO
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise ValueError(f"Invalid amount: {value}")


def authenticate(request):
    user = token_checking(request)
    if not user:
        return None, Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        return None, Response({"message": "Not Authorized Please Contact Admin"},
                              status=status.HTTP_401_UNAUTHORIZED)
    return user, None


def is_admin(user):
    return user.is_superuser or getattr(user, 'user_role', None) == "Admin"


def unauthorized():
    return Response({'message': "un-authenticate"}, status=status.HTTP_401_UNAUTHORIZED)


def get_management_or_error():
    management = ManagementDetails.objects.first()
    if not management:
        return None, Response({"message": "First Add Management Profile details"},
                              status=status.HTTP_406_NOT_ACCEPTABLE)
    return management, None


def read_flag(data, key):
    """'false' -> False, anything else -> True, missing -> None."""
    value = data.get(key)
    if value is None:
        return None
    return str(value).lower() != 'false'


def clean_type(value):
    return None if value in EMPTY_VALUES else value


# ---------------------------------------------------------------------------
# Payload parsing
# ---------------------------------------------------------------------------

def parse_management_payload(data, with_ids=False):
    """Build the serializer payload from multipart form data. Raises KeyError / ValueError."""
    payload = {
        'temple_name': data['temple_name'],
        'address': data['address'],
        'comments': data['comments'],
        'tax_age': data['tax_age'],
        'opening_balance': data.get('opening_balance'),
        'opening_balance_type': clean_type(data.get('opening_balance_type')),
    }
    if with_ids and data.get('id') not in EMPTY_VALUES:
        payload['id'] = data.get('id')
    for key in ('documents', 'images'):
        if key in data:
            payload[key] = data[key]

    count = int(data.get('field_count') or 0)
    banks = []
    for num in range(1, count + 1):
        prefix = f"management[{num}]"
        bank = {
            'bank_name': data[f"{prefix}[bank_name]"],
            'account_no': data[f"{prefix}[account_no]"],
            'ifsc': data[f"{prefix}[ifsc]"],
            'account_holder_name': data[f"{prefix}[account_holder_name]"],
            'branch_name': data[f"{prefix}[branch_name]"],
            'bank_opening_balance_amt': data[f"{prefix}[bank_opening_balance_amt]"],
            'bank_opening_balance_type': clean_type(data.get(f"{prefix}[bank_opening_balance_type]")),
        }
        if with_ids:
            bank_id = data.get(f"{prefix}[id]")
            if bank_id not in EMPTY_VALUES:
                bank['id'] = bank_id
        banks.append(bank)
    payload['management'] = banks
    return payload


# ---------------------------------------------------------------------------
# Opening balance rules
# ---------------------------------------------------------------------------

def normalize_opening_balance(balance, bal_type):
    """Validate the opening balance. Returns (Decimal balance, type) or raises ValueError."""
    balance = D(balance)
    bal_type = clean_type(bal_type)
    if bal_type not in (None, CREDIT, DEBIT):
        raise ValueError("Opening balance type must be Credit or Debit")
    if balance < 0:
        raise ValueError("Opening balance cannot be negative")
    if balance > 0 and bal_type is None:
        raise ValueError("Select Credit or Debit for the opening balance")
    if balance == 0:
        bal_type = None
    return balance, bal_type


def treasure_after_change(treasure, old_bal, old_type, new_bal, new_type):
    """Reverse the old opening balance and apply the new one.
    Returns (cash, expense, shortfall).

    If the old Credit was already partly used (chit fund, interest, expenses),
    removing it would make cash negative. Instead of blocking, that used amount
    ("shortfall") is carried to the debit side, so the temple's net position
    (cash - expense) stays correct and cash_in_hand never goes below 0."""
    cash = D(treasure.cash_in_hand)
    expense = D(treasure.expence_amt)
    if old_type == CREDIT:
        cash -= old_bal
    elif old_type == DEBIT:
        expense -= old_bal
    if new_type == CREDIT:
        cash += new_bal
    elif new_type == DEBIT:
        expense += new_bal

    shortfall = ZERO
    if cash < 0:
        shortfall = -cash
        expense += shortfall
        cash = ZERO
    if expense < 0:
        cash += -expense
        expense = ZERO
    return cash, expense, shortfall


def create_treasure(profile, balance, bal_type):
    return ManagementTreasure.objects.create(
        management_profile=profile,
        cash_in_hand=balance if bal_type == CREDIT else ZERO,
        expence_amt=balance if bal_type == DEBIT else ZERO,
    )


def sync_opening_balance_sheet(profile, balance, bal_type, user):
    """Keep EXACTLY ONE opening-balance ManagementBalanceSheet row and ONE Report for it,
    matching the profile. Extra copies (left by the old code) are removed every time,
    so the opening balance can never be counted twice."""
    sheets = (ManagementBalanceSheet.objects
              .filter(management_profile=profile, managee=True)
              .order_by('id'))
    sheet = sheets.first()

    # Remove duplicate opening sheets and their reports
    if sheet:
        for extra in sheets.exclude(id=sheet.id):
            Report.objects.filter(mangebalancesheet=extra).delete()
            extra.delete()

    if balance <= 0 or bal_type is None:
        if sheet:
            Report.objects.filter(mangebalancesheet=sheet).delete()
            sheet.delete()
        return

    type_choice = "Addition" if bal_type == CREDIT else "Reduction"

    if sheet:
        sheet.opening_balance_amt = balance
        sheet.opening_balance_type = bal_type
        sheet.save()
    else:
        sheet = ManagementBalanceSheet.objects.create(
            management_profile=profile,
            managee=True,
            opening_balance_amt=balance,
            opening_balance_type=bal_type,
            date=timezone.now(),
        )

    # Keep one report for the sheet, remove duplicates
    reports = Report.objects.filter(mangebalancesheet=sheet).order_by('id')
    report = reports.first()
    if report:
        reports.exclude(id=report.id).delete()
        report.amount = balance
        report.type_choice = type_choice
        report.created_by = user.id
        report.save()
    else:
        Report.objects.create(
            type_choice=type_choice,
            management_profile=profile,
            amount=balance,
            created_by=user.id,
            mangebalancesheet=sheet,
        )


class OpeningBalanceError(Exception):
    def __init__(self, message, code=status.HTTP_409_CONFLICT):
        super().__init__(message)
        self.message = message
        self.code = code


def change_opening_balance(profile, user, new_bal, new_type, reason):
    """The ONE place that changes the opening balance.
    Call inside transaction.atomic() with `profile` locked (select_for_update).
    Updates profile, treasure, balance sheet, report and history.
    Returns True if something changed."""
    old_bal = D(profile.opening_balance)
    old_type = clean_type(profile.opening_balance_type)
    if old_bal == new_bal and old_type == new_type:
        return False

    treasure = (ManagementTreasure.objects.select_for_update()
                .filter(management_profile=profile).first())
    if treasure is None:
        treasure = create_treasure(profile, old_bal, old_type)

    # 1. New totals. Credit <-> Debit and any amount are allowed; money already
    #    used from an old Credit is carried to the debit side (see treasure_after_change).
    new_cash, new_expense, shortfall = treasure_after_change(treasure, old_bal, old_type, new_bal, new_type)
    if shortfall > 0:
        reason = f"{reason} (already-used amount {shortfall} carried to debit)"

    # 2. Apply
    profile.opening_balance = new_bal
    profile.opening_balance_type = new_type
    profile.save(update_fields=['opening_balance', 'opening_balance_type'])

    treasure.cash_in_hand = new_cash
    treasure.expence_amt = new_expense
    treasure.save(update_fields=['cash_in_hand', 'expence_amt'])

    # 3. Balance sheet + report
    sync_opening_balance_sheet(profile, new_bal, new_type, user)

    # 4. Audit trail
    OpeningBalanceAdjustment.objects.create(
        management_profile=profile,
        old_amount=old_bal, old_type=old_type,
        new_amount=new_bal, new_type=new_type,
        reason=reason,
        changed_by=user.id,
    )
    return True


# ---------------------------------------------------------------------------
# Bank opening balance helpers
# ---------------------------------------------------------------------------

def bank_has_transactions(bank):
    return (CashTransactionDetails.objects.filter(banks=bank).exists()
            or CashTransactionDetails.objects.filter(banks2=bank).exists())


def apply_bank_opening(bank, treasure, sign):
    """sign = +1 applies the bank's opening balance, -1 reverses it."""
    amount = D(bank.bank_opening_balance_amt)
    if amount <= 0:
        return
    delta = amount * sign

    if bank.bank_opening_balance_type == CREDIT:
        bank.credit_amt = D(bank.credit_amt) + delta
        if treasure:
            treasure.bank_amt = D(treasure.bank_amt) + delta
    elif bank.bank_opening_balance_type == DEBIT:
        bank.loan_amt = D(bank.loan_amt) + delta
        if treasure:
            treasure.loan_amt = D(treasure.loan_amt) + delta
    else:
        return

    bank.save()
    if treasure:
        treasure.save()


def sync_bank_report(bank, profile, user):
    report = Report.objects.filter(banks=bank, management_profile=profile, managee=True).first()
    amount = D(bank.bank_opening_balance_amt)

    if amount <= 0 or bank.bank_opening_balance_type not in (CREDIT, DEBIT):
        if report:
            report.delete()
        return

    type_choice = "Addition" if bank.bank_opening_balance_type == CREDIT else "Reduction"
    if report:
        report.amount = amount
        report.type_choice = type_choice
        report.created_by = user.id
        report.save()
    else:
        Report.objects.create(
            type_choice=type_choice,
            banks=bank,
            management_profile=profile,
            amount=amount,
            created_by=user.id,
            managee=True,
        )


# ---------------------------------------------------------------------------
# Family member tax flags
# ---------------------------------------------------------------------------

def update_member_tax_flags(profile):
    tax_age = int(profile.tax_age or 0)
    today = timezone.localdate()

    for member in Member_Details.objects.filter(management_profile=profile):
        if member.member_dob:
            dob = member.member_dob
            member.member_age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

        if member.member_age is not None and member.member_age >= 18:
            member.adult = True

        if (not member.death
                and member.member_relation_ship in ('SON', 'FATHER')
                and member.member_age is not None
                and tax_age > 0):
            member.member_tax_eligible = member.member_age >= tax_age

        member.save()


# ---------------------------------------------------------------------------
# Management profile
# ---------------------------------------------------------------------------

@api_view(['GET', 'POST'])
def add_management(request):
    user, error = authenticate(request)
    if error:
        return error

    if request.method == 'GET':
        profile = ManagementDetails.objects.first()
        return Response(ManagementDetailsSerializer(profile).data, status=status.HTTP_200_OK)

    # POST
    if not is_admin(user):
        return unauthorized()
    if ManagementDetails.objects.exists():
        return Response({"message": "Management Profile details already added"},
                        status=status.HTTP_406_NOT_ACCEPTABLE)

    try:
        payload = parse_management_payload(request.data)
    except (KeyError, TypeError, ValueError):
        return Response({"Message": "Data requirement error"}, status=status.HTTP_417_EXPECTATION_FAILED)

    try:
        balance, bal_type = normalize_opening_balance(payload['opening_balance'],
                                                      payload['opening_balance_type'])
    except ValueError as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    payload['opening_balance'] = balance
    payload['opening_balance_type'] = bal_type

    serializer = ManagementDetailsSerializer(data=payload)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        profile = serializer.save()
        profile.created_by = user.id
        profile.save()

        treasure = create_treasure(profile, balance, bal_type)
        sync_opening_balance_sheet(profile, balance, bal_type, user)

        for bank in BankDetails.objects.filter(management=profile):
            apply_bank_opening(bank, treasure, +1)
            sync_bank_report(bank, profile, user)

        if balance > 0:
            OpeningBalanceAdjustment.objects.create(
                management_profile=profile,
                old_amount=ZERO, old_type=None,
                new_amount=balance, new_type=bal_type,
                reason="Initial opening balance",
                changed_by=user.id,
            )

    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def edit_management(request, pk):
    user, error = authenticate(request)
    if error:
        return error

    if not ManagementDetails.objects.filter(pk=pk).exists():
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        profile = ManagementDetails.objects.get(pk=pk)
        return Response(ManagementDetailsSerializer(profile).data, status=status.HTTP_200_OK)

    if request.method == 'PATCH':
        return Response({"message": "Use PUT to update the profile"},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)

    if not is_admin(user):
        return unauthorized()

    if request.method == 'DELETE':
        with transaction.atomic():
            profile = ManagementDetails.objects.select_for_update().get(pk=pk)
            for bank in BankDetails.objects.filter(management=profile):
                apply_bank_opening(bank, None, -1)
            profile.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PUT: profile details, banks, and (if sent) the opening balance.
    # The opening balance goes through change_opening_balance, the same safe
    # path as the update_opening_balance endpoint.
    try:
        payload = parse_management_payload(request.data, with_ids=True)
    except (KeyError, TypeError, ValueError):
        return Response({"Message": "Data requirement error"}, status=status.HTTP_417_EXPECTATION_FAILED)

    balance_sent = 'opening_balance' in request.data
    if balance_sent:
        try:
            new_bal, new_type = normalize_opening_balance(request.data.get('opening_balance'),
                                                          request.data.get('opening_balance_type'))
        except ValueError as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        reason = (request.data.get('reason') or '').strip() or "Updated from profile edit"

    documents_flag = read_flag(request.data, 'documents_status')
    images_flag = read_flag(request.data, 'images_status')

    try:
        with transaction.atomic():
            profile = ManagementDetails.objects.select_for_update().get(pk=pk)

            # 1. Opening balance first (raises OpeningBalanceError -> whole PUT rolls back)
            if balance_sent:
                change_opening_balance(profile, user, new_bal, new_type, reason)

            # 2. Serializer must not overwrite the balance just applied
            payload['opening_balance'] = profile.opening_balance
            payload['opening_balance_type'] = profile.opening_balance_type

            serializer = ManagementDetailsSerializer(profile, data=payload)
            if not serializer.is_valid():
                transaction.set_rollback(True)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Fetched after step 1, so it has the updated cash / expense values
            treasure = (ManagementTreasure.objects.select_for_update()
                        .filter(management_profile=profile).first())
            if treasure is None:
                treasure = create_treasure(profile, D(profile.opening_balance), profile.opening_balance_type)

            # 3. Reverse bank opening balances that are not yet used in transactions
            for bank in BankDetails.objects.filter(management=profile):
                if not bank_has_transactions(bank):
                    apply_bank_opening(bank, treasure, -1)

            profile = serializer.save()
            if documents_flag is False:
                profile.documents = ''   # '' is safe for null and non-null FileFields
            if images_flag is False:
                profile.images = ''
            profile.save()

            # 4. Re-apply bank opening balances with the new values
            for bank in BankDetails.objects.filter(management=profile):
                if not bank_has_transactions(bank):
                    apply_bank_opening(bank, treasure, +1)
                    sync_bank_report(bank, profile, user)

            update_member_tax_flags(profile)
    except OpeningBalanceError as e:
        return Response({"message": e.message}, status=e.code)

    return Response(serializer.data, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Opening balance (separate, audited endpoint)
# ---------------------------------------------------------------------------

@api_view(['GET', 'POST'])
def update_opening_balance(request, pk):
    user, error = authenticate(request)
    if error:
        return error

    if request.method == 'GET':
        history = (OpeningBalanceAdjustment.objects
                   .filter(management_profile_id=pk)
                   .order_by('-changed_at')
                   .values('id', 'old_amount', 'old_type', 'new_amount', 'new_type',
                           'reason', 'changed_by', 'changed_at'))
        return Response(list(history), status=status.HTTP_200_OK)

    if not is_admin(user):
        return unauthorized()

    try:
        new_bal, new_type = normalize_opening_balance(request.data.get('opening_balance'),
                                                      request.data.get('opening_balance_type'))
    except ValueError as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    reason = (request.data.get('reason') or '').strip()
    if not reason:
        return Response({"message": "Reason is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            profile = ManagementDetails.objects.select_for_update().filter(pk=pk).first()
            if not profile:
                return Response(status=status.HTTP_404_NOT_FOUND)
            changed = change_opening_balance(profile, user, new_bal, new_type, reason)
    except OpeningBalanceError as e:
        return Response({"message": e.message}, status=e.code)

    if not changed:
        return Response({"message": "No change"}, status=status.HTTP_200_OK)

    return Response({"message": "Opening balance updated",
                     "opening_balance": str(new_bal),
                     "opening_balance_type": new_type},
                    status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Banks
# ---------------------------------------------------------------------------

@api_view(['GET'])
def view_bank_details(request):
    user, error = authenticate(request)
    if error:
        return error
    management, error = get_management_or_error()
    if error:
        return error

    banks = BankDetails.objects.filter(management=management)
    return Response(BankDetailsSerializer(banks, many=True).data, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Instructions
# ---------------------------------------------------------------------------

@api_view(['POST', 'GET'])
def add_instructions(request):
    user, error = authenticate(request)
    if error:
        return error
    management, error = get_management_or_error()
    if error:
        return error

    existing = Instructions.objects.filter(management=management).first()

    if request.method == 'GET':
        if not existing:
            return Response([], status=status.HTTP_202_ACCEPTED)
        return Response(InstructionSerializer(existing).data, status=status.HTTP_200_OK)

    # POST
    if not is_admin(user):
        return unauthorized()
    if existing:
        return Response({'message': 'Instructions Already added'}, status=status.HTTP_302_FOUND)

    serializer = InstructionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    serializer.save(management=management)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'GET', 'DELETE'])
def edit_instructions(request, pk):
    user, error = authenticate(request)
    if error:
        return error
    management, error = get_management_or_error()
    if error:
        return error

    instruction = Instructions.objects.filter(id=pk, management=management).first()
    if not instruction:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(InstructionSerializer(instruction).data, status=status.HTTP_200_OK)

    if not is_admin(user):
        return unauthorized()

    if request.method == 'PUT':
        serializer = InstructionSerializer(instruction, data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(management=management)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # DELETE
    instruction.delete()
    return Response({'message': "Deleted Successfully"}, status=status.HTTP_204_NO_CONTENT)