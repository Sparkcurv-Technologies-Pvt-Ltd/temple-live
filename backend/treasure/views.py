# Replace the imports at the top of treasure/views.py with these (keep any others your
# other views need), and replace temple_balancesheet_details with the version below.

from decimal import Decimal

from django.core.exceptions import FieldDoesNotExist
from django.db import models
from django.db.models import Sum
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from token_app.views import token_checking
from management.models import ManagementDetails
from income.models import ADDIncomeDetails
from amount.models import PeoplesAmountDetails
from balancesheet.models import PeopleInterestBalanceSheet, FundMembersBalanceSheet, RentalBalanceSheet


ZERO = Decimal('0')

# Date field used for the POST date-range filter on each model.
# Change 'date' to the real field name if a model uses something else
# (e.g. 'created_at', 'paid_date'). If the field doesn't exist, that model
# is simply not filtered by date.
DATE_FIELDS = {
    ADDIncomeDetails: 'date',
    PeoplesAmountDetails: 'date',
    RentalBalanceSheet: 'date',
    PeopleInterestBalanceSheet: 'date',
    FundMembersBalanceSheet: 'date',
}


def D(value):
    if value in (None, '', 'null'):
        return ZERO
    return Decimal(str(value))


def total(queryset, field):
    """Sum a field; returns 0 instead of None when there are no rows."""
    return D(queryset.aggregate(t=Sum(field))['t'])


def in_range(queryset, start, end):
    if not (start and end):
        return queryset
    field_name = DATE_FIELDS.get(queryset.model)
    if not field_name:
        return queryset
    try:
        field = queryset.model._meta.get_field(field_name)
    except FieldDoesNotExist:
        return queryset
    lookup = f"{field_name}__date__range" if isinstance(field, models.DateTimeField) else f"{field_name}__range"
    return queryset.filter(**{lookup: (start, end)})


def signed_opening_balance(management):
    """Credit adds to the total, Debit subtracts. Read from the profile (source of truth)."""
    amount = D(management.opening_balance)
    if management.opening_balance_type == 'Credit':
        return amount, 'Credit'
    if management.opening_balance_type == 'Debit':
        return -amount, 'Debit'
    return ZERO, None


def build_summary(management, start=None, end=None):
    people = PeoplesAmountDetails.objects.filter(management_profile=management)
    opening, opening_type = signed_opening_balance(management)

    items = [
        ("Income", total(in_range(ADDIncomeDetails.objects.filter(management_profile=management), start, end), 'income_amt')),
        ("Opening Balance", opening),
        ("Month Tariff", total(in_range(people.filter(sub_tariff__isnull=False), start, end), 'total_paid_amt')),
        ("Death Tariff", total(in_range(people.filter(death__isnull=False), start, end), 'total_paid_amt')),
        ("Marriage", total(in_range(people.filter(marriage__isnull=False), start, end), 'total_paid_amt')),
        ("Festival", total(in_range(people.filter(festival__isnull=False), start, end), 'total_paid_amt')),
        ("Rent", total(in_range(RentalBalanceSheet.objects.filter(management_profile=management), start, end), 'debit_amt')),
        ("Interest", total(in_range(PeopleInterestBalanceSheet.objects.filter(management_profile=management), start, end), 'debit_amt')),
        ("Fund", total(in_range(FundMembersBalanceSheet.objects.filter(management_profile=management), start, end), 'debit_amt')),
    ]

    data = {}
    for index, (name, value) in enumerate(items, start=1):
        data[f'name{index}'] = name
        data[f'value{index}'] = value
    data['opening_balance_type'] = opening_type
    data['total_income'] = sum((value for _, value in items), ZERO)
    data['items'] = [{'name': name, 'value': value} for name, value in items]
    return data


@api_view(['GET', 'POST'])
def temple_balancesheet_details(request):
    user = token_checking(request)
    if not user:
        return Response({"message": "No User Found"}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        return Response({"message": "Not Authorized Please Contact Admin"}, status=status.HTTP_401_UNAUTHORIZED)

    management = ManagementDetails.objects.first()
    if not management:
        return Response({"message": "First Add Management Profile details"},
                        status=status.HTTP_406_NOT_ACCEPTABLE)

    start = end = None
    if request.method == 'POST':
        date_range = request.data.get('range') or {}
        try:
            start = parse_date(str(date_range.get('start_date') or ''))
            end = parse_date(str(date_range.get('end_date') or ''))
        except ValueError:
            return Response({"message": "Invalid date. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)
        if (start is None) != (end is None):
            return Response({"message": "Give both start_date and end_date"}, status=status.HTTP_400_BAD_REQUEST)
        if start and end and start > end:
            return Response({"message": "start_date must be before end_date"}, status=status.HTTP_400_BAD_REQUEST)

    return Response(build_summary(management, start, end), status=status.HTTP_200_OK)