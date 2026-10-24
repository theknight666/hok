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

_client = None
_client_loop = None

def get_client() -> AsyncIOMotorClient:
    global _client, _client_loop
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None
    if _client is None or (_client_loop is not None and _client_loop != loop):
        mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
        kwargs = {"connect": False}
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
    resp.set_cookie(key=key, value=value, httponly=True, secure=True, samesite="none", max_age=max_age, path="/")


def set_auth_cookies(resp: Response, user_id: str):
    set_cookie(resp, "access_token", make_token(user_id, "access"), ACCESS_MIN * 60)
    set_cookie(resp, "refresh_token", make_token(user_id, "refresh"), REFRESH_DAYS * 86400)


def public_user(u: dict) -> dict:
    return {k: u.get(k) for k in ("user_id", "email", "name", "picture", "role")}


def google_admin_emails() -> set:
    return {e.strip().lower() for e in os.environ.get("ADMIN_GOOGLE_EMAILS", "").split(",") if e.strip()}


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    auth = request.headers.get("Authorization", "")
    bearer = auth[7:] if auth.startswith("Bearer ") else None
    for t in filter(None, [token, bearer]):
        try:
            payload = jwt.decode(t, JWT_SECRET, algorithms=[JWT_ALG])
            if payload.get("type") == "access":
                user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
                if user:
                    return user
        except jwt.InvalidTokenError:
            pass
    session_token = request.cookies.get("session_token") or bearer
    if session_token:
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
    stock: int = Field(ge=0)
    low_stock_threshold: int = Field(default=10, ge=0)
    volume: str = "100 ml"
    concentration: str = "Eau de Parfum"
    badge: str = ""
    color: str = "#C5A059"
    image: str = ""
    notes: Notes = Notes()
    active: bool = True
    featured: bool = False
    order: int = 0


class ProductPatch(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    story: Optional[str] = None
    price: Optional[int] = Field(default=None, ge=0)
    stock: Optional[int] = Field(default=None, ge=0)
    low_stock_threshold: Optional[int] = Field(default=None, ge=0)
    volume: Optional[str] = None
    concentration: Optional[str] = None
    badge: Optional[str] = None
    color: Optional[str] = None
    image: Optional[str] = None
    notes: Optional[Notes] = None
    active: Optional[bool] = None
    featured: Optional[bool] = None


class StockAdjust(BaseModel):
    delta: int


class CartItem(BaseModel):
    slug: str
    qty: int = Field(ge=1, le=20)


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
    set_auth_cookies(response, user["user_id"])
    return public_user(user)


async def ensure_admin_account():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@houseoftheknight.com").strip().lower()
    admin_pw = os.environ.get("ADMIN_PASSWORD", "KnightAdmin#2026").strip()
    try:
        existing = await db.users.find_one({"email": admin_email})
        if not existing:
            admin_doc = {
                "user_id": f"user_admin_{uuid.uuid4().hex[:8]}",
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
        return None


@api.post("/auth/login")
async def login(body: LoginIn, request: Request, response: Response):
    try:
        email = body.email.strip().lower()
        admin_email = os.environ.get("ADMIN_EMAIL", "admin@houseoftheknight.com").strip().lower()
        admin_pw = os.environ.get("ADMIN_PASSWORD", "KnightAdmin#2026").strip()
        ident = f"{request.client.host if request.client else 'x'}:{email}"

        # 1. Admin shortcut: If credentials match env ADMIN_EMAIL and ADMIN_PASSWORD
        if email == admin_email and body.password.strip() == admin_pw:
            admin_user = await ensure_admin_account()
            if not admin_user:
                admin_user = await db.users.find_one({"email": admin_email})
            if admin_user:
                await db.login_attempts.delete_one({"identifier": ident})
                set_auth_cookies(response, admin_user["user_id"])
                return public_user(admin_user)

        # 2. If it's admin email, ensure the account exists in DB
        if email == admin_email:
            await ensure_admin_account()

        # 3. Rate limiting check
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

        await db.login_attempts.delete_one({"identifier": ident})
        set_auth_cookies(response, user["user_id"])
        return public_user(user)
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
async def google_session(body: SessionIn, response: Response):
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.get("https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                        headers={"X-Session-ID": body.session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Google sign-in failed")
    data = r.json()
    email = data["email"].lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    role = "admin" if email in google_admin_emails() else None
    if user:
        upd = {"name": user.get("name") or data.get("name"), "picture": data.get("picture")}
        if role:
            upd["role"] = role
        await db.users.update_one({"email": email}, {"$set": upd})
        user.update(upd)
    else:
        user = {"user_id": f"user_{uuid.uuid4().hex[:12]}", "email": email, "name": data.get("name") or email,
                "picture": data.get("picture"), "role": role or "customer", "created_at": now().isoformat()}
        await db.users.insert_one(dict(user))
    await db.user_sessions.insert_one({"user_id": user["user_id"], "session_token": data["session_token"],
                                       "expires_at": now() + timedelta(days=7), "created_at": now()})
    set_cookie(response, "session_token", data["session_token"], 7 * 86400)
    return public_user(user)


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
        if await db.products.count_documents({}) == 0:
            for p in SEED:
                doc = {**p, "price": SEED_PRICES[p["slug"]], "image": f"/images/{p['slug'].replace('-on-the-rocks', '')}.jpg",
                       "low_stock_threshold": 10, "active": True, "featured": True, "updated_at": now().isoformat()}
                await db.products.insert_one(doc)
        await ensure_admin_account()
        _seeded = True
    except Exception as e:
        logger.error("Auto-seeding error: %s", e)


@api.post("/auth/seed")
async def manual_seed():
    """Manual seed endpoint to ensure products and admin user are populated."""
    await ensure_seeded()
    return {"ok": True, "message": "Seeded products and admin account"}



def _seed_fallback():
    """Return seed products from code when MongoDB is unavailable."""
    return [
        {**p, "price": SEED_PRICES[p["slug"]], "image": f"/images/{p['slug'].replace('-on-the-rocks', '')}.jpg",
         "low_stock_threshold": 10, "active": True, "featured": True, "updated_at": ""}
        for p in SEED
    ]


# ---------- Products ----------
@api.get("/products")
async def list_products():
    try:
        await ensure_seeded()
        items = await db.products.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(100)
        if not items:
            return _seed_fallback()
        return items
    except Exception as e:
        logger.error("list_products DB error, using fallback: %s", e)
        return _seed_fallback()


@api.get("/products/{slug}")
async def get_product(slug: str):
    try:
        await ensure_seeded()
        p = await db.products.find_one({"slug": slug, "active": True}, {"_id": 0})
        if not p:
            # Try fallback
            fallback = {f["slug"]: f for f in _seed_fallback()}
            p = fallback.get(slug)
        if not p:
            raise HTTPException(status_code=404, detail="Fragrance not found")
        return p
    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_product DB error, using fallback: %s", e)
        fallback = {f["slug"]: f for f in _seed_fallback()}
        p = fallback.get(slug)
        if not p:
            raise HTTPException(status_code=404, detail="Fragrance not found")
        return p


# ---------- Orders ----------
@api.post("/orders")
async def create_order(body: OrderIn, user: Optional[dict] = Depends(optional_user)):
    reserved, lines = [], []
    try:
        for it in body.items:
            p = await db.products.find_one_and_update(
                {"slug": it.slug, "active": True, "stock": {"$gte": it.qty}},
                {"$inc": {"stock": -it.qty}}, projection={"_id": 0})
            if not p:
                raise HTTPException(status_code=400, detail=f"Not enough stock for {it.slug}")
            reserved.append(it)
            lines.append({"slug": p["slug"], "name": p["name"], "price": p["price"], "qty": it.qty,
                          "image": p.get("image", ""), "line_total": p["price"] * it.qty})
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
    return await db.products.find({}, {"_id": 0}).sort("order", 1).to_list(100)


@api.post("/admin/products")
async def admin_create_product(body: ProductIn, _: dict = Depends(require_admin)):
    if await db.products.find_one({"slug": body.slug}):
        raise HTTPException(status_code=400, detail="Slug already exists")
    doc = body.model_dump()
    doc["updated_at"] = now().isoformat()
    await db.products.insert_one(dict(doc))
    return doc


@api.patch("/admin/products/{slug}")
async def admin_update_product(slug: str, body: ProductPatch, _: dict = Depends(require_admin)):
    upd = body.model_dump(exclude_none=True)
    upd["updated_at"] = now().isoformat()
    p = await db.products.find_one_and_update({"slug": slug}, {"$set": upd}, projection={"_id": 0}, return_document=True)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


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
    await db.orders.update_one({"order_id": order_id}, {"$set": {"status": body.status}})
    o["status"] = body.status
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
    rec = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not rec:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, ct = await asyncio.to_thread(storage.get_object, path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    return Response(content=data, media_type=rec.get("content_type", ct),
                    headers={"Cache-Control": "public, max-age=31536000, immutable"})


@api.post("/admin/products/{slug}/image")
async def admin_upload_image(slug: str, file: UploadFile = File(...), remove_bg: bool = Query(True),
                             admin: dict = Depends(require_admin)):
    if not await db.products.find_one({"slug": slug}):
        raise HTTPException(status_code=404, detail="Product not found")
    if file.content_type not in storage.ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Upload a PNG, JPEG or WebP image")
    data = await file.read()
    if len(data) > storage.MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image must be under 10 MB")
    try:
        png = await asyncio.to_thread(storage.cut_out_bottle if remove_bg else storage.to_png, data)
    except Exception as e:
        logger.error("Image processing failed: %s", e)
        raise HTTPException(status_code=422, detail="Could not process that image")
    path = f"{storage.APP_NAME}/products/{slug}/{uuid.uuid4().hex}.png"
    try:
        result = await asyncio.to_thread(storage.put_object, path, png, "image/png")
    except Exception as e:
        logger.error("Storage upload failed: %s", e)
        raise HTTPException(status_code=502, detail="Image storage is unavailable right now")
    url = f"/api/media/{result['path']}"
    await db.files.insert_one({"id": f"file_{uuid.uuid4().hex[:12]}", "storage_path": result["path"],
                               "original_filename": file.filename, "content_type": "image/png",
                               "size": result.get("size", len(png)), "product_slug": slug, "by": admin["email"],
                               "is_deleted": False, "created_at": now().isoformat()})
    p = await db.products.find_one_and_update({"slug": slug}, {"$set": {"image": url, "updated_at": now().isoformat()}},
                                              projection={"_id": 0}, return_document=True)
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
    {"slug": "blonde-amber", "name": "Blonde Amber", "order": 1, "color": "#D4A24C", "badge": "The Signature",
     "tagline": "Liquid gold, warm resins and a whisper of smoke.",
     "story": "A radiant amber that glows like candlelight on gilded walls — warm, golden and unmistakably regal.",
     "concentration": "Extrait de Parfum", "volume": "100 ml", "price": 0, "stock": 50,
     "notes": {"top": ["Bitter Orange", "Pink Pepper"], "heart": ["Blonde Tobacco", "Orris"], "base": ["Amber", "Tonka", "Vanilla"]}},
    {"slug": "layton", "name": "Layton", "order": 2, "color": "#1E2F5C", "badge": "The Noble",
     "tagline": "Crisp bergamot, lavender and warm woods.",
     "story": "Composed with the poise of a knight in court — fresh at first, then deep, warm and assured.",
     "concentration": "Eau de Parfum", "volume": "100 ml", "price": 0, "stock": 50,
     "notes": {"top": ["Apple", "Bergamot", "Lavender"], "heart": ["Jasmine", "Violet"], "base": ["Vanilla", "Sandalwood", "Guaiac Wood"]}},
    {"slug": "angels-share-on-the-rocks", "name": "Angels Share On The Rocks", "order": 3, "color": "#8A4B1F",
     "badge": "The Reserve", "tagline": "Cognac, cinnamon and oak — served over ice.",
     "story": "An ode to the spirit lost to the heavens as cognac ages in oak, poured cold over crystal ice.",
     "concentration": "Extrait de Parfum", "volume": "100 ml", "price": 0, "stock": 50,
     "notes": {"top": ["Cognac", "Frozen Bergamot"], "heart": ["Cinnamon", "Oak"], "base": ["Praline", "Sandalwood", "Vanilla"]}},
    {"slug": "side-effect", "name": "Side Effect", "order": 4, "color": "#5A1420", "badge": "The Enigma",
     "tagline": "Tobacco, rum and dark leather after midnight.",
     "story": "A dark, addictive trail of tobacco and rum that lingers long after you have left the room.",
     "concentration": "Eau de Parfum", "volume": "100 ml", "price": 0, "stock": 50,
     "notes": {"top": ["Rum", "Tobacco"], "heart": ["Cinnamon", "Saffron"], "base": ["Leather", "Vanilla", "Woody Amber"]}},
]
SEED_PRICES = {"blonde-amber": 18500, "layton": 16500, "angels-share-on-the-rocks": 17500, "side-effect": 16000}


@app.on_event("startup")
async def startup():
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("user_id", unique=True)
        await db.products.create_index("slug", unique=True)
        await db.orders.create_index("order_id", unique=True)
        await db.login_attempts.create_index("identifier")
        await db.reviews.create_index([("product_slug", 1), ("user_id", 1)], unique=True)
        await db.reviews.create_index("id", unique=True)
        await db.files.create_index("storage_path", unique=True)
        for p in SEED:
            if not await db.products.find_one({"slug": p["slug"]}):
                doc = {**p, "price": SEED_PRICES[p["slug"]], "image": f"/images/{p['slug'].replace('-on-the-rocks', '')}.jpg",
                       "low_stock_threshold": 10, "active": True, "featured": True, "updated_at": now().isoformat()}
                await db.products.insert_one(doc)
            else:
                # Ensure seed products are always active and featured
                await db.products.update_one(
                    {"slug": p["slug"]},
                    {"$set": {"active": True, "featured": True}}
                )
        await db.products.update_many({"featured": {"$exists": False}}, {"$set": {"featured": True}})
        admin_email = os.environ.get("ADMIN_EMAIL", "admin@houseoftheknight.com").lower()
        admin_pw = os.environ.get("ADMIN_PASSWORD", "KnightAdmin#2026")
        existing = await db.users.find_one({"email": admin_email})
        if not existing:
            await db.users.insert_one({"user_id": f"user_{uuid.uuid4().hex[:12]}", "email": admin_email, "name": "House Admin",
                                       "picture": None, "role": "admin", "password_hash": hash_password(admin_pw),
                                       "created_at": now().isoformat()})
        elif not existing.get("password_hash") or not verify_password(admin_pw, existing["password_hash"]):
            await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_pw), "role": "admin"}})
    except Exception as e:
        logger.error("Startup error: %s", e)


@api.get("/")
async def root():
    return {"house": "House Of The Knight"}


@api.get("/debug")
async def debug_info():
    """Diagnose connectivity issues. Remove in production."""
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
    except Exception as e:
        db_status = f"FAILED: {type(e).__name__}: {str(e)[:200]}"

    return {
        "python": sys.version,
        "mongo_url_set": mongo_set,
        "mongo_url_preview": mongo_masked,
        "db_name": os.environ.get("DB_NAME", "NOT_SET"),
        "admin_email": admin_email,
        "admin_in_db": admin_in_db,
        "admin_role": admin_role,
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
