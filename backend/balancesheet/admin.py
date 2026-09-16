from django.contrib import admin
from .models import MoveableRentBalanceSheet,RentalBalanceSheet,PeopleInterestBalanceSheet,FundBalanceSheet,FundMembersBalanceSheet
# Register your models here.

admin.site.register(RentalBalanceSheet)
admin.site.register(PeopleInterestBalanceSheet)
admin.site.register(FundBalanceSheet)
admin.site.register(FundMembersBalanceSheet)
admin.site.register(MoveableRentBalanceSheet)


