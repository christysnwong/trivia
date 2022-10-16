import React from "react";
import { render } from "@testing-library/react";
import QuizSettingForm from "../QuizSettingForm";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

it("renders without crashing", function () {
  render(
    <UserProvider>
      <QuizSettingForm />
    </UserProvider>
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider>
        <QuizSettingForm />
      </UserProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});
