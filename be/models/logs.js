const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    generator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Generator',
        required: true
    },
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    fuel_consumed: {
        type: Number
    },
},
    {timestamps: true}
);

const runLog = mongoose.model('Log', logSchema);
module.exports = runLog;