("use strict");

const request = require("supertest");

const app = require("../../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
} = require("./_testCommonRoutes");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** GET /leaderboard ======================================================================= */

describe("GET /leaderboard", function () {
  test("works", async function () {
    const resp = await request(app)
      .get("/leaderboard")
      .query({
        category: "General Knowledge",
        difficulty: "easy",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      topLeaderboardScores: [
        {
          category: "General Knowledge",
          difficulty: "easy",
          username: "u1",
          score: 7,
          points: 120,
          date: expect.any(String),
        },
      ],
    });
  });

  test("works with category query", async function () {
    const resp = await request(app)
      .get("/leaderboard")
      .query({
        category: "General Knowledge",
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      topLeaderboardScores: [
        {
          category: "General Knowledge",
          difficulty: "easy",
          username: "u1",
          score: 7,
          points: 120,
          date: expect.any(String),
        },
        {
          category: "General Knowledge",
          difficulty: "medium",
          username: "u1",
          score: 5,
          points: 85,
          date: expect.any(String),
        },
      ],
    });
  });

  test("works with difficulty query", async function () {
    const resp = await request(app)
      .get("/leaderboard")
      .query({
        difficulty: "easy",
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      topLeaderboardScores: [
        {
          category: "General Knowledge",
          difficulty: "easy",
          username: "u1",
          score: 7,
          points: 120,
          date: expect.any(String),
        },
      ],
    });
  });

  test("works with no query", async function () {
    const resp = await request(app)
      .get("/leaderboard")
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      topLeaderboardScores: [
        {
          category: "General Knowledge",
          difficulty: "easy",
          username: "u1",
          score: 7,
          points: 120,
          date: expect.any(String),
        },
        {
          category: "General Knowledge",
          difficulty: "medium",
          username: "u1",
          score: 5,
          points: 85,
          date: expect.any(String),
        },
      ],
    });
  });
});

/** POST /leaderboard ====================================================================== */

describe("POST /leaderboard", function () {
  test("works", async function () {
    const resp = await request(app)
      .post("/leaderboard")
      .send({
        userId: 1,
        category: "General Knowledge",
        difficulty: "easy",
        score: 7,
        points: 140,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      updated: {
        category_id: 1,
        difficulty_type: 1,
        user_id: 1,
        score: 7,
        points: 140,
        date: expect.any(String),
      },
    });
  });

  test("bad request with missing fields", async function () {
    const resp = await request(app)
      .post("/leaderboard")
      .send({
        userId: 1,
        category: "General Knowledge",
        difficulty: "easy",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/leaderboard")
      .send({
        userId: 1,
        category: "General Knowledge",
        difficulty: "easy",
        score: 7,
        points: 201,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).post("/leaderboard").send({
      userId: 1,
      category: "General Knowledge",
      difficulty: "easy",
      score: 7,
      points: 140,
    });

    expect(resp.statusCode).toEqual(401);
  });
});
