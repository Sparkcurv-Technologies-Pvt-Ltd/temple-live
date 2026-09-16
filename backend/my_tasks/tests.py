from django.test import TestCase
import datetime
from dateutil.relativedelta import relativedelta

# Create your tests here.
end_date=(datetime.date.today() + relativedelta(days=1))
print(end_date)