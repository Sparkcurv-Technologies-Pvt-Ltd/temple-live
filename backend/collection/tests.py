from django.test import TestCase
from datetime import date, timedelta,datetime
import calendar

# Create your tests here.
date_obj='2024-01-15'
y = datetime.strptime(date_obj, "%Y-%m-%d").date()
print(y)
# date_obj=str(2024-1-15)
# # start_date = date(date_obj)
# start_date=datetime.strptime(date_obj, "%Y-%m-%d").date()
# days_in_month = calendar.monthrange(start_date.year, start_date.month)[1]
# print(date_obj + timedelta(days=days_in_month))



# date_str = '09-19-2022'
# date_str=str(2024-1-15)

# date_object = datetime.strptime(date_str, '%m-%d-%Y').date()
# print(date_object)


# from datetime import datetime

# date_string = "2018-08-09"

# date_object = datetime.strptime(date_string, "%Y-%m-%d").date()
# print(date_object + timedelta(months=1))
# print(date_object)



from datetime import datetime
from dateutil.relativedelta import relativedelta

date_string = "2018-08-09"
date_object = datetime.strptime(date_string, "%Y-%m-%d").date()

# Adding one month using relativedelta
new_date_object = date_object + relativedelta(months=1)

print(new_date_object)


today=date.today()
if new_date_object < today:
    print("khjhj")
else:
    print("jkhkj")