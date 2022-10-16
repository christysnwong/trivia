import {
  Button,
  ButtonGroup,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";


const FavTable = ({ userFolders, folder, entries, removeTrivia, moveTrivia }) => {
  return (
    <div>

      {folder.name && (
        <h3 className="mb-4">
          <i className="fa-solid fa-folder-open me-2"></i>
          {folder.name}
        </h3>
      )}
      {!folder.name && (
        <>
          <p>
            You can either create a new folder by clicking on{" "}
            <i className="fa-solid fa-folder-plus"></i> or select a folder above
            to view your favourited trivia.
          </p>
        </>
      )}
      {entries.length === 0 && folder.name && "This folder is empty."}
      {entries.length > 0 && (
        <div>
          <table className="table table-striped table-sm">
            <thead>
              <tr>
                <th scope="col">#</th>
                {!!entries.length &&
                  Object.keys(entries[0])
                    .filter((heading) => heading !== "id")
                    .map((heading, idx) => (
                      <th
                        scope="col"
                        key={idx}
                        className="text-capitalize fw-bold"
                      >
                        {heading}
                      </th>
                    ))}
                <th scope="col" className="text-capitalize fw-bold d-none d-sm-table-cell">
                  Options
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={idx} id={entry.id}>
                  <th scope="row">{idx + 1}</th>

                  {Object.values(entry)
                    .filter((field) => typeof field !== "number")
                    .map((field, idx) => (
                      <td key={idx} className="text-capitalize">
                        <span
                          dangerouslySetInnerHTML={{ __html: field }}
                        ></span>
                      </td>
                    ))}

                  <td className="d-none d-sm-table-cell">
                    <ButtonGroup className="my-0" size="sm">
                      <ButtonGroup size="sm">
                        <UncontrolledDropdown>
                          <DropdownToggle caret size="sm">
                            <i className="fa-solid fa-up-down-left-right"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem header>Move to...</DropdownItem>
                            <DropdownItem divider />
                            {userFolders.map((f) => (
                              <DropdownItem
                                key={f.folderId}
                                id={f.folderId}
                                onClick={moveTrivia}
                              >
                                {f.name}
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </ButtonGroup>
                      <Button onClick={removeTrivia} color="danger">
                        <i className="fa-sharp fa-solid fa-trash"></i>
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FavTable;



