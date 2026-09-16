from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import (
    ADDExpenseCategorySerializer,
    ADDExpenseNamesSerializer,
    ADDExpenseDetailsSerializer,
)
from .models import ADDExpenseCategory, ADDExpenseNames, ADDExpenseDetails
from .chit_fund_hooks import (
    check_chit_fund_cash,
    apply_chit_fund_expense,
    reverse_chit_fund_expense,
)
from chit_fund.models import ChitFundsDetails
from token_app.views import token_checking, generate_token
from user.models import User
from management.models import ManagementDetails
from permisions.models import Permisions
from treasure.models import ManagementTreasure
from reports.models import Report
from management.models import BankDetails
from datetime import datetime


def _get_permission(rejin):
    """Fetch the Permisions row for this user's role, or None if not set."""
    if rejin.my_role is not None:
        return Permisions.objects.filter(role_link_id=rejin.my_role.id).first()
    return None


def _get_management_or_error():
    """Return (management, error_response). error_response is None on success."""
    check_management = ManagementDetails.objects.all()
    if not check_management:
        return None, Response(
            {'message': "First Add Management Profile details"},
            status=status.HTTP_406_NOT_ACCEPTABLE,
        )
    return check_management.first(), None


# --------------------------------------------------------------------------
# Expense Category
# --------------------------------------------------------------------------
@api_view(['GET', 'POST'])
def add_expen_categry(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)

    get_role = rejin.user_role
    perm = _get_permission(rejin)

    management, err = _get_management_or_error()
    if err:
        return err

    if request.method == 'POST':
        is_authorized = (
            get_role == "Admin"
            or rejin.is_superuser is True
            or (get_role == "User" and perm is not None and perm.expense_add is True)
        )
        if not is_authorized:
            return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        category_name = request.data.get('category_name')
        if ADDExpenseCategory.objects.filter(management_profile=management, category_name=category_name).exists():
            return Response({'message': 'Similar category name already exists'}, status=status.HTTP_302_FOUND)

        serializer876 = ADDExpenseCategorySerializer(data=request.data)
        if serializer876.is_valid():
            temp_family = serializer876.save()
            temp_family.created_by = rejin.id
            temp_family.management_profile = management
            temp_family.save()
            return Response(serializer876.data, status=status.HTTP_201_CREATED)
        return Response(serializer876.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        our_family = ADDExpenseCategory.objects.filter(management_profile=management)
        serializer = ADDExpenseCategorySerializer(our_family, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def edit_expen_categry(request, pk):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)

    get_role = rejin.user_role
    perm = _get_permission(rejin)

    try:
        customer = ADDExpenseCategory.objects.get(pk=pk)
    except ADDExpenseCategory.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    management, err = _get_management_or_error()
    if err:
        return err

    if request.method == 'GET':
        serializer = ADDExpenseCategorySerializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        is_authorized = get_role == "Admin" or rejin.is_superuser is True or (
            get_role == "User" and perm is not None and perm.expense_edit is True
        )
        if not is_authorized:
            return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        if ADDExpenseDetails.objects.filter(category=pk).exists():
            return Response({'message': 'Cannot be edited as it is added in expense details'}, status=status.HTTP_302_FOUND)

        category_name = request.data.get('category_name')
        if ADDExpenseCategory.objects.filter(management_profile=management, category_name=category_name).exclude(id=pk).exists():
            return Response({'message': 'Similar category name already exists'}, status=status.HTTP_302_FOUND)

        serializer876 = ADDExpenseCategorySerializer(customer, data=request.data)
        if serializer876.is_valid():
            temp_family = serializer876.save()
            temp_family.created_by = rejin.id
            temp_family.management_profile = management
            temp_family.save()
            return Response(serializer876.data, status=status.HTTP_201_CREATED)
        return Response(serializer876.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PATCH':
        is_authorized = get_role == "Admin" or rejin.is_superuser is True or (
            get_role == "User" and perm is not None and perm.expense_edit is True
        )
        if not is_authorized:
            return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        serializer876 = ADDExpenseCategorySerializer(customer, data=request.data, partial=True)
        if serializer876.is_valid():
            temp_family = serializer876.save()
            temp_family.created_by = rejin.id
            temp_family.management_profile = management
            temp_family.save()
            return Response(serializer876.data, status=status.HTTP_201_CREATED)
        return Response(serializer876.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        is_authorized = get_role == "Admin" or rejin.is_superuser is True or (
            get_role == "User" and perm is not None and (perm.expense_edit is True or perm.expense_delete is True)
        )
        if not is_authorized:
            return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        if ADDExpenseDetails.objects.filter(category=pk).exists():
            return Response({'message': 'Cannot be deleted as it is added in expense details'}, status=status.HTTP_302_FOUND)

        customer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --------------------------------------------------------------------------
# Expense Names
# --------------------------------------------------------------------------
@api_view(['GET', 'POST'])
def add_expen_names(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)

    get_role = rejin.user_role
    perm = _get_permission(rejin)

    management, err = _get_management_or_error()
    if err:
        return err

    if request.method == 'POST':
        is_authorized = get_role == "Admin" or rejin.is_superuser is True or (
            get_role == "User" and perm is not None and perm.expense_add is True
        )
        if not is_authorized:
            return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        expense_name = request.data.get('expense_name')
        if ADDExpenseNames.objects.filter(management_profile=management, expense_name=expense_name).exists():
            return Response({'message': 'Similar expense name already exists'}, status=status.HTTP_302_FOUND)

        serializer876 = ADDExpenseNamesSerializer(data=request.data)
        if serializer876.is_valid():
            temp_family = serializer876.save()
            temp_family.created_by = rejin.id
            temp_family.management_profile = management
            temp_family.save()
            return Response(serializer876.data, status=status.HTTP_201_CREATED)
        return Response(serializer876.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        our_family = ADDExpenseNames.objects.filter(management_profile=management)
        serializer = ADDExpenseNamesSerializer(our_family, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def edit_expen_names(request, pk):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)

    get_role = rejin.user_role
    perm = _get_permission(rejin)

    try:
        customer = ADDExpenseNames.objects.get(pk=pk)
    except ADDExpenseNames.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    management, err = _get_management_or_error()
    if err:
        return err

    if request.method == 'GET':
        serializer = ADDExpenseNamesSerializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        is_authorized = get_role == "Admin" or rejin.is_superuser is True or (
            get_role == "User" and perm is not None and perm.expense_edit is True
        )
        if not is_authorized:
            return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        if ADDExpenseDetails.objects.filter(expense=pk).exists():
            return Response({'message': 'Cannot be edited as it is added in expense details'}, status=status.HTTP_302_FOUND)

        expense_name = request.data.get('expense_name')
        if ADDExpenseNames.objects.filter(management_profile=management, expense_name=expense_name).exclude(id=pk).exists():
            return Response({'message': 'Similar expense name already exists'}, status=status.HTTP_302_FOUND)

        serializer876 = ADDExpenseNamesSerializer(customer, data=request.data)
        if serializer876.is_valid():
            temp_family = serializer876.save()
            temp_family.created_by = rejin.id
            temp_family.management_profile = management
            temp_family.save()
            return Response(serializer876.data, status=status.HTTP_201_CREATED)
        return Response(serializer876.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PATCH':
        is_authorized = get_role == "Admin" or rejin.is_superuser is True or (
            get_role == "User" and perm is not None and perm.expense_edit is True
        )
        if not is_authorized:
            return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        serializer876 = ADDExpenseNamesSerializer(customer, data=request.data, partial=True)
        if serializer876.is_valid():
            temp_family = serializer876.save()
            temp_family.created_by = rejin.id
            temp_family.management_profile = management
            temp_family.save()
            return Response(serializer876.data, status=status.HTTP_201_CREATED)
        return Response(serializer876.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        is_authorized = get_role == "Admin" or rejin.is_superuser is True or (
            get_role == "User" and perm is not None and (perm.expense_delete is True or perm.expense_edit is True)
        )
        if not is_authorized:
            return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        if ADDExpenseDetails.objects.filter(expense=pk).exists():
            return Response({'message': 'Cannot be deleted as it is added in expense details'}, status=status.HTTP_302_FOUND)

        customer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --------------------------------------------------------------------------
# Expense Details (the core "add expense" transaction)
# --------------------------------------------------------------------------
@api_view(['GET', 'POST'])
def add_expen_details(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)

    get_role = rejin.user_role
    perm = _get_permission(rejin)

    management, err = _get_management_or_error()
    if err:
        return err

    if request.method == 'POST':
        is_authorized = get_role == "Admin" or rejin.is_superuser is True or (
            get_role == "User" and perm is not None and perm.expense_add is True
        )
        if not is_authorized:
            return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        serializer876 = ADDExpenseDetailsSerializer(data=request.data)
        if not serializer876.is_valid():
            return Response(serializer876.errors, status=status.HTTP_400_BAD_REQUEST)

        # ------------------------------------------------------------
        # Owner rule (Feb 2026): if this is a "Chit Fund Expense"
        # linked to a specific chit fund, guard against negative
        # cash-in-hand BEFORE saving. The debit itself happens
        # AFTER save() so we operate on the persisted row.
        # ------------------------------------------------------------
        expense_subcategory = (request.data.get('expense_subcategory') or '').strip()
        chit_fund_id = request.data.get('chitt_fund') or None
        chit_fund_obj = None
        if expense_subcategory == 'Chit Fund Expense' and chit_fund_id:
            try:
                chit_fund_obj = ChitFundsDetails.objects.get(id=chit_fund_id, management_profile=management)
            except ChitFundsDetails.DoesNotExist:
                return Response({'message': 'Selected chit fund not found'}, status=status.HTTP_400_BAD_REQUEST)
            ok, msg = check_chit_fund_cash(chit_fund_obj, request.data.get('expense_amt') or 0)
            if not ok:
                return Response({'message': msg}, status.HTTP_302_FOUND)

        # ------------------------------------------------------------
        # FIX: explicit numeric validation instead of relying on a
        # bare except to route bank-vs-cash. A missing/invalid amount
        # now fails loudly instead of silently becoming a cash entry.
        # ------------------------------------------------------------
        raw_expense_amt = request.data.get('expense_amt')
        if raw_expense_amt is None:
            return Response({'message': 'expense_amt is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            expense_amt = float(raw_expense_amt)
        except (TypeError, ValueError):
            return Response({'message': 'expense_amt must be a valid number'}, status=status.HTTP_400_BAD_REQUEST)

        bank_id = request.data.get('bank')  # None (or falsy) => cash expense

        manage_get = ManagementTreasure.objects.filter(management_profile=management).first()

        bank_obj = None
        if bank_id:
            bank_obj = BankDetails.objects.filter(id=bank_id).first()
            if bank_obj is None:
                return Response({'message': 'Selected bank not found'}, status=status.HTTP_400_BAD_REQUEST)

            # FIX: Decimal and float now both coerced to float before
            # comparing, so this check actually runs instead of raising
            # a silently-swallowed TypeError.
            if float(bank_obj.credit_amt) < expense_amt:
                return Response(
                    {
                        'message': (
                            "Insufficient bank amount, Only "
                            + f'{int(bank_obj.credit_amt)}'
                            + " rupees is available in selected bank"
                        )
                    },
                    status.HTTP_302_FOUND,
                )

            if manage_get is not None:
                manage_get.bank_amt = float(manage_get.bank_amt) - expense_amt
                manage_get.reduce_expence_amt = float(manage_get.reduce_expence_amt) + expense_amt
                manage_get.save()

            bank_obj.debit_amt = float(bank_obj.debit_amt) + expense_amt
            bank_obj.credit_amt = float(bank_obj.credit_amt) - expense_amt
            bank_obj.save()

        else:
            # Cash expense
            if manage_get is not None:
                manage_get.expence_amt = float(manage_get.expence_amt) + expense_amt
                manage_get.save()

        temp_family = serializer876.save()
        temp_family.created_by = rejin.id
        temp_family.management_profile = management
        temp_family.save()

        # Chit-Fund debit (Feb 2026 owner rule): apply the
        # profit_amount + cash_inhand_amount deduction on the
        # linked chit fund now that the expense row is persisted.
        if chit_fund_obj is not None:
            apply_chit_fund_expense(chit_fund_obj, temp_family.expense_amt)

        Report.objects.create(
            banks=temp_family.bank,
            type_choice="Reduction",
            management_profile=temp_family.management_profile,
            expenses=temp_family,
            amount=temp_family.expense_amt,
            created_by=rejin.id,
        )
        return Response(serializer876.data, status=status.HTTP_201_CREATED)

    elif request.method == 'GET':
        our_family = ADDExpenseDetails.objects.filter(management_profile=management)
        serializer = ADDExpenseDetailsSerializer(our_family, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def edit_expen_details(request, pk):
    rejin = token_checking(request)
    management, err = _get_management_or_error()
    if err:
        return err
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)

    get_role = rejin.user_role
    perm = _get_permission(rejin)

    try:
        customer = ADDExpenseDetails.objects.get(pk=pk)
    except ADDExpenseDetails.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    previous_amount = customer.expense_amt
    previous_bank = customer.bank  # BankDetails instance or None

    if request.method == 'GET':
        serializer = ADDExpenseDetailsSerializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        is_authorized = get_role == "Admin" or rejin.is_superuser is True or (
            get_role == "User" and perm is not None and perm.expense_edit is True
        )
        if not is_authorized:
            return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        now = datetime.now()
        same_month_and_year = (customer.date.month == now.month and customer.date.year == now.year)
        if not same_month_and_year:
            return Response({'message': "Cannot be edited"}, status.HTTP_302_FOUND)

        serializer876 = ADDExpenseDetailsSerializer(customer, data=request.data)
        if not serializer876.is_valid():
            return Response(serializer876.errors, status=status.HTTP_400_BAD_REQUEST)

        # ------------------------------------------------------------
        # Owner rule (Feb 2026): reverse-then-reapply chit-fund debit
        # on edit. Handles category switch (Chit Fund -> Temple),
        # amount change, chit-fund switch, etc.
        # ------------------------------------------------------------
        prev_chit = customer.chitt_fund
        prev_was_chit = (customer.expense_subcategory == 'Chit Fund Expense') and (prev_chit is not None)

        new_sub = (request.data.get('expense_subcategory') or '').strip()
        new_chit_id = request.data.get('chitt_fund') or None
        new_chit_obj = None
        if new_sub == 'Chit Fund Expense' and new_chit_id:
            try:
                new_chit_obj = ChitFundsDetails.objects.get(id=new_chit_id, management_profile=management)
            except ChitFundsDetails.DoesNotExist:
                return Response({'message': 'Selected chit fund not found'}, status=status.HTTP_400_BAD_REQUEST)

            new_amt_raw = request.data.get('expense_amt') or 0
            try:
                new_amt = float(new_amt_raw)
            except (TypeError, ValueError):
                return Response({'message': 'expense_amt must be a valid number'}, status=status.HTTP_400_BAD_REQUEST)

            # Preview: available cash on target chit AFTER reversing the
            # previous debit (if same chit-fund), so a same-chit amount
            # tweak doesn't false-flag as insufficient.
            if prev_was_chit and prev_chit and prev_chit.id == new_chit_obj.id:
                preview_avail = float(new_chit_obj.cash_inhand_amount or 0) + float(previous_amount or 0)
                if preview_avail < new_amt:
                    return Response(
                        {
                            'message': (
                                'Insufficient chit-fund cash. Only Rs. '
                                + f'{preview_avail:.2f}'
                                + ' available in '
                                + f'{new_chit_obj.chit_name}'
                            )
                        },
                        status.HTTP_302_FOUND,
                    )
            else:
                ok, msg = check_chit_fund_cash(new_chit_obj, new_amt)
                if not ok:
                    return Response({'message': msg}, status.HTTP_302_FOUND)

        # Clear stale payment-mode-specific fields from the OLD record
        # before applying the new data (unchanged from original intent).
        if customer.payment_mode == "Online":
            customer.bank = None
            customer.transaction_no = None
            customer.transaction_date = None
            customer.transaction_type = None
            customer.bank_name = None
            customer.bank_pay = None
            customer.save()
        elif customer.payment_mode == "Offline":
            if customer.transaction_type == "Cheque":
                customer.transaction_no = None
                customer.transaction_date = None
                customer.cheque_no = None
                customer.save()

        # ------------------------------------------------------------
        # Step 1: reverse the PREVIOUS effect on treasure/bank.
        # ------------------------------------------------------------
        manage_get = ManagementTreasure.objects.filter(management_profile=management).first()
        previous_amount_f = float(previous_amount or 0)

        if manage_get is not None:
            if previous_bank is not None:
                manage_get.bank_amt = float(manage_get.bank_amt) + previous_amount_f
                manage_get.save()

                bank_previous = BankDetails.objects.filter(id=previous_bank.id).first()
                if bank_previous is not None:
                    bank_previous.debit_amt = float(bank_previous.debit_amt) - previous_amount_f
                    bank_previous.credit_amt = float(bank_previous.credit_amt) + previous_amount_f
                    bank_previous.save()
            else:
                manage_get.expence_amt = float(manage_get.expence_amt) - previous_amount_f
                manage_get.save()

        # ------------------------------------------------------------
        # Step 2: apply the NEW effect on treasure/bank.
        # ------------------------------------------------------------
        raw_new_expense_amt = request.data.get('expense_amt')
        if raw_new_expense_amt is None:
            return Response({'message': 'expense_amt is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            new_expense_amt = float(raw_new_expense_amt)
        except (TypeError, ValueError):
            return Response({'message': 'expense_amt must be a valid number'}, status=status.HTTP_400_BAD_REQUEST)

        new_bank_id = request.data.get('bank')

        if new_bank_id:
            new_bank_obj = BankDetails.objects.filter(id=new_bank_id).first()
            if new_bank_obj is None:
                return Response({'message': 'Selected bank not found'}, status=status.HTTP_400_BAD_REQUEST)

            # FIX: same Decimal/float coercion fix as add_expen_details.
            if float(new_bank_obj.credit_amt) < new_expense_amt:
                return Response(
                    {
                        'message': (
                            "Insufficient bank amount, Only "
                            + f'{int(new_bank_obj.credit_amt)}'
                            + " rupees is available in selected bank"
                        )
                    },
                    status.HTTP_302_FOUND,
                )

            if manage_get is not None:
                manage_get.bank_amt = float(manage_get.bank_amt) - new_expense_amt
                manage_get.save()

            new_bank_obj.debit_amt = float(new_bank_obj.debit_amt) + new_expense_amt
            new_bank_obj.credit_amt = float(new_bank_obj.credit_amt) - new_expense_amt
            new_bank_obj.save()

        else:
            if manage_get is not None:
                manage_get.expence_amt = float(manage_get.expence_amt) + new_expense_amt
                manage_get.save()

        temp_family = serializer876.save()
        temp_family.created_by = rejin.id
        temp_family.management_profile = management
        temp_family.save()

        # Chit-Fund reverse-then-reapply (Feb 2026 owner rule).
        if prev_was_chit:
            prev_chit.refresh_from_db()
            reverse_chit_fund_expense(prev_chit, previous_amount)
        if new_chit_obj is not None:
            new_chit_obj.refresh_from_db()
            apply_chit_fund_expense(new_chit_obj, temp_family.expense_amt)

        report_checks = Report.objects.filter(expenses=pk).first()
        if report_checks is not None:
            report_checks.amount = temp_family.expense_amt
            report_checks.expenses_id = pk
            report_checks.banks = temp_family.bank
            report_checks.management_profile = temp_family.management_profile
            report_checks.type_choice = "Reduction"
            report_checks.created_by = rejin.id
            report_checks.save()

        return Response(serializer876.data, status=status.HTTP_201_CREATED)

    elif request.method == 'PATCH':
        is_authorized = get_role == "Admin" or rejin.is_superuser is True or (
            get_role == "User" and perm is not None and perm.expense_edit is True
        )
        if not is_authorized:
            return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        serializer876 = ADDExpenseDetailsSerializer(customer, data=request.data, partial=True)
        if not serializer876.is_valid():
            return Response(serializer876.errors, status=status.HTTP_400_BAD_REQUEST)

        prev_chit = customer.chitt_fund
        prev_amt = customer.expense_amt
        prev_was_chit = (customer.expense_subcategory == 'Chit Fund Expense') and (prev_chit is not None)

        temp_family = serializer876.save()
        temp_family.created_by = rejin.id
        temp_family.management_profile = management
        temp_family.save()

        new_was_chit = (temp_family.expense_subcategory == 'Chit Fund Expense') and (temp_family.chitt_fund is not None)
        if prev_was_chit:
            prev_chit.refresh_from_db()
            reverse_chit_fund_expense(prev_chit, prev_amt)
        if new_was_chit:
            temp_family.chitt_fund.refresh_from_db()
            apply_chit_fund_expense(temp_family.chitt_fund, temp_family.expense_amt)

        # NOTE: unchanged from original — this branch does not touch
        # bank/cash treasure balances for partial updates. If PATCH is
        # expected to change expense_amt or bank, that balance logic
        # needs to be added here following the same pattern as PUT.
        manage_get = ManagementTreasure.objects.filter(management_profile=management).first()
        if manage_get is not None:
            manage_get.save()

        return Response(serializer876.data, status=status.HTTP_201_CREATED)

    elif request.method == 'DELETE':
        is_authorized = get_role == "Admin" or rejin.is_superuser is True or (
            get_role == "User" and perm is not None and (perm.expense_edit is True or perm.expense_delete is True)
        )
        if not is_authorized:
            return Response({'message': "un-authenticate"}, status.HTTP_401_UNAUTHORIZED)

        now = datetime.now()
        same_month_and_year = (customer.date.month == now.month and customer.date.year == now.year)
        if not same_month_and_year:
            return Response({'message': "Cannot be deleted"}, status.HTTP_302_FOUND)

        # Chit-Fund credit-back (Feb 2026 owner rule): if the deleted
        # row was a Chit Fund Expense linked to a chit fund, restore
        # profit_amount + cash_inhand_amount before the row vanishes.
        if customer.expense_subcategory == 'Chit Fund Expense' and customer.chitt_fund is not None:
            reverse_chit_fund_expense(customer.chitt_fund, customer.expense_amt)

        manage_get = ManagementTreasure.objects.filter(management_profile=management).first()
        if manage_get is not None:
            if customer.bank is not None:
                manage_get.bank_amt = float(manage_get.bank_amt) + float(previous_amount)
                manage_get.reduce_expence_amt = float(manage_get.reduce_expence_amt) - float(previous_amount)
                manage_get.save()

                bank = BankDetails.objects.filter(id=customer.bank.id).first()
                if bank is not None:
                    bank.debit_amt = float(bank.debit_amt) - float(previous_amount)
                    bank.credit_amt = float(bank.credit_amt) + float(previous_amount)
                    bank.save()
            else:
                manage_get.expence_amt = float(manage_get.expence_amt) - float(previous_amount)
                manage_get.save()

        customer.delete()

        report_checks = Report.objects.filter(expenses=pk).first()
        if report_checks is not None:
            report_checks.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def expense_detail_filter(request):
    rejin = token_checking(request)
    if not rejin:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not rejin.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)

    management, err = _get_management_or_error()
    if err:
        return err

    if request.method == 'POST':
        date_range = request.data.get('range') or {}
        start_date = date_range.get('start_date')
        end_date = date_range.get('end_date')

        if not (start_date and end_date):
            return Response({'message': 'start_date and end_date are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            start_date_time_obj = datetime.strptime(str(start_date), '%Y-%m-%d').date()
            end_date_time_obj = datetime.strptime(str(end_date), '%Y-%m-%d').date()
        except ValueError:
            return Response({'message': 'Dates must be in YYYY-MM-DD format'}, status=status.HTTP_400_BAD_REQUEST)

        our_family = ADDExpenseDetails.objects.filter(
            management_profile=management,
            date__gte=start_date_time_obj,
            date__lte=end_date_time_obj,
        )
        serializer = ADDExpenseDetailsSerializer(our_family, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'GET':
        our_family = ADDExpenseDetails.objects.filter(management_profile=management)
        serializer = ADDExpenseDetailsSerializer(our_family, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)