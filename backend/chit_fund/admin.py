from django.contrib import admin
from .models import ChitFundsDetails,ChitFundInvesters,ChitFundsettleAplication,ChitFundSettlement

admin.site.register(ChitFundsDetails)
admin.site.register(ChitFundInvesters)
admin.site.register(ChitFundsettleAplication)
admin.site.register(ChitFundSettlement)

