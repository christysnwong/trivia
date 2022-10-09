const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

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

  await db.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email,
                          is_admin)
        VALUES ('u1', $1, 'u1F', 'u1L', 'u1@email.com', 'false'),
               ('u2', $2, 'u2F', 'u2L', 'u2@email.com', 'true')
    `,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR)
    ]
  );

  await db.query(`
    INSERT INTO stats (id, level, title, points, quizzes_completed)
    VALUES (1, 4, 'Newbie', 900, 9), 
            (2, 0, 'Newbie', 0, 0)
  `);

  await db.query(`
    INSERT INTO badges (user_id, badge_name, badge_url, date)
    VALUES (1, 'Newbie', '/badges/newbie.gif', '2022-09-08 13:04:07-07')
  `);

  await db.query(`
    INSERT INTO played_sessions (session_id, user_id, category_id, difficulty_type, score, points, date)
    VALUES ('9ea32c73-2956-474d-8300-49bcee9d15c5', 1, 1, 1, 6, 100, '2022-09-08 12:20:07-07'),
            ('3e1da446-5fff-403f-8285-bdd95eddcb18', 1, 1, 1, 6, 100, '2022-09-08 13:01:07-07'),
            ('38f4f33f-2ccb-4261-b102-aa7a73f76961', 1, 1, 1, 6, 100, '2022-09-08 13:05:07-07'),
            ('d6560c4a-c272-4928-bc82-4454cb71646e', 1, 1, 2, 5, 80, '2022-09-08 13:06:07-07'),
            ('3748d1d8-e402-4bd1-bcf8-c75c9e7e2b40', 1, 1, 2, 5, 80, '2022-09-08 13:10:07-07'),
            ('662e15c7-45c5-453f-adba-a1fc36e8e631', 1, 1, 1, 6, 100, '2022-09-08 13:20:07-07'),
            ('4a3ee8fd-9410-479b-be30-21c5c7c9f4c9', 1, 1, 1, 7, 120, '2022-09-08 13:25:07-07'),
            ('1031be27-511d-4ad4-bbe4-f9e4c3d3022b', 1, 1, 1, 7, 120, '2022-09-10 13:26:07-07'),
            ('02d25fe5-ac33-4da8-8089-24d4600eb19c', 1, 2, 1, 6, 75, '2022-09-10 13:35:07-07')
  `);

  await db.query(`
    INSERT INTO folders (user_id, name)
    VALUES (1, 'All'),
           (1, 'Abc'),
            (2, 'All')
  `);

  await db.query(`
    INSERT INTO trivia (user_id, question, answer, folder_id)
    VALUES (1, 'U1 Question 1 in All', 'Answer 1', 1),
           (1, 'U1 Question 1 in Abc', 'Answer 1', 2)
  `);



  await db.query(`
    INSERT INTO personal_best (category_id, difficulty_type, user_id, score, points, date)
    VALUES (1, 2, 1, 5, 80, '2022-09-08 13:10:07-07'),
           (1, 1, 1, 7, 120, '2022-09-10 13:26:07-07'),
           (2, 1, 1, 6, 75, '2022-09-10 13:35:07-07')
  `);

  await db.query(`
    INSERT INTO leaderboard (category_id, difficulty_type, user_id, score, points, date)
    VALUES (1, 2, 1, 5, 80, '2022-09-08 13:10:07-07'),
           (1, 1, 1, 7, 120, '2022-09-10 13:26:07-07')
  `);

  await db.query(`
    INSERT INTO played_counts (user_id, category_id, difficulty_type, played)
    VALUES (1, 1, 1, 7),
           (1, 1, 2, 2),
           (1, 2, 1, 1)
  `);

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


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
};