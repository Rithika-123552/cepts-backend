import User from '../models/User.js';
import Course from '../models/Course.js';
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: 'Student' });
    const facultyCount = await User.countDocuments({ role: 'Faculty' });
    const courseCount = await Course.countDocuments({});

    res.json({ studentCount, facultyCount, courseCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
