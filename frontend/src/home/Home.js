import { useState, useContext, useEffect } from "react";
import UserContext from "../common/UserContext";
import { useHistory } from "react-router-dom";
import TriviaApi from "../api/api";

import Table from "../userTable/Table";

const Home = () => {
  const { currUser } = useContext(UserContext);
  const [recentBadges, setRecentBadges] = useState([]);
  const [sessions, setSessions] = useState([]);
  const history = useHistory();

  // Get info on user's played session and recent badges
  useEffect(() => {
    if (currUser) {
      TriviaApi.getBadges(currUser.username).then((badges) => {
        setRecentBadges(() => {
          let arr = [];

          for (let i = 0; i < Math.min(badges.length, 2); i++) {
            arr.push(badges[i]);
          }

          return [...arr];
        });
      });

      TriviaApi.getSessions(currUser.username, { limit: 5 }).then(
        (sessions) => {
          setSessions(sessions);
          
        }
      );
    }
  }, [currUser]);

  return (
    <div className="col-10 offset-1 col-lg-8 offset-lg-2 col-xxl-6 offset-xxl-3 col-xxxl-4 offset-xxxl-4">
      <div className="text-center shadow-1-strong rounded mb-2 logo-bg">
        <div className="p-4 w-100 mask-bg">
          {currUser && <h5 className="mb-3">Welcome back to </h5>}
          {!currUser && <h5 className="mb-3">Welcome to </h5>}

          <h1 className="display-4 brand">Trivia Guru</h1>
          <hr className="mb-2" />
          <p className="lead fw-bold">
            Test your knowledge and learn more everyday!
          </p>
        </div>
      </div>

      {/* show visitors info and features of Trivia Guru */}
      {!currUser && (
        <>
          <div className="row mb-5">
            <div className="col-12 text-center">
              <button
                className="btn btn-outline-dark me-4"
                onClick={() => history.push("/login")}
                method="get"
              >
                Login
              </button>
              <button
                className="btn btn-outline-dark me-4"
                onClick={() => history.push("/signup")}
                method="get"
              >
                Sign Up
              </button>
            </div>
          </div>

          <div className="row mb-5">
            <p>
              This website is designed for people who would like to broaden
              their knowledge and have fun with Trivia. While anyone can take
              trivia quizzes from different categories, only registered users
              can enjoy all the features mentioned below.
            </p>
            <p>
              Registration is free! Sign up now to experience the full features
              of Trivia Guru!
            </p>
          </div>

          <div className="row mb-5">
            <h3 className="mb-5">
              <i className="fa-solid fa-square-check me-2"></i>
              Features
            </h3>

            <div className="col-12 col-xl-4 mb-3 d-flex align-items-stretch">
              <div className="card">
                <div className="card-header">Offers 4,000+ trivias!</div>

                <div className="card-body">
                  <p className="card-text">
                    Trivia Guru utilizes resources from Open Trivia DB which
                    offers thousands of trivia questions in over 10 categories!
                    You can select from 3 difficulties - easy, medium and hard.
                    Quiz your knowledge and see how much you know.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-4 mb-3 d-flex align-items-stretch">
              <div className="card">
                <div className="card-header">Tracks your record!</div>

                <div className="card-body">
                  <p className="card-text">
                    By signing up, you gain access to tools that can track your
                    statistics, personal best scores and recent sessions in each
                    category and difficulty. If your score is high enough, you
                    may make it to the leaderboard! Do quizzes to get points,
                    level up and earn badges!
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-4 mb-3 d-flex align-items-stretch">
              <div className="card">
                <div className="card-header">Saves your trivia!</div>

                <div className="card-body">
                  <p className="card-text">
                    As you play trivia quizzes from different categories and
                    difficulties, you can also save the ones you like to your
                    favourites. You can view them from 'My Favourites' and
                    categorize them if you like. Make use of this feature to
                    become a 'Trivia Guru'.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* show registered users their recent activities on Trivia Guru */}
      {currUser && (
        <>
          <div className="row mb-5">
            <div className="col-12">
              <h3 className="mb-3 mt-3">
                <i className="fa-solid fa-id-badge me-2"></i>
                Recent Activities
              </h3>
            </div>

            <div className="col-8">
              <p>
                Hi {currUser.username}! You are currently a{" "}
                <b>
                  Level {currUser.stats.level} {currUser.stats.title}
                </b>
                .
                <br />
                {recentBadges.length > 0 &&
                  `You have recently earned badge 
                ${recentBadges
                  .map((badge) => badge.badgeName.toLowerCase())
                  .join(" and ")}.`}
              </p>

              <p>
                You are {currUser.stats.remainingPts} points away from the next
                level.
              </p>

              <div className="progress">
                <div
                  className="progress-bar bg-warning"
                  role="progressbar"
                  style={{
                    width:
                      ((currUser.stats.levelPts - currUser.stats.remainingPts) /
                        currUser.stats.levelPts) *
                        100 +
                      "%",
                  }}
                  aria-valuenow={currUser.stats.remainingPts}
                  aria-valuemin="0"
                  aria-valuemax={currUser.stats.levelPts}
                ></div>
              </div>
            </div>

            <div className="col-4">
              <div className="mt-2 float-end">
                {recentBadges &&
                  recentBadges.map((badge) => (
                    <img
                      key={badge.badgeName}
                      src={badge.badgeUrl}
                      alt={badge.badgeName}
                      className="me-3"
                    />
                  ))}
              </div>
            </div>
          </div>

          {currUser.stats.level >= 0 && currUser.stats.level <= 3 && (
            <p className="mb-3">
              <i className="fa-solid fa-comment me-2"></i>
              Tip: To get started, click `Quizzes` at the top left to play
              trivia quizzes! Enjoy and have fun!
            </p>
          )}

          {currUser.stats.level >= 0 && currUser.stats.level <= 5 && (
            <p className="mb-3">
              <i className="fa-solid fa-comment me-2"></i>
              Tip: To level up and earn badges, earn points from completing
              trivia quizzes. You can score base points and get more time bonus
              by answering correctly with the least time possible. The more
              questions you can answer in a row, the more combo bonus you can
              get based on your maximum combo.
            </p>
          )}

          {currUser.stats.level > 5 && currUser.stats.level <= 10 && (
            <p className="mb-3">
              <i className="fa-solid fa-comment me-2"></i>
              Tip: Upon leveling up every 5 levels, users will receive their
              level badge and upgrade in their titles until they become a guru!
            </p>
          )}

          {currUser.stats.level >= 0 && currUser.stats.level <= 10 && (
            <p className="mb-3">
              <i className="fa-solid fa-comment me-2"></i>
              Tip: Due to the limited number of questions in some categories,
              each user can only have 3 attempts to make a record on the
              leaderboard. Afterwards, users can still improve their personal
              best scores but can no longer challenge the scores on the
              leaderboard.
            </p>
          )}

          {currUser.stats.level > 30 && currUser.stats.level <= 35 && (
            <p className="mb-3 fw-bold">
              <i className="fa-solid fa-comment me-2"></i>
              Tip: Great job! You have come a long way to become a Trivia Guru.
              Wondering what comes next? User can also aim for the ultimate
              title 'King' by reaching level 35.
            </p>
          )}

          {sessions.length > 0 && (
            <div className="row mb-3">
              <p className="mb-4 mt-4">
                The following table shows up to 5 of your most recent played
                sessions. The date and time displayed below are in UTC time
                zone.
                <br />
                For more details, go to 'Recent Played Sessions' under 'My
                Dashboard'.
              </p>

              <Table entries={sessions} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
