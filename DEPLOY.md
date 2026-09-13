# Deploying DesiTotes to Hostinger

This covers going from this code to a live site. Read the **Before you start**
checklist first — several third-party accounts need to exist before the site
can actually process an order.

## Before you start: accounts you need

| Service | What it's for | Where to get it |
|---|---|---|
| MongoDB | Product/order/user database | You said you already have this — get the connection string (`mongodb+srv://...`) |
| Upstash Redis | Checkout sessions, OTP codes, login rate-limiting | You said you already have this — get the REST URL + token (Upstash dashboard → REST API tab, **not** the classic `redis://` URL) |
| Razorpay | Payments | You said you already have this — get Key ID, Key Secret, and set up a webhook (see below) |
| Shiprocket | Shipping rates + shipment creation | You said you have this — you'll need the exact **pickup location nickname** and **pincode** as registered in Shiprocket → Settings → Pickup Addresses |
| AWS S3 | Product images | Create a bucket (e.g. `desitotes-media`), an IAM user with `s3:PutObject`/`s3:DeleteObject` on it, and a bucket policy allowing public read on objects (since product images are served directly from S3 URLs) |
| Resend | Transactional email (OTP, order confirmation) | Verify your sending domain in Resend (Domains → Add Domain, add the DNS records they give you) so `EMAIL_FROM` can be `orders@yourdomain.com` instead of the sandbox address |
| A domain | e.g. `desitotes.com` | Through Hostinger or wherever you already have one |

## Quick staging setup (Render + Vercel) — for client testing

Production target is Hostinger (below), but for a testable URL fast, put the API
on Render and the storefront on Vercel.

**API on Render.** New > Blueprint, point at this repo — `render.yaml` configures
the service. Fill in every value marked "sync: false" from your `.env`. Set
`CLIENT_ORIGIN` to your exact Vercel URL (e.g. `https://desi-tote-web-application.vercel.app`),
no trailing slash. Note the free tier sleeps after inactivity, so the first
request after idle takes ~30s.

**Storefront on Vercel.** In Project Settings:
- **Root Directory:** `frontend`
- Framework preset **Vite** (`frontend/vercel.json` sets the build, the SPA
  rewrites — without those, loading `/checkout` or `/orders` directly 404s —
  and the `/api/*` proxy described below)
- **No `VITE_API_URL`.** A production build always calls `/api/...` on its own
  origin. If the variable is still set from an earlier deploy, delete it; it is
  ignored in production builds and only applies to local dev.

**The browser must never talk to the API's own domain.** `vercel.app` and
`onrender.com` are separate sites, so the auth cookie was a third-party cookie —
and iOS Safari blocks those by default. Login looked like it worked and then
every request arrived signed out, which showed up as "Not authorized" when
adding to the cart. `frontend/vercel.json` therefore rewrites `/api/*` to the
Render service so the cookie is first-party. Change the Render URL there, not in
an environment variable.

**Both must still be HTTPS**, and `NODE_ENV=production` must be set on the API —
otherwise the cookie is not marked `Secure` and the browser drops it.

After both are up, run the checks against the live API:

```bash
cd backend
npx tsx src/scripts/checkSetup.ts
```

Then seed the catalog once (see below), and create an admin with `createUser.ts`.

## Pointing a GoDaddy domain at the site

GoDaddy is only the registrar and DNS host — it does not decide where the site
runs. There are two ways to use it, and they differ a lot in effort.

**Option A — point the domain at the Render + Vercel setup that is already
running.** Roughly fifteen minutes of DNS, no server to build, and it is the
same deployment the client has been testing on, so nothing new can break. In
Vercel: Project > Settings > Domains > add the domain, and Vercel shows the
exact records to create. In GoDaddy: My Products > DNS > Add record.

Two GoDaddy specifics catch people out:

- GoDaddy does not allow a CNAME on the bare domain, so the apex needs the
  **A record** Vercel gives you, with `www` as a **CNAME** to the value Vercel
  shows. Use whatever is on the Vercel Domains page, not values copied from
  elsewhere; they change.
- The **Name** field is relative. For the apex enter `@`, for the subdomain
  enter `www` — never the full `www.yourdomain.com`, or you end up with
  `www.yourdomain.com.yourdomain.com`.

One thing to fix before launch on this path: `render.yaml` sets `plan: free`,
and a free Render service sleeps after inactivity. The first customer to arrive
after a quiet spell waits about thirty seconds for the API to wake, which on a
shop reads as broken. Move the service to a paid instance, or use Option B.

**Option B — the Hostinger VPS below.** More work and more moving parts (Node,
PM2, Nginx, Certbot), but nothing sleeps and the API sits on the same machine
as the site, so the round trip is local. If you take this path, point the
GoDaddy records at the VPS IP instead: an **A record** on `@` and on `www`.

Either way, after the domain is live:

- Add the domain to `CLIENT_ORIGIN` on the API.
- Re-register the Razorpay webhook against the new domain.
- Verify the domain in Resend (below) — this is the one that blocks signups.

## Email: verifying the domain in Resend (GoDaddy DNS)

Until this is done, OTP email reaches only the Resend account owner's address,
so no customer can finish signing up — and an account is required to buy.

1. Resend > Domains > Add Domain, enter the domain.
2. Resend lists a DKIM `TXT` record, an SPF `TXT` (or `MX`) record, and
   optionally a DMARC `TXT`. Add each in GoDaddy under DNS > Add record.
   Remember the Name field is relative: enter `resend._domainkey`, not
   `resend._domainkey.yourdomain.com`.
3. Wait for Resend to show Verified. Usually minutes; GoDaddy's default TTL is
   an hour, so allow for that.
4. Set on the API:
   - `EMAIL_FROM=Desi Totes <orders@yourdomain.com>`
   - `EMAIL_REPLY_TO=` the shop's own mailbox

`EMAIL_FROM` must be on the verified domain. A Gmail, Yahoo or Outlook address
cannot be a sender — those providers do not authorise anyone else to send as
them — so the shop's everyday mailbox goes in `EMAIL_REPLY_TO`, which is what
customers reach when they reply or complain. The API refuses to send with a
free-mail `EMAIL_FROM` and says why, rather than failing silently.

Check it with `npx tsx src/scripts/checkSetup.ts` from `backend/`: it reports
which domains Resend has verified and whether `EMAIL_FROM` is one of them.

## 1. Choose a Hostinger plan

This backend needs a real, persistent Node.js process (it talks to Mongo,
Redis, Shiprocket, S3, Resend, Razorpay on every request) — **a VPS or Cloud
Hosting plan is the recommended path.** Hostinger's Business/Premium shared
hosting has a "Setup Node.js App" panel that can technically run a single
Express app too, but you get no shell access, no PM2 process management, and
more limited control — fine for a very simple app, more constrained for this
one. The steps below assume a VPS.

## 2. Set up the VPS

```bash
# SSH into your VPS, then:
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

## 3. Deploy the backend

```bash
# On the VPS
git clone <your repo, or scp the backend/ folder up> /var/www/desitotes-api
cd /var/www/desitotes-api
cp .env.example .env
nano .env   # fill in every value — see the table above
npm install
npm run build         # compiles TypeScript to dist/
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup           # follow the printed instructions so it restarts on reboot
```

Set `NODE_ENV=production` and `CLIENT_ORIGIN=https://yourdomain.com` in `.env`
— the backend's cookies are `secure`/`sameSite: none` in production, so both
the API and the site **must** be served over HTTPS or logins will silently
fail to persist.

### Seed the product catalog (one-time)

Run this once, from your own machine or the VPS, pointed at the real
database and S3 bucket (needs the `frontend/src/assets/images` folder
available locally for the image uploads):

```bash
cd backend
SEED_IMAGES_DIR="../frontend/src/assets/images" npx tsx src/scripts/seedProducts.ts
```

It's safe to re-run — anything already in the database (matched by slug) is
skipped. Afterwards, review stock counts and weight/dimensions in the admin
panel (`/admin/products`) — the seed script fills in reasonable defaults
(20 units, 0.15kg) since the original catalog never tracked exact per-item
figures.

### Nginx + HTTPS for the API

```bash
sudo cp deploy/nginx-api.conf /etc/nginx/sites-available/api.yourdomain.com
# edit the server_name if needed, then:
sudo ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.yourdomain.com
```

### Register the Razorpay webhook

In the Razorpay dashboard → Settings → Webhooks, add
`https://api.yourdomain.com/api/webhooks/razorpay` subscribed to at least
`payment.captured`, `payment.failed`, `refund.processed`, `refund.failed`.
Copy the webhook secret it gives you into `RAZORPAY_WEBHOOK_SECRET` in `.env`
and restart the app (`pm2 restart desitotes-api`).

## 4. Deploy the frontend

Build locally or on the VPS:

```bash
cd frontend
npm install
npm run build       # outputs dist/

# No VITE_API_URL needed: the build calls /api/... on its own origin, and
# deploy/nginx-frontend.conf proxies /api/ to the Node process on port 5000.
# That keeps the auth cookie first-party, which is what iOS Safari requires.
```

Upload the `dist/` folder to `/var/www/desitotes-frontend/dist` on the VPS
(scp, rsync, or a CI step), then:

```bash
sudo cp deploy/nginx-frontend.conf /etc/nginx/sites-available/yourdomain.com
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 5. Create your first admin user

There's no public "become an admin" flow (by design). Register a normal
account on the live site, then flip its role directly in the database once:

```js
// via mongosh, connected to your production database
db.users.updateOne({ email: "you@yourdomain.com" }, { $set: { role: "ADMIN" } })
```

Log out and back in on the site afterward so the new role takes effect, then
visit `/admin`.

## 6. Smoke test before telling customers it's live

- Register a customer account, verify the OTP email arrives (Resend).
- Add an item to cart, checkout with **Cash on Delivery** — confirm the order
  appears in `/admin/orders` and stock decremented in `/admin/products`.
- Checkout with **Razorpay** using a real low-value payment (or Razorpay test
  mode if you flip the keys back temporarily) — confirm the order shows
  `paid` and a shipment gets created (check the order's Shiprocket status).
- Confirm the order-confirmation email arrives.
- Try adding to cart while logged out — it should prompt login, not silently
  fail.

## Shared-hosting alternative (if you don't get a VPS)

Hostinger's hPanel → Advanced → Setup Node.js Application lets you point at
`backend/dist/server.js` as the entry file, set environment variables in its
UI (same list as `.env.example`), and it manages the Node process for you —
no PM2/Nginx config needed on your end for the API. The frontend's `dist/`
folder can be uploaded as a normal static site via File Manager or FTP to
`public_html`. This works but gives you less control if something goes wrong
(no shell access to check logs beyond what the panel exposes).
