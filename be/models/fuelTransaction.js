const mongoose = require('mongoose');

const fuelTransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['main_entry', 'to_generator'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    fromContainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainContainer',
        required: function() {
            return this.type === 'to_generator';
        }
    },
    toGenerator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Generator',
        required: function() {
            return this.type === 'to_generator';
        }
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const FuelTransaction = mongoose.model('FuelTransaction', fuelTransactionSchema);
module.exports = FuelTransaction; 