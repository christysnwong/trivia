import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Favourite from "../Favourite";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

import TriviaApi from "../../api/api";

import { commonBeforeEach, commonAfterAll } from "./_testCommonUserFavs";

beforeEach(commonBeforeEach);
afterAll(commonAfterAll);

it("renders without crashing", function () {
  render(
    <UserProvider>
      <Favourite />
    </UserProvider>
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider>
        <Favourite />
      </UserProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});

it("checks if TriviaApi.getAllFolders is called", async () => {
  jest.spyOn(React, "useEffect").mockImplementation((f) => f());
  jest.spyOn(TriviaApi, "getAllFolders");
  render(
    <UserProvider>
      <Favourite />
    </UserProvider>
  );

  expect(TriviaApi.getAllFolders).toHaveBeenCalled();

});

it("loads folders and trivia", async function() {
  jest.spyOn(React, "useEffect").mockImplementation((f) => f());
  jest.spyOn(TriviaApi, "getAllFolders");
  jest.spyOn(TriviaApi, "getFolderTrivia");
  render(
    <UserProvider>
      <Favourite />
    </UserProvider>
  );

  expect(await screen.findByText(/all/i)).toBeInTheDocument();
  expect(await screen.findByText(/test1/i)).toBeInTheDocument();
  expect(await screen.findByText(/test2/i)).toBeInTheDocument();
  expect(await screen.findByText(/test3/i)).toBeInTheDocument();

  const allFolder = await screen.findByText(/all/i);

  fireEvent.click(allFolder);

  expect(TriviaApi.getFolderTrivia).toHaveBeenCalled();

})
