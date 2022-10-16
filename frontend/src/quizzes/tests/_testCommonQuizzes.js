import TriviaApi from "../../api/api";

// mock response objects for Trivia Api methods

const commonBeforeEach = async() => {
  jest.spyOn(TriviaApi, "getLeaderboardScores").mockResolvedValue([
    {
      category: "Entertainment: Books",
      difficulty: "easy",
      username: "testadmin",
      score: 9,
      points: 80,
      date: "Sep 12th 2022, 1:04pm",
    },
    {
      category: "Entertainment: Film",
      difficulty: "easy",
      username: "testadmin",
      score: 10,
      points: 80,
      date: "Sep 10th 2022, 1:04pm",
    },
    {
      category: "Entertainment: Film",
      difficulty: "medium",
      username: "testadmin",
      score: 10,
      points: 80,
      date: "Sep 10th 2022, 1:06pm",
    },
    {
      category: "Science: Computers",
      difficulty: "easy",
      username: "testadmin",
      score: 9,
      points: 80,
      date: "Sep 12th 2022, 1:04pm",
    },
  ]);

  jest.spyOn(TriviaApi, "getScores").mockResolvedValue([
    {
      category: "Entertainment: Books",
      difficulty: "easy",
      score: 9,
      points: 70,
      date: "Sep 8th 2022, 1:20pm",
    },
    {
      category: "Entertainment: Film",
      difficulty: "easy",
      score: 9,
      points: 70,
      date: "Sep 8th 2022, 12:20pm",
    },
    {
      category: "Entertainment: Film",
      difficulty: "medium",
      score: 10,
      points: 70,
      date: "Sep 8th 2022, 1:06pm",
    },
  ]);

  jest.spyOn(TriviaApi, "getQuizzes").mockResolvedValue([
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "easy",
      question: "In past times, what would a gentleman keep in his fob pocket?",
      correct_answer: "Watch",
      incorrect_answers: ["Money", "Keys", "Notebook"],
      answers: ["Money", "Notebook", "Keys", "Watch"],
    },
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "easy",
      question: "What is the largest organ of the human body?",
      correct_answer: "Skin",
      incorrect_answers: ["Heart", "large Intestine", "Liver"],
      answers: ["large Intestine", "Liver", "Skin", "Heart"],
    },
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "easy",
      question:
        "What is the shape of the toy invented by Hungarian professor Ernő Rubik?",
      correct_answer: "Cube",
      incorrect_answers: ["Sphere", "Cylinder", "Pyramid"],
      answers: ["Pyramid", "Cube", "Cylinder", "Sphere"],
    },
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "easy",
      question:
        "What is on display in the Madame Tussaud&#039;s museum in London?",
      correct_answer: "Wax sculptures",
      incorrect_answers: [
        "Designer clothing",
        "Unreleased film reels",
        "Vintage cars",
      ],
      answers: [
        "Wax sculptures",
        "Unreleased film reels",
        "Designer clothing",
        "Vintage cars",
      ],
    },
    {
      category: "General Knowledge",
      type: "boolean",
      difficulty: "easy",
      question: "The color orange is named after the fruit.",
      correct_answer: "True",
      incorrect_answers: ["False"],
      answers: ["True", "False"],
    },
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "easy",
      question:
        "What machine element is located in the center of fidget spinners?",
      correct_answer: "Bearings",
      incorrect_answers: ["Axles", "Gears", "Belts"],
      answers: ["Belts", "Axles", "Gears", "Bearings"],
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
        "The Name of a Warner Brothers Cartoon Character",
        "A Psychological Disorder",
        "An Australian State",
      ],
    },
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "easy",
      question:
        "The likeness of which president is featured on the rare $2 bill of USA currency?",
      correct_answer: "Thomas Jefferson",
      incorrect_answers: [
        "Martin Van Buren",
        "Ulysses Grant",
        "John Quincy Adams",
      ],
      answers: [
        "Martin Van Buren",
        "Thomas Jefferson",
        "Ulysses Grant",
        "John Quincy Adams",
      ],
    },
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "easy",
      question: "Earth is located in which galaxy?",
      correct_answer: "The Milky Way Galaxy",
      incorrect_answers: [
        "The Mars Galaxy",
        "The Galaxy Note",
        "The Black Hole",
      ],
      answers: [
        "The Milky Way Galaxy",
        "The Galaxy Note",
        "The Black Hole",
        "The Mars Galaxy",
      ],
    },
    {
      category: "General Knowledge",
      type: "multiple",
      difficulty: "easy",
      question: "Who is the youngest person to recieve a Nobel Prize?",
      correct_answer: "Malala Yousafzai",
      incorrect_answers: [
        "Lawrence Bragg",
        "Werner Heisenberg",
        "Yasser Arafat",
      ],
      answers: [
        "Werner Heisenberg",
        "Lawrence Bragg",
        "Malala Yousafzai",
        "Yasser Arafat",
      ],
    },
  ]);

  jest.spyOn(TriviaApi, "addSession").mockResolvedValue({
    "added": {
        "category_id": 9,
        "difficulty_type": 1,
        "score": 7,
        "points": 124,
        "date": "2022-10-12T18:56:06.882Z"
    }
  });
  jest.spyOn(TriviaApi, "updateScore").mockResolvedValue({
    "updated": {
        "category_id": 9,
        "difficulty_type": 1,
        "score": 7,
        "points": 124,
        "date": "2022-10-12T18:56:06.943Z"
    }
  });
  jest.spyOn(TriviaApi, "updateLeaderboardScore").mockResolvedValue({
    "updated": {
        "category_id": 9,
        "difficulty_type": 1,
        "user_id": 1,
        "score": 7,
        "points": 124,
        "date": "2022-10-12T18:56:06.978Z"
    }
  });
  jest.spyOn(TriviaApi, "updatePlayedCounts").mockResolvedValue({
    updated: {
      category_id: 9,
      difficulty_type: 1,
      played: 1,
    },
  });
  
  jest
    .spyOn(TriviaApi, "postBadge")
    .mockResolvedValue({
      added: {
        badgeName: "Trophy",
        badgeUrl: "/badges/trophy.gif",
        date: "2022-10-12T18:56:06.995Z",
      },
    })
    .mockResolvedValueOnce({
      added: {
        badgeName: "Ace",
        badgeUrl: "/badges/ace.gif",
        date: "2022-10-12T18:56:06.929Z",
      },
    });
    
  jest.spyOn(TriviaApi, "getStats").mockResolvedValue({
    "level": 15,
    "title": "Ace",
    "quizzes completed": 35,
    "points": 3564,
    "remainingPts": 236,
    "levelPts": 300
  });

  

}


const commonAfterAll = async() => jest.restoreAllMocks();

module.exports = {
  commonBeforeEach,
  commonAfterAll,
};