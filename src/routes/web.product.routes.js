import { Router } from "express";
import prisma from "../config/db.js";

import { webAuthMiddleware } from "../middlewares/webAuth.middleware.js";
import { sessionTimeoutMiddleware } from "../middlewares/session.middleware.js";
import { roleWebMiddleware } from "../middlewares/roleWeb.middleware.js";
import { csrfProtection } from "../middlewares/csrf.middleware.js";
import { logEvent } from "../services/audit.service.js";
import { getRequestInfo } from "../middlewares/audit.middleware.js";

const router = Router();

router.get(
  "/products",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  roleWebMiddleware(["SUPERADMIN", "REGISTRADOR", "AUDITOR"]),
  csrfProtection,
  async (req, res) => {
    try {
      const products = await prisma.product.findMany({
        orderBy: { id: "asc" },
      });

      const canCreate =
        req.user.role === "SUPERADMIN" || req.user.role === "REGISTRADOR";

      const canManage =
        req.user.role === "SUPERADMIN" || req.user.role === "REGISTRADOR";

      const canDelete = req.user.role === "SUPERADMIN";

      return res.render("products/index", {
        user: req.user,
        csrfToken: req.csrfToken(),
        products,
        canCreate,
        canManage,
        canDelete,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).render("errors/500", {
        message: "Error cargando productos",
      });
    }
  }
);

router.get(
  "/products/create",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  roleWebMiddleware(["SUPERADMIN", "REGISTRADOR"]),
  csrfProtection,
  async (req, res) => {
    return res.render("products/create", {
      user: req.user,
      csrfToken: req.csrfToken(),
      error: null,
    });
  }
);

router.get(
  "/products/:id",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  roleWebMiddleware(["SUPERADMIN", "REGISTRADOR", "AUDITOR"]),
  csrfProtection,
  async (req, res) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: Number(req.params.id) },
      });

      if (!product) {
        return res.status(404).render("errors/404", {
          message: "Producto no encontrado",
        });
      }

      return res.render("products/show", {
        user: req.user,
        csrfToken: req.csrfToken(),
        product,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).render("errors/500", {
        message: "Error cargando detalle del producto",
      });
    }
  }
);

router.post(
  "/products/create",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  roleWebMiddleware(["SUPERADMIN", "REGISTRADOR"]),
  csrfProtection,
  async (req, res) => {
    try {
      const { code, name, description, quantity, price } = req.body;
      const { ipAddress } = getRequestInfo(req);

      const { createProduct } = await import("../services/product.service.js");

      const product = await createProduct({
        code,
        name,
        description,
        quantity: Number(quantity),
        price: Number(price),
      });

      await logEvent({
        userId: req.user.id,
        action: "CREATE_PRODUCT",
        entity: "Product",
        entityId: product.id,
        ipAddress,
        details: `Producto creado desde interfaz web: ${product.name}`,
      });

      return res.redirect("/products");
    } catch (error) {
      return res.status(400).render("products/create", {
        user: req.user,
        csrfToken: req.csrfToken(),
        error: error.message || "Error creando producto",
      });
    }
  }
);

router.get(
  "/products/:id/edit",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  roleWebMiddleware(["SUPERADMIN", "REGISTRADOR"]),
  csrfProtection,
  async (req, res) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: Number(req.params.id) },
      });

      if (!product) {
        return res.status(404).render("errors/404", {
          message: "Producto no encontrado",
        });
      }

      return res.render("products/edit", {
        user: req.user,
        csrfToken: req.csrfToken(),
        product,
        error: null,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).render("errors/500", {
        message: "Error cargando formulario de edición",
      });
    }
  }
);

router.post(
  "/products/:id/edit",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  roleWebMiddleware(["SUPERADMIN", "REGISTRADOR"]),
  csrfProtection,
  async (req, res) => {
    try {
      const { code, name, description, quantity, price } = req.body;
      const { ipAddress } = getRequestInfo(req);

      const { updateProduct } = await import("../services/product.service.js");

      await updateProduct(req.params.id, {
        code,
        name,
        description,
        quantity: Number(quantity),
        price: Number(price),
      });

      await logEvent({
        userId: req.user.id,
        action: "UPDATE_PRODUCT",
        entity: "Product",
        entityId: Number(req.params.id),
        ipAddress,
        details: "Producto actualizado desde interfaz web",
      });

      return res.redirect("/products");
    } catch (error) {
      const product = await prisma.product.findUnique({
        where: { id: Number(req.params.id) },
      });

      return res.status(400).render("products/edit", {
        user: req.user,
        csrfToken: req.csrfToken(),
        product,
        error: error.message || "Error actualizando producto",
      });
    }
  }
);

router.post(
  "/products/:id/delete",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  roleWebMiddleware(["SUPERADMIN"]),
  csrfProtection,
  async (req, res) => {
    try {
      const { ipAddress } = getRequestInfo(req);

      const { deleteProduct } = await import("../services/product.service.js");
      await deleteProduct(req.params.id);

      await logEvent({
        userId: req.user.id,
        action: "DELETE_PRODUCT",
        entity: "Product",
        entityId: Number(req.params.id),
        ipAddress,
        details: "Producto eliminado desde interfaz web",
      });

      return res.redirect("/products");
    } catch (error) {
      console.error(error);
      return res.status(400).render("errors/500", {
        message: "Error eliminando producto",
      });
    }
  }
);

export default router;