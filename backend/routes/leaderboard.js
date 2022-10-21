"use strict";

/** Routes for leaderboard scores */

const jsonschema = require("jsonschema");
const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const User = require("../models/user");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const scoreUpdateSchema = require("../schemas/scoreUpdate.json");

const router = new express.Router();


/** GET /,  => { topLeaderboardScores: [{ category, difficulty, score, points, date }...]}
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

      const topLeaderboardScores = await User.getLeaderboardScores(
        category,
        difficulty
      );
      return res.json({ topLeaderboardScores });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /,  data => { updated: { category, difficulty, score, points, date } }
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

      const validator = jsonschema.validate(req.body, scoreUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const newLeaderboardScore = await User.updateLeaderboardScore(req.body);
      
      if (newLeaderboardScore.category_id) {
        return res.json({ updated: newLeaderboardScore });
      } else {
        return res.json(newLeaderboardScore);
      }

    } catch (err) {
      return next(err);
    }
  }
);


module.exports = router;