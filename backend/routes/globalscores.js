"use strict";

/** Routes for global scores */

const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const User = require("../models/user");

const router = new express.Router();


/** GET /  => { topGlobalScores: [{ category, difficulty, score, points, date }...]}
 *
 * Get user's highest score in specified category and difficulty
 * if queries are unspecified, get all user's highest score in each category / difficulty
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.get(
  "/",
  async function (req, res, next) {
    try {

      let { category, difficulty } = req.query;
      
      // category = decodeURIComponent(category);

      const topGlobalScores = await User.getGlobalScores(category, difficulty);
      return res.json({ topGlobalScores });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /  data => { updated: { category, difficulty, score, points, date } }
 *
 * Data includes userId, category, difficulty, score, points
 * Update user's score in a specified category and difficulty
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.post(
  "/",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const newGlobalScore = await User.updateGlobalScore(req.body);
      return res.json({ updated: newGlobalScore });
    } catch (err) {
      return next(err);
    }
  }
);


module.exports = router;