import { useState, useEffect, useContext } from "react";
import TriviaApi from "../api/api";
import UserContext from "../common/UserContext";
import LoadingSpinner from "../common/LoadingSpinner";

const QuizResults = ({
  category,
  difficulty,
  hiScore,
  leaderboardScore,
  totalScore,
  totalTime,
  totalTimeBonus,
  maxCombo,
  points,
  reset,
  sessionId,
}) => {
  const { currUser, setCurrUser } = useContext(UserContext);
  const [infoLoaded, setInfoLoaded] = useState(false);

  const [msg, setMsg] = useState(""); // score message
  const [msg2, setMsg2] = useState(""); // level up message
  const [msg3, setMsg3] = useState(""); // badge message
  const [badges, setBadges] = useState([]);

  // check user's points against personal best score and leaderboard score
  // display messages based on user's results
  const checkScore = async (newPlayedCounts) => {

    try {
      // check user's points against personal best score
      // if greater, updates personal best score
      if (hiScore && points < hiScore.points) {
        if (hiScore.points - points <= 30) {
          setMsg(
            `So close! You are ${
              hiScore.points - points
            } points away from your personal best record`
          );
        } else {
          setMsg("");
        }
      } else if (!hiScore || points >= hiScore.points) {
        let res = await TriviaApi.updateScore(currUser.username, {
          userId: currUser.id,
          category,
          difficulty,
          score: totalScore,
          points,
        });

        if (res.updated) {
          // console.debug("Successfully updated user's personal best");
          setMsg("Great job! You have made a new personal best record");
        }
      }

      // check user's points against leaderboard score
      // if playCounts > 3, do not update leaderboard score even if user's points are greater
      // if playCount < 3 and user's points > leaderboard score, update leaderboard score and award trophy badge
      if (
        (leaderboardScore && points < leaderboardScore.points) ||
        newPlayedCounts > 3
      ) {
        setMsg((msg) => {
          if (msg) {
            return msg + "!";
          }
        });
      } else if (
        (!leaderboardScore || points >= leaderboardScore.points) &&
        points > 80 &&
        newPlayedCounts <= 3
      ) {
        let res = await TriviaApi.updateLeaderboardScore({
          userId: currUser.id,
          category,
          difficulty,
          score: totalScore,
          points,
        });

        if (res.updated) {
          // console.debug("Successfully updated the leaderboard record");

          setMsg((msg) => msg + " and a new leaderboard record!");

          let badgeRes = await TriviaApi.postBadge(currUser.username, {
            userId: currUser.id,
            badge: "Trophy",
          });

          if (badgeRes.added) {
            setMsg3(
              `You have earned the gold trophy badge for breaking the previous leaderboard record! `
            );
            setBadges((badge) => [...badge, "trophy"]);
            // console.debug("Successfully added the leaderboard badge");
          } else {
            setMsg3(`Wow!! Congrats on making another leaderboard record! `);
          }
        }
      } else if (!leaderboardScore && points <= 80) {
        setMsg(
          (msg) =>
            msg +
            ". You need to pass and get over 80 points in order to make a leaderboard record."
        );
      }
    } catch (e) {
      console.error(e);

    }
    
  };

  // update playcounts in that category and difficulty for each play
  const updatePlayedCounts = async () => {

    try {
      let res = await TriviaApi.updatePlayedCounts(currUser.username, {
        userId: currUser.id,
        category,
        difficulty,
      });

      if (res.updated) {
        // console.debug(
        //   "Successfully updated user's played counts for this category and difficulty"
        // );

        return res.updated.played;
      }
    } catch (e) {
      console.error(e);

    }
  };

  // check user's stats with points obtained from this session
  // if leveled up, award level badge
  const checkUserStats = async () => {
    try {
      let res = await TriviaApi.getStats(currUser.username);

      if (points > currUser.stats.remainingPts) {
        setMsg2(
          `Yay! You have leveled up and became Level ${res.level} ${res.title}.`
        );

        let badgeRes = await TriviaApi.postBadge(currUser.username, {
          userId: currUser.id,
          badge: res.title,
        });

        if (badgeRes.added) {
          // console.debug("Successfully added the level badge", res.title);
          setBadges((badge) => [...badge, res.title.toLowerCase()]);
          setMsg3((msg) => {
            if (msg) {
              return (
                msg +
                `Also, your have earned the level badge ${res.title}! View all your badges under 'My Dashboard'.`
              );
            } else {
              return `You have earned the level badge ${res.title}! View all your badges under 'My Dashboard'.`;
            }
          });
        }
      }

      setCurrUser((currUser) => ({
        ...currUser,
        stats: res,
      }));

    } catch (e) {
      console.error(e);

    }
    
  };

  // add user's played session (also update user's point on the backend)
  // if successful, update stats, playCounts and check scores if required to update
  const addSession = async () => {
    try {
      let res = await TriviaApi.addSession(currUser.username, {
        sessionId,
        userId: currUser.id,
        category,
        difficulty,
        score: totalScore,
        points,
      });

      if (res.added) {
        // console.debug("Successfully added this played session to user's account");

        let newPlayedCounts = await updatePlayedCounts();
        await checkScore(newPlayedCounts);
        await checkUserStats();
      }
    } catch (e) {
      console.error(e);

    }
    
  };

  // send session results if session is valid for registered users
  const sendResults = async () => {
    if (currUser) {
        await addSession();
    } else {
      setMsg(
        "Thanks for playing, guest. You can save your score by signing up!"
      );
    }

    setInfoLoaded(true);
  };

  useEffect(() => {
      sendResults();

  }, []);

  if (!infoLoaded) return <LoadingSpinner />;

  return (
    <>
      <h3>This Session's Results</h3>
      <hr></hr>

      <div className="row mb-3">
        <div className="col-4 fw-bold">Base Score:</div>
        <div className="col-8">{totalScore} / 10</div>
      </div>

      <div className="row mb-3">
        <div className="col-4 fw-bold">Total Time Used:</div>
        <div className="col-8">{totalTime} seconds</div>
      </div>

      <div className="row mb-5">
        <div className="col-4 fw-bold">Maximum Combo:</div>
        <div className="col-8">{maxCombo}</div>
      </div>

      <div className="row mb-3">
        <div className="col-4 fw-bold">Base Score Points:</div>
        <div className="col-8">{totalScore * 10} points</div>
      </div>

      <div className="row mb-3">
        <div className="col-4 fw-bold">Time Bonus:</div>
        <div className="col-8">{totalTimeBonus} points</div>
      </div>

      <div className="row mb-5">
        <div className="col-4 fw-bold">Combo Bonus:</div>
        <div className="col-8">{maxCombo * 4} points</div>
      </div>

      <div className="row mb-5">
        <div className="col-4 fw-bold">Total Earned Points:</div>
        <div className="col-8 fw-bold">{points} points</div>
      </div>

      <hr />

      <p>{msg}</p>

      {msg2 && (
        <p>
          {msg2}
          <i className="fa-solid fa-champagne-glasses ms-2"></i>
        </p>
      )}

      {msg3 && (
        <div className="mb-3">
          <p>{msg3}</p>
          {badges.length > 0 &&
            badges.map((badge) => (
              <img
                key={badge}
                src={`/badges/${badge}.gif`}
                alt={badge}
                className="me-2"
              />
            ))}
        </div>
      )}

      <button className="btn btn-secondary me-3" onClick={reset}>
        Try Again
      </button>
    </>
  );
};

export default QuizResults;
