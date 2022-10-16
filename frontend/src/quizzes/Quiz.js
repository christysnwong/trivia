import { useState, useEffect, useContext } from "react";
import TriviaApi from "../api/api";
import QuizSettingForm from "./QuizSettingForm";
import QuizQuestions from "./QuizQuestions";
import QuizResults from "./QuizResults";

import UserContext from "../common/UserContext";
import LoadingSpinner from "../common/LoadingSpinner";
import { v4 as uuidv4 } from "uuid";

import Noty from "noty";

const Quiz = () => {
  const { currUser } = useContext(UserContext);
  const [infoLoaded, setInfoLoaded] = useState(true);

  // initialize parameters to track quiz session's progress & results
  const [quizData, setQuizData] = useState([]);
  const [onQuestion, setOnQuestion] = useState(0);
  const [completed, setCompleted] = useState(false);

  const [totalScore, setTotalScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [totalTimeBonus, setTotalTimeBonus] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [points, setPoints] = useState(0);

  // load user's personal best & leaderboard score
  const [hiScore, setHiScore] = useState(0);
  const [leaderboardScore, setLeaderboardScore] = useState(0);

  // generate sessionId to avoid session's result being sent multiple times
  const [sessionId, setSessionId] = useState(uuidv4());


  // get quiz questions based on user's category and difficulty
  const getQuizzes = async (quizSetting) => {
    try {
      setInfoLoaded(false);

      let res = await TriviaApi.getQuizzes(quizSetting);
      setQuizData(res);
      
    } catch (e) {
      console.error(e);
      
      new Noty({
        type: "error",
        layout: "topRight",
        theme: "bootstrap-v4",
        text: e,
        timeout: "3000",
        progressBar: true,
        closeWith: ["click"],
        killer: true,
      }).show();
      
    }
  };

  // reset all session parameters
  const reset = () => {
    setQuizData([]);
    setOnQuestion(0);
    setCompleted(false);

    setTotalScore(0);
    setTotalTime(0);
    setTotalTimeBonus(0);
    setCombo(0);
    setMaxCombo(0);
    setPoints(0);

    setHiScore(0);
    setLeaderboardScore(0);

    setSessionId(uuidv4());
  };

  // update session's parameters for each question answered
  // track time, time bonus and combo
  const updateStats = (time, timeBonus, score, currCombo) => {
    setTotalScore((oldTotalScore) => oldTotalScore + score);
    setTotalTime((oldTime) => oldTime + time);
    setTotalTimeBonus((oldTotalTimeBonus) => oldTotalTimeBonus + timeBonus);

    if (currCombo && combo >= maxCombo) {
      setCombo((oldCombo) => oldCombo + 1);
      setMaxCombo((oldMaxCombo) => oldMaxCombo + 1);
    } else if (currCombo) {
      setCombo((oldCombo) => oldCombo + 1);
    } else {
      setCombo(0);
    }
  };

  // load the next question until it reaches the end of the quiz session
  const next = () => {
    setOnQuestion((onQuestion) => onQuestion + 1);

    if (onQuestion >= 9) {
      setPoints(totalScore * 10 + totalTimeBonus + maxCombo * 4);
      setCompleted(true);
    }
  };

  // load personal best and leaderboard score at the beginning
  useEffect(() => {
    if (quizData.length) {
      TriviaApi.getLeaderboardScores({
        category: quizData[0].category,
        difficulty: quizData[0].difficulty,
      }).then((score) => {
        setLeaderboardScore(score[0]);
      });
    }

    if (currUser && quizData.length) {
      TriviaApi.getScores(currUser.username, {
        category: quizData[0].category,
        difficulty: quizData[0].difficulty,
      }).then((score) => {
        setHiScore(score[0]);
      });
    }

    // alert users if quiz data cannot be fetched
    if (quizData === "NA") {

      new Noty({
        type: "error",
        layout: "topRight",
        theme: "bootstrap-v4",
        text: `Sorry this category and difficulty are not available.`,
        timeout: "3000",
        progressBar: true,
        closeWith: ["click"],
        killer: true,
      }).show();

    }

    setInfoLoaded(true);
  }, [currUser, quizData]);

  if (!infoLoaded) return <LoadingSpinner />

  return (
    <div className="col-10 offset-1 col-lg-8 offset-lg-2 col-xxl-6 offset-xxl-3 col-xxxl-4 offset-xxxl-4">

      <h3 className="mb-5">
        <i className="fa-solid fa-icons me-2"></i>
        Trivia Quiz
      </h3>
      {(!quizData.length || quizData === "NA") && (
        <QuizSettingForm getQuizzes={getQuizzes} />
      )}

      {!!quizData.length && quizData !== "NA" && (
        <>
          <h3 className="text-capitalize">
            {quizData[0].category} - {quizData[0].difficulty}
          </h3>
          <p className="mb-3">
            {!!hiScore && <span> Personal Best: {hiScore.points} points</span>}
            {!!leaderboardScore && (
              <span>
                {" "}
                | Leaderboard Score: {leaderboardScore.points} points
              </span>
            )}
          </p>

          <hr />
        </>
      )}

      {!!quizData.length && quizData !== "NA" && onQuestion <= 9 && (
        <>
          <p>
            Score: {totalScore}/10 | Total Time: {totalTime} secs | Max Combo:{" "}
            {maxCombo}
          </p>

          <QuizQuestions
            num={onQuestion}
            question={quizData[onQuestion]}
            next={next}
            reset={reset}
            updateStats={updateStats}
          />
        </>
      )}

      {completed && (
        <QuizResults
          category={quizData[0].category}
          difficulty={quizData[0].difficulty}
          hiScore={hiScore}
          leaderboardScore={leaderboardScore}
          totalScore={totalScore}
          totalTime={totalTime}
          totalTimeBonus={totalTimeBonus}
          maxCombo={Math.max(maxCombo, combo)}
          points={points}
          reset={reset}
          sessionId={sessionId}
          setInfoLoaded={setInfoLoaded}
        />
      )}
    </div>
  );
};

export default Quiz;
