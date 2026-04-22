import { Router } from "express"; 
import { login } from "../controllers/auth.controller.js";
import { csrfProtection } from "../middlewares/csrf.middleware.js";

const router = Router();

router.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

router.post("/login", csrfProtection, login);

export default router;