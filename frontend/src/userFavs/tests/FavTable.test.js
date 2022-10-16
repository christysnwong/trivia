import React from "react";
import { render, screen } from "@testing-library/react";
import FavTable from "../FavTable";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

const userFolders = [
  {
    folderId: 1,
    name: "All",
  },
  {
    folderId: 2,
    name: "TEST1",
  },
  {
    folderId: 3,
    name: "TEST2",
  },
  {
    folderId: 4,
    name: "TEST3",
  },
];

const folder = { id: 2, name: "TEST1" };

const entries = [
  {
    id: 4,
    question: "U1 Question 1 in TEST1",
    answer: "Answer 1",
  },
];



it("renders without crashing", function () {
  render(
    <UserProvider>
      <FavTable userFolders={userFolders} folder={folder} entries={entries} />
    </UserProvider>
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider>
        <FavTable userFolders={userFolders} folder={folder} entries={entries}/>
      </UserProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});


it("loads the question and answer", function () {
  render(
    <UserProvider>
      <FavTable userFolders={userFolders} folder={folder} entries={entries} />
    </UserProvider>
  );

  expect(screen.getAllByText("TEST1")).toHaveLength(2);
  expect(screen.getByText("U1 Question 1 in TEST1")).toBeInTheDocument();
  expect(screen.getByText("Answer 1")).toBeInTheDocument();

  expect(screen.getByText("Move to...")).toBeInTheDocument();


})