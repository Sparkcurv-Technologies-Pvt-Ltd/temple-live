from django.apps import AppConfig


class MyTasksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'my_tasks'

    def ready(self):
        # Start the background scheduler only in the main process,
        # not in the reloader child process (RUN_MAIN env is set by
        # Django's autoreloader only in the child, so we skip the parent).
        import os
        import sys

        # Never start the scheduler for one-off management commands
        # (migrate, shell, apply_periodic_interest_penalty cron job, ...)
        # -- only for the web server (uvicorn/gunicorn) or `runserver`.
        # DISABLE_SCHEDULER=1 also turns it off (tests, scripts).
        prog = os.path.basename(sys.argv[0]) if sys.argv else ''
        is_mgmt_cmd = prog in ('manage.py', 'django-admin') and (
            len(sys.argv) < 2 or sys.argv[1] != 'runserver'
        )
        if is_mgmt_cmd or os.environ.get('DISABLE_SCHEDULER') == '1':
            return

        if os.environ.get('RUN_MAIN') == 'true' or not os.environ.get('RUN_MAIN'):
            try:
                from my_tasks.management.schedule import start
                start()
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(
                    "APScheduler failed to start: %s", e
                )
