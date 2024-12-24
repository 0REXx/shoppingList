import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import './App.css';
import {
  registerUser,
  loginUser,
  fetchShoppingLists,
  createShoppingList,
  deleteShoppingList,
  archiveShoppingList,
  unarchiveShoppingList,
  addParticipantByEmail,
  addItemToList,
  toggleItemStatus,
  deleteItem,
} from './services/apiService';

const App = () => {
  const [shoppingLists, setShoppingLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [selectedListId, setSelectedListId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const COLORS = darkMode ? ['#4CAF50', '#F44336'] : ['#0088FE', '#FF8042'];

  const translations = {
    en: {
      shoppingList: 'Shopping List',
      addParticipant: 'Add Participant',
      newListName: 'New List Name',
      addNewList: 'Add New List',
      editListName: 'Edit List Name',
      participantEmail: 'Participant Email',
      logout: 'Logout',
      language: 'Language',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      archive: 'Archive',
      unarchive: 'Unarchive',
      delete: 'Delete',
      addItem: 'Add Item',
      newItem: 'New Item',
      items: 'Items',
      done: 'Done',
      undone: 'Undone',
      overview: 'Overview',
      selectList: 'Select a list to view details',
      ownerOnly: 'Only the owner can archive or unarchive the list',
      archivedList: 'This list is archived. Changes are not allowed.',
    },
    ru: {
      shoppingList: 'Список покупок',
      addParticipant: 'Добавить участника',
      newListName: 'Название нового списка',
      addNewList: 'Добавить новый список',
      editListName: 'Редактировать название списка',
      participantEmail: 'Email участника',
      logout: 'Выйти',
      language: 'Язык',
      lightMode: 'Светлая тема',
      darkMode: 'Темная тема',
      archive: 'Архивировать',
      unarchive: 'Разархивировать',
      delete: 'Удалить',
      addItem: 'Добавить элемент',
      newItem: 'Новый элемент',
      items: 'Элементы',
      done: 'Готово',
      undone: 'Не готово',
      overview: 'Обзор',
      selectList: 'Выберите список для просмотра деталей',
      ownerOnly: 'Только владелец может архивировать или разархивировать список',
      archivedList: 'Этот список заархивирован. Изменения невозможны.',
    },
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchShoppingLists()
        .then((lists) => setShoppingLists(lists))
        .catch((err) => console.error('Error fetching shopping lists:', err));
    }
  }, [isAuthenticated]);

  const handleAuthSubmit = async () => {
    try {
      setAuthError('');
      if (authMode === 'login') {
        const data = await loginUser({ email, password });
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setMenuOpen(false);
  };

  const handleAddNewList = async () => {
    if (!newListName.trim()) {
      console.error('List name is empty');
      return;
    }

    try {
      const newList = await createShoppingList(newListName);
      setShoppingLists([...shoppingLists, newList]);
      setNewListName('');
      setSelectedListId(newList._id);
    } catch (err) {
      console.error('Failed to add new list:', err);
    }
  };


  const saveListNameToBackend = async (listId) => {
    // Найти выбранный список
    const list = shoppingLists.find((list) => list._id === listId);
  
    // Проверка на существование списка и пустое имя
    if (!list || !list.name.trim()) {
      alert('List name cannot be empty');
      return;
    }
  
    try {
      // Логируем URL для отладки
      const BASE_URL = 'http://localhost:5000/api/shopping-lists'; // Замените на ваш URL
      console.log(`PUT request to: ${BASE_URL}/${listId}`);
  
      // Выполняем PUT-запрос на сервер
      const response = await fetch(`${BASE_URL}/${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Добавляем токен
        },
        body: JSON.stringify({ name: list.name }), // Отправляем новое имя списка
      });
  
      // Проверяем успешность запроса
      if (!response.ok) {
        const errorData = await response.json(); // Попробуем получить JSON ошибки
        console.error('Error response from server:', errorData);
        throw new Error(errorData.message || 'Failed to update list name');
      }
  
      // Получаем обновленный список из ответа
      const updatedList = await response.json();
      console.log('Updated list from server:', updatedList);
  
      // Обновляем состояние с новым именем списка
      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === updatedList._id ? { ...list, name: updatedList.name } : list
        )
      );
  
      alert('List name successfully updated'); // Уведомление об успешном обновлении
    } catch (err) {
      // Обработка ошибок
      console.error('Failed to save list name:', err.message);
      alert('Error saving list name: ' + err.message);
    }
  };
  
  const handleDeleteList = async (listId) => {
    try {
      await deleteShoppingList(listId);
      setShoppingLists((prevLists) => prevLists.filter((list) => list._id !== listId));
      if (listId === selectedListId) {
        setSelectedListId(null);
      }
    } catch (err) {
      console.error('Failed to delete list:', err);
    }
  };

  const handleArchiveList = async (listId) => {
    const selectedList = shoppingLists.find((list) => list._id === listId);
    if (!selectedList.owner) {
      alert(t.ownerOnly);
      return;
    }

    try {
      await archiveShoppingList(listId);
      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === listId ? { ...list, archived: true } : list
        )
      );
    } catch (err) {
      console.error('Failed to archive list:', err);
    }
  };

  const handleUnarchiveList = async (listId) => {
    const selectedList = shoppingLists.find((list) => list._id === listId);
    if (!selectedList.owner) {
      alert(t.ownerOnly);
      return;
    }

    try {
      await unarchiveShoppingList(listId);
      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === listId ? { ...list, archived: false } : list
        )
      );
    } catch (err) {
      console.error('Failed to unarchive list:', err);
    }
  };

  const handleAddParticipant = async () => {
    if (!newParticipantEmail.trim() || !selectedListId) {
      console.error('No email or list selected');
      return;
    }

    try {
      const updatedList = await addParticipantByEmail(selectedListId, newParticipantEmail);
      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === selectedListId ? { ...list, participants: updatedList.participants } : list
        )
      );
      setNewParticipantEmail('');
    } catch (err) {
      console.error('Failed to add participant:', err);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim() || !selectedListId) return;

    const selectedList = shoppingLists.find((list) => list._id === selectedListId);
    if (selectedList.archived) {
      alert(t.archivedList);
      return;
    }

    try {
      const updatedList = await addItemToList(selectedListId, newItemName);
      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === selectedListId ? { ...list, items: updatedList.items } : list
        )
      );
      setNewItemName('');
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const handleToggleItemStatus = async (itemId) => {
    const selectedList = shoppingLists.find((list) => list._id === selectedListId);
    if (selectedList.archived) {
      alert(t.archivedList);
      return;
    }

    try {
      const updatedItem = await toggleItemStatus(selectedListId, itemId);
      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === selectedListId
            ? {
                ...list,
                items: list.items.map((item) =>
                  item._id === itemId ? { ...item, resolved: updatedItem.item.resolved } : item
                ),
              }
            : list
        )
      );
    } catch (err) {
      console.error('Failed to toggle item status:', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!selectedListId) return;

    try {
      await deleteItem(selectedListId, itemId);
      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === selectedListId
            ? { ...list, items: list.items.filter((item) => item._id !== itemId) }
            : list
        )
      );
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleSelectList = (listId) => {
    const list = shoppingLists.find((list) => list._id === listId);
    if (list) {
      setSelectedListId(listId);
    } else {
      console.error('No list found with ID:', listId);
    }
  };

  const getChartData = () => {
    const selectedList = shoppingLists.find((list) => list._id === selectedListId);
    if (!selectedList) return [];
    const totalItems = selectedList.items.length;
    const resolvedItems = selectedList.items.filter((item) => item.resolved).length;
    return [
      { name: t.done, value: resolvedItems },
      { name: t.undone, value: totalItems - resolvedItems },
    ];
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.className = darkMode ? 'light-mode' : 'dark-mode';
  };

  const switchLanguage = (lang) => {
    setLanguage(lang);
  };

  const t = translations[language];

  const selectedList = shoppingLists.find((list) => list._id === selectedListId);
  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <h1>{authMode === 'login' ? 'Log in' : 'Sign up'}</h1>
        {authError && <p className="error">{authError}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleAuthSubmit}>
          {authMode === 'login' ? 'Log in' : 'Sign up'}
        </button>
        <p>
          {authMode === 'login' ? (
            <span onClick={() => setAuthMode('register')}>Create an account</span>
          ) : (
            <span onClick={() => setAuthMode('login')}>Already have an account?</span>
          )}
        </p>
      </div>
    );
  }  
  

  return (
    <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="settings-icon-container">
        <div className="settings-icon" onClick={() => setMenuOpen(!menuOpen)}>
          ⚙️
        </div>
        {menuOpen && (
          <div className="settings-menu">
            <button onClick={handleLogout}>{t.logout}</button>
            <button onClick={toggleDarkMode}>
              {darkMode ? t.lightMode : t.darkMode}
            </button>
            <div>
              <h4>{t.language}</h4>
              <button onClick={() => switchLanguage('en')}>English</button>
              <button onClick={() => switchLanguage('ru')}>Русский</button>
            </div>
          </div>
        )}
      </div>
      <h1>{t.shoppingList}</h1>
      <div className="container">
        <div className="sidebar">
          <h2>{t.shoppingList}</h2>
          <input
            type="text"
            placeholder={t.newListName}
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
          <button onClick={handleAddNewList}>{t.addNewList}</button>
          <div className="lists-container">
            {shoppingLists.map((list) => (
              <div
                key={list._id}
                className={`list-item ${list._id === selectedListId ? 'selected' : ''}`}
                onClick={() => handleSelectList(list._id)}
              >
                <span className="list-name-display">{list.name}</span>
                {list.archived ? (
                  <button
                    className="unarchive-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnarchiveList(list._id);
                    }}
                  >
                    {t.unarchive}
                  </button>
                ) : (
                  <button
                    className="archive-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchiveList(list._id);
                    }}
                  >
                    {t.archive}
                  </button>
                )}
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteList(list._id);
                  }}
                >
                  {t.delete}
                </button>
              </div>
            ))}
          </div>
          {selectedList && (
            <div>
              <h3>{t.participants}</h3>
              <input
                type="text"
                placeholder={t.participantEmail}
                value={newParticipantEmail}
                onChange={(e) => setNewParticipantEmail(e.target.value)}
              />
              <button onClick={handleAddParticipant}>{t.addParticipant}</button>
              <ul>
                {(selectedList.participants || []).map((participant) => (
                  <li key={participant._id || participant.email}>{participant.email}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="main-content">
        {selectedList ? (
          <div className="edit-list-section">
  <h2 className="edit-list-section-title">{t.editListName}</h2>
  <input
    type="text"
    value={selectedList.name || ''}
    onChange={(e) => {
      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === selectedListId ? { ...list, name: e.target.value } : list
        )
      );
    }}
    onBlur={() => {
      const currentName = selectedList.name.trim();
      if (currentName) {
        saveListNameToBackend(selectedListId);
      } else {
        alert(t.listNameCannotBeEmpty); // Убедитесь, что эта строка также переведена
      }
    }}
    placeholder={t.editListName}
    className="edit-list-name-input"
  />
              <h3>{t.items}</h3>
              <input
                type="text"
                placeholder={t.newItem}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
              <button onClick={handleAddItem}>{t.addItem}</button>
              <ul>
  {selectedList.items.map((item) => (
    <li key={item._id} className="list-item-row">
      <span className="item-name">{item.name}</span>
      <button className="item-button" onClick={() => handleToggleItemStatus(item._id)}>
        {item.resolved ? t.undone : t.done}
      </button>
      <button className="item-button" onClick={() => handleDeleteItem(item._id)}>
        {t.delete}
      </button>
    </li>
  ))}
</ul>

              <div>
                <h3>{t.overview}</h3>
                <PieChart width={300} height={300}>
                  <Pie
                    data={getChartData()}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                  >
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </div>
            </div>
          ) : (
            <p>{t.selectList}</p>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default App;




