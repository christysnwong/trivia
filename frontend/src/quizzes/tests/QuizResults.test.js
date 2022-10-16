import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import QuizResults from "../QuizResults";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

import TriviaApi from "../../api/api";

const { commonBeforeEach, commonAfterAll } = require("./_testCommonQuizzes.js");

beforeEach(commonBeforeEach);
afterAll(commonAfterAll);


it("renders without crashing", function () {
  render(
    <UserProvider>
      <QuizResults
        category="General Knowledge"
        difficulty="easy"
        hiScore={{
          category: "General Knowledge",
          difficulty: "easy",
          score: 4,
          points: 80,
          date: "Oct 12th 2022, 12:44pm",
        }}
        leaderboardScore={{
          category: "General Knowledge",
          difficulty: "easy",
          score: 4,
          points: 80,
          date: "Oct 12th 2022, 12:44pm",
        }}
        totalScore={3}
        totalTime={40}
        totalTimeBonus={18}
        maxCombo={3}
        points={60}
      />
    </UserProvider>
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider>
        <QuizResults
          category="General Knowledge"
          difficulty="easy"
          hiScore={{
            category: "General Knowledge",
            difficulty: "easy",
            score: 5,
            points: 85,
            date: "Oct 12th 2022, 12:44pm",
          }}
          leaderboardScore={{
            category: "General Knowledge",
            difficulty: "easy",
            score: 5,
            points: 85,
            date: "Oct 12th 2022, 12:44pm",
          }}
          totalScore={3}
          totalTime={40}
          totalTimeBonus={18}
          maxCombo={3}
          points={60}
        />
      </UserProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});

it("renders correctly for visitors", async function () {
  render(
    <UserProvider currUser={null}>
      <QuizResults
        category="General Knowledge"
        difficulty="easy"
        hiScore={0}
        leaderboardScore={{
          category: "General Knowledge",
          difficulty: "easy",
          score: 5,
          points: 85,
          date: "Oct 12th 2022, 12:44pm",
        }}
        totalScore={3}
        totalTime={40}
        totalTimeBonus={18}
        maxCombo={3}
        points={60}
      />
    </UserProvider>
  );

  expect(
    await screen.findByText(
      "Thanks for playing, guest. You can save your score by signing up!"
    )
  ).toBeInTheDocument();

});



it("renders correctly for registered user and updates stats", async function () {
  jest.spyOn(React, "useEffect").mockImplementation((f) => f());
  jest.spyOn(TriviaApi, "addSession");
  jest.spyOn(TriviaApi, "updateScore");
  jest.spyOn(TriviaApi, "updateLeaderboardScore");
  jest.spyOn(TriviaApi, "updatePlayedCounts");
  jest.spyOn(TriviaApi, "postBadge");
  jest.spyOn(TriviaApi, "getStats");

  
  render(
    <UserProvider>
      <QuizResults
        category="General Knowledge"
        difficulty="easy"
        hiScore={0}
        leaderboardScore={{
          category: "General Knowledge",
          difficulty: "easy",
          score: 5,
          points: 85,
          date: "Oct 12th 2022, 12:44pm",
        }}
        totalScore={7}
        totalTime={18}
        totalTimeBonus={42}
        maxCombo={3}
        points={124}
      />
    </UserProvider>
  );

  expect(await screen.findByText("124 points")).toBeInTheDocument();

  expect(
    await screen.findByText(
      "Great job! You have made a new personal best record and a new leaderboard record!"
    )
  ).toBeInTheDocument();

  expect(
    await screen.findByText("Yay! You have leveled up and became Level 15 Ace.")
  ).toBeInTheDocument();

  expect(
    await screen.findByText(
      `You have earned the gold trophy badge for breaking the previous leaderboard record! Also, your have earned the level badge Ace! View all your badges under 'My Dashboard'.`
    )
  ).toBeInTheDocument();


  const tryAgainBtn = screen.getByText(/try again/i);
  expect(tryAgainBtn).toBeInTheDocument();

  
});
