// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect } = require("../middleware/auth");
const { isAdmin, isAdminOrModerator } = require("../middleware/admin");
const validate = require("../middleware/validate");
const { mongoIdValidation } = require("../utils/validators");

// User routes (require authentication)
router.use(protect);

router.get("/", orderController.getMyOrders);
router.get("/:id", validate(mongoIdValidation), orderController.getOrderById);
router.get("/number/:orderNumber", orderController.getOrderByNumber);
router.post(
  "/:id/cancel",
  validate(mongoIdValidation),
  orderController.cancelOrder
);
router.post(
  "/:id/return",
  validate(mongoIdValidation),
  orderController.requestReturn
);

// Admin routes
router.get("/admin/all", isAdminOrModerator, orderController.getAllOrders);
router.get("/admin/stats", isAdminOrModerator, orderController.getOrderStats);
router.put(
  "/admin/:id/status",
  isAdminOrModerator,
  validate(mongoIdValidation),
  orderController.updateOrderStatus
);
router.put(
  "/admin/:id/tracking",
  isAdminOrModerator,
  validate(mongoIdValidation),
  orderController.updateTracking
);
router.post(
  "/admin/:id/refund",
  isAdmin,
  validate(mongoIdValidation),
  orderController.refundOrder
);
router.put(
  "/admin/:id/notes",
  isAdminOrModerator,
  validate(mongoIdValidation),
  orderController.updateInternalNotes
);

// Export orders
router.get("/admin/export", isAdminOrModerator, orderController.exportOrders);

module.exports = router;
