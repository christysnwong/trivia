"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT id,
                username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({
    username,
    password,
    firstName,
    lastName,
    email,
    isAdmin,
  }) {
    const duplicateCheck = await db.query(
      `SELECT username
           FROM users
           WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const userResult = await db.query(
      `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
      [username, hashedPassword, firstName, lastName, email, isAdmin]
    );

    const user = userResult.rows[0];

    await db.query(
      `INSERT INTO stats
            (id)
            VALUES ($1)`,
      [user.id]
    );

    await db.query(
      `INSERT INTO folders
        (user_id, name)
        VALUES ($1, $2)`,
      [user.id, "All"]
    );

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
      `SELECT id,
                  username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           ORDER BY username`
    );

    return result.rows;
  }

  /** Given a username, return personal info about user.
   *
   * Returns { username, first_name, last_name, is_admin, jobs }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
      `SELECT id,
              username,
              first_name AS "firstName",
              last_name AS "lastName",
              email,
              is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
      `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
      [username]
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  /** FOLDERS ========================================================================================== */

  /** Given a username, return user's folders
   *
   * Returns [{folderId, name } ...]
   *
   * Throws NotFoundError if user not found.
   **/

  static async getAllFolders(username) {
    // Get folder 'All' first before fetching others so that folder 'All' will be at first
    // followed by others in order by their names
    const result1 = await db.query(
      `SELECT fo.id AS "folderId", fo.name 
        FROM folders fo JOIN users u ON fo.user_id = u.id
        WHERE u.username = $1 AND fo.name = $2`,
      [username, "All"]
    );

    const result2 = await db.query(
      `SELECT fo.id AS "folderId", fo.name 
        FROM folders fo JOIN users u ON fo.user_id = u.id
        WHERE u.username = $1 AND fo.name != $2
        ORDER BY fo.name`,
      [username, "All"]
    );

    const userAllFolder = result1.rows[0];
    const userFolders = result2.rows;

    return [userAllFolder, ...userFolders];
  }

  /** Given a folder's name, create a folder and return folder's info
   *
   * Returns { folderId, name }
   *
   * Throws BadRequestError if folder name is duplicated or NotFoundError if user not found.
   **/

  static async createFolder({ userId, folderName }) {
    const duplicateCheck = await db.query(
      `SELECT name
           FROM folders
           WHERE user_id = $1 AND name = $2`,
      [userId, folderName]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate folder name: ${folderName}`);
    }

    const result = await db.query(
      `INSERT INTO folders (user_id, name)
        VALUES ($1, $2)
        RETURNING id AS "folderId", name`,
      [userId, folderName]
    );

    const newFolder = result.rows[0];

    return newFolder;
  }

  /** Given a folder id, return user's favourited questions with answers in this folder
   *
   * Returns [{ id, question, answer, folderId, folderName}, ... ]
   *
   * Throws NotFoundError if folder not found.
   **/

  static async getFolderTrivia(folderId) {
    const folderCheck = await db.query(
      `SELECT name
           FROM folders
           WHERE id = $1`,
      [folderId]
    );

    if (!folderCheck.rows[0]) {
      throw new NotFoundError(`No such folder ${folderId}`);
    }

    const result = await db.query(
      `SELECT t.id AS "triviaId", t.question, t.answer, t.folder_id AS "folderId", fo.name AS "folderName"
      FROM trivia t JOIN folders fo ON t.folder_id = fo.id
      WHERE t.folder_id = $1`,
      [folderId]
    );

    let folder;

    if (result.rows[0]) {
      const { folderName } = result.rows[0];
      const trivia = result.rows.map((f) => ({
        id: f.triviaId,
        question: f.question,
        answer: f.answer,
      }));

      folder = { folderId: +folderId, folderName, trivia };
    } else {
      folder = {
        folderId: +folderId,
        folderName: folderCheck.rows[0].name,
        trivia: [],
      };
    }

    return folder;
  }

  /** Given folder's id, rename folder to the new folder name
   *
   * Returns {folderId, name}
   *
   * Throws NotFoundError if folder not found.
   **/

  static async renameFolder(folderId, { userId, newFolderName }) {
    const duplicateCheck = await db.query(
      `SELECT name
           FROM folders
           WHERE user_id = $1 AND name = $2 AND id != $3`,
      [userId, newFolderName, folderId]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate folder name: ${newFolderName}`);
    }

    const result = await db.query(
      `UPDATE folders SET name = '${newFolderName}'
      WHERE id = $1
      RETURNING id AS "folderId", name`,
      [folderId]
    );

    const folder = result.rows[0];

    if (!folder) {
      throw new NotFoundError(`No such folder ${folderId}`);
    }

    return folder;
  }

  /** Given folder's id, delete a user's folder
   *
   * Returns {folderId, name}
   *
   * Throws NotFoundError if folder not found.
   **/

  static async removeFolder(folderId) {
    const checkFolder = await db.query(
      `SELECT name FROM folders 
        WHERE id = $1`, 
        [folderId]
    );

    if (!checkFolder.rows[0]) {
      throw new NotFoundError(`No such folder ${folderId}`);
    }

    if (checkFolder.rows[0].name === "All") {
      throw new BadRequestError(`Folder 'All' cannot be deleted.`); 
    }

    const result = await db.query(
      `DELETE FROM folders 
        WHERE id = $1
        RETURNING id AS "folderId", name`,
      [folderId]
    );

    const removedFolder = result.rows[0];

    return removedFolder;
  }

  /** FAV TRIVIAS ========================================================================================= */

  /** Given a username, get user's favourited trivia
   *
   * Returns [{ id, question, answer, folderId}... ]
   *
   * Throws NotFoundError if user is not found.
   **/

  static async getAllFav(username) {
    const result = await db.query(
      `SELECT t.id, t.question, t.answer, t.folder_id AS "folderId"
        FROM trivia t JOIN users u ON t.user_id = u.id
        WHERE u.username = $1`,
      [username]
    );

    const userFavs = result.rows;

    if (!userFavs.length) {
      throw new NotFoundError(`No user: ${username}`);
    }

    return userFavs;
  }

  /** Given a user_id and foldername, add question and answer to favourites
   *
   * Returns { id, user_id, question, answer, folder_id}
   *
   * Throws NotFoundError if user or folder is not found.
   **/

  static async addToFav({ userId, question, answer, folderName }) {
    const folderCheck = await db.query(
      `SELECT id AS "folderId"
      FROM folders 
      WHERE user_id = $1 AND name = $2`,
      [userId, folderName]
    );

    if (!folderCheck.rows[0]) {
      throw new NotFoundError(`No such user id ${userId} or folder ${folderName}`);
    }
      
    const { folderId } = folderCheck.rows[0];

    const result = await db.query(
      `INSERT INTO trivia 
        (user_id, question, answer, folder_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id AS "triviaId", user_id AS "userId", question, answer, folder_id AS "folderId"`,
      [userId, question, answer, folderId]
    );

    const savedTrivia = result.rows[0];

    return savedTrivia;
  }

  /** Given trivia's id, get and show the trivia data
   *
   * Returns {id, userId, question, answer, folderId}
   *
   * Throws NotFoundError if trivia is not found.
   **/

  static async getTrivia(triviaId) {
    const result = await db.query(
      `SELECT id, user_id AS "userId", question, answer, folder_id AS "folderId"
      FROM trivia 
      WHERE id = $1`,
      [triviaId]
    );

    const trivia = result.rows[0];

    if (!trivia) {
      throw new NotFoundError(`No such trivia with id ${triviaId}`);
    }

    return trivia;
  }

  /** Given trivia's id and target folder name, move the trivia to another folder
   *
   * Returns {id, userId, question, answer, folderId}
   *
   * Throws NotFoundError if trivia or folder is not found.
   **/

  static async moveTrivia(triviaId, folderName) {
    const triviaCheck = await db.query(`SELECT id FROM trivia WHERE id = $1`, [
      triviaId,
    ]);

    if (!triviaCheck.rows[0]) {
      throw new NotFoundError(`No such trivia with id ${triviaId}`);
    }

    const folderCheck = await db.query(
      `SELECT id AS "folderId" from folders WHERE name = $1`,
      [folderName]
    );

    if (!folderCheck.rows[0]) {
      throw new NotFoundError(`No such folder ${folderName}`);
    }

    const { folderId } = folderCheck.rows[0];

    const result = await db.query(
      `UPDATE trivia SET folder_id = $1
        WHERE id = $2
        RETURNING id, user_id AS "user_id", question, answer, folder_id AS "folderId"`,
      [folderId, triviaId]
    );

    const movedTrivia = result.rows[0];

    return movedTrivia;
  }

  /** Given trivia's id, delete a user's trivia
   *
   * Returns { triviaId }
   *
   * Throws NotFoundError if trivia is not found.
   **/

  static async removeTrivia(triviaId) {
    const result = await db.query(
      `DELETE FROM trivia 
        WHERE id = $1
        RETURNING id AS "triviaId"`,
      [triviaId]
    );

    const removedTrivia = result.rows[0];

    if (!removedTrivia) {
      throw new NotFoundError(`No such trivia with id ${triviaId}`);
    }

    return removedTrivia;
  }

  /** STATS ========================================================================================== */

  static calRemainingPts(points) {
    let remainingPts;
    let levelPts;

    if (points >= 0 && points <= 1000) {
      remainingPts = 200 - (points % 200);
      levelPts = 200;
    } else if (points > 1000 && points <= 2000) {
      remainingPts = 200 - ((points - 1000) % 200);
      levelPts = 200;
    } else if (points > 2000 && points <= 3500) {
      remainingPts = 300 - ((points - 2000) % 300);
      levelPts = 300;
    } else if (points > 3500 && points <= 5000) {
      remainingPts = 300 - ((points - 3500) % 300);
      levelPts = 300;
    } else if (points > 5000 && points <= 7500) {
      remainingPts = 500 - ((points - 5000) % 500);
      levelPts = 500;
    } else if (points > 7500 && points <= 10000) {
      remainingPts = 500 - ((points - 7500) % 500);
      levelPts = 500;
    } else if (points > 10000 && points <= 12500) {
      remainingPts = 500 - ((points - 10000) % 500);
      levelPts = 500;
    } else if (points > 12500) {
      remainingPts = 500 - ((points - 12500) % 500);
      levelPts = 500;
    }

    return { remainingPts, levelPts };
  }

  /** Given a username, return user's stats info
   *
   * Returns { userId, username, level, points, quizzesCompleted, remainingPts, levelPts }
   *
   * Throws NotFoundError if user is not found.
   **/

  static async getStats(username) {
    const result = await db.query(
      `SELECT u.id AS "userId", 
              level,
              title,
              quizzes_completed AS "quizzes completed",
              points
           FROM stats s JOIN users u ON s.id = u.id
           WHERE username = $1`,
      [username]
    );

    const userStats = result.rows[0];

    if (!userStats) throw new NotFoundError(`No user: ${username}`);

    let { remainingPts, levelPts } = this.calRemainingPts(userStats.points);
    userStats.remainingPts = remainingPts;
    userStats.levelPts = levelPts;

    return userStats;
  }

  /** Given a username and new points, updates user's stats info
   *
   * Returns { userId, level, title, points, quizzesCompleted, remainingPts, levelPts }
   *
   * Throws NotFoundError if user not found.
   **/

  static async updatePoints(userId, newPoints) {
    const currStats = await db.query(
      `SELECT level, title, points, quizzes_completed
        FROM stats
        WHERE id = $1`,
        [userId]
    )

    if (!currStats.rows[0]) throw new NotFoundError(`No user with id: ${userId}`);

    let { level, title, points, quizzes_completed } = currStats.rows[0];

    points += newPoints;
    quizzes_completed++;

    if (points > 0 && points <= 1000) {
      level = 0 + Math.floor(points / 200);
      title = "Newbie";
    } else if (points > 1000 && points <= 2000) {
      level = 5 + Math.floor((points - 1000) / 200);
      title = "Apprentice";
    } else if (points > 2000 && points <= 3500) {
      level = 10 + Math.floor((points - 2000) / 300);
      title = "Pro";
    } else if (points > 3500 && points <= 5000) {
      level = 15 + Math.floor((points - 3500) / 300);
      title = "Ace";
    } else if (points > 5000 && points <= 7500) {
      level = 20 + Math.floor((points - 5000) / 500);
      title = "Premier";
    } else if (points > 7500 && points <= 10000) {
      level = 25 + Math.floor((points - 7500) / 500);
      title = "Superstar";
    } else if (points > 10000 && points <= 12500) {
      level = 30 + Math.floor((points - 10000) / 500);
      title = "Guru";
    } else if (points > 12500) {
      level = 35 + Math.floor((points - 12500) / 500);
      title = "King";
    }

    const result = await db.query(
      `UPDATE stats
        SET level = $1, title = $2, points = $3, quizzes_completed = $4
        WHERE id = $5
        RETURNING id AS "userId", level, title, points, quizzes_completed AS "quizzes completed"`,
      [level, title, points, quizzes_completed, userId]
    );

    const userStats = result.rows[0];

    let { remainingPts, levelPts } = this.calRemainingPts(userStats.points);
    userStats.remainingPts = remainingPts;
    userStats.levelPts = levelPts;

    return result.rows[0];
  }

  /** Given a username, return user's list of badges
   *
   * Returns [{ badgeName, badgeUrl, date }...]
   *
   * Throws NotFoundError if user is not found.
   **/

  static async getBadges(username) {
    const userCheck = await db.query(
      `SELECT username FROM users 
        WHERE username = $1`, 
        [username]
    );

    if (!userCheck.rows[0])
      throw new NotFoundError(`No user with username: ${username}`);

    const result = await db.query(
      `SELECT b.badge_name AS "badgeName", b.badge_url AS "badgeUrl", b.date
        FROM badges b JOIN users u ON b.user_id = u.id
        WHERE u.username = $1
        ORDER BY date desc`,
      [username]
    );

    if (!result.rows[0]) return [];

    const formattedBadgeInfo = result.rows.map((b) => ({
      badgeName: b.badgeName,
      badgeUrl: b.badgeUrl,
      date: moment(b.date).format("MMM Do YYYY, h:mma"),
    }));

    return formattedBadgeInfo;
  }

  /** Given a user id and badge name, add a badge to user's account
   *
   * Returns { badgeName, badgeUrl, date }
   *
   **/

  static async postBadge({ userId, badge }) {
    const userCheck = await db.query(
      `SELECT id FROM users 
        WHERE id = $1`,
        [userId]
    );

    if (!userCheck.rows[0]) throw new NotFoundError(`No such user with id: ${userId}`);

    const duplicateBadgeCheck = await db.query(
      `SELECT user_id, badge_name 
        FROM badges
        WHERE user_id = $1 AND badge_name = $2`,
      [userId, badge]
    );

    if (duplicateBadgeCheck.rows[0]) {
      return "The user has already earned this badge.";
    }

    const currTime = new Date();

    const result = await db.query(
      `INSERT INTO badges
        (user_id, badge_name, badge_url, date)
        VALUES ($1, $2, $3, $4) 
        RETURNING badge_name AS "badgeName", badge_url AS "badgeUrl", date`,
      [userId, badge, `/badges/${badge.toLowerCase()}.gif`, currTime]
    );

    return result.rows[0];
  }

  /** SCORES ========================================================================================== */

  /** Given a username, return user's top scores in each category
   *  If category and difficulty are provided, this will return user's top score in the specified category
   *
   * Returns [{ category, difficulty, score, points, date }...]
   *
   * Throws NotFoundError if user or score data not found.
   **/

  static async getScores(username, category, difficulty) {
    let query = `SELECT c.name AS "category", d.difficulty, score, points, date 
          FROM personal_best p JOIN categories c ON p.category_id = c.id JOIN users u ON p.user_id = u.id
          JOIN difficulties d ON p.difficulty_type = d.type `;

    let count = 1;
    let whereExp = "WHERE u.username = $1 ";
    let orderByExp = "ORDER BY c.name, p.difficulty_type";
    let queryVals = [username];

    if (category) {
      count++;
      whereExp += `AND c.name = $${count} `;
      queryVals.push(category);
    }

    if (difficulty) {
      count++;
      whereExp += `AND d.difficulty = $${count} `;
      queryVals.push(difficulty);
    }

    query += whereExp + orderByExp;

    const result = await db.query(query, queryVals);

    // if no score data
    if (!result.rows[0]) return 0;

    const topScores = result.rows;

    const formattedTopScores = topScores.map((s) => ({
      category: s.category,
      difficulty: s.difficulty,
      score: s.score,
      points: s.points,
      date: moment(s.date).format("MMM Do YYYY, h:mma"),
    }));

    return formattedTopScores;
  }

  /** Given a user id, category, difficulty, score and points, update user's score
   *  if it's greater than the previous score
   *
   * Returns [{ category_id, difficulty_type, score, points, date }...]
   *
   * Throws NotFoundError if the category or difficulty is not found.
   **/

  static async updateScore({ userId, category, difficulty, score, points }) {
    const catCheck = await db.query(
      `SELECT id FROM categories WHERE name = $1`,
      [category]
    );

    if (!catCheck.rows[0]) throw new NotFoundError(`No such category ${category}`);
    
    const { id: categoryId } = catCheck.rows[0];

    const diffCheck = await db.query(
      `SELECT type FROM difficulties WHERE difficulty= $1`,
      [difficulty]
    );

    if (!diffCheck.rows[0]) throw new NotFoundError(`No such difficulty ${difficulty}`);

    const { type: difficultyType } = diffCheck.rows[0];

    const userCheck = await db.query(
      `SELECT id FROM users
        where id = $1`,
      [userId]
    );

    if (!userCheck.rows[0])
      throw new NotFoundError(`No such user with id: ${userId}`);

    const pointsCheck = await db.query(
      `SELECT points
          FROM personal_best
          WHERE user_id = $1 AND category_id = $2 AND difficulty_type = $3`,
      [userId, categoryId, difficultyType]
    );

    let oldPoints;

    if (pointsCheck.rows.length === 0) {
      oldPoints = 0;
    } else {
      const { points } = pointsCheck.rows[0];
      oldPoints = points;
    }

    const currTime = new Date();

    let result;

    if (!oldPoints) {
      result = await db.query(
        `INSERT INTO personal_best
           (category_id,
            difficulty_type,
            user_id,
            score,
            points,
            date)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING category_id, difficulty_type, score, points, date`,
        [categoryId, difficultyType, userId, score, points, currTime]
      );
    } else if (oldPoints && points >= oldPoints) {
      result = await db.query(
        `UPDATE personal_best
          SET score = $1, points = $2, date = $3
          WHERE user_id = $4 and category_id = $5 and difficulty_type = $6
          RETURNING category_id, difficulty_type, score, points, date`,
        [score, points, currTime, userId, categoryId, difficultyType]
      );
    } else {
      return "Not updated as the new score is less than or equal to the old score.";
    }

    return result.rows[0];
  }

  /** Get top leaderboard scores in each category
   * If category and difficulty are provided, this will return top score in the specified fields
   *
   * Returns [{ category, difficulty, score, points, date }...]
   *
   **/

  static async getLeaderboardScores(category, difficulty) {
    let query = `SELECT c.name AS "category", d.difficulty, u.username, score, points, date 
          FROM leaderboard l 
          JOIN categories c ON l.category_id = c.id 
          JOIN difficulties d ON l.difficulty_type = d.type
          JOIN users u ON l.user_id = u.id `;

    let count = 0;
    let whereExp = "";
    let orderByExp = "ORDER BY c.name, l.difficulty_type";
    let queryVals = [];

    if (category) {
      count++;
      whereExp += `WHERE c.name = $${count} `;
      queryVals.push(category);
    }

    if (difficulty) {
      count++;
      whereExp += `AND d.difficulty = $${count} `;
      queryVals.push(difficulty);
    }

    query += whereExp + orderByExp;

    const result = await db.query(query, queryVals);

    // if no score data
    if (!result.rows[0]) return 0;

    const topScores = result.rows;

    const formattedTopScores = topScores.map((s) => ({
      category: s.category,
      difficulty: s.difficulty,
      username: s.username,
      score: s.score,
      points: s.points,
      date: moment(s.date).format("MMM Do YYYY, h:mma"),
    }));

    return formattedTopScores;
  }

  /** Given a user id, category, difficulty, score and points, update user's score
   *  if it's greater than the previous score
   *
   * Returns [{ category_id, difficulty_type, score, points, date }...]
   *
   * Throws NotFoundError if the category or difficulty is not found.
   **/

  static async updateLeaderboardScore({
    userId,
    category,
    difficulty,
    score,
    points,
  }) {
    const catCheck = await db.query(
      `SELECT id FROM categories WHERE name = $1`,
      [category]
    );

    if (!catCheck.rows[0])
      throw new NotFoundError(`No such category ${category}`);

    const { id: categoryId } = catCheck.rows[0];

    const diffCheck = await db.query(
      `SELECT type FROM difficulties WHERE difficulty= $1`,
      [difficulty]
    );

    if (!diffCheck.rows[0])
      throw new NotFoundError(`No such difficulty ${difficulty}`);

    const { type: difficultyType } = diffCheck.rows[0];

    const userCheck = await db.query(
      `SELECT id FROM users
        where id = $1`, [userId]
    );

    if (!userCheck.rows[0])
      throw new NotFoundError(`No such user with id: ${userId}`);

    const pointsCheck = await db.query(
      `SELECT points
          FROM leaderboard
          WHERE category_id = $1 AND difficulty_type = $2`,
      [categoryId, difficultyType]
    );

    

    let oldPoints;

    if (pointsCheck.rows.length === 0) {
      oldPoints = 0;
    } else {
      const { points } = pointsCheck.rows[0];
      oldPoints = points;
    }

    const currTime = new Date();

    let result;

    if (!oldPoints && points > 80) {
      result = await db.query(
        `INSERT INTO leaderboard
           (category_id,
            difficulty_type,
            user_id,
            score,
            points,
            date)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING category_id, difficulty_type, user_id, score, points, date`,
        [categoryId, difficultyType, userId, score, points, currTime]
      );
    } else if (oldPoints && points >= oldPoints) {
      result = await db.query(
        `UPDATE leaderboard
          SET score = $1, points = $2, date = $3, user_id = $4
          WHERE category_id = $5 and difficulty_type = $6
          RETURNING category_id, difficulty_type, user_id, score, points, date`,
        [score, points, currTime, userId, categoryId, difficultyType]
      );
    } else {
      return "Not updated as the new score is less than or equal to the old score.";
    }

    return result.rows[0];
  }

  /** SESSIONS ========================================================================================= */

  /** Given a username, return user's played trivia sessions
   *
   * Returns [{ id, category, difficulty, score, points, date }...]
   *
   * Throws NotFoundError if the user is not found.
   **/

  static async getSessions(username, limit) {
    const userCheck = await db.query(
      `SELECT username FROM users 
        WHERE username = $1`,
      [username]
    );

    if (!userCheck.rows[0])
      throw new NotFoundError(`No user with username: ${username}`);

    let query = `SELECT p.id, c.name AS "category", d.difficulty, p.score, p.points, p.date
          FROM played_sessions p 
          JOIN users u ON p.user_id = u.id
          JOIN categories c ON p.category_id = c.id 
          JOIN difficulties d ON p.difficulty_type = d.type
          WHERE username = $1
          ORDER BY p.date DESC`;

    let queryVals = [username];

    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    const result = await db.query(query, queryVals);

    if (!result.rows[0]) return [];

    const userSessions = result.rows;

    const formattedUserSessions = userSessions.map((userSession) => ({
      id: userSession.id,
      category: userSession.category,
      difficulty: userSession.difficulty,
      score: userSession.score,
      points: userSession.points,
      date: moment(userSession.date).format("MMM Do YYYY, h:mma"),
    }));

    return formattedUserSessions;
  }

  /** Given a userId, category, difficulty, score and points, add played sessions
   *
   * Returns { id, category_id, difficulty_type, score, points, date }
   *
   * Throws NotFoundError if the category or difficulty is not found.
   * Also checks stored sessions in database to see if it exceeds the session storage limit per user
   **/

  static async addSession({
    sessionId,
    userId,
    category,
    difficulty,
    score,
    points,
  }) {
    const userCheck = await db.query(
      `SELECT id FROM users 
        WHERE id = $1`,
      [userId]
    );

    if (!userCheck.rows[0])
      throw new NotFoundError(`No user with id: ${userId}`);
    
    const sessionCheck = await db.query(
      `SELECT session_id from played_sessions
        WHERE session_id = $1`,
      [sessionId]
    );

    if (sessionCheck.rows[0]) throw new BadRequestError(`Duplicate session`);

    const catCheck = await db.query(
      `SELECT id FROM categories WHERE name = $1`,
      [category]
    );

    if (!catCheck.rows[0]) throw new NotFoundError(`No such category ${category}`);
    
    const { id: categoryId } = catCheck.rows[0];


    const diffCheck = await db.query(
      `SELECT type FROM difficulties WHERE difficulty = $1`,
      [difficulty]
    );

    if (!diffCheck.rows[0]) throw new NotFoundError(`No such difficulty ${difficulty}`);
    
      const { type: difficultyType } = diffCheck.rows[0];


    const currTime = new Date();

    const result = await db.query(
      `INSERT INTO played_sessions
           (user_id,
            session_id,
            category_id,
            difficulty_type,
            score,
            points,
            date)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING category_id, difficulty_type, score, points, date`,
      [userId, sessionId, categoryId, difficultyType, score, points, currTime]
    );

    await this.updatePoints(userId, points);
    await this.checkSessionLimit(userId);

    return result.rows[0];
  }

  /** Given a userId, check the number of sessions user has played
   * If stored session exceeds the session storage limit, remove the oldest session record
   *
   * Returns undefined
   *
   **/

  static async checkSessionLimit(userId) {
    const SESSIONLIMIT = 15;

    const result = await db.query(
      `SELECT id, date
          FROM played_sessions 
          WHERE user_id = $1
          ORDER BY date`,
      [userId]
    );

    const sessions = result.rows;

    if (sessions.length > SESSIONLIMIT) {
      await this.deleteSession(sessions[0].id);
    }
  }

  /** Given a session id, delete a user's played session
   *
   * Returns { id, category_id, difficulty_type, score, points, date }
   *
   **/

  static async deleteSession(id) {
    const result = await db.query(
      `DELETE FROM played_sessions 
        WHERE id = $1
        RETURNING id, session_id, user_id, category_id, difficulty_type, score, points, date`,
      [id]
    );

    return result.rows[0];
  }

  /** Given a username, return user's played counts in all or specified category / difficulty
   *
   * Returns [{ userId, category, difficulty, played }...]
   *
   * Throws NotFoundError if the user or played history is not found.
   **/

  static async getPlayedCounts(username, category, difficulty) {
    const userCheck = await db.query(
      `SELECT username FROM users 
        WHERE username = $1`,
      [username]
    );

    if (!userCheck.rows[0])
      throw new NotFoundError(`No user with username: ${username}`);

    let query = `SELECT c.name AS "category", d.difficulty, played 
          FROM played_counts p JOIN categories c ON p.category_id = c.id JOIN users u ON p.user_id = u.id
          JOIN difficulties d ON p.difficulty_type = d.type `;

    let count = 1;
    let whereExp = "WHERE u.username = $1 ";
    let orderByExp = "ORDER BY c.name, p.difficulty_type";
    let queryVals = [username];

    if (category) {
      count++;
      whereExp += `AND c.name = $${count} `;
      queryVals.push(category);
    }

    if (difficulty) {
      count++;
      whereExp += `AND d.difficulty = $${count} `;
      queryVals.push(difficulty);
    }

    query += whereExp + orderByExp;

    const result = await db.query(query, queryVals);

    const playedCounts = result.rows;

    if (!playedCounts[0])
      return {
        category,
        difficulty,
        played: 0,
      };

    return playedCounts;
  }

  /** Given userId, category and difficulty, update user's played counts in that category / difficulty
   *
   * Returns { userId, category, difficulty, played }
   *
   * Throws NotFoundError if the category or difficulty is not found.
   **/

  static async updatePlayedCounts({
    userId,
    category,
    difficulty,
    setPlayed = 1,
  }) {
    const catCheck = await db.query(
      `SELECT id FROM categories WHERE name = $1`,
      [category]
    );

    if (!catCheck.rows[0]) throw new NotFoundError(`No such category ${category}`);
    
    const { id: categoryId } = catCheck.rows[0];


    const diffCheck = await db.query(
      `SELECT type FROM difficulties WHERE difficulty= $1`,
      [difficulty]
    );

    if (!diffCheck.rows[0]) throw new NotFoundError(`No such difficulty ${difficulty}`);

    const { type: difficultyType } = diffCheck.rows[0];


    const playedNumsCheck = await db.query(
      `SELECT played
          FROM played_counts
          WHERE user_id = $1 AND category_id = $2 AND difficulty_type = $3`,
      [userId, categoryId, difficultyType]
    );

    let playedCounts;

    if (!playedNumsCheck.rows[0]) {
      playedCounts = 0;
    } else {
      const { played } = playedNumsCheck.rows[0];
      playedCounts = played;
    }

    let result;

    if (!playedCounts) {
      playedCounts += setPlayed;

      result = await db.query(
        `INSERT INTO played_counts
           (user_id,
            category_id,
            difficulty_type,
            played)
           VALUES ($1, $2, $3, $4)
           RETURNING category_id, difficulty_type, played`,
        [userId, categoryId, difficultyType, playedCounts]
      );
    } else {
      playedCounts += setPlayed;
      result = await db.query(
        `UPDATE played_counts
          SET played = $1
          WHERE user_id = $2 and category_id = $3 and difficulty_type = $4
          RETURNING category_id, difficulty_type, played`,
        [playedCounts, userId, categoryId, difficultyType]
      );
    }

    return result.rows[0];
  }
}
  



module.exports = User;

