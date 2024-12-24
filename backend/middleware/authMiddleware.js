const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Проверяем наличие токена в заголовке авторизации
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Извлекаем токен из заголовка
      token = req.headers.authorization.split(' ')[1];

      // Проверяем и расшифровываем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Находим пользователя по ID из токена
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }

      // Если все проверки прошли, продолжаем
      next();
    } catch (error) {
      console.error('Ошибка токена:', error);
      return res.status(401).json({ message: 'Не авторизован, токен недействителен' });
    }
  }

  // Если токен отсутствует
  if (!token) {
    return res.status(401).json({ message: 'Не авторизован, токен отсутствует' });
  }
};

module.exports = protect;






