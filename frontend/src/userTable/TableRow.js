import { useEffect, useState, useContext } from "react";
import UserContext from "../common/UserContext";

const TableRow = ({ id, entry, leaderboard }) => {
  const [isUser, setIsUser] = useState(false);
  const { currUser } = useContext(UserContext);

  // check if user on record is the same as logged in user
  useEffect(() => {
    if (currUser) {
      if (entry.username === currUser.username) {
        setIsUser(true);
      }
    }
  }, [entry, currUser]);

  return (
    <tr>
      <th scope="row">
        {id + 1}
        {leaderboard && isUser && <i className="fa-solid fa-star me-2"></i>}
      </th>

      {/* check to see if the table is used for leaderboard and if the record belongs to user, set red font */}
      {(!leaderboard || !isUser) &&
        Object.values(entry).map((field, idx) => (
          <td key={idx} className="text-capitalize">
            {field}
          </td>
        ))}

      {leaderboard &&
        isUser &&
        Object.values(entry).map((field, idx) => (
          <td key={idx} className="text-capitalize text-danger fw-bold">
            {field}
          </td>
        ))}
    </tr>
  );
};

export default TableRow;
