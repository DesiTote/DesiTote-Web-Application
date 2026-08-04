import express from "express";
import cors from "cors";
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



const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
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
