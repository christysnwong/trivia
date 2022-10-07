"use strict";

/** Routes for quizzes */

const express = require("express");
const axios = require("axios");

const router = new express.Router();

const API_URL = "https://opentdb.com/api.php?amount=10";

router.get("/", async function (req, res, next) {
  try {
    let resp = await axios.get(API_URL, {
      params: {
        category: req.query.category,
        difficulty: req.query.difficulty,
      },
    });

    if (resp.data.results.length === 0) {
      return res.json("NA");
    }

    let results = resp.data.results.map((q) => {
      const shuffle = (array) => {
        let counter = array.length;

        while (counter > 0) {
          let randIdx = Math.floor(Math.random() * counter);
          counter--;

          [array[counter], array[randIdx]] = [array[randIdx], array[counter]];
        }

        return array;
      };

      q.answers = shuffle([q.correct_answer, ...q.incorrect_answers]);

      return q;
    });

    return res.json(results);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
