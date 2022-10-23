("use strict");

const request = require("supertest");

const app = require("../../app");
const db = require("../../db.js");
const User = require("../../models/user");

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

/** POST /users ======================================================================= */

describe("POST /users", function () {
  test("works for admins: create non-admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "new@email.com",
        isAdmin: false,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        id: expect.any(Number),
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        isAdmin: false,
      },
      token: expect.any(String),
    });
  });

  test("works for admins: create admin", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "new@email.com",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        id: expect.any(Number),
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        email: "new@email.com",
        isAdmin: true,
      },
      token: expect.any(String),
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "new@email.com",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).post("/users").send({
      username: "u-new",
      firstName: "First-new",
      lastName: "Last-newL",
      password: "password-new",
      email: "new@email.com",
      isAdmin: true,
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u-new",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .post("/users")
      .send({
        id: expect.any(Number),
        username: "u-new",
        firstName: "First-new",
        lastName: "Last-newL",
        password: "password-new",
        email: "not-an-email",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/** GET /users ========================================================================== */

describe("GET /users", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      users: [
        {
          id: 1,
          username: "u1",
          firstName: "u1F",
          lastName: "u1L",
          email: "u1@email.com",
          isAdmin: false,
        },
        {
          id: 2,
          username: "u2",
          firstName: "u2F",
          lastName: "u2L",
          email: "u2@email.com",
          isAdmin: true,
        },
      ],
    });
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get("/users");
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/** GET /users/:username =============================================================== */

describe("GET /users/:username", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      user: {
        id: 1,
        username: "u1",
        firstName: "u1F",
        lastName: "u1L",
        email: "u1@email.com",
        isAdmin: false,
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        id: 1,
        username: "u1",
        firstName: "u1F",
        lastName: "u1L",
        email: "u1@email.com",
        isAdmin: false,
      },
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
      .get(`/users/u2`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
      .get(`/users/nope`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/** PATCH /users/:username ============================================================= */

describe("PATCH /users/:username", () => {
  test("works for admins", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "New",
        lastName: "u1L",
        email: "u1@email.com",
        isAdmin: false,
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "New",
        lastName: "u1L",
        email: "u1@email.com",
        isAdmin: false,
      },
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .patch(`/users/u2`)
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/users/u1`).send({
      firstName: "New",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such user", async function () {
    const resp = await request(app)
      .patch(`/users/nope`)
      .send({
        firstName: "Nope",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        firstName: 42,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("works: can set new password", async function () {
    const resp = await request(app)
      .patch(`/users/u1`)
      .send({
        password: "new-password",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "u1F",
        lastName: "u1L",
        email: "u1@email.com",
        isAdmin: false,
      },
    });
    const isSuccessful = await User.authenticate("u1", "new-password");
    expect(isSuccessful).toBeTruthy();
  });
});

/** DELETE /users/:username ============================================================ */

describe("DELETE /users/:username", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/users/u1`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .delete(`/users/u1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .delete(`/users/u2`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
      .delete(`/users/nope`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/** FOLDERS ============================================================================== */
/** GET /users/:username/folders ========================================================= */

describe("GET /users/:username/folders", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .get("/users/u1/folders")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      folders: [
        {
          folderId: 1,
          name: "All",
        },
        {
          folderId: 3,
          name: "Abc",
        },
      ],
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .get("/users/u1/folders")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      folders: [
        {
          folderId: 1,
          name: "All",
        },
        {
          folderId: 3,
          name: "Abc",
        },
      ],
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .get("/users/u2/folders")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get("/users/u2/folders");
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
      .get("/users/u99/folders")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/** POST /users/:username/folders ======================================================= */

describe("POST /users/:username/folders", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .post("/users/u1/folders")
      .send({ userId: 1, folderName: "TEST" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      created: {
        folderId: expect.any(Number),
        name: "TEST",
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .post("/users/u1/folders")
      .send({ userId: 1, folderName: "TEST 2" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      created: {
        folderId: expect.any(Number),
        name: "TEST 2",
      },
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .post("/users/u2/folders")
      .send({ userId: 2, folderName: "TEST 3" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .post("/users/u1/folders")
      .send({ userId: 1, folderName: "TEST 4" });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
      .post("/users/u99/folders")
      .send({ userId: 99, folderName: "TEST 5" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request for dup folder", async function () {
    const resp = await request(app)
      .post("/users/u1/folders")
      .send({ userId: 1, folderName: "All" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
      .post("/users/u1/folders")
      .send({ userId: 1, folderName: "" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .post("/users/u1/folders")
      .send({ userId: 1, folderName: 123456 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/** GET /users/:username/folders/:folderId ============================================ */

describe("GET /users/:username/folders/:folderId", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .get("/users/u1/folders/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      folder: {
        folderId: 1,
        folderName: "All",
        trivia: [
          { id: 1, question: "U1 Question 1 in All", answer: "Answer 1" },
        ],
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .get("/users/u1/folders/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      folder: {
        folderId: 1,
        folderName: "All",
        trivia: [
          { id: 1, question: "U1 Question 1 in All", answer: "Answer 1" },
        ],
      },
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .get("/users/u2/folders/2")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get("/users/u1/folders/1");
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
      .get("/users/u99/folders/100")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/** PATCH /users/:username/folders/:folderId ========================================== */

describe("PATCH /users/:username/folders/:folderId", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .patch("/users/u1/folders/3")
      .send({ userId: 1, newFolderName: "Abc v2" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      updated: {
        folderId: 3,
        name: "Abc v2",
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .patch("/users/u1/folders/3")
      .send({ userId: 1, newFolderName: "Abc v3" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      updated: {
        folderId: 3,
        name: "Abc v3",
      },
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .patch("/users/u2/folders/4")
      .send({ userId: 2, newFolderName: "Def v2" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch("/users/u1/folders/3")
      .send({ userId: 1, newFolderName: "Abc v4" });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if folder missing", async function () {
    const resp = await request(app)
      .patch("/users/u1/folders/99")
      .send({ userId: 1, newFolderName: "Abc v5" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request for folder 'All'", async function () {
    const resp = await request(app)
      .patch("/users/u1/folders/1")
      .send({ userId: 1, newFolderName: "All v2" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request for dup folder", async function () {
    const resp = await request(app)
      .patch("/users/u1/folders/3")
      .send({ userId: 1, newFolderName: "All" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
      .patch("/users/u1/folders/3")
      .send({ userId: 1, newFolderName: "" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .patch("/users/u1/folders/3")
      .send({ userId: 1, newFolderName: 123456 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/** DELETE /users/:username/folders/:folderId ========================================== */

describe("DELETE /users/:username/folders/:folderId", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .delete("/users/u1/folders/3")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      deleted: {
        folderId: 3,
        name: "Abc",
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .delete("/users/u1/folders/3")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      deleted: {
        folderId: 3,
        name: "Abc",
      },
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .delete("/users/u2/folders/4")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete("/users/u1/folders/3");
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if folder missing", async function () {
    const resp = await request(app)
      .delete("/users/u1/folders/99")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request for folder 'All'", async function () {
    const resp = await request(app)
      .delete("/users/u1/folders/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/** FAV TRIVIAS ======================================================================== */
/** GET users/:username/fav ============================================================ */

describe("GET /users/:username/fav", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .get("/users/u1/fav")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      trivias: [
        {
          id: 1,
          question: "U1 Question 1 in All",
          answer: "Answer 1",
          folderId: 1,
        },
        {
          id: 2,
          question: "U1 Question 1 in Abc",
          answer: "Answer 1",
          folderId: 3,
        },
      ],
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .get("/users/u1/fav")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      trivias: [
        {
          id: 1,
          question: "U1 Question 1 in All",
          answer: "Answer 1",
          folderId: 1,
        },
        {
          id: 2,
          question: "U1 Question 1 in Abc",
          answer: "Answer 1",
          folderId: 3,
        },
      ],
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .get("/users/u2/fav")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get("/users/u1/fav");
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
      .get("/users/u99/fav")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/** POST /users/:username/fav ============================================================ */

describe("POST /users/:username/fav", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .post("/users/u1/fav")
      .send({
        userId: 1,
        question: "U1 Question 2 in All",
        answer: "Answer 2",
        folderName: "All",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      added: {
        triviaId: expect.any(Number),
        userId: 1,
        question: "U1 Question 2 in All",
        answer: "Answer 2",
        folderId: 1,
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .post("/users/u1/fav")
      .send({
        userId: 1,
        question: "U1 Question 3 in All",
        answer: "Answer 3",
        folderName: "All",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      added: {
        triviaId: expect.any(Number),
        userId: 1,
        question: "U1 Question 3 in All",
        answer: "Answer 3",
        folderId: 1,
      },
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .post("/users/u2/fav")
      .send({
        userId: 2,
        question: "U1 Question 1 in All",
        answer: "Answer 1",
        folderName: "All",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).post("/users/u1/fav").send({
      userId: 1,
      question: "U1 Question 3 in All",
      answer: "Answer 3",
      folderName: "All",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
      .post("/users/u99/fav")
      .send({
        userId: 99,
        question: "U99 Question 1 in All",
        answer: "Answer 1",
        folderName: "All",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
      .post("/users/u1/fav")
      .send({
        userId: 1,
        question: "U1 Question 3 in All",
        answer: "Answer 3",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .post("/users/u1/fav")
      .send({
        userId: 1,
        question: "U1 Question 3 in All",
        answer: "Answer 3",
        folderName: 12345,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/** GET /users/:username/fav/:triviaId ========================================================== */

describe("GET /users/:username/fav/:triviaId", function () {
  test("works for admins only", async function () {
    const resp = await request(app)
      .get("/users/u1/fav/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      trivia: {
        id: 1,
        userId: 1,
        question: "U1 Question 1 in All",
        answer: "Answer 1",
        folderId: 1,
      },
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
      .get("/users/u1/fav/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get("/users/u1/fav/1");
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if trivia not found", async function () {
    const resp = await request(app)
      .get("/users/u1/fav/99")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/** PATCH /users/:username/fav/:triviaId ======================================================= */

describe("PATCH /users/:username/fav/:triviaId", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .patch("/users/u1/fav/3")
      .send({ userId: 2, folderName: "All" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      updated: {
        id: 3,
        user_id: 2,
        question: "U2 Question 1 in Def",
        answer: "Answer 1",
        folderId: 2,
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .patch("/users/u1/fav/1")
      .send({ userId: 1, folderName: "Abc" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      updated: {
        id: 1,
        user_id: 1,
        question: "U1 Question 1 in All",
        answer: "Answer 1",
        folderId: 3,
      },
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .patch("/users/u2/fav/3")
      .send({ userId: 2, folderName: "All" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch("/users/u1/fav/1")
      .send({ userId: 1, folderName: "Abc" });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if trivia missing", async function () {
    const resp = await request(app)
      .patch("/users/u1/fav/99")
      .send({ userId: 1, folderName: "All" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found if missing folder", async function () {
    const resp = await request(app)
      .patch("/users/u1/fav/1")
      .send({ userId: 1, folderName: "Non-exist" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/** DELETE /users/:username/fav/:triviaId ==================================================== */

describe("DELETE /users/:username/fav/:triviaId", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .delete("/users/u1/fav/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      deleted: {
        triviaId: 1,
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .delete("/users/u1/fav/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      deleted: {
        triviaId: 1,
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete("/users/u1/fav/1");
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if trivia missing", async function () {
    const resp = await request(app)
      .delete("/users/u1/fav/99")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/** STATS ================================================================================ */
/** GET /users/:username/stats =========================================================== */

describe("GET /users/:username/stats", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .get("/users/u1/stats")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      stats: {
        userId: 1,
        level: 1,
        title: "Newbie",
        "quizzes completed": 3,
        points: 280,
        remainingPts: 120,
        levelPts: 200,
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .get("/users/u1/stats")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      stats: {
        userId: 1,
        level: 1,
        title: "Newbie",
        "quizzes completed": 3,
        points: 280,
        remainingPts: 120,
        levelPts: 200,
      },
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .get("/users/u2/stats")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get("/users/u1/stats");
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
      .get("/users/u99/stats")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/** POST /users/:username/stats =========================================================== */

describe("POST /users/:username/stats", function () {
  test("works for admins only", async function () {
    const resp = await request(app)
      .post("/users/u1/stats")
      .send({
        userId: 1,
        newPoints: 200,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      updated: {
        userId: 1,
        level: 2,
        title: "Newbie",
        "quizzes completed": 4,
        points: 480,
        remainingPts: 120,
        levelPts: 200,
      },
    });
  });

  test("unauth for same user", async function () {
    const resp = await request(app)
      .post("/users/u1/stats")
      .send({
        userId: 1,
        newPoints: 200,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).post("/users/u1/stats").send({
      userId: 1,
      newPoints: 200,
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
      .post("/users/u99/stats")
      .send({
        userId: 99,
        newPoints: 200,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
      .post("/users/u99/stats")
      .send({
        userId: 99,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .post("/users/u1/stats")
      .send({
        userId: 1,
        newPoints: 201,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/** GET /users/:username/badges =========================================================== */

describe("GET /users/:username/badges", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .get("/users/u1/badges")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      badges: [
        {
          badgeName: "Newbie",
          badgeUrl: "/badges/newbie.gif",
          date: expect.any(String),
        },
      ],
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .get("/users/u1/badges")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      badges: [
        {
          badgeName: "Newbie",
          badgeUrl: "/badges/newbie.gif",
          date: expect.any(String),
        },
      ],
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .get("/users/u2/badges")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get("/users/u1/badges");
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
      .get("/users/u99/badges")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/** POST /users/:username/badges =========================================================== */

describe("POST /users/:username/badges", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .post("/users/u1/badges")
      .send({ userId: 1, badge: "Trophy" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      added: {
        badgeName: "Trophy",
        badgeUrl: "/badges/trophy.gif",
        date: expect.any(String),
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .post("/users/u1/badges")
      .send({ userId: 1, badge: "Trophy" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      added: {
        badgeName: "Trophy",
        badgeUrl: "/badges/trophy.gif",
        date: expect.any(String),
      },
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
      .post("/users/u2/badges")
      .send({ userId: 2, badge: "Trophy" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .post("/users/u1/badges")
      .send({ userId: 1, badge: "Trophy" });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
      .post("/users/u99/badges")
      .send({ userId: 99, badge: "Trophy" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
      .post("/users/u1/badges")
      .send({ userId: 1 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .post("/users/u1/badges")
      .send({ userId: 1, badge: 234 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/** SCORES ============================================================================= */
/** GET /users/:username/scores ======================================================== */

describe("GET /users/:username/scores", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .get("/users/u1/scores")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      topScores: [
        {
          category: "Entertainment: Books",
          difficulty: "easy",
          score: 6,
          points: 75,
          date: expect.any(String),
        },
        {
          category: "General Knowledge",
          difficulty: "easy",
          score: 7,
          points: 120,
          date: expect.any(String),
        },
        {
          category: "General Knowledge",
          difficulty: "medium",
          score: 5,
          points: 85,
          date: expect.any(String),
        },
      ],
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .get("/users/u1/scores")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      topScores: [
        {
          category: "Entertainment: Books",
          difficulty: "easy",
          score: 6,
          points: 75,
          date: expect.any(String),
        },
        {
          category: "General Knowledge",
          difficulty: "easy",
          score: 7,
          points: 120,
          date: expect.any(String),
        },
        {
          category: "General Knowledge",
          difficulty: "medium",
          score: 5,
          points: 85,
          date: expect.any(String),
        },
      ],
    });
  });

  test("works for same user with query", async function () {
    const resp = await request(app)
      .get("/users/u1/scores")
      .query({ category: "General Knowledge", difficulty: "easy" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      topScores: [
        {
          category: "General Knowledge",
          difficulty: "easy",
          score: 7,
          points: 120,
          date: expect.any(String),
        },
      ],
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
      .get("/users/u2/scores")
      .query({ category: "General Knowledge", difficulty: "easy" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .get("/users/u1/scores")
      .query({ category: "General Knowledge", difficulty: "easy" });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
      .get("/users/u99/scores")
      .query({ category: "General Knowledge", difficulty: "easy" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/** POST /users/:username/scores =========================================================== */

describe("POST /users/:username/scores", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .post("/users/u1/scores")
      .send({
        userId: 1,
        category: "General Knowledge",
        difficulty: "easy",
        score: 7,
        points: 140,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      updated: {
        category_id: 1,
        difficulty_type: 1,
        score: 7,
        points: 140,
        date: expect.any(String),
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .post("/users/u1/scores")
      .send({
        userId: 1,
        category: "General Knowledge",
        difficulty: "easy",
        score: 7,
        points: 140,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      updated: {
        category_id: 1,
        difficulty_type: 1,
        score: 7,
        points: 140,
        date: expect.any(String),
      },
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
      .post("/users/u2/scores")
      .send({
        userId: 1,
        category: "General Knowledge",
        difficulty: "easy",
        score: 7,
        points: 140,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).post("/users/u1/scores").send({
      userId: 1,
      category: "General Knowledge",
      difficulty: "easy",
      score: 7,
      points: 140,
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
      .post("/users/u1/scores")
      .send({
        userId: 99,
        category: "General Knowledge",
        difficulty: "easy",
        score: 7,
        points: 140,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
      .post("/users/u1/scores")
      .send({
        userId: 1,
        category: "General Knowledge",
        difficulty: "easy",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .post("/users/u1/scores")
      .send({
        userId: 1,
        category: "General Knowledge",
        difficulty: "easy",
        score: 99,
        points: 999,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/** SESSIONS =============================================================================== */
/** GET /users/:username/sessions ========================================================== */

describe("GET /users/:username/sessions", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .get("/users/u1/sessions")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      sessions: [
        {
          id: 3,
          category: "Entertainment: Books",
          difficulty: "easy",
          score: 6,
          points: 75,
          date: expect.any(String),
        },
        {
          id: 2,
          category: "General Knowledge",
          difficulty: "easy",
          score: 7,
          points: 120,
          date: expect.any(String),
        },
        {
          id: 1,
          category: "General Knowledge",
          difficulty: "medium",
          score: 5,
          points: 85,
          date: expect.any(String),
        },
      ],
    });
  });

  test("works for admins", async function () {
    const resp = await request(app)
      .get("/users/u1/sessions")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      sessions: [
        {
          id: 3,
          category: "Entertainment: Books",
          difficulty: "easy",
          score: 6,
          points: 75,
          date: expect.any(String),
        },
        {
          id: 2,
          category: "General Knowledge",
          difficulty: "easy",
          score: 7,
          points: 120,
          date: expect.any(String),
        },
        {
          id: 1,
          category: "General Knowledge",
          difficulty: "medium",
          score: 5,
          points: 85,
          date: expect.any(String),
        },
      ],
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
      .get("/users/u2/sessions")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get("/users/u2/sessions");
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
      .get("/users/u99/sessions")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/** POST /users/:username/sessions ======================================================== */

describe("POST /users/:username/sessions", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .post("/users/u1/sessions")
      .send({
        sessionId: "02d25fe5-ac33-4da8-8089-24d4600eb11c",
        userId: 1,
        category: "General Knowledge",
        difficulty: "easy",
        score: 8,
        points: 150,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      added: {
        category_id: 1,
        difficulty_type: 1,
        score: 8,
        points: 150,
        date: expect.any(String),
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .post("/users/u1/sessions")
      .send({
        sessionId: "02d25fe5-ac33-4da8-8089-24d4600eb11c",
        userId: 1,
        category: "General Knowledge",
        difficulty: "easy",
        score: 8,
        points: 150,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      added: {
        category_id: 1,
        difficulty_type: 1,
        score: 8,
        points: 150,
        date: expect.any(String),
      },
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
      .post("/users/u2/sessions")
      .send({
        sessionId: "02d25fe5-ac33-4da8-8089-24d4600eb11c",
        userId: 2,
        category: "General Knowledge",
        difficulty: "easy",
        score: 8,
        points: 150,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).post("/users/u1/sessions").send({
      sessionId: "02d25fe5-ac33-4da8-8089-24d4600eb11c",
      userId: 1,
      category: "General Knowledge",
      difficulty: "easy",
      score: 8,
      points: 150,
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
      .post("/users/u99/sessions")
      .send({
        sessionId: "02d25fe5-ac33-4da8-8089-24d4600eb11c",
        userId: 99,
        category: "General Knowledge",
        difficulty: "easy",
        score: 8,
        points: 150,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
      .post("/users/u1/sessions")
      .send({
        sessionId: "02d25fe5-ac33-4da8-8089-24d4600eb11c",
        userId: 1,
        score: 8,
        points: 150,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid session id", async function () {
    const resp = await request(app)
      .post("/users/u1/sessions")
      .send({
        sessionId: "abc",
        userId: 1,
        category: "General Knowledge",
        difficulty: "easy",
        score: 8,
        points: 150,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/** DELETE /users/:username/sessions ======================================================== */

describe("DELETE /users/:username/sessions", function () {
  test("works for admins only", async function () {
    const resp = await request(app)
      .delete("/users/u1/sessions")
      .send({
        id: 2,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      deleted: {
        id: 2,
        session_id: "1031be27-511d-4ad4-bbe4-f9e4c3d3022b",
        user_id: 1,
        category_id: 1,
        difficulty_type: 1,
        score: 7,
        points: 120,
        date: expect.any(String),
      },
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
      .delete("/users/u1/sessions")
      .send({
        id: 2,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete("/users/u1/sessions").send({
      id: 2,
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if session not found", async function () {
    const resp = await request(app)
      .delete("/users/u1/sessions")
      .send({
        id: 99,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/** GET /users/:username/playedcounts ====================================================== */

describe("GET /users/:username/playedcounts", function () {
  test("works for admins without query", async function () {
    const resp = await request(app)
      .get("/users/u1/playedcounts")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      playedCounts: [
        {
          category: "Entertainment: Books",
          difficulty: "easy",
          played: 1,
        },
        {
          category: "General Knowledge",
          difficulty: "easy",
          played: 1,
        },
        {
          category: "General Knowledge",
          difficulty: "medium",
          played: 1,
        },
      ],
    });
  });

  test("works for same user with query 1", async function () {
    const resp = await request(app)
      .get("/users/u1/playedcounts")
      .query({ category: "General Knowledge", difficulty: "easy" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      playedCounts: [
        {
          category: "General Knowledge",
          difficulty: "easy",
          played: 1,
        },
      ],
    });
  });

  test("works for same user with query 2", async function () {
    const resp = await request(app)
      .get("/users/u1/playedcounts")
      .query({ category: "General Knowledge", difficulty: "hard" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      playedCounts: {
        category: "General Knowledge",
        difficulty: "hard",
        played: 0,
      },
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
      .get("/users/u2/playedcounts")
      .query({ category: "General Knowledge", difficulty: "easy" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .get("/users/u1/playedcounts")
      .query({ category: "General Knowledge", difficulty: "easy" });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user missing", async function () {
    const resp = await request(app)
      .get("/users/u99/playedcounts")
      .query({ category: "General Knowledge", difficulty: "hard" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/** POST /users/:username/playedcounts ======================================================== */

describe("POST /users/:username/playedcounts", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .post("/users/u1/playedcounts")
      .send({
        userId: 1,
        category: "General Knowledge",
        difficulty: "easy",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      updated: {
        category_id: 1,
        difficulty_type: 1,
        played: 2,
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
      .post("/users/u1/playedcounts")
      .send({
        userId: 1,
        category: "General Knowledge",
        difficulty: "easy",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      updated: {
        category_id: 1,
        difficulty_type: 1,
        played: 2,
      },
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
      .post("/users/u2/playedcounts")
      .send({
        userId: 2,
        category: "General Knowledge",
        difficulty: "easy",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).post("/users/u1/playedcounts").send({
      userId: 1,
      category: "General Knowledge",
      difficulty: "easy",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
      .post("/users/u99/playedcounts")
      .send({
        userId: 99,
        category: "General Knowledge",
        difficulty: "easy",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
      .post("/users/u1/playedcounts")
      .send({
        userId: 1,
        category: "General Knowledge",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .post("/users/u1/playedcounts")
      .send({
        userId: 1,
        category: 345,
        difficulty: "easy",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});
