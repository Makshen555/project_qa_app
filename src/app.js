import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import auditRoutes from "./routes/audit.routes.js";

import webRoutes from "./routes/web.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import webUserRoutes from "./routes/web.user.routes.js";
import webProductRoutes from "./routes/web.product.routes.js";
import webAuditRoutes from "./routes/web.audit.routes.js";

import { errorMiddleware } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  helmet({
    frameguard: { action: "deny" },
    noSniff: true,
    referrerPolicy: { policy: "no-referrer" },
    hsts:
      process.env.NODE_ENV === "production"
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// RUTAS WEB
app.use("/", webRoutes);
app.use("/", dashboardRoutes);
app.use("/", webUserRoutes);
app.use("/", webProductRoutes);
app.use("/", webAuditRoutes);

// RUTAS API
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/audit", auditRoutes);

// 404 WEB/API
app.use((req, res) => {
  const wantsHtml = req.headers.accept?.includes("text/html");

  if (wantsHtml) {
    return res.status(404).render("errors/404", {
      message: "La ruta solicitada no existe",
    });
  }

  return res.status(404).json({
    error: "Ruta no encontrada",
  });
});

// ERROR GLOBAL
app.use(errorMiddleware);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});