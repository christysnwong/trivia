"use strict";

const request = require("supertest");
const app = require("../../app");
const axios = require("axios");
const nock = require("nock");

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

const mockResp = { quizData: [
  {
    category: "General Knowledge",
    type: "multiple",
    difficulty: "easy",
    question:
      "Which company did Valve cooperate with in the creation of the Vive?",
    correct_answer: "HTC",
    incorrect_answers: ["Oculus", "Google", "Razer"],
    answers: ["Razer", "Google", "HTC", "Oculus"],
  },
  {
    category: "General Knowledge",
    type: "boolean",
    difficulty: "easy",
    question: "The Great Wall of China is visible from the moon.",
    correct_answer: "False",
    incorrect_answers: ["True"],
    answers: ["True", "False"],
  },
  {
    category: "General Knowledge",
    type: "multiple",
    difficulty: "easy",
    question: "How would one say goodbye in Spanish?",
    correct_answer: "Adi&oacute;s",
    incorrect_answers: [" Hola", "Au Revoir", "Salir"],
    answers: ["Au Revoir", " Hola", "Salir", "Adi&oacute;s"],
  },
  {
    category: "General Knowledge",
    type: "multiple",
    difficulty: "easy",
    question: "What geometric shape is generally used for stop signs?",
    correct_answer: "Octagon",
    incorrect_answers: ["Hexagon", "Circle", "Triangle"],
    answers: ["Triangle", "Circle", "Octagon", "Hexagon"],
  },
  {
    category: "General Knowledge",
    type: "multiple",
    difficulty: "easy",
    question: "What is &quot;dabbing&quot;?",
    correct_answer: "A dance",
    incorrect_answers: ["A medical procedure", "A sport", "A language"],
    answers: ["A sport", "A medical procedure", "A language", "A dance"],
  },
  {
    category: "General Knowledge",
    type: "boolean",
    difficulty: "easy",
    question:
      "On average, at least 1 person is killed by a drunk driver in the United States every hour.",
    correct_answer: "True",
    incorrect_answers: ["False"],
    answers: ["True", "False"],
  },
  {
    category: "General Knowledge",
    type: "multiple",
    difficulty: "easy",
    question: "What do the letters in the GMT time zone stand for?",
    correct_answer: "Greenwich Mean Time",
    incorrect_answers: [
      "Global Meridian Time",
      "General Median Time",
      "Glasgow Man Time",
    ],
    answers: [
      "General Median Time",
      "Greenwich Mean Time",
      "Glasgow Man Time",
      "Global Meridian Time",
    ],
  },
  {
    category: "General Knowledge",
    type: "multiple",
    difficulty: "easy",
    question: "What is Tasmania?",
    correct_answer: "An Australian State",
    incorrect_answers: [
      "A flavor of Ben and Jerry&#039;s ice-cream",
      "A Psychological Disorder",
      "The Name of a Warner Brothers Cartoon Character",
    ],
    answers: [
      "A flavor of Ben and Jerry&#039;s ice-cream",
      "A Psychological Disorder",
      "An Australian State",
      "The Name of a Warner Brothers Cartoon Character",
    ],
  },
  {
    category: "General Knowledge",
    type: "multiple",
    difficulty: "easy",
    question: "The Canadian $1 coin is colloquially known as a what?",
    correct_answer: "Loonie",
    incorrect_answers: ["Boolie", "Foolie", "Moodie"],
    answers: ["Foolie", "Boolie", "Moodie", "Loonie"],
  },
  {
    category: "General Knowledge",
    type: "multiple",
    difficulty: "easy",
    question: "What is the profession of Elon Musk&#039;s mom, Maye Musk?",
    correct_answer: "Model",
    incorrect_answers: ["Professor", "Biologist", "Musician"],
    answers: ["Professor", "Musician", "Biologist", "Model"],
  },
]};


/** GET /quizzes ======================================================================= */

describe("GET /quizzes", function () {

    test("API returns expected data", async () => {
      nock("https://opentdb.com")
        .get("/api.php")
        .query({ amount: 10, category: 9, difficulty: "easy" })
        .reply(200, mockResp);

      const resp = await getQuizData();

      expect(resp).toEqual(mockResp);

      nock.cleanAll();

    });

    // test("quizzes", async () => {
    //   nock("/quizzes")
    //     .get("")
    //     .query({ amount: 10, category: 9, difficulty: "easy" })
    //     .reply(200, mockResp);

    //   const resp = await request(app)
    //     .get("/quizzes")
    //     .query({ amount: 10, category: 9, difficulty: "easy" });

    //   console.log("=======resp.body", resp.body);

    //   expect(resp.body).toEqual(mockResp);
    // });
});