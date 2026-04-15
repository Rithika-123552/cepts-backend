import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  name: { type: String, required: true }, 
  description: { type: String },
  icon: { type: String }, 
  earnedAt: { type: Date, default: Date.now }
});

const Badge = mongoose.model('Badge', badgeSchema);
export default Badge;
