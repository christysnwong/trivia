import TriviaApi from "../../api/api";

// mock response objects for Trivia Api methods
const commonBeforeEach = async () => {
  jest.spyOn(TriviaApi, "getAllFolders").mockResolvedValue([
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
  ]);

  jest.spyOn(TriviaApi, "getFolderTrivia").mockResolvedValue([
    {
      id: 1,
      question: "U1 Question 1 in Folder All",
      answer: "Answer 1",
    },
    {
      id: 2,
      question: "U1 Question 2 in Folder All",
      answer: "Answer 2",
    },
    {
      id: 3,
      question: "U1 Question 3 in Folder All",
      answer: "Answer 3",
    },
  ]);

//   jest.spyOn(TriviaApi, "removeFolder").mockResolvedValue({
//     deleted: {
//       folderId: 4,
//       name: "TEST3",
//     },
//   });

//   jest.spyOn(TriviaApi, "moveTrivia").mockResolvedValue({
//     updated: {
//       id: 1,
//       user_id: 1,
//       question: "U1 Question 1",
//       answer: "Answer 1",
//       folderId: 2,
//     },
//   });

//   jest.spyOn(TriviaApi, "removeTrivia").mockResolvedValue({
//     deleted: {
//       triviaId: 3,
//     },
//   });


};

const commonAfterAll = async () => jest.restoreAllMocks();

module.exports = {
  commonBeforeEach,
  commonAfterAll,
};
