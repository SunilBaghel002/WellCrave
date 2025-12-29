// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const { isAdmin, isAdminOrModerator } = require("../middleware/admin");

// All admin routes require authentication and admin privileges
router.use(protect, isAdminOrModerator);

// Dashboard
router.get("/dashboard", adminController.getDashboard);
router.get("/dashboard/overview", adminController.getDashboardOverview);

// Analytics
router.get("/analytics/revenue", adminController.getRevenueAnalytics);
router.get("/analytics/orders", adminController.getOrderAnalytics);
router.get("/analytics/products", adminController.getProductAnalytics);
router.get("/analytics/customers", adminController.getCustomerAnalytics);
router.get("/analytics/categories", adminController.getCategoryAnalytics);
router.get("/analytics/export", adminController.exportAnalytics);

// User management (admin only)
router.get("/users", isAdmin, adminController.getAllUsers);
router.get("/users/:id", isAdmin, adminController.getUserById);
router.put("/users/:id", isAdmin, adminController.updateUser);
router.patch("/users/:id/role", isAdmin, adminController.updateUserRole);
router.patch("/users/:id/status", isAdmin, adminController.toggleUserStatus);
router.delete("/users/:id", isAdmin, adminController.deleteUser);

// Inventory management
router.get("/inventory", adminController.getInventory);
router.get("/inventory/alerts", adminController.getInventoryAlerts);
router.get("/inventory/low-stock", adminController.getLowStockProducts);
router.put("/inventory/bulk-update", adminController.bulkUpdateInventory);

// Reports
router.get("/reports/sales", adminController.getSalesReport);
router.get("/reports/products", adminController.getProductReport);
router.get("/reports/customers", adminController.getCustomerReport);

// Settings (admin only)
router.get("/settings", isAdmin, adminController.getSettings);
router.put("/settings", isAdmin, adminController.updateSettings);

// Activity logs
router.get("/logs", isAdmin, adminController.getActivityLogs);

// Bulk operations
router.post("/products/bulk-update", adminController.bulkUpdateProducts);
router.post("/orders/bulk-update", adminController.bulkUpdateOrders);

module.exports = router;
