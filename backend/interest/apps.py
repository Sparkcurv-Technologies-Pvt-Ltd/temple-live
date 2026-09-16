from django.apps import AppConfig


class InterestConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'interest'

    def ready(self):
        # Register the installment_date auto-sync signal so every write
        # path that touches paid_counts (collection add/edit/delete)
        # keeps the pointer in step without needing per-site edits.
        # Owner rule (Feb 2026).
        from . import signals  # noqa: F401
