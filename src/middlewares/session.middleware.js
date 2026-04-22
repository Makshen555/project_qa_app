const MAX_IDLE_TIME = 5 * 60 * 1000; // 5 minutos

export const sessionTimeoutMiddleware = (req, res, next) => {
  try {
    const lastActivity = req.cookies?.lastActivity;

    if (!lastActivity) {
      return res.status(401).json({ message: "Sesión no válida" });
    }

    const now = Date.now();
    const diff = now - Number(lastActivity);

    // ⛔ Sesión expirada
    if (diff > MAX_IDLE_TIME) {
      res.clearCookie("token");
      res.clearCookie("lastActivity");

      return res.status(401).json({
        message: "Sesión expirada por inactividad"
      });
    }

    // ✅ Sesión activa → actualizar actividad
    res.cookie("lastActivity", now, {
      httpOnly: true,
      sameSite: "strict"
    });

    next();

  } catch (error) {
    return res.status(500).json({
      message: "Error validando sesión"
    });
  }
};