export const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  const wantsHtml = req.headers.accept?.includes("text/html");

  if (err.code === "EBADCSRFTOKEN") {
    if (wantsHtml) {
      return res.status(403).render("errors/403", {
        message: "Token CSRF inválido",
      });
    }

    return res.status(403).json({
      error: "Token CSRF inválido",
    });
  }

  if (wantsHtml) {
    return res.status(err.status || 500).render("errors/500", {
      message: err.message || "Error interno del servidor",
    });
  }

  return res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
};