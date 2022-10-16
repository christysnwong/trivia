import React from "react";
import { render } from "@testing-library/react";
import EditFolderForm from "../EditFolderForm";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

it("renders without crashing", function () {
  render(
    <UserProvider>
      <EditFolderForm />
    </UserProvider>
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider>
        <EditFolderForm />
      </UserProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});
