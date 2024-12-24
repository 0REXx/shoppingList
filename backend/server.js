require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Подключение к базе данных
const authRoutes = require('./routes/authRoutes'); // Правильный импорт
const shoppingListRoutes = require('./routes/shoppingListRoutes'); // Правильный импорт
const participantRoutes = require('./routes/participantRoutes'); // Правильный импорт

const app = express();

// Подключение к базе данных
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
connectDB()
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Маршруты
app.use('/api/auth', authRoutes); // Убедитесь, что authRoutes экспортируется как `router`
app.use('/api/shopping-lists', shoppingListRoutes); // Убедитесь, что shoppingListRoutes экспортируется как `router`
app.use('/api/participants', participantRoutes); // Убедитесь, что participantRoutes экспортируется как `router`

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


