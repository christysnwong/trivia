import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../Home";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

it("renders without crashing", function () {
  render(
    <UserProvider>
      <Home />
    </UserProvider>
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider>
        <Home />
      </UserProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});

it("shows correct content for loggined user", () => {
  render(
    <UserProvider>
      <Home />
    </UserProvider>
  );

  expect(screen.getByText(`Recent Activities`, { exact: false })).toBeInTheDocument(); 
});


it("matches snapshot when logged out", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider currUser={null}>
        <Home />
      </UserProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});

it("shows correct content for visitors", () => {
  render(
    <UserProvider currUser={null}>
      <Home />
    </UserProvider>
  );

  expect(
    screen.getAllByText(`Features`)[0]
  ).toBeInTheDocument();
});

