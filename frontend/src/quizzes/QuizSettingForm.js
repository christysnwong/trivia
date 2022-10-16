import { useState } from "react";

const QuizSettingForm = ({ getQuizzes }) => {
  // set initial values for the quiz form
  const initValues = {
    category: "",
    difficulty: "",
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

    await getQuizzes(formData);
    setFormData(initValues);
  };

  return (
    <div>
      <h3 className="mb-3">Quiz Form</h3>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Choose here
                </option>
                <option value="9">General Knowledge</option>
                <option value="10">Entertainment: Books</option>
                <option value="32">
                  Entertainment: Cartoon and Animations
                </option>
                <option value="11">Entertainment: Film</option>
                <option value="31">
                  Entertainment: Japanese Anime and Manga
                </option>
                <option value="22">Geography</option>
                <option value="23">History</option>
                <option value="17">Science and Nature</option>
                <option value="18">Science: Computers</option>
                <option value="19">Science: Mathematics</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="difficulty" className="form-label">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                className="form-select"
                value={formData.difficulty}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Choose here
                </option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
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

export default QuizSettingForm;
