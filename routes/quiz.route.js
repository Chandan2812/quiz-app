const express=require('express');
const {QuizModel}=require('../models/quiz.model');
const quizRouter=express.Router();
const cron = require('node-cron');


// Define a Cron Job to update quiz statuses every minute
cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      await QuizModel.updateMany(
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { $set: { status: 'active' } }
      );

      await QuizModel.updateMany(
        { endDate: { $lt: now } },
        { $set: { status: 'finished' } }
      );
  
      console.log('Quiz statuses updated successfully.');
    } catch (error) {
      console.error('Error updating quiz statuses:', error.message);
    }
  });

//creating a quiz
quizRouter.post("/quizzes",async(req,res)=>{
    try {
        const quiz = await QuizModel.create(req.body);
        res.status(201).json({ quiz });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
})


//Getting the active quiz
quizRouter.get("/quizzes/active",async(req,res)=>{
    try {
        const now = new Date();

        const activeQuizzes = await QuizModel.find({ startDate: { $lte: now }, endDate: { $gte: now } });

        res.json({ activeQuizzes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})



module.exports={quizRouter}