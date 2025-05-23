const mongoose = require('mongoose');

const runLogSchema = new mongoose.Schema({
    generator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Generator',
        required: true
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,  // in minutes
        required: true
    },
    fuelConsumed: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const RunLog = mongoose.model('RunLog', runLogSchema);
module.exports = RunLog; 