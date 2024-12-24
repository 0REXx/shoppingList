const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    items: [
        {
            name: { type: String, required: true },
            resolved: { type: Boolean, default: false },
        },
    ],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    archived: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('ShoppingList', shoppingListSchema);








