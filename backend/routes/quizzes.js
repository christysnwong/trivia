"use strict";

/** Routes for quizzes */

const express = require("express");
const axios = require("axios");

const router = new express.Router();

const { shuffle } = require("../helpers/shuffle");

const API_URL = "https://opentdb.com/api.php";

router.get("/", async function (req, res, next) {
  try {
    let resp = await axios.get(API_URL, {
      params: {
        amount: "10",
        category: req.query.category,
        difficulty: req.query.difficulty,
      },
    });

    if (resp.data.results.length === 0) {
      return res.json("NA");
    }

    let quizData = resp.data.results.map((q) => {
      q.answers = shuffle([q.correct_answer, ...q.incorrect_answers]);

      return q;
    });

    return res.json({ quizData });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
