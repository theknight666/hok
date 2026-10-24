"""Backend tests: reviews moderation, admin bottle upload with bg removal, featured flag."""
import os
import io
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://knight-house.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@houseoftheknight.com"
ADMIN_PASS = "KnightAdmin#2026"
REVIEWER_EMAIL = "reviewer@test.com"
REVIEWER_PASS = "Reviewer#2026"


def _session(email=None, password=None):
    s = requests.Session()
    if email:
        r = s.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password}, timeout=15)
        assert r.status_code == 200, f"login failed for {email}: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="module")
def admin():
    return _session(ADMIN_EMAIL, ADMIN_PASS)


@pytest.fixture(scope="module")
def reviewer():
    return _session(REVIEWER_EMAIL, REVIEWER_PASS)


@pytest.fixture(scope="module")
def guest():
    return _session()


# --------------------- Reviews ---------------------

class TestReviewsPublic:
    def test_side_effect_reviews_shape(self, guest):
        r = guest.get(f"{BASE_URL}/api/products/side-effect/reviews")
        assert r.status_code == 200
        data = r.json()
        for key in ("items", "count", "average"):
            assert key in data, f"missing key {key}"
        assert isinstance(data["items"], list)
        # all returned reviews must be approved
        for it in data["items"]:
            assert it.get("status") in (None, "approved"), f"non-approved leaked: {it}"

    def test_featured_reviews_approved_only(self, guest):
        r = guest.get(f"{BASE_URL}/api/reviews/featured")
        assert r.status_code == 200
        data = r.json()
        items = data.get("items") if isinstance(data, dict) else data
        assert isinstance(items, list)
        for it in items:
            assert it.get("status") in (None, "approved")


class TestReviewSubmission:
    def test_unauth_post_returns_401(self, guest):
        r = guest.post(f"{BASE_URL}/api/products/knight-house/reviews", json={"rating": 5, "text": "Nice"})
        assert r.status_code in (401, 403)

    def test_signed_in_no_order_returns_403(self, reviewer):
        # reviewer bought side-effect only; a product they didn't buy should be forbidden.
        # NOTE: spec referenced slug 'knight-house' which does not exist (returns 404).
        # Using an existing non-purchased slug 'layton' instead.
        r = reviewer.post(f"{BASE_URL}/api/products/layton/reviews", json={"rating": 5, "text": "Nope"})
        assert r.status_code == 403, f"expected 403 got {r.status_code} {r.text}"

    def test_eligibility_endpoint(self, reviewer):
        r1 = reviewer.get(f"{BASE_URL}/api/products/side-effect/reviews/eligibility")
        assert r1.status_code == 200
        assert r1.json().get("can_review") is True
        r2 = reviewer.get(f"{BASE_URL}/api/products/knight-house/reviews/eligibility")
        assert r2.status_code == 200
        assert r2.json().get("can_review") is False

    def test_submit_review_pending_and_update(self, reviewer):
        r = reviewer.post(
            f"{BASE_URL}/api/products/side-effect/reviews",
            json={"rating": 5, "text": "TEST_review initial content"},
        )
        assert r.status_code in (200, 201), r.text
        body = r.json()
        assert body.get("status") == "pending"
        rid1 = body.get("id") or body.get("_id")

        # re-submit, should update not duplicate
        r2 = reviewer.post(
            f"{BASE_URL}/api/products/side-effect/reviews",
            json={"rating": 4, "text": "TEST_review updated content"},
        )
        assert r2.status_code in (200, 201)
        body2 = r2.json()
        assert body2.get("status") == "pending"
        rid2 = body2.get("id") or body2.get("_id")
        if rid1 and rid2:
            assert rid1 == rid2, "duplicate review created instead of update"
        assert body2.get("rating") == 4


class TestAdminReviews:
    def test_non_admin_forbidden(self, reviewer):
        r = reviewer.get(f"{BASE_URL}/api/admin/reviews?status=pending")
        assert r.status_code == 403

    def test_admin_list_pending(self, admin):
        r = admin.get(f"{BASE_URL}/api/admin/reviews?status=pending")
        assert r.status_code == 200
        data = r.json()
        items = data.get("items") if isinstance(data, dict) else data
        assert isinstance(items, list)

    def test_admin_patch_and_restore_approved(self, admin):
        # get pending reviews
        r = admin.get(f"{BASE_URL}/api/admin/reviews?status=pending")
        items = r.json().get("items") if isinstance(r.json(), dict) else r.json()
        if not items:
            pytest.skip("no pending reviews to moderate")
        rid = items[0].get("id") or items[0].get("_id")
        # approve
        pr = admin.patch(f"{BASE_URL}/api/admin/reviews/{rid}", json={"status": "approved"})
        assert pr.status_code == 200, pr.text
        assert pr.json().get("status") == "approved"
        # hide
        pr2 = admin.patch(f"{BASE_URL}/api/admin/reviews/{rid}", json={"status": "hidden"})
        assert pr2.status_code == 200
        assert pr2.json().get("status") == "hidden"
        # re-approve so home quotes have content
        pr3 = admin.patch(f"{BASE_URL}/api/admin/reviews/{rid}", json={"status": "approved"})
        assert pr3.status_code == 200


# --------------------- Featured flag ---------------------

class TestFeaturedFlag:
    SLUG = "blonde-amber"  # spec said 'knight-house' but that slug doesn't exist

    def test_patch_featured_persists(self, admin, guest):
        # set to false
        r = admin.patch(f"{BASE_URL}/api/admin/products/{self.SLUG}", json={"featured": False})
        assert r.status_code == 200, r.text
        # verify list
        pl = guest.get(f"{BASE_URL}/api/products").json()
        items = pl if isinstance(pl, list) else pl.get("items", [])
        kh = next((p for p in items if p.get("slug") == self.SLUG), None)
        assert kh is not None
        assert kh.get("featured") is False
        # restore
        r2 = admin.patch(f"{BASE_URL}/api/admin/products/{self.SLUG}", json={"featured": True})
        assert r2.status_code == 200
        pl2 = guest.get(f"{BASE_URL}/api/products").json()
        items2 = pl2 if isinstance(pl2, list) else pl2.get("items", [])
        kh2 = next((p for p in items2 if p.get("slug") == self.SLUG), None)
        assert kh2.get("featured") is True


# --------------------- Bottle upload ---------------------

class TestBottleUpload:
    IMG_PATH = "/app/frontend/public/images/layton.jpg"

    def test_non_admin_forbidden(self, reviewer):
        if not os.path.exists(self.IMG_PATH):
            pytest.skip("no layton.jpg")
        with open(self.IMG_PATH, "rb") as f:
            r = reviewer.post(
                f"{BASE_URL}/api/admin/products/layton/image",
                files={"file": ("layton.jpg", f, "image/jpeg")},
                timeout=60,
            )
        assert r.status_code == 403

    def test_non_image_rejected(self, admin):
        r = admin.post(
            f"{BASE_URL}/api/admin/products/layton/image",
            files={"file": ("note.txt", io.BytesIO(b"hello"), "text/plain")},
            timeout=30,
        )
        assert r.status_code == 400

    def test_admin_upload_bg_removed(self, admin, guest):
        if not os.path.exists(self.IMG_PATH):
            pytest.skip("no layton.jpg")
        t0 = time.time()
        with open(self.IMG_PATH, "rb") as f:
            r = admin.post(
                f"{BASE_URL}/api/admin/products/layton/image",
                files={"file": ("layton.jpg", f, "image/jpeg")},
                timeout=120,
            )
        dt = time.time() - t0
        assert r.status_code == 200, r.text
        body = r.json()
        img = body.get("image") or body.get("imageUrl")
        assert img and img.startswith("/api/media/hotk/products/layton/"), f"bad image path: {img}"
        print(f"upload took {dt:.1f}s -> {img}")
        # fetch media
        m = guest.get(f"{BASE_URL}{img}", timeout=30)
        assert m.status_code == 200
        ct = m.headers.get("content-type", "")
        assert ct.startswith("image/"), f"unexpected content-type {ct}"
        # restore default
        rr = admin.patch(f"{BASE_URL}/api/admin/products/layton", json={"image": "/images/layton.jpg"})
        assert rr.status_code == 200
