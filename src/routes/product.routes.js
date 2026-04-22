import { Router } from "express";
import { csrfProtection } from "../middlewares/csrf.middleware.js";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { sessionTimeoutMiddleware } from "../middlewares/session.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

/**
 * ORDEN CORRECTO:
 * auth → session → csrf (solo escritura) → role → controller
 */

// 🔓 LISTAR
router.get(
  "/",
  authMiddleware,
  sessionTimeoutMiddleware,
  roleMiddleware(["SUPERADMIN", "REGISTRADOR", "AUDITOR"]),
  getProducts
);

// 🔓 VER UNO
router.get(
  "/:id",
  authMiddleware,
  sessionTimeoutMiddleware,
  roleMiddleware(["SUPERADMIN", "REGISTRADOR", "AUDITOR"]),
  getProduct
);

// 🔒 CREAR
router.post(
  "/",
  authMiddleware,
  sessionTimeoutMiddleware,
  csrfProtection,
  roleMiddleware(["SUPERADMIN", "REGISTRADOR"]),
  createProduct
);

// 🔒 EDITAR
router.put(
  "/:id",
  authMiddleware,
  sessionTimeoutMiddleware,
  csrfProtection,
  roleMiddleware(["SUPERADMIN", "REGISTRADOR"]),
  updateProduct
);

// 🔒 ELIMINAR
router.delete(
  "/:id",
  authMiddleware,
  sessionTimeoutMiddleware,
  csrfProtection,
  roleMiddleware(["SUPERADMIN"]),
  deleteProduct
);

export default router;