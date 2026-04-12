import dotenv from "dotenv";
import path from "path";

// Works for both ts-node (src/) and compiled (dist/src/)
const envPath = path.resolve(__dirname, "../.env");
const envPathAlt = path.resolve(__dirname, "../../.env");
dotenv.config({ path: require("fs").existsSync(envPath) ? envPath : envPathAlt });

import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectMongoDB from "./config/mongodb";
import sequelize from "./config/db";

import userRoutes from "./routes/user.Routes";
import orderRoutes from "./routes/order.Routes";
import paymentRoutes from "./routes/payment.Routes";
import productItemsRoutes from "./routes/productItems.Routes";
import quizRoutes from "./routes/quiz.Routes";
import skinAnalysisRoutes from "./routes/skinAnalysis.Routes";
import cartRoutes from "./routes/cart.Routes";
import wishlistRoutes from "./routes/wishlist.Routes";
import reviewRoutes from "./routes/review.Routes";
import couponRoutes from "./routes/coupon.Routes";
import newsletterRoutes from "./routes/newsletter.Routes";
import addressRoutes from "./routes/address.Routes";
import returnRequestRoutes from "./routes/returnRequest.Routes";
import analyticsRoutes from "./routes/analytics.Routes";
import giftCardRoutes from "./routes/giftCard.Routes";
import supportTicketRoutes from "./routes/supportTicket.Routes";
import imageRoutes from "./routes/image.Routes";
import seedIfEmpty from "./scripts/initmongodb";
import { startAbandonedCartScheduler } from "./services/abandonedCartService";
import { initRedis } from "./services/redisCache";
import logger from "./utils/logger";

// Import Sequelize models so they are synced
import "./models/address";
import "./models/returnRequest";
import "./models/supportTicket";

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === "production";

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Trust first proxy (nginx) so express-rate-limit reads X-Forwarded-For correctly
app.set("trust proxy", 1);

// Gzip compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many authentication attempts, please try again later." },
});

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:4200,http://localhost:8080").split(",").map(o => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        return callback(
          new Error(`CORS policy: Origin ${origin} not allowed`),
          false
        );
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Paystack webhook uses standard JSON body (no raw body needed)

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Sanitize MongoDB queries to prevent NoSQL injection (Express 5 compatible — req.query is read-only)
app.use((req: Request, _res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) return obj;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
    return obj;
  };
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  next();
});

// XSS protection — strip HTML tags from string fields in request body
app.use((req: Request, _res: Response, next: NextFunction) => {
  const stripTags = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]*>/g, '');
    }
    if (Array.isArray(obj)) return obj.map(stripTags);
    if (typeof obj === 'object' && obj !== null) {
      for (const key of Object.keys(obj)) {
        obj[key] = stripTags(obj[key]);
      }
    }
    return obj;
  };
  if (req.body) req.body = stripTags(req.body);
  next();
});

// CSRF protection — validate Origin/Referer for state-changing requests
app.use((req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin || req.headers.referer || '';
  const allowed = allowedOrigins.some(o => origin.startsWith(o));
  if (!origin || allowed) return next();
  res.status(403).json({ error: 'CSRF validation failed: origin not allowed.' });
});

app.get("/", (_req: Request, res: Response) => {
  res.send("Davina Beauty API is running.");
});

app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/product-items", productItemsRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/skin-analysis", skinAnalysisRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/returns", returnRequestRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/gift-cards", giftCardRoutes);
app.use("/api/support-tickets", supportTicketRoutes);
app.use("/api/images", imageRoutes);

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Auth rate limiting
app.use("/api/users/login", authLimiter);
app.use("/api/users", authLimiter);

app.get("/api/test", (_req: Request, res: Response) => {
  res.json({ message: "Front-end & back-end connected!" });
});

// Sitemap endpoint for SEO
app.get("/api/sitemap.xml", async (_req: Request, res: Response) => {
  try {
    const ProductItem = (await import("./models/productItems")).default;
    const products = await ProductItem.find().select("_id").lean();
    const baseUrl = "http://localhost:4200";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${baseUrl}/</loc><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/products</loc><priority>0.9</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/skin-type</loc><priority>0.8</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/skin-analysis</loc><priority>0.8</priority></url>\n`;

    for (const p of products) {
      xml += `  <url><loc>${baseUrl}/products/${p._id}</loc><priority>0.7</priority></url>\n`;
    }

    xml += `</urlset>`;
    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate sitemap." });
  }
});

// Health check endpoint for load balancers / Docker
app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "unhealthy" });
  }
});

// Global error handler — must be last middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // CORS errors
  if (err.message && err.message.includes("CORS")) {
    res.status(403).json({ error: err.message });
    return;
  }
  logger.error("Unhandled error", { error: err.stack || err.message || err });
  res.status(err.status || 500).json({
    error: isProd ? "Internal server error" : err.message || "Internal server error",
  });
});


(async () => {
  try {
    
    await seedIfEmpty();

    connectMongoDB();
    initRedis();

    // In production, only validate schema (no auto-alter). In dev, auto-alter.
    if (isProd) {
      await sequelize.authenticate();
      logger.info("Database connection verified.");
    } else {
      await sequelize.sync({ alter: true });
      logger.info("All tables created or updated.");
    }

    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    // Request timeout (30 seconds)
    server.setTimeout(30_000);

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        try {
          await sequelize.close();
          logger.info("Database connections closed.");
        } catch (e) {
          logger.error("Error closing DB", { error: (e as Error).message });
        }
        process.exit(0);
      });
      // Force exit after 10s if graceful shutdown fails
      setTimeout(() => process.exit(1), 10_000);
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Start abandoned cart recovery scheduler
    startAbandonedCartScheduler();
  } catch (err: any) {
    logger.error("Startup error", { error: err.message || err });
    process.exit(1);
  }
})();