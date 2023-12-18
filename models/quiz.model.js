const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  rightAnswer: { type: Number, required: true },
});

const quizSchema = new mongoose.Schema({
  questions: [questionSchema],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'finished'], default: 'inactive' },
});

const QuizModel = mongoose.model('Quiz', quizSchema);

module.exports = {QuizModel};
