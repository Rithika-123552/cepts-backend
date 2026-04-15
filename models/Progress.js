import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedContent: [Number], 
  percentage: { type: Number, default: 0 },
  lastMilestoneReached: { type: Number, default: 0 }, 
  updatedAt: { type: Date, default: Date.now }
});

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
