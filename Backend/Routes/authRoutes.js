const express = require("express");
const router = express.Router();
const {
  signUp,
  me,
  logout,
  login,
  forgotPassword,
  resetPassword,
} = require("../Controller/authController");
const authMiddleware = require("../Middleware/authMiddleware");
const rateLimit = require("express-rate-limit");
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
router.post("/signup", signUp);
router.post("/login", authLimiter, login);
router.get("/me", authMiddleware, me);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
module.exports = router;
