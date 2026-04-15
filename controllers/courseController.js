import Course from '../models/Course.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import CourseEnrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';

export const createCourse = async (req, res) => {
  const { title, description, content, quizzes } = req.body;

  try {
    const course = new Course({
      title,
      description,
      content,
      quizzes,
      instructor: req.user._id
    });

    const createdCourse = await course.save();

    try {
      const students = await User.find({ role: 'Student' });
      const studentNotifications = students.map(student => ({
        user: student._id,
        message: `New course added: ${title}`,
        type: 'general'
      }));
      if (studentNotifications.length > 0) {
        await Notification.insertMany(studentNotifications);
      }

      const admins = await User.find({ role: 'Admin' });
      const adminNotifications = admins.map(admin => ({
        user: admin._id,
        message: `Faculty ${req.user.name} added a new course: ${title}`,
        type: 'general'
      }));
      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications);
      }
    } catch (err) {
      console.error('Notification Error:', err.message);
    }

    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate('instructor', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFacultyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    
    const coursesWithCounts = await Promise.all(courses.map(async (course) => {
      const count = await CourseEnrollment.countDocuments({ course: course._id });
      return {
        ...course._doc,
        enrollmentCount: count
      };
    }));

    res.json(coursesWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name');
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCourse = async (req, res) => {
  const { title, description, content, quizzes } = req.body;

  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        res.status(401).json({ message: 'Not authorized to update this course' });
        return;
      }

      course.title = title || course.title;
      course.description = description || course.description;
      course.content = content || course.content;
      course.quizzes = quizzes || course.quizzes;

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
        res.status(401).json({ message: 'Not authorized to delete this course' });
        return;
      }

      await course.deleteOne();
      res.json({ message: 'Course removed' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourseStats = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const enrollments = await CourseEnrollment.find({ course: req.params.id }).populate('student', 'name email');
    const progressData = await Progress.find({ course: req.params.id });

    const stats = enrollments.map(enrollment => {
      const progress = progressData.find(p => p.student.toString() === enrollment.student._id.toString());
      return {
        student: enrollment.student,
        enrolledAt: enrollment.enrolledAt,
        progress: progress ? progress.percentage : 0
      };
    });

    res.json({
      courseTitle: course.title,
      totalEnrolled: enrollments.length,
      students: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

