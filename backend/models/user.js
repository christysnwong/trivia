"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
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
      `SELECT username,
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
            (user_id)
            VALUES ($1)`,
            [user.id]
    );

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, first_name, last_name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
      `SELECT username,
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
      `SELECT username,
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

  /** Given a username, return user's stats info
   *
   * Returns { username, ... stats info }
   *
   * Throws NotFoundError if user not found.
   **/

  static async getStats(username) {
    const result = await db.query(
      `SELECT username,
                  level,
                  points,
                  quizzes_completed AS "quizzesCompleted"
           FROM stats JOIN users ON stats.user_id = users.id
           WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /** Given a username, return user's favourited question and answer
   *
   * Returns { username, {question, answer} }
   *
   * Throws NotFoundError if user not found.
   **/

  static async getFav(username, categoryName) {
    const result = await db.query(
      `SELCT u.username, f.id, f.question, f.answer, c.name 
      FROM flashcards f JOIN users u ON f.user_id = u.id JOIN categories c ON f.category_id = c.id
      WHERE u.username = $1 AND c.name = $2`,
      [username, categoryName]
    );

    const userFav = result.rows[0];

    if (!userFav) {
      throw new NotFoundError(
        `No such user ${username} or category ${categoryName}`
      );
    }

    return userFav;
  }

  static async addToFav(username, question, answer, categoryName="All") {
    const result = await db.query(
      `SELCT u.id AS "user_id", u.username, c.id AS "cat_id", c.name
      FROM users u JOIN categories c ON u.id = c.user_id
      WHERE u.username = $1 AND c.name = $2`,
      [username, categoryName]
    );

    const userCat = result.rows[0];

    if (!userCat) {
      throw new NotFoundError(
        `No such user ${username} or category ${categoryName}`
      );
    }

    const newFlashcard = await db.query(
      `INSERT INTO flashcards 
        (user_id, question, answer, category_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, question, answer, category_id`,
        [userCat.user_id, question, answer, userCat.cat_id]
    )

    return newFlashcard;
  }

}
  

module.exports = User;
