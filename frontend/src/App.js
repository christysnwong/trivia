import "./App.css";

import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Routes from "./routes/Routes";
import NaviBar from "./routes/NaviBar";
import TriviaApi from "./api/api";
import UserContext from "./common/UserContext";
import useLocalStorage from "./common/useLocalStorage";


import "./custom_bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle";

import Noty from "noty";

function App() {
  // const [infoLoaded, setInfoLoaded] = useState(false);
  const [currUser, setCurrUser] = useLocalStorage("trivia-user");
  const [token, setToken] = useLocalStorage("trivia-token");
  const history = useHistory();

  // Get token For API from local storage if exists
  TriviaApi.getLocalStorageToken();

  // Log in a user and sets user's info
  const login = async (userData) => {
    try {
      let { user, token } = await TriviaApi.login(userData);
      let stats = await TriviaApi.getStats(user.username);

      user.stats = stats;

      setCurrUser(user);
      setToken(token);
      TriviaApi.token = token;

      history.push("/");
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

  // Log out a user by clearing user's info and token
  const logout = () => {
    setCurrUser(null);
    setToken(null);
  };

  // Sign up a user
  const signup = async (newUserData) => {
    try {
      let { user, token } = await TriviaApi.signup(newUserData);
      let stats = await TriviaApi.getStats(user.username);
      user.stats = stats;

      setCurrUser(user);
      setToken(token);
      TriviaApi.token = token;
      history.push("/");
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

  // if there is a user or token, set token in  TriviaApi
  // resets Trivia token when user or token changes
  useEffect(() => {
    if (currUser & token) {
      TriviaApi.token = token;
    }
  }, [currUser, token]);

  return (
    <UserContext.Provider value={{ currUser, setCurrUser, setToken }}>
      <div className="App">
        <NaviBar logout={logout} />
        <Routes login={login} signup={signup} />
      </div>
    </UserContext.Provider>
  );
}

export default App;
