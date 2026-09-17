import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser"
import { Response, Request, NextFunction } from "express";

import authRoutes from "./modules/auth/auth.route.js";
import cartRoutes from "./modules/cart//cart.route.js"
import wishListRoutes from "./modules/wishlist/wishlist.route.js"
import checkoutRoutes from "./modules/checkout/checkout.route.js"
import addressRoutes from "./modules/address/address.route.js"
import productRoutes from "./modules/product/product.route.js"
import orderRoutes from "./modules/order/order.route.js"
import productPublicRoutes from "./modules/product/product.public.route.js"
import dashboardRoutes from "./modules/admin dashboard/dashboard.route.js"
import adminOrderRoutes from "./modules/order/order.admin.route.js";
import adminCustomerRoutes from "./modules/customer/customer.admin.route.js";
import analyticsRoutes from "./modules/analytics/analytics.route.js"
import teamAdminRoutes from "./modules/team-members/team.admin.route.js";
import webhookRoutes from "./modules/webhooks/webhook.route.js";
import reviewRoutes from "./modules/review/review.route.js";
import subscriptRoutes from "./modules/subscription/subscription.route.js"
import returnRoutes from "./modules/return/return.route.js"



const app = express();

// Stop advertising the framework, and send the standard hardening headers on
// every response. Content-Security-Policy is left off here on purpose: this
// process only ever serves JSON, so a CSP does nothing for it — the CSP that
// matters guards the HTML pages and is set on Vercel, next to the app itself.
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: false,
    // The browser reaches this API as desitotes.com/api/* through Vercel, so
    // HSTS for the customer-facing origin is set there; a second copy here is
    // harmless defence in depth for anything hitting the Render URL directly.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/* ================= MIDDLEWARE ================= */
app.use(cookieParser());
// CLIENT_ORIGIN accepts a comma-separated list so the apex domain, the www
// subdomain and a local dev server can all be allowed at once. Read per
// request rather than at module load — see config/loadEnv.ts.
const getAllowedOrigins = () =>
  (process.env.CLIENT_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header — same-origin navigations, curl, health checks.
      if (!origin) return callback(null, true);

      const allowed = getAllowedOrigins();
      if (allowed.includes(origin)) return callback(null, true);

      // Deny by omitting the CORS headers rather than throwing. Throwing here
      // surfaced as an opaque 500, which reads like a server crash; this lets
      // the browser report a normal CORS error and leaves a log line naming
      // the exact mismatch, which is almost always a CLIENT_ORIGIN typo.
      console.warn(`[cors] blocked origin "${origin}" — CLIENT_ORIGIN allows: ${allowed.join(", ") || "(none)"}`);
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(
  express.json({
    verify: (req, res, buf) => {
      (req as any).rawBody = buf.toString("utf8");
    },
  })
);

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "APP running...",
  });
});

/* ================= AUTH ROUTES ================= */

app.use("/api/auth", authRoutes);

/* ================= CUSTOMER ROUTES ================= */

app.use("/api/cart", cartRoutes)
app.use("/api/wishlist", wishListRoutes)
app.use("/api/checkout", checkoutRoutes)
app.use("/api/address", addressRoutes)
app.use("/api/order", orderRoutes)
app.use("/api/products", productPublicRoutes)
app.use("/api/reviews", reviewRoutes);
app.use("/api/subscriptions", subscriptRoutes);
app.use("/api/orders", returnRoutes);


/* ================= ADMIN ROUTES ================= */

app.use("/api/product", productRoutes)
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/admin/team", teamAdminRoutes);


/* ================= WEBHOOK ROUTES ================= */

app.use("/api/webhooks", webhookRoutes);


/* ================= 404 HANDLER ================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ================= GLOBAL ERROR HANDLER ================= */

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  // show stack trace in development only — never expose in production
  if (process.env.NODE_ENV === "local") {
    console.error(`[ERROR] ${statusCode} - ${message}\n`, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // only include stack in dev
    ...(process.env.NODE_ENV === "local" && { stack: err.stack }),
  });
});

export default app;
