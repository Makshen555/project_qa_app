import * as userService from "../services/user.service.js";
import prisma from "../config/db.js";
import { logEvent } from "../services/audit.service.js";
import { getRequestInfo } from "../middlewares/audit.middleware.js";

export const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    const formatted = users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role.name,
      lastLogin: u.lastLogin,
      permissions: u.role.name,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
};

export const createUser = async (req, res) => {
  const { ipAddress } = getRequestInfo(req);

  try {
    const user = await userService.createUser(req.body);

    await logEvent({
      userId: req.user.id,
      action: "CREATE_USER",
      entity: "User",
      entityId: user.id,
      ipAddress,
    });

    // 🚫 NO devolver password
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role.name,
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { ipAddress } = getRequestInfo(req);
  const userId = Number(req.params.id);

  try {
    const oldUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    const updatedUser = await userService.updateUser(userId, req.body);

    // 🔍 Detectar cambio de rol
    if (req.body.roleId && oldUser.roleId !== req.body.roleId) {
      await logEvent({
        userId: req.user.id,
        action: "ROLE_CHANGE",
        entity: "User",
        entityId: userId,
        ipAddress,
        details: `Cambio de rol de ${oldUser.roleId} a ${req.body.roleId}`,
      });
    }

    await logEvent({
      userId: req.user.id,
      action: "UPDATE_USER",
      entity: "User",
      entityId: userId,
      ipAddress,
    });

    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role.name,
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { ipAddress } = getRequestInfo(req);
  const userId = Number(req.params.id);

  try {
    await userService.deleteUser(userId);

    await logEvent({
      userId: req.user.id,
      action: "DELETE_USER",
      entity: "User",
      entityId: userId,
      ipAddress,
    });

    res.json({ message: "Usuario eliminado" });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};