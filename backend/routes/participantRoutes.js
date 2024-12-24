const express = require('express');
const { addParticipant, removeParticipant } = require('../controllers/participantController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, addParticipant);
router.delete('/:id', protect, removeParticipant);

module.exports = router; // Экспорт `router`

