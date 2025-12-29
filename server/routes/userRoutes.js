// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { uploadAvatar } = require("../middleware/upload");
const validate = require("../middleware/validate");
const { addressValidation, mongoIdValidation } = require("../utils/validators");

// All routes require authentication
router.use(protect);

// Profile routes
router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.patch("/profile/avatar", uploadAvatar, userController.updateAvatar);
router.delete("/profile/avatar", userController.deleteAvatar);

// Address routes
router.get("/addresses", userController.getAddresses);
router.post(
  "/addresses",
  validate(addressValidation),
  userController.addAddress
);
router.put(
  "/addresses/:addressId",
  validate(addressValidation),
  userController.updateAddress
);
router.delete("/addresses/:addressId", userController.deleteAddress);
router.patch("/addresses/:addressId/default", userController.setDefaultAddress);

// Preferences
router.get("/preferences", userController.getPreferences);
router.put("/preferences", userController.updatePreferences);

// Order history (quick access)
router.get("/orders", userController.getUserOrders);

// Account management
router.post("/deactivate", userController.deactivateAccount);
router.delete("/delete", userController.deleteAccount);

// Notifications
router.get("/notifications", userController.getNotifications);
router.patch(
  "/notifications/:notificationId/read",
  userController.markNotificationRead
);
router.patch(
  "/notifications/read-all",
  userController.markAllNotificationsRead
);

module.exports = router;
