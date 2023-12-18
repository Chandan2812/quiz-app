const express = require('express');
const {Connection} = require("./config/db");
require("dotenv").config()
const  {quizRouter}=require("./routes/quiz.route")

const PORT=process.env.PORT || 8000

const app=express()

app.use(express.json())

app.use("/",quizRouter)


app.listen(PORT,async()=>{
    try {
        await Connection
        console.log("Connected to DB")
    } catch (error) {
        console.log('failed to connect to DB')
    }
    console.log(`Server running @ ${PORT}`);
})