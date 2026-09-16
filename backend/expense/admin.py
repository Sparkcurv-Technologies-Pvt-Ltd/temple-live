from django.contrib import admin
from .models import ADDExpenseCategory,ADDExpenseNames,ADDExpenseDetails
# Register your models here.

admin.site.register(ADDExpenseCategory)
admin.site.register(ADDExpenseNames)
admin.site.register(ADDExpenseDetails)

