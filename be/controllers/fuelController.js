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
            quantity : amount,
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

        // Add type field to each transaction
        const mainEntriesWithType = mainEntries.map(entry => ({
            ...entry.toObject(),
            type: 'main_entry'
        }));

        const generatorTransfersWithType = generatorTransfers.map(transfer => ({
            ...transfer.toObject(),
            type: 'to_generator'
        }));

        // Combine and re-sort transactions
        const recentTransactions = [...mainEntriesWithType, ...generatorTransfersWithType]
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

// Get generator reports with consumption, runtime, and cost analysis
const getGeneratorReports = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};
        
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Get all main container entries to calculate weighted average rate
        const mainEntries = await MainFuelEntry.find({
            ...query,
            quantity: { $gt: 0 } // Only consider entries with fuel
        }).sort({ createdAt: 1 });

        // Calculate weighted average rate
        let totalFuel = 0;
        let totalCost = 0;
        mainEntries.forEach(entry => {
            totalFuel += entry.quantity;
            totalCost += entry.amount;
        });
        const weightedAverageRate = totalFuel > 0 ? totalCost / totalFuel : 0;

        // Get all run logs for the period
        const runLogs = await RunLog.find(query)
            .populate('generator', 'name')
            .populate('worker', 'name');

        // Get all generator transfers for the period
        const transfers = await GeneratorFuelTransfer.find(query)
            .populate('toGenerator', 'name')
            .populate('worker', 'name');

        // Get current date info for filtering
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Aggregate data by generator
        const generatorStats = {};

        // Process run logs
        runLogs.forEach(log => {
            const generatorId = log.generator._id.toString();
            if (!generatorStats[generatorId]) {
                generatorStats[generatorId] = {
                    name: log.generator.name,
                    totalRuntime: 0,
                    totalFuelConsumed: 0,
                    totalCost: 0,
                    runCount: 0,
                    averageEfficiency: 0,
                    // New fields for period-specific stats
                    runtimeThisMonth: 0,
                    runtimeThisYear: 0,
                    runtimeTotal: 0,
                    fuelConsumedThisMonth: 0,
                    fuelConsumedThisYear: 0,
                    fuelConsumedTotal: 0,
                    costThisMonth: 0,
                    costThisYear: 0,
                    costTotal: 0
                };
            }

            const logDate = new Date(log.createdAt);
            const logCost = log.fuelConsumed * weightedAverageRate;

            // Update total stats
            generatorStats[generatorId].totalRuntime += log.duration;
            generatorStats[generatorId].totalFuelConsumed += log.fuelConsumed;
            generatorStats[generatorId].totalCost += logCost;
            generatorStats[generatorId].runCount += 1;

            // Update period-specific stats
            if (logDate >= startOfMonth) {
                generatorStats[generatorId].runtimeThisMonth += log.duration;
                generatorStats[generatorId].fuelConsumedThisMonth += log.fuelConsumed;
                generatorStats[generatorId].costThisMonth += logCost;
            }
            if (logDate >= startOfYear) {
                generatorStats[generatorId].runtimeThisYear += log.duration;
                generatorStats[generatorId].fuelConsumedThisYear += log.fuelConsumed;
                generatorStats[generatorId].costThisYear += logCost;
            }
            generatorStats[generatorId].runtimeTotal += log.duration;
            generatorStats[generatorId].fuelConsumedTotal += log.fuelConsumed;
            generatorStats[generatorId].costTotal += logCost;
        });

        // Process transfers
        transfers.forEach(transfer => {
            const generatorId = transfer.toGenerator._id.toString();
            if (!generatorStats[generatorId]) {
                generatorStats[generatorId] = {
                    name: transfer.toGenerator.name,
                    totalRuntime: 0,
                    totalFuelConsumed: 0,
                    totalCost: 0,
                    runCount: 0,
                    averageEfficiency: 0,
                    totalFuelReceived: 0,
                    // Initialize new fields
                    runtimeThisMonth: 0,
                    runtimeThisYear: 0,
                    runtimeTotal: 0,
                    fuelConsumedThisMonth: 0,
                    fuelConsumedThisYear: 0,
                    fuelConsumedTotal: 0,
                    costThisMonth: 0,
                    costThisYear: 0,
                    costTotal: 0
                };
            }

            generatorStats[generatorId].totalFuelReceived = (generatorStats[generatorId].totalFuelReceived || 0) + transfer.quantity;
        });

        // Calculate averages and format data
        const reports = Object.values(generatorStats).map(stat => ({
            name: stat.name,
            totalRuntime: stat.totalRuntime,
            totalRuntimeHours: (stat.totalRuntime / 60).toFixed(2),
            totalFuelConsumed: stat.totalFuelConsumed.toFixed(2),
            totalFuelReceived: (stat.totalFuelReceived || 0).toFixed(2),
            totalCost: stat.totalCost.toFixed(2),
            runCount: stat.runCount,
            averageEfficiency: stat.totalRuntime > 0 
                ? (stat.totalFuelConsumed / (stat.totalRuntime / 60)).toFixed(2) 
                : 0,
            costPerHour: stat.totalRuntime > 0 
                ? (stat.totalCost / (stat.totalRuntime / 60)).toFixed(2) 
                : 0,
            // Add new period-specific stats
            runtimeThisMonth: (stat.runtimeThisMonth / 60).toFixed(2),
            runtimeThisYear: (stat.runtimeThisYear / 60).toFixed(2),
            runtimeTotal: (stat.runtimeTotal / 60).toFixed(2),
            fuelConsumedThisMonth: stat.fuelConsumedThisMonth.toFixed(2),
            fuelConsumedThisYear: stat.fuelConsumedThisYear.toFixed(2),
            fuelConsumedTotal: stat.fuelConsumedTotal.toFixed(2),
            costThisMonth: stat.costThisMonth.toFixed(2),
            costThisYear: stat.costThisYear.toFixed(2),
            costTotal: stat.costTotal.toFixed(2)
        }));

        // Calculate overall statistics
        const overallStats = {
            totalRuntime: reports.reduce((sum, gen) => sum + parseFloat(gen.totalRuntimeHours), 0).toFixed(2),
            totalFuelConsumed: reports.reduce((sum, gen) => sum + parseFloat(gen.totalFuelConsumed), 0).toFixed(2),
            totalCost: reports.reduce((sum, gen) => sum + parseFloat(gen.totalCost), 0).toFixed(2),
            averageEfficiency: reports.reduce((sum, gen) => sum + parseFloat(gen.averageEfficiency), 0) / reports.length,
            weightedAverageRate: weightedAverageRate.toFixed(2)
        };

        res.json({
            generators: reports,
            overall: overallStats,
            period: {
                start: startDate ? new Date(startDate) : null,
                end: endDate ? new Date(endDate) : null
            }
        });

    } catch (error) {
        console.error('Error generating reports:', error);
        res.status(500).json({ message: 'Error generating reports', error: error.message });
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
    updateMainContainer,
    getGeneratorReports
}; 