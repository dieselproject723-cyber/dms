const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, isAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.patch('/profile', auth, authController.updateProfile);
router.post('/change-password', auth, authController.changePassword);

// Admin only routes
router.get('/workers', auth, isAdmin, authController.getWorkers);
router.patch('/user-role', auth, isAdmin, authController.updateUserRole);

module.exports = router; 