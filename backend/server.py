from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
import httpx
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

app = FastAPI(title="House Of The Knight")
api = APIRouter(prefix="/api")
logger = logging.getLogger("hotk")
logging.basicConfig(level=logging.INFO)

JWT_ALG = "HS256"
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
    return jwt.encode({"sub": user_id, "type": kind, "exp": exp}, os.environ["JWT_SECRET"], algorithm=JWT_ALG)


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
            payload = jwt.decode(t, os.environ["JWT_SECRET"], algorithms=[JWT_ALG])
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


@api.post("/auth/login")
async def login(body: LoginIn, request: Request, response: Response):
    email = body.email.lower()
    ident = f"{request.client.host if request.client else 'x'}:{email}"
    att = await db.login_attempts.find_one({"identifier": ident})
    if att and att.get("count", 0) >= 5:
        locked = att.get("last")
        if isinstance(locked, str):
            locked = datetime.fromisoformat(locked)
        if locked and now() - locked < timedelta(minutes=15):
            raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")
        await db.login_attempts.delete_one({"identifier": ident})
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not verify_password(body.password, user["password_hash"]):
        await db.login_attempts.update_one({"identifier": ident},
                                           {"$inc": {"count": 1}, "$set": {"last": now().isoformat()}}, upsert=True)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": ident})
    set_auth_cookies(response, user["user_id"])
    return public_user(user)


@api.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    t = request.cookies.get("refresh_token")
    if not t:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(t, os.environ["JWT_SECRET"], algorithms=[JWT_ALG])
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


# ---------- Products ----------
@api.get("/products")
async def list_products():
    items = await db.products.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return items


@api.get("/products/{slug}")
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug, "active": True}, {"_id": 0})
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
    await db.orders.insert_one(dict(order))
    return order


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
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.orders.create_index("order_id", unique=True)
    await db.login_attempts.create_index("identifier")
    for p in SEED:
        if not await db.products.find_one({"slug": p["slug"]}):
            doc = {**p, "price": SEED_PRICES[p["slug"]], "image": f"/images/{p['slug'].replace('-on-the-rocks', '')}.jpg",
                   "low_stock_threshold": 10, "active": True, "updated_at": now().isoformat()}
            await db.products.insert_one(doc)
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_pw = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({"user_id": f"user_{uuid.uuid4().hex[:12]}", "email": admin_email, "name": "House Admin",
                                   "picture": None, "role": "admin", "password_hash": hash_password(admin_pw),
                                   "created_at": now().isoformat()})
    elif not existing.get("password_hash") or not verify_password(admin_pw, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_pw), "role": "admin"}})


@api.get("/")
async def root():
    return {"house": "House Of The Knight"}


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ['CORS_ORIGINS'].split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
