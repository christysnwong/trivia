import React from "react";
import { render, screen } from "@testing-library/react";
import PersonalBest from "../PersonalBest";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

import TriviaApi from "../../api/api";

const { commonBeforeEach, commonAfterAll } = require("./_testCommonUserInfo");

beforeEach(commonBeforeEach);
afterAll(commonAfterAll);


it("renders without crashing", function () {
  render(
    <UserProvider>
      <PersonalBest />
    </UserProvider>
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider>
        <PersonalBest />
      </UserProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});

it("checks if results from TriviaApi.getScores are fetched and rendered", async () => {
  jest.spyOn(React, "useEffect").mockImplementation((f) => f());
  jest.spyOn(TriviaApi, "getScores");
  render(
    <UserProvider>
      <PersonalBest />
    </UserProvider>
  );

  expect(TriviaApi.getScores).toHaveBeenCalled();

  expect(await screen.findAllByText(/category/i)).toHaveLength(2);
  expect(await screen.findAllByText(/difficulty/i)).toHaveLength(2);
  expect(await screen.findByText(/points/i)).toBeInTheDocument();
  expect(await screen.findAllByText(70)).toHaveLength(3);
  expect(await screen.findByText(/date/i)).toBeInTheDocument();

  expect(await screen.findAllByText(/entertainment/i)).toHaveLength(3);
  expect(await screen.findAllByText(/film/i)).toHaveLength(2);
  expect(await screen.findAllByText(/books/i)).toHaveLength(1);
});