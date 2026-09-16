from apscheduler.schedulers.background import BackgroundScheduler
from django.core.mail import send_mail
import datetime

scheduler = BackgroundScheduler()

def subscription():
    from my_tasks.views import subscription_delete
    subscription_delete()

def start():
    if scheduler.running:
        return  # already started (guard against double-start in dev reload)
    # Run once daily starting from the next midnight
    next_midnight = (datetime.datetime.now() + datetime.timedelta(days=1)).replace(
        hour=0, minute=5, second=0, microsecond=0
    )
    scheduler.add_job(
        subscription,
        'interval',
        days=1,
        start_date=next_midnight,
        id='daily_subscription_delete',
        replace_existing=True,
    )
    scheduler.start()