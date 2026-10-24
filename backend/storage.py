import io
import os
import logging
import threading

import requests
from PIL import Image

logger = logging.getLogger("hotk.storage")

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "hotk"
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_TYPES = {"image/png", "image/jpeg", "image/webp"}

storage_key = None
_rembg_session = None
_rembg_lock = threading.Lock()


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type},
                            data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        raise FileNotFoundError(path)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def rembg_session():
    """Lazily build (and cache) the background-removal model session."""
    global _rembg_session
    with _rembg_lock:
        if _rembg_session is None:
            from rembg import new_session
            _rembg_session = new_session("isnet-general-use")
        return _rembg_session


def warm_rembg():
    try:
        rembg_session()
        logger.info("rembg model ready")
    except Exception as e:  # noqa: BLE001
        logger.error("rembg warm-up failed: %s", e)


def to_png(data: bytes) -> bytes:
    """Normalise an uploaded image to PNG (keeps existing transparency)."""
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    im.thumbnail((1600, 1600))
    buf = io.BytesIO()
    im.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def cut_out_bottle(data: bytes) -> bytes:
    """Remove the background from an uploaded bottle photo and return a trimmed transparent PNG."""
    from rembg import remove
    im = Image.open(io.BytesIO(data)).convert("RGB")
    im.thumbnail((1600, 1600))
    out = remove(im, session=rembg_session(), alpha_matting=True, alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=20, alpha_matting_erode_size=8)
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    buf = io.BytesIO()
    out.save(buf, format="PNG", optimize=True)
    return buf.getvalue()
