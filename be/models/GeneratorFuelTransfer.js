const mongoose = require('mongoose');

const generatorFuelTransferSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    fromContainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainContainer',
        required: true
    },
    toGenerator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Generator',
        required: true
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const GeneratorFuelTransfer = mongoose.model('GeneratorFuelTransfer', generatorFuelTransferSchema);
module.exports = GeneratorFuelTransfer; 