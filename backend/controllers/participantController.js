const Participant = require('../models/Participant');
const ShoppingList = require('../models/ShoppingList');

// Добавление участника
const addParticipant = async (req, res) => {
  const { shoppingListId, name } = req.body;

  try {
    const shoppingList = await ShoppingList.findById(shoppingListId);
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    const newParticipant = { id: Date.now(), name };
    shoppingList.participants.push(newParticipant);
    await shoppingList.save();

    res.status(201).json(shoppingList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Удаление участника
const removeParticipant = async (req, res) => {
  const { id } = req.params;

  try {
    const shoppingList = await ShoppingList.findOneAndUpdate(
      { 'participants._id': id },
      { $pull: { participants: { _id: id } } },
      { new: true }
    );

    if (!shoppingList) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    res.status(200).json(shoppingList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addParticipant, removeParticipant };
