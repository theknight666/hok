import sys
import traceback
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

try:
    from server import app
except Exception as e:
    from fastapi import FastAPI
    err_msg = traceback.format_exc()
    app = FastAPI()

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
    async def catch_all(path: str):
        return {"error": "Server failed to load", "details": str(e), "traceback": err_msg}
