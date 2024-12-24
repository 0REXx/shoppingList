import React, { useState } from 'react';
import ShoppingListItem from './ShoppingListItem';
import { PieChart, Pie, Cell, Legend } from 'recharts';

function ShoppingList() {
  const [items, setItems] = useState([]);
  const [listName, setListName] = useState('My List');
  const [newItem, setNewItem] = useState('');
  const [filter, setFilter] = useState('all');
  const [members, setMembers] = useState(['owner']);
  const [currentUser, setCurrentUser] = useState('owner');

  // Добавление нового элемента
  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems([...items, { id: Date.now(), name: newItem, resolved: false }]);
      setNewItem('');
    }
  };

  // Переключение статуса выполнено/не выполнено
  const handleToggleResolved = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, resolved: !item.resolved } : item));
  };

  // Удаление элемента
  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Фильтрация элементов
  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return filter === 'resolved' ? item.resolved : !item.resolved;
  });

  // Добавление нового участника
  const handleAddMember = (newMember) => {
    if (currentUser === 'owner' && newMember.trim() && !members.includes(newMember)) {
      setMembers([...members, newMember]);
    }
  };

  // Удаление участника
  const handleRemoveMember = (member) => {
    if (currentUser === 'owner') {
      setMembers(members.filter(m => m !== member));
    }
  };

  // Покинуть список
  const handleLeaveList = () => {
    setMembers(members.filter(m => m !== currentUser));
  };

  // Подсчёт выполненных и невыполненных задач для диаграммы
  const resolvedCount = items.filter(item => item.resolved).length;
  const unresolvedCount = items.length - resolvedCount;

  const data = [
    { name: 'Resolved', value: resolvedCount },
    { name: 'Unresolved', value: unresolvedCount },
  ];

  const COLORS = ['#0088FE', '#FF8042'];

  return (
    <div>
      {currentUser === 'owner' ? (
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="List Name"
          style={{ fontSize: '1.5rem', marginBottom: '1rem' }}
        />
      ) : (
        <h2>{listName}</h2>
      )}

      <h2>{listName}</h2>

      <div>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="New Item"
        />
        <button onClick={handleAddItem}>Add</button>
      </div>
      <div>
        <label>
          <input
            type="radio"
            name="filter"
            checked={filter === 'all'}
            onChange={() => setFilter('all')}
          />
          All
        </label>
        <label>
          <input
            type="radio"
            name="filter"
            checked={filter === 'unresolved'}
            onChange={() => setFilter('unresolved')}
          />
          Only Unresolved
        </label>
        <label>
          <input
            type="radio"
            name="filter"
            checked={filter === 'resolved'}
            onChange={() => setFilter('resolved')}
          />
          Only Resolved
        </label>
      </div>
      <ul>
        {filteredItems.map(item => (
          <ShoppingListItem
            key={item.id}
            item={item}
            onToggleResolved={handleToggleResolved}
            onDelete={handleDeleteItem}
          />
        ))}
      </ul>
      {currentUser === 'owner' && (
        <div>
          <h3>Manage Members</h3>
          <input
            type="text"
            placeholder="Add Member"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddMember(e.target.value);
            }}
          />
          <ul>
            {members.map(member => (
              <li key={member}>
                {member} <button onClick={() => handleRemoveMember(member)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {currentUser !== 'owner' && (
        <button onClick={handleLeaveList}>Leave List</button>
      )}

      {/* Секция диаграммы */}
      <div style={{ marginTop: '20px', textAlign: 'center', background: '#f9f9f9', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <h2>Status Overview</h2>
        <PieChart width={300} height={300}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}

export default ShoppingList;
