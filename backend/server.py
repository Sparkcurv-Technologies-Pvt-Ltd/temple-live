"""
ASGI entry point compatible with the supervisor command:
  uvicorn server:app --host 0.0.0.0 --port 8001
Wraps the Django ASGI application.
"""
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Ensure logs directory exists (settings LOGGING points here)
(BASE_DIR / "logs").mkdir(exist_ok=True)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "temple_proj.settings.settings")

from django.core.asgi import get_asgi_application  # noqa: E402

app = get_asgi_application()
