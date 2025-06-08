const mongoose = require('mongoose');

const mainFuelEntrySchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    receivedBy: {
        type: String,
        required: true
    },
    receivingUnitName: {
        type: String,
        required: true
    },
    receivingUnitLocation: {
        type: String,
        required: true
    },
    supplyingUnitName: {
        type: String,
        required: true
    },
    supplyingUnitLocation: {
        type: String,
        required: true
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const MainFuelEntry = mongoose.model('MainFuelEntry', mainFuelEntrySchema);
module.exports = MainFuelEntry; 