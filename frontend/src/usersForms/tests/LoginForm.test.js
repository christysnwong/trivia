import React from "react";
import { render } from "@testing-library/react";
import LoginForm from "../LoginForm";
import { MemoryRouter } from "react-router-dom";

it("renders without crashing", function () {
  render(<LoginForm />);
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});
