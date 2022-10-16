import React from "react";
import { render } from "@testing-library/react";
import CreateFolderForm from "../CreateFolderForm";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

it("renders without crashing", function () {
  render(
    <UserProvider>
      <CreateFolderForm />
    </UserProvider>
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider>
        <CreateFolderForm />
      </UserProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});
