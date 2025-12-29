// routes/authRoutes.js
const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const {
  authLimiter,
  passwordResetLimiter,
} = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
} = require("../utils/validators");

// Local auth
router.post(
  "/register",
  authLimiter,
  validate(registerValidation),
  authController.register
);
router.post(
  "/login",
  authLimiter,
  validate(loginValidation),
  authController.login
);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getMe);
router.post("/refresh-token", authController.refreshToken);

// Email verification
router.post("/verify-email", authController.verifyEmail);
router.post(
  "/resend-verification",
  protect,
  authController.resendVerificationEmail
);

// Password reset
router.post(
  "/forgot-password",
  passwordResetLimiter,
  authController.forgotPassword
);
router.patch("/reset-password/:token", authController.resetPassword);
router.patch(
  "/update-password",
  protect,
  validate(updatePasswordValidation),
  authController.updatePassword
);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
  }),
  authController.oauthCallback
);

// Facebook OAuth
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=facebook_auth_failed`,
  }),
  authController.oauthCallback
);

// Check auth status
router.get("/check", protect, (req, res) => {
  res.json({
    success: true,
    isAuthenticated: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
    },
  });
});

module.exports = router;
