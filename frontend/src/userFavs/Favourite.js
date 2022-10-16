import { useState, useEffect, useContext } from "react";
import TriviaApi from "../api/api";

import UserContext from "../common/UserContext";
import FavTable from "./FavTable";

import CreateFolderForm from "./CreateFolderForm";
import EditFolderForm from "./EditFolderForm";

import { Collapse } from "reactstrap";

import Noty from "noty";

const Favourite = () => {
  const { currUser } = useContext(UserContext);

  const [userFolders, setUserFolders] = useState([]);
  const [folder, setFolder] = useState({});
  const [fav, setFav] = useState([]);

  const [createFormIsOpen, setCreateFormIsOpen] = useState(false);
  const createFormToggle = () => setCreateFormIsOpen(!createFormIsOpen);

  const [editFormIsOpen, setEditFormIsOpen] = useState(false);
  const [folderIdToRename, setFolderIdToRename] = useState(0);
  const editFormToggle = () => setEditFormIsOpen(!editFormIsOpen);

  const [folderIdToDelete, setFolderIdToDelete] = useState(0);

  // load selected folder's trivia and display on page
  const getFolder = (evt) => {

    TriviaApi.getFolderTrivia(
      currUser.username,
      evt.target.parentElement.id
    ).then((f) => {

      setFolder((folder) => ({
        ...folder,
        id: f.folderId,
        name: f.folderName,
      }));

      setFav(f.trivia);
    });
  };

  // toggle edit form to show, get folder id for folder to be renamed
  const renameFolder = (evt) => {
    editFormToggle();

    setFolderIdToRename(+evt.target.closest("div").id);
  };

  // delete a folder
  const removeFolder = (evt) => {
    
    try {
      let folderId = folderIdToDelete;

      TriviaApi.removeFolder(currUser.username, folderId).then((res) => {
        if (res.deleted) {
          new Noty({
            type: "success",
            layout: "topRight",
            theme: "bootstrap-v4",
            text: "This folder is successfully deleted.",
            timeout: "3000",
            progressBar: true,
            closeWith: ["click"],
            killer: true,
          }).show();

          setUserFolders((userFolders) =>
            userFolders.filter((f) => f.folderId !== folderId)
          );

          if (folderId === folder.id) {
            setFolder({});
            setFav([]);
          }
        }
      });
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

  // delete a trivia from a folder
  const removeTrivia = (evt) => {

    try {
      let triviaId = +evt.target.closest("tr").id;

      TriviaApi.removeTrivia(currUser.username, triviaId).then((res) => {

        if (res.deleted) {

          new Noty({
            type: "success",
            layout: "topRight",
            theme: "bootstrap-v4",
            text: "This trivia is successfully deleted.",
            timeout: "3000",
            progressBar: true,
            closeWith: ["click"],
            killer: true,
          }).show();

          setFav((fav) => fav.filter((entry) => entry.id !== triviaId));
        }
      });
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

  // move trivia to another folder
  const moveTrivia = (evt) => {

    try {
      let triviaId = +evt.target.closest("tr").id;
      let folderName = evt.target.innerText;

      TriviaApi.moveTrivia(currUser.username, triviaId, {
        userId: currUser.id,
        folderName,
      }).then((res) => {

        if (res.updated) {

          new Noty({
            type: "success",
            layout: "topRight",
            theme: "bootstrap-v4",
            text: `This trivia is successfully moved to folder ${folderName}`,
            timeout: "3000",
            progressBar: true,
            closeWith: ["click"],
            killer: true,
          }).show();

          setFav((fav) => fav.filter((entry) => entry.id !== triviaId));
        }
      });
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

  // get all user's folders
  useEffect(() => {
    TriviaApi.getAllFolders(currUser.username).then((folders) => {
      setUserFolders(folders);
    });
  }, []);

  return (
    <div className="col-10 offset-1 col-lg-8 offset-lg-2 col-xxl-6 offset-xxl-3 col-xxxl-4 offset-xxxl-4">

      <h3 className="mb-5">
        <i className="fa-solid fa-heart me-2"></i>
        My Favourites
      </h3>

      <h3 className="mb-4">
        Folders
        <span className="ms-2 pointer-cursor" onClick={createFormToggle}>
          <i className="fa-solid fa-folder-plus"></i>
        </span>
      </h3>

      {/* create form for creating a folder */}
      <Collapse isOpen={createFormIsOpen}>
        <CreateFolderForm
          setUserFolders={setUserFolders}
          setCreateFormIsOpen={setCreateFormIsOpen}
        />
      </Collapse>

      <div className="row row-cols-3 mb-4">
        {userFolders.map((f) => (
          <div className="col mb-3 d-flex align-items-stretch" key={f.folderId}>
            <div className="card w-100">
              <div className="card-body" id={f.folderId}>
                <span className="card-text pointer-cursor" onClick={getFolder}>
                  {f.name}
                </span>
                {f.name !== "All" && (
                  <>
                    <span
                      className="ms-2 float-end pointer-cursor"
                      data-bs-toggle="modal"
                      data-bs-target="#deleteModal"
                      onClick={(evt) =>
                        setFolderIdToDelete(+evt.target.closest("div").id)
                      }
                    >
                      <i className="fa-sharp fa-solid fa-trash"></i>
                    </span>
                    <span
                      className="float-end pointer-cursor"
                      onClick={renameFolder}
                    >
                      <i className="fas fa-pen-alt"></i>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* modal for deleting a folder */}
      <div
        className="modal fade"
        id="deleteModal"
        tabIndex="-1"
        aria-labelledby="deleteModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteModalLabel">
                Deleting Folder
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Are you sure that you want to delete this folder? Any trivia
              stored in this folder will also be deleted as well.
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={removeFolder}
                data-bs-dismiss="modal"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* edit form for renaming a folder */}
      <Collapse isOpen={editFormIsOpen}>
        {userFolders.length > 0 && folderIdToRename && (
          <EditFolderForm
            folderId={folderIdToRename}
            folderName={
              userFolders.filter((f) => f.folderId === folderIdToRename)[0]
                ?.name ?? ""
            }
            setUserFolders={setUserFolders}
            setEditFormIsOpen={setEditFormIsOpen}
          />
        )}
      </Collapse>

      <div className="row">
        <div className="col-12">
          <FavTable
            userFolders={userFolders.filter((f) => f.folderId !== folder.id)}
            folder={folder}
            entries={fav}
            removeTrivia={removeTrivia}
            moveTrivia={moveTrivia}
          />
        </div>
      </div>
    </div>
  );
};

export default Favourite;
