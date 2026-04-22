import { Router } from "express";
import { getLogs } from "../controllers/audit.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { sessionTimeoutMiddleware } from "../middlewares/session.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  sessionTimeoutMiddleware,
  roleMiddleware(["SUPERADMIN"]),
  getLogs
);

export default router;