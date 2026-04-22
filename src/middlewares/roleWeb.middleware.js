export const roleWebMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).render("error", {
        message: "Acceso denegado",
      });
    }

    next();
  };
};