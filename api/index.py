import sys
import os

# Add backend directory to the python path so imports work correctly
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.append(backend_path)

# Import the FastAPI app from backend/main.py
from main import app  # noqa: E402, F401 # pylint: disable=import-error,wrong-import-position,unused-import
