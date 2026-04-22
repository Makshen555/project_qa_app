import { Router } from "express";
import prisma from "../config/db.js";

import { webAuthMiddleware } from "../middlewares/webAuth.middleware.js";
import { sessionTimeoutMiddleware } from "../middlewares/session.middleware.js";
import { roleWebMiddleware } from "../middlewares/roleWeb.middleware.js";
import { csrfProtection } from "../middlewares/csrf.middleware.js";

const router = Router();

router.get(
  "/audit",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  roleWebMiddleware(["SUPERADMIN"]),
  csrfProtection,
  async (req, res) => {
    try {
      const logs = await prisma.auditLog.findMany({
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
      });

      return res.render("audit/index", {
        user: req.user,
        csrfToken: req.csrfToken(),
        logs,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).render("errors/500", {
        message: "Error cargando auditoría",
      });
    }
  }
);

export default router;