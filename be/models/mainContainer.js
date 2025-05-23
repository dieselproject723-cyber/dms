const mongoose = require('mongoose');

const mainContainerSchema = new mongoose.Schema({
    capacity: {
        type: Number,
        required: true
    },
    currentFuel: {
        type: Number,
        required: true,
        default: 0
    },
    lastRefillDate: {
        type: Date
    }
}, { timestamps: true });

const MainContainer = mongoose.model('MainContainer', mainContainerSchema);
module.exports = MainContainer; 