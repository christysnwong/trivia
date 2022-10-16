import { useContext, useState } from "react";
import UserContext from "../common/UserContext";
import JoblyApi from "../api/api";

import Noty from 'noty';

const CreateFolderForm = ({
  setUserFolders,
  setCreateFormIsOpen,
}) => {
  const { currUser } = useContext(UserContext);

  const [formData, setFormData] = useState({ folderName: "" });

  // handle changes in the form
  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((formData) => ({
      ...formData,
      userId: currUser.id,
      [name]: value,
    }));
  };

  // handle form submission and reset form
  const handleSubmit = async (evt) => {
    evt.preventDefault();

    try {
      let res = await JoblyApi.createFolder(currUser.username, formData);

      if (res.created) {

        new Noty({
          type: "success",
          layout: "topRight",
          theme: "bootstrap-v4",
          text: `Your folder ${formData.folderName} is successfully created`,
          timeout: "3000",
          progressBar: true,
          closeWith: ["click"],
          killer: true,
        }).show();


        setUserFolders((folder) => [
          ...folder,
          { folderId: res.created.folderId, name: res.created.name },
        ]);
        setCreateFormIsOpen(false);
      }

      setFormData({ folderName: "" });
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

  return (
    <>
      <div className="card mb-5">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label htmlFor="username" className="form-label">
                Create a Folder:{" "}
              </label>

              <input
                id="folderName"
                name="folderName"
                className="form-control"
                value={formData.folderName}
                onChange={handleChange}
                placeholder="New Folder Name"
                maxLength="20"
              />
            </div>

            <button
              type="button"
              className="btn btn-secondary mt-4 me-3"
              onClick={() => setCreateFormIsOpen(false)}
              method="get"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary mt-4"
              method="post"
            >
              Create
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateFolderForm;