import { useState, useEffect } from "react";
import TriviaApi from "../api/api";

import Table from "../userTable/Table";


const Leaderboard = () => {

    const [gScores, setGScores] = useState([]);

    // fetche leaderboard scores
    useEffect(() => {
      TriviaApi.getLeaderboardScores().then(score => {
          setGScores(score);
      });
    }, []);

    return (
      <div className="col-10 offset-1 col-lg-8 offset-lg-2 col-xxl-6 offset-xxl-3 col-xxxl-4 offset-xxxl-4">

        <h3 className="mb-5">
          <i className="fa-solid fa-globe me-2"></i>
          Leaderboard
        </h3>

        <p className="mb-3">
          The following table shows the top score in each category and
          difficulty. Your score appears in red if you make it to the
          leaderboard (limited to registered users only).
        </p>

        <p className="mb-4">
          Due to the limited number of questions in some categories, each user
          can only have 3 attempts to make a record on the leaderboard.
        </p>

        <Table entries={gScores} leaderboard={true} />
      </div>
    );

}


export default Leaderboard;
