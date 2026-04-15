import express from 'express';
import { createCourse, getCourses, getCourseById, updateCourse, deleteCourse, getCourseStats, getFacultyCourses } from '../controllers/courseController.js';
import { protect, faculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCourses)
  .post(protect, faculty, createCourse);

router.get('/faculty/my-courses', protect, faculty, getFacultyCourses);
router.get('/:id/stats', protect, faculty, getCourseStats);

router.route('/:id')
  .get(getCourseById)
  .put(protect, faculty, updateCourse)
  .delete(protect, faculty, deleteCourse);

export default router;
