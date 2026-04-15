import CourseEnrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const enrollInCourse = async (req, res) => {
  const { courseId } = req.body;

  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can enroll in courses' });
    }

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    if (!req.user._id) {
      return res.status(401).json({ message: 'User ID not found' });
    }

    console.log(`Enrolling student ${req.user._id} in course ${courseId}`);

    const alreadyEnrolled = await CourseEnrollment.findOne({ student: req.user._id, course: courseId });
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const enrollment = await CourseEnrollment.create({
      student: req.user._id,
      course: courseId
    });

    await Progress.create({
      student: req.user._id,
      course: courseId,
      completedContent: [],
      percentage: 0
    });

    try {
      const course = await Course.findById(courseId);
      await Notification.create({
        user: req.user._id,
        message: `You have successfully enrolled in ${course?.title || 'the course'}`,
        type: 'general'
      });

      const admins = await User.find({ role: 'Admin' });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          message: `Student ${req.user.name} enrolled in ${course?.title || 'a course'}`,
          type: 'general'
        });
      }
    } catch (err) {
      console.error('Notification Error:', err.message);
    }

    res.status(201).json({ message: 'Successfully enrolled!', enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
