import express from 'express';
import { 
  enrollInCourse, 
  updateProgress, 
  getStudentDashboard, 
  submitQuiz,
  markNotificationsRead
} from '../controllers/studentController.js';
import { protect, student } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, student, getStudentDashboard);
router.put('/notifications/read', protect, student, markNotificationsRead);
router.post('/enroll/:courseId', protect, student, enrollInCourse);

router.put('/progress/:courseId', protect, student, updateProgress);
router.post('/quiz/:courseId', protect, student, submitQuiz);

export default router;
