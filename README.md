# Trivia Guru
[LIVE DEMO COMING SOON!](https://)

#### Introduction

Trivia Guru is dedicated to people who would like to broaden their knowledge on a specific topic while having fun at the same time.

This website utilized resources from Open Trivia DB which offers over 4000 trivia questions in over 10 categories! This offsite offers tools that can track your statistics, personal best scores and recent played sessions in each category and difficulty.

The tech stack of this project consists of 
- Frontend - React, Reactstrap, Bootstrap, Noty,
- Backend - NodeJS, PostgreSQL, Json Web Token, Bcrypt

#### Database Schema

![](schemas.png)

#### Functionality

* Both registered and non-registered users can do the trivia quizzes and get a score at the end based on the number of correct answers, the time which takes the user to answer the question, and the maximum combo which user answers correctly in a roll
* Registered users can track their statistics, session record, personal best scores 
* Registered users can save any trivia to favourites
* Registered users can create folders and categorize their favorite trivia
* Registered users can remove their folders and trivia 

#### User Flow

* Users can sign in or register on the homepage
* Users can do the trivia quizzes and view leaderboard scores. However, guest’s score will not be saved
* Only registered users can access their favourites, statistics, personal best scores and recent played sessions at the top navigation bar


#### API

* Open Trivia DB


#### Set up

Prerequisites: Ensure that Git, NodeJS and NPM are already installed on your computer.

1. Make a new directory for this project
2. On your terminal, go to the directory that you just created
    * $ cd NAME_OF_DIRECTORY
3. Git-clone and download the files from github:
    * $ git clone https://
4. Navigate to the backend folder
5. Install all the programs required for the backend by entering this on your terminal
    * $ npm install 
6. To run the backend server on the local host (http://localhost:3001 for backend)
    * $ node server.js 
7. Navigate to the frontend folder
8. Install all the programs required for the frontend by entering this on your terminal
    * $ npm install 
9. 6. To run the frontend server on the local host (http://localhost:3000 for frontend)
    * $ npm start

#### Testing

1. To run test files on the backend, navigate to the backend folder
2. Type the following command on your terminal:
    * $ jest -i
3. To run test files on the frontend, navigate to the frontend folder
4. Type the following command on your terminal:
    * $ npm test