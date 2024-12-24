import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, userData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Error during registration:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Registration failed' };
  }
};

export const loginUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  return await response.json();
};


export const fetchShoppingLists = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('User is not authenticated');
  }

  try {
    const response = await axios.get(`${BASE_URL}/shopping-lists`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error.response?.data || { message: 'Failed to fetch shopping lists' };
  }
};

export const createShoppingList = async (name) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${BASE_URL}/shopping-lists`,
    { name },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const updateShoppingListName = async (listId, newName) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.put(
      `${BASE_URL}/shopping-lists/${listId}`,
      { name: newName },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating list name:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to update list name' };
  }
};

export const archiveShoppingList = async (listId) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(
    `${BASE_URL}/shopping-lists/${listId}/archive`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const unarchiveShoppingList = async (listId) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(
    `${BASE_URL}/shopping-lists/${listId}/unarchive`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const deleteShoppingList = async (listId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.delete(`${BASE_URL}/shopping-lists/${listId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error in deleteShoppingList:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to delete shopping list' };
  }
};

export const addParticipantByEmail = async (listId, email) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(
      `${BASE_URL}/shopping-lists/${listId}/participants`,
      { email },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error in addParticipantByEmail:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to add participant' };
  }
};

export const addItemToList = async (listId, itemName) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${BASE_URL}/shopping-lists/${listId}/items`,
    { name: itemName },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const toggleItemStatus = async (listId, itemId) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(
    `${BASE_URL}/shopping-lists/${listId}/items/${itemId}/toggle`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const deleteItem = async (listId, itemId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.delete(
      `${BASE_URL}/shopping-lists/${listId}/items/${itemId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting item:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to delete item' };
  }
};





