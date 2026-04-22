import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const decoded = verifyToken(token);

    // ⏱️ Control de inactividad
    const now = Date.now();
    const lastActivity = req.cookies.lastActivity;

    if (lastActivity && now - lastActivity > 5 * 60 * 1000) {
      res.clearCookie("token");
      res.clearCookie("lastActivity");
      return res.status(401).json({ message: "Sesión expirada por inactividad" });
    }

    // 🔄 actualizar actividad
    res.cookie("lastActivity", now, {
      httpOnly: true,
      sameSite: "strict"
    });

    req.user = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
};