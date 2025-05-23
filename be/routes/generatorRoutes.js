const express = require('express');
const router = express.Router();
const generatorController = require('../controllers/generatorController');
const { auth, isAdmin } = require('../middleware/auth');

// Admin only routes
router.post('/', auth, isAdmin, generatorController.createGenerator);
router.patch('/:id', auth, isAdmin, generatorController.updateGenerator);

// Protected routes
router.get('/', auth, generatorController.getGenerators);
router.get('/:id', auth, generatorController.getGenerator);

module.exports = router; 