import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Quiz from "../Quiz";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

import TriviaApi from "../../api/api";

const { commonBeforeEach, commonAfterAll } = require("./_testCommonQuizzes.js");

beforeEach(commonBeforeEach);
afterAll(commonAfterAll);


it("renders without crashing", function () {
  render(
    <UserProvider>
      <Quiz />
    </UserProvider>
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider>
        <Quiz />
      </UserProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});

it("populates form, generates questions and answers correctly", async function() {

  jest.spyOn(TriviaApi, "getQuizzes");

  render(
    <UserProvider>
      <Quiz />
    </UserProvider>
  );

  const categorySelect = screen.getByLabelText("Category");
  const difficultySelect = screen.getByLabelText("Difficulty");
  const submitBtn = screen.getByText("Submit");

  // fill out form
  fireEvent.change(categorySelect, { target: { value: "9" } });
  fireEvent.change(difficultySelect, { target: { value: "easy" } });
  fireEvent.click(submitBtn);

  expect(await screen.findByText(/general knowledge/i)).toBeInTheDocument();
  expect(TriviaApi.getQuizzes).toHaveBeenCalled();

  // check question 1
  expect(await screen.findByText(/question 1/i)).toBeInTheDocument();
  expect(
    await screen.findByText(
      "In past times, what would a gentleman keep in his fob pocket?"
    )
  ).toBeInTheDocument();

  expect(
    await screen.findByRole("button", { name: /reset/i })
  ).toBeInTheDocument();


  // check behavior after an answer is selected

  const ans = await screen.findByRole("button", { name: /keys/i });

  fireEvent.click(ans);

  const nextBtn1 = await screen.findByRole("button", { name: /next/i });
  expect(nextBtn1).toBeInTheDocument();

  // check question 2
  fireEvent.click(nextBtn1);

  expect(await screen.findByText(/question 2/i)).toBeInTheDocument();
  expect(
    await screen.findByText("What is the largest organ of the human body?")
  ).toBeInTheDocument();

})
