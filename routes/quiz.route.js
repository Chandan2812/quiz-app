const express = require('express');
const { QuizModel } = require('../models/quiz.model');
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

      const quizResult = quiz.questions.map((question, index) => {
        const correctAnswer = question.rightAnswer;
        return { questionIndex: index, correctAnswer };
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

    // Logic to calculate and return quiz result without user responses
    const quizResult = quiz.questions.map((question, index) => {
      const correctAnswer = question.rightAnswer;

      // Include only the correct answer and question index
      return { questionIndex: index, correctAnswer };
    });

    const quizDetails = {
      quizId: quiz._id,
      endTime: quiz.endDate,
      additionalInfo: 'This quiz covers a variety of topics and is designed to test your knowledge in an engaging way.',
    };

    res.json({ msg:"You will receive the result after 5 minutes from the end time of the quiz.",endTime:quiz.endDate });
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
