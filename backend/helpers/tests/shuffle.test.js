("use strict");

const { shuffle } = require("../shuffle");

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

const shuffledMockQuizData = [
  {
    category: "General Knowledge",
    type: "multiple",
    difficulty: "easy",
    question:
      "Where is the train station &quot;Llanfair&shy;pwllgwyngyll&shy;gogery&shy;chwyrn&shy;drobwll&shy;llan&shy;tysilio&shy;gogo&shy;goch&quot;?",
    correct_answer: "Wales",
    incorrect_answers: ["Moldova", "Czech Republic", "Denmark"],
    answers: ["Wales", "Denmark", "Moldova", "Czech Republic"],
  },
  {
    category: "General Knowledge",
    type: "multiple",
    difficulty: "easy",
    question:
      "Which company did Valve cooperate with in the creation of the Vive?",
    correct_answer: "HTC",
    incorrect_answers: ["Oculus", "Google", "Razer"],
    answers: ["HTC", "Razer", "Oculus", "Google"],
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
      "Victoria Line",
      "Circle Line",
      "Bakerloo Line",
    ],
  },
];

describe("shuffle", function () {
  test("shuffles array's answers", function () {
    Math.random = jest.fn(() => 0.5);

    let result = mockApiResp.results.map((q) => {
      q.answers = shuffle([q.correct_answer, ...q.incorrect_answers]);

      return q;
    });

    expect(result).toEqual(shuffledMockQuizData);
  });
});
