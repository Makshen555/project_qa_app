import { logEvent } from "../services/audit.service.js";
import { getRequestInfo } from "./audit.middleware.js";

export const roleMiddleware = (roles) => {
  return async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {

      const { ipAddress } = getRequestInfo(req);

      await logEvent({
        userId: req.user?.id || null,
        action: "ACCESS_DENIED",
        entity: req.originalUrl,
        ipAddress,
        details: `Intento sin permiso - Rol: ${req.user?.role || "NO AUTH"}`,
      });

      if (req.isWeb || req.headers.accept?.includes("text/html")) {
        return res.status(403).render("errors/403", {
          message: "No tienes permisos para acceder a este recurso",
        });
      }

      return res.status(403).json({ message: "Acceso denegado" });
    }

    next();
  };
};