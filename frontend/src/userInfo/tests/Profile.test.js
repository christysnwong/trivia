import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "../Profile";
import { MemoryRouter, Router } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

import { createMemoryHistory } from "history";

it("renders without crashing", function () {
  render(
    <UserProvider>
      <Profile />
    </UserProvider>
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider>
        <Profile />
      </UserProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});

it("redirects when clicking edit button", async function () {
  const history = createMemoryHistory();

  render(
    <Router history={history}>
      <UserProvider>
        <Profile />
      </UserProvider>
    </Router>
  );

  const editBtn = screen.getByText(/edit your info/i);
  fireEvent.click(editBtn);

  await waitFor(() => {
    expect(history.location.pathname).toBe("/profile/edit");
  });
});

it("redirects when delete account button", async function () {
  const history = createMemoryHistory();

  render(
    <Router history={history}>
      <UserProvider>
        <Profile />
      </UserProvider>
    </Router>
  );

  const deleteBtn = screen.getAllByText(/delete this account/i)[0];
  fireEvent.click(deleteBtn);

  await waitFor(() => {
    expect(history.location.pathname).toBe("/");
  });
});