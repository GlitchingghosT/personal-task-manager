import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { login, me, register } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/errorHandler";

const router = Router();
const email = z.string().trim().toLowerCase().email("Enter a valid email address.").max(254);
const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128)
  .refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
    message: "Password must be 72 UTF-8 bytes or fewer.",
  });
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: "RATE_LIMITED",
        message: "Too many authentication attempts. Try again later.",
      },
    });
  },
});

router.post(
  "/register",
  authLimiter,
  validateBody(
    z
      .object({
        name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
        email,
        password,
      })
      .strict(),
  ),
  register,
);
router.post(
  "/login",
  authLimiter,
  validateBody(z.object({ email, password }).strict()),
  login,
);
router.get("/me", requireAuth, me);

export default router;
