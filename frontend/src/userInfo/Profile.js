import { useContext } from "react";
import TriviaApi from "../api/api";
import UserContext from "../common/UserContext";
import { useHistory } from "react-router-dom";

import Noty from "noty";

const Profile = () => {
  const { currUser, setCurrUser, setToken } = useContext(UserContext);

  const history = useHistory();

  // remove user's account
  const removeUser = () => {
    try {
      TriviaApi.removeUser(currUser.username).then((res) => {
        if (res.deleted) {
          setCurrUser(null);
          setToken(null);
          TriviaApi.token = null;

          new Noty({
            type: "success",
            layout: "topRight",
            theme: "bootstrap-v4",
            text: "This account is successfully deleted.",
            timeout: "3000",
            progressBar: true,
            closeWith: ["click"],
            killer: true,
          }).show();

          history.push("/");
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

  return (
    <div className="col-10 offset-1 col-lg-8 offset-lg-2 col-xxl-6 offset-xxl-3 col-xxxl-4 offset-xxxl-4">
      <h3 className="mb-5">
        <i className="fa-solid fa-address-card me-2"></i>
        Profile
      </h3>

      {Object.entries(currUser)
        .filter((entry) => entry[0] !== "id" && entry[0] !== "stats")
        .map((entry, idx) => (
          <div className="row mb-3" key={idx}>
            <div className="col-4 text-capitalize fw-bold">{entry[0]}</div>
            <div className="col-8">{entry[1]}</div>
          </div>
        ))}

      <button
        type="button"
        className="btn btn-success mt-4 me-2"
        onClick={() => history.push("/profile/edit")}
        method="get"
      >
        Edit your info
      </button>

      <button
        type="button"
        className="btn btn-danger mt-4"
        data-bs-toggle="modal"
        data-bs-target="#deleteModal"
      >
        Delete this account
      </button>

      {/* <!-- Modal --> */}
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
                Deleting Account '{currUser.username}'
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Are you sure that you want to delete this account? This action
              cannot be reversed.
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
                onClick={removeUser}
                data-bs-dismiss="modal"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
