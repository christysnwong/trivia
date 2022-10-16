import { useEffect, useState, useContext, useRef } from "react";
import UserContext from "../common/UserContext";
import TriviaApi from "../api/api";

import Noty from 'noty';

const QuizQuestions = ({ num, question, next, reset, updateStats }) => {
  const [isAnswered, setIsAnswered] = useState(false);
  const [ansStyle, setAnsStyle] = useState({});
  const [secs, setSecs] = useState(0);
  const timerId = useRef();

  const { currUser } = useContext(UserContext);

  // stop timer
  const stopTimer = () => {
    clearInterval(timerId.current);
  };

  // calculate time bonus, increment score and combo if answering correctly
  // update stats total in parent component
  const calStats = (correct) => {
    let timeBonus = 0;
    let combo = 0;
    let score = 0;

    if (correct) {
      timeBonus = Math.min(Math.floor(Math.max((16 - secs) / 8, 0) * 6), 6);
      score++;
      combo++;
    }

    updateStats(secs, timeBonus, score, combo);
  };

  // stop timer and displays results by setting button styles - red / green
  // call calStats if answering corectly
  const checkAns = (evt) => {
    if (!isAnswered) {
      stopTimer();
      setIsAnswered(true);

      let correct = false;

      if (evt.target.id === question.correct_answer) {
        correct = true;
        setAnsStyle((old) => {
          return {
            ...old,
            [evt.target.id]: "btn-success",
          };
        });
      } else {
        setAnsStyle((old) => {
          return {
            ...old,
            [evt.target.id]: "btn-danger",
            [question.correct_answer]: "btn-success",
          };
        });
      }

      calStats(correct);
    }
  };

  // set answering status, resets timer and moves on to next question
  const nextQ = () => {
    setIsAnswered(false);
    setSecs(0);

    next();
  };

  // add trivia question to user's favourites
  const addToFav = async () => {

    try {
      let resp = await TriviaApi.addToFav(currUser.username, {
        userId: currUser.id,
        question: question.question,
        answer: question.correct_answer,
        folderName: "All",
      });

      if (resp.added) {

        new Noty({
          type: "success",
          layout: "topRight",
          theme: "bootstrap-v4",
          text: `You have successfully added this to your favourite. 
              You can revisit this in folder 'All' under 'My Favourites'.`,
          timeout: "3000",
          progressBar: true,
          closeWith: ["click"],
          killer: true,
        }).show();
      } 

    } catch (e) {
      console.error(e);

      new Noty({
        type: "warning",
        layout: "topRight",
        theme: "bootstrap-v4",
        text: `This has already been added to your favourite'.`,
        timeout: "3000",
        progressBar: true,
        closeWith: ["click"],
        killer: true,
      }).show();
    }
     
  };

  // create an object to map button styles 
  // reload when answering status and quiz data change
  useEffect(() => {

    const genMap = (answers) => {
      const result = {};
      answers.forEach((ans) => {
        result[ans] = "btn-outline-secondary";
      });

      return result;
    };

    const classMap = genMap(question.answers);

    if (!isAnswered) setAnsStyle(classMap);

  }, [isAnswered, question.answers]);

  // clean up and runs timer when quiz data changes
  useEffect(() => {
    timerId.current = setInterval(() => {
      setSecs((secs) => secs + 1);
    }, 1000);

    return () => {
      clearInterval(timerId.current);
    };
  }, [question.answers]);

  return (
    <>
      
      <p>Time Duration: {secs} secs</p>
      <hr />
      <h5 className="mb-4">
        Question {num + 1}:{" "}
        <span dangerouslySetInnerHTML={{ __html: question.question }}></span>
      </h5>

      {question.answers.map((ans, idx) => (
        <p className="btn-ans" key={idx}>
          <button
            id={ans}
            className={`btn ${ansStyle[ans]}`}
            onClick={checkAns}
            dangerouslySetInnerHTML={{ __html: ans }}
          ></button>
        </p>
      ))}

      <hr />
      <div>
        <button className="btn btn-secondary me-3" onClick={reset}>
          Reset
        </button>

        {isAnswered && currUser && (
          <button className="btn btn-warning me-3" onClick={addToFav}>
            Add to Favourite
          </button>
        )}

        {isAnswered && (
          <button className="btn btn-primary me-3" onClick={nextQ}>
            Next
          </button>
        )}
      </div>
    </>
  );
};

export default QuizQuestions;
