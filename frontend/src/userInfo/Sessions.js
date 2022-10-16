import { useState, useEffect, useContext } from "react";
import TriviaApi from "../api/api";
import UserContext from "../common/UserContext";

import Table from "../userTable/Table";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const { currUser } = useContext(UserContext);

  // get played session history
  useEffect(() => {
    TriviaApi.getSessions(currUser.username).then((sessions) => {
      setSessions(sessions);
    });
  }, []);

  return (
    <div className="col-10 offset-1 col-lg-8 offset-lg-2 col-xxl-6 offset-xxl-3 col-xxxl-4 offset-xxxl-4">
      <h3 className="mb-5">
        <i className="fa-solid fa-clipboard me-2"></i>
        Recent Played Sessions
      </h3>

      {!sessions.length &&
        "There is no session data in this section. Try out a trivia quiz!"}

      {sessions.length > 0 && (
        <>
          <p className="mb-4">
            The following table shows your recent played sessions.
          </p>

          <Table entries={sessions} />
        </>
      )}
    </div>
  );
};

export default Sessions;

//
