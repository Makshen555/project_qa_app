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
  "/users",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  roleWebMiddleware(["SUPERADMIN", "AUDITOR", "REGISTRADOR"]),
  csrfProtection,
  async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        include: { role: true },
        orderBy: { id: "asc" },
      });

      const formattedUsers = users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role.name,
        permissions: u.role.name,
        lastLogin: u.lastLogin,
      }));

      const canCreate = req.user.role === "SUPERADMIN";
      const canManage = req.user.role === "SUPERADMIN";

      return res.render("users/index", {
        user: req.user,
        csrfToken: req.csrfToken(),
        users: formattedUsers,
        canCreate,
        canManage,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).render("errors/500", {
        message: "Error cargando usuarios",
      });
    }
  }
);

router.get(
  "/users/create",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  roleWebMiddleware(["SUPERADMIN"]),
  csrfProtection,
  async (req, res) => {
    try {
      const roles = await prisma.role.findMany({
        orderBy: { id: "asc" },
      });

      return res.render("users/create", {
        user: req.user,
        csrfToken: req.csrfToken(),
        roles,
        error: null,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).render("errors/500", {
        message: "Error cargando formulario de usuario",
      });
    }
  }
);

router.post(
  "/users/create",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  roleWebMiddleware(["SUPERADMIN"]),
  csrfProtection,
  async (req, res) => {
    try {
      const { username, email, password, roleId } = req.body;
      const { ipAddress } = getRequestInfo(req);

      const { createUser } = await import("../services/user.service.js");
      const newUser = await createUser({ username, email, password, roleId });

      await logEvent({
        userId: req.user.id,
        action: "CREATE_USER",
        entity: "User",
        entityId: newUser.id,
        ipAddress,
        details: `Usuario creado desde interfaz web: ${newUser.email}`,
      });

      return res.redirect("/users");
    } catch (error) {
      const roles = await prisma.role.findMany({
        orderBy: { id: "asc" },
      });

      return res.status(400).render("users/create", {
        user: req.user,
        csrfToken: req.csrfToken(),
        roles,
        error: error.message || "Error creando usuario",
      });
    }
  }
);

router.get(
  "/users/:id/edit",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  roleWebMiddleware(["SUPERADMIN"]),
  csrfProtection,
  async (req, res) => {
    try {
      const userId = Number(req.params.id);

      if (Number.isNaN(userId)) {
        return res.status(404).render("errors/404", {
          message: "Usuario no encontrado",
        });
      }

      const editableUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!editableUser) {
        return res.status(404).render("errors/404", {
          message: "Usuario no encontrado",
        });
      }

      const roles = await prisma.role.findMany({
        orderBy: { id: "asc" },
      });

      return res.render("users/edit", {
        currentUser: req.user,
        csrfToken: req.csrfToken(),
        editableUser,
        roles,
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
  "/users/:id/edit",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  roleWebMiddleware(["SUPERADMIN"]),
  csrfProtection,
  async (req, res) => {
    try {
      const { username, email, password, roleId } = req.body;
      const { ipAddress } = getRequestInfo(req);

      const oldUser = await prisma.user.findUnique({
        where: { id: Number(req.params.id) },
      });

      const { updateUser } = await import("../services/user.service.js");

      const payload = { username, email, roleId };
      if (password) payload.password = password;

      await updateUser(req.params.id, payload);

      await logEvent({
        userId: req.user.id,
        action: "UPDATE_USER",
        entity: "User",
        entityId: Number(req.params.id),
        ipAddress,
        details: "Usuario actualizado desde interfaz web",
      });

      if (oldUser && Number(oldUser.roleId) !== Number(roleId)) {
        await logEvent({
          userId: req.user.id,
          action: "ROLE_CHANGE",
          entity: "User",
          entityId: Number(req.params.id),
          ipAddress,
          details: `Cambio de rol de ${oldUser.roleId} a ${roleId}`,
        });
      }

      return res.redirect("/users");
    } catch (error) {
      const editableUser = await prisma.user.findUnique({
        where: { id: Number(req.params.id) },
      });

      const roles = await prisma.role.findMany({
        orderBy: { id: "asc" },
      });

      return res.status(400).render("users/edit", {
        currentUser: req.user,
        csrfToken: req.csrfToken(),
        editableUser,
        roles,
        error: error.message || "Error actualizando usuario",
      });
    }
  }
);

router.post(
  "/users/:id/delete",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  roleWebMiddleware(["SUPERADMIN"]),
  csrfProtection,
  async (req, res) => {
    try {
      const { ipAddress } = getRequestInfo(req);

      const { deleteUser } = await import("../services/user.service.js");
      await deleteUser(req.params.id);

      await logEvent({
        userId: req.user.id,
        action: "DELETE_USER",
        entity: "User",
        entityId: Number(req.params.id),
        ipAddress,
        details: "Usuario eliminado desde interfaz web",
      });

      return res.redirect("/users");
    } catch (error) {
      console.error(error);
      return res.status(400).render("errors/500", {
        message: "Error eliminando usuario",
      });
    }
  }
);

router.get(
  "/users/:id",
  webAuthMiddleware,
  sessionTimeoutMiddleware,
  roleWebMiddleware(["SUPERADMIN", "AUDITOR", "REGISTRADOR"]),
  csrfProtection,
  async (req, res) => {
    try {
      const userId = Number(req.params.id);

      if (Number.isNaN(userId)) {
        return res.status(404).render("errors/404", {
          message: "Usuario no encontrado",
        });
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!targetUser) {
        return res.status(404).render("errors/404", {
          message: "Usuario no encontrado",
        });
      }

      return res.render("users/show", {
        user: req.user,
        csrfToken: req.csrfToken(),
        targetUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).render("errors/500", {
        message: "Error cargando detalle del usuario",
      });
    }
  }
);

export default router;