import React from "react";
import { render } from "@testing-library/react";
import QuizQuestions from "../QuizQuestions";
import { MemoryRouter } from "react-router-dom";
import UserProvider from "../../common/UserProvider";

const question = {
  category: "General Knowledge",
  type: "multiple",
  difficulty: "easy",
  question:
    "Virgin Trains, Virgin Atlantic and Virgin Racing, are all companies owned by which famous entrepreneur?   ",
  correct_answer: "Richard Branson",
  incorrect_answers: ["Alan Sugar", "Donald Trump", "Bill Gates"],
  answers: ["Richard Branson", "Bill Gates", "Alan Sugar", "Donald Trump"],
};


it("renders without crashing", function () {
  render(
    <UserProvider>
      <QuizQuestions num={1} question={question} />
    </UserProvider>
  );
});

it("matches snapshot", function () {
  const { asFragment } = render(
    <MemoryRouter>
      <UserProvider>
        <QuizQuestions num={1} question={question}/>
      </UserProvider>
    </MemoryRouter>
  );
  expect(asFragment()).toMatchSnapshot();
});
