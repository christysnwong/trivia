"use strict";

const db = require("../db.js");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  await db.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
  await db.query("DELETE FROM stats");
  await db.query("DELETE FROM badges");

  await db.query("TRUNCATE TABLE categories RESTART IDENTITY CASCADE");
  await db.query("TRUNCATE TABLE difficulties RESTART IDENTITY CASCADE");

  await db.query("TRUNCATE TABLE played_sessions RESTART IDENTITY CASCADE");
  await db.query("TRUNCATE TABLE played_counts RESTART IDENTITY CASCADE");
  await db.query("DELETE FROM personal_best");
  await db.query("DELETE FROM leaderboard");
  await db.query("TRUNCATE TABLE folders RESTART IDENTITY CASCADE");
  await db.query("TRUNCATE TABLE trivia RESTART IDENTITY CASCADE");

  await db.query(`
        INSERT INTO categories (name)
        VALUES ('General Knowledge'),
               ('Entertainment: Books')
  `);

  await db.query(`
        INSERT INTO difficulties (difficulty)
        VALUES ('easy'), ('medium'), ('hard')
  `);

  await User.register({
    username: "u1",
    firstName: "u1F",
    lastName: "u1L",
    email: "u1@email.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "u2F",
    lastName: "u2L",
    email: "u2@email.com",
    password: "password2",
    isAdmin: true,
  });

  await User.addSession({
    sessionId: "3748d1d8-e402-4bd1-bcf8-c75c9e7e2b40",
    userId: 1,
    category: "General Knowledge",
    difficulty: "medium",
    score: 5,
    points: 85,
  });

  await User.addSession({
    sessionId: "1031be27-511d-4ad4-bbe4-f9e4c3d3022b",
    userId: 1,
    category: "General Knowledge",
    difficulty: "easy",
    score: 7,
    points: 120,
  });

  await User.addSession({
    sessionId: "02d25fe5-ac33-4da8-8089-24d4600eb19c",
    userId: 1,
    category: "Entertainment: Books",
    difficulty: "easy",
    score: 6,
    points: 75,
  });

  await User.postBadge({ userId: 1, badge: "Newbie" });

  await User.createFolder({ userId: 1, folderName: "Abc" });
  await User.createFolder({ userId: 2, folderName: "Def" });

  await User.addToFav({
    userId: 1,
    question: "U1 Question 1 in All",
    answer: "Answer 1",
    folderName: "All",
  });

  await User.addToFav({
    userId: 1,
    question: "U1 Question 1 in Abc",
    answer: "Answer 1",
    folderName: "Abc",
  });

  await User.addToFav({
    userId: 2,
    question: "U2 Question 1 in Def",
    answer: "Answer 1",
    folderName: "Def",
  });

  await User.updateScore({
    userId: 1,
    category: "General Knowledge",
    difficulty: "medium",
    score: 5,
    points: 85,
  });

  await User.updateScore({
    userId: 1,
    category: "General Knowledge",
    difficulty: "easy",
    score: 7,
    points: 120,
  });

  await User.updateScore({
    userId: 1,
    category: "Entertainment: Books",
    difficulty: "easy",
    score: 6,
    points: 75,
  });

  await User.updateLeaderboardScore({
    userId: 1,
    category: "General Knowledge",
    difficulty: "medium",
    score: 5,
    points: 85,
  });

  await User.updateLeaderboardScore({
    userId: 1,
    category: "General Knowledge",
    difficulty: "easy",
    score: 7,
    points: 120,
  });


  await User.updatePlayedCounts({
    userId: 1,
    category: "General Knowledge",
    difficulty: "medium",
  });

  await User.updatePlayedCounts({
    userId: 1,
    category: "General Knowledge",
    difficulty: "easy",
  });

  await User.updatePlayedCounts({
    userId: 1,
    category: "Entertainment: Books",
    difficulty: "easy",
  });

  

}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: true });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
};
