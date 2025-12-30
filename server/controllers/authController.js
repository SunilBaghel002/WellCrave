// controllers/authController.js
const crypto = require("crypto");
const User = require("../models/User");
const { generateToken, setTokenCookie } = require("../utils/generateToken");
const emailService = require("../services/emailService");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Register new user
exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already registered", 400));
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    authProvider: "local",
  });

  // Generate email verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send welcome email
  try {
    await emailService.sendWelcomeEmail(user);

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    await emailService.sendEmailVerification(user, verificationUrl);
  } catch (error) {
    console.error("Email sending error:", error);
  }

  // Generate token
  const token = generateToken(user);
  setTokenCookie(res, token);

  // Remove password from output
  user.password = undefined;

  res.status(201).json({
    success: true,
    message:
      "Registration successful! Please check your email to verify your account.",
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar,
    },
  });
});

// Login user
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Check if account is locked
  if (user.isLocked()) {
    return next(
      new AppError(
        "Account is temporarily locked. Please try again later.",
        423
      )
    );
  }

  // Check if user registered with OAuth
  if (user.authProvider !== "local" && !user.password) {
    return next(new AppError(`Please login with ${user.authProvider}`, 400));
  }

  // Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    await user.incrementLoginAttempts();
    return next(new AppError("Invalid email or password", 401));
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate token
  const token = generateToken(user);
  setTokenCookie(res, token);

  // Remove password from output
  user.password = undefined;

  res.json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar,
    },
  });
});

// Logout user
exports.logout = catchAsync(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// Get current user
exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.json({
    success: true,
    data: user,
  });
});

// Refresh token
exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError("Refresh token is required", 400));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return next(new AppError("Invalid refresh token", 401));
    }

    const newToken = generateToken(user);
    setTokenCookie(res, newToken);

    res.json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    return next(new AppError("Invalid refresh token", 401));
  }
});

// Forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("No user found with that email address", 404));
  }

  // Check if user registered with OAuth
  if (user.authProvider !== "local") {
    return next(
      new AppError(
        `This account uses ${user.authProvider} login. Password reset is not available.`,
        400
      )
    );
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send email
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await emailService.sendPasswordResetEmail(user, resetUrl);

    res.json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("Error sending email. Please try again later.", 500)
    );
  }
});

// Reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.params;

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  // Hash token and find user
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Generate new token
  const newToken = generateToken(user);
  setTokenCookie(res, newToken);

  res.json({
    success: true,
    message: "Password reset successful",
    token: newToken,
  });
});

// Update password (for logged in users)
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select("+password");

  // Check current password
  if (!(await user.matchPassword(currentPassword))) {
    return next(new AppError("Current password is incorrect", 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = generateToken(user);
  setTokenCookie(res, token);

  res.json({
    success: true,
    message: "Password updated successfully",
    token,
  });
});

// Verify email
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new AppError("Verification token is required", 400));
  }

  // Hash token and find user
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // Verify email
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: "Email verified successfully",
  });
});

// Resend verification email
exports.resendVerificationEmail = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.isEmailVerified) {
    return next(new AppError("Email is already verified", 400));
  }

  // Generate new verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  try {
    await emailService.sendEmailVerification(user, verificationUrl);

    res.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("Error sending email. Please try again later.", 500)
    );
  }
});

// OAuth callback handler
exports.oauthCallback = catchAsync(async (req, res) => {
  const token = generateToken(req.user);
  setTokenCookie(res, token);

  // Redirect to frontend with token
  res.redirect(`${process.env.CLIENT_URL}/oauth/callback?token=${token}`);
});
