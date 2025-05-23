const mongoose = require('mongoose');

const fuelSchema = new mongoose.Schema({
    generator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Generator',
        required: true
    },
    type: {
        type: String,
        enum: ['added', 'removed'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    current_fuel: {
        type: Number,
        required: true
    }
},
    {timestamps: true}
);

const Fuel = mongoose.model('Fuel', fuelSchema);
module.exports = Fuel;