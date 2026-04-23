const MAX_IDLE_TIME = 5 * 60 * 1000; // 5 minutos

export const sessionTimeoutMiddleware = (req, res, next) => {
  try {
    const lastActivity = req.cookies?.lastActivity;
    const wantsHtml = req.headers.accept?.includes("text/html");

    // No existe cookie de actividad
    if (!lastActivity) {
      if (wantsHtml) {
        return res.status(401).render("errors/session-expired", {
          message: "Tu sesión no es válida o ya expiró.",
        });
      }

      return res.status(401).json({
        message: "Sesión no válida",
      });
    }

    const now = Date.now();
    const diff = now - Number(lastActivity);

    // Sesión expirada por inactividad
    if (diff > MAX_IDLE_TIME) {
      res.clearCookie("token");
      res.clearCookie("lastActivity");
      res.clearCookie("_csrf");

      if (wantsHtml) {
        return res.status(401).render("errors/session-expired", {
          message: "Tu sesión expiró por inactividad. Inicia sesión nuevamente.",
        });
      }

      return res.status(401).json({
        message: "Sesión expirada por inactividad",
      });
    }

    // Sesión activa -> actualizar actividad
    res.cookie("lastActivity", now, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true en producción con HTTPS
    });

    next();
  } catch (error) {
    console.error(error);

    const wantsHtml = req.headers.accept?.includes("text/html");

    if (wantsHtml) {
      return res.status(500).render("errors/500", {
        message: "Error validando la sesión",
      });
    }

    return res.status(500).json({
      message: "Error validando sesión",
    });
  }
};