import express from 'express';
import { enrollInCourse } from '../controllers/enrollmentController.js';
import { protect, student } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, student, enrollInCourse);

export default router;
