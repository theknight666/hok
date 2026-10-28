import io
import os
import logging
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Tuple

from PIL import Image
from pymongo import MongoClient, ASCENDING

logger = logging.getLogger("hotk.storage")

APP_NAME = "hotk"
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_TYPES = {"image/png", "image/jpeg", "image/webp", "image/jpg"}

DEFAULT_MONGO_URL = "mongodb+srv://hok_admin:rXB28z2mfFma7IGB@hok.iy4ehsq.mongodb.net/?retryWrites=true&w=1"
_mongo_client: Optional[MongoClient] = None
_client_lock = threading.Lock()

_rembg_session = None
_rembg_lock = threading.Lock()


def get_db():
    global _mongo_client
    if _mongo_client is None:
        with _client_lock:
            if _mongo_client is None:
                raw_url = os.environ.get("MONGO_URL", "").strip()
                mongo_url = raw_url if raw_url and "localhost" not in raw_url else DEFAULT_MONGO_URL
                kwargs = {
                    "serverSelectionTimeoutMS": 5000,
                    "connectTimeoutMS": 5000,
                    "socketTimeoutMS": 5000,
                }
                try:
                    import certifi
                    if "mongodb+srv://" in mongo_url:
                        kwargs["tlsCAFile"] = certifi.where()
                except ImportError:
                    pass
                _mongo_client = MongoClient(mongo_url, **kwargs)
    db_name = os.environ.get("DB_NAME", "house_of_the_knight")
    return _mongo_client[db_name]


def init_storage(force: bool = False):
    """Ensure media collection exists and has index on path."""
    try:
        db = get_db()
        db.media.create_index("path", unique=True)
        return True
    except Exception as e:
        logger.warning("Could not initialize storage index: %s", e)
        return False


def put_object(path: str, data: bytes, content_type: str = "image/png") -> dict:
    """Store raw image binary in MongoDB collection 'media'."""
    clean_path = path.lstrip("/")
    db = get_db()
    now_utc = datetime.now(timezone.utc)
    db.media.update_one(
        {"path": clean_path},
        {
            "$set": {
                "path": clean_path,
                "data": data,
                "content_type": content_type,
                "size": len(data),
                "updated_at": now_utc,
            },
            "$setOnInsert": {
                "created_at": now_utc,
            },
        },
        upsert=True,
    )
    return {"path": clean_path, "size": len(data), "content_type": content_type}


def get_disk_object(path: str) -> Tuple[bytes, str]:
    """Retrieve raw image binary and content-type from local disk without database overhead."""
    clean_path = path.lstrip("/")
    backend_dir = Path(__file__).resolve().parent
    root = backend_dir.parent
    candidates = [
        backend_dir / "static_images" / clean_path,
        backend_dir / "static_images" / clean_path.replace("images/", ""),
        root / "frontend" / "public" / clean_path,
        root / "frontend" / "public" / "images" / clean_path,
        root / "frontend" / "public" / "images" / clean_path.replace("images/", ""),
        backend_dir / clean_path,
    ]
    for cand in candidates:
        if cand.is_file():
            data = cand.read_bytes()
            suffix = cand.suffix.lower()
            ct = "image/png" if suffix == ".png" else "image/jpeg" if suffix in [".jpg", ".jpeg"] else "image/webp"
            return data, ct

    raise FileNotFoundError(clean_path)


def get_object(path: str) -> Tuple[bytes, str]:
    """Retrieve raw image binary, checking local disk first for sub-millisecond response."""
    try:
        return get_disk_object(path)
    except FileNotFoundError:
        pass

    clean_path = path.lstrip("/")
    try:
        db = get_db()
        doc = db.media.find_one({
            "$or": [
                {"path": clean_path},
                {"path": "/" + clean_path},
                {"path": "images/" + clean_path},
                {"path": clean_path.replace("images/", "")},
            ]
        })
        if doc and "data" in doc:
            return doc["data"], doc.get("content_type", "image/png")
    except Exception as e:
        logger.warning("MongoDB get_object failed for %s: %s", clean_path, e)

    raise FileNotFoundError(clean_path)


def seed_existing_images() -> int:
    """Scan static images and sync all existing images to MongoDB media collection."""
    count = 0
    try:
        init_storage()
        backend_dir = Path(__file__).resolve().parent
        root = backend_dir.parent
        dirs_to_check = [
            backend_dir / "static_images",
            root / "frontend" / "public" / "images",
        ]
        img_dir = next((d for d in dirs_to_check if d.is_dir()), None)
        if not img_dir:
            return 0

        for file_path in img_dir.rglob("*"):
            if not file_path.is_file():
                continue
            suffix = file_path.suffix.lower()
            if suffix not in [".jpg", ".jpeg", ".png", ".webp"]:
                continue
            rel = file_path.relative_to(img_dir).as_posix()
            data = file_path.read_bytes()
            ct = "image/png" if suffix == ".png" else "image/jpeg" if suffix in [".jpg", ".jpeg"] else "image/webp"

            # Store under images/{rel}
            put_object(f"images/{rel}", data, ct)
            # Also store under {rel} for direct lookup
            if rel != f"images/{rel}":
                put_object(rel, data, ct)
            count += 1
        logger.info("Successfully synced %d existing images to MongoDB media collection", count)
    except Exception as e:
        logger.error("Error syncing existing images to MongoDB: %s", e)
    return count



def to_png(data: bytes) -> bytes:
    """Normalise an uploaded image to PNG (keeps existing transparency and scales cleanly)."""
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    im.thumbnail((1600, 1600))
    buf = io.BytesIO()
    im.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


# Alias cut_out_bottle to standard clean image processing
cut_out_bottle = to_png

