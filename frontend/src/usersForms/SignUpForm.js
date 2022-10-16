import { useState } from "react";

const SignUpForm = ({ signup }) => {
  const initValues = {
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
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
    await signup(formData);
    setFormData(initValues);
  };

  return (
    <div className="col-10 offset-1 col-lg-8 offset-lg-2 col-xxl-6 offset-xxl-3 col-xxxl-4 offset-xxxl-4">
      <h2 className="mb-5">
        <i className="fa-solid fa-user-plus me-2"></i>
        Signup Form
      </h2>
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
            <div className="mb-3">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
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
                type="text"
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
                type="text"
                name="email"
                className="form-control"
                value={formData.email}
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

export default SignUpForm;
