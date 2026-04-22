import { Router } from "express";
import { csrfProtection } from "../middlewares/csrf.middleware.js";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { sessionTimeoutMiddleware } from "../middlewares/session.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  sessionTimeoutMiddleware,
  roleMiddleware(["SUPERADMIN"]),
  getUsers
);

router.post(
  "/",
  authMiddleware,
  sessionTimeoutMiddleware,
  csrfProtection,
  roleMiddleware(["SUPERADMIN"]),
  createUser
);

router.put(
  "/:id",
  authMiddleware,
  sessionTimeoutMiddleware,
  csrfProtection,
  roleMiddleware(["SUPERADMIN"]),
  updateUser
);

router.delete(
  "/:id",
  authMiddleware,
  sessionTimeoutMiddleware,
  csrfProtection,
  roleMiddleware(["SUPERADMIN"]),
  deleteUser
);

export default router;