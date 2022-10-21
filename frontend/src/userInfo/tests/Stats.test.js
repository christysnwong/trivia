import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Stats from "../Stats";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

import TriviaApi from "../../api/api";

import { commonBeforeEach, commonAfterAll } from "./_testCommonUserInfo";

beforeEach(commonBeforeEach);
afterAll(commonAfterAll);

it("renders without crashing", function () {
  render(
    <UserProvider>
      <Stats />
    </UserProvider>
  );
});

it("matches snapshot", async function () {
  jest.spyOn(React, "useEffect").mockImplementation((f) => f());

  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider>
        <Stats />
      </UserProvider>
    </MemoryRouter>
  );
  

  expect(asFragment()).toMatchSnapshot();
});

it("checks if results from TriviaApi.getStats are fetched and displayed", async () => {
  jest.spyOn(React, "useEffect").mockImplementation((f) => f());
  jest.spyOn(TriviaApi, "getStats");
  render(
    <UserProvider>
      <Stats />
    </UserProvider>
  );

  
  expect(TriviaApi.getStats).toHaveBeenCalled();
  
  expect(await screen.findByText(/level/i)).toBeInTheDocument();
  expect(await screen.findByText(1)).toBeInTheDocument();
  expect(await screen.findByText(/title/i)).toBeInTheDocument();
  expect(await screen.findAllByText(/pro/i)).toHaveLength(2);
  expect(await screen.findAllByText(/points/i)).toHaveLength(2);
  expect(await screen.findByText(3440)).toBeInTheDocument();
  

});

it("checks if results from TriviaApi.getBadges are fetched and displayed", async () => {

  jest.spyOn(React, "useEffect").mockImplementation((f) => f());
  jest.spyOn(TriviaApi, "getBadges");
  render(
    <UserProvider>
      <Stats />
    </UserProvider>
  );

  expect(TriviaApi.getBadges).toHaveBeenCalled();

  const badgePro = await screen.findByAltText(/pro/i);
  const badgeApp = await screen.findByAltText(/apprentice/i);
  const badgeNewbie = await screen.findByAltText(/newbie/i);
  
  expect(badgePro).toBeInTheDocument();
  expect(badgeApp).toBeInTheDocument();
  expect(badgeNewbie).toBeInTheDocument();

  

});