// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");
const { isAdmin } = require("../middleware/admin");

// Webhook route (no auth required, uses Razorpay signature)
router.post("/webhook", express.json(), paymentController.handleWebhook);

// Public route - get Razorpay config
router.get("/config", paymentController.getConfig);

// Protected routes
router.use(protect);

// Create Razorpay order
router.post("/create-order", paymentController.createOrder);

// Create COD order
router.post("/create-cod-order", paymentController.createCODOrder);

// Verify payment after completion
router.post("/verify", paymentController.verifyPayment);

// Handle payment failure
router.post("/failure", paymentController.handlePaymentFailure);

// Retry failed payment
router.post("/retry/:orderId", paymentController.retryPayment);

// Create payment link
router.post("/payment-link", paymentController.createPaymentLink);

// Get payment details
router.get("/payment/:paymentId", paymentController.getPaymentDetails);

// Verify UPI VPA
router.post("/verify-vpa", paymentController.verifyVPA);

// Refund routes
router.post("/refund/:orderId", paymentController.initiateRefund);
router.get("/refund/:paymentId/:refundId", paymentController.getRefundStatus);

// Admin routes
router.get("/admin/payments", isAdmin, paymentController.getAllPayments);

module.exports = router;
