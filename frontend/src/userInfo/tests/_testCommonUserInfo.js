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

  jest.spyOn(TriviaApi, "getSessions").mockResolvedValue([
    {
      category: "Entertainment: Books",
      difficulty: "easy",
      score: 9,
      points: 60,
      date: "Sep 8th 2022, 1:25pm",
    },
    {
      category: "Entertainment: Books",
      difficulty: "easy",
      score: 9,
      points: 70,
      date: "Sep 8th 2022, 1:20pm",
    },
    {
      category: "Entertainment: Film",
      difficulty: "medium",
      score: 10,
      points: 60,
      date: "Sep 8th 2022, 1:10pm",
    },
    {
      category: "Entertainment: Film",
      difficulty: "medium",
      score: 10,
      points: 70,
      date: "Sep 8th 2022, 1:06pm",
    },
    {
      category: "Entertainment: Film",
      difficulty: "easy",
      score: 9,
      points: 65,
      date: "Sep 8th 2022, 1:05pm",
    },
    {
      category: "Entertainment: Film",
      difficulty: "easy",
      score: 9,
      points: 60,
      date: "Sep 8th 2022, 1:01pm",
    },
    {
      category: "Entertainment: Film",
      difficulty: "easy",
      score: 9,
      points: 70,
      date: "Sep 8th 2022, 12:20pm",
    },
  ]);

  jest.spyOn(TriviaApi, "getStats").mockResolvedValue({
    level: 1,
    title: "Pro",
    "quizzes completed": 34,
    points: 3440,
    remainingPts: 60,
    levelPts: 300,
  });

  jest.spyOn(TriviaApi, "getBadges").mockResolvedValue([
    {
      badgeName: "Pro",
      badgeUrl: "/badges/pro.gif",
      date: "Sep 27th 2022, 1:04pm",
    },
    {
      badgeName: "Apprentice",
      badgeUrl: "/badges/apprentice.gif",
      date: "Sep 15th 2022, 1:04pm",
    },
    {
      badgeName: "Newbie",
      badgeUrl: "/badges/newbie.gif",
      date: "Sep 8th 2022, 1:04pm",
    },
  ]);

};



const commonAfterAll = async() => jest.restoreAllMocks();

module.exports = {
  commonBeforeEach,
  commonAfterAll,
};