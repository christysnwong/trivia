import { useState, useEffect, useContext } from "react";
import TriviaApi from "../api/api";
import UserContext from "../common/UserContext";

const Stats = () => {
  const [stats, setStats] = useState({});
  const [badges, setBadges] = useState([]);
  const { currUser } = useContext(UserContext);

  // get user's stats and badges
  useEffect(() => {
    TriviaApi.getStats(currUser.username).then((stats) => {
      setStats(stats);
    });

    TriviaApi.getBadges(currUser.username).then((badges) => {
      setBadges(badges);
    });
  }, [currUser]);


    
  return (
    <div className="col-10 offset-1 col-lg-8 offset-lg-2 col-xxl-6 offset-xxl-3 col-xxxl-4 offset-xxxl-4">
      <h3 className="mb-5">
        <i className="fa-solid fa-id-badge me-2"></i>
        Statistics
      </h3>

      {Object.entries(stats)
        .filter(
          (entry) => entry[0] !== "remainingPts" && entry[0] !== "levelPts"
        )
        .map((entry, idx) => (
          <div className="row mb-3" key={idx}>
            <div className="col-4 text-capitalize fw-bold">{entry[0]}:</div>
            <div className="col-8">{entry[1]}</div>
          </div>
        ))}

      <div className="row mb-3">
        <div className="col-4">
          <b>Remaining Points to Next Level:</b>
        </div>
        <div className="col-8">{stats.remainingPts}</div>
      </div>

      <div className="row mb-5">
        <div className="col-4 fw-bold">Progress:</div>
        <div className="col-6">
          <div className="progress">
            <div
              className="progress-bar bg-warning"
              role="progressbar"
              style={{
                width:
                  ((stats.levelPts - stats.remainingPts) / stats.levelPts) *
                    100 +
                  "%",
              }}
              aria-valuenow={stats.remainingPts}
              aria-valuemin="0"
              aria-valuemax={stats.levelPts}
            ></div>
          </div>
        </div>
      </div>

      <h3 className="mb-5">
        <i className="fa-solid fa-award me-2"></i>
        Badges
      </h3>

      {!badges.length &&
        "You currently have no badges. Try to get one by doing trivia quizzes!"}

      {badges.length > 0 && (
        <div className="row mb-3">
          <div className="col-12">
            {badges.map((badge) => (
              <img
                key={badge.badgeName}
                src={badge.badgeUrl}
                alt={badge.badgeName}
                className="me-3"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;
