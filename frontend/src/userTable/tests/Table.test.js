import React from "react";
import { render } from "@testing-library/react";
import Table from "../Table";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

const entries = [
  {
    category: "Entertainment: Books",
    difficulty: "easy",
    score: 9,
    points: 70,
    date: "Sep 8th 2022, 1:20pm",
  },
  {
    category: "Entertainment: Film",
    difficulty: "easy",
    score: 9,
    points: 70,
    date: "Sep 8th 2022, 12:20pm",
  },
  {
    category: "Entertainment: Film",
    difficulty: "medium",
    score: 10,
    points: 70,
    date: "Sep 8th 2022, 1:06pm",
  },
];

it("renders without crashing", function () {
  render(
    <UserProvider>
      <Table entries={entries} />
    </UserProvider>
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider>
        <Table entries={entries} />
      </UserProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});
