const Generator = require('../models/generator');
const MainContainer = require('../models/mainContainer');
const MainFuelEntry = require('../models/MainFuelEntry');
const GeneratorFuelTransfer = require('../models/GeneratorFuelTransfer');
const RunLog = require('../models/runLog');
const { notifyAdmin } = require('../utils/emailService');

const addMainContainerFuel = async (req, res) => {
    try {
        const { quantity, rate, amount, receivedBy, receivingUnitName, receivingUnitLocation, supplyingUnitName, supplyingUnitLocation } = req.body;
        const adminUser = req.user;  // Admin user from auth middleware

        const mainContainer = await MainContainer.findOne();
        if (!mainContainer) {
            return res.status(404).json({ error: 'Main container not found' });
        }

        const transaction = await MainFuelEntry.create({
            quantity,
            rate,
            amount: Number(amount).toFixed(2), // Ensure amount is rounded to 2 decimal places
            receivedBy,
            receivingUnitName,
            receivingUnitLocation,
            supplyingUnitName,
            supplyingUnitLocation,
            worker: adminUser._id
        });

        mainContainer.currentFuel = Number((mainContainer.currentFuel + quantity).toFixed(2));
        mainContainer.lastRefillDate = new Date();
        await mainContainer.save();

        await notifyAdmin('main_entry', {
            amount: quantity,
            workerName: adminUser.name
        });

        res.json({ success: true, transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const transferFuelToGenerator = async (req, res) => {
    try {
        const { generatorId, amount } = req.body;
        const adminUser = req.user;

        const mainContainer = await MainContainer.findOne();
        if (!mainContainer || mainContainer.currentFuel < amount) {
            return res.status(400).json({ error: 'Insufficient fuel in main container' });
        }

        const generator = await Generator.findById(generatorId);
        if (!generator) {
            return res.status(404).json({ error: 'Generator not found' });
        }

        if (generator.currentFuel + amount > generator.capacity) {
            return res.status(400).json({ error: 'Generator capacity exceeded' });
        }

        const transaction = await GeneratorFuelTransfer.create({
            amount,
            fromContainer: mainContainer._id,
            toGenerator: generator._id,
            worker: adminUser._id
        });

        mainContainer.currentFuel -= amount;
        await mainContainer.save();

        generator.currentFuel += amount;
        await generator.save();

        await notifyAdmin('to_generator', {
            amount,
            generatorName: generator.name,
            workerName: adminUser.name
        });

        res.json({ success: true, transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addRunLog = async (req, res) => {
    try {
        const { generatorId, startTime, endTime } = req.body;
        const worker = req.user;

        const generator = await Generator.findById(generatorId);
        if (!generator) {
            return res.status(404).json({ error: 'Generator not found' });
        }

        const duration = Math.round((new Date(endTime) - new Date(startTime)) / 60000); // minutes
        const fuelConsumed = Number(((duration / 60) * generator.fuelEfficiency).toFixed(2));

        if (generator.currentFuel < fuelConsumed) {
            return res.status(400).json({ error: 'Insufficient fuel in generator' });
        }

        const runLog = await RunLog.create({
            generator: generator._id,
            worker: worker._id,
            startTime,
            endTime,
            duration,
            fuelConsumed
        });

        generator.currentFuel -= fuelConsumed;
        generator.currentFuel = Number(generator.currentFuel.toFixed(2));
        await generator.save();

        await notifyAdmin('run_log', {
            generatorName: generator.name,
            duration,
            fuelConsumed,
            workerName: worker.name
        });

        res.json({ success: true, runLog });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// For admin dashboard
const getStats = async (req, res) => {
    try {
        const generators = await Generator.find().populate('operator');
        const mainContainer = await MainContainer.findOne();

        const mainEntries = await MainFuelEntry.find()
            .sort('-createdAt')
            .limit(10)
            .populate('worker', 'name');

        const generatorTransfers = await GeneratorFuelTransfer.find()
            .sort('-createdAt')
            .limit(10)
            .populate('worker', 'name')
            .populate('toGenerator', 'name');

        // Combine and re-sort transactions
        const recentTransactions = [...mainEntries, ...generatorTransfers]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 10);
            
        const recentRunLogs = await RunLog.find()
            .sort('-createdAt')
            .limit(10)
            .populate('generator worker');

        res.json({
            generators,
            mainContainer,
            recentTransactions,
            recentRunLogs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getHistory = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const mainEntries = await MainFuelEntry.find(query)
            .populate('worker', 'name');

        const generatorTransfers = await GeneratorFuelTransfer.find(query)
            .populate('worker', 'name')
            .populate('toGenerator', 'name');

        const transactions = [...mainEntries, ...generatorTransfers]
            .sort((a, b) => b.createdAt - a.createdAt);

        const runLogs = await RunLog.find(query)
            .sort('-createdAt')
            .populate('generator', 'name')
            .populate('worker', 'name');

        res.json({
            transactions,
            runLogs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// For worker dashboard - get worker's own history
const getWorkerHistory = async (req, res) => {
    try {
        const workerId = req.user._id;
        const { startDate, endDate } = req.query;
        
        const query = { worker: workerId };
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Get worker's run logs
        const runLogs = await RunLog.find(query)
            .sort('-createdAt')
            .limit(20)
            .populate('generator', 'name');

        res.json({
            runLogs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Main Container Management
const createMainContainer = async (req, res) => {
    try {
        const { capacity } = req.body;

        // Check if main container already exists
        const existingContainer = await MainContainer.findOne();
        if (existingContainer) {
            return res.status(400).json({ error: 'Main container already exists. Use update instead.' });
        }

        const mainContainer = new MainContainer({
            capacity,
            currentFuel: 0
        });

        await mainContainer.save();
        res.status(201).json(mainContainer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateMainContainer = async (req, res) => {
    try {
        const { capacity } = req.body;

        const mainContainer = await MainContainer.findOne();
        if (!mainContainer) {
            return res.status(404).json({ error: 'Main container not found' });
        }

        if (capacity && capacity < mainContainer.currentFuel) {
            return res.status(400).json({ error: 'New capacity cannot be less than current fuel level' });
        }

        if (capacity) {
            mainContainer.capacity = capacity;
        }

        await mainContainer.save();
        res.json(mainContainer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addMainContainerFuel,
    transferFuelToGenerator,
    addRunLog,
    getStats,
    getHistory,
    getWorkerHistory,
    createMainContainer,
    updateMainContainer
}; 