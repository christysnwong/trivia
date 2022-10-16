import { useContext, useEffect, useState } from "react";
import UserContext from "../common/UserContext";
import JoblyApi from "../api/api";

import Noty from "noty";

const EditFolderForm = ({
  folderId,
  folderName,
  setUserFolders,
  setEditFormIsOpen,
}) => {
  const { currUser } = useContext(UserContext);

  const [formData, setFormData] = useState({
    userId: currUser.id,
    newFolderName: folderName,
  });

  // handle changes in the form
  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((formData) => ({
      ...formData,
      [name]: value,
    }));
  };

  // handle form submission and reset form
  const handleSubmit = async (evt) => {
    evt.preventDefault();

    try {
      let res = await JoblyApi.renameFolder(
        currUser.username,
        folderId,
        formData
      );

      if (res.updated) {
        
        new Noty({
          type: "success",
          layout: "topRight",
          theme: "bootstrap-v4",
          text: `Your folder is successfully renamed from ${folderName} to ${res.updated.name}.`,
          timeout: "3000",
          progressBar: true,
          closeWith: ["click"],
          killer: true,
        }).show();

        setUserFolders((folders) => [
          ...folders.filter(
            (folder) => folder.folderId !== res.updated.folderId
          ),
          { folderId: res.updated.folderId, name: res.updated.name },
        ]);

        setEditFormIsOpen(false);
      }

      setFormData({ userId: currUser.id, newFolderName: "" });
      
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

  // load info for existing folder in form when folder id / name changes
  useEffect(() => {
    setFormData((formData) => ({ ...formData, newFolderName: folderName }));
  }, [folderId, folderName]);

  return (
    <>
      <div className="card mb-5">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label htmlFor="username" className="form-label">
                Edit a Folder name:{" "}
              </label>

              <input
                id="newFolderName"
                name="newFolderName"
                className="form-control"
                value={formData.newFolderName}
                onChange={handleChange}
                maxLength="20"
              />
            </div>

            <button
              type="button"
              className="btn btn-secondary mt-4 me-3"
              onClick={() => setEditFormIsOpen(false)}
              method="get"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary mt-4"
              method="post"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditFolderForm;
