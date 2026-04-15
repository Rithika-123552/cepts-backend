import Message from '../models/Message.js';
import Notification from '../models/Notification.js';

export const sendMessage = async (req, res) => {
  const { receiverId, courseId, content } = req.body;

  try {
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      course: courseId,
      content
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user._id })
      .populate('course', 'title')
      .populate('sender', 'name')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (message) {
      if (message.receiver.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
      }
      await message.deleteOne();
      res.json({ message: 'Message removed' });
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearMessages = async (req, res) => {
  try {
    await Message.deleteMany({ receiver: req.user._id });
    res.json({ message: 'All messages cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
