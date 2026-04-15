import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: [{
    type: { type: String, enum: ['paragraph', 'table', 'code'], required: true },
    content: { type: String }, 
    rows: [[String]], 
    language: { type: String }, 
    code: { type: String } 
  }],
  quizzes: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true } 
  }],
  createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);
export default Course;
