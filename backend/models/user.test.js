"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** USER ====================================================================================== */
/** authenticate ============================================================================== */

describe("authenticate", function () {
  test("works", async function () {
    const user = await User.authenticate("u1", "password1");
    expect(user).toEqual({
      id: 1,
      username: "u1",
      firstName: "u1F",
      lastName: "u1L",
      email: "u1@email.com",
      isAdmin: false,
    });
  });

  test("unauth if no such user", async function () {
    try {
      await User.authenticate("nope", "password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await User.authenticate("c1", "wrong");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/** register ============================================================================== */

describe("register", function () {
  const newUser = {
    username: "new",
    firstName: "test",
    lastName: "user",
    email: "test@email.com",
    isAdmin: false,
  };

  test("works", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
    });
    expect(user).toEqual({
      id: 3,
      ...newUser,
    });

    // check for new user in users table
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(false);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);

    // check for new entry in stats table
    const userStats = await db.query(
      `SELECT * FROM stats where id = ${found.rows[0].id}`
    );
    expect(userStats.rows.length).toEqual(1);
    expect(userStats.rows[0].id).toEqual(3);
    expect(userStats.rows[0].level).toEqual(0);
    expect(userStats.rows[0].title).toEqual("Newbie");
    expect(userStats.rows[0].points).toEqual(0);
    expect(userStats.rows[0].quizzes_completed).toEqual(0);

    // check for new entry in folders table
    const userFolder = await db.query(
      `SELECT * FROM folders where user_id = ${found.rows[0].id}`
    );
    expect(userFolder.rows.length).toEqual(1);
    expect(userFolder.rows[0].user_id).toEqual(3);
    expect(userFolder.rows[0].name).toEqual("All");
  });

  test("works: adds admin", async function () {
    let user = await User.register({
      ...newUser,
      password: "password3",
      isAdmin: true,
    });

    expect(user).toEqual({ ...newUser, id: 4, isAdmin: true });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(true);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup data", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password",
      });
      await User.register({
        ...newUser,
        password: "password",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/** findAll ============================================================================== */

describe("findAll", function () {
  test("works", async function () {
    const users = await User.findAll();
    expect(users).toEqual([
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
    ]);
  });
});

/** get ================================================================================== */

describe("get", function () {
  test("works", async function () {
    let user = await User.get("u1");
    expect(user).toEqual({
      id: 1,
      username: "u1",
      firstName: "u1F",
      lastName: "u1L",
      email: "u1@email.com",
      isAdmin: false,
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/** update ================================================================================= */

describe("update", function () {
  const updateData = {
    firstName: "NewF",
    lastName: "NewL",
    email: "new@email.com",
    isAdmin: true,
  };

  test("works", async function () {
    let user = await User.update("u1", updateData);
    expect(user).toEqual({
      username: "u1",
      ...updateData,
    });
  });

  test("works: set password", async function () {
    let user = await User.update("u1", {
      password: "new",
    });
    expect(user).toEqual({
      username: "u1",
      firstName: "u1F",
      lastName: "u1L",
      email: "u1@email.com",
      isAdmin: false,
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'u1'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("not found if no such user", async function () {
    try {
      await User.update("nope", {
        firstName: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    expect.assertions(1);
    try {
      await User.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/** remove ================================================================================= */

describe("remove", function () {
  test("works", async function () {
    await User.remove("u1");
    const res = await db.query("SELECT * FROM users WHERE username='u1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await User.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/** FOLDERS ================================================================================ */
/** getAllFolders ========================================================================== */

describe("getAllFolders", function () {
  test("works", async function () {
    const folders = await User.getAllFolders("u1");
    expect(folders).toEqual([
      {
        folderId: 1,
        name: "All",
      },
      {
        folderId: 2,
        name: "Abc",
      },
    ]);
  });
});

/** createFolders ========================================================================== */

describe("createFolder", function () {
  const newFolder = {
    userId: 1,
    folderName: "TEST",
  };

  test("works", async function () {
    const testFolder = await User.createFolder(newFolder);
    expect(testFolder).toEqual({
      folderId: expect.any(Number),
      name: "TEST",
    });
  });

  test("bad request with dup data", async function () {
    try {
      await User.createFolder(newFolder);
      await User.createFolder(newFolder);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});


/** getFolderTrivia========================================================================= */

describe("getFolderTrivia", function () {
    test("works", async function () {
      const folderTrivia = await User.getFolderTrivia(1);
      expect(folderTrivia).toEqual({
        folderId: 1,
        folderName: "All",    
        trivia: [{id: 1,
                question: "U1 Question 1 in All",
                answer: "Answer 1"
                }]
      });
    });

    test("no trivia data in folder", async function () {
      const emptyFolder = await User.getFolderTrivia(3);
      expect(emptyFolder).toEqual({
        folderId: 3,
        folderName: "All",
        trivia: [],
      });
    });

    test("not found if no such folder", async function () {
      try {
        await User.getFolderTrivia(99);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });


})

/** renameFolder ========================================================================= */

describe("renameFolder", function () {
    const updateFolderName = {
      userId: 1,
      newFolderName: "Abc v2",
    };

    test("works", async function () {

        const updatedFolder = await User.renameFolder(2, updateFolderName);
        expect(updatedFolder).toEqual({
          folderId: 2,
          name: "Abc v2",
        });

    });

    test("bad request with dup data", async function () {
      try {
        await User.renameFolder(2, {
            userId: 1,
            newFolderName: "All",
        });
        
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });

    test("not found if no such folder", async function () {
      try {
        await User.renameFolder(99, updateFolderName);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });

});

/** removeFolder ========================================================================= */

describe("removeFolder", function () {
  test("works", async function () {
    const deletedFolder = await User.removeFolder(2);
    expect(deletedFolder).toEqual({
        folderId: 2,
        name: "Abc"
    });

  });

  test("bad request for deleting user's All folder", async function () {
    try {
      await User.removeFolder(1);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("not found if no such folder", async function () {
    try {
      await User.removeFolder(99);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

});

/** FAV TRIVIAS======================================================================== */
/** getAllFav ========================================================================= */

describe("getAllFav", function () {
  test("works", async function () {
    const allFav = await User.getAllFav("u1");
    expect(allFav).toEqual([
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
        folderId: 2,
      },
    ]);
  });

  test("not found if no such user", async function () {
    try {
      await User.getAllFav("u99");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

});

/** addToFav ========================================================================= */

describe("addToFav", function () {
  test("works", async function () {
    const favTrivia = {
        userId: 1,
        question: "U1 Question 2 in All",
        answer: "Answer 1",
        folderName: "All",
    };

    const fav = await User.addToFav(favTrivia);
    expect(fav).toEqual({
      triviaId: expect.any(Number),
      userId: 1,
      question: "U1 Question 2 in All",
      answer: "Answer 1",
      folderId: 1,
    });

  });

  test("not found if no such folder", async function () {
      const favTrivia = {
        userId: 1,
        question: "U1 Question 2 in All",
        answer: "Answer 1",
        folderName: "None",
      };

    try {
      await User.addToFav(favTrivia);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }

  });

  test("not found if no such user", async function () {
    const favTrivia = {
      userId: 99,
      question: "U1 Question 2 in All",
      answer: "Answer 1",
      folderName: "All",
    };

    try {
      await User.addToFav(favTrivia);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/** getTrivia ========================================================================= */

describe("getTrivia", function () {
  test("works", async function () {
    const trivia1 = await User.getTrivia(1)
    expect(trivia1).toEqual({
      id: 1,
      userId: 1,
      question: "U1 Question 1 in All",
      answer: "Answer 1",
      folderId: 1,
    });

  });

  test("not found if no such trivia", async function () {
    try {
      await User.getTrivia(99);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/** moveTrivia ========================================================================= */

describe("moveTrivia", function () {
  test("works", async function () {
    const movedTrivia = await User.moveTrivia(1, "Abc");
    expect(movedTrivia).toEqual({
      id: 1,
      user_id: 1,
      question: "U1 Question 1 in All",
      answer: "Answer 1",
      folderId: 2,
    });
  });

  test("not found if no such trivia", async function () {
    try {
      await User.moveTrivia(99, "Abc");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such folder", async function () {
    try {
      await User.moveTrivia(1, "Nooooo");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/** removeTrivia ========================================================================= */

describe("removeTrivia", function () {
  test("works", async function () {
    const removedTrivia = await User.removeTrivia(2);
    expect(removedTrivia).toEqual({
      triviaId: 2
    });
  });

  test("not found if no such trivia", async function () {
    try {
      await User.removeTrivia(99);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

});


/** STATS ============================================================================ */
/** calRemainingPts=================================================================== */

describe("calRemainingPts", function () {
  test("works", async function () {
    const { remainingPts, levelPts } = await User.calRemainingPts(999);
    expect(remainingPts).toEqual(1);
    expect(levelPts).toEqual(200);

  });

  test("works 2", async function () {
    const { remainingPts, levelPts } = await User.calRemainingPts(7501);
    expect(remainingPts).toEqual(499);
    expect(levelPts).toEqual(500);
  });

});

/** getStats ======================================================================== */

describe("getStats", function () {
  test("works", async function () {
    const stats = await User.getStats("u1");
    expect(stats).toEqual({
      userId: 1,
      level: 4,
      title: "Newbie",
      "quizzes completed": 9,
      points: 900,
      remainingPts: 100,
      levelPts: 200
    });
  });


});

/** updatePoints ==================================================================== */

describe("updatePoints", function () {
  test("works", async function () {
    const stats = await User.updatePoints(1, 111);
    expect(stats).toEqual({
      userId: 1,
      level: 5,
      title: "Apprentice",
      "quizzes completed": 10,
      points: 1011,
      remainingPts: 189,
      levelPts: 200,
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.updatePoints(99, 100);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/** getBadges ======================================================================= */

describe("getBadges", function () {
  test("works", async function () {
    const badges = await User.getBadges("u1");
    expect(badges).toEqual([{
        badgeName: "Newbie",
        badgeUrl: "/badges/newbie.gif",
        date: "Sep 8th 2022, 1:04pm"
    }]);
  });

  test("not found if no such user", async function () {
    try {
      await User.getBadges("u99");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

});

/** postBadge ======================================================================= */

describe("postBadge", function () {
  test("works", async function () {
    const badge = await User.postBadge({userId: 2, badge: "trophy"});
    expect(badge).toEqual({
      badgeName: "trophy",
      badgeUrl: "/badges/trophy.gif",
      date: badge.date
    });
  });

  test("no error if posting the same badge", async function () {
    await User.postBadge({ userId: 2, badge: "trophy" });
    let resp = await User.postBadge({ userId: 2, badge: "trophy" });
    expect(resp).toEqual("The user has already earned this badge.");

  });

  test("not found if no such user", async function () {
    try {
      await User.postBadge({ userId: 99, badge: "trophy" });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  
});


/** SCORES =========================================================================== */
/** getScores ======================================================================== */

describe("getScores", function () {
  test("works for no category and difficulty", async function () {
    const score = await User.getScores("u1");
    expect(score).toEqual([
      {
        category: "Entertainment: Books",
        difficulty: "easy",
        score: 6,
        points: 75,
        date: "Sep 10th 2022, 1:35pm",
      },
      {
        category: "General Knowledge",
        difficulty: "easy",
        score: 7,
        points: 120,
        date: "Sep 10th 2022, 1:26pm",
      },
      {
        category: "General Knowledge",
        difficulty: "medium",
        score: 5,
        points: 80,
        date: "Sep 8th 2022, 1:10pm",
      },
    ]);
  });

  test("works for specified category", async function () {
    const scores = await User.getScores("u1", "General Knowledge");
    expect(scores).toEqual([
      {
        category: "General Knowledge",
        difficulty: "easy",
        score: 7,
        points: 120,
        date: "Sep 10th 2022, 1:26pm",
      },
      {
        category: "General Knowledge",
        difficulty: "medium",
        score: 5,
        points: 80,
        date: "Sep 8th 2022, 1:10pm",
      }
    ]);
  });

  test("works for specified category and difficulty", async function () {
    const score = await User.getScores("u1", "General Knowledge", "easy");
    expect(score).toEqual([{
      category: "General Knowledge",
      difficulty: "easy",
      score: 7,
      points: 120,
      date: "Sep 10th 2022, 1:26pm",
    }]);
  });
});

/** updateScore ====================================================================== */

describe("updateScore", function () {
  const newScore = {
    userId: 1,
    category: "General Knowledge",
    difficulty: "easy",
    score: 7,
    points: 140,
  };

  const lowScore = {
    userId: 1,
    category: "General Knowledge",
    difficulty: "easy",
    score: 7,
    points: 70,
  };

  const invalidUserScore = {
    userId: 99,
    category: "General Knowledge",
    difficulty: "easy",
    score: 7,
    points: 140,
  };

  const invalidCategoryScore = {
    userId: 1,
    category: "jaeurpaik",
    difficulty: "easy",
    score: 7,
    points: 140,
  };

  const invalidDifficultyScore = {
    userId: 1,
    category: "jaeurpaik",
    difficulty: "easy",
    score: 7,
    points: 140,
  };



  test("works", async function () {
    const score = await User.updateScore(newScore);
    expect(score).toEqual(
      {
        category_id: 1,
        difficulty_type: 1,
        score: 7,
        points: 140,
        date: expect.any(Object),
      });
  });

  test("does not update for low score", async function () {
    const res = await User.updateScore(lowScore);
    expect(res).toEqual(
      "Not updated as the new score is less than or equal to the old score."
    );
  });

  test("invalid user", async function () {
    try {
      await User.updateScore(invalidUserScore);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("invalid category", async function () {
    try {
      await User.updateScore(invalidCategoryScore);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("invalid difficulty", async function () {
    try {
      await User.updateScore(invalidDifficultyScore);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

});

/** getLeaderboardScores ============================================================= */

describe("getLeaderboardScores", function () {
  test("works for no category and difficulty", async function () {
    const score = await User.getLeaderboardScores();
    expect(score).toEqual([
      {
        category: "General Knowledge",
        difficulty: "easy",
        username: "u1",
        score: 7,
        points: 120,
        date: "Sep 10th 2022, 1:26pm",
      },
      {
        category: "General Knowledge",
        difficulty: "medium",
        username: "u1",
        score: 5,
        points: 80,
        date: "Sep 8th 2022, 1:10pm",
      },
    ]);
  });

  test("works for specified category", async function () {
    const scores = await User.getLeaderboardScores("General Knowledge");
    expect(scores).toEqual([
      {
        category: "General Knowledge",
        difficulty: "easy",
        username: "u1",
        score: 7,
        points: 120,
        date: "Sep 10th 2022, 1:26pm",
      },
      {
        category: "General Knowledge",
        difficulty: "medium",
        username: "u1",
        score: 5,
        points: 80,
        date: "Sep 8th 2022, 1:10pm",
      },
    ]);
  });

  test("works for specified category and difficulty", async function () {
    const score = await User.getLeaderboardScores("General Knowledge", "easy");
    expect(score).toEqual([
      {
        category: "General Knowledge",
        difficulty: "easy",
        username: "u1",
        score: 7,
        points: 120,
        date: "Sep 10th 2022, 1:26pm",
      },
    ]);
  });
});

/** updateLeaderboardScore ========================================================== */

describe("updateLeaderboardScore", function () {
  const newScore = {
    userId: 1,
    category: "General Knowledge",
    difficulty: "easy",
    score: 7,
    points: 140,
  };

  const lowScore = {
    userId: 1,
    category: "General Knowledge",
    difficulty: "easy",
    score: 7,
    points: 70,
  };

  const lowScore2 = {
    userId: 1,
    category: "Entertainment: Books",
    difficulty: "easy",
    score: 7,
    points: 79,
  };

  const invalidUserScore = {
    userId: 99,
    category: "General Knowledge",
    difficulty: "easy",
    score: 7,
    points: 140,
  };

  const invalidCategoryScore = {
    userId: 1,
    category: "jaeurpaik",
    difficulty: "easy",
    score: 7,
    points: 140,
  };

  const invalidDifficultyScore = {
    userId: 1,
    category: "jaeurpaik",
    difficulty: "easy",
    score: 7,
    points: 140,
  };

  test("works", async function () {
    const score = await User.updateLeaderboardScore(newScore);
    expect(score).toEqual({
      category_id: 1,
      difficulty_type: 1,
      user_id: 1,
      score: 7,
      points: 140,
      date: expect.any(Object),
    });
  });

  test("does not update for low score", async function () {
    const res = await User.updateLeaderboardScore(lowScore);
    expect(res).toEqual(
      "Not updated as the new score is less than or equal to the old score."
    );
  });

  test("does not update for low score even though there is no leaderboard record", 
  async function () {
    const res = await User.updateLeaderboardScore(lowScore2);
    expect(res).toEqual(
      "Not updated as the new score is less than or equal to the old score."
    );
  });

  test("invalid user", async function () {
    try {
      await User.updateLeaderboardScore(invalidUserScore);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("invalid category", async function () {
    try {
      await User.updateLeaderboardScore(invalidCategoryScore);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("invalid difficulty", async function () {
    try {
      await User.updateLeaderboardScore(invalidDifficultyScore);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});


/** SESSIONS========================================================================== */
/** getSessions ====================================================================== */

describe("getSessions", function () {
  test("works with no limit", async function () {
    const sessions = await User.getSessions("u1");
    expect(sessions).toEqual([
      {
        sessionId: "02d25fe5-ac33-4da8-8089-24d4600eb19c",
        category: "Entertainment: Books",
        difficulty: "easy",
        score: 6,
        points: 75,
        date: "Sep 10th 2022, 1:35pm",
      },
      {
        sessionId: "1031be27-511d-4ad4-bbe4-f9e4c3d3022b",
        category: "General Knowledge",
        difficulty: "easy",
        score: 7,
        points: 120,
        date: "Sep 10th 2022, 1:26pm",
      },
      {
        sessionId: "4a3ee8fd-9410-479b-be30-21c5c7c9f4c9",
        category: "General Knowledge",
        difficulty: "easy",
        score: 7,
        points: 120,
        date: "Sep 8th 2022, 1:25pm",
      },
      {
        sessionId: "662e15c7-45c5-453f-adba-a1fc36e8e631",
        category: "General Knowledge",
        difficulty: "easy",
        score: 6,
        points: 100,
        date: "Sep 8th 2022, 1:20pm",
      },
      {
        sessionId: "3748d1d8-e402-4bd1-bcf8-c75c9e7e2b40",
        category: "General Knowledge",
        difficulty: "medium",
        score: 5,
        points: 80,
        date: "Sep 8th 2022, 1:10pm",
      },
      {
        sessionId: "d6560c4a-c272-4928-bc82-4454cb71646e",
        category: "General Knowledge",
        difficulty: "medium",
        score: 5,
        points: 80,
        date: "Sep 8th 2022, 1:06pm",
      },
      {
        sessionId: "38f4f33f-2ccb-4261-b102-aa7a73f76961",
        category: "General Knowledge",
        difficulty: "easy",
        score: 6,
        points: 100,
        date: "Sep 8th 2022, 1:05pm",
      },
      {
        sessionId: "3e1da446-5fff-403f-8285-bdd95eddcb18",
        category: "General Knowledge",
        difficulty: "easy",
        score: 6,
        points: 100,
        date: "Sep 8th 2022, 1:01pm",
      },
      {
        sessionId: "9ea32c73-2956-474d-8300-49bcee9d15c5",
        category: "General Knowledge",
        difficulty: "easy",
        score: 6,
        points: 100,
        date: "Sep 8th 2022, 12:20pm",
      },
    ]);
  });

  test("works with limit", async function () {
    const sessions = await User.getSessions("u1", 3);
    expect(sessions).toEqual([
      {
        sessionId: "02d25fe5-ac33-4da8-8089-24d4600eb19c",
        category: "Entertainment: Books",
        difficulty: "easy",
        score: 6,
        points: 75,
        date: "Sep 10th 2022, 1:35pm",
      },
      {
        sessionId: "1031be27-511d-4ad4-bbe4-f9e4c3d3022b",
        category: "General Knowledge",
        difficulty: "easy",
        score: 7,
        points: 120,
        date: "Sep 10th 2022, 1:26pm",
      },
      {
        sessionId: "4a3ee8fd-9410-479b-be30-21c5c7c9f4c9",
        category: "General Knowledge",
        difficulty: "easy",
        score: 7,
        points: 120,
        date: "Sep 8th 2022, 1:25pm",
      },
    ]);
  });

  test("not found if no such user", async function () {
    try {
      await User.getSessions("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

});

/** addSession ====================================================================== */

describe("addSession", function () {
  const session = {
    sessionId: "02d25fe5-ac33-4da8-8089-24d4600eb11c",
    userId: 1,
    category: "General Knowledge",
    difficulty: "easy",
    score: 8,
    points: 150,
  };

  const invalidUserSession = {
    sessionId: "02d25fe5-ac33-4da8-8089-24d4600eb11c",
    userId: 99,
    category: "General Knowledge",
    difficulty: "easy",
    score: 8,
    points: 150,
  };

  const invalidCategorySession = {
    sessionId: "02d25fe5-ac33-4da8-8089-24d4600eb11c",
    userId: 1,
    category: "abcdefg",
    difficulty: "easy",
    score: 8,
    points: 150,
  };

  const invalidDifficultySession = {
    sessionId: "02d25fe5-ac33-4da8-8089-24d4600eb11c",
    userId: 1,
    category: "General Knowledge",
    difficulty: "extreme",
    score: 8,
    points: 150,
  };

  test("works", async function () {
    const addedSession = await User.addSession(session);
    expect(addedSession).toEqual({
      category_id: 1,
      difficulty_type: 1,
      score: 8,
      points: 150,
      date: expect.any(Object)
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.addSession(invalidUserSession);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with dup data", async function () {
    try {
      await User.addSession(session);
      await User.addSession(session);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("not found if invalid category", async function () {
    try {
      await User.addSession(invalidCategorySession);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if invalid difficulty", async function () {
    try {
      await User.addSession(invalidDifficultySession);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/** deleteSession ================================================================== */

describe("deleteSession", function () {
  test("works", async function () {
    const deletedSession = await User.deleteSession(2);
    expect(deletedSession).toEqual({
      id: 2,
      session_id: "3e1da446-5fff-403f-8285-bdd95eddcb18",
      user_id: 1,
      category_id: 1,
      difficulty_type: 1,
      score: 6,
      points: 100,
      date: expect.any(Object),
    });
  });
});


/** getPlayedCounts ================================================================== */

describe("getPlayedCounts", function () {
  test("works with no category and difficulty", async function () {
    const playedCounts = await User.getPlayedCounts("u1");
    expect(playedCounts).toEqual([
      {
        category: "Entertainment: Books",
        difficulty: "easy",
        played: 1,
      },
      {
        category: "General Knowledge",
        difficulty: "easy",
        played: 7,
      },
      {
        category: "General Knowledge",
        difficulty: "medium",
        played: 2,
      },
    ]);
  });

  test("works with category", async function () {
    const playedCounts = await User.getPlayedCounts("u1", "General Knowledge");
    expect(playedCounts).toEqual([
      {
        category: "General Knowledge",
        difficulty: "easy",
        played: 7,
      },
      {
        category: "General Knowledge",
        difficulty: "medium",
        played: 2,
      },
    ]);
  });

  test("works with difficulty", async function () {
    const playedCounts = await User.getPlayedCounts("u1", "", "easy");
    expect(playedCounts).toEqual([
      {
        category: "Entertainment: Books",
        difficulty: "easy",
        played: 1,
      },
      {
        category: "General Knowledge",
        difficulty: "easy",
        played: 7,
      },
    ]);
  });

  test("works with both category and difficulty", async function () {
    const playedCounts = await User.getPlayedCounts("u1", "General Knowledge", "easy");
    expect(playedCounts).toEqual([
      {
        category: "General Knowledge",
        difficulty: "easy",
        played: 7,
      }
    ]);
  });

  test("works with no played history", async function () {
    const res = await User.getPlayedCounts(
      "u2",
      "General Knowledge",
      "easy"
    );
    expect(res).toEqual({
      category: "General Knowledge",
      difficulty: "easy",
      played: 0
    });
  });
});


/** updatePlayedCounts ================================================================= */

describe("updatePlayedCounts", function () {
  test("works", async function () {
    const updatedPlayedCounts = await User.updatePlayedCounts({
      userId: 1,
      category: "General Knowledge",
      difficulty: "easy",
    });
    expect(updatedPlayedCounts).toEqual({
      category_id: 1,
      difficulty_type: 1,
      played: 8,
    });
  });

  test("works for first time play", async function () {
    const updatedPlayedCounts = await User.updatePlayedCounts({
      userId: 2,
      category: "General Knowledge",
      difficulty: "easy",
    });
    expect(updatedPlayedCounts).toEqual({
      category_id: 1,
      difficulty_type: 1,
      played: 1,
    });
  });
});