import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Sessions from "../Sessions";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

import TriviaApi from "../../api/api";

const { commonBeforeEach, commonAfterAll } = require("./_testCommonUserInfo");

beforeEach(commonBeforeEach);
afterAll(commonAfterAll);

it("renders without crashing", function () {
  render(
    <UserProvider>
      <Sessions />
    </UserProvider>
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider>
        <Sessions />
      </UserProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});

it("checks if TriviaApi.getSessions is called and displayed properly", async () => {
  jest.spyOn(React, "useEffect").mockImplementation((f) => f());
  jest.spyOn(TriviaApi, "getSessions");
  render(
    <UserProvider>
      <Sessions />
    </UserProvider>
  );

  expect(TriviaApi.getSessions).toHaveBeenCalled();

  expect(await screen.findByText(/category/i)).toBeInTheDocument();
  expect(await screen.findByText(/difficulty/i)).toBeInTheDocument();

  const entries = await screen.findAllByText(/entertainment/i);
  expect(entries).toHaveLength(7); 


});