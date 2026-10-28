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

_mongo_client: Optional[MongoClient] = None
_client_lock = threading.Lock()

_rembg_session = None
_rembg_lock = threading.Lock()


def get_db():
    global _mongo_client
    if _mongo_client is None:
        with _client_lock:
            if _mongo_client is None:
                mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
                kwargs = {}
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


def get_object(path: str) -> Tuple[bytes, str]:
    """Retrieve raw image binary and content-type from MongoDB 'media' collection."""
    clean_path = path.lstrip("/")
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

    # Local disk fallback (e.g. if run during development or static builds)
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
            # Auto-populate MongoDB with this local file
            try:
                put_object(clean_path, data, ct)
            except Exception as e:
                logger.debug("Failed auto-caching local file to MongoDB: %s", e)
            return data, ct

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



def rembg_session():
    """Lazily build (and cache) the background-removal model session if rembg is available."""
    global _rembg_session
    with _rembg_lock:
        if _rembg_session is None:
            try:
                from rembg import new_session
                _rembg_session = new_session("isnet-general-use")
            except Exception as e:
                logger.info("rembg package not available; using Pillow background isolation: %s", e)
                _rembg_session = False
        return _rembg_session


def warm_rembg():
    try:
        rembg_session()
    except Exception as e:
        logger.debug("rembg warm-up skipped: %s", e)


def to_png(data: bytes) -> bytes:
    """Normalise an uploaded image to PNG (keeps existing transparency)."""
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    im.thumbnail((1600, 1600))
    buf = io.BytesIO()
    im.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def cut_out_bottle(data: bytes) -> bytes:
    """Remove the background from an uploaded bottle photo and return a trimmed transparent PNG.
    Uses rembg when available, and falls back to smart Pillow boundary floodfill/feathering without failing.
    """
    try:
        # 1. Try rembg if available in environment
        try:
            sess = rembg_session()
            if sess:
                from rembg import remove
                im = Image.open(io.BytesIO(data)).convert("RGB")
                im.thumbnail((1600, 1600))
                out = remove(
                    im,
                    session=sess,
                    alpha_matting=True,
                    alpha_matting_foreground_threshold=240,
                    alpha_matting_background_threshold=20,
                    alpha_matting_erode_size=8,
                )
                bbox = out.getbbox()
                if bbox:
                    out = out.crop(bbox)
                buf = io.BytesIO()
                out.save(buf, format="PNG", optimize=True)
                return buf.getvalue()
        except Exception as e:
            logger.info("rembg isolation not available, using Pillow: %s", e)

        # 2. Smart Pillow background isolation:
        # Perfume bottle photos have solid/studio backgrounds (white, light gray, black, or studio backdrops).
        # We sample outer edges, flood fill background pixels with tolerance, feather alpha with blur, and crop.
        im = Image.open(io.BytesIO(data)).convert("RGBA")
        im.thumbnail((1600, 1600))
        w, h = im.size
        pixels = im.load()

        # Sample border points
        sample_pts = [
            (0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
            (w // 2, 0), (0, h // 2), (w - 1, h // 2), (w // 2, h - 1),
            (1, 1), (w - 2, 1), (1, h - 2), (w - 2, h - 2)
        ]
        sample_colors = [pixels[x, y][:3] for x, y in sample_pts if 0 <= x < w and 0 <= y < h]
        avg_r = sum(c[0] for c in sample_colors) / len(sample_colors)
        avg_g = sum(c[1] for c in sample_colors) / len(sample_colors)
        avg_b = sum(c[2] for c in sample_colors) / len(sample_colors)

        is_light = (avg_r + avg_g + avg_b) / 3 > 200
        tol_sq = (50 * 50) if is_light else (42 * 42)

        import collections
        visited = set()
        queue = collections.deque()

        # Seed border pixels
        for x in range(w):
            queue.append((x, 0))
            queue.append((x, h - 1))
            visited.add((x, 0))
            visited.add((x, h - 1))
        for y in range(h):
            queue.append((0, y))
            queue.append((w - 1, y))
            visited.add((0, y))
            visited.add((w - 1, y))

        bg_set = set(visited)
        while queue:
            cx, cy = queue.popleft()
            for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    nr, ng, nb = pixels[nx, ny][:3]
                    dist_sq = (nr - avg_r) ** 2 + (ng - avg_g) ** 2 + (nb - avg_b) ** 2
                    is_bg = dist_sq < tol_sq or (is_light and nr > 225 and ng > 225 and nb > 225)
                    if is_bg:
                        bg_set.add((nx, ny))
                        queue.append((nx, ny))

        # Alpha mask
        from PIL import ImageFilter
        mask = Image.new("L", (w, h), 255)
        m_pix = mask.load()
        for x, y in bg_set:
            m_pix[x, y] = 0

        # Gentle Gaussian blur for smooth anti-aliased edge
        mask = mask.filter(ImageFilter.GaussianBlur(radius=1.2))
        im.putalpha(mask)

        bbox = im.getbbox()
        if bbox:
            im = im.crop(bbox)

        buf = io.BytesIO()
        im.save(buf, format="PNG", optimize=True)
        return buf.getvalue()

    except Exception as exc:
        logger.warning("cut_out_bottle fallback to to_png: %s", exc)
        return to_png(data)
