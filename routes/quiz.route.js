const express = require('express');
const { QuizModel } = require('../models/quiz.model');
const { ResponseModel } = require('../models/response.model');
const cron = require('node-cron');
const quizRouter = express.Router();

// Define a Cron Job to update quiz statuses and retrieve results every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();

    // Update quiz statuses
    await QuizModel.updateMany(
      { startDate: { $lte: now }, endDate: { $gte: now } },
      { $set: { status: 'active' } }
    );

    await QuizModel.updateMany(
      { endDate: { $lt: now } },
      { $set: { status: 'finished' } }
    );

    console.log('Quiz statuses updated successfully.');

    // Retrieve quiz results after 5 minutes of the quiz's end time
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);

    const quizzesToRetrieveResults = await QuizModel.find({
      endDate: { $lt: now, $gte: fiveMinutesAgo },
      processed: { $ne: true },
    });

    for (const quiz of quizzesToRetrieveResults) {
      quiz.processed = true;
      await quiz.save();

      const userResponses = await ResponseModel.findOne({ quizId: quiz._id });

      if (!userResponses) {
        console.log(`User responses not found for quiz with ID ${quiz._id}`);
        continue;
      }

      const quizResult = quiz.questions.map((question, index) => {
        const correctAnswer = question.rightAnswer;
        const userAnswer = userResponses.userAnswers[index];
        const isCorrect = userAnswer === correctAnswer;

        return { questionIndex: index, isCorrect, userAnswer, correctAnswer };
      });

      const quizDetails = {
        quizId: quiz._id,
        endTime: quiz.endDate,
        additionalInfo: 'This quiz covers a variety of topics and is designed to test your knowledge in an engaging way.',
      };

      // Send the quiz result or do further processing
      console.log(`Quiz Result for Quiz ID ${quiz._id}:`, { quizResult, quizDetails });
    }
  } catch (error) {
    console.error('Error processing quizzes:', error.message);
  }
});

// Create a quiz
quizRouter.post("/quizzes", async (req, res) => {
  try {
    const quiz = await QuizModel.create(req.body);
    res.status(201).json({ quiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get the active quiz
quizRouter.get("/quizzes/active", async (req, res) => {
  try {
    const now = new Date();
    const activeQuizzes = await QuizModel.find({ startDate: { $lte: now }, endDate: { $gte: now } });
    res.json({ activeQuizzes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Result of quiz
quizRouter.get('/quizzes/:id/result', async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await QuizModel.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Retrieve user responses based on the quiz ID
    const userResponses = await ResponseModel.findOne({ quizId });

    if (!userResponses) {
      return res.status(404).json({ message: 'User responses not found for this quiz' });
    }

    // Logic to calculate and return quiz result
    const quizResult = quiz.questions.map((question, index) => {
      const correctAnswer = question.rightAnswer;
      const userAnswer = userResponses.userAnswers[index];

      // Check if the user's answer is equal to the correct answer
      const isCorrect = userAnswer === correctAnswer;

      return { questionIndex: index, isCorrect, userAnswer, correctAnswer };
    });

    res.json({ quizResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User responses
quizRouter.post('/quizzes/:id/responses', async (req, res) => {
  try {
    const quizId = req.params.id;
    const userAnswers = req.body.userAnswers;

    // Check if the quiz exists
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Create or update user responses
    let response = await ResponseModel.findOne({ quizId });
    if (!response) {
      response = await ResponseModel.create({ quizId, userAnswers });
    } else {
      response.userAnswers = userAnswers;
      await response.save();
    }

    res.status(201).json({ message: 'User responses saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Quizzes
quizRouter.get('/quizzes/all', async (req, res) => {
  try {
    const quizzes = await QuizModel.find();
    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { quizRouter };
