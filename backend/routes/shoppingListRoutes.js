const express = require('express');
const {
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
} = require('../controllers/shoppingListController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getShoppingLists); // Получить все списки
router.post('/', protect, createShoppingList); // Создать новый список
router.put('/:id', protect, updateShoppingListName); // Обновить название листа
router.put('/:id/archive', protect, archiveShoppingList); // Архивировать список
router.put('/:id/unarchive', protect, unarchiveShoppingList); // Разархивировать список
router.delete('/:id', protect, deleteShoppingList); // Удалить список
router.post('/:id/items', protect, addItemToShoppingList); // Добавить предмет в список
router.put('/:listId/items/:itemId/toggle', protect, toggleItemStatus); // Переключить статус предмета
router.delete('/:id/items/:itemId', protect, deleteItem); // Удалить предмет
router.post('/:id/participants', protect, addParticipantToShoppingList); // Добавить участника в список

module.exports = router;



