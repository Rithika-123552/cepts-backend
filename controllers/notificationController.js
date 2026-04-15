import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      if (notification.user.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
      }
      notification.isRead = true;
      await notification.save();
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  console.log(`DELETE /api/notifications/${req.params.id} hit`);
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      if (notification.user.toString() !== req.user._id.toString()) {
        console.log(`Unauthorized delete attempt for notification ${req.params.id}`);
        res.status(401).json({ message: 'Not authorized' });
        return;
      }
      await Notification.findByIdAndDelete(req.params.id);
      console.log(`Notification ${req.params.id} deleted successfully`);
      res.json({ message: 'Notification removed' });
    } else {
      console.log(`Notification ${req.params.id} not found`);
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    console.error(`Error deleting notification: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

export const clearAllNotifications = async (req, res) => {
  console.log(`DELETE /api/notifications hit (Clear All) for user ${req.user._id}`);
  try {
    const result = await Notification.deleteMany({ user: req.user._id });
    console.log(`Cleared ${result.deletedCount} notifications for user ${req.user._id}`);
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error(`Error clearing notifications: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};
