import { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import UserContext from "../common/UserContext";
import JoblyApi from "../api/api";

import Noty from "noty";

const ProfileEditForm = () => {
  const { currUser, setCurrUser } = useContext(UserContext);

  const history = useHistory();

  const [formData, setFormData] = useState({
    firstName: currUser.firstName,
    lastName: currUser.lastName,
    email: currUser.email,
    password: "",
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
      let token = await JoblyApi.login({
        username: currUser.username,
        password: formData.password,
      });

      if (token) {
        await JoblyApi.patchUser(currUser.username, formData);
        // console.debug("ProfileEditForm - patch user", user);

        setCurrUser((currUserData) => ({
          ...currUserData,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        }));

        new Noty({
          type: "success",
          layout: "topRight",
          theme: "bootstrap-v4",
          text: "Your info is successfully updated.",
          timeout: "3000",
          progressBar: true,
          closeWith: ["click"],
          killer: true,
        }).show();

        history.push("/profile");

      }
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
        <i className="fas fa-pen-alt me-2"></i>
        Edit Profile
      </h3>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username:{" "}
              </label>
              <p className="form-control-plaintext">{currUser.username}</p>
            </div>

            <div className="mb-3">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                className="form-control"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                className="form-control"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Confirm password to make changes
              </label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              className="btn btn-secondary mt-4 me-4"
              onClick={() => history.push("/profile")}
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
    </div>
  );
};

export default ProfileEditForm;
