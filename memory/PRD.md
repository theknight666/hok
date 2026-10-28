# PRD — House Of The Knight

## Original problem statement
i want an e-commerce website for my perfume brand which consists of 4 perfumes i want a 3D interactive website it should reveal the 3d perfume bottle with elegance on the front page it should feel royal and a multi million dollar brand. keep the background white with options for dark mode as well. i need full site including backend where i can update inventories and other usefull stuff. My brand name is House Of The Knight and i wish to curate a website experience for perfumes like never seen before, need an award winning ecommerce website

User choices: payment gateway later; currency INR (₹); perfumes Blonde Amber, Layton, Angels Share On The Rocks, Side Effect; customer accounts; admin sign-in via Google + email/password.

## Architecture
- FastAPI (server.py) + MongoDB (users, user_sessions, products, orders, inventory_log, login_attempts)
- Auth: JWT httpOnly cookies (email/password, bcrypt, brute-force lockout) stored in MongoDB Atlas. Image storage: MongoDB Atlas `media` collection with local caching and fallback.
- React + react-three-fiber/drei (procedural 3D crystal bottle), framer-motion, lenis, shadcn UI.

## Personas
- Shopper (guest or account), House admin/owner.

## Implemented (2026-10-23)
- Intro curtain, 3D hero bottle with rise/spin reveal, drag-to-turn, live colour switch per fragrance, masked line headline, parallax outline type
- Slow editorial marquee, bento collection, atelier sticky section, notes atlas, manifesto parallax, footer
- Product pages (3D bottle tinted per perfume, stock state, notes pyramid), cart drawer (localStorage), checkout → order reserved (payment awaiting)
- Login/register + Google, account order history
- Admin: stats, low-stock alerts, best sellers, inventory (+/- stock with log, live toggle, full edit/new fragrance), orders (filter, status, cancel restocks), customers
- Light (white) default + dark mode toggle, SVG knight-crest logo + favicon

## Implemented (2026-10-23, iteration 2)
- Razorpay checkout (card/UPI/netbanking): server creates Razorpay order with each order, checkout.js modal, HMAC signature verify at /api/payments/verify → payment_status paid + status processing; "Pay now" retry on confirmation; admin + account show payment status. Auto-disabled (reserve-and-pay-later) until RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are set.

## Implemented (2026-10-23, iteration 3 — Premium UI Revamp)
- User feedback: site felt "flat and basic"; wanted premium editorial feel like buckssauce.com. Direction chosen: Bright editorial luxury, cinematic real product imagery, full-site scope.
- Replaced the low-poly react-three-fiber 3D hero bottle with a cinematic editorial image stage (accent halo bloom, float + scroll parallax, crossfade scent switcher, overlaid ₹ price badge). Deleted now-unused BottleScene.js; r3f deps remain installed.
- Generated 4 cohesive, brand-consistent luxury bottle renders (same faceted flacon + gold knight-crest cap, per-scent liquid colour) via Gemini image gen; overwrote /frontend/public/images/{blonde-amber,layton,angels-share,side-effect}.jpg → unified imagery across hero, collection, product, cart.
- Product page: replaced 3D panel with cinematic sticky image panel (halo + grain + gradient); swapped duplicate lower image for atelier editorial shot.
- Collection cards: premium lift/shadow (.lux-card), hover accent glow, grain, stronger gradients.
- Footer: deep obsidian block with client-side newsletter signup + gilded outline "The Knight".
- index.css: added global film-grain overlay, .halo bloom, .gold-gradient text, .lux-frame gilt hairline, .lux-card lift, floaty/halo-pulse keyframes.
- Verified via testing_agent (frontend) — 100% pass, all flows intact (hero switcher, quick-add, cart drawer, checkout nav, product add-to-bag, theme toggle, newsletter). Fixed Radix Sheet a11y warnings (added SheetDescription to cart drawer + mobile menu).

## Implemented (2026-10-23, iteration 4 — Bold "Bucks Sauce" rebuild)
- User rejected iteration 3 ("completely unacceptable… not the vibe"). Direction confirmed: NOT bound to gold/black/white; giant cheeky type; floating transparent bottle cutouts; full-screen colour world per perfume (buckssauce.com energy).
- Design system (index.css): Bricolage Grotesque 800 (condensed) display + Instrument Sans body; cream paper base / ink dark mode; pill buttons (.btn-royal, .btn-ghost-royal, .btn-world*, .pill); .display-xl/lg/md + .hero-title (vw/svh capped); .text-outline, .grain, .bottle-shadow, .world-glow; marquee/floaty keyframes. Old .lux-* / halo utilities removed.
- lib/visual.js: WORLDS per slug (Blonde Amber #F2A900, Layton #2338DB, Angels Share #C9471B, Side Effect #4B0F2C), worldOf(), worldVars(), cutout() path mapper, flatNotes(). components/site/Bottle.js = cutout <img> with fallback to staged photo.
- Transparent bottle PNGs generated (Gemini edit → rembg isnet) → /public/images/cut-{blonde-amber,layton,angels-share,side-effect}.png. Original staged JPGs kept as fallback.
- Home: Intro (ink curtain, stacked words) → Hero (world bg animates with active product, 3-line headline, 4 floating cutouts with mouse parallax + float, pill selector, price + Add to bag/Discover) → Marquee (ink, outline alternation) → Manifesto (ScrollWords scroll-scrubbed kinetic copy) → Collection "Choose your weapon." (SplitChars) + 4 sticky stacking 100svh colour chapters (ghost name type, scroll-rotating bottle, notes chips, quick-add/view) → Armoury bundle builder (toggle pills, 4 slots, total, free-shipping msg, add-all) → Atelier "Why House of the Knight?" (ink, tilted polaroid, 3 numbered reasons) → Quotes marquee (amber, sample reviews) → Footer (ink, giant wordmark, newsletter pill).
- Product page: colour-world stage with floating cutout + ghost type, cream detail card (pill qty, add-to-bag with live total, story, NotesPyramid pills), "The other three" world-tinted related cards.
- Header: floating glass pill nav (Collection / Armoury / The House → #collection #armoury #house), ink cart pill with count. Login left panel = Side Effect world. Cart drawer + checkout thumbnails use world-tinted cutouts.
- Reveal.js: MaskLines, FadeUp, SplitChars, ScrollWords, EASE. NotesAtlas.js now only exports NotesPyramid.
- Tested via testing_agent (frontend, iteration_2.json): 95% → fixed hero bottle/headline overlap (headline capped at min(8.6vw,19svh), stage moved to left-48%). Intro curtain shows once per session (sessionStorage) — by design.


- Prices (₹18,500 / 16,500 / 17,500 / 16,000), scent notes, taglines, stories, stock 50 each, free shipping over ₹15,000 else ₹500, footer contact email (now concierge@houseoftheknight.com placeholder)

## Backlog
- P0: Payment gateway (Razorpay/Stripe); owner Gmail in ADMIN_GOOGLE_EMAILS
- P1: Order confirmation emails, coupon codes, wishlist, image upload in admin, wire newsletter signup to backend/email provider
- P2: Gift wrapping/engraving, reviews, SEO
- P2 (new): a11y/perf pass on sticky chapters for mobile; wire Quotes to real reviews; swap sample quotes before launch
