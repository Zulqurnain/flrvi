const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');
const { protect, authorize } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');
const { adminAuth, loginAdmin, getProfile, changePassword, PERMISSIONS } = require('../../middleware/adminAuth');

// Admin authentication routes (no auth required)
router.post('/login', loginAdmin);

// Protected admin routes
router.get('/profile', adminAuth(), getProfile);
router.post('/change-password', adminAuth(), changePassword);

// Legacy routes (keeping for backward compatibility)
// Protect all admin routes with authentication and admin authorization
router.use(protect);
router.use(authorize(['admin']));
router.use(admin);

// @route   GET /api/v1/admin/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/users', adminController.getAllUsers);

// @route   DELETE /api/v1/admin/users/:id
// @desc    Delete a user (Admin only)
// @access  Private (Admin)
router.delete('/users/:id', adminController.deleteUser);

// @route   GET /api/v1/admin/dashboard/stats
// @desc    Get dashboard statistics (Admin only)
// @access  Private (Admin)
router.get('/dashboard/stats', adminController.getDashboardStats);

// @route   GET /api/v1/admin/stats/summary
// @desc    Get dashboard statistics summary (Admin only)
// @access  Private (Admin)
router.get('/stats/summary', adminController.getDashboardStats);

// @route   GET /api/v1/admin/stats/user-growth
// @desc    Get user growth statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/user-growth', adminController.getUserGrowthStats);

// @route   GET /api/v1/admin/stats/revenue
// @desc    Get revenue statistics (Admin only)
// @access  Private (Admin)
router.get('/stats/revenue', adminController.getRevenueStats);

module.exports = router;