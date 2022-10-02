"use strict"

/** Routes for quizzes */


const express = require("express");
const axios = require("axios");

const router = new express.Router();

const API_URL = "https://opentdb.com/api.php?amount=10";

router.get("/", async function (req, res, next) {
    try {

        console.log("backend - quizzes", req.query);

        let resp = await axios.get(API_URL, {
          params: {
            category: req.query.category,
            difficulty: req.query.difficulty,
            type: "multiple",
          },
        });

        let results = resp.data.results.map( q => {
            // let regex = /&#039;|&quot;/g;
            // q.question = q.question.replaceAll(regex, "'");
            // q.correct_answer = q.correct_answer.replace(regex, "'");
            // q.incorrect_answers = q.incorrect_answers.map(ans => ans.replace(regex, "'"));

            const shuffle = (array) => {
              let counter = array.length;

              while (counter > 0) {
                let randIdx = Math.floor(Math.random() * counter);
                counter--;

                [array[counter], array[randIdx]] = [
                  array[randIdx],
                  array[counter],
                ];
              }

              return array;
            };

            q.answers = shuffle([q.correct_answer, ...q.incorrect_answers])


            return q;
        })


        return res.json(results);

    } catch (err) {
        return next(err);
    }

})




module.exports = router;