"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommonRoutes");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** POST /auth/token ===================================================================== */

describe("POST /auth/token", function () {
  test("works", async function () {
    const resp = await request(app).post("/auth/token").send({
      username: "u1",
      password: "password1",
    });
    expect(resp.body).toEqual({
      token: expect.any(String),
      user: {
        id: 1,
        username: "u1",
        firstName: "u1F",
        lastName: "u1L",
        email: "u1@email.com",
        isAdmin: false
      },
    });
  });

  test("unauth with non-existent user", async function () {
    const resp = await request(app).post("/auth/token").send({
      username: "no-such-user",
      password: "password1",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth with wrong password", async function () {
    const resp = await request(app).post("/auth/token").send({
      username: "u1",
      password: "nope",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app).post("/auth/token").send({
      username: "u1",
    });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app).post("/auth/token").send({
      username: 42,
      password: "above-is-a-number",
    });
    expect(resp.statusCode).toEqual(400);
  });
});

/** POST /auth/register ================================================================= */


describe("POST /auth/register", function () {
  const newUser = {
    username: "new",
    firstName: "first",
    lastName: "last",
    password: "password",
    email: "new@email.com",
  };

  test("works for anon", async function () {
    const resp = await request(app).post("/auth/register").send(newUser);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      token: expect.any(String),
      user: {
        id: 3,
        username: "new",
        firstName: "first",
        lastName: "last",
        email: "new@email.com",
        isAdmin: false,
      },
    });
  });

  test("bad request with missing fields", async function () {
    const resp = await request(app).post("/auth/register").send({
      username: "new",
    });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app).post("/auth/register").send({
      username: "new",
      firstName: "first",
      lastName: "last",
      password: "password",
      email: "not-an-email",
    });
    expect(resp.statusCode).toEqual(400);
  });
});
