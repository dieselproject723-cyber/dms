const validateFuelAmount = (req, res, next) => {
    const { amount } = req.body;
    
    if (amount <= 0) {
        return res.status(400).json({ error: 'Fuel amount must be positive' });
    }
    
    next();
};

const validateRunTime = (req, res, next) => {
    const { startTime, endTime } = req.body;
    
    if (new Date(startTime) >= new Date(endTime)) {
        return res.status(400).json({ error: 'End time must be after start time' });
    }
    
    next();
};

const validateCapacity = (req, res, next) => {
    const { capacity } = req.body;
    
    if (!capacity || capacity <= 0) {
        return res.status(400).json({ error: 'Capacity must be a positive number' });
    }
    
    next();
};

module.exports = {
    validateFuelAmount,
    validateRunTime,
    validateCapacity
}; 