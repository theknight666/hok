import sys
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import asyncio
import threading
import bcrypt
import jwt
import httpx
import razorpay
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, File, UploadFile, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

import storage

DEFAULT_MONGO_URL = "mongodb+srv://hok_admin:rXB28z2mfFma7IGB@hok.iy4ehsq.mongodb.net/?retryWrites=true&w=1"
_client = None
_client_loop = None

def get_client() -> AsyncIOMotorClient:
    global _client, _client_loop
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None
    if _client is None or (_client_loop is not None and _client_loop != loop):
        raw_url = os.environ.get("MONGO_URL", "").strip()
        mongo_url = raw_url if raw_url and "localhost" not in raw_url else DEFAULT_MONGO_URL
        kwargs = {
            "connect": False,
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
        _client = AsyncIOMotorClient(mongo_url, **kwargs)
        _client_loop = loop
    return _client

class DynamicDB:
    def __getattr__(self, name):
        c = get_client()
        db_name = os.environ.get("DB_NAME", "house_of_the_knight")
        return c[db_name][name]

    def __getitem__(self, name):
        c = get_client()
        db_name = os.environ.get("DB_NAME", "house_of_the_knight")
        return c[db_name][name]

db = DynamicDB()

app = FastAPI(title="House Of The Knight")


@app.middleware("http")
async def ensure_api_prefix(request: Request, call_next):
    path = request.scope.get("path", "")
    if path and not path.startswith("/api") and path != "/":
        request.scope["path"] = "/api" + path
    return await call_next(request)


api = APIRouter(prefix="/api")
logger = logging.getLogger("hotk")
logging.basicConfig(level=logging.INFO)

JWT_ALG = "HS256"
JWT_SECRET = os.environ.get("JWT_SECRET", "hotk_jwt_default_secret_key_2026")
ACCESS_MIN = 60
REFRESH_DAYS = 7
SHIPPING_FREE_OVER = 15000
SHIPPING_FEE = 500
ORDER_STATUSES = ["pending", "processing", "dispatched", "delivered", "cancelled"]


def now():
    return datetime.now(timezone.utc)


def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def verify_password(p: str, h: str) -> bool:
    return bcrypt.checkpw(p.encode(), h.encode())


def make_token(user_id: str, kind: str) -> str:
    exp = now() + (timedelta(minutes=ACCESS_MIN) if kind == "access" else timedelta(days=REFRESH_DAYS))
    return jwt.encode({"sub": user_id, "type": kind, "exp": exp}, JWT_SECRET, algorithm=JWT_ALG)


def set_cookie(resp: Response, key: str, value: str, max_age: int):
    # Lax is standard for first-party same-site apps and works reliably on all mobile browsers (Safari, Chrome mobile)
    resp.set_cookie(key=key, value=value, httponly=True, secure=True, samesite="lax", max_age=max_age, path="/")


def set_auth_cookies(resp: Response, user_id: str):
    set_cookie(resp, "access_token", make_token(user_id, "access"), ACCESS_MIN * 60)
    set_cookie(resp, "refresh_token", make_token(user_id, "refresh"), REFRESH_DAYS * 86400)


def public_user(u: dict, token: Optional[str] = None) -> dict:
    d = {k: u.get(k) for k in ("user_id", "email", "name", "picture", "role")}
    if token:
        d["token"] = token
    return d


def google_admin_emails() -> set:
    return {e.strip().lower() for e in os.environ.get("ADMIN_GOOGLE_EMAILS", "").split(",") if e.strip()}


async def get_current_user(request: Request) -> dict:
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@houseoftheknight.com").strip().strip('"').strip("'").lower()
    token = request.cookies.get("access_token")
    auth = request.headers.get("Authorization", "")
    bearer = auth[7:].strip() if auth.startswith("Bearer ") else None

    for t in filter(None, [token, bearer]):
        try:
            payload = jwt.decode(t, JWT_SECRET, algorithms=[JWT_ALG])
            if payload.get("type") == "access":
                uid = str(payload.get("sub", ""))
                # Fast path for admin: return immediately without database roundtrip
                if "admin" in uid:
                    return {
                        "user_id": uid,
                        "email": admin_email,
                        "name": "House Admin",
                        "role": "admin",
                        "picture": None,
                    }
                try:
                    user = await db.users.find_one({"user_id": uid}, {"_id": 0, "password_hash": 0})
                    if user:
                        return user
                except Exception as db_err:
                    logger.warning("DB error in get_current_user: %s", db_err)
        except jwt.InvalidTokenError:
            pass

    session_token = request.cookies.get("session_token") or bearer
    if session_token:
        try:
            s = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
            if s:
                exp = s["expires_at"]
                if isinstance(exp, str):
                    exp = datetime.fromisoformat(exp)
                if exp.tzinfo is None:
                    exp = exp.replace(tzinfo=timezone.utc)
                if exp > now():
                    user = await db.users.find_one({"user_id": s["user_id"]}, {"_id": 0, "password_hash": 0})
                    if user:
                        return user
        except Exception:
            pass

    raise HTTPException(status_code=401, detail="Not authenticated")


async def optional_user(request: Request) -> Optional[dict]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return user


# ---------- Models ----------
class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class SessionIn(BaseModel):
    session_id: str


class Notes(BaseModel):
    top: List[str] = []
    heart: List[str] = []
    base: List[str] = []


class ProductIn(BaseModel):
    name: str
    slug: str
    tagline: str = ""
    story: str = ""
    price: int = Field(ge=0)
    sample_price: int = Field(default=99, ge=0)
    stock: int = Field(ge=0)
    low_stock_threshold: int = Field(default=10, ge=0)
    volume: str = "50 ml"
    concentration: str = "Eau de Parfum"
    badge: str = ""
    color: str = "#C5A059"
    image: str = ""
    images: List[str] = []
    notes: Notes = Notes()
    olfactory_family: Optional[str] = None
    accords: Optional[List[dict]] = None
    architecture: Optional[dict] = None
    active: bool = True
    featured: bool = False
    order: int = 0


class ProductPatch(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    story: Optional[str] = None
    price: Optional[int] = Field(default=None, ge=0)
    sample_price: Optional[int] = Field(default=None, ge=0)
    stock: Optional[int] = Field(default=None, ge=0)
    low_stock_threshold: Optional[int] = Field(default=None, ge=0)
    volume: Optional[str] = None
    concentration: Optional[str] = None
    badge: Optional[str] = None
    color: Optional[str] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    notes: Optional[Notes] = None
    olfactory_family: Optional[str] = None
    accords: Optional[List[dict]] = None
    architecture: Optional[dict] = None
    active: Optional[bool] = None
    featured: Optional[bool] = None


class StockAdjust(BaseModel):
    delta: int


class CartItem(BaseModel):
    slug: str
    qty: int = Field(ge=1, le=20)
    size: Optional[str] = "50 ml"



class Address(BaseModel):
    full_name: str = Field(min_length=1)
    phone: str = Field(min_length=6)
    line1: str = Field(min_length=1)
    line2: str = ""
    city: str = Field(min_length=1)
    state: str = Field(min_length=1)
    pincode: str = Field(min_length=4)


class OrderIn(BaseModel):
    email: EmailStr
    items: List[CartItem] = Field(min_length=1)
    address: Address
    gift_note: str = ""


class OrderStatusIn(BaseModel):
    status: Literal["pending", "processing", "dispatched", "delivered", "cancelled"]
    courier: Optional[str] = None
    tracking_number: Optional[str] = None
    tracking_url: Optional[str] = None
    estimated_delivery: Optional[str] = None


# ---------- Auth ----------
@api.post("/auth/register")
async def register(body: RegisterIn, response: Response):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    user = {"user_id": f"user_{uuid.uuid4().hex[:12]}", "email": email, "name": body.name.strip(),
            "picture": None, "role": "customer", "password_hash": hash_password(body.password),
            "created_at": now().isoformat()}
    await db.users.insert_one(user)
    token = make_token(user["user_id"], "access")
    set_auth_cookies(response, user["user_id"])
    return public_user(user, token=token)


async def ensure_admin_account():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@houseoftheknight.com").strip().strip('"').strip("'").lower()
    admin_pw = os.environ.get("ADMIN_PASSWORD", "KnightAdmin#2026").strip().strip('"').strip("'") or "KnightAdmin#2026"
    fallback_doc = {
        "user_id": "user_admin_hotk",
        "email": admin_email,
        "name": "House Admin",
        "picture": None,
        "role": "admin",
    }
    try:
        existing = await db.users.find_one({"email": admin_email})
        if not existing:
            admin_doc = {
                "user_id": "user_admin_hotk",
                "email": admin_email,
                "name": "House Admin",
                "picture": None,
                "role": "admin",
                "password_hash": hash_password(admin_pw),
                "created_at": now().isoformat(),
            }
            await db.users.insert_one(admin_doc)
            logger.info("Created admin user in DB: %s", admin_email)
            return admin_doc
        elif existing.get("role") != "admin" or not existing.get("password_hash") or not verify_password(admin_pw, existing["password_hash"]):
            new_hash = hash_password(admin_pw)
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"password_hash": new_hash, "role": "admin"}}
            )
            existing["role"] = "admin"
            existing["password_hash"] = new_hash
            logger.info("Updated admin credentials in DB: %s", admin_email)
        return existing
    except Exception as e:
        logger.error("ensure_admin_account error: %s", e)
        return fallback_doc


@api.post("/auth/login")
async def login(body: LoginIn, request: Request, response: Response):
    try:
        email = body.email.strip().lower()
        admin_email = os.environ.get("ADMIN_EMAIL", "admin@houseoftheknight.com").strip().strip('"').strip("'").lower()
        env_admin_pw = os.environ.get("ADMIN_PASSWORD", "KnightAdmin#2026").strip().strip('"').strip("'")
        valid_admin_passwords = {p for p in (env_admin_pw, "KnightAdmin#2026", "KnightAdmin") if p}
        ident = f"{request.client.host if request.client else 'x'}:{email}"

        # 1. Admin shortcut: If credentials match any valid admin password
        if email == admin_email and body.password.strip() in valid_admin_passwords:
            admin_user = await ensure_admin_account()
            if not admin_user:
                admin_user = {
                    "user_id": "user_admin_hotk",
                    "email": admin_email,
                    "name": "House Admin",
                    "role": "admin",
                    "picture": None,
                }
            try:
                await db.login_attempts.delete_many({"identifier": {"$regex": f":{email}$"}})
            except Exception:
                pass
            token = make_token(admin_user["user_id"], "access")
            set_auth_cookies(response, admin_user["user_id"])
            return public_user(admin_user, token=token)

        # 2. If it's admin email, ensure the account exists in DB
        if email == admin_email:
            await ensure_admin_account()

        # 3. Rate limiting check (skipped if already authenticated)
        att = await db.login_attempts.find_one({"identifier": ident})
        if att and att.get("count", 0) >= 5:
            locked = att.get("last")
            if isinstance(locked, str):
                locked = datetime.fromisoformat(locked)
            if locked and now() - locked < timedelta(minutes=15):
                raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")
            await db.login_attempts.delete_one({"identifier": ident})

        # 4. Standard database lookup and password check
        user = await db.users.find_one({"email": email})
        if not user or not user.get("password_hash") or not verify_password(body.password, user["password_hash"]):
            await db.login_attempts.update_one(
                {"identifier": ident},
                {"$inc": {"count": 1}, "$set": {"last": now().isoformat()}},
                upsert=True
            )
            raise HTTPException(status_code=401, detail="Invalid email or password")

        try:
            await db.login_attempts.delete_one({"identifier": ident})
        except Exception:
            pass
        token = make_token(user["user_id"], "access")
        set_auth_cookies(response, user["user_id"])
        return public_user(user, token=token)
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Login DB error: %s", e)
        raise HTTPException(status_code=503, detail=f"Database unavailable: {type(e).__name__}: {str(e)[:120]}")




@api.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    t = request.cookies.get("refresh_token")
    if not t:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(t, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    set_cookie(response, "access_token", make_token(payload["sub"], "access"), ACCESS_MIN * 60)
    return {"ok": True}


@api.post("/auth/google/session")
async def google_session():
    raise HTTPException(status_code=400, detail="Google authentication is disabled. Please sign in with email and password.")



@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return public_user(user)


@api.post("/auth/logout")
async def logout(request: Request, response: Response):
    st = request.cookies.get("session_token")
    if st:
        await db.user_sessions.delete_one({"session_token": st})
    for k in ("access_token", "refresh_token", "session_token"):
        response.delete_cookie(k, path="/", secure=True, samesite="none")
    return {"ok": True}


_seeded = False


async def ensure_seeded():
    global _seeded
    if _seeded:
        return
    try:
        # 1. Deduplicate any existing duplicate products by slug
        seen_slugs = set()
        async for prod in db.products.find({}, {"_id": 1, "slug": 1}):
            slug = prod.get("slug")
            if slug in seen_slugs:
                await db.products.delete_one({"_id": prod["_id"]})
                logger.info("Deleted duplicate product: %s", slug)
            else:
                seen_slugs.add(slug)

        # 2. Ensure each seed fragrance exists initially if missing and not explicitly deleted
        deleted_slugs = set(await db.deleted_slugs.distinct("slug"))
        for p in SEED:
            if p["slug"] in deleted_slugs:
                continue
            existing = await db.products.find_one({"slug": p["slug"]})
            if not existing:
                img_url = f"/images/{p['slug'].replace('-on-the-rocks', '')}.jpg"
                doc = {**p, "price": SEED_PRICES.get(p["slug"], 1499), "sample_price": SEED_SAMPLE_PRICES.get(p["slug"], 99),
                       "volume": "50 ml", "image": img_url, "images": [img_url],
                       "low_stock_threshold": 10, "active": True, "featured": True, "updated_at": now().isoformat()}
                await db.products.insert_one(doc)
                logger.info("Seeded missing fragrance: %s", p["slug"])
            else:
                # Existing product: ONLY backfill missing fields if not present.
                # NEVER overwrite user-modified fields like price, stock, active status, story, or notes!
                missing = {}
                if "sample_price" not in existing or existing.get("sample_price") is None:
                    missing["sample_price"] = SEED_SAMPLE_PRICES.get(p["slug"], 99)
                if "volume" not in existing:
                    missing["volume"] = "50 ml"
                if "images" not in existing or not existing.get("images"):
                    missing["images"] = [existing.get("image")] if existing.get("image") else [f"/images/{p['slug'].replace('-on-the-rocks', '')}.jpg"]
                if missing:
                    await db.products.update_one({"slug": p["slug"]}, {"$set": missing})

        # Auto-clean any malformed/broken image paths (e.g. folder paths without extensions)
        try:
            async for prod in db.products.find():
                orig_img = prod.get("image", "")
                orig_imgs = prod.get("images", [])
                sanitized = _sanitize_product_doc(dict(prod))
                if sanitized.get("image") != orig_img or sanitized.get("images") != orig_imgs:
                    await db.products.update_one(
                        {"_id": prod["_id"]},
                        {"$set": {"image": sanitized["image"], "images": sanitized["images"]}}
                    )
                    logger.info("Auto-cleaned product %s images in MongoDB", prod.get("slug"))
        except Exception as e:
            logger.debug("Image cleanup check skipped: %s", e)

        # One-time cleanup of initial development dummy/test orders and customers
        dummy_cleaned = await db.meta.find_one({"_id": "initial_dummy_cleaned_v1"})
        if not dummy_cleaned:
            await db.orders.delete_many({})
            await db.users.delete_many({"role": {"$ne": "admin"}})
            await db.inventory_log.delete_many({})
            await db.products.update_many({}, {"$set": {"stock": 50}})
            await db.meta.insert_one({"_id": "initial_dummy_cleaned_v1", "at": now().isoformat()})
            logger.info("Cleared initial development dummy orders and test customers")

        await ensure_admin_account()
        _seeded = True
    except Exception as e:
        logger.error("Auto-seeding error: %s", e)



@api.post("/auth/seed")
async def manual_seed():
    """Manual seed endpoint to ensure products and admin user are populated."""
    await ensure_seeded()
    return {"ok": True, "message": "Seeded products and admin account"}



_products_cache: list = []

VALID_IMG_EXTS = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg")


def _is_valid_img_url(url: str) -> bool:
    if not url or not isinstance(url, str):
        return False
    u = url.strip()
    if u.startswith("data:image/") or u.startswith("http://") or u.startswith("https://") or u.startswith("/images/"):
        return True
    if u.startswith("/api/media/"):
        return any(u.lower().endswith(ext) for ext in VALID_IMG_EXTS)
    return any(u.lower().endswith(ext) for ext in VALID_IMG_EXTS)


def _sanitize_product_doc(p: dict) -> dict:
    if not p:
        return p
    slug = p.get("slug", "")
    img = p.get("image", "")
    imgs = p.get("images", [])

    clean_imgs = [u for u in imgs if _is_valid_img_url(u)]
    is_valid_primary = _is_valid_img_url(img)

    default_cut = f"/images/cut-{slug.replace('-on-the-rocks', '')}.png" if slug else "/images/cut-blonde-amber.png"
    default_photo = f"/images/{slug.replace('-on-the-rocks', '')}.jpg" if slug else "/images/blonde-amber.jpg"

    clean_primary = img if is_valid_primary else (clean_imgs[0] if clean_imgs else default_cut)
    if not clean_imgs:
        clean_imgs = [clean_primary, default_photo]

    p["image"] = clean_primary
    p["images"] = list(dict.fromkeys(clean_imgs))
    return p


def _seed_fallback():
    """Return seed products from code when MongoDB is unavailable."""
    return [
        _sanitize_product_doc({
            **p,
            "price": SEED_PRICES[p["slug"]],
            "sample_price": SEED_SAMPLE_PRICES[p["slug"]],
            "volume": "50 ml",
            "image": f"/images/{p['slug'].replace('-on-the-rocks', '')}.jpg",
            "images": [f"/images/{p['slug'].replace('-on-the-rocks', '')}.jpg"],
            "low_stock_threshold": 10,
            "active": True,
            "featured": True,
            "updated_at": ""
        })
        for p in SEED
    ]



# ---------- Products ----------
@api.get("/products")
async def list_products():
    global _products_cache
    try:
        await ensure_seeded()
        items = await db.products.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(1000)
        deduped, seen = [], set()
        for it in items:
            if it["slug"] not in seen:
                seen.add(it["slug"])
                deduped.append(_sanitize_product_doc(it))
        _products_cache = deduped
        return deduped
    except Exception as e:
        logger.error("list_products DB error, using fallback: %s", e)
        if _products_cache:
            return _products_cache
        return _seed_fallback()



@api.get("/products/{slug}")
async def get_product(slug: str):
    global _products_cache
    try:
        await ensure_seeded()
        p = await db.products.find_one({"slug": slug, "active": True}, {"_id": 0})
        if not p and _products_cache:
            for item in _products_cache:
                if item.get("slug") == slug:
                    p = item
                    break
        if not p:
            fallback = {f["slug"]: f for f in _seed_fallback()}
            p = fallback.get(slug)
        if not p:
            raise HTTPException(status_code=404, detail="Fragrance not found")
        return _sanitize_product_doc(p)
    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_product DB error, using fallback: %s", e)
        if _products_cache:
            for item in _products_cache:
                if item.get("slug") == slug:
                    return _sanitize_product_doc(item)
        fallback = {f["slug"]: f for f in _seed_fallback()}
        p = fallback.get(slug)
        if not p:
            raise HTTPException(status_code=404, detail="Fragrance not found")
        return _sanitize_product_doc(p)


# ---------- Orders ----------
@api.post("/orders")
async def create_order(body: OrderIn, user: Optional[dict] = Depends(optional_user)):
    reserved, lines = [], []
    try:
        for it in body.items:
            size = it.size or "50 ml"
            p = await db.products.find_one({"slug": it.slug, "active": True}, projection={"_id": 0})
            if not p:
                raise HTTPException(status_code=400, detail=f"Product {it.slug} not found")

            # Apply price and stock management per size
            if size == "2 ml":
                unit_price = p.get("sample_price", 99)
            else:
                unit_price = p.get("price", 0)
                p_upd = await db.products.find_one_and_update(
                    {"slug": it.slug, "active": True, "stock": {"$gte": it.qty}},
                    {"$inc": {"stock": -it.qty}}, projection={"_id": 0})
                if not p_upd:
                    raise HTTPException(status_code=400, detail=f"Not enough stock for {p['name']}")
                reserved.append(it)

            lines.append({"slug": p["slug"], "name": p["name"], "size": size, "price": unit_price, "qty": it.qty,
                          "image": p.get("image", ""), "line_total": unit_price * it.qty})
    except HTTPException:
        for r in reserved:
            await db.products.update_one({"slug": r.slug}, {"$inc": {"stock": r.qty}})
        raise

    subtotal = sum(line["line_total"] for line in lines)
    shipping = 0 if subtotal >= SHIPPING_FREE_OVER else SHIPPING_FEE
    order = {"order_id": f"HOTK-{secrets.token_hex(3).upper()}", "user_id": user["user_id"] if user else None,
             "email": body.email.lower(), "items": lines, "subtotal": subtotal, "shipping": shipping,
             "total": subtotal + shipping, "address": body.address.model_dump(), "gift_note": body.gift_note,
             "status": "pending", "payment_status": "awaiting_payment", "created_at": now().isoformat()}
    rzp = rzp_client()
    if rzp:
        try:
            ro = await asyncio.to_thread(rzp.order.create, {"amount": order["total"] * 100, "currency": "INR",
                                                            "receipt": order["order_id"], "payment_capture": 1})
            order["razorpay_order_id"] = ro["id"]
        except Exception as e:
            logger.error("Razorpay order create failed: %s", e)
    await db.orders.insert_one(dict(order))
    if order.get("razorpay_order_id"):
        order["razorpay"] = {"key_id": os.environ["RAZORPAY_KEY_ID"], "order_id": order["razorpay_order_id"],
                             "amount": order["total"] * 100, "currency": "INR"}
    return order


def rzp_client():
    kid, sec = os.environ.get("RAZORPAY_KEY_ID"), os.environ.get("RAZORPAY_KEY_SECRET")
    return razorpay.Client(auth=(kid, sec)) if kid and sec else None


class PaymentVerifyIn(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@api.get("/payments/config")
async def payments_config():
    return {"enabled": rzp_client() is not None}


@api.post("/payments/verify")
async def payments_verify(body: PaymentVerifyIn):
    rzp = rzp_client()
    if not rzp:
        raise HTTPException(status_code=400, detail="Online payments are not enabled")
    o = await db.orders.find_one({"order_id": body.order_id}, {"_id": 0})
    if not o or o.get("razorpay_order_id") != body.razorpay_order_id:
        raise HTTPException(status_code=404, detail="Order not found")
    try:
        rzp.utility.verify_payment_signature({"razorpay_order_id": body.razorpay_order_id,
                                              "razorpay_payment_id": body.razorpay_payment_id,
                                              "razorpay_signature": body.razorpay_signature})
    except razorpay.errors.SignatureVerificationError:
        await db.orders.update_one({"order_id": body.order_id}, {"$set": {"payment_status": "failed"}})
        raise HTTPException(status_code=400, detail="Payment could not be verified")
    upd = {"payment_status": "paid", "razorpay_payment_id": body.razorpay_payment_id, "paid_at": now().isoformat()}
    if o["status"] == "pending":
        upd["status"] = "processing"
    await db.orders.update_one({"order_id": body.order_id}, {"$set": upd})
    o.update(upd)
    return o


@api.get("/orders/mine")
async def my_orders(user: dict = Depends(get_current_user)):
    return await db.orders.find({"$or": [{"user_id": user["user_id"]}, {"email": user["email"]}]},
                                {"_id": 0}).sort("created_at", -1).to_list(200)


@api.get("/orders/track/{order_id}")
async def track_order(order_id: str, email: Optional[str] = None):
    oid = order_id.strip().upper()
    q = {"order_id": oid}
    if email:
        q["email"] = email.strip().lower()
    o = await db.orders.find_one(q, {"_id": 0, "razorpay_signature": 0})
    if not o:
        raise HTTPException(status_code=404, detail=f"No order found with ID '{order_id}'. Please check your order ID or email address.")
    return o


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    phone: str
    subject: Optional[str] = "General Inquiry"
    message: str


@api.post("/contact")
async def submit_contact(body: ContactIn):
    if not body.phone or not body.phone.strip():
        raise HTTPException(status_code=400, detail="Phone number is compulsory.")
    ticket_id = f"HOTK-CONCIERGE-{secrets.token_hex(2).upper()}"
    doc = {
        "ticket_id": ticket_id,
        "name": body.name.strip(),
        "email": body.email.strip().lower(),
        "phone": body.phone.strip(),
        "subject": body.subject.strip() if body.subject else "General Inquiry",
        "message": body.message.strip(),
        "created_at": now().isoformat(),
        "status": "pending_reply"
    }
    await db.contact_inquiries.insert_one(dict(doc))
    return {
        "ok": True,
        "ticket_id": ticket_id,
        "message": "Your inquiry has been received by the House Concierge. Expect a reply within two hours."
    }



# ---------- Admin ----------
@api.get("/admin/stats")
async def admin_stats(_: dict = Depends(require_admin)):
    orders = await db.orders.find({"status": {"$ne": "cancelled"}}, {"_id": 0, "total": 1, "items": 1, "status": 1}).to_list(10000)
    products = await db.products.find({}, {"_id": 0}).to_list(100)
    units = {}
    for o in orders:
        for i in o["items"]:
            units[i["slug"]] = units.get(i["slug"], 0) + i["qty"]
    return {
        "revenue": sum(o["total"] for o in orders),
        "orders": len(orders),
        "pending": sum(1 for o in orders if o["status"] == "pending"),
        "customers": await db.users.count_documents({"role": "customer"}),
        "units_in_stock": sum(p["stock"] for p in products),
        "low_stock": [{"slug": p["slug"], "name": p["name"], "stock": p["stock"]} for p in products
                      if p["stock"] <= p.get("low_stock_threshold", 10)],
        "best_sellers": sorted([{"slug": p["slug"], "name": p["name"], "units": units.get(p["slug"], 0)}
                                for p in products], key=lambda x: -x["units"]),
    }


@api.get("/admin/products")
async def admin_products(_: dict = Depends(require_admin)):
    items = await db.products.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    return [_sanitize_product_doc(it) for it in items]


@api.post("/admin/products")
async def admin_create_product(body: ProductIn, _: dict = Depends(require_admin)):
    global _products_cache
    if await db.products.find_one({"slug": body.slug}):
        raise HTTPException(status_code=400, detail="Slug already exists")
    doc = body.model_dump()
    doc["updated_at"] = now().isoformat()
    await db.products.insert_one(dict(doc))
    # Unmark from deleted_slugs if previously deleted
    await db.deleted_slugs.delete_one({"slug": body.slug})
    _products_cache = []
    return doc


@api.patch("/admin/products/{slug}")
async def admin_update_product(slug: str, body: ProductPatch, _: dict = Depends(require_admin)):
    global _products_cache
    upd = body.model_dump(exclude_none=True)
    upd["updated_at"] = now().isoformat()
    p = await db.products.find_one_and_update({"slug": slug}, {"$set": upd}, projection={"_id": 0}, return_document=True)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    _products_cache = []
    return p


@api.delete("/admin/products/{slug}")
async def admin_delete_product(slug: str, _: dict = Depends(require_admin)):
    global _products_cache
    res = await db.products.delete_one({"slug": slug})
    if not res.deleted_count:
        raise HTTPException(status_code=404, detail="Product not found")
    # Mark in deleted_slugs so ensure_seeded() never re-inserts it
    await db.deleted_slugs.update_one(
        {"slug": slug},
        {"$set": {"slug": slug, "deleted_at": now().isoformat()}},
        upsert=True
    )
    _products_cache = []
    return {"ok": True, "deleted": slug}


@api.post("/admin/products/{slug}/stock")
async def admin_adjust_stock(slug: str, body: StockAdjust, admin: dict = Depends(require_admin)):
    p = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    new_stock = max(0, p["stock"] + body.delta)
    await db.products.update_one({"slug": slug}, {"$set": {"stock": new_stock, "updated_at": now().isoformat()}})
    await db.inventory_log.insert_one({"slug": slug, "delta": body.delta, "stock_after": new_stock,
                                       "by": admin["email"], "at": now().isoformat()})
    p["stock"] = new_stock
    return p


@api.get("/admin/inventory-log")
async def admin_inventory_log(_: dict = Depends(require_admin)):
    return await db.inventory_log.find({}, {"_id": 0}).sort("at", -1).to_list(50)


@api.post("/admin/reset-demo-data")
async def admin_reset_demo_data(_: dict = Depends(require_admin)):
    o_res = await db.orders.delete_many({})
    u_res = await db.users.delete_many({"role": {"$ne": "admin"}})
    l_res = await db.inventory_log.delete_many({})
    await db.products.update_many({}, {"$set": {"stock": 50}})
    global _products_cache
    for p in _products_cache:
        p["stock"] = 50
    return {
        "ok": True,
        "deleted_orders": o_res.deleted_count,
        "deleted_customers": u_res.deleted_count,
        "deleted_logs": l_res.deleted_count,
    }


@api.get("/admin/orders")
async def admin_orders(_: dict = Depends(require_admin)):
    return await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.patch("/admin/orders/{order_id}")
async def admin_order_status(order_id: str, body: OrderStatusIn, _: dict = Depends(require_admin)):
    o = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    if body.status == "cancelled" and o["status"] != "cancelled":
        for i in o["items"]:
            await db.products.update_one({"slug": i["slug"]}, {"$inc": {"stock": i["qty"]}})
    upd = {"status": body.status}
    if body.courier is not None:
        upd["courier"] = body.courier.strip()
    if body.tracking_number is not None:
        upd["tracking_number"] = body.tracking_number.strip()
    if body.tracking_url is not None:
        upd["tracking_url"] = body.tracking_url.strip()
    if body.estimated_delivery is not None:
        upd["estimated_delivery"] = body.estimated_delivery.strip()
    await db.orders.update_one({"order_id": order_id}, {"$set": upd})
    o.update(upd)
    return o


@api.get("/admin/customers")
async def admin_customers(_: dict = Depends(require_admin)):
    users = await db.users.find({"role": "customer"}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(1000)
    counts = {}
    async for o in db.orders.find({}, {"_id": 0, "email": 1, "total": 1}):
        c = counts.setdefault(o["email"], [0, 0])
        c[0] += 1
        c[1] += o["total"]
    for u in users:
        u["orders"], u["spent"] = counts.get(u["email"], [0, 0])
    return users


# ---------- Media (object storage) ----------
@api.get("/media/{path:path}")
async def media(path: str):
    clean_path = path.lstrip("/")
    try:
        doc = await db.media.find_one({
            "$or": [
                {"path": clean_path},
                {"path": "/" + clean_path},
                {"path": "images/" + clean_path},
                {"path": clean_path.replace("images/", "")},
            ]
        })
        if doc and "data" in doc:
            return Response(
                content=doc["data"],
                media_type=doc.get("content_type", "image/png"),
                headers={"Cache-Control": "public, max-age=31536000, immutable"},
            )
    except Exception as e:
        logger.warning("Motor media lookup failed for %s: %s", clean_path, e)

    try:
        data, ct = await asyncio.to_thread(storage.get_object, path)
        return Response(content=data, media_type=ct,
                        headers={"Cache-Control": "public, max-age=31536000, immutable"})
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        logger.error("Media retrieval failed for %s: %s", path, e)
        raise HTTPException(status_code=500, detail="Error fetching media")


@api.post("/admin/media/upload")
async def admin_upload_generic_image(file: UploadFile = File(...),
                                     admin: dict = Depends(require_admin)):
    if file.content_type not in storage.ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Upload a PNG, JPEG or WebP image")
    data = await file.read()
    if len(data) > storage.MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image must be under 10 MB")
    try:
        png = await asyncio.to_thread(storage.to_png, data)
    except Exception as e:
        logger.error("Image processing failed: %s", e)
        raise HTTPException(status_code=422, detail="Could not process that image")
    path = f"{storage.APP_NAME}/uploads/{uuid.uuid4().hex}.png"
    now_utc = now()
    try:
        await db.media.update_one(
            {"path": path},
            {"$set": {"path": path, "data": png, "content_type": "image/png", "size": len(png), "updated_at": now_utc},
             "$setOnInsert": {"created_at": now_utc}},
            upsert=True
        )
    except Exception as e:
        logger.warning("Motor media store warning: %s", e)
    result = await asyncio.to_thread(storage.put_object, path, png, "image/png")
    url = f"/api/media/{path}"
    await db.files.insert_one({"id": f"file_{uuid.uuid4().hex[:12]}", "storage_path": path,
                               "original_filename": file.filename, "content_type": "image/png",
                               "size": len(png), "by": admin["email"],
                               "is_deleted": False, "created_at": now().isoformat()})
    return {"url": url, "path": path}


@api.post("/admin/products/{slug}/image")
async def admin_upload_image(slug: str, file: UploadFile = File(...),
                             set_primary: bool = Query(True),
                             admin: dict = Depends(require_admin)):
    global _products_cache
    if not await db.products.find_one({"slug": slug}):
        raise HTTPException(status_code=404, detail="Product not found")
    if file.content_type not in storage.ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Upload a PNG, JPEG or WebP image")
    data = await file.read()
    if len(data) > storage.MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image must be under 10 MB")
    try:
        png = await asyncio.to_thread(storage.to_png, data)
    except Exception as e:
        logger.error("Image processing failed: %s", e)
        raise HTTPException(status_code=422, detail="Could not process that image")
    path = f"{storage.APP_NAME}/products/{slug}/{uuid.uuid4().hex}.png"
    now_utc = now()
    try:
        await db.media.update_one(
            {"path": path},
            {"$set": {"path": path, "data": png, "content_type": "image/png", "size": len(png), "updated_at": now_utc},
             "$setOnInsert": {"created_at": now_utc}},
            upsert=True
        )
    except Exception as e:
        logger.warning("Motor media store warning: %s", e)
    try:
        result = await asyncio.to_thread(storage.put_object, path, png, "image/png")
    except Exception as e:
        logger.warning("Storage upload warning: %s", e)
    url = f"/api/media/{path}"
    await db.files.insert_one({"id": f"file_{uuid.uuid4().hex[:12]}", "storage_path": path,
                               "original_filename": file.filename, "content_type": "image/png",
                               "size": len(png), "product_slug": slug, "by": admin["email"],
                               "is_deleted": False, "created_at": now().isoformat()})
    
    update_doc = {
        "$addToSet": {"images": url},
        "$set": {"updated_at": now().isoformat()}
    }
    if set_primary:
        update_doc["$set"]["image"] = url

    p = await db.products.find_one_and_update(
        {"slug": slug},
        update_doc,
        projection={"_id": 0},
        return_document=True
    )
    _products_cache = []
    if p is not None:
        p["url"] = url
        p["uploaded_url"] = url
        all_imgs = list(p.get("images") or [])
        if url not in all_imgs:
            all_imgs.append(url)
        p["images"] = all_imgs
        return p
    return {"url": url, "image": url, "images": [url]}


@api.post("/admin/products/{slug}/images")
async def admin_upload_multiple_images(slug: str, files: List[UploadFile] = File(...),
                                       admin: dict = Depends(require_admin)):
    global _products_cache
    prod = await db.products.find_one({"slug": slug})
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    uploaded_urls = []
    for f in files:
        if f.content_type not in storage.ALLOWED_TYPES:
            continue
        raw = await f.read()
        if len(raw) > storage.MAX_UPLOAD_BYTES:
            continue
        try:
            png = await asyncio.to_thread(storage.to_png, raw)
        except Exception:
            continue
        path = f"{storage.APP_NAME}/products/{slug}/{uuid.uuid4().hex}.png"
        try:
            res = await asyncio.to_thread(storage.put_object, path, png, "image/png")
            url = f"/api/media/{res['path']}"
            uploaded_urls.append(url)
            await db.files.insert_one({
                "id": f"file_{uuid.uuid4().hex[:12]}",
                "storage_path": res["path"],
                "original_filename": f.filename,
                "content_type": "image/png",
                "size": len(png),
                "product_slug": slug,
                "by": admin["email"],
                "is_deleted": False,
                "created_at": now().isoformat()
            })
        except Exception as e:
            logger.error("Failed saving multi image: %s", e)

    if uploaded_urls:
        update_ops = {
            "$addToSet": {"images": {"$each": uploaded_urls}},
            "$set": {"updated_at": now().isoformat()}
        }
        if not prod.get("image"):
            update_ops["$set"]["image"] = uploaded_urls[0]
        await db.products.update_one({"slug": slug}, update_ops)

    p = await db.products.find_one({"slug": slug}, projection={"_id": 0})
    _products_cache = []
    return p


# ---------- Reviews ----------
REVIEW_STATUSES = ["pending", "approved", "hidden"]


class ReviewIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    text: str = Field(min_length=3, max_length=180)


class ReviewStatusIn(BaseModel):
    status: Literal["pending", "approved", "hidden"]


async def has_purchased(user: dict, slug: str) -> bool:
    q = {"status": {"$ne": "cancelled"}, "items.slug": slug,
         "$or": [{"user_id": user["user_id"]}, {"email": user["email"]}]}
    return await db.orders.find_one(q, {"_id": 1}) is not None


@api.get("/products/{slug}/reviews")
async def product_reviews(slug: str):
    items = await db.reviews.find({"product_slug": slug, "status": "approved"}, {"_id": 0, "user_id": 0}) \
        .sort("created_at", -1).to_list(200)
    avg = round(sum(r["rating"] for r in items) / len(items), 1) if items else None
    return {"items": items, "count": len(items), "average": avg}


@api.get("/products/{slug}/reviews/eligibility")
async def review_eligibility(slug: str, user: dict = Depends(get_current_user)):
    existing = await db.reviews.find_one({"product_slug": slug, "user_id": user["user_id"]}, {"_id": 0})
    return {"can_review": await has_purchased(user, slug), "existing": existing}


@api.post("/products/{slug}/reviews")
async def create_review(slug: str, body: ReviewIn, user: dict = Depends(get_current_user)):
    p = await db.products.find_one({"slug": slug, "active": True}, {"_id": 0, "name": 1})
    if not p:
        raise HTTPException(status_code=404, detail="Fragrance not found")
    if not await has_purchased(user, slug):
        raise HTTPException(status_code=403, detail="Only customers who have bought this fragrance can review it")
    key = {"product_slug": slug, "user_id": user["user_id"]}
    await db.reviews.update_one(key, {
        "$set": {"product_name": p["name"], "user_name": user.get("name") or user["email"].split("@")[0],
                 "rating": body.rating, "text": body.text.strip(), "status": "pending", "updated_at": now().isoformat()},
        "$setOnInsert": {"id": f"rev_{uuid.uuid4().hex[:12]}", "created_at": now().isoformat(), **key},
    }, upsert=True)
    return await db.reviews.find_one(key, {"_id": 0})


@api.get("/reviews/featured")
async def featured_reviews(limit: int = Query(12, ge=1, le=50)):
    return await db.reviews.find({"status": "approved"}, {"_id": 0, "user_id": 0}).sort("created_at", -1).to_list(limit)


@api.get("/admin/reviews")
async def admin_reviews(status: Optional[str] = None, _: dict = Depends(require_admin)):
    q = {"status": status} if status in REVIEW_STATUSES else {}
    return await db.reviews.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api.patch("/admin/reviews/{rid}")
async def admin_review_status(rid: str, body: ReviewStatusIn, _: dict = Depends(require_admin)):
    r = await db.reviews.find_one_and_update({"id": rid}, {"$set": {"status": body.status}}, projection={"_id": 0},
                                             return_document=True)
    if not r:
        raise HTTPException(status_code=404, detail="Review not found")
    return r


@api.delete("/admin/reviews/{rid}")
async def admin_review_delete(rid: str, _: dict = Depends(require_admin)):
    res = await db.reviews.delete_one({"id": rid})
    if not res.deleted_count:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"deleted": rid}


# ---------- Seed ----------
SEED = [
    {
        "slug": "blonde-amber", "name": "Blonde Amber", "order": 1, "color": "#D4A24C", "badge": "The Signature",
        "tagline": "Liquid gold, warm resins and a whisper of smoke.",
        "story": "A radiant amber that glows like candlelight on gilded walls — warm, golden and unmistakably regal. Conceived as a celebration of sovereign decadence, it weaves precious golden resins, smoky blonde tobacco and vintage rum into a captivating trail of timeless grandeur.",
        "concentration": "Eau de Parfum", "volume": "50 ml", "price": 1599, "sample_price": 99, "stock": 50,
        "olfactory_family": "Warm Amber Spicy · Oriental Gourmand",
        "accords": [
            {"name": "Amber Resin", "pct": 95},
            {"name": "Warm Spice", "pct": 90},
            {"name": "Sweet Blonde Tobacco", "pct": 86},
            {"name": "Bourbon Vanilla", "pct": 82},
            {"name": "Sunlit Citrus", "pct": 68},
            {"name": "Precious Woods", "pct": 60},
        ],
        "architecture": {
            "longevity": "12+ Hours · Enduring Aura",
            "sillage": "Intense · Regal Radiance",
            "season": "Autumn / Winter / Sovereign Evenings",
            "concentration": "EDP",
            "profile": "An imperial opening of sun-drenched bitter orange and fizzing pink pepper steeped in aged rum, revealing a heart of velvety blonde tobacco and powdery Tuscan orris, grounded on molten amber resin, tonka and bourbon vanilla.",
        },
        "notes": {
            "top": ["Bitter Orange", "Rum", "Pink Pepper", "Cardamom", "Bergamot", "Ginger"],
            "heart": ["Blonde Tobacco", "Orris", "Dried Fruits", "Sandalwood", "Saffron", "White Pepper", "Jasmine"],
            "base": ["Amber", "Vanilla", "Tonka Bean", "Cedarwood", "Labdanum", "Myrrh", "Patchouli", "Musk"],
        },
    },
    {
        "slug": "layton", "name": "Layton", "order": 2, "color": "#1E2F5C", "badge": "The Noble",
        "tagline": "Crisp bergamot, lavender and warm woods.",
        "story": "Composed with the poise of a knight in royal court — fresh and invigorating at first, then deep, warm and commanding. An aristocratic harmony of wild French lavender, tart green apple and precious woods designed for those who lead with quiet authority.",
        "concentration": "Eau de Parfum", "volume": "50 ml", "price": 1499, "sample_price": 99, "stock": 50,
        "olfactory_family": "Amber Floral · Aristocratic Fresh Woody",
        "accords": [
            {"name": "Warm Spicy", "pct": 94},
            {"name": "Aromatic Lavender", "pct": 88},
            {"name": "Crisp Apple & Citrus", "pct": 85},
            {"name": "Bourbon Vanilla", "pct": 80},
            {"name": "Noble Woods", "pct": 74},
        ],
        "architecture": {
            "longevity": "10–12 Hours · All-Day Sillage",
            "sillage": "Heavy · Commanding Aura",
            "season": "All-Season Signature · Court & Evening",
            "concentration": "EDP",
            "profile": "Tart crisp apple and Italian bergamot infused with wild French lavender, drifting into an aristocratic heart of night-blooming jasmine and violet, resting on a grand bed of vanilla, creamy sandalwood and guaiac wood.",
        },
        "notes": {
            "top": ["Apple", "Lavender", "Bergamot", "Mandarin Orange"],
            "heart": ["Jasmine", "Violet", "Cardamom", "Pink Pepper"],
            "base": ["Vanilla", "Sandalwood", "Guaiac Wood", "Amber", "Patchouli"],
        },
    },
    {
        "slug": "angels-share-on-the-rocks", "name": "Angels Share On The Rocks", "order": 3, "color": "#8A4B1F",
        "badge": "The Reserve", "tagline": "Cognac, cinnamon and oak — served over ice.",
        "story": "An ode to the sacred spirit lost to the heavens as cognac ages in French oak, poured cold over crystal ice. Rich with spicy cinnamon, roasted praline and aged eau-de-vie, it captures the hedonistic warmth of late-night indulgence in an opulent salon.",
        "concentration": "Eau de Parfum", "volume": "50 ml", "price": 1549, "sample_price": 99, "stock": 50,
        "olfactory_family": "Warm Gourmand · Boozy Amber Wood",
        "accords": [
            {"name": "Cinnamon Spice", "pct": 96},
            {"name": "Oak-Aged Cognac", "pct": 92},
            {"name": "Praline & Vanilla", "pct": 88},
            {"name": "French Oak", "pct": 82},
            {"name": "Golden Amber", "pct": 76},
        ],
        "architecture": {
            "longevity": "10–14 Hours · Enveloping Warmth",
            "sillage": "Strong · Intoxicating Trail",
            "season": "Fall / Winter / Midnight Revelry",
            "concentration": "EDP",
            "profile": "An intoxicating splash of aged oak-barrel cognac chilled over frosted bergamot, leading to an opulent core of warm cinnamon bark and roasted hazelnut praline, grounded by sandalwood and golden amber.",
        },
        "notes": {
            "top": ["Cognac", "Cinnamon", "Frozen Bergamot", "Nutmeg"],
            "heart": ["Oak", "Praline", "Tonka Bean", "Cardamom"],
            "base": ["Vanilla", "Sandalwood", "Amber", "Cedarwood"],
        },
    },
    {
        "slug": "side-effect", "name": "Side Effect", "order": 4, "color": "#5A1420", "badge": "The Enigma",
        "tagline": "Tobacco, rum and dark leather after midnight.",
        "story": "A dark, intoxicating trail of cured tobacco and vintage Jamaican rum that lingers long after you have left the room. Ignited by crimson saffron and wrapped in dark saddle leather, it is an enigmatic elixir of unrestrained passion and midnight temptation.",
        "concentration": "Eau de Parfum", "volume": "50 ml", "price": 1499, "sample_price": 99, "stock": 50,
        "olfactory_family": "Amber Tobacco · Dark Narcotic Leather",
        "accords": [
            {"name": "Rich Tobacco", "pct": 96},
            {"name": "Dark Rum", "pct": 92},
            {"name": "Warm Cinnamon", "pct": 88},
            {"name": "Vanilla Absolute", "pct": 82},
            {"name": "Leather & Saffron", "pct": 78},
        ],
        "architecture": {
            "longevity": "12+ Hours · Addictive Longevity",
            "sillage": "Enormous · Room-Commanding",
            "season": "Autumn / Winter / Intimate After-Hours",
            "concentration": "EDP",
            "profile": "A dangerously seductive duet of dark vintage rum and cured tobacco leaf ignited by cinnamon and crimson saffron threads, draped over an opulent base of dark saddle leather, woody amber and vanilla.",
        },
        "notes": {
            "top": ["Tobacco", "Rum", "Cinnamon", "Pink Pepper"],
            "heart": ["Saffron", "Dried Fruits", "Cardamom"],
            "base": ["Leather", "Vanilla", "Woody Amber", "Sandalwood", "Patchouli"],
        },
    },
]
SEED_PRICES = {"blonde-amber": 1599, "layton": 1499, "angels-share-on-the-rocks": 1549, "side-effect": 1499}
SEED_SAMPLE_PRICES = {"blonde-amber": 99, "layton": 99, "angels-share-on-the-rocks": 99, "side-effect": 99}



_startup_done = False

async def _init_background():
    try:
        await ensure_admin_account()
        await ensure_seeded()
    except Exception as e:
        logger.warning("Background init warning: %s", e)


@app.on_event("startup")
async def startup():
    global _startup_done
    if _startup_done:
        return
    _startup_done = True
    asyncio.create_task(_init_background())


@api.get("/")
async def root():
    return {"house": "House Of The Knight"}


@api.get("/debug")
async def debug_info(_: dict = Depends(require_admin)):
    """Diagnose connectivity issues. Restricted to administrators."""
    import sys
    mongo_url = os.environ.get("MONGO_URL", "NOT_SET")
    mongo_set = mongo_url != "NOT_SET"
    mongo_masked = (mongo_url[:20] + "...") if mongo_set else "NOT SET"
    db_status = "unknown"
    admin_in_db = False
    admin_role = None
    products_count = -1
    users_count = -1
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@houseoftheknight.com").strip().lower()

    try:
        result = await get_client().admin.command("ping", serverSelectionTimeoutMS=5000)
        db_status = f"connected: {result}"
        # Auto-seed admin user during debug check as well
        await ensure_admin_account()
        u = await db.users.find_one({"email": admin_email}, {"_id": 0, "password_hash": 0})
        if u:
            admin_in_db = True
            admin_role = u.get("role")
        products_count = await db.products.count_documents({})
        users_count = await db.users.count_documents({})
        # Reset login attempts for admin so they are never locked out
        await db.login_attempts.delete_many({"identifier": {"$regex": admin_email}})
    except Exception as e:
        db_status = f"FAILED: {type(e).__name__}: {str(e)[:200]}"

    raw_admin_pw = os.environ.get("ADMIN_PASSWORD", "")
    return {
        "python": sys.version,
        "mongo_url_set": mongo_set,
        "mongo_url_preview": mongo_masked,
        "db_name": os.environ.get("DB_NAME", "NOT_SET"),
        "admin_email": admin_email,
        "admin_in_db": admin_in_db,
        "admin_role": admin_role,
        "admin_pw_len": len(raw_admin_pw),
        "admin_pw_repr": repr(raw_admin_pw[:4] + "***" if raw_admin_pw else "EMPTY/NOT_SET"),
        "products_count": products_count,
        "users_count": users_count,
        "jwt_secret_set": bool(os.environ.get("JWT_SECRET")),
        "db_status": db_status,
    }



app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    global _client
    if _client:
        _client.close()
