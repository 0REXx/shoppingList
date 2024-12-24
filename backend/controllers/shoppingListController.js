const ShoppingList = require('../models/ShoppingList');
const User = require('../models/User');

// Получить все списки покупок для авторизованного пользователя
const getShoppingLists = async (req, res) => {
  try {
    const lists = await ShoppingList.find({ $or: [{ owner: req.user.id }, { participants: req.user.id }] })
      .populate('owner', 'email') // Загружаем владельца (опционально)
      .populate('participants', 'email'); // Загружаем участников
    res.status(200).json(lists);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


// Создать новый список покупок
const createShoppingList = async (req, res) => {
  try {
    const { name } = req.body;

    const newList = new ShoppingList({
      name,
      items: [],
      participants: [],
      archived: false,
      owner: req.user.id,
    });

    await newList.save();
    res.status(201).json(newList);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Обновить название списка
const updateShoppingListName = async (req, res) => {
  console.log('Request received for updating list name:', req.params, req.body);

  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'List name cannot be empty' });
  }

  try {
    const updatedList = await ShoppingList.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!updatedList) {
      return res.status(404).json({ message: 'List not found' });
    }

    res.status(200).json(updatedList);
  } catch (err) {
    console.error('Error updating list name:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};




// Архивировать список покупок
const archiveShoppingList = async (req, res) => {
  try {
    const list = await ShoppingList.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    if (list.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    list.archived = true; // Устанавливаем статус архивирования
    await list.save();

    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

//Разархивировать список 
const unarchiveShoppingList = async (req, res) => {
  try {
    const { id } = req.params;

    const shoppingList = await ShoppingList.findById(id);

    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    // Проверяем, является ли пользователь владельцем
    if (shoppingList.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to unarchive this list' });
    }

    shoppingList.archived = false;
    await shoppingList.save();

    res.status(200).json(shoppingList);
  } catch (error) {
    console.error('Error unarchiving shopping list:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Удалить список покупок
const deleteShoppingList = async (req, res) => {
  try {
    const listId = req.params.id; // Получаем ID из параметров маршрута
    const userId = req.user.id; // ID текущего пользователя из middleware protect

    if (!listId) {
      return res.status(400).json({ message: 'List ID is required' }); // Если ID не передан
    }

    // Находим список по ID
    const list = await ShoppingList.findById(listId);

    if (!list) {
      return res.status(404).json({ message: 'List not found' }); // Если список не найден
    }

    // Проверяем, является ли текущий пользователь владельцем списка
    if (list.owner.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this list' });
    }

    // Удаляем список
    await ShoppingList.findByIdAndDelete(listId);

    res.status(200).json({ message: 'List successfully deleted' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ message: 'Failed to delete list', error });
  }
};

// Добавить предмет в список покупок
const addItemToShoppingList = async (req, res) => {
  try {
    const { id } = req.params; // ID списка покупок
    const { name } = req.body; // Имя предмета

    if (!name) {
      return res.status(400).json({ message: 'Item name is required' });
    }

    const list = await ShoppingList.findById(id);

    if (!list) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    // Проверяем, является ли текущий пользователь владельцем или участником
    const isAuthorized =
      list.owner.toString() === req.user.id ||
      list.participants.some((participant) => participant.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'You are not authorized to add items to this list' });
    }

    // Добавляем предмет в список
    list.items.push({ name, resolved: false });
    await list.save();

    res.status(200).json({ message: 'Item added successfully', items: list.items });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ message: 'Failed to add item', error });
  }
};

// Стату предмета
const toggleItemStatus = async (req, res) => {
  try {
    const { listId, itemId } = req.params;

    const shoppingList = await ShoppingList.findById(listId);
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    const item = shoppingList.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.resolved = !item.resolved; // Переключаем статус предмета
    await shoppingList.save();

    res.status(200).json({ item });
  } catch (error) {
    console.error('Error toggling item status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//Удаление предмета
const deleteItem = async (req, res) => {
  try {
    const { id, itemId } = req.params; // `id` is the shopping list ID, `itemId` is the item ID

    const shoppingList = await ShoppingList.findById(id);

    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    // Check if the user is authorized to delete the item (owner or participant)
    const isOwner = shoppingList.owner.toString() === req.user._id.toString();
    const isParticipant = shoppingList.participants.some(
      (participant) => participant.toString() === req.user._id.toString()
    );

    if (!isOwner && !isParticipant) {
      return res.status(403).json({ message: 'You are not authorized to delete items in this list' });
    }

    // Use `$pull` to remove the item by its `_id`
    await ShoppingList.findByIdAndUpdate(
      id,
      {
        $pull: { items: { _id: itemId } }, // Remove the item from the `items` array
      },
      { new: true } // Return the updated document
    );

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Добавить участника в список покупок
const addParticipantToShoppingList = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const shoppingList = await ShoppingList.findById(id);
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    const participant = await User.findOne({ email });
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    if (shoppingList.participants.includes(participant._id)) {
      return res.status(400).json({ message: 'Participant already added' });
    }

    shoppingList.participants.push(participant._id);
    await shoppingList.save();

    // Пополните список участников для ответа
    const updatedParticipants = await User.find({
      _id: { $in: shoppingList.participants },
    }).select('email');

    res.status(200).json({ participants: updatedParticipants });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// Экспорт всех функций
module.exports = {
  getShoppingLists,
  createShoppingList,
  updateShoppingListName,
  deleteShoppingList,
  archiveShoppingList,
  unarchiveShoppingList,
  addItemToShoppingList,
  toggleItemStatus,
  deleteItem,
  addParticipantToShoppingList,
};


