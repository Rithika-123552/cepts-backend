import express from 'express';
import { sendMessage, getMessages, clearMessages, deleteMessage } from '../controllers/messageController.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send', protect, faculty, sendMessage);
router.get('/', protect, getMessages);
router.delete('/', protect, clearMessages);
router.delete('/:id', protect, deleteMessage);

export default router;
