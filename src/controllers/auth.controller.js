import prisma from "../config/db.js";
import { comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

import { logEvent } from "../services/audit.service.js";
import { getRequestInfo } from "../middlewares/audit.middleware.js";

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 5 * 60 * 1000;

const isProduction = process.env.NODE_ENV === "production";

export const login = async (req, res) => {
  const { email, password } = req.body;
  const { ipAddress } = getRequestInfo(req);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      await logEvent({
        action: "LOGIN_FAIL",
        entity: "Auth",
        ipAddress,
        details: `Usuario no encontrado: ${email}`,
      });

      if (req.isWeb) {
        return res.status(401).render("auth/login", {
          csrfToken: req.csrfToken?.(),
          error: "Credenciales inválidas",
        });
      }

      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    if (user.lockUntil && user.lockUntil < new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lockUntil: null, failedAttempts: 0 },
      });

      user.lockUntil = null;
      user.failedAttempts = 0;
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      await logEvent({
        userId: user.id,
        action: "LOGIN_FAIL",
        entity: "Auth",
        ipAddress,
        details: "Cuenta bloqueada por intentos fallidos",
      });

      if (req.isWeb) {
        return res.status(403).render("auth/login", {
          csrfToken: req.csrfToken?.(),
          error: "Cuenta bloqueada. Intenta más tarde.",
        });
      }

      return res.status(403).json({ error: "Cuenta bloqueada" });
    }

    const valid = await comparePassword(password, user.password);

    if (!valid) {
      const attempts = (user.failedAttempts || 0) + 1;

      const updateData = { failedAttempts: attempts };

      if (attempts >= MAX_ATTEMPTS) {
        updateData.lockUntil = new Date(Date.now() + LOCK_TIME);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      await logEvent({
        userId: user.id,
        action: "LOGIN_FAIL",
        entity: "Auth",
        ipAddress,
        details: `Intento fallido #${attempts}`,
      });

      if (req.isWeb) {
        return res.status(401).render("auth/login", {
          csrfToken: req.csrfToken?.(),
          error: "Credenciales inválidas",
        });
      }

      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockUntil: null,
        lastLogin: new Date(),
      },
    });

    const token = generateToken({
      id: user.id,
      role: user.role.name,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });

    res.cookie("lastActivity", Date.now(), {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    await logEvent({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      entity: "Auth",
      ipAddress,
    });

    if (req.isWeb) {
      return res.redirect("/dashboard");
    }

    return res.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
      },
    });

  } catch (error) {
    console.error(error);

    if (req.isWeb) {
      return res.status(500).render("auth/login", {
        csrfToken: req.csrfToken?.(),
        error: "Error interno",
      });
    }

    return res.status(500).json({ error: "Error en login" });
  }
};