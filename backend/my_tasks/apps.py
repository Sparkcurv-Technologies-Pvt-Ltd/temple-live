from django.apps import AppConfig


class MyTasksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'my_tasks'

    def ready(self):
        # Start the background scheduler only in the main process,
        # not in the reloader child process (RUN_MAIN env is set by
        # Django's autoreloader only in the child, so we skip the parent).
        import os
        if os.environ.get('RUN_MAIN') == 'true' or not os.environ.get('RUN_MAIN'):
            try:
                from my_tasks.management.schedule import start
                start()
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(
                    "APScheduler failed to start: %s", e
                )
