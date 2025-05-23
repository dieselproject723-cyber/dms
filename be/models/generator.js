const mongoose = require('mongoose');

const generatorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    currentFuel: {
        type: Number,
        required: true,
        default: 0
    },
    location: String,
    operator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fuelEfficiency: {
        type: Number,  // liters per hour
        required: true
    }
}, { timestamps: true });

const Generator = mongoose.model('Generator', generatorSchema);
module.exports = Generator;