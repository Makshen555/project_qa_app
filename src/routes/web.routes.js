import { Router } from "express";
import { csrfProtection } from "../middlewares/csrf.middleware.js";

import { login } from "../controllers/auth.controller.js";
import { webAuthMiddleware } from "../middlewares/webAuth.middleware.js";

const router = Router();

router.get("/", (req, res) => {
  res.redirect("/login");
});

router.get("/login", csrfProtection, (req, res) => {
  res.render("auth/login", {
    csrfToken: req.csrfToken(),
    error: null,
  });
});

router.post("/login", csrfProtection, async (req, res) => {
  req.isWeb = true;
  await login(req, res);
});

router.post(
  "/logout",
  webAuthMiddleware,
  csrfProtection,
  (req, res) => {
    res.clearCookie("token");
    res.clearCookie("lastActivity");
    res.clearCookie("_csrf");

    res.redirect("/login");
  }
);

export default router;