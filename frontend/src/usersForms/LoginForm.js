import { useState } from "react";

import Noty from 'noty';

const LoginForm = ({ login }) => {
  const initValues = {
    username: "",
    password: "",
  };
  const [formData, setFormData] = useState(initValues);

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
      await login(formData);
      setFormData(initValues);
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
        <i className="fa-solid fa-right-to-bracket me-2"></i>
        Login Form
      </h3>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
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
            <button className="btn btn-primary float-end mt-4" type="submit">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
