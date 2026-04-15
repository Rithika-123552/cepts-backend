import CourseEnrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import Badge from '../models/Badge.js';
import Notification from '../models/Notification.js';
import Message from '../models/Message.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

export const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user._id;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    if (!studentId) {
      return res.status(401).json({ message: 'Student ID not found' });
    }

    console.log(`Enrolling student ${studentId} in course ${courseId} (via student route)`);

    const alreadyEnrolled = await CourseEnrollment.findOne({ student: studentId, course: courseId });
    if (alreadyEnrolled) {
      res.status(400).json({ message: 'Already enrolled in this course' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const enrollment = await CourseEnrollment.create({
      student: studentId,
      course: courseId
    });
    await Progress.create({
      student: studentId,
      course: courseId,
      completedContent: [],
      percentage: 0
    });

    try {
      await Notification.create({
        user: studentId,
        message: `You have successfully enrolled in ${course.title}`,
        type: 'general'
      });

      const admins = await User.find({ role: 'Admin' });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          message: `Student ${req.user.name} enrolled in ${course.title}`,
          type: 'general'
        });
      }
    } catch (err) {
      console.error('Notification Error:', err.message);
    }

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProgress = async (req, res) => {
  const { contentIndex } = req.body;

  try {
    const courseId = req.params.courseId;
    const studentId = req.user._id;

    const progress = await Progress.findOne({ student: studentId, course: courseId });
    const course = await Course.findById(courseId);

    if (progress && course) {
      if (!progress.completedContent.includes(contentIndex)) {
        progress.completedContent.push(contentIndex);
        
        const totalContent = course.content.length;
        const completedCount = progress.completedContent.length;
        const percentage = Math.round((completedCount / totalContent) * 100);
        
        progress.percentage = percentage;

        const newNotifications = [];

        const milestones = [25, 50, 75, 100];
        if (milestones.includes(percentage) && progress.lastMilestoneReached < percentage) {
          const milestone = percentage;
          progress.lastMilestoneReached = milestone;
          
          let message = "";
          if (milestone === 25) message = `You completed 25% of ${course.title} 🎉 Keep going!`;
          else if (milestone === 50) message = `Halfway there! 50% done with ${course.title} 🚀`;
          else if (milestone === 75) message = `Almost there! 75% completed in ${course.title}! 💪`;
          else if (milestone === 100) message = `Congratulations! You completed ${course.title}! 🏆`;

          try {
            
            const existingNotif = await Notification.findOne({
              user: studentId,
              message: message,
              type: 'progress'
            });

            if (!existingNotif) {
              const notif = await Notification.create({
                user: studentId,
                message,
                type: 'progress'
              });
              newNotifications.push(notif);
            }

            if (milestone === 100) {

              const existingBadge = await Badge.findOne({ student: studentId, course: courseId, name: 'Course Master' });
              if (!existingBadge) {
                await Badge.create({
                  student: studentId,
                  course: courseId,
                  name: 'Course Master',
                  description: `Completed the course: ${course.title}`,
                  icon: 'Award'
                });
                
                await Notification.create({
                  user: studentId,
                  message: `Amazing! You earned the "Course Master" badge for ${course.title}!`,
                  type: 'general'
                });
              }
            }
          } catch (err) {
            console.error('Notification Error:', err.message);
          }
        }

        await progress.save();
        res.json({ progress, newNotifications });
      } else {
        res.json({ progress, newNotifications: [] });
      }
    } else {
      res.status(404).json({ message: 'Progress or Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentDashboard = async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.find({ student: req.user._id }).populate('course');
    const progress = await Progress.find({ student: req.user._id });
    const badges = await Badge.find({ student: req.user._id }).populate('course');
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);

    res.json({ enrollments, progress, badges, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitQuiz = async (req, res) => {
  const { score, total } = req.body;

  try {
    const courseId = req.params.courseId;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);

    try {
      await Notification.create({
        user: studentId,
        message: `You completed the quiz for ${course?.title || 'a course'} with a score of ${score}/${total}`,
        type: 'general'
      });
    } catch (err) {
      console.error('Notification Error:', err.message);
    }

    if (score === total && total > 0) {
     
      const existingBadge = await Badge.findOne({ student: studentId, course: courseId, name: 'Quiz Champion' });
      if (!existingBadge) {
        await Badge.create({
          student: studentId,
          course: courseId,
          name: 'Quiz Champion',
          description: `Perfect score in quiz for course ID: ${courseId}`,
          icon: 'Star'
        });
        
        try {
          const notif = await Notification.create({
            user: studentId,
            message: `Perfect Score! You earned the "Quiz Champion" badge!`,
            type: 'general'
          });
          return res.json({ message: 'Quiz submitted', newNotifications: [notif] });
        } catch (err) {
          console.error('Notification Error:', err.message);
        }
      }
    }

    res.json({ message: 'Quiz submitted', newNotifications: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
