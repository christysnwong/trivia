import { useState, useEffect, useContext } from "react";
import TriviaApi from "../api/api";
import UserContext from "../common/UserContext";

import Table from "../userTable/Table";

const PersonalBest = () => {
  const [scores, setScores] = useState([]);
  const { currUser } = useContext(UserContext);

  // fetch personal best scores
  useEffect(() => {
    TriviaApi.getScores(currUser.username).then((score) => {
      setScores(score);
    });

  }, [currUser.username]);

  return (
    <div className="col-10 offset-1 col-lg-8 offset-lg-2 col-xxl-6 offset-xxl-3 col-xxxl-4 offset-xxxl-4">

      <h3 className="mb-5">
        <i className="fa-solid fa-trophy me-2"></i>
        Personal Best Scores
      </h3>

      {!scores.length &&
        "There is no score data in this section. Try out a trivia quiz!"}

      {scores.length > 0 && (
        <>
          <p className="mb-4">
            The following table shows your top score in each category and
            difficulty.
          </p>

          <Table entries={scores} />
        </>
      )}
    </div>
  );
};

export default PersonalBest;
