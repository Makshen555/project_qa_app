const MAX_IDLE_TIME = 5 * 60 * 1000;

const isProduction = process.env.NODE_ENV === "production";

export const sessionTimeoutMiddleware = (req, res, next) => {
  try {
    const lastActivity = req.cookies?.lastActivity;
    const wantsHtml = req.headers.accept?.includes("text/html");

    if (!lastActivity) {
      if (wantsHtml) {
        return res.status(401).render("errors/session-expired", {
          message: "Sesión inválida o expirada",
        });
      }

      return res.status(401).json({ message: "Sesión no válida" });
    }

    const now = Date.now();
    const diff = now - Number(lastActivity);

    if (diff > MAX_IDLE_TIME) {
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      };

      res.clearCookie("token", cookieOptions);
      res.clearCookie("lastActivity", cookieOptions);
      res.clearCookie("_csrf", cookieOptions);

      if (wantsHtml) {
        return res.status(401).render("errors/session-expired", {
          message: "Sesión expirada por inactividad",
        });
      }

      return res.status(401).json({
        message: "Sesión expirada por inactividad",
      });
    }

    res.cookie("lastActivity", now, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error validando sesión" });
  }
};