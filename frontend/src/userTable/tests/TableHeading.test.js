import React from "react";
import { render } from "@testing-library/react";
import TableHeading from "../TableHeading";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

it("renders without crashing", function () {
  render(
    <UserProvider>
      <TableHeading heading="category" />
    </UserProvider>,
    { container: document.createElement("tr") }
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <UserProvider>
      <TableHeading heading="category" />
    </UserProvider>,
    { container: document.createElement("tr") }
  );
  expect(asFragment()).toMatchSnapshot();
});
