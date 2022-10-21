"use strict";

const request = require("supertest");
const app = require("../../app");
const axios = require("axios");
const nock = require("nock");

jest.mock("../../helpers/shuffle"); 
const { shuffle } = require("../../helpers/shuffle");

const getQuizData = async () => {
  const res = await axios.get("https://opentdb.com/api.php", {
    params: { amount: 10, category: 9, difficulty: "easy" },
  });

  const data = res.data;
  return data;
};

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

/** SETUP mock response ================================================================== */

const mockApiResp = {
  response_code: 0,
  results: [
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "easy",
      question:
        "Where is the train station &quot;Llanfair&shy;pwllgwyngyll&shy;gogery&shy;chwyrn&shy;drobwll&shy;llan&shy;tysilio&shy;gogo&shy;goch&quot;?",
      correct_answer: "Wales",
      incorrect_answers: ["Moldova", "Czech Republic", "Denmark"],
    },
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "easy",
      question:
        "Which company did Valve cooperate with in the creation of the Vive?",
      correct_answer: "HTC",
      incorrect_answers: ["Oculus", "Google", "Razer"],
    },
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "easy",
      question: "What was the first ever London Underground line to be built?",
      correct_answer: "Metropolitan Line",
      incorrect_answers: ["Circle Line", "Bakerloo Line", "Victoria Line"],
    },
  ],
};

const mockQuizData = {
  quizData: [
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "easy",
      question:
        "Where is the train station &quot;Llanfair&shy;pwllgwyngyll&shy;gogery&shy;chwyrn&shy;drobwll&shy;llan&shy;tysilio&shy;gogo&shy;goch&quot;?",
      correct_answer: "Wales",
      incorrect_answers: ["Moldova", "Czech Republic", "Denmark"],
      answers: ["Wales", "Moldova", "Czech Republic", "Denmark"],
    },
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "easy",
      question:
        "Which company did Valve cooperate with in the creation of the Vive?",
      correct_answer: "HTC",
      incorrect_answers: ["Oculus", "Google", "Razer"],
      answers: ["HTC", "Oculus", "Google", "Razer"],
    },
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "easy",
      question: "What was the first ever London Underground line to be built?",
      correct_answer: "Metropolitan Line",
      incorrect_answers: ["Circle Line", "Bakerloo Line", "Victoria Line"],
      answers: [
        "Metropolitan Line",
        "Circle Line",
        "Bakerloo Line",
        "Victoria Line",
      ],
    },
  ],
};


/** GET /quizzes ======================================================================= */

describe("GET /quizzes", function () {

    test("mock should intercept API request", async () => {
      nock("https://opentdb.com")
        .get("/api.php")
        .query({ amount: 10, category: 9, difficulty: "easy" })
        .reply(200, mockApiResp);

      const resp = await getQuizData();

      expect(resp).toEqual(mockApiResp);

      nock.cleanAll();

    });

    test("quizData should be correct", async () => {
      nock("https://opentdb.com")
        .get("/api.php")
        .query({ amount: 10, category: 9, difficulty: "easy" })
        .reply(200, mockApiResp);

      shuffle.mockImplementation(arr => arr);

      const resp = await request(app)
        .get("/quizzes")
        .query({ category: 9, difficulty: "easy" });

      // console.log("=======resp.body", resp.body);

      expect(resp.body).toEqual(mockQuizData);

      nock.cleanAll();
    });
});