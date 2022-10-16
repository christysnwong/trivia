import TableHeading from "./TableHeading";
import TableRow from "./TableRow";


const Table = ({entries, leaderboard}) => {

  return (
    <div className="table-responsive">
      <table className="table table-striped table-sm">
        <thead>
          <tr>
            <th scope="col">#</th>
            {!!entries.length &&
              Object.keys(entries[0]).map((heading, idx) => (
                <TableHeading key={idx} heading={heading} />
              ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <TableRow
              key={idx}
              id={idx}
              entry={entry}
              leaderboard={leaderboard}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;


