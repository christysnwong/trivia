import React from "react";
import { render } from "@testing-library/react";
import ProfileEditForm from "../ProfileEditForm";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";


it("renders without crashing", function () {
  render(
    <UserProvider>
      <ProfileEditForm />
    </UserProvider>
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider>
        <ProfileEditForm />
      </UserProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});
