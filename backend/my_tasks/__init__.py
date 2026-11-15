# The daily scheduler is started from MyTasksConfig.ready() (apps.py) only.
# It used to also be started here at import time, which made EVERY
# `manage.py` command (migrate, shell, cron jobs...) start the scheduler.
