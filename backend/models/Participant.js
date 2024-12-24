const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Ссылка на коллекцию пользователей
    required: true,
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShoppingList', // Ссылка на коллекцию списков
    required: true,
  },
});

module.exports = mongoose.model('Participant', participantSchema);
