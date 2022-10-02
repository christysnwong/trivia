"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin, jobs }
 *   where jobs is { id, title, companyHandle, companyName, state }
 *
 * Authorization required: admin or same user-as-:username
 **/

router.get(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.patch(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userUpdateSchema);
        if (!validator.valid) {
          const errs = validator.errors.map((e) => e.stack);
          throw new BadRequestError(errs);
        }

      const user = await User.update(req.params.username, req.body);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.delete(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      await User.remove(req.params.username);
      return res.json({ deleted: req.params.username });
    } catch (err) {
      return next(err);
    }
  }
);

/** FOLDERS ========================================================================================== */

/** GET /[username]/folders => { folders: [{folderId, name} ...] }
 *
 * Get all folders for that user
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.get(
  "/:username/folders",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const folders = await User.getAllFolders(req.params.username);
      return res.json({ folders });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /[username]/folders folderName => { created: { folderId, name} }
 *
 * Create a new folder for the user
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.post(
  "/:username/folders",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const folder = await User.createFolder(req.body);
      return res.json({ created: folder });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /[username]/folders/[folderId] => { folder: {folderId, folderName, trivia} }
 * where trivia is [{ id, question, answer, folderId, folderName}, ... ]
 *
 * Get a user's favourited trivia in this folder
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.get(
  "/:username/folders/:folderId",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const folder = await User.getFolderTrivia(req.params.folderId);

      return res.json({ folder });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /[username]/folders/[folderId] newFolderName => { updated: {folderId, name} }
 *
 * Rename a user's folder
 * Data includes new folder name
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.patch(
  "/:username/folders/:folderId",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const folder = await User.renameFolder(
        req.params.folderId,
        req.body.newFolderName
      );

      return res.json({ updated: folder });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[username]/folders/[folderId]  =>  { deleted: {folderId, name} }
 *
 * Delete a user's folder
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.delete(
  "/:username/folders/:folderId",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const removedFolder = await User.removeFolder(req.params.folderId);
      return res.json({ deleted: removedFolder });
    } catch (err) {
      return next(err);
    }
  }
);

/** FAV TRIVIAS ======================================================================================= */

/** GET /[username]/fav/ => { trivia: [{ id, question, answer, folderId } ... }
 *
 * Get a username, return this user's all favourited trivia
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.get(
  "/:username/fav",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const trivias = await User.getAllFav(req.params.username);
      return res.json({ trivias });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /[username]/fav {trivia} => { trivia: { id, userId, question, answer, folderId } }
 *
 * Add a trivia to favourite
 * Trivia data includes user id, question, answer, folder name
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.post(
  "/:username/fav",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const newTrivia = await User.addToFav(req.body);
      return res.json({ added: newTrivia });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /[username]/fav/[triviaId] => { trivia: { id, userId, question, answer, folderId } }
 *
 * Get a trivia's info
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.get(
  "/:username/fav/:triviaId",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const trivia = await User.getTrivia(req.params.triviaId);
      return res.json({ trivia });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /[username]/fav/[triviaId] folderName => { trivia: { id, userId, question, answer, folderId } }
 *
 * Data includes new folder name
 * Move a trivia to another folder
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.patch(
  "/:username/fav/:triviaId",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const trivia = await User.moveTrivia(
        req.params.triviaId,
        req.body.folderName
      );
      return res.json({ trivia });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[username]/fav/[triviaId]  => { deleted: { triviaId } }
 *
 * Remove a trivia from favourites
 * Authorization required: admin or same-user-as-:username
 **/

router.delete(
  "/:username/fav/:triviaId",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {

    try {
      const deletedTrivia = await User.removeTrivia(req.params.triviaId);
      return res.json({ deleted: deletedTrivia });
    } catch (err) {
      return next(err);
    }
  }
);

/** STATS ========================================================================================== */

/** GET /[username]/stats => { stats: { userId, username, level, points, quizzesCompleted }}
 *
 * Get user's stats
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.get(
  "/:username/stats",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const stats = await User.getStats(req.params.username);
      return res.json({ stats });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /[username]/stats new points => { stats: { userId, username, level, points, quizzesCompleted }}
 *
 * Update user's stats
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.post(
  "/:username/stats",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const stats = await User.updatePoints(
        req.params.username,
        req.body.newPoints
      );
      return res.json({ updated: stats });
    } catch (err) {
      return next(err);
    }
  }
);

/** SCORES ========================================================================================== */

/** GET /[username]/scores  => { topScores: [{ category, difficulty, score, points, date }...]}
 *
 * Get user's personal best score in specified category and difficulty
 * If queries are unspecified, get all user's highest score in each category / difficulty
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.get(
  "/:username/scores",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {

      let { category, difficulty } = req.query;

      const topScores = await User.getScores(req.params.username, category, difficulty);
      return res.json({ topScores });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /[username]/scores  data => { updated: { category, difficulty, score, points, date } }
 *
 * Data includes userId, category, difficulty, score, points
 * Update user's score in a specified category and difficulty
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.post(
  "/:username/scores",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const newScore = await User.updateScore(req.body);
      return res.json({ updated: newScore });
    } catch (err) {
      return next(err);
    }
  }
);


/** SESSIONS ========================================================================================= */

/** GET /[username]/sessions  => { sessions: [{ id, category, difficulty, score, points, date }...}
 *
 * Get user's played session 
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.get(
  "/:username/sessions",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const sessions = await User.getSessions(req.params.username);
      return res.json({ sessions });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /[username]/sessions  data => { added: { id, category_id, difficulty_type, score, points, date }}
 *
 * Data includes userId, category, difficulty, score, points
 * Add user's played session 
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.post(
  "/:username/sessions",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const newSession = await User.addSession(req.body);
      return res.json({ added: newSession });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[username]/sessions  sessionId => 
 * { deleted: { id, category_id, difficulty_type, score, points, date }}
 *
 * Delete a user's played session 
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.delete(
  "/:username/sessions",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const deletedSession = await User.deleteSession(req.body.sessionId);
      return res.json({ deleted: deletedSession });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /[username]/playedCounts  => { playedCounts: [{ userId, category, difficulty, played }...}
 *
 * Get user's played counts in specified category and difficulty
 * If queries are unspecified, get all user's played counts in each category / difficulty
 * Authorization required: admin or same-user-as-:username
 *
 **/


router.get(
  "/:username/playedcounts",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      let { category, difficulty } = req.query;

      const playedCounts = await User.getPlayedCounts(
        req.params.username,
        category,
        difficulty
      );
      return res.json({ playedCounts });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /[username]/playedCounts data => { updated: { userId, category, difficulty, played }}
 *
 * Data includes user id, category and difficulty
 * Add user's played counts in specified category and difficulty
 * Authorization required: admin or same-user-as-:username
 *
 **/

router.post(
  "/:username/playedcounts",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const playedCounts = await User.updatePlayedCounts(req.body);
      return res.json({ updated: playedCounts });
    } catch (err) {
      return next(err);
    }
  }
);


module.exports = router;
