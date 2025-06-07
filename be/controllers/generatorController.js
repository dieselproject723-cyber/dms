const Generator = require('../models/generator');
const { auth, isAdmin } = require('../middleware/auth');

const createGenerator = async (req, res) => {
    try {
        const { name, capacity, location, fuelEfficiency, operatorId } = req.body;

        const generator = new Generator({
            name,
            capacity,
            location,
            fuelEfficiency,
            operator: operatorId,
            currentFuel: 0
        });

        await generator.save();
        res.status(201).json(generator);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getGenerator = async (req, res) => {
    try {
        const generator = await Generator.findById(req.params.id)
            .populate('operator', 'name email');
        if (!generator) {
            return res.status(404).json({ error: 'Generator not found' });
        }
        res.json(generator);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getGenerators = async (req, res) => {
    try {
        let query = {};

        // If the authenticated user is a worker, filter by their assigned generators
        if (req.user && req.user.role === 'worker') {
            query.operator = req.user._id;
        }

        const generators = await Generator.find(query)
            .populate('operator', 'name email');
        res.json(generators);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateGenerator = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'location', 'operator'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
        const generator = await Generator.findById(req.params.id);
        if (!generator) {
            return res.status(404).json({ error: 'Generator not found' });
        }

        updates.forEach(update => generator[update] = req.body[update]);
        await generator.save();
        res.json(generator);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createGenerator,
    getGenerator,
    getGenerators,
    updateGenerator
}; 