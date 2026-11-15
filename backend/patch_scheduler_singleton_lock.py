"""
One-off patch (run directly on the server) for my_tasks/management/schedule.py.

Fixes the root cause of the duplicate "subscription Tariff Penalty" (and any
other daily job fired by this scheduler) ledger rows: the Uvicorn service
runs with --workers 3, and Django's AppConfig.ready() (my_tasks/apps.py)
runs once per worker PROCESS. Each of the 3 independent worker processes
was starting its own independent APScheduler BackgroundScheduler instance,
all three scheduling the exact same job for 00:05:00 daily. Every night, all
3 in-process schedulers fired the job at the same instant and raced past
the ledger's "does this row already exist" check before any of the three
inserts had committed -- producing exactly 3 duplicate rows per affected
member, every single night (confirmed: 42 members affected on 2026-10-12
alone, all created within single-digit milliseconds of each other at
00:05:00).

scheduler.running only guards against a double-start WITHIN one process; it
does nothing across 3 separate OS processes, which is why that guard never
caught this.

Fix: a non-blocking flock() on a well-known lock file. Only the first
worker process to call start() can acquire the lock, so only that one
process's scheduler actually runs. Every other worker's start() call fails
to acquire the lock and returns immediately without starting a scheduler --
so the job now runs exactly once per host, regardless of --workers count.

Run from the Django project root:
    python3 patch_scheduler_singleton_lock.py
"""
import pathlib

TARGET = pathlib.Path("my_tasks/management/schedule.py")
BACKUP = pathlib.Path("my_tasks/management/schedule.py.bak_before_singleton_lock_patch")

OLD = '''from apscheduler.schedulers.background import BackgroundScheduler
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
    scheduler.start()'''

NEW = '''from apscheduler.schedulers.background import BackgroundScheduler
from django.core.mail import send_mail
import datetime
import fcntl
import logging
import os

scheduler = BackgroundScheduler()

# Owner fix (Oct 2026): temple-backend.service runs Uvicorn with
# --workers 3, and Django's AppConfig.ready() (my_tasks/apps.py) runs once
# PER WORKER PROCESS. Without this lock, each of the 3 independent worker
# processes started its own independent BackgroundScheduler, all 3
# scheduling the exact same job for 00:05:00 daily -- every night all 3
# in-process schedulers fired at the same instant and raced past the
# ledger's "does this row already exist" check before any insert had
# committed, producing exactly 3 duplicate rows per affected member (the
# scheduler.running guard below only stops a double-start WITHIN one
# process, so it never caught this). A non-blocking flock() on a
# well-known file ensures only the FIRST worker process to call start()
# actually runs the scheduler -- every other worker's start() call fails
# to acquire the lock and returns immediately, so the job now runs exactly
# once per host no matter how many workers are up.
_LOCK_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    ".my_tasks_scheduler.lock",
)
_lock_file = None


def _acquire_singleton_lock() -> bool:
    global _lock_file
    fh = open(_LOCK_PATH, "w")
    try:
        fcntl.flock(fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        fh.close()
        return False
    # Keep the handle open (and therefore the lock held) for the lifetime
    # of this process -- closing it would release the lock.
    _lock_file = fh
    return True


def subscription():
    from my_tasks.views import subscription_delete
    subscription_delete()

def start():
    if scheduler.running:
        return  # already started (guard against double-start in dev reload)

    if not _acquire_singleton_lock():
        logging.getLogger(__name__).info(
            "my_tasks scheduler lock already held by another worker "
            "process; skipping scheduler start here."
        )
        return

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
    scheduler.start()'''

text = TARGET.read_text()

if OLD not in text:
    raise SystemExit(
        "ABORTING -- could not find the expected current schedule.py "
        "content. It may differ from what this patch expects. No changes "
        "written."
    )

BACKUP.write_text(text)
text = text.replace(OLD, NEW, 1)
TARGET.write_text(text)

print(f"Patched {TARGET} (backup saved to {BACKUP}).")
print("Only one worker process will now run the daily scheduler job.")
