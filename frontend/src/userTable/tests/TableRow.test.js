import React from "react";
import { render } from "@testing-library/react";
import TableRow from "../TableRow";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

const entry = {
  category: "Entertainment: Books",
  difficulty: "easy",
  score: 9,
  points: 70,
  date: "Sep 8th 2022, 1:20pm",
};


it("renders without crashing", function () {
  render(
    <UserProvider>
      <TableRow id={1} entry={entry} />
    </UserProvider>,
    { container: document.createElement("tbody") }
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <UserProvider>
      <TableRow id={1} entry={entry} />
    </UserProvider>,
    { container: document.createElement("tbody") }
  );
  expect(asFragment()).toMatchSnapshot();
});

