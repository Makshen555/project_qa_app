import { Router } from "express";
import prisma from "../config/db.js";

import { webAuthMiddleware } from "../middlewares/webAuth.middleware.js";
import { sessionTimeoutMiddleware } from "../middlewares/session.middleware.js";
import { csrfProtection } from "../middlewares/csrf.middleware.js";

const router = Router();

router.get(
  "/dashboard",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  csrfProtection,
  async (req, res) => {
    try {
      const { role } = req.user;

      if (role === "SUPERADMIN") {
        const logsCount = await prisma.auditLog.count();
        const usersCount = await prisma.user.count();
        const productsCount = await prisma.product.count();

        const lastLogs = await prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { user: true },
        });

        return res.render("dashboard/superadmin", {
          user: req.user,
          csrfToken: req.csrfToken(),
          stats: {
            logsCount,
            usersCount,
            productsCount,
          },
          logs: lastLogs,
        });
      }

      if (role === "REGISTRADOR") {
        const productsCount = await prisma.product.count();

        return res.render("dashboard/registrador", {
          user: req.user,
          csrfToken: req.csrfToken(),
          stats: {
            productsCount,
          },
        });
      }

      if (role === "AUDITOR") {
        const usersCount = await prisma.user.count();
        const productsCount = await prisma.product.count();

        return res.render("dashboard/auditor", {
          user: req.user,
          csrfToken: req.csrfToken(),
          stats: {
            usersCount,
            productsCount,
          },
        });
      }

      return res.status(403).render("errors/403", {
        message: "Acceso denegado",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).render("errors/500", {
        message: "Error cargando el dashboard",
      });
    }
  }
);

export default router;