from django.contrib import admin
from .models import ManagementTreasure, ManagementFunds, ManagementBalanceSheet

admin.site.register(ManagementTreasure)
admin.site.register(ManagementFunds)
admin.site.register(ManagementBalanceSheet)