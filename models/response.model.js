const mongoose = require('mongoose');

const responseSchema = mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  userAnswers: { type: Array, required: true },
});

const ResponseModel = mongoose.model('Response', responseSchema);

module.exports = { ResponseModel };
