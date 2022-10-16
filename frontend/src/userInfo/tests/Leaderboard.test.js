import React from "react";
import { render, screen } from "@testing-library/react";
import Leaderboard from "../Leaderboard";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

import TriviaApi from "../../api/api";

const { commonBeforeEach, commonAfterAll } = require("./_testCommonUserInfo");

beforeEach(commonBeforeEach);
afterAll(commonAfterAll);

it("renders without crashing", function () {
  render(
    <UserProvider>
      <Leaderboard />
    </UserProvider>
  );
});

it("matches snapshot", async function () {

  const { asFragment } = await render(
    <MemoryRouter>
      <UserProvider>
        <Leaderboard />
      </UserProvider>
    </MemoryRouter>
  );
  
  expect(asFragment()).toMatchSnapshot();
});

it("checks if results from TriviaApi.getLeaderboardScores are fetched and rendered", async () => {

  jest.spyOn(React, "useEffect").mockImplementation(f => f());
  jest.spyOn(TriviaApi, "getLeaderboardScores");
  render(
    <UserProvider>
      <Leaderboard />
    </UserProvider>
  );

  expect(TriviaApi.getLeaderboardScores).toHaveBeenCalled();

  expect(await screen.findByText(/category/i)).toBeInTheDocument();
  expect(await screen.findByText(/difficulty/i)).toBeInTheDocument();
  expect(await screen.findByText(/points/i)).toBeInTheDocument();
  expect(await screen.findAllByText(/entertainment/i)).toHaveLength(3);
  expect(await screen.findAllByText(/science/i)).toHaveLength(1);
  expect(await screen.findAllByText("testadmin")).toHaveLength(4);


});