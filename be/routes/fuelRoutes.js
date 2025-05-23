const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');
const { auth, isWorker, isAdmin } = require('../middleware/auth');
const { validateFuelAmount, validateRunTime, validateCapacity } = require('../middleware/validation');

// Worker routes
router.post('/generator/run-log', auth, isWorker, validateRunTime, fuelController.addRunLog);
router.get('/worker/history', auth, isWorker, fuelController.getWorkerHistory);

// Admin routes
router.post('/main-container/add', auth, isAdmin, validateFuelAmount, fuelController.addMainContainerFuel);
router.post('/main-container', auth, isAdmin, validateCapacity, fuelController.createMainContainer);
router.patch('/main-container', auth, isAdmin, fuelController.updateMainContainer);
router.post('/generator/transfer', auth, isAdmin, validateFuelAmount, fuelController.transferFuelToGenerator);
router.get('/stats', auth, isAdmin, fuelController.getStats);
router.get('/history', auth, isAdmin, fuelController.getHistory);

module.exports = router; 