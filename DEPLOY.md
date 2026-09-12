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
- Framework preset **Vite** (`frontend/vercel.json` sets the build and the SPA
  rewrites — without those, loading `/checkout` or `/orders` directly 404s)
- Environment variable **`VITE_API_URL`** = your Render URL, no trailing slash

**Both must be HTTPS.** In production the auth cookie is `Secure` + `SameSite=None`
because the API and the site are on different domains. Over plain HTTP, or with
`NODE_ENV` unset, the browser silently drops it and nobody can stay logged in.

After both are up, run the checks against the live API:

```bash
cd backend
npx tsx src/scripts/checkSetup.ts
```

Then seed the catalog once (see below), and create an admin with `createUser.ts`.

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
cp .env.example .env
# set VITE_API_URL=https://api.yourdomain.com
npm install
npm run build       # outputs dist/
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
