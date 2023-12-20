# Quiz Application

Welcome to the Quiz Application, a RESTful API for creating and participating in timed quizzes.

## Features

- Create quizzes with questions, options, and correct answers.
- Retrieve the currently active quiz within the start and end time.
- Get quiz results after 5 minutes of the quiz's end time.
- View a list of all quizzes, including inactive and finished ones.

- ## Prerequisites

Make sure you have the following installed on your system:

- Node.js (version 16 or later)
- MongoDB
- npm (Node Package Manager)

## Endpoints

1. **Create a Quiz:**
   - `POST /quizzes`

2. **Get Active Quiz:**
   - `GET /quizzes/active`

3. **Get Quiz Result:**
   - `GET /quizzes/:id/result`

4. **Get All Quizzes:**
   - `GET /quizzes/all`

5. **Post User Responses:**
   - `POST /quizzes/:id/responses`
